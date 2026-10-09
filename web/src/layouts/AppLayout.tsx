import React from 'react';
import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import { Home, ReceiptText, User, ShoppingBag } from 'lucide-react';
import logoImg from '../assets/logo-shoefresh.png';
import { useApp } from '../context/AppContext';

export const AppLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart, user } = useApp();

  const totalCartCount = cart.reduce((acc, curr) => acc + curr.quantity, 0);

  const isCurrent = (path: string) => {
    if (path === '/dashboard' && (location.pathname === '/dashboard' || location.pathname === '/')) {
      return true;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center">
      {/* Container that acts as a sleek mobile shell on mobile or centered max-w-md on narrow, with max-w-5xl on desktop */}
      <div className="w-full max-w-md md:max-w-4xl min-h-screen bg-white shadow-2xl flex flex-col relative">
        {/* Desktop Top Header Bar (Hidden on Mobile) */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur-md z-30">
          <Link to="/dashboard" className="flex items-center gap-3">
            <img src={logoImg} alt="Shoefresh Logo" className="w-10 h-10 object-contain" />
            <span style={{ fontFamily: "'Poppins', 'Plus Jakarta Sans', sans-serif" }} className="text-2xl font-black text-[#236B38] tracking-tight">ShoeFresh</span>
          </Link>

          {/* Navigation Links */}
          <nav className="flex items-center gap-8">
            <Link
              to="/dashboard"
              className={`text-sm font-bold transition-colors ${
                isCurrent('/dashboard') ? 'text-[#236B38]' : 'text-gray-600 hover:text-[#236B38]'
              }`}
            >
              Beranda
            </Link>
            <Link
              to="/history"
              className={`text-sm font-bold transition-colors ${
                isCurrent('/history') ? 'text-[#236B38]' : 'text-gray-600 hover:text-[#236B38]'
              }`}
            >
              Riwayat Pesanan
            </Link>
            <Link
              to="/profile"
              className={`text-sm font-bold transition-colors ${
                isCurrent('/profile') ? 'text-[#236B38]' : 'text-gray-600 hover:text-[#236B38]'
              }`}
            >
              Profil
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Link
              to="/cart"
              className="relative p-2.5 rounded-full border border-gray-200 hover:border-[#236B38] transition-colors"
              title="Keranjang"
            >
              <ShoppingBag className="w-5 h-5 text-gray-700" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#236B38] text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {totalCartCount}
                </span>
              )}
            </Link>

            <Link
              to="/profile"
              className="flex items-center gap-2.5 pl-2 border-l border-gray-200"
            >
              <img
                src={user.avatar}
                alt={user.name}
                className="w-9 h-9 rounded-full object-cover border border-[#236B38]"
              />
              <span className="text-sm font-bold text-[#132A1B]">{user.name}</span>
            </Link>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col pb-20 md:pb-8">
          <Outlet />
        </main>

        {/* Mobile Bottom Navigation (Visible on mobile screens) */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-200 px-6 py-2 flex items-center justify-around z-40">
          <button
            onClick={() => navigate('/dashboard')}
            className={`flex flex-col items-center gap-1 py-1 transition-colors ${
              isCurrent('/dashboard') ? 'text-[#236B38]' : 'text-gray-400'
            }`}
          >
            <Home className="w-6 h-6" />
            <span className="text-[11px] font-bold">Beranda</span>
          </button>

          <button
            onClick={() => navigate('/history')}
            className={`flex flex-col items-center gap-1 py-1 transition-colors ${
              isCurrent('/history') ? 'text-[#236B38]' : 'text-gray-400'
            }`}
          >
            <ReceiptText className="w-6 h-6" />
            <span className="text-[11px] font-bold">Pesanan</span>
          </button>

          <button
            onClick={() => navigate('/profile')}
            className={`flex flex-col items-center gap-1 py-1 transition-colors ${
              isCurrent('/profile') ? 'text-[#236B38]' : 'text-gray-400'
            }`}
          >
            <User className="w-6 h-6" />
            <span className="text-[11px] font-bold">Profil</span>
          </button>
        </nav>
      </div>
    </div>
  );
};
