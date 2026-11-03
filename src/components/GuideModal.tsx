import React from 'react';
import { X, Keyboard, Smartphone, HelpCircle, Sparkles, Footprints, ShieldAlert } from 'lucide-react';

interface GuideModalProps {
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn select-none">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border-4 border-sky-400 relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="font-game text-xl font-bold text-slate-800">
              PANDUAN BERMAIN & KONTROL
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto space-y-4 py-4 text-slate-700 text-sm">
          {/* Controls for Laptop/PC */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2 font-game font-bold text-slate-900 mb-2">
              <Keyboard className="w-5 h-5 text-sky-600" />
              <span>Kontrol Komputer / Laptop:</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white p-2 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-800">Panah Kiri / A:</span>
                <span className="block text-slate-500">Bergerak ke Kiri</span>
              </div>
              <div className="bg-white p-2 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-800">Panah Kanan / D:</span>
                <span className="block text-slate-500">Bergerak ke Kanan</span>
              </div>
              <div className="bg-white p-2 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-800">Spasi / Panah Atas / W:</span>
                <span className="block text-slate-500">Melompat (Tahan untuk lompat tinggi)</span>
              </div>
              <div className="bg-white p-2 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-800">Shift / Tombol J:</span>
                <span className="block text-slate-500">Lari Cepat (Dash)</span>
              </div>
            </div>
          </div>

          {/* Controls for Mobile / Tablet */}
          <div className="p-3.5 bg-sky-50 rounded-2xl border border-sky-200">
            <div className="flex items-center gap-2 font-game font-bold text-sky-950 mb-2">
              <Smartphone className="w-5 h-5 text-sky-600" />
              <span>Kontrol HP Android & Tablet:</span>
            </div>
            <p className="text-xs text-sky-900 leading-relaxed">
              Tombol virtual akan otomatis muncul di layar saat bermain:
              <br />• <strong>D-Pad Kiri & Kanan</strong> di pojok kiri bawah untuk mengarahkan langkah.
              <br />• <strong>Tombol A (Kuning)</strong> di pojok kanan bawah untuk Melompat.
              <br />• <strong>Tombol B (Biru)</strong> di pojok kanan bawah untuk Berlari Kencang (Dash).
            </p>
          </div>

          {/* Game Mechanics & Tips */}
          <div className="space-y-2.5">
            <h4 className="font-game font-bold text-slate-800 text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Mekanisme Permainan & Tips Juara:</span>
            </h4>

            <div className="flex items-start gap-2.5 bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-xs">
              <HelpCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-950">Balok Misteri (?): </strong>
                Lompat dan sundul balok dari bawah untuk membuka soal matematika SMP! Menjawab dengan benar memberikan bonus 500 skor dan 5 koin emas.
              </div>
            </div>

            <div className="flex items-start gap-2.5 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 text-xs">
              <Footprints className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-emerald-950">Injak Musuh: </strong>
                Lompati monster ungu (Slime) tepat dari atas untuk mengalahkannya dan mendapatkan lompatan pantul serta poin tambahan.
              </div>
            </div>

            <div className="flex items-start gap-2.5 bg-red-50 p-2.5 rounded-xl border border-red-200 text-xs">
              <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-red-950">Hati-hati Monster Berduri: </strong>
                Monster jingga berduri tidak bisa diinjak! Lompati mereka agar kamu tidak kehilangan nyawa.
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100">
          <button
            onClick={onClose}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-game font-bold text-sm py-2.5 rounded-xl transition"
          >
            SAYA MENGERTI
          </button>
        </div>
      </div>
    </div>
  );
};
