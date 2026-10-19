import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ServiceItem {
  id: number;
  name: string;
  description?: string;
  duration?: string;
  price: string | number;
  image?: string;
}

export interface CartItem {
  id: string;
  service: ServiceItem;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (service: ServiceItem, quantity: number) => void;
  updateQuantity: (itemId: string, change: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  getSubtotal: () => number;
}

const CartContext = createContext<CartContextType>({} as CartContextType);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const storedCart = await AsyncStorage.getItem('@shoefresh_cart');
      if (storedCart) {
        setCart(JSON.parse(storedCart));
      }
    } catch (e) {
      console.log('Failed to load cart', e);
    }
  };

  const saveCart = async (newCart: CartItem[]) => {
    try {
      setCart(newCart);
      await AsyncStorage.setItem('@shoefresh_cart', JSON.stringify(newCart));
    } catch (e) {
      console.log('Failed to save cart', e);
    }
  };

  const addToCart = (service: ServiceItem, quantity: number) => {
    const existingIndex = cart.findIndex((item) => item.service.id === service.id);
    let newCart = [...cart];
    if (existingIndex >= 0) {
      newCart[existingIndex].quantity += quantity;
    } else {
      newCart.push({ service, quantity, id: Date.now().toString() });
    }
    saveCart(newCart);
  };

  const updateQuantity = (itemId: string, change: number) => {
    let newCart = [...cart];
    const index = newCart.findIndex((item) => item.id === itemId);
    if (index >= 0) {
      const newQty = newCart[index].quantity + change;
      if (newQty > 0) {
        newCart[index].quantity = newQty;
      }
    }
    saveCart(newCart);
  };

  const removeFromCart = (itemId: string) => {
    const newCart = cart.filter((item) => item.id !== itemId);
    saveCart(newCart);
  };

  const clearCart = () => {
    saveCart([]);
  };

  const getSubtotal = () => {
    return cart.reduce((total, item) => {
      const price = item.service.price ? parseFloat(String(item.service.price)) : 25000;
      return total + price * item.quantity;
    }, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getSubtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
export default CartContext;
