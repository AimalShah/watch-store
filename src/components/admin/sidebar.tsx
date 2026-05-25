import { useState } from 'react';

const links = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/categories', label: 'Categories' },
  { href: '/admin/orders', label: 'Orders' },
  { href: '/admin/stock', label: 'Stock' },
];

export function AdminSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="fixed left-3 top-20 z-50 flex flex-col gap-1 p-2 md:hidden"
        onClick={() => setOpen(!open)}
        aria-label="Toggle sidebar"
      >
        <span className="block h-0.5 w-5 bg-foreground" />
        <span className="block h-0.5 w-5 bg-foreground" />
        <span className="block h-0.5 w-5 bg-foreground" />
      </button>
      {open && (
        <div className="fixed inset-0 z-30 bg-black/30 md:hidden" onClick={() => setOpen(false)} />
      )}
      <aside className={`${open ? 'translate-x-0' : '-translate-x-full'} fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-60 border-r bg-background transition-transform md:sticky md:translate-x-0`}>
        <div className="flex items-center border-b px-6 py-4">
          <a href="/admin" className="font-heading text-sm tracking-wider">Admin</a>
        </div>
        <nav className="flex flex-col gap-1 p-3">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <form method="POST" action="/api/auth/logout" className="mt-auto border-t pt-3">
            <button type="submit" className="w-full rounded-md px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
              Sign Out
            </button>
          </form>
        </nav>
      </aside>
    </>
  );
}
