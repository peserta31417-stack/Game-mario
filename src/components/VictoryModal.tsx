import React, { useEffect } from 'react';
import { LevelConfig } from '../types/game';
import { Star, Trophy, Coins, Clock, RotateCcw, ArrowRight, Menu } from 'lucide-react';
import confetti from 'canvas-confetti';

interface VictoryModalProps {
  level: LevelConfig;
  stats: { timeRemaining: number; coins: number; score: number };
  onNextLevel: () => void;
  onReplay: () => void;
  onMainMenu: () => void;
  hasNextLevel: boolean;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  level,
  stats,
  onNextLevel,
  onReplay,
  onMainMenu,
  hasNextLevel,
}) => {
  // Calculate stars (1-3)
  // Max score potential ~ 4000+
  let stars = 1;
  if (stats.score >= 2500 || stats.coins >= 18) stars = 3;
  else if (stats.score >= 1200 || stats.coins >= 10) stars = 2;

  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.5 },
      });
      const timer = setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        });
      }, 400);
      return () => clearTimeout(timer);
    } catch {
      // Confetti fallback
    }
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn select-none">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl border-4 border-yellow-400 text-center relative overflow-hidden">
        {/* Banner Title */}
        <div className="inline-block bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 text-amber-950 font-game font-extrabold text-xs md:text-sm px-4 py-1.5 rounded-full shadow-md border-2 border-white mb-2">
          MISI SELESAI DENGAN SUKSES!
        </div>

        <h2 className="font-game text-3xl md:text-4xl font-extrabold text-slate-800 mb-1">
          HEBAT! JUARA!
        </h2>
        <p className="font-game text-sm text-slate-500 mb-4">
          Kamu telah menyelesaikan {level.title}
        </p>

        {/* Stars Earned */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`transition-all duration-500 transform ${
                s <= stars ? 'scale-110' : 'scale-90 opacity-40'
              }`}
            >
              <Star
                className={`w-12 h-12 md:w-14 md:h-14 ${
                  s <= stars
                    ? 'fill-yellow-400 text-yellow-500 drop-shadow-[0_4px_0_rgba(202,138,4,0.6)]'
                    : 'text-slate-300 fill-slate-200'
                }`}
              />
            </div>
          ))}
        </div>

        {/* Breakdown Panel */}
        <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 space-y-2.5 mb-6 text-left font-game">
          <div className="flex items-center justify-between text-sm text-slate-700">
            <span className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-500" />
              Koin Emas Dikumpulkan
            </span>
            <span className="font-bold text-amber-600">{stats.coins}</span>
          </div>

          <div className="flex items-center justify-between text-sm text-slate-700">
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-500" />
              Sisa Waktu
            </span>
            <span className="font-bold text-sky-600">{stats.timeRemaining}s</span>
          </div>

          <div className="pt-2 border-t border-amber-200 flex items-center justify-between text-base font-bold text-slate-900">
            <span className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-600" />
              Total Skor
            </span>
            <span className="text-xl font-extrabold text-emerald-600 font-mono-score">
              {stats.score.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2.5">
          {hasNextLevel ? (
            <button
              onClick={onNextLevel}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-b from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-game text-base md:text-lg font-bold py-3 px-6 rounded-2xl game-btn-shadow border border-emerald-300 transition active:scale-95"
            >
              <span>DUNIA BERIKUTNYA</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <div className="p-3 bg-purple-50 text-purple-900 rounded-xl font-game font-bold text-sm border border-purple-200">
              Selamat! Kamu telah menamatkan seluruh Dunia Matematika SMP!
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onReplay}
              className="flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-game font-bold text-sm py-2.5 px-3 rounded-xl border border-slate-300 transition active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              <span>MAIN LAGI</span>
            </button>

            <button
              onClick={onMainMenu}
              className="flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-game font-bold text-sm py-2.5 px-3 rounded-xl border border-slate-300 transition active:scale-95"
            >
              <Menu className="w-4 h-4" />
              <span>MENU UTAMA</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
