import { useCartStore } from '../stores/cart';
import { Button } from '../components/ui/button';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useEffect, useState } from 'react';

function CartItem({ item }: { item: ReturnType<typeof useCartStore.getState>['items'][number] }) {
  const { updateQuantity, removeItem } = useCartStore();

  return (
    <div className="flex gap-4 py-4 border-b">
      <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-md" />
      <div className="flex-1 min-w-0">
        <a href={`/watch/${item.slug}`} className="font-medium text-sm hover:underline line-clamp-2">
          {item.name}
        </a>
        <p className="text-sm text-muted-foreground mt-1">Rs{item.price.toLocaleString()}</p>
        <div className="flex items-center gap-2 mt-2">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.productId, item.quantity - 1)}>
            <Minus className="h-3 w-3" />
          </Button>
          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.productId, item.quantity + 1)}>
            <Plus className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 ml-2 text-destructive" onClick={() => removeItem(item.productId)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="font-medium">Rs{(item.price * item.quantity).toLocaleString()}</p>
      </div>
    </div>
  );
}

export function CartPage() {
  const { items, total, itemCount } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6 text-center">
          <ShoppingBag className="h-16 w-16 text-muted-foreground" />
          <h1 className="font-heading text-3xl font-bold tracking-tight">Your cart is empty</h1>
          <p className="text-muted-foreground">Looks like you have not added any watches yet.</p>
          <a href="/watches">
            <Button>Browse Watches</Button>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-heading text-3xl font-bold tracking-tight mb-8">Shopping Cart</h1>
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div>
          <p className="text-sm text-muted-foreground mb-4">{itemCount} {itemCount === 1 ? 'item' : 'items'}</p>
          {items.map((item) => <CartItem key={item.productId} item={item} />)}
        </div>
        <div className="lg:sticky lg:top-24 h-fit rounded-lg border p-6 space-y-4">
          <h2 className="font-heading text-lg font-bold tracking-tight">Order Summary</h2>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
            <span className="font-medium">Rs{total.toLocaleString()}</span>
          </div>
          <div className="border-t pt-4 flex justify-between">
            <span className="font-medium">Total</span>
            <span className="font-heading text-xl font-bold">Rs{total.toLocaleString()}</span>
          </div>
          <a href="/checkout" className="block">
            <Button className="w-full">Proceed to Checkout</Button>
          </a>
          <a href="/watches" className="block">
            <Button variant="outline" className="w-full">Continue Shopping</Button>
          </a>
        </div>
      </div>
    </div>
  );
}
