import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Settings,
  MapPin,
  CreditCard,
  ReceiptText,
  HelpCircle,
  Info,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ProfileScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useApp();

  const handleLogout = () => {
    if (window.confirm('Apakah kamu yakin ingin keluar dari Shoefresh?')) {
      navigate('/login');
    }
  };

  const menuItems = [
    {
      id: 'address',
      title: 'Alamat Saya',
      icon: MapPin,
      action: () => alert(`Alamat Terdaftar:\n${user.address}`),
    },
    {
      id: 'payment',
      title: 'Metode Pembayaran',
      icon: CreditCard,
      action: () => alert('Metode Pembayaran Tersimpan:\n• DANA (0812-3456-7890)\n• BCA Virtual Account'),
    },
    {
      id: 'history',
      title: 'Riwayat Pesanan',
      icon: ReceiptText,
      action: () => navigate('/history'),
    },
    {
      id: 'help',
      title: 'Bantuan & FAQ',
      icon: HelpCircle,
      action: () => alert('Shoefresh Help Center:\nHubungi customer care kami via WhatsApp di 0812-3456-7890.'),
    },
    {
      id: 'about',
      title: 'Tentang Kami',
      icon: Info,
      action: () => alert('Shoefresh - Sepatu Bersih, Langkah Lebih Fresh.\nSolusi cuci & perawatan sepatu terbaik dan terpercaya.'),
    },
  ];

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Top Header */}
      <div className="px-5 py-4 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-sm z-20 border-b border-gray-100">
        <button
          onClick={() => navigate('/dashboard')}
          className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all text-gray-700"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Profil</h1>
        <button
          onClick={() => alert('Pengaturan aplikasi')}
          className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all text-gray-700"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 px-5 py-6 overflow-y-auto space-y-6">
        {/* User Card */}
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-3">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-24 h-24 rounded-full object-cover border-4 border-[#236B38] shadow-md"
            />
            <div className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white" />
          </div>
          <h2 className="text-xl font-black text-gray-900">{user.name}</h2>
          <p className="text-xs text-gray-500 font-medium mt-0.5">{user.phone}</p>
          <p className="text-xs text-gray-400 mt-0.5">{user.email}</p>
        </div>

        {/* Menu List */}
        <div className="rounded-2xl border border-gray-100 divide-y divide-gray-100 overflow-hidden shadow-sm bg-white">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                onClick={item.action}
                className="px-4 py-3.5 flex items-center justify-between hover:bg-[#F8FAF8] cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-[#EAF5EC] text-[#236B38] flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-gray-800">
                    {item.title}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#236B38] transition-colors" />
              </div>
            );
          })}
        </div>

        {/* Logout Button */}
        <div>
          <button
            onClick={handleLogout}
            className="w-full py-3.5 px-4 rounded-2xl border border-red-200 text-red-600 hover:bg-red-50 active:scale-[0.98] font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
