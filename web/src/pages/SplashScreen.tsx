import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logoImg from '../assets/logo-shoefresh.png';

export const SplashScreen: React.FC = () => {
  const navigate = useNavigate();
  const [activeDot, setActiveDot] = useState(0);

  useEffect(() => {
    const dotInterval = setInterval(() => {
      setActiveDot((prev) => (prev + 1) % 3);
    }, 700);

    const timer = setTimeout(() => {
      navigate('/login');
    }, 2500);

    return () => {
      clearInterval(dotInterval);
      clearTimeout(timer);
    };
  }, [navigate]);

  return (
    <div
      onClick={() => navigate('/login')}
      className="min-h-screen w-full bg-[#236B38] relative overflow-hidden flex flex-col items-center justify-center cursor-pointer select-none"
    >
      {/* Wave Decorative Layers */}
      <div className="absolute -top-32 -left-20 w-[140%] h-80 rounded-full bg-[#1E5E32] opacity-80 scale-x-125" />
      <div className="absolute -top-40 -right-24 w-[130%] h-72 rounded-full bg-[#2D7F45] opacity-40" />
      <div className="absolute -bottom-32 -left-24 w-[150%] h-88 rounded-full bg-[#194D28] opacity-90" />
      <div className="absolute -bottom-40 -right-20 w-[140%] h-80 rounded-full bg-white/10" />

      {/* Center Branding Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-8">
        <div className="w-56 h-48 flex items-center justify-center mb-6">
          <img
            src={logoImg}
            alt="Shoefresh"
            className="w-full h-full object-contain filter drop-shadow-lg"
          />
        </div>

        <h1 className="text-2xl md:text-3xl font-extrabold text-white leading-snug tracking-wide">
          Sepatu Bersih<br />Langkah Lebih Fresh
        </h1>
      </div>

      {/* 3 Pagination Dots */}
      <div className="absolute bottom-12 flex items-center gap-2 z-10">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${
            activeDot === 0 ? 'w-6 bg-white' : 'w-2 bg-white/40'
          }`}
        />
        <div
          className={`h-2 rounded-full transition-all duration-300 ${
            activeDot === 1 ? 'w-6 bg-white' : 'w-2 bg-white/40'
          }`}
        />
        <div
          className={`h-2 rounded-full transition-all duration-300 ${
            activeDot === 2 ? 'w-6 bg-white' : 'w-2 bg-white/40'
          }`}
        />
      </div>
    </div>
  );
};
