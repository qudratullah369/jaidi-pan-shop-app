import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MenuItem } from '../types';

type Cart = Record<string, number>; // id -> quantity

interface CartContextValue {
  cart: Cart;
  addItem: (id: string) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  getQuantity: (id: string) => number;
  totalItems: number;
  totalPrice: number;
  /** Call this after menu is loaded so cartItems can resolve names/prices */
  setMenuItems: (items: MenuItem[]) => void;
  cartItems: { item: MenuItem; qty: number; subtotal: number }[];
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = 'jaidi-cart-v2';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart>({});
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  // Load from AsyncStorage on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((data) => {
      if (data) {
        try {
          setCart(JSON.parse(data));
        } catch {
          setCart({});
        }
      }
    });
  }, []);

  // Persist whenever cart changes
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  const addItem = useCallback((id: string) => {
    setCart((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  }, []);

  const removeItem = useCallback((id: string) => {
    setCart((prev) => {
      const current = prev[id] || 0;
      if (current <= 1) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: current - 1 };
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart({});
  }, []);

  const getQuantity = useCallback(
    (id: string) => cart[id] || 0,
    [cart]
  );

  const totalItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0);

  const cartItems = Object.entries(cart)
    .map(([id, qty]) => {
      const item = menuItems.find((m) => m.id === id);
      if (!item) return null;
      return { item, qty, subtotal: item.price * qty };
    })
    .filter(Boolean) as { item: MenuItem; qty: number; subtotal: number }[];

  const totalPrice = cartItems.reduce((sum, c) => sum + c.subtotal, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addItem,
        removeItem,
        clearCart,
        getQuantity,
        totalItems,
        totalPrice,
        setMenuItems,
        cartItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used inside CartProvider');
  }
  return ctx;
}
