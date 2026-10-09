export type OrderStatus = 'DALAM_PROSES' | 'SELESAI' | 'DIBATALKAN';

export interface Service {
  readonly id: string;
  name: string;
  price: number;
  priceFormatted: string;
  rating?: number;
  reviewCount?: number;
  description?: string;
  features?: string[];
  image: any;
}

export interface CartItem {
  readonly id: string;
  serviceId: string;
  name: string;
  price: number;
  priceFormatted: string;
  quantity: number;
  image: any;
}

export interface TimelineStep {
  readonly id: string;
  title: string;
  time?: string;
  completed: boolean;
  current?: boolean;
}

export interface Order {
  readonly id: string;
  orderNumber: string;
  date: string;
  serviceName: string;
  status: OrderStatus;
  price: number;
  priceFormatted: string;
  image: any;
  timeline?: TimelineStep[];
}

export interface MenuItem {
  readonly id: string;
  title: string;
  icon: string;
  route?: string;
  isDanger?: boolean;
}

export interface QuickAction {
  readonly id: string;
  title: string;
  icon: string;
  route: string;
}

export interface PaymentOption {
  readonly id: string;
  name: string;
  icon: string;
  isCustomIcon?: boolean;
}

export const SERVICES_DATA: Service[] = [
  {
    id: '1',
    name: 'Cuci Sepatu',
    price: 25000,
    priceFormatted: 'Rp 25.000',
    rating: 4.8,
    reviewCount: 120,
    description:
      'Cuci sepatu dengan metode profesional menggunakan bahan aman dan ramah lingkungan. Cocok untuk semua jenis sepatu.',
    features: [
      'Bersih maksimal',
      'Wangi tahan lama',
      'Aman untuk semua bahan',
      'Proses cepat',
    ],
    image: require('../../assets/images/shoe-1.png'),
  },
  {
    id: '2',
    name: 'Cuci + Repair',
    price: 45000,
    priceFormatted: 'Rp 45.000',
    rating: 4.9,
    reviewCount: 85,
    description:
      'Perawatan mendalam mencakup deep cleaning serta perbaikan lem dan jahit sol sepatu standar industri.',
    features: [
      'Bersih maksimal',
      'Wangi tahan lama',
      'Aman untuk semua bahan',
      'Proses cepat',
    ],
    image: require('../../assets/images/shoe-2.png'),
  },
  {
    id: '3',
    name: 'Deep Clean Sepatu',
    price: 35000,
    priceFormatted: 'Rp 35.000',
    rating: 4.8,
    reviewCount: 94,
    description:
      'Pembersihan total menyeluruh dari upper, insole, midsole hingga outsole terdalam dengan cairan antibakteri.',
    features: [
      'Bersih maksimal',
      'Wangi tahan lama',
      'Aman untuk semua bahan',
      'Proses cepat',
    ],
    image: require('../../assets/images/shoe-1.png'),
  },
  {
    id: '4',
    name: 'Unyellowing & Whitening',
    price: 40000,
    priceFormatted: 'Rp 40.000',
    rating: 4.9,
    reviewCount: 76,
    description:
      'Treatment khusus penghilang noda kuning pada midsole dan outsole sepatu agar kembali cerah seperti baru.',
    features: [
      'Bersih maksimal',
      'Wangi tahan lama',
      'Aman untuk semua bahan',
      'Proses cepat',
    ],
    image: require('../../assets/images/shoe-2.png'),
  },
  {
    id: '5',
    name: 'Repaint & Recoloring',
    price: 60000,
    priceFormatted: 'Rp 60.000',
    rating: 4.9,
    reviewCount: 52,
    description:
      'Pewarnaan ulang sepatu canvas, suede, atau leather yang pudar menggunakan cat premium standar pabrik.',
    features: [
      'Bersih maksimal',
      'Wangi tahan lama',
      'Aman untuk semua bahan',
      'Proses cepat',
    ],
    image: require('../../assets/images/shoe-1.png'),
  },
];

