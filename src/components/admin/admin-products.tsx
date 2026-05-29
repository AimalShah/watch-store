import { useState, useMemo } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type SortingState,
  createColumnHelper,
} from '@tanstack/react-table';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { AdminSidebar } from './sidebar';
import { makeQueryClient } from '@/lib/query-client';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  featured: boolean;
  images: string[];
  created_at: string;
  categories: { name: string; slug: string } | null;
}

interface DeleteTarget {
  id: string;
  name: string;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', minimumFractionDigits: 0 }).format(price);
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function SortIcon({ direction }: { direction: 'asc' | 'desc' | false }) {
  if (!direction) return null;
  return direction === 'asc' ? <ChevronUp className="inline h-3 w-3 ml-0.5" /> : <ChevronDown className="inline h-3 w-3 ml-0.5" />;
}

function DeleteConfirm({ target, onClose }: { target: DeleteTarget; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [checking, setChecking] = useState(true);
  const [blocked, setBlocked] = useState(false);

  useMemo(async () => {
    const res = await fetch(`/api/orders?status=pending`);
    if (res.ok) {
      const orders = await res.json();
      const hasPending = Array.isArray(orders) && orders.some(
        (o: { items?: { product_id: string }[] }) => o.items?.some((i) => i.product_id === target.id)
      );
      setBlocked(hasPending);
    }
    setChecking(false);
  }, [target.id]);

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/products/${target.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Cannot delete');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Product deleted');
      onClose();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <Card className="w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
        <CardContent className="p-6">
          <h3 className="font-heading text-lg font-semibold mb-2">Delete Product</h3>
          {checking ? (
            <p className="text-sm text-muted-foreground">Checking orders...</p>
          ) : blocked ? (
            <p className="text-sm text-destructive">
              Cannot delete <strong>{target.name}</strong> — it has pending orders.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete <strong>{target.name}</strong>?
            </p>
          )}
          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              {blocked ? 'Close' : 'Cancel'}
            </Button>
            {!checking && !blocked && (
              <Button variant="destructive" onClick={() => deleteMutation.mutate()} disabled={deleteMutation.isPending}>
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ProductsPageInner() {
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState('');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-products', search],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: '100' });
      if (search) params.set('search', search);
      const res = await fetch(`/api/products?${params}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      return json.data as Product[];
    },
    retry: 1,
    retryDelay: 1000,
  });

  const products = data ?? [];

  const columnHelper = createColumnHelper<Product>();
  const columns = useMemo(
    () => [
      columnHelper.accessor('images', {
        id: 'image',
        header: '',
        enableSorting: false,
        cell: (info) => {
          const src = info.getValue()?.[0];
          return src ? (
            <img src={src} alt="" className="h-10 w-10 rounded object-cover" />
          ) : (
            <div className="h-10 w-10 rounded bg-muted" />
          );
        },
      }),
      columnHelper.accessor('name', {
        header: 'Name',
        cell: (info) => (
          <div>
            <span className="font-medium">{info.getValue()}</span>
            {info.row.original.featured && (
              <Sparkles className="ml-1.5 inline h-3 w-3 text-secondary" />
            )}
          </div>
        ),
      }),
      columnHelper.accessor('categories', {
        id: 'category',
        header: 'Category',
        enableSorting: false,
        cell: (info) => (
          <span className="text-sm text-muted-foreground">{info.getValue()?.name ?? '-'}</span>
        ),
      }),
      columnHelper.accessor('price', {
        header: 'Price',
        cell: (info) => formatPrice(info.getValue()),
      }),
      columnHelper.accessor('stock', {
        header: 'Stock',
        cell: (info) => (
          <span className={info.getValue() < 5 ? 'text-destructive font-medium' : ''}>
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('created_at', {
        header: 'Created',
        cell: (info) => (
          <span className="text-sm text-muted-foreground">{formatDate(info.getValue())}</span>
        ),
      }),
      columnHelper.display({
        id: 'actions',
        header: '',
        cell: (info) => (
          <div className="flex justify-end gap-1">
            <Button variant="ghost" size="icon" asChild>
              <a href={`/admin/products/${info.row.original.slug}/edit`}>
                <Pencil className="h-4 w-4" />
              </a>
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setDeleteTarget({ id: info.row.original.id, name: info.row.original.name })}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ),
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: products,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 pt-14 md:pt-0 p-6 md:p-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-heading text-2xl font-bold tracking-tight">Products</h2>
          <Button asChild>
            <a href="/admin/products/new"><Plus className="mr-1 h-4 w-4" /> Add Product</a>
          </Button>
        </div>

        <div className="mb-4">
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <div className="h-64 animate-pulse rounded bg-muted" />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <p className="text-muted-foreground">Failed to load products.</p>
            <button onClick={() => window.location.reload()} className="text-sm font-medium text-primary hover:underline">Reload page</button>
          </div>
        ) : (
          <>
            <div className="rounded-lg border overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  {table.getHeaderGroups().map((hg) => (
                    <tr key={hg.id} className="border-b bg-muted/50">
                      {hg.headers.map((header) => (
                        <th
                          key={header.id}
                          className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground ${
                            header.column.getCanSort() ? 'cursor-pointer select-none hover:text-foreground' : ''
                          }`}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          <SortIcon direction={header.column.getIsSorted()} />
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="border-b last:border-0 hover:bg-muted/30">
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-4 py-3 text-sm">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {products.length === 0 && (
              <p className="mt-8 text-center text-sm text-muted-foreground">
                {search ? 'No products match your search.' : 'No products yet. Add your first product!'}
              </p>
            )}
          </>
        )}
      </main>

      {deleteTarget && <DeleteConfirm target={deleteTarget} onClose={() => setDeleteTarget(null)} />}
    </div>
  );
}

export function ProductsPage() {
  const [qc] = useState(() => makeQueryClient());
  return (
    <QueryClientProvider client={qc}>
      <ProductsPageInner />
    </QueryClientProvider>
  );
}
