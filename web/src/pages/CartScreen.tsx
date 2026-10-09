import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const CartScreen: React.FC = () => {
  const navigate = useNavigate();
  const { cart, updateCartQuantity, removeFromCart, formatRupiah } = useApp();

  const subtotal = cart.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);
  const deliveryFee = cart.length > 0 ? 10000 : 0;
  const grandTotal = subtotal + deliveryFee;

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
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Keranjang</h1>
      </div>

      {/* Cart Items List */}
      <div className="flex-1 px-5 py-4 overflow-y-auto">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-[#EAF5EC] flex items-center justify-center mb-4 text-[#236B38]">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Keranjang Kosong</h2>
            <p className="text-xs text-gray-500 mb-6 max-w-xs">
              Kamu belum menambahkan layanan laundry sepatu ke keranjang.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-[#236B38] text-white font-bold text-xs px-6 py-3 rounded-full shadow hover:bg-[#1b552c] transition-all"
            >
              Pilih Layanan
            </button>
          </div>
        ) : (
          <div className="space-y-3.5">
            {cart.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-gray-100 p-3.5 flex items-center justify-between shadow-sm hover:border-gray-200 transition-all"
              >
                {/* Thumbnail & Info */}
                <div className="flex items-center gap-3.5">
                  <div className="w-16 h-16 rounded-xl bg-[#F8FAF8] flex items-center justify-center overflow-hidden flex-shrink-0 p-1">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-gray-900 mb-1">
                      {item.name}
                    </h3>
                    <p className="font-bold text-xs text-[#236B38]">
                      {formatRupiah(item.price)}
                    </p>
                  </div>
                </div>

                {/* Stepper & Delete */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-gray-200 rounded-full px-1.5 py-0.5 bg-white">
                    <button
                      onClick={() => updateCartQuantity(item.id, -1)}
                      className="w-6 h-6 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 active:scale-95"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-7 text-center text-xs font-bold text-gray-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateCartQuantity(item.id, 1)}
                      className="w-6 h-6 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 active:scale-95"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                    title="Hapus item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cart Footer Summary */}
      {cart.length > 0 && (
        <div className="bg-white border-t border-gray-100 px-5 pt-4 pb-6 space-y-4">
          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span className="font-semibold text-gray-800">{formatRupiah(subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Ongkir</span>
              <span className="font-semibold text-gray-800">{formatRupiah(deliveryFee)}</span>
            </div>
            <div className="flex justify-between text-sm font-extrabold text-gray-900 pt-2 border-t border-gray-100">
              <span>Total</span>
              <span className="text-base text-[#236B38] font-black">{formatRupiah(grandTotal)}</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="w-full bg-[#236B38] hover:bg-[#1b552c] active:scale-[0.98] text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-[#236B38]/20 transition-all flex items-center justify-center gap-2"
          >
            <span>Lanjut ke Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
