import React from 'react';
import { GAME_LEVELS } from '../data/levels';
import { LevelConfig, PlayerStats } from '../types/game';
import { ArrowLeft, Star, Lock, Play, Trophy, Sparkles } from 'lucide-react';

interface LevelSelectProps {
  stats: PlayerStats;
  onSelectLevel: (level: LevelConfig) => void;
  onBack: () => void;
}

export const LevelSelect: React.FC<LevelSelectProps> = ({
  stats,
  onSelectLevel,
  onBack,
}) => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-sky-400 via-sky-300 to-emerald-400 p-4 md:p-8 flex flex-col justify-between select-none">
      <div className="max-w-5xl w-full mx-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 bg-white/95 text-slate-800 font-game font-bold text-sm md:text-base py-2 px-4 rounded-xl shadow-md border border-white hover:bg-white transition active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>KEMBALI KE MENU</span>
          </button>

          <div className="flex items-center gap-2 bg-white/95 text-yellow-600 font-game font-bold text-sm md:text-base py-2 px-4 rounded-xl shadow-md border border-white">
            <Star className="w-5 h-5 fill-yellow-400 text-yellow-500" />
            <span>{stats.totalStars} / 15 Total Bintang</span>
          </div>
        </div>

        {/* Section Heading */}
        <div className="text-center mb-6">
          <h2 className="font-game text-3xl md:text-4xl font-extrabold text-white drop-shadow-[0_4px_0_rgba(30,58,138,0.8)]">
            PILIH DUNIA PETUALANGAN
          </h2>
          <p className="font-game text-sm md:text-base font-semibold text-sky-950 mt-1">
            Selesaikan tantangan matematika di setiap level untuk membuka dunia berikutnya!
          </p>
        </div>

        {/* Level Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {GAME_LEVELS.map((level) => {
            const isUnlocked = level.id <= stats.unlockedLevel || level.id === 5;
            const stars = stats.levelStars[level.id] || 0;
            const highScore = stats.levelHighScores[level.id] || 0;

            return (
              <div
                key={level.id}
                className={`relative rounded-3xl p-5 border-4 transition-all duration-200 overflow-hidden ${
                  isUnlocked
                    ? level.id === 5
                      ? 'bg-gradient-to-br from-amber-50 to-white shadow-xl border-amber-400 md:col-span-2'
                      : 'bg-white shadow-xl border-amber-300 hover:border-amber-400'
                    : 'bg-slate-100/90 shadow-md border-slate-300 opacity-80'
                }`}
              >
                {/* Level Grade Tag */}
                <div className="flex items-center justify-between mb-3">
                  <span className="font-game text-xs font-bold text-sky-700 bg-sky-100 px-3 py-1 rounded-full border border-sky-200">
                    {level.gradeLabel}
                  </span>

                  {/* Stars Display */}
                  <div className="flex items-center gap-1">
                    {[1, 2, 3].map((starIdx) => (
                      <Star
                        key={starIdx}
                        className={`w-6 h-6 ${
                          starIdx <= stars
                            ? 'fill-yellow-400 text-yellow-500 animate-pulse'
                            : 'text-slate-300 fill-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Title & Description */}
                <h3 className="font-game text-xl md:text-2xl font-bold text-slate-800 mb-1">
                  {level.title}
                </h3>
                <p className="text-xs md:text-sm text-slate-600 mb-4 line-clamp-2">
                  {level.description}
                </p>

                {/* High Score & Play CTA */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 font-game">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    <span>Rekor: {highScore > 0 ? highScore.toLocaleString() : '-'}</span>
                  </div>

                  {isUnlocked ? (
                    <button
                      onClick={() => onSelectLevel(level)}
                      className="flex items-center gap-2 bg-gradient-to-b from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-game text-sm md:text-base font-bold py-2 px-5 rounded-xl game-btn-shadow border border-emerald-300 transition active:scale-95"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>MAINKAN</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 font-game bg-slate-200 px-3 py-1.5 rounded-xl">
                      <Lock className="w-4 h-4" />
                      <span>Terkunci (Selesaikan Dunia {level.id - 1})</span>
                    </div>
                  )}
                </div>

                {/* Decorative theme accent icon */}
                {isUnlocked && (
                  <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-amber-100 rounded-full opacity-40 pointer-events-none" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Helpful Hint */}
      <div className="max-w-md mx-auto text-center mt-6">
        <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm text-sky-950 font-game text-xs md:text-sm font-semibold px-4 py-2 rounded-2xl border border-white">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>Dapatkan 3 Bintang dengan mengumpulkan koin & menjawab semua soal dengan tepat!</span>
        </div>
      </div>
    </div>
  );
};
