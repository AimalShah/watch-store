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
        className="sidebar-toggle"
        onClick={() => setOpen(!open)}
        aria-label="Toggle sidebar"
      >
        <span />
        <span />
        <span />
      </button>
      <aside className={`admin-sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-header">
          <a href="/admin" className="sidebar-logo">Admin</a>
        </div>
        <nav className="sidebar-nav">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="sidebar-link"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <form method="POST" action="/api/auth/logout" className="sidebar-logout">
            <button type="submit" className="sidebar-link logout">Sign Out</button>
          </form>
        </nav>
      </aside>
      {open && <div className="sidebar-overlay" onClick={() => setOpen(false)} />}
    </>
  );
}
