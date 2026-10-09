export interface ServiceItem {
  id: string;
  name: string;
  price: number;
  rating: number;
  reviewCount: number;
  image: string;
  description: string;
  advantages: string[];
}

export interface CartItem {
  id: string;
  serviceId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export interface OrderTrackingStep {
  label: string;
  time?: string;
  completed: boolean;
  current?: boolean;
}

export interface OrderItem {
  id: string;
  orderNumber: string;
  date: string;
  serviceName: string;
  servicePrice: number;
  image: string;
  status: 'Dalam Proses' | 'Selesai' | 'Dibatalkan';
  totalAmount: number;
  address: string;
  paymentMethod: string;
  notes?: string;
  timeline: OrderTrackingStep[];
}

export const USER_PROFILE = {
  name: 'Fatir',
  email: 'fatir@example.com',
  phone: '0812 3456 7890',
  address: 'Jl. Melati No. 12, Kec. Lowokwaru, Malang, Jawa Timur',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop',
};

export const SERVICES_DATA: ServiceItem[] = [
  {
    id: 'cuci-sepatu',
    name: 'Cuci Sepatu',
    price: 25000,
    rating: 4.8,
    reviewCount: 120,
    image: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=600&h=600&fit=crop',
    description:
      'Cuci sepatu dengan metode profesional menggunakan bahan aman dan ramah lingkungan. Cocok untuk semua jenis sepatu.',
    advantages: [
      'Bersih maksimal',
      'Wangi tahan lama',
      'Aman untuk semua bahan',
      'Proses cepat',
    ],
  },
  {
    id: 'cuci-repair',
    name: 'Cuci + Repair',
    price: 45000,
    rating: 4.9,
    reviewCount: 95,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop',
    description:
      'Perawatan pembersihan menyeluruh dipadukan dengan perbaikan lem outsole, jahit rapi, dan rekondisi sol sepatu.',
    advantages: [
      'Pembersihan deep cleaning',
      'Reglue & repair sol profesional',
      'Garansi pengerjaan rapi',
      'Wangi segar tahan lama',
    ],
  },
  {
    id: 'cuci-tas',
    name: 'Cuci Tas',
    price: 35000,
    rating: 4.7,
    reviewCount: 68,
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=600&fit=crop',
    description:
      'Treatment higienis khusus tas ransel, totebag, selempang, maupun tas kulit dari noda membandel dan jamur.',
    advantages: [
      'Formula anti-bakteri & jamur',
      'Aman untuk kulit, kanvas & sintetis',
      'Treatment hardware logam',
      'Deodorizer wangi aromaterapi',
    ],
  },
  {
    id: 'deep-cleaning',
    name: 'Deep Cleaning',
    price: 40000,
    rating: 4.9,
    reviewCount: 140,
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&h=600&fit=crop',
    description:
      'Pembersihan mendalam dari outsole, midsole, upper, insole, hingga tali sepatu dengan formula khusus noda berat.',
    advantages: [
      'Mengangkat noda lumpur & minyak',
      'Pembersihan insole antibakteri',
      'Pengeringan khusus anti-yellowing',
      'Finishing wangi premium',
    ],
  },
];

export const INITIAL_CART: CartItem[] = [
  {
    id: 'cart-1',
    serviceId: 'cuci-sepatu',
    name: 'Cuci Sepatu',
    price: 25000,
    image: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=300&h=300&fit=crop',
    quantity: 1,
  },
  {
    id: 'cart-2',
    serviceId: 'cuci-repair',
    name: 'Cuci + Repair',
    price: 45000,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop',
    quantity: 1,
  },
];

export const INITIAL_ORDERS: OrderItem[] = [
  {
    id: '1',
    orderNumber: 'SF123456',
    date: '12 Jun 2025',
    serviceName: 'Cuci Sepatu',
    servicePrice: 25000,
    image: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=300&h=300&fit=crop',
    status: 'Dalam Proses',
    totalAmount: 25000,
    address: 'Jl. Melati No. 12, Kec. Lowokwaru, Malang, Jawa Timur',
    paymentMethod: 'DANA',
    notes: 'Sepatu warna putih, tolong hati-hati',
    timeline: [
      { label: 'Pesanan Diterima', time: '12 Jun 2025, 09:15', completed: true },
      { label: 'Sedang Dicuci', time: '12 Jun 2025, 10:30', completed: true, current: true },
      { label: 'Proses Pengeringan', completed: false },
      { label: 'Proses Finishing', completed: false },
      { label: 'Pesanan Selesai', completed: false },
    ],
  },
  {
    id: '2',
    orderNumber: 'SF123455',
    date: '10 Jun 2025',
    serviceName: 'Cuci + Repair',
    servicePrice: 45000,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop',
    status: 'Selesai',
    totalAmount: 45000,
    address: 'Jl. Melati No. 12, Kec. Lowokwaru, Malang, Jawa Timur',
    paymentMethod: 'Transfer Bank',
    timeline: [
      { label: 'Pesanan Diterima', time: '10 Jun 2025, 08:30', completed: true },
      { label: 'Sedang Dicuci', time: '10 Jun 2025, 11:00', completed: true },
      { label: 'Proses Pengeringan', time: '11 Jun 2025, 09:00', completed: true },
      { label: 'Proses Finishing', time: '11 Jun 2025, 14:00', completed: true },
      { label: 'Pesanan Selesai', time: '11 Jun 2025, 16:30', completed: true },
    ],
  },
  {
    id: '3',
    orderNumber: 'SF123454',
    date: '5 Jun 2025',
    serviceName: 'Cuci Tas',
    servicePrice: 35000,
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=300&h=300&fit=crop',
    status: 'Selesai',
    totalAmount: 35000,
    address: 'Jl. Melati No. 12, Kec. Lowokwaru, Malang, Jawa Timur',
    paymentMethod: 'COD (Bayar di Tempat)',
    timeline: [
      { label: 'Pesanan Diterima', completed: true },
      { label: 'Sedang Dicuci', completed: true },
      { label: 'Proses Pengeringan', completed: true },
      { label: 'Proses Finishing', completed: true },
      { label: 'Pesanan Selesai', completed: true },
    ],
  },
  {
    id: '4',
    orderNumber: 'SF123453',
    date: '1 Jun 2025',
    serviceName: 'Cuci Sepatu',
    servicePrice: 25000,
    image: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=300&h=300&fit=crop',
    status: 'Dibatalkan',
    totalAmount: 25000,
    address: 'Jl. Melati No. 12, Kec. Lowokwaru, Malang, Jawa Timur',
    paymentMethod: 'DANA',
    timeline: [
      { label: 'Pesanan Dibatalkan', time: '1 Jun 2025, 10:00', completed: true },
    ],
  },
];
