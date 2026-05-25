import { useState, useEffect, useCallback } from 'react';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
  categories: { name: string; slug: string } | null;
}

interface ApiResponse {
  data: Product[];
  total: number;
  page: number;
  limit: number;
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

export function Catalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const limit = 12;

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then(setCategories)
      .catch(() => {});
  }, []);

  const fetchProducts = useCallback(
    async (pageNum: number, append = false) => {
      setLoading(true);
      const params = new URLSearchParams();
      if (activeCategory) params.set('category', activeCategory);
      if (search) params.set('search', search);
      params.set('sort', sort);
      params.set('page', String(pageNum));
      params.set('limit', String(limit));

      try {
        const res = await fetch(`/api/products?${params}`);
        const json: ApiResponse = await res.json();
        setProducts((prev) => (append ? [...prev, ...json.data] : json.data));
        setTotal(json.total);
        setPage(json.page);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    },
    [activeCategory, search, sort]
  );

  useEffect(() => {
    fetchProducts(1);
  }, [fetchProducts]);

  function applyFilter() {
    setProducts([]);
    fetchProducts(1);
    setFiltersOpen(false);
  }

  function clearFilters() {
    setActiveCategory('');
    setSearch('');
    setSort('newest');
    setProducts([]);
    setPage(1);
    fetchProducts(1);
  }

  const hasMore = products.length < total;

  return (
    <div className="catalog-layout">
      <button className="filter-toggle label-sm" onClick={() => setFiltersOpen(!filtersOpen)}>
        {filtersOpen ? 'Close Filters' : 'Filters'}
      </button>

      <aside className={`catalog-sidebar ${filtersOpen ? 'open' : ''}`}>
        <div className="filter-section">
          <h3 className="label-sm">Search</h3>
          <input
            type="text"
            className="filter-input"
            placeholder="Search watches..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applyFilter()}
          />
        </div>

        <div className="filter-section">
          <h3 className="label-sm">Categories</h3>
          <div className="category-list">
            <button
              className={`category-chip ${!activeCategory ? 'active' : ''}`}
              onClick={() => { setActiveCategory(''); applyFilter(); }}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                className={`category-chip ${activeCategory === c.id ? 'active' : ''}`}
                onClick={() => { setActiveCategory(c.id); applyFilter(); }}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-section">
          <h3 className="label-sm">Sort</h3>
          <select
            className="filter-input"
            value={sort}
            onChange={(e) => { setSort(e.target.value); applyFilter(); }}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <button className="clear-btn label-sm" onClick={clearFilters}>Clear All</button>
      </aside>

      {filtersOpen && <div className="filter-overlay" onClick={() => setFiltersOpen(false)} />}

      <div className="catalog-content">
        {!loading && products.length === 0 ? (
          <div className="empty-state">
            <p className="body-lg">No watches match your filters</p>
            <button className="clear-btn label-sm" onClick={clearFilters}>Clear Filters</button>
          </div>
        ) : (
          <>
            <p className="result-count body-md">{total} watch{total !== 1 ? 'es' : ''}</p>
            <div className="product-grid">
              {products.map((p) => (
                <a key={p.id} href={`/watch/${p.slug}`} className="product-card">
                  <div className="card-image">
                    {p.images?.[0] ? (
                      <img src={p.images[0]} alt={p.name} loading="lazy" />
                    ) : (
                      <div className="card-image-placeholder" />
                    )}
                  </div>
                  <div className="card-body">
                    <span className="label-sm card-category">
                      {p.categories?.name ?? ''}
                    </span>
                    <h3 className="headline-md card-title">{p.name}</h3>
                    <span className="price-display">${Number(p.price).toLocaleString()}</span>
                    <span className="btn-whatsapp">Buy on WhatsApp</span>
                  </div>
                </a>
              ))}
            </div>
            {hasMore && (
              <div className="load-more-wrap">
                <button
                  className="btn-load-more"
                  onClick={() => fetchProducts(page + 1, true)}
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
