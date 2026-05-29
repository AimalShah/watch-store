import { useCartStore } from '../stores/cart';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { ShoppingBag, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

interface CheckoutForm {
  name: string;
  phone: string;
  address: string;
}

export function CheckoutPage() {
  const { items, total, itemCount, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<CheckoutForm>({
    defaultValues: { name: '', phone: '', address: '' },
  });

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6 text-center">
          <ShoppingBag className="h-16 w-16 text-muted-foreground" />
          <h1 className="font-heading text-3xl font-bold tracking-tight">Nothing to checkout</h1>
          <p className="text-muted-foreground">Your cart is empty. Add some watches first.</p>
          <a href="/watches">
            <Button>Browse Watches</Button>
          </a>
        </div>
      </div>
    );
  }

  const onSubmit = async (data: CheckoutForm) => {
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
          customer: {
            name: data.name.trim(),
            phone: data.phone.trim(),
            address: data.address.trim(),
          },
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || 'Something went wrong');
        setSubmitting(false);
        return;
      }

      clearCart();
      window.location.href = json.whatsapp_url;
    } catch {
      setError('Failed to submit order. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-heading text-3xl font-bold tracking-tight mb-8">Checkout</h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="rounded-lg border p-6 space-y-4">
            <h2 className="font-heading text-lg font-bold tracking-tight">Your Details</h2>

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="e.g. John Doe" {...register('name', { required: 'Full name is required' })} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">WhatsApp Number</Label>
              <Input id="phone" placeholder="+92 300 1234567" {...register('phone', {
                required: 'Phone number is required',
                pattern: { value: /^\+92\d{10}$/, message: 'Must be a valid +92 number (e.g. +923001234567)' },
              })}
                onChange={(e) => {
                  const val = e.target.value;
                  if (!val.startsWith('+92')) {
                    setValue('phone', '+92' + val.replace(/^\+92/, ''));
                  } else {
                    setValue('phone', val.replace(/[^\d+]/g, ''));
                  }
                }}
              />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
              <p className="text-xs text-muted-foreground">We will send order confirmation to this WhatsApp number</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Delivery Address</Label>
              <textarea
                id="address"
                rows={3}
                placeholder="e.g. House 12, Street 5, Main Boulevard, Lahore"
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                {...register('address', { required: 'Delivery address is required' })}
              />
              {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {submitting ? 'Submitting Order...' : `Place Order — Rs${total.toLocaleString()}`}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            We will confirm your order via WhatsApp before processing.
          </p>
        </form>

        <div className="lg:sticky lg:top-24 h-fit rounded-lg border p-6 space-y-4">
          <h2 className="font-heading text-lg font-bold tracking-tight">Order Summary</h2>
          <div className="divide-y">
            {items.map((item) => (
              <div key={item.productId} className="flex gap-3 py-3">
                <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-md shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                  <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                  <p className="text-sm font-medium">Rs{(item.price * item.quantity).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t pt-4 flex justify-between items-center">
            <span className="font-medium">Total</span>
            <span className="font-heading text-xl font-bold">Rs{total.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
