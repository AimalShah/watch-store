import { useEffect, useState } from 'react';
import { useCartStore } from '@/stores/cart';
import { Menu, X, Home, Watch, ShoppingBag, Sun, Moon, Search } from 'lucide-react';

interface Props {
  currentPath: string;
}

function getTheme(): 'dark' | 'light' {
  if (typeof document === 'undefined') return 'light';
  const stored = localStorage.getItem('az-theme');
  if (stored === 'dark' || stored === 'light') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function setThemeAttr(theme: 'dark' | 'light') {
  document.documentElement.setAttribute('data-theme', theme);
  if (theme === 'dark') document.documentElement.classList.add('dark');
  else document.documentElement.classList.remove('dark');
}

export function PublicNav({ currentPath }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setThemeState] = useState<'dark' | 'light'>('light');
  const itemCount = useCartStore((s) => s.itemCount);

  useEffect(() => {
    const t = getTheme();
    setThemeState(t);
    setThemeAttr(t);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuOpen(false);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setThemeState(next);
    setThemeAttr(next);
    localStorage.setItem('az-theme', next);
  }

  const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/watches', label: 'Watches', icon: Watch },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
    { href: '/faq', label: 'FAQ' },
  ];

  const bottomLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/watches', label: 'Watches', icon: Watch },
    { href: '/cart', label: 'Cart', icon: ShoppingBag },
  ];

  function isActive(href: string) {
    if (href === '/') return currentPath === '/';
    return currentPath.startsWith(href);
  }

  return (
    <>
      {/* Top bar */}
      <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <a href="/" className="font-heading text-xl tracking-wider">AZ WATCH HUB</a>

          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-foreground ${
                  isActive(link.href) ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={toggleTheme}
              className="hidden p-2 text-muted-foreground transition-colors hover:text-foreground md:block"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <a href="/cart" className="relative p-2 text-muted-foreground transition-colors hover:text-foreground">
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-secondary px-1 text-[10px] font-bold text-secondary-foreground">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </a>
            <button
              onClick={() => setMenuOpen(true)}
              className="p-2 text-muted-foreground transition-colors hover:text-foreground md:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Bottom nav — mobile only */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background md:hidden">
        <div className="flex items-center justify-around py-2">
          {bottomLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <a
                key={link.href}
                href={link.href}
                className={`relative flex flex-col items-center gap-0.5 px-3 py-1 text-xs font-medium transition-colors ${
                  active ? 'text-secondary' : 'text-muted-foreground'
                }`}
              >
                <link.icon className={`h-5 w-5 ${active ? 'fill-secondary' : ''}`} />
                <span>{link.label}</span>
                {link.href === '/cart' && itemCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-secondary px-1 text-[10px] font-bold text-secondary-foreground">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </a>
            );
          })}
        </div>
      </nav>

      {/* Bottom padding for mobile nav */}
      <div className="h-16 md:hidden" />

      {/* Off-canvas overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-black/30" onClick={() => setMenuOpen(false)} />
      )}

      {/* Off-canvas panel */}
      <div
        className={`fixed left-0 top-0 z-50 h-full w-72 border-r bg-background shadow-xl transition-transform duration-300 ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b px-4">
          <span className="font-heading text-lg tracking-wider">AZ WATCH HUB</span>
          <button
            onClick={() => setMenuOpen(false)}
            className="p-2 text-muted-foreground hover:text-foreground"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-col gap-1 p-4">
          <a
            href="/about"
            onClick={() => setMenuOpen(false)}
            className="rounded-md px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            About
          </a>
          <a
            href="/faq"
            onClick={() => setMenuOpen(false)}
            className="rounded-md px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            FAQ
          </a>
          <a
            href="/contact"
            onClick={() => setMenuOpen(false)}
            className="rounded-md px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Contact
          </a>
          <div className="relative mt-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search watches..."
              className="w-full rounded-md border border-input bg-background py-2 pl-10 pr-3 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </nav>

        <div className="border-t p-4">
          <button
            onClick={toggleTheme}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </div>
    </>
  );
}
