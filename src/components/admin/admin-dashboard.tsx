import { useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { Package, ShoppingCart, Clock, AlertTriangle, Plus, Eye, ArrowRight } from 'lucide-react';
import { AdminSidebar } from './sidebar';
import { makeQueryClient } from '@/lib/query-client';

interface Stats {
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  lowStockCount: number;
  lowStockProducts: { id: string; name: string; slug: string; stock: number }[];
  recentOrders: {
    id: string;
    customer_name: string;
    total_amount: number;
    status: string;
    created_at: string;
    order_items: { products: { name: string }; quantity: number }[];
  }[];
}

function StatsGrid({ stats }: { stats: Stats }) {
  const cards = [
    {
      label: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      href: '/admin/products',
      action: 'View Products',
    },
    {
      label: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingCart,
      href: '/admin/orders',
      action: 'View Orders',
    },
    {
      label: 'Pending Orders',
      value: stats.pendingOrders,
      icon: Clock,
      href: '/admin/orders',
      action: 'Review',
    },
    {
      label: 'Low Stock Items',
      value: stats.lowStockCount,
      icon: AlertTriangle,
      href: '/admin/stock',
      action: 'Manage Stock',
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="group rounded-lg border bg-card p-5 transition-shadow hover:shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <p className="mt-2 text-3xl font-bold tracking-tight">{card.value}</p>
            </div>
            <div className="rounded-md border bg-muted/50 p-2 text-muted-foreground">
              <card.icon className="h-5 w-5" />
            </div>
          </div>
          <a href={card.href} className="mt-4 flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
            {card.action} <ArrowRight className="h-3 w-3" />
          </a>
        </div>
      ))}
    </div>
  );
}

function RecentOrders({ orders }: { orders: Stats['recentOrders'] }) {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-center">
        <ShoppingCart className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No pending orders.</p>
      </div>
    );
  }

  return (
    <div className="divide-y">
      {orders.map((order) => (
        <a
          key={order.id}
          href="/admin/orders"
          className="flex items-center justify-between px-1 py-3 text-sm transition-colors hover:bg-muted/30 -mx-1 px-3 rounded-sm"
        >
          <div className="min-w-0 flex-1">
            <p className="font-medium truncate">{order.customer_name}</p>
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {order.order_items.map((oi) => `${oi.products.name} x${oi.quantity}`).join(', ')}
            </p>
          </div>
          <div className="ml-4 text-right shrink-0">
            <p className="font-medium">Rs{Number(order.total_amount).toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
          </div>
        </a>
      ))}
    </div>
  );
}

function LowStockAlerts({ products }: { products: Stats['lowStockProducts'] }) {
  if (products.length === 0) return null;

  return (
    <div className="divide-y">
      {products.map((p) => (
        <a
          key={p.id}
          href={`/admin/products/${p.slug}/edit`}
          className="flex items-center justify-between px-1 py-2.5 text-sm transition-colors hover:bg-muted/30 -mx-1 px-3 rounded-sm"
        >
          <span className="font-medium truncate">{p.name}</span>
          <span className={`shrink-0 ml-2 font-medium text-sm ${
            p.stock === 0 ? 'text-destructive' : 'text-amber-600'
          }`}>
            {p.stock} left
          </span>
        </a>
      ))}
    </div>
  );
}

function QuickActions() {
  return (
    <div className="flex flex-wrap gap-2">
      <a
        href="/admin/products/new"
        className="inline-flex items-center gap-2 rounded-md border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
      >
        <Plus className="h-4 w-4" /> Add Product
      </a>
      <a
        href="/admin/categories"
        className="inline-flex items-center gap-2 rounded-md border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
      >
        <Plus className="h-4 w-4" /> Add Category
      </a>
      <a
        href="/admin/orders"
        className="inline-flex items-center gap-2 rounded-md border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
      >
        <Eye className="h-4 w-4" /> View Orders
      </a>
    </div>
  );
}

function DashboardContent() {
  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async () => {
      const res = await fetch('/api/admin/stats');
      if (!res.ok) throw new Error('Failed to fetch stats');
      return res.json() as Promise<Stats>;
    },
    retry: 1,
    retryDelay: 1000,
    refetchInterval: 30_000,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
        <div className="h-48 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-muted-foreground">Failed to load dashboard data.</p>
        <button onClick={() => window.location.reload()} className="text-sm font-medium text-primary hover:underline">
          Reload page
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="mt-1 text-sm text-muted-foreground">Overview of your store activity.</p>
      </div>

      <StatsGrid stats={stats} />

      <QuickActions />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-card">
          <div className="border-b px-5 py-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Pending Orders</h3>
              <a href="/admin/orders" className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                View all {stats.pendingOrders > 5 ? `(${stats.pendingOrders})` : ''}
              </a>
            </div>
          </div>
          <div className="p-5">
            <RecentOrders orders={stats.recentOrders} />
          </div>
        </div>

        <div className="rounded-lg border bg-card">
          <div className="border-b px-5 py-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Low Stock Alerts</h3>
              <a href="/admin/stock" className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                Manage Stock
              </a>
            </div>
          </div>
          <div className="p-5">
            {stats.lowStockProducts.length > 0 ? (
              <LowStockAlerts products={stats.lowStockProducts} />
            ) : (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <Package className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">All products well-stocked.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardPageInner() {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 pt-14 md:pt-0 p-6 md:p-8">
        <DashboardContent />
      </main>
    </div>
  );
}

export function DashboardPage() {
  const [qc] = useState(() => makeQueryClient());
  return (
    <QueryClientProvider client={qc}>
      <DashboardPageInner />
    </QueryClientProvider>
  );
}
