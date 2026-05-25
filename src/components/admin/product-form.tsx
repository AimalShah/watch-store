import { useState, useEffect } from 'react';
import imageCompression from 'browser-image-compression';
import { supabase } from '../../lib/supabase-browser';

interface Category {
  id: string;
  name: string;
}

interface ProductData {
  name: string;
  slug: string;
  description: string;
  price: string;
  stock: string;
  category_id: string;
  featured: boolean;
  images: string[];
}

interface Props {
  initial?: ProductData;
  onSave: (data: ProductData) => Promise<void>;
}

export function ProductForm({ initial, onSave }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState(initial?.name ?? '');
  const [slug, setSlug] = useState(initial?.slug ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [price, setPrice] = useState(initial?.price ?? '');
  const [stock, setStock] = useState(initial?.stock ?? '');
  const [categoryId, setCategoryId] = useState(initial?.category_id ?? '');
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [images, setImages] = useState<string[]>(initial?.images ?? []);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then(setCategories)
      .catch(() => {});
  }, []);

  function handleNameChange(val: string) {
    setName(val);
    if (!initial || !initial.slug) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 3) {
      setError('Maximum 3 images');
      return;
    }
    setUploading(true);
    setError('');
    try {
      for (const file of files) {
        const compressed = await imageCompression(file, {
          maxWidthOrHeight: 1200,
          quality: 0.8,
        });
        const formData = new FormData();
        formData.append('file', compressed);
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Upload failed');
        }
        const { url } = await res.json();
        setImages((prev) => [...prev, url]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  function removeImage(idx: number) {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await onSave({ name, slug, description, price, stock, category_id: categoryId, featured, images });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-grid">
        <label className="field">
          <span className="label-sm">Name *</span>
          <input type="text" value={name} onChange={(e) => handleNameChange(e.target.value)} required />
        </label>
        <label className="field">
          <span className="label-sm">Slug</span>
          <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} />
        </label>
        <label className="field full">
          <span className="label-sm">Description</span>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
        </label>
        <label className="field">
          <span className="label-sm">Price *</span>
          <input type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} required />
        </label>
        <label className="field">
          <span className="label-sm">Stock</span>
          <input type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} />
        </label>
        <label className="field">
          <span className="label-sm">Category</span>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">None</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>
        <label className="field checkbox">
          <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
          <span className="label-sm">Featured</span>
        </label>
      </div>

      <div className="field full" style={{ marginTop: 16 }}>
        <span className="label-sm">Images (max 3)</span>
        <div className="image-list">
          {images.map((url, i) => (
            <div key={i} className="image-preview">
              <img src={url} alt="" />
              <button type="button" className="remove-img" onClick={() => removeImage(i)}>×</button>
            </div>
          ))}
          {images.length < 3 && (
            <label className="image-upload">
              <input type="file" accept="image/*" onChange={handleImageUpload} hidden />
              <span className="label-sm">{uploading ? 'Uploading...' : '+ Add Image'}</span>
            </label>
          )}
        </div>
      </div>

      {error && <p className="error-msg" style={{ marginTop: 16 }}>{error}</p>}

      <div className="form-actions">
        <a href="/admin/products" className="btn-ghost">Cancel</a>
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Saving...' : initial ? 'Update Product' : 'Create Product'}
        </button>
      </div>
    </form>
  );
}