export const ORDERS_DATA: Order[] = [
  {
    id: 'SF123456',
    orderNumber: '#SF123456',
    date: '12 Jun 2025',
    serviceName: 'Cuci Sepatu',
    status: 'DALAM_PROSES',
    price: 25000,
    priceFormatted: 'Rp 25.000',
    image: require('../../assets/images/shoe-1.png'),
  },
  {
    id: 'SF123455',
    orderNumber: '#SF123455',
    date: '10 Jun 2025',
    serviceName: 'Cuci + Repair',
    status: 'SELESAI',
    price: 45000,
    priceFormatted: 'Rp 45.000',
    image: require('../../assets/images/shoe-2.png'),
  },
  {
    id: 'SF123454',
    orderNumber: '#SF123454',
    date: '5 Jun 2025',
    serviceName: 'Cuci Sepatu Premium',
    status: 'SELESAI',
    price: 35000,
    priceFormatted: 'Rp 35.000',
    image: require('../../assets/images/shoe-1.png'),
  },
  {
    id: 'SF123453',
    orderNumber: '#SF123453',
    date: '1 Jun 2025',
    serviceName: 'Cuci Sepatu',
    status: 'DIBATALKAN',
    price: 25000,
    priceFormatted: 'Rp 25.000',
    image: require('../../assets/images/shoe-1.png'),
  },
];

export const TIMELINE_STEPS: TimelineStep[] = [
  {
    id: 't1',
    title: 'Pesanan Diterima',
    time: '12 Jun 2025, 09:15',
    completed: true,
  },
  {
    id: 't2',
    title: 'Sedang Dicuci',
    time: '12 Jun 2025, 10:30',
    completed: true,
    current: true,
  },
  {
    id: 't3',
    title: 'Proses Pengeringan',
    completed: false,
  },
  {
    id: 't4',
    title: 'Proses Finishing',
    completed: false,
  },
  {
    id: 't5',
    title: 'Pesanan Selesai',
    completed: false,
  },
];

export const PROFILE_MENU_ITEMS: MenuItem[] = [
  { id: 'm1', title: 'Alamat Saya', icon: 'location-outline' },
  { id: 'm2', title: 'Metode Pembayaran', icon: 'card-outline' },
  { id: 'm3', title: 'Riwayat Pesanan', icon: 'receipt-outline', route: '/(tabs)/orders' },
  { id: 'm4', title: 'Bantuan & FAQ', icon: 'help-circle-outline' },
  { id: 'm5', title: 'Tentang Kami', icon: 'information-circle-outline' },
];

export const QUICK_ACTIONS: QuickAction[] = [
  { id: 'qa1', title: 'Pesan\nLayanan', icon: 'calendar-outline', route: '/service/1' },
  { id: 'qa2', title: 'Cek Status\nPesanan', icon: 'time-outline', route: '/order/SF123456' },
  { id: 'qa3', title: 'Riwayat\nPesanan', icon: 'receipt-outline', route: '/(tabs)/orders' },
];

export const PAYMENT_METHODS: PaymentOption[] = [
  { id: 'dana', name: 'DANA', icon: 'videocam', isCustomIcon: true },
  { id: 'bank', name: 'Transfer Bank', icon: 'business-outline' },
  { id: 'cod', name: 'COD (Bayar di Tempat)', icon: 'cash-outline' },
];

export const INITIAL_CART_ITEMS: CartItem[] = [
  {
    id: 'c1',
    serviceId: '1',
    name: 'Cuci Sepatu',
    price: 25000,
    priceFormatted: 'Rp 25.000',
    quantity: 1,
    image: require('../../assets/images/shoe-1.png'),
  },
  {
    id: 'c2',
    serviceId: '2',
    name: 'Cuci + Repair',
    price: 45000,
    priceFormatted: 'Rp 45.000',
    quantity: 1,
    image: require('../../assets/images/shoe-2.png'),
  },
];
