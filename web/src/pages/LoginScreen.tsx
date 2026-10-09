import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import logoImg from '../assets/logo-shoefresh.png';

export const LoginScreen: React.FC = () => {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('fatir@example.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm flex flex-col items-center">
        {/* Top Logo */}
        <div className="w-32 h-24 mb-3 flex items-center justify-center">
          <img src={logoImg} alt="Shoefresh" className="w-full h-full object-contain" />
        </div>

        {/* Title & Subtitle */}
        <h2 className="text-2xl font-extrabold text-[#132A1B] mb-1 text-center">
          Selamat Datang!
        </h2>
        <p className="text-sm text-gray-500 mb-8 text-center">
          Login untuk melanjutkan
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          {/* Email or Phone */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
              <Mail className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Email atau Nomor HP"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-[#F8FAF8] border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-[#236B38] focus:bg-white transition-all text-[#132A1B]"
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
              className="w-full pl-12 pr-12 py-3.5 bg-[#F8FAF8] border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-[#236B38] focus:bg-white transition-all text-[#132A1B]"
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

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between text-xs mt-1">
            <label className="flex items-center gap-2 cursor-pointer text-gray-600 select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-[#236B38] focus:ring-[#236B38] accent-[#236B38]"
              />
              <span>Ingat saya</span>
            </label>

            <button type="button" className="font-semibold text-[#236B38] hover:underline">
              Lupa password?
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3.5 bg-[#236B38] hover:bg-[#1A522B] text-white font-bold rounded-full text-base transition-colors shadow-sm mt-3"
          >
            Masuk
          </button>

          {/* Social Divider */}
          <div className="flex items-center my-4">
            <div className="flex-1 border-t border-gray-200" />
            <span className="px-3 text-xs text-gray-400">atau masuk dengan</span>
            <div className="flex-1 border-t border-gray-200" />
          </div>

          {/* Social Buttons */}
          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="w-20 h-12 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.1 8.8 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.7s.2-2 .4-2.7L1.6 6.4C.6 8.3 0 10.1 0 12s.6 3.7 1.6 5.6l3.7-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.2 0-5.8-2.1-6.7-5.3L1.6 16C3.5 19.8 7.4 23 12 23z"
                />
              </svg>
            </button>

            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="w-20 h-12 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.93-2.85-.9.04-1.99.6-2.64 1.35-.57.65-1.07 1.72-.94 2.74 1 .08 2.03-.49 2.65-1.24z" />
              </svg>
            </button>
          </div>

          {/* Register Prompt */}
          <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500 mt-6">
            <span>Belum punya akun?</span>
            <Link to="/register" className="font-bold text-[#236B38] hover:underline">
              Daftar di sini
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};
