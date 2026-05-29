import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/stores/cart';
import { ShoppingBag, Check, Minus, Plus } from 'lucide-react';

interface Props {
  productId: string;
  productName: string;
  slug: string;
  price: number;
  stock: number;
  images: string[];
  description?: string;
  category?: string;
}

export function ProductDetail({ productId, productName, slug, price, stock, images, description, category }: Props) {
  const [mainImage, setMainImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((s) => s.addItem);

  const outOfStock = stock < 1;

  function handleAddToCart() {
    addItem({
      productId,
      name: productName,
      slug,
      price,
      image: images[0] || '',
    }, quantity);
    toast(`${productName} added to cart`, {
      description: `Quantity: ${quantity} — Rs${(price * quantity).toLocaleString()}`,
      action: {
        label: 'View Cart',
        onClick: () => window.location.href = '/cart',
      },
    });
    setQuantity(1);
  }

  const displayImages = images.length > 0
    ? images
    : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80'];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <nav className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
        <a href="/" className="hover:text-foreground">Home</a>
        <span>/</span>
        {category && (
          <>
            <span className="hover:text-foreground">{category}</span>
            <span>/</span>
          </>
        )}
        <span className="text-foreground">{productName}</span>
      </nav>

      <div className="grid gap-12 md:grid-cols-2">
        <div className="space-y-4">
          <div className="overflow-hidden rounded-xl border bg-muted">
            {displayImages[mainImage] ? (
              <img
                src={displayImages[mainImage]}
                alt={productName}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="aspect-square bg-muted" />
            )}
          </div>
          {displayImages.length > 1 && (
            <div className="flex gap-3">
              {displayImages.map((url, i) => (
                <button
                  key={i}
                  onClick={() => setMainImage(i)}
                  className={`h-16 w-16 overflow-hidden rounded-md border transition-colors ${
                    i === mainImage ? 'border-secondary' : 'border-border'
                  }`}
                >
                  <img src={url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            {category && (
              <p className="mb-1 text-sm font-medium uppercase tracking-widest text-muted-foreground">
                {category}
              </p>
            )}
            <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              {productName}
            </h1>
            <p className="mt-2 font-heading text-2xl font-bold text-secondary">
              Rs{Number(price).toLocaleString()}
            </p>
          </div>

          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}

          <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${
            outOfStock ? 'bg-destructive/10 text-destructive' : stock < 5 ? 'bg-amber/10 text-amber' : 'bg-secondary/10 text-secondary'
          }`}>
            <span className={`h-1.5 w-1.5 rounded-full ${outOfStock ? 'bg-destructive' : stock < 5 ? 'bg-amber' : 'bg-secondary'}`} />
            {outOfStock ? 'Out of Stock' : stock < 5 ? `Low Stock (${stock})` : `In Stock (${stock})`}
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-0">
              <span className="mr-3 text-sm font-medium">Quantity</span>
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="flex h-10 w-10 items-center justify-center border border-input bg-background text-sm transition-colors hover:bg-muted disabled:opacity-50"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="flex h-10 w-12 items-center justify-center border-y border-input text-sm font-medium tabular-nums">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                disabled={quantity >= stock}
                className="flex h-10 w-10 items-center justify-center border border-input bg-background text-sm transition-colors hover:bg-muted disabled:opacity-50"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>

            <Button
              className="w-full gap-2"
              size="lg"
              disabled={outOfStock}
              onClick={handleAddToCart}
            >
              <ShoppingBag className="h-4 w-4" />
              {outOfStock ? 'Out of Stock' : 'Add to Cart'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
