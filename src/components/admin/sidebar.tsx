import { useState } from 'react';
import { PanelLeft, X, LayoutDashboard, Package, Tags, ShoppingCart, PackageCheck, ExternalLink } from 'lucide-react';

const links = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/categories', label: 'Categories', icon: Tags },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/stock', label: 'Stock', icon: PackageCheck },
];

function SidebarNav({ onNav }: { onNav?: () => void }) {
  return (
    <nav className="flex flex-col gap-1">
      {links.map((link) => (
        <a
          key={link.href}
          href={link.href}
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          onClick={onNav}
        >
          <link.icon className="h-4 w-4" />
          {link.label}
        </a>
      ))}
    </nav>
  );
}

export function AdminSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile trigger */}
      <button
        onClick={() => setOpen(true)}
        className="fixed left-3 top-3 z-40 flex h-9 w-9 items-center justify-center rounded-md border bg-background md:hidden"
        aria-label="Open sidebar"
      >
        <PanelLeft className="h-4 w-4" />
      </button>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Mobile drawer */}
      <aside
        className={`fixed left-0 top-0 z-40 flex h-full w-64 flex-col border-r bg-background transition-transform duration-300 md:hidden ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-14 items-center justify-between border-b px-4">
          <a href="/admin" className="text-sm font-semibold tracking-wider">AZ WATCH HUB</a>
          <button onClick={() => setOpen(false)} className="p-1 text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <SidebarNav onNav={() => setOpen(false)} />
        </div>
        <div className="border-t p-3 space-y-1">
          <a
            href="/"
            target="_blank"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            onClick={() => { setOpen(false); }}
          >
            <ExternalLink className="h-4 w-4" />
            Go to Site
          </a>
        </div>
        <div className="border-t p-3">
          <form method="POST" action="/api/auth/logout">
            <button type="submit" className="w-full rounded-md px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 border-r bg-background md:block">
        <div className="flex h-14 items-center border-b px-6">
          <a href="/admin" className="text-sm font-semibold tracking-wider">AZ WATCH HUB</a>
        </div>
        <div className="p-3">
          <SidebarNav />
        </div>
        <div className="border-t p-3 space-y-1">
          <a
            href="/"
            target="_blank"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <ExternalLink className="h-4 w-4" />
            Go to Site
          </a>
        </div>
        <div className="border-t p-3">
          <form method="POST" action="/api/auth/logout">
            <button type="submit" className="w-full rounded-md px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
              Sign Out
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
