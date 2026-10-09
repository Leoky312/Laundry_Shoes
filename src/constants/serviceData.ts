export const ORDER_STATUS = Object.freeze({
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  DRYING: 'DRYING',
  FINISHING: 'FINISHING',
  READY: 'READY',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
});

export const PAYMENT_METHOD = Object.freeze({
  TRANSFER_BANK: 'TRANSFER_BANK',
  QRIS: 'QRIS',
  CASH: 'CASH',
});

export const paymentMethods = [
  {
    id: PAYMENT_METHOD.TRANSFER_BANK,
    label: 'Transfer Bank (BCA/Mandiri/BRI)',
    icon: 'card-outline',
  },
  {
    id: PAYMENT_METHOD.QRIS,
    label: 'QRIS (GoPay, OVO, ShopeePay)',
    icon: 'qr-code-outline',
  },
  {
    id: PAYMENT_METHOD.CASH,
    label: 'Bayar Tunai di Tempat (COD)',
    icon: 'cash-outline',
  },
];

export const orderStatusConfig = [
  {
    status: ORDER_STATUS.PENDING,
    label: 'Menunggu',
    color: '#D97706',
    bgColor: '#FEF3C7',
    icon: 'time-outline',
  },
  {
    status: ORDER_STATUS.PROCESSING,
    label: 'Diproses',
    color: '#2563EB',
    bgColor: '#DBEAFE',
    icon: 'refresh-outline',
  },
  {
    status: ORDER_STATUS.DRYING,
    label: 'Pengeringan',
    color: '#0EA5E9',
    bgColor: '#E0F2FE',
    icon: 'sunny-outline',
  },
  {
    status: ORDER_STATUS.FINISHING,
    label: 'Finishing',
    color: '#7C3AED',
    bgColor: '#EDE9FE',
    icon: 'sparkles-outline',
  },
  {
    status: ORDER_STATUS.READY,
    label: 'Siap Diambil',
    color: '#059669',
    bgColor: '#D1FAE5',
    icon: 'checkmark-circle-outline',
  },
  {
    status: ORDER_STATUS.DELIVERED,
    label: 'Selesai',
    color: '#10B981',
    bgColor: '#D1FAE5',
    icon: 'checkmark-done-outline',
  },
  {
    status: ORDER_STATUS.CANCELLED,
    label: 'Dibatalkan',
    color: '#EF4444',
    bgColor: '#FEE2E2',
    icon: 'close-circle-outline',
  },
];

export const getStatusConfig = (status: string) => {
  const config = orderStatusConfig.find((item) => item.status === status);
  return config || {
    status: status,
    label: status,
    color: '#64748B',
    bgColor: '#F1F5F9',
    icon: 'help-circle-outline',
  };
};

export const formatRupiah = (val: number | string) => {
  return 'Rp ' + parseInt(val as string || '0').toLocaleString('id-ID');
};

export const calculateTotal = (items: any[]) => {
  let total = 0;
  for (const item of items) {
    total = total + (item.price || 0) * (item.quantity || 1);
  }
  return total;
};
