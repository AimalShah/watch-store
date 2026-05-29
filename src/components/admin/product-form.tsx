import { useState, useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AdminSidebar } from './sidebar';
import { makeQueryClient } from '@/lib/query-client';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductFormProps {
  product?: {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    stock: number;
    category_id: string | null;
    featured: boolean;
    images: string[];
  };
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

async function compressImage(file: File): Promise<File> {
  const imageCompression = (await import('browser-image-compression')).default;
  return imageCompression(file, {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  });
}

async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch('/api/upload', { method: 'POST', body: formData });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Upload failed');
  }
  const data = await res.json();
  return data.url;
}

function ProductFormInner({ product }: ProductFormProps) {
  const isEdit = !!product;

  const [name, setName] = useState(product?.name ?? '');
  const [slug, setSlug] = useState(product?.slug ?? '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [price, setPrice] = useState(product?.price?.toString() ?? '');
  const [stock, setStock] = useState(product?.stock?.toString() ?? '0');
  const [categoryId, setCategoryId] = useState(product?.category_id ?? '');
  const [featured, setFeatured] = useState(product?.featured ?? false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>(product?.images ?? []);
  const [uploading, setUploading] = useState(false);

  const { data: categories = [] } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const res = await fetch('/api/categories');
      return res.json() as Promise<Category[]>;
    },
  });

  useEffect(() => {
    if (!isEdit && !name) return;
    if (!isEdit) setSlug(slugify(name));
  }, [name, isEdit]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !price) {
      toast.error('Name and price are required');
      return;
    }

    if (existingImages.length + imageFiles.length === 0) {
      toast.error('At least one image is required');
      return;
    }

    let allImages = [...existingImages];

    if (imageFiles.length > 0) {
      setUploading(true);
      try {
        const compressed = await Promise.all(imageFiles.map(compressImage));
        const urls = await Promise.all(compressed.map(uploadImage));
        allImages = [...allImages, ...urls];
      } catch (err) {
        toast.error('Image upload failed');
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    const payload = {
      name: name.trim(),
      slug: slug.trim() || slugify(name.trim()),
      description: description.trim(),
      price: parseFloat(price),
      stock: parseInt(stock) || 0,
      category_id: categoryId || null,
      featured,
      images: allImages,
    };

    try {
      const res = await fetch(isEdit ? `/api/products/${product.id}` : '/api/products', {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save');
      }
      toast.success(isEdit ? 'Product updated' : 'Product created');
      window.location.href = '/admin/products';
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save');
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const total = existingImages.length + imageFiles.length + files.length;
    if (total > 3) {
      toast.error('Maximum 3 images allowed');
      return;
    }
    setImageFiles((prev) => [...prev, ...files]);
    e.target.value = '';
  }

  function removeNewImage(index: number) {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function removeExistingImage(index: number) {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 pt-14 md:pt-0 p-6 md:p-8">
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <a href="/admin/products"><ArrowLeft className="mr-1 h-4 w-4" /> Back to Products</a>
          </Button>
          <h2 className="font-heading text-2xl font-bold tracking-tight">
            {isEdit ? 'Edit Product' : 'Add Product'}
          </h2>
        </div>

        <Card className="max-w-2xl">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1">
                <Label htmlFor="name">Name *</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Rolex Submariner Date" required />
              </div>

              <div className="space-y-1">
                <Label htmlFor="slug">Slug</Label>
                <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="auto-generated" />
              </div>

              <div className="space-y-1">
                <Label htmlFor="desc">Description</Label>
                <textarea
                  id="desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Product description..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="price">Price (PKR) *</Label>
                  <Input id="price" type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="stock">Stock</Label>
                  <Input id="stock" type="number" min="0" step="1" value={stock} onChange={(e) => setStock(e.target.value)} />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">No category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="h-4 w-4 rounded border-gray-300" />
                <span className="text-sm font-medium">Featured product</span>
              </label>

              <div className="space-y-2">
                <Label>Images (max 3)</Label>
                <div className="flex flex-wrap gap-3">
                  {existingImages.map((url, i) => (
                    <div key={`e-${i}`} className="relative h-24 w-24">
                      <img src={url} alt="" className="h-full w-full rounded object-cover" />
                      <button type="button" onClick={() => removeExistingImage(i)} className="absolute -right-2 -top-2 rounded-full bg-destructive p-0.5 text-white">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {imageFiles.map((file, i) => (
                    <div key={`n-${i}`} className="relative h-24 w-24">
                      <img src={URL.createObjectURL(file)} alt="" className="h-full w-full rounded object-cover" />
                      <button type="button" onClick={() => removeNewImage(i)} className="absolute -right-2 -top-2 rounded-full bg-destructive p-0.5 text-white">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {existingImages.length + imageFiles.length < 3 && (
                    <label className="flex h-24 w-24 cursor-pointer items-center justify-center rounded border-2 border-dashed border-input hover:border-muted-foreground">
                      <Upload className="h-5 w-5 text-muted-foreground" />
                      <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </label>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" asChild>
                  <a href="/admin/products">Cancel</a>
                </Button>
                <Button type="submit" disabled={uploading}>
                  {uploading ? 'Uploading images...' : isEdit ? 'Update Product' : 'Create Product'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export function ProductForm(props: ProductFormProps) {
  const [qc] = useState(() => makeQueryClient());
  return (
    <QueryClientProvider client={qc}>
      <ProductFormInner {...props} />
    </QueryClientProvider>
  );
}
