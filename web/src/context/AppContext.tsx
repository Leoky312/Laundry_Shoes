import React, { createContext, useContext, useState } from 'react';
import {
  USER_PROFILE,
  SERVICES_DATA,
  INITIAL_CART,
  INITIAL_ORDERS,
} from '../data/mockData';
import type {
  ServiceItem,
  CartItem,
  OrderItem,
} from '../data/mockData';

interface AppContextType {
  user: typeof USER_PROFILE;
  services: ServiceItem[];
  cart: CartItem[];
  orders: OrderItem[];
  addToCart: (service: ServiceItem, quantity?: number) => void;
  updateCartQuantity: (id: string, delta: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  createOrder: (orderData: {
    paymentMethod: string;
    notes?: string;
    items?: CartItem[];
    singleService?: { service: ServiceItem; quantity: number };
  }) => OrderItem;
  cancelOrder: (orderId: string) => void;
  deleteCancelledOrder: (orderId: string) => void;
  formatRupiah: (val: number) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user] = useState(USER_PROFILE);
  const [services] = useState<ServiceItem[]>(SERVICES_DATA);
  const [cart, setCart] = useState<CartItem[]>(INITIAL_CART);
  const [orders, setOrders] = useState<OrderItem[]>(INITIAL_ORDERS);

  const formatRupiah = (val: number) => {
    return 'Rp ' + Number(val || 0).toLocaleString('id-ID');
  };

  const addToCart = (service: ServiceItem, quantity: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.serviceId === service.id);
      if (existing) {
        return prev.map((item) =>
          item.serviceId === service.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [
        ...prev,
        {
          id: 'cart-' + Date.now(),
          serviceId: service.id,
          name: service.name,
          price: service.price,
          image: service.image,
          quantity,
        },
      ];
    });
  };

  const updateCartQuantity = (id: string, delta: number) => {
    setCart((prev) =>
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

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  const createOrder = ({
    paymentMethod,
    notes,
    items,
    singleService,
  }: {
    paymentMethod: string;
    notes?: string;
    items?: CartItem[];
    singleService?: { service: ServiceItem; quantity: number };
  }) => {
    const orderNum = 'SF' + Math.floor(100000 + Math.random() * 900000);
    const orderItems = items && items.length > 0 ? items : cart;

    let serviceName = 'Cuci Sepatu';
    let servicePrice = 25000;
    let image = 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=300&h=300&fit=crop';
    let total = 35000;

    if (singleService) {
      serviceName = singleService.service.name;
      servicePrice = singleService.service.price;
      image = singleService.service.image;
      total = singleService.service.price * singleService.quantity + 10000;
    } else if (orderItems.length > 0) {
      serviceName = orderItems[0].name;
      servicePrice = orderItems[0].price;
      image = orderItems[0].image;
      const subtotal = orderItems.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);
      total = subtotal + 10000; // delivery fee
    }

    const now = new Date();
    const dateFormatted = `${now.getDate()} ${now.toLocaleString('id-ID', { month: 'short' })} ${now.getFullYear()}`;
    const timeFormatted = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const newOrder: OrderItem = {
      id: String(Date.now()),
      orderNumber: orderNum,
      date: dateFormatted,
      serviceName,
      servicePrice,
      image,
      status: 'Dalam Proses',
      totalAmount: total,
      address: user.address,
      paymentMethod,
      notes: notes || 'Sepatu warna putih, tolong hati-hati',
      timeline: [
        { label: 'Pesanan Diterima', time: `${dateFormatted}, ${timeFormatted}`, completed: true },
        { label: 'Sedang Dicuci', time: `${dateFormatted}, ${timeFormatted}`, completed: true, current: true },
        { label: 'Proses Pengeringan', completed: false },
        { label: 'Proses Finishing', completed: false },
        { label: 'Pesanan Selesai', completed: false },
      ],
    };

    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
    return newOrder;
  };

  const cancelOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId || order.orderNumber === orderId
          ? {
              ...order,
              status: 'Dibatalkan',
              timeline: [
                {
                  label: 'Pesanan Dibatalkan',
                  time: 'Hari ini',
                  completed: true,
                },
              ],
            }
          : order
      )
    );
  };

  const deleteCancelledOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.filter(
        (order) =>
          !(
            (order.id === orderId || order.orderNumber === orderId) &&
            order.status === 'Dibatalkan'
          )
      )
    );
  };

  return (
    <AppContext.Provider
      value={{
        user,
        services,
        cart,
        orders,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        createOrder,
        cancelOrder,
        deleteCancelledOrder,
        formatRupiah,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
