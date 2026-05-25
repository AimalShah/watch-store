import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

interface Props {
  productId: string;
  productName: string;
  price: number;
  stock: number;
  images: string[];
  description?: string;
  category?: string;
}

export function ProductDetail({ productId, productName, price, stock, images, description, category }: Props) {
  const [mainImage, setMainImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+92');
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const outOfStock = stock < 1;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !phone || !address) {
      setError('All fields are required');
      return;
    }
    if (!/^\+92\d{10}$/.test(phone.replace(/\s/g, ''))) {
      setError('Phone must be a valid Pakistani number (+92xxxxxxxxxx)');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: productId,
          quantity,
          customer_name: name,
          customer_phone: phone,
          delivery_address: address,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Order failed');
      }

      const { whatsapp_url } = await res.json();
      window.open(whatsapp_url, '_blank');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to submit order');
    } finally {
      setSubmitting(false);
    }
  }

  const displayImages = images.length > 0
    ? images
    : ['https://images.unsplash.com/photo-1614164185128-e4ec99c2c0e8?w=600&q=80'];

  return (
    <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <nav class="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
        <a href="/" class="hover:text-foreground">Home</a>
        <span>/</span>
        {category && (
          <>
            <a href="/watches" class="hover:text-foreground">{category}</a>
            <span>/</span>
          </>
        )}
        <span class="text-foreground">{productName}</span>
      </nav>

      <div class="grid gap-12 md:grid-cols-2">
        <div class="space-y-4">
          <div class="overflow-hidden rounded-xl border bg-muted">
            {displayImages[mainImage] ? (
              <img
                src={displayImages[mainImage]}
                alt={productName}
                class="h-full w-full object-cover"
              />
            ) : (
              <div class="aspect-square bg-muted" />
            )}
          </div>
          {displayImages.length > 1 && (
            <div class="flex gap-3">
              {displayImages.map((url, i) => (
                <button
                  key={i}
                  onClick={() => setMainImage(i)}
                  class={`h-16 w-16 overflow-hidden rounded-md border transition-colors ${
                    i === mainImage ? 'border-secondary' : 'border-border'
                  }`}
                >
                  <img src={url} alt="" class="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div class="space-y-6">
          <div>
            {category && (
              <p class="mb-1 text-sm font-medium uppercase tracking-widest text-muted-foreground">
                {category}
              </p>
            )}
            <h1 class="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              {productName}
            </h1>
            <p class="mt-2 font-heading text-2xl font-bold text-secondary">
              ${Number(price).toLocaleString()}
            </p>
          </div>

          {description && (
            <p class="text-muted-foreground">{description}</p>
          )}

          <div class={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${
            outOfStock ? 'bg-destructive/10 text-destructive' : 'bg-secondary/10 text-secondary'
          }`}>
            <span class={`h-1.5 w-1.5 rounded-full ${outOfStock ? 'bg-destructive' : 'bg-secondary'}`} />
            {outOfStock ? 'Out of Stock' : `In Stock (${stock})`}
          </div>

          <form onSubmit={handleSubmit} class="space-y-4">
            <div class="space-y-2">
              <Label>Quantity</Label>
              <div class="flex items-center gap-0">
                <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1}
                  class="flex h-9 w-9 items-center justify-center border border-input bg-background text-sm transition-colors hover:bg-muted disabled:opacity-50">
                  −
                </button>
                <span class="flex h-9 w-12 items-center justify-center border-y border-input text-sm font-medium">{quantity}</span>
                <button type="button" onClick={() => setQuantity(Math.min(stock, quantity + 1))} disabled={quantity >= stock}
                  class="flex h-9 w-9 items-center justify-center border border-input bg-background text-sm transition-colors hover:bg-muted disabled:opacity-50">
                  +
                </button>
              </div>
            </div>

            <div class="space-y-2">
              <Label htmlFor="customer-name">Full Name</Label>
              <Input id="customer-name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div class="space-y-2">
              <Label htmlFor="customer-phone">Phone Number</Label>
              <Input id="customer-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+923001234567" required />
            </div>

            <div class="space-y-2">
              <Label htmlFor="delivery-address">Delivery Address</Label>
              <textarea id="delivery-address" value={address} onChange={(e) => setAddress(e.target.value)} rows={3} required
                class="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-vertical" />
            </div>

            {error && <p class="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full rounded-none" disabled={outOfStock || submitting}>
              {submitting ? 'Submitting...' : 'Order via WhatsApp'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
