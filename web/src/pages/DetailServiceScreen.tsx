import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Star, Check, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const DetailServiceScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { services, addToCart, formatRupiah, cart } = useApp();
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const service = services.find((s) => s.id === id) || services[0];
  const totalCartCount = cart.reduce((acc, curr) => acc + curr.quantity, 0);

  const handleAddToCart = () => {
    addToCart(service, quantity);
    setShowSuccessToast(true);
    setTimeout(() => {
      navigate('/cart');
    }, 600);
  };

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Top Header */}
      <div className="px-5 py-4 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-sm z-20">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all text-gray-700"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/cart')}
            className="relative w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-700"
            title="Keranjang"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalCartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#236B38] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {totalCartCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all"
          >
            <Heart
              className={`w-5 h-5 transition-colors ${
                isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 px-5 pb-28 overflow-y-auto">
        {/* Big Shoe Image Container */}
        <div className="w-full aspect-[4/3] rounded-3xl bg-[#F0F7F2] flex items-center justify-center p-6 mb-5 relative overflow-hidden shadow-inner">
          <img
            src={service.image}
            alt={service.name}
            className="w-full h-full object-cover rounded-2xl drop-shadow-md hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Title and Price */}
        <div className="flex flex-col mb-3">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-1">
            {service.name}
          </h1>
          <p className="text-xl font-extrabold text-[#236B38]">
            {formatRupiah(service.price)}
          </p>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-5 pb-4 border-b border-gray-100">
          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          <span className="text-sm font-bold text-gray-900">{service.rating}</span>
          <span className="text-sm text-gray-400">({service.reviewCount} ulasan)</span>
        </div>

        {/* Description */}
        <div className="mb-5">
          <h2 className="text-sm font-bold text-gray-900 mb-2">Deskripsi</h2>
          <p className="text-xs leading-relaxed text-gray-600">
            {service.description}
          </p>
        </div>

        {/* Keunggulan */}
        <div className="mb-6">
          <h2 className="text-sm font-bold text-gray-900 mb-3">Keunggulan</h2>
          <div className="space-y-2">
            {service.advantages.map((adv, idx) => (
              <div key={idx} className="flex items-center gap-2.5">
                <div className="w-4 h-4 rounded-full bg-[#EAF5EC] flex items-center justify-center flex-shrink-0">
                  <Check className="w-2.5 h-2.5 text-[#236B38] stroke-[3]" />
                </div>
                <span className="text-xs text-gray-700 font-medium">{adv}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quantity Stepper */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-sm font-bold text-gray-900">Jumlah</span>
          <div className="flex items-center border border-gray-200 rounded-full px-2 py-1 bg-white shadow-sm">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-7 h-7 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 active:scale-95"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-9 text-center text-sm font-bold text-gray-900">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-7 h-7 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="fixed md:absolute bottom-0 left-0 right-0 max-w-md md:max-w-4xl mx-auto bg-white/95 backdrop-blur-md border-t border-gray-100 p-4 z-30">
        <button
          onClick={handleAddToCart}
          className="w-full bg-[#236B38] hover:bg-[#1b552c] active:scale-[0.98] text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-[#236B38]/20 transition-all flex items-center justify-center gap-2"
        >
          <ShoppingBag className="w-5 h-5" />
          <span>Tambah ke Keranjang</span>
        </button>
      </div>

      {/* Feedback Toast */}
      {showSuccessToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-[#132A1B] text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-xl flex items-center gap-2 z-50 animate-bounce">
          <Check className="w-4 h-4 text-emerald-400" />
          Berhasil ditambahkan ke keranjang!
        </div>
      )}
    </div>
  );
};
