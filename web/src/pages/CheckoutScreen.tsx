import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, CheckCircle2, ChevronRight, CreditCard, Banknote, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const CheckoutScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, cart, createOrder, formatRupiah } = useApp();

  const [paymentMethod, setPaymentMethod] = useState<'DANA' | 'Transfer Bank' | 'COD'>('DANA');
  const [notes, setNotes] = useState('Sepatu warna putih, tolong hati-hati');
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [address, setAddress] = useState(user.address);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = cart.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);
  const deliveryFee = cart.length > 0 ? 10000 : 0;
  const grandTotal = subtotal + deliveryFee;

  const handlePlaceOrder = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      const newOrder = createOrder({
        paymentMethod: paymentMethod === 'COD' ? 'COD (Bayar di Tempat)' : paymentMethod,
        notes,
      });
      setIsSubmitting(false);
      navigate(`/tracking/${newOrder.id}`);
    }, 600);
  };

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Top Header */}
      <div className="px-5 py-4 flex items-center gap-4 sticky top-0 bg-white/95 backdrop-blur-sm z-20 border-b border-gray-100">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all text-gray-700"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Checkout</h1>
      </div>

      {/* Checkout Form Content */}
      <div className="flex-1 px-5 py-5 overflow-y-auto space-y-6">
        {/* Alamat Pengiriman */}
        <div>
          <h2 className="text-sm font-bold text-gray-900 mb-2.5">
            Alamat Pengiriman
          </h2>
          <div className="rounded-2xl border border-gray-100 p-4 bg-white shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#EAF5EC] flex items-center justify-center flex-shrink-0 text-[#236B38] mt-0.5">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-gray-900">{user.name}</span>
                  <button
                    onClick={() => setIsEditingAddress(!isEditingAddress)}
                    className="text-xs font-semibold text-[#236B38] hover:underline"
                  >
                    {isEditingAddress ? 'Simpan' : 'Ubah'}
                  </button>
                </div>

                {isEditingAddress ? (
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={2}
                    className="mt-2 w-full text-xs p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#236B38]"
                  />
                ) : (
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    {address}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Pilih Metode Pembayaran */}
        <div>
          <h2 className="text-sm font-bold text-gray-900 mb-2.5">
            Pilih Metode Pembayaran
          </h2>
          <div className="space-y-2.5">
            {/* DANA */}
            <div
              onClick={() => setPaymentMethod('DANA')}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                paymentMethod === 'DANA'
                  ? 'border-[#236B38] bg-[#F4FAF5]'
                  : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500 text-white flex items-center justify-center font-black text-xs tracking-tighter">
                  DANA
                </div>
                <span className="text-sm font-bold text-gray-900">DANA</span>
              </div>
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                  paymentMethod === 'DANA'
                    ? 'border-[#236B38] bg-[#236B38]'
                    : 'border-gray-300'
                }`}
              >
                {paymentMethod === 'DANA' && (
                  <div className="w-2 h-2 rounded-full bg-white" />
                )}
              </div>
            </div>

            {/* Transfer Bank */}
            <div
              onClick={() => setPaymentMethod('Transfer Bank')}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                paymentMethod === 'Transfer Bank'
                  ? 'border-[#236B38] bg-[#F4FAF5]'
                  : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-[#236B38] flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <span className="text-sm font-bold text-gray-900">Transfer Bank</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>

            {/* COD */}
            <div
              onClick={() => setPaymentMethod('COD')}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                paymentMethod === 'COD'
                  ? 'border-[#236B38] bg-[#F4FAF5]'
                  : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Banknote className="w-5 h-5" />
                </div>
                <span className="text-sm font-bold text-gray-900">
                  COD (Bayar di Tempat)
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Catatan */}
        <div>
          <h2 className="text-sm font-bold text-gray-900 mb-2">
            Catatan (Opsional)
          </h2>
          <div className="relative">
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Sepatu warna putih, tolong hati-hati"
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#236B38] focus:ring-1 focus:ring-[#236B38]"
            />
          </div>
        </div>

        {/* Ringkasan Biaya */}
        <div className="rounded-2xl bg-gray-50 p-4 space-y-2 text-xs">
          <div className="flex justify-between text-gray-500">
            <span>Subtotal Layanan</span>
            <span className="font-semibold text-gray-800">{formatRupiah(subtotal)}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Biaya Penjemputan / Ongkir</span>
            <span className="font-semibold text-gray-800">{formatRupiah(deliveryFee)}</span>
          </div>
          <div className="flex justify-between text-sm font-black text-gray-900 pt-2 border-t border-gray-200">
            <span>Total Tagihan</span>
            <span className="text-[#236B38] font-black">{formatRupiah(grandTotal)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-gray-400 justify-center">
          <ShieldCheck className="w-4 h-4 text-[#236B38]" />
          <span>Garansi cuci bersih & perlindungan bahan 100% aman</span>
        </div>
      </div>

      {/* Submit Button */}
      <div className="bg-white border-t border-gray-100 p-5">
        <button
          onClick={handlePlaceOrder}
          disabled={isSubmitting}
          className="w-full bg-[#236B38] hover:bg-[#1b552c] active:scale-[0.98] text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-[#236B38]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-75"
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5" />
              <span>Pesan Sekarang</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
