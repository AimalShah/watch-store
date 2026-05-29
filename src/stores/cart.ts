import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
  addItem: (product: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

const computeTotal = (items: CartItem[]) =>
  items.reduce((sum, item) => sum + item.price * item.quantity, 0);

const computeItemCount = (items: CartItem[]) =>
  items.reduce((sum, item) => sum + item.quantity, 0);

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      total: 0,
      itemCount: 0,

      addItem: (product, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.productId === product.productId);
          if (existing) {
            const updated = state.items.map((i) =>
              i.productId === product.productId
                ? { ...i, quantity: i.quantity + quantity }
                : i,
            );
            return { items: updated, total: computeTotal(updated), itemCount: computeItemCount(updated) };
          }
          const updated = [...state.items, { ...product, quantity }];
          return { items: updated, total: computeTotal(updated), itemCount: computeItemCount(updated) };
        }),

      removeItem: (productId) =>
        set((state) => {
          const updated = state.items.filter((i) => i.productId !== productId);
          return { items: updated, total: computeTotal(updated), itemCount: computeItemCount(updated) };
        }),

      updateQuantity: (productId, quantity) =>
        set((state) => {
          const clamped = Math.max(1, quantity);
          const updated = state.items.map((i) =>
            i.productId === productId ? { ...i, quantity: clamped } : i,
          );
          return { items: updated, total: computeTotal(updated), itemCount: computeItemCount(updated) };
        }),

      clearCart: () => set({ items: [], total: 0, itemCount: 0 }),
    }),
    {
      name: 'az-cart',
      partialize: (state) => ({ items: state.items }),
      merge: (persisted, current) => {
        const items = (persisted as { items: CartItem[] }).items || [];
        return {
          ...current,
          items,
          total: computeTotal(items),
          itemCount: computeItemCount(items),
        };
      },
    },
  ),
);
