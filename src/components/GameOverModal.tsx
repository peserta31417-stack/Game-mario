import React from 'react';
import { RotateCcw, Menu, HeartCrack } from 'lucide-react';

interface GameOverModalProps {
  onRetry: () => void;
  onMainMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ onRetry, onMainMenu }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn select-none">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border-4 border-red-500">
        <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-3">
          <HeartCrack className="w-9 h-9 text-red-500" />
        </div>

        <h2 className="font-game text-3xl font-extrabold text-slate-800 mb-1">
          GAME OVER
        </h2>
        <p className="font-game text-sm text-slate-500 mb-6">
          Jangan menyerah! Setiap petualang hebat belajar dari rintangan. Ayo coba lagi!
        </p>

        <div className="space-y-3">
          <button
            onClick={onRetry}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-b from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-amber-950 font-game text-base font-bold py-3 px-6 rounded-2xl game-btn-shadow border border-amber-300 transition active:scale-95"
          >
            <RotateCcw className="w-5 h-5 text-amber-950" />
            <span>COBA LAGI</span>
          </button>

          <button
            onClick={onMainMenu}
            className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-game font-bold text-sm py-2.5 px-4 rounded-xl border border-slate-300 transition active:scale-95"
          >
            <Menu className="w-4 h-4" />
            <span>KEMBALI KE MENU</span>
          </button>
        </div>
      </div>
    </div>
  );
};
