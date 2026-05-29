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
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AdminSidebar } from './sidebar';
import { makeQueryClient } from '@/lib/query-client';

interface Category {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  products: { count: number }[];
}

interface ModalState {
  open: boolean;
  category: Category | null;
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function Modal({
  open,
  category,
  onClose,
}: {
  open: boolean;
  category: Category | null;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [name, setName] = useState(category?.name ?? '');
  const [slug, setSlug] = useState(category?.slug ?? '');

  const createMutation = useMutation({
    mutationFn: async (cat: { name: string; slug: string }) => {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cat),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      toast.success('Category created');
      onClose();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: async (cat: { id: string; name: string; slug: string }) => {
      const res = await fetch(`/api/categories/${cat.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: cat.name, slug: cat.slug }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      toast.success('Category updated');
      onClose();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  if (!open) return null;

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const payload = { name: name.trim(), slug: slug.trim() || slugify(name.trim()) };
    if (category) {
      updateMutation.mutate({ id: category.id, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <Card className="w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
        <CardContent className="p-6">
          <h3 className="font-heading text-lg font-semibold mb-4">
            {category ? 'Edit Category' : 'Add Category'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="cat-name">Name</Label>
              <Input
                id="cat-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!category) setSlug(slugify(e.target.value));
                }}
                placeholder="e.g. Rolex"
                required
                autoFocus
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="cat-slug">Slug</Label>
              <Input
                id="cat-slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="auto-generated"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting || !name.trim()}>
                {isSubmitting ? 'Saving...' : category ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function DeleteConfirm({
  category,
  onClose,
}: {
  category: Category;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/categories/${category.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Cannot delete category');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      toast.success('Category deleted');
      onClose();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const productCount = category.products?.[0]?.count ?? 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <Card className="w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
        <CardContent className="p-6">
          <h3 className="font-heading text-lg font-semibold mb-2">Delete Category</h3>
          {productCount > 0 ? (
            <p className="text-sm text-destructive">
              Cannot delete — {productCount} product{productCount === 1 ? '' : 's'} use this category.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete <strong>{category.name}</strong>?
            </p>
          )}
          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              {productCount > 0 ? 'Close' : 'Cancel'}
            </Button>
            {productCount === 0 && (
              <Button
                variant="destructive"
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SortIcon({ direction }: { direction: 'asc' | 'desc' | false }) {
  if (!direction) return null;
  return direction === 'asc'
    ? <ChevronUp className="inline h-3 w-3 ml-0.5" />
    : <ChevronDown className="inline h-3 w-3 ml-0.5" />;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function CategoriesPageInner() {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 pt-14 md:pt-0 p-6 md:p-8">
        <CategoriesContent />
      </main>
    </div>
  );
}

export function CategoriesPage() {
  const [qc] = useState(() => makeQueryClient());
  return (
    <QueryClientProvider client={qc}>
      <CategoriesPageInner />
    </QueryClientProvider>
  );
}

function CategoriesContent() {
  const [modal, setModal] = useState<ModalState>({ open: false, category: null });
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);

  const { data: categories = [], isLoading, isError } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const res = await fetch('/api/categories');
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json() as Promise<Category[]>;
    },
    retry: 1,
    retryDelay: 1000,
  });

  const columnHelper = createColumnHelper<Category>();

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'Name',
        cell: (info) => <span className="font-medium">{info.getValue()}</span>,
      }),
      columnHelper.accessor('slug', {
        header: 'Slug',
        cell: (info) => <span className="text-muted-foreground">{info.getValue()}</span>,
      }),
      columnHelper.accessor('products', {
        header: 'Products',
        cell: (info) => info.getValue()?.[0]?.count ?? 0,
      }),
      columnHelper.accessor('created_at', {
        header: 'Created',
        cell: (info) => formatDate(info.getValue()),
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setModal({ open: true, category: row.original })}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDeleteTarget(row.original)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ),
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: categories,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="h-64 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-muted-foreground">Failed to load categories.</p>
        <button onClick={() => window.location.reload()} className="text-sm font-medium text-primary hover:underline">Reload page</button>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-heading text-2xl font-bold tracking-tight">Categories</h2>
        <Button onClick={() => setModal({ open: true, category: null })}>
          <Plus className="mr-1 h-4 w-4" /> Add Category
        </Button>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block rounded-lg border">
        <table className="w-full">
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

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {categories.map((cat) => (
          <Card key={cat.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium">{cat.name}</h3>
                  <p className="text-xs text-muted-foreground">{cat.slug}</p>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setModal({ open: true, category: cat })}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteTarget(cat)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
              <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                <span>{cat.products?.[0]?.count ?? 0} products</span>
                <span>{formatDate(cat.created_at)}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Modal
        open={modal.open}
        category={modal.category}
        onClose={() => setModal({ open: false, category: null })}
      />

      {deleteTarget && (
        <DeleteConfirm
          category={deleteTarget}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
}
