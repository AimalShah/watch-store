import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore } from './cart';

const mockProduct = {
  productId: 'prod-1',
  name: 'Rolex Submariner Date',
  slug: 'rolex-submariner-date',
  price: 10500,
  image: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=600&q=80',
};

describe('cart store', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [] });
  });

  it('starts empty', () => {
    const { items, itemCount, total } = useCartStore.getState();
    expect(items).toEqual([]);
    expect(itemCount).toBe(0);
    expect(total).toBe(0);
  });

  it('adds an item and updates count and total', () => {
    useCartStore.getState().addItem(mockProduct);
    const { items, itemCount, total } = useCartStore.getState();
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(1);
    expect(itemCount).toBe(1);
    expect(total).toBe(10500);
  });

  it('increments quantity when adding same product twice', () => {
    useCartStore.getState().addItem(mockProduct);
    useCartStore.getState().addItem(mockProduct);
    const { items, itemCount, total } = useCartStore.getState();
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(2);
    expect(itemCount).toBe(2);
    expect(total).toBe(21000);
  });

  it('adds item with specified quantity', () => {
    useCartStore.getState().addItem(mockProduct, 3);
    const { items, itemCount } = useCartStore.getState();
    expect(items[0].quantity).toBe(3);
    expect(itemCount).toBe(3);
  });

  it('removes an item by productId', () => {
    useCartStore.getState().addItem(mockProduct);
    useCartStore.getState().addItem({ ...mockProduct, productId: 'prod-2', name: 'Rolex Daytona', price: 28500 });
    useCartStore.getState().removeItem('prod-1');
    const { items } = useCartStore.getState();
    expect(items).toHaveLength(1);
    expect(items[0].productId).toBe('prod-2');
  });

  it('updates quantity (clamped to min 1)', () => {
    useCartStore.getState().addItem(mockProduct);
    useCartStore.getState().updateQuantity('prod-1', 5);
    expect(useCartStore.getState().items[0].quantity).toBe(5);
    useCartStore.getState().updateQuantity('prod-1', 0);
    expect(useCartStore.getState().items[0].quantity).toBe(1);
  });

  it('calculates total across multiple items', () => {
    useCartStore.getState().addItem(mockProduct);
    useCartStore.getState().addItem({ ...mockProduct, productId: 'prod-2', name: 'Rolex Daytona', price: 28500 });
    useCartStore.getState().updateQuantity('prod-1', 2);
    const { total } = useCartStore.getState();
    expect(total).toBe(21000 + 28500);
  });

  it('clears all items', () => {
    useCartStore.getState().addItem(mockProduct);
    useCartStore.getState().clearCart();
    const { items, itemCount, total } = useCartStore.getState();
    expect(items).toEqual([]);
    expect(itemCount).toBe(0);
    expect(total).toBe(0);
  });
});
