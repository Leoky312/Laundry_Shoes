import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Phone, Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import logoImg from '../assets/logo-shoefresh.png';

export const RegisterScreen: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('Fatir');
  const [phone, setPhone] = useState('081234567890');
  const [email, setEmail] = useState('fatir@example.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-8 relative">
      {/* Back Button */}
      <button
        onClick={() => navigate('/login')}
        className="absolute top-6 left-6 p-2 rounded-full hover:bg-gray-100 text-gray-700 transition-colors"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>

      <div className="w-full max-w-sm flex flex-col items-center">
        {/* Top Logo */}
        <div className="w-28 h-20 mb-2 flex items-center justify-center">
          <img src={logoImg} alt="Shoefresh" className="w-full h-full object-contain" />
        </div>

        {/* Title & Subtitle */}
        <h2 className="text-2xl font-extrabold text-[#132A1B] mb-1 text-center">
          Daftar Akun
        </h2>
        <p className="text-sm text-gray-500 mb-6 text-center">
          Buat akun untuk mulai menggunakan layanan Shoefresh
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3.5">
          {/* Nama Lengkap */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
              <User className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Nama Lengkap"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-[#F8FAF8] border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-[#236B38] focus:bg-white transition-all text-[#132A1B]"
              required
            />
          </div>

          {/* Nomor HP */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
              <Phone className="w-5 h-5" />
            </div>
            <input
              type="tel"
              placeholder="Nomor HP"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-[#F8FAF8] border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-[#236B38] focus:bg-white transition-all text-[#132A1B]"
              required
            />
          </div>

          {/* Email */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
              <Mail className="w-5 h-5" />
            </div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-[#F8FAF8] border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-[#236B38] focus:bg-white transition-all text-[#132A1B]"
              required
            />
          </div>

          {/* Password */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
              <Lock className="w-5 h-5" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-12 py-3 bg-[#F8FAF8] border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-[#236B38] focus:bg-white transition-all text-[#132A1B]"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* Button: Daftar */}
          <button
            type="submit"
            className="w-full py-3.5 bg-[#236B38] hover:bg-[#1A522B] text-white font-bold rounded-full text-base transition-colors shadow-sm mt-3"
          >
            Daftar
          </button>

          {/* Login Link */}
          <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500 mt-5">
            <span>Sudah punya akun?</span>
            <Link to="/login" className="font-bold text-[#236B38] hover:underline">
              Masuk di sini
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};
