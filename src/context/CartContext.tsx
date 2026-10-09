import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CartItem, INITIAL_CART_ITEMS, Service } from '../constants/data';

interface CartContextType {
  items: CartItem[];
  addToCart: (service: Service, quantity?: number) => void;
  updateQuantity: (id: string, delta: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  subtotal: number;
  deliveryFee: number;
  total: number;
  formatRupiah: (val: number) => string;
}

const CartContext = createContext<CartContextType>({} as CartContextType);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(INITIAL_CART_ITEMS);
  const deliveryFee = 10000;

  const formatRupiah = (val: number) => {
    return 'Rp ' + val.toLocaleString('id-ID');
  };

  const addToCart = (service: Service, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.serviceId === service.id);
      if (existing) {
        return prev.map((item) =>
          item.serviceId === service.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      const newItem: CartItem = {
        id: 'cart_' + Date.now(),
        serviceId: service.id,
        name: service.name,
        price: service.price,
        priceFormatted: service.priceFormatted,
        quantity,
        image: service.image,
      };
      return [...prev, newItem];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setItems([]);
  };

  const subtotal = items.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);
  const total = subtotal > 0 ? subtotal + deliveryFee : 0;

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        subtotal,
        deliveryFee: subtotal > 0 ? deliveryFee : 0,
        total,
        formatRupiah,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

export default CartContext;
