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
import { Check, ChevronUp, ChevronDown, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AdminSidebar } from './sidebar';
import { makeQueryClient } from '@/lib/query-client';
import { buildAdminToCustomerUrl } from '@/lib/whatsapp';

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  products: { name: string; price: number };
}

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  total_amount: number;
  status: string;
  created_at: string;
  order_items: OrderItem[];
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', minimumFractionDigits: 0 }).format(price);
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function SortIcon({ direction }: { direction: 'asc' | 'desc' | false }) {
  if (!direction) return null;
  return direction === 'asc' ? <ChevronUp className="inline h-3 w-3 ml-0.5" /> : <ChevronDown className="inline h-3 w-3 ml-0.5" />;
}

function ConfirmDialog({ order, onClose }: { order: Order; onClose: () => void }) {
  const queryClient = useQueryClient();

  const confirmMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/orders/${order.id}/confirm`, { method: 'POST' });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Cannot confirm');
      }
      return res.json() as Promise<{ success: boolean; whatsapp_url: string }>;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success('Order confirmed');
      window.open(data.whatsapp_url, '_blank');
      onClose();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div className="w-full max-w-sm mx-4 rounded-lg border bg-background p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-heading text-lg font-semibold mb-2">Confirm Order</h3>
        <p className="text-sm text-muted-foreground mb-4">
          This will deduct stock and open WhatsApp to notify <strong>{order.customer_name}</strong>.
        </p>
        <div className="space-y-1 text-sm mb-4">
          {order.order_items.map((item) => (
            <div key={item.id} className="flex justify-between">
              <span>{item.products.name} x{item.quantity}</span>
              <span className="font-medium">{formatPrice(item.unit_price * item.quantity)}</span>
            </div>
          ))}
          <div className="flex justify-between border-t pt-1 mt-1 font-medium">
            <span>Total</span>
            <span>{formatPrice(order.total_amount)}</span>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => confirmMutation.mutate()} disabled={confirmMutation.isPending}>
            {confirmMutation.isPending ? 'Confirming...' : 'Confirm Order'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function OrdersTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [confirmTarget, setConfirmTarget] = useState<Order | null>(null);

  const { data: orders = [], isLoading, isError } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const res = await fetch('/api/orders');
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json() as Promise<Order[]>;
    },
    retry: 1,
    retryDelay: 1000,
    refetchInterval: 15_000,
  });

  const columnHelper = createColumnHelper<Order>();
  const columns = useMemo(
    () => [
      columnHelper.accessor('customer_name', {
        header: 'Customer',
        cell: (info) => (
          <div>
            <p className="font-medium">{info.getValue()}</p>
            <p className="text-xs text-muted-foreground">{info.row.original.customer_phone}</p>
          </div>
        ),
      }),
      columnHelper.accessor('order_items', {
        id: 'items',
        header: 'Items',
        enableSorting: false,
        cell: (info) => (
          <div className="text-sm">
            {info.getValue().map((item) => (
              <div key={item.id} className="truncate max-w-[200px]">
                {item.products.name} x{item.quantity}
              </div>
            ))}
          </div>
        ),
      }),
      columnHelper.accessor('total_amount', {
        header: 'Total',
        cell: (info) => <span className="font-medium">{formatPrice(info.getValue())}</span>,
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: (info) => (
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
            info.getValue() === 'confirmed'
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
          }`}>
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('created_at', {
        header: 'Date',
        cell: (info) => <span className="text-sm text-muted-foreground">{formatDate(info.getValue())}</span>,
      }),
      columnHelper.accessor('delivery_address', {
        header: 'Address',
        enableSorting: false,
        cell: (info) => <span className="text-sm text-muted-foreground truncate max-w-[180px] block">{info.getValue()}</span>,
      }),
      columnHelper.display({
        id: 'actions',
        header: '',
        enableSorting: false,
        cell: (info) => {
          const order = info.row.original;
          return (
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => window.open(buildAdminToCustomerUrl(order.customer_phone), '_blank')}
                title="Message customer on WhatsApp"
              >
                <MessageCircle className="h-4 w-4" />
              </Button>
              {order.status === 'pending' && (
                <Button
                  size="sm"
                  onClick={() => setConfirmTarget(order)}
                >
                  <Check className="mr-1 h-3 w-3" /> Confirm
                </Button>
              )}
            </div>
          );
        },
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: orders,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="flex-1 pt-14 md:pt-0 p-6 md:p-8">
          <div className="space-y-3">
            <div className="h-8 w-48 animate-pulse rounded bg-muted" />
            <div className="h-64 animate-pulse rounded bg-muted" />
          </div>
        </main>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="flex-1 pt-14 md:pt-0 p-6 md:p-8">
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <p className="text-muted-foreground">Failed to load orders.</p>
            <button onClick={() => window.location.reload()} className="text-sm font-medium text-primary hover:underline">Reload page</button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 pt-14 md:pt-0 p-6 md:p-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-heading text-2xl font-bold tracking-tight">Orders</h2>
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

        {orders.length === 0 && (
          <p className="mt-8 text-center text-sm text-muted-foreground">No orders yet.</p>
        )}

        {confirmTarget && (
          <ConfirmDialog order={confirmTarget} onClose={() => setConfirmTarget(null)} />
        )}
      </main>
    </div>
  );
}

function OrdersPageInner() {
  return <OrdersTable />;
}

export function OrdersPage() {
  const [qc] = useState(() => makeQueryClient());
  return (
    <QueryClientProvider client={qc}>
      <OrdersPageInner />
    </QueryClientProvider>
  );
}
