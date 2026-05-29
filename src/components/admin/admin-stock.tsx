import { useState, useMemo } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type SortingState,
  createColumnHelper,
} from '@tanstack/react-table';
import { ChevronUp, ChevronDown, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { AdminSidebar } from './sidebar';
import { makeQueryClient } from '@/lib/query-client';

interface Product {
  id: string;
  name: string;
  slug: string;
  stock: number;
  price: number;
}

function SortIcon({ direction }: { direction: 'asc' | 'desc' | false }) {
  if (!direction) return null;
  return direction === 'asc' ? <ChevronUp className="inline h-3 w-3 ml-0.5" /> : <ChevronDown className="inline h-3 w-3 ml-0.5" />;
}

function StockContent() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState('');

  const { data: products = [], isLoading, isError } = useQuery({
    queryKey: ['admin-stock', search],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: '200' });
      if (search) params.set('search', search);
      const res = await fetch(`/api/products?${params}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      return json.data as Product[];
    },
    retry: 1,
    retryDelay: 1000,
  });

  const columnHelper = createColumnHelper<Product>();
  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'Product',
        cell: (info) => <span className="font-medium">{info.getValue()}</span>,
      }),
      columnHelper.accessor('price', {
        header: 'Price',
        cell: (info) => <span className="font-medium">Rs{Number(info.getValue()).toLocaleString()}</span>,
      }),
      columnHelper.accessor('stock', {
        header: 'Stock',
        cell: (info) => {
          const stock = info.getValue();
          return (
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
              stock === 0
                ? 'bg-red-100 text-black dark:bg-red-900/30 dark:text-red-400'
                : stock < 5
                ? 'bg-amber-100 text-black dark:bg-amber-900/30 dark:text-black'
                : 'bg-green-100 text-black dark:bg-green-900/30 dark:text-black'
            }`}>
              {stock}
            </span>
          );
        },
      }),
      columnHelper.display({
        id: 'status',
        header: 'Status',
        cell: (info) => {
          const stock = info.row.original.stock;
          return (
            <span className="text-sm text-muted-foreground">
              {stock === 0 ? 'Out of stock' : stock < 5 ? 'Low stock' : 'In stock'}
            </span>
          );
        },
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
        <p className="text-muted-foreground">Failed to load stock data.</p>
        <button onClick={() => window.location.reload()} className="text-sm font-medium text-primary hover:underline">Reload page</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Stock Management</h2>
        <p className="mt-1 text-sm text-muted-foreground">Monitor and manage product inventory levels.</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b bg-muted/50">
                {headerGroup.headers.map((header) => (
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
        <p className="text-center text-sm text-muted-foreground">
          {search ? 'No products match your search.' : 'No products yet.'}
        </p>
      )}
    </div>
  );
}

function StockPageInner() {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 pt-14 md:pt-0 p-6 md:p-8">
        <StockContent />
      </main>
    </div>
  );
}

export function StockPage() {
  const [qc] = useState(() => makeQueryClient());
  return (
    <QueryClientProvider client={qc}>
      <StockPageInner />
    </QueryClientProvider>
  );
}
