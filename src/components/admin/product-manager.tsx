import { useState, useEffect, useCallback } from 'react';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  images: string[];
  featured: boolean;
  categories: { name: string; slug: string } | null;
}

export function ProductManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('Failed to fetch');
      setProducts(await res.json());
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  async function deleteProduct(id: string) {
    if (!confirm('Delete this product?')) return;
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    if (res.ok) fetchProducts();
  }

  return (
    <div>
      <div className="admin-header">
        <h2 className="headline-md">Products</h2>
        <a href="/admin/products/new" className="btn-primary">Add Product</a>
      </div>

      {loading ? (
        <p className="body-md">Loading...</p>
      ) : products.length === 0 ? (
        <p className="body-md" style={{ color: 'var(--fg-muted)', marginTop: 32 }}>
          No products yet.
        </p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th className="label-sm">Image</th>
              <th className="label-sm">Name</th>
              <th className="label-sm">Category</th>
              <th className="label-sm">Price</th>
              <th className="label-sm">Stock</th>
              <th className="label-sm">Actions</th>
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
                <td className="body-md" style={{ color: 'var(--fg-muted)' }}>
                  {p.categories?.name ?? '—'}
                </td>
                <td className="body-md">${Number(p.price).toLocaleString()}</td>
                <td className="body-md">{p.stock}</td>
                <td>
                  <a href={`/admin/products/${p.id}/edit`} className="btn-ghost">Edit</a>
                  <button
                    className="btn-ghost btn-danger"
                    onClick={() => deleteProduct(p.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
