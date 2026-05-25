import { useState, useEffect, useCallback } from 'react';

interface Category {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  products?: { count: number }[];
}

export function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState<{ mode: 'create' | 'edit'; category?: Category } | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/categories');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setCategories(data);
    } catch (e) {
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  async function saveCategory(name: string, slug: string, id?: string) {
    const url = id ? `/api/categories/${id}` : '/api/categories';
    const method = id ? 'PATCH' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, slug }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to save');
    }
    return res.json();
  }

  async function deleteCategory(id: string) {
    if (!confirm('Delete this category?')) return;
    const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || 'Failed to delete');
      return;
    }
    fetchCategories();
  }

  return (
    <div>
      <div className="admin-header">
        <h2 className="headline-md">Categories</h2>
        <button
          className="btn-primary"
          onClick={() => setModal({ mode: 'create' })}
        >
          Add Category
        </button>
      </div>

      {error && <p className="error-msg">{error}</p>}

      {loading ? (
        <p className="body-md">Loading...</p>
      ) : categories.length === 0 ? (
        <p className="body-md" style={{ color: 'var(--fg-muted)', marginTop: 32 }}>
          No categories yet. Create one to get started.
        </p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th className="label-sm">Name</th>
              <th className="label-sm">Slug</th>
              <th className="label-sm">Products</th>
              <th className="label-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id}>
                <td className="body-md">{cat.name}</td>
                <td className="body-md" style={{ color: 'var(--fg-muted)' }}>{cat.slug}</td>
                <td className="body-md">{cat.products?.[0]?.count ?? 0}</td>
                <td>
                  <button
                    className="btn-ghost"
                    onClick={() => setModal({ mode: 'edit', category: cat })}
                  >
                    Edit
                  </button>
                  <button
                    className="btn-ghost btn-danger"
                    onClick={() => deleteCategory(cat.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {modal && (
        <CategoryFormModal
          mode={modal.mode}
          category={modal.category}
          onClose={() => setModal(null)}
          onSaved={() => {
            setModal(null);
            fetchCategories();
          }}
          onSave={saveCategory}
        />
      )}
    </div>
  );
}

function CategoryFormModal({
  mode,
  category,
  onClose,
  onSaved,
  onSave,
}: {
  mode: 'create' | 'edit';
  category?: Category;
  onClose: () => void;
  onSaved: () => void;
  onSave: (name: string, slug: string, id?: string) => Promise<unknown>;
}) {
  const [name, setName] = useState(category?.name ?? '');
  const [slug, setSlug] = useState(category?.slug ?? '');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErr('');
    try {
      await onSave(name, slug, category?.id);
      onSaved();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="headline-md" style={{ marginBottom: 16 }}>
          {mode === 'create' ? 'Add Category' : 'Edit Category'}
        </h3>
        <form onSubmit={handleSubmit}>
          <label className="field">
            <span className="label-sm">Name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (mode === 'create') {
                  setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
                }
              }}
              required
            />
          </label>
          <label className="field">
            <span className="label-sm">Slug</span>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
            />
          </label>
          {err && <p className="error-msg">{err}</p>}
          <div className="modal-actions">
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
