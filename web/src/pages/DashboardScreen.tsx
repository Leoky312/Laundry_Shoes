import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ShoppingBag, Search, ClipboardList, Sparkles, ChevronRight } from 'lucide-react';
import logoImg from '../assets/logo-shoefresh.png';
import { useApp } from '../context/AppContext';

export const DashboardScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, services, formatRupiah, cart } = useApp();

  const totalCartCount = cart.reduce((acc, curr) => acc + curr.quantity, 0);

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Top Header for Mobile & Tablet */}
      <div className="px-5 pt-4 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src={logoImg} alt="Shoefresh Logo" className="w-10 h-10 object-contain" />
          <span style={{ fontFamily: "'Poppins', 'Plus Jakarta Sans', sans-serif" }} className="text-xl font-black text-[#236B38] tracking-tight">ShoeFresh</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/cart')}
            className="relative p-2 rounded-full border border-gray-100 hover:bg-gray-50 transition-colors"
            title="Keranjang"
          >
            <ShoppingBag className="w-5 h-5 text-gray-700" />
            {totalCartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#236B38] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {totalCartCount}
              </span>
            )}
          </button>

          <button
            onClick={() => navigate('/history')}
            className="p-2 rounded-full border border-gray-100 hover:bg-gray-50 transition-colors relative"
            title="Notifikasi"
          >
            <Bell className="w-5 h-5 text-gray-700" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <button
            onClick={() => navigate('/profile')}
            className="relative transition-transform active:scale-95"
            title="Profil"
          >
            <img
              src={user.avatar}
              alt={user.name}
              className="w-9 h-9 rounded-full object-cover border-2 border-[#236B38]"
            />
          </button>
        </div>
      </div>

      {/* Greeting */}
      <div className="px-5 pt-2 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Halo, {user.name}
        </h1>
        <p className="text-sm text-gray-500 font-medium">
          Sepatu kamu, prioritas kami
        </p>
      </div>

      {/* Banner Utama */}
      <div className="px-5 pb-5">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#236B38] to-[#2E854B] p-5 text-white shadow-lg shadow-[#236B38]/15">
          {/* Subtle decorative circles */}
          <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-white/10 blur-md pointer-events-none" />
          <div className="absolute right-24 -top-8 w-28 h-28 rounded-full bg-[#EAF5EC]/15 blur-sm pointer-events-none" />

          <div className="relative z-10 flex items-center justify-between">
            <div className="max-w-[55%]">
              <span className="inline-block px-2.5 py-0.5 mb-2 rounded-full bg-white/20 text-[10px] font-bold tracking-wider uppercase text-emerald-100">
                Promo Spesial
              </span>
              <h2 className="text-lg font-black leading-tight tracking-wide uppercase">
                Bersih Maksimal
                <br />
                Wangi Tahan Lama
              </h2>
              <button
                onClick={() => navigate('/service/cuci-sepatu')}
                className="mt-3.5 inline-flex items-center gap-1.5 bg-white text-[#236B38] font-bold text-xs px-4 py-2 rounded-full shadow hover:bg-emerald-50 active:scale-95 transition-all"
              >
                Pesan Sekarang
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="w-[42%] flex justify-end">
              <img
                src="https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=400&h=400&fit=crop"
                alt="Sepatu Shoefresh"
                className="w-32 h-28 object-contain drop-shadow-2xl transform -rotate-12 hover:scale-105 transition-transform"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Menu Cepat */}
      <div className="px-5 pb-6">
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => navigate('/service/cuci-sepatu')}
            className="flex flex-col items-center p-3.5 rounded-2xl bg-[#EAF5EC] hover:bg-[#dcf0df] transition-all text-center group active:scale-95"
          >
            <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center shadow-sm text-[#236B38] mb-2 group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5 text-[#236B38]" />
            </div>
            <span className="text-xs font-bold text-[#132A1B] leading-tight">
              Pesan Layanan
            </span>
          </button>

          <button
            onClick={() => navigate('/tracking')}
            className="flex flex-col items-center p-3.5 rounded-2xl bg-[#EAF5EC] hover:bg-[#dcf0df] transition-all text-center group active:scale-95"
          >
            <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center shadow-sm text-[#236B38] mb-2 group-hover:scale-110 transition-transform">
              <Search className="w-5 h-5 text-[#236B38]" />
            </div>
            <span className="text-xs font-bold text-[#132A1B] leading-tight">
              Cek Status
            </span>
          </button>

          <button
            onClick={() => navigate('/history')}
            className="flex flex-col items-center p-3.5 rounded-2xl bg-[#EAF5EC] hover:bg-[#dcf0df] transition-all text-center group active:scale-95"
          >
            <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center shadow-sm text-[#236B38] mb-2 group-hover:scale-110 transition-transform">
              <ClipboardList className="w-5 h-5 text-[#236B38]" />
            </div>
            <span className="text-xs font-bold text-[#132A1B] leading-tight">
              Riwayat Pesanan
            </span>
          </button>
        </div>
      </div>

      {/* Layanan Kami */}
      <div className="px-5 pb-6">
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-base font-bold text-[#132A1B]">Layanan Kami</h3>
          <button
            onClick={() => navigate('/service/cuci-sepatu')}
            className="text-xs font-semibold text-[#236B38] hover:underline flex items-center"
          >
            Lihat Semua <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {services.map((service) => (
            <div
              key={service.id}
              onClick={() => navigate(`/service/${service.id}`)}
              className="bg-white rounded-2xl border border-gray-100 p-3 hover:border-emerald-200 hover:shadow-md transition-all cursor-pointer flex flex-col group"
            >
              <div className="w-full aspect-square rounded-xl bg-[#F8FAF8] flex items-center justify-center overflow-hidden mb-2.5 p-2">
                <img
                  src={service.image}
                  alt={service.name}
                  className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <h4 className="font-bold text-xs text-gray-900 mb-1 group-hover:text-[#236B38] transition-colors">
                {service.name}
              </h4>
              <p className="font-extrabold text-sm text-[#236B38] mt-auto">
                {formatRupiah(service.price)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
