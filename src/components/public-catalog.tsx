import { useState, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
  categories: { name: string; slug: string } | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

const PAGE_SIZE = 8;

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <div className="aspect-square animate-pulse bg-muted" />
          <CardContent className="space-y-2 p-4">
            <div className="h-3 w-16 animate-pulse rounded bg-muted" />
            <div className="h-4 w-32 animate-pulse rounded bg-muted" />
            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function PublicCatalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [sort, setSort] = useState('newest');

  const fetchProducts = useCallback(async (append = false) => {
    const params = new URLSearchParams({
      limit: String(PAGE_SIZE),
      offset: append ? String(products.length) : '0',
      sort,
    });
    if (search) params.set('search', search);
    if (activeCategory) params.set('category', activeCategory);

    const res = await fetch(`/api/products?${params}`);
    if (!res.ok) return;
    const json = await res.json();

    setProducts((prev) => append ? [...prev, ...json.data] : json.data);
    setTotal(json.total);
  }, [search, activeCategory, sort, products.length]);

  useEffect(() => {
    setLoading(true);
    setProducts([]);
    fetchProducts().then(() => setLoading(false));
  }, [search, activeCategory, sort]);

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then(setCategories)
      .catch(() => {});
  }, []);

  const hasMore = products.length < total;

  function handleLoadMore() {
    setLoadingMore(true);
    fetchProducts(true).then(() => setLoadingMore(false));
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const input = (e.target as HTMLFormElement).querySelector('input')?.value ?? '';
    setSearch(input);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-secondary">Collection</p>
        <h1 className="font-heading text-4xl font-bold tracking-tight">All Watches</h1>
      </div>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <form onSubmit={handleSearch} className="relative flex-1 max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="search"
            placeholder="Search watches..."
            defaultValue={search}
            className="pl-10"
          />
        </form>

        <div className="flex items-center gap-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(activeCategory === cat.slug ? '' : cat.slug)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                activeCategory === cat.slug
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {cat.name}
            </button>
          ))}
          {activeCategory && (
            <button
              onClick={() => setActiveCategory('')}
              className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              Clear
            </button>
          )}
        </div>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>

      {loading ? (
        <SkeletonGrid />
      ) : products.length === 0 ? (
        <div className="py-24 text-center">
          <p className="text-muted-foreground">No watches found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try a different search or filter
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <a key={p.id} href={`/watch/${p.slug}`} className="group">
                <Card className="overflow-hidden transition-all duration-300 group-hover:shadow-lg">
                  <div className="aspect-square overflow-hidden bg-muted">
                    {p.images?.[0] ? (
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="h-full w-full bg-muted" />
                    )}
                  </div>
                  <CardContent className="space-y-1 p-4">
                    <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                      {p.categories?.name ?? ''}
                    </p>
                    <h3 className="font-heading text-base font-semibold">{p.name}</h3>
                    <p className="font-heading text-lg font-bold text-secondary">
                      Rs{Number(p.price).toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>

          {hasMore && (
            <div className="mt-12 text-center">
              <Button
                variant="outline"
                size="lg"
                className="rounded-none px-10"
                onClick={handleLoadMore}
                disabled={loadingMore}
              >
                {loadingMore ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
