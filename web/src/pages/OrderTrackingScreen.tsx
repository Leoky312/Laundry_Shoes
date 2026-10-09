import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Phone, Clock, AlertCircle, XCircle, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const OrderTrackingScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { orders, cancelOrder, deleteCancelledOrder, formatRupiah } = useApp();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // If specific order ID passed, use it, else pick the first or newest order
  const order = orders.find((o) => o.id === id || o.orderNumber === id) || orders[0];

  const handleCancel = () => {
    if (order) {
      cancelOrder(order.id);
      setShowCancelModal(false);
    }
  };

  const handleDelete = () => {
    if (order) {
      deleteCancelledOrder(order.id);
      setShowDeleteModal(false);
      navigate('/history');
    }
  };

  if (!order) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-white">
        <AlertCircle className="w-12 h-12 text-gray-400 mb-3" />
        <h2 className="text-lg font-bold text-gray-900 mb-1">Pesanan Tidak Ditemukan</h2>
        <p className="text-xs text-gray-500 mb-6">Belum ada pesanan aktif saat ini.</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-[#236B38] text-white font-bold text-xs px-6 py-2.5 rounded-full"
        >
          Kembali ke Beranda
        </button>
      </div>
    );
  }

  const isCancelled = order.status === 'Dibatalkan';
  const isCompleted = order.status === 'Selesai';

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Top Header */}
      <div className="px-5 py-4 flex items-center gap-4 sticky top-0 bg-white/95 backdrop-blur-sm z-20 border-b border-gray-100">
        <button
          onClick={() => navigate('/history')}
          className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all text-gray-700"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Detail Pesanan</h1>
      </div>

      <div className="flex-1 px-5 py-4 overflow-y-auto space-y-5">
        {/* Green Status Card */}
        <div
          className={`rounded-2xl p-5 text-white shadow-lg ${
            isCancelled
              ? 'bg-gradient-to-r from-red-600 to-rose-700 shadow-red-500/15'
              : isCompleted
              ? 'bg-gradient-to-r from-emerald-600 to-teal-700 shadow-emerald-500/15'
              : 'bg-gradient-to-r from-[#236B38] to-[#2E854B] shadow-[#236B38]/15'
          }`}
        >
          <span className="text-xs font-semibold text-white/80 tracking-wide uppercase">
            Pesanan #{order.orderNumber}
          </span>
          <div className="flex items-center gap-2 mt-1.5 mb-1">
            {!isCancelled && !isCompleted && (
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-300 animate-ping" />
            )}
            <h2 className="text-xl font-black">{order.status}</h2>
          </div>
          <p className="text-xs text-white/90 font-medium">
            {isCancelled
              ? 'Pesanan ini telah dibatalkan.'
              : isCompleted
              ? 'Pesanan telah selesai dan diterima dengan baik.'
              : 'Pesanan kamu sedang dicuci dan dirawat dengan teliti.'}
          </p>
        </div>

        {/* Vertical Timeline */}
        <div className="rounded-2xl border border-gray-100 p-5 bg-white shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-4">Status Pengerjaan</h3>

          <div className="relative pl-6 space-y-6">
            {/* Connecting Vertical Line */}
            <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gray-200" />

            {order.timeline.map((step, index) => {
              const isDone = step.completed;
              const isCurrent = step.current;

              return (
                <div key={index} className="relative flex items-start gap-4">
                  {/* Step Node */}
                  <div
                    className={`absolute -left-6 w-6 h-6 rounded-full flex items-center justify-center z-10 transition-all ${
                      isDone
                        ? 'bg-[#236B38] text-white shadow-sm'
                        : isCurrent
                        ? 'bg-white border-2 border-[#236B38] text-[#236B38]'
                        : 'bg-white border-2 border-gray-300 text-transparent'
                    }`}
                  >
                    {isDone ? (
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    ) : isCurrent ? (
                      <div className="w-2 h-2 rounded-full bg-[#236B38]" />
                    ) : null}
                  </div>

                  <div className="flex-1">
                    <p
                      className={`text-xs font-bold leading-tight ${
                        isDone || isCurrent ? 'text-gray-900' : 'text-gray-400'
                      }`}
                    >
                      {step.label}
                    </p>
                    {step.time && (
                      <p className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        {step.time}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Contact Support Button */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <a
              href="https://wa.me/6281234567890?text=Halo%20Shoefresh,%20saya%20mau%20tanya%20tentang%20pesanan"
              target="_blank"
              rel="noreferrer"
              className="w-full py-2.5 px-4 rounded-xl border border-[#236B38] text-[#236B38] font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#EAF5EC] active:scale-95 transition-all"
            >
              <Phone className="w-4 h-4" />
              <span>Hubungi Kami</span>
            </a>
          </div>
        </div>

        {/* Detail Pesanan Items Preview */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 mb-2.5">
            Rincian Item
          </h3>
          <div className="rounded-2xl border border-gray-100 p-3.5 bg-white shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0 p-1">
                <img
                  src={order.image}
                  alt={order.serviceName}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <div>
                <h4 className="font-bold text-xs text-gray-900">{order.serviceName}</h4>
                <p className="font-extrabold text-xs text-[#236B38] mt-0.5">
                  {formatRupiah(order.servicePrice)}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">{order.date}</p>
              </div>
            </div>
            <span className="text-xs font-bold text-gray-400">x1</span>
          </div>
        </div>

        {/* Order Details & Summary */}
        <div className="rounded-2xl bg-gray-50 p-4 space-y-2 text-xs">
          <div className="flex justify-between text-gray-500">
            <span>Metode Pembayaran</span>
            <span className="font-bold text-gray-800">{order.paymentMethod}</span>
          </div>
          {order.notes && (
            <div className="flex justify-between text-gray-500">
              <span>Catatan</span>
              <span className="font-medium text-gray-800 text-right max-w-[60%]">
                {order.notes}
              </span>
            </div>
          )}
          <div className="flex justify-between text-sm font-black text-gray-900 pt-2 border-t border-gray-200">
            <span>Total Pembayaran</span>
            <span className="text-[#236B38] font-black">{formatRupiah(order.totalAmount)}</span>
          </div>
        </div>

        {/* Cancel Order Action (if still in process) */}
        {order.status === 'Dalam Proses' && (
          <div className="pt-1">
            <button
              onClick={() => setShowCancelModal(true)}
              className="w-full py-3 px-4 rounded-xl border border-red-200 text-red-600 font-bold text-xs flex items-center justify-center gap-2 hover:bg-red-50 active:scale-95 transition-all"
            >
              <XCircle className="w-4 h-4" />
              <span>Batalkan Pesanan</span>
            </button>
          </div>
        )}

        {/* Delete Order Action (if cancelled) */}
        {order.status === 'Dibatalkan' && (
          <div className="pt-1">
            <button
              onClick={() => setShowDeleteModal(true)}
              className="w-full py-3 px-4 rounded-xl bg-red-50 border border-red-200 text-red-600 font-bold text-xs flex items-center justify-center gap-2 hover:bg-red-100 active:scale-95 transition-all shadow-sm"
            >
              <Trash2 className="w-4 h-4" />
              <span>Hapus Pesanan yang Dibatalkan</span>
            </button>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Cancellation */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xs w-full p-6 text-center shadow-2xl animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-gray-900 mb-1">Batalkan Pesanan?</h3>
            <p className="text-xs text-gray-500 mb-5 leading-relaxed">
              Apakah kamu yakin ingin membatalkan pesanan #{order.orderNumber}? Tindakan ini tidak dapat diurungkan.
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => setShowCancelModal(false)}
                className="py-2.5 px-3 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={handleCancel}
                className="py-2.5 px-3 rounded-xl bg-red-600 text-xs font-bold text-white hover:bg-red-700 shadow"
              >
                Ya, Batalkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Deletion */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xs w-full p-6 text-center shadow-2xl animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-gray-900 mb-1">Hapus Pesanan?</h3>
            <p className="text-xs text-gray-500 mb-5 leading-relaxed">
              Apakah kamu yakin ingin menghapus data pesanan #{order.orderNumber} yang telah dibatalkan ini secara permanen?
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="py-2.5 px-3 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="py-2.5 px-3 rounded-xl bg-red-600 text-xs font-bold text-white hover:bg-red-700 shadow"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
