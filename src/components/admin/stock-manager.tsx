import { useState, useEffect, useCallback } from 'react';

interface Product {
  id: string;
  name: string;
  stock: number;
  images: string[];
}

export function StockManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [adjusting, setAdjusting] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error();
      setProducts(await res.json());
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  async function adjustStock(id: string, delta: number) {
    const product = products.find((p) => p.id === id);
    if (!product) return;
    const newStock = Math.max(0, product.stock + delta);
    const res = await fetch(`/api/products/${id}/stock`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stock: newStock }),
    });
    if (res.ok) {
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, stock: newStock } : p))
      );
    }
  }

  async function setStockDirect(id: string, value: number) {
    const res = await fetch(`/api/products/${id}/stock`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stock: Math.max(0, value) }),
    });
    if (res.ok) {
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, stock: Math.max(0, value) } : p))
      );
    }
    setAdjusting(null);
  }

  return (
    <div>
      <div className="admin-header">
        <h2 className="headline-md">Stock Management</h2>
      </div>

      {loading ? (
        <p className="body-md">Loading...</p>
      ) : products.length === 0 ? (
        <p className="body-md" style={{ color: 'var(--fg-muted)', marginTop: 32 }}>No products yet.</p>
      ) : (
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th className="label-sm">Image</th>
                <th className="label-sm">Product</th>
                <th className="label-sm">Stock</th>
                <th className="label-sm">Adjust</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>
                    {p.images?.[0] ? (
                      <img src={p.images[0]} alt="" className="product-thumb" />
                    ) : (
                      <div className="product-thumb placeholder" />
                    )}
                  </td>
                  <td className="body-md">{p.name}</td>
                  <td className="body-md">
                    <span className={p.stock < 5 ? 'stock-low' : ''}>{p.stock}</span>
                  </td>
                  <td>
                    {adjusting === p.id ? (
                      <input
                        type="number"
                        className="stock-input"
                        defaultValue={p.stock}
                        min="0"
                        onBlur={(e) => setStockDirect(p.id, parseInt(e.target.value) || 0)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') setStockDirect(p.id, parseInt((e.target as HTMLInputElement).value) || 0);
                          if (e.key === 'Escape') setAdjusting(null);
                        }}
                        autoFocus
                      />
                    ) : (
                      <div className="stock-adjust">
                        <button className="adj-btn" onClick={() => adjustStock(p.id, -1)} disabled={p.stock <= 0}>−</button>
                        <button className="adj-btn edit" onClick={() => setAdjusting(p.id)}>
                          {p.stock}
                        </button>
                        <button className="adj-btn" onClick={() => adjustStock(p.id, 1)}>+</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
