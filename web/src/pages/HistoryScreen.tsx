import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, PackageOpen } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const HistoryScreen: React.FC = () => {
  const navigate = useNavigate();
  const { orders, formatRupiah } = useApp();
  const [activeTab, setActiveTab] = useState<'Semua' | 'Diproses' | 'Selesai' | 'Dibatalkan'>('Semua');

  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'Semua') return true;
    if (activeTab === 'Diproses') return order.status === 'Dalam Proses';
    if (activeTab === 'Selesai') return order.status === 'Selesai';
    if (activeTab === 'Dibatalkan') return order.status === 'Dibatalkan';
    return true;
  });

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Top Header */}
      <div className="px-5 py-4 flex items-center gap-4 sticky top-0 bg-white/95 backdrop-blur-sm z-20 border-b border-gray-100">
        <button
          onClick={() => navigate('/dashboard')}
          className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all text-gray-700"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Riwayat Pesanan</h1>
      </div>

      {/* Filter Tabs */}
      <div className="px-5 pt-3 pb-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
        {(['Semua', 'Diproses', 'Selesai', 'Dibatalkan'] as const).map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[#236B38] text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Orders List */}
      <div className="flex-1 px-5 py-3 overflow-y-auto space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <PackageOpen className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-sm font-bold text-gray-800">Tidak ada pesanan</p>
            <p className="text-xs text-gray-400 mt-1">
              Belum ada data pesanan pada kategori {activeTab}.
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const isDone = order.status === 'Selesai';
            const isProcess = order.status === 'Dalam Proses';

            return (
              <div
                key={order.id}
                onClick={() => navigate(`/tracking/${order.id}`)}
                className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:border-[#236B38]/30 hover:shadow-md transition-all cursor-pointer group"
              >
                {/* Header row: Order number & status pill */}
                <div className="flex items-center justify-between pb-3 border-b border-gray-50">
                  <span className="text-xs font-black text-gray-900 tracking-wide">
                    #{order.orderNumber}
                  </span>
                  <span
                    className={`text-[11px] font-bold px-3 py-1 rounded-full ${
                      isProcess
                        ? 'bg-amber-100 text-amber-800'
                        : isDone
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {order.status}
                  </span>
                </div>

                {/* Body row: Image, Service name, date & price */}
                <div className="flex items-center justify-between pt-3">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl bg-[#F8FAF8] flex items-center justify-center overflow-hidden flex-shrink-0 p-1">
                      <img
                        src={order.image}
                        alt={order.serviceName}
                        className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium">
                        {order.date} • {order.serviceName}
                      </p>
                      <p className="text-sm font-black text-[#236B38] mt-0.5">
                        {formatRupiah(order.totalAmount)}
                      </p>
                    </div>
                  </div>

                  <div className="w-7 h-7 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-[#236B38] group-hover:bg-[#EAF5EC] transition-all">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
