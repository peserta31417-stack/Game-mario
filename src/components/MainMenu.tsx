import React from 'react';
import { PlayerStats } from '../types/game';
import { Play, Map, BookOpen, Volume2, GraduationCap, Trophy, Coins, Star, Sparkles, Clock, ArrowRight, User } from 'lucide-react';

import { StudentProfile } from '../types/game';

interface MainMenuProps {
  stats: PlayerStats;
  currentStudent: StudentProfile | null;
  onOpenStudentProfile: () => void;
  onStartAdventure: () => void;
  onOpenLevelSelect: () => void;
  onOpenGuide: () => void;
  onOpenSettings: () => void;
  onOpenTeacherMode: () => void;
  onOpenSpecialMission: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  stats,
  currentStudent,
  onOpenStudentProfile,
  onStartAdventure,
  onOpenLevelSelect,
  onOpenGuide,
  onOpenSettings,
  onOpenTeacherMode,
  onOpenSpecialMission,
}) => {
  return (
    <div className="relative min-h-screen w-full bg-gradient-to-b from-sky-400 via-sky-300 to-emerald-400 flex flex-col justify-between p-4 md:p-8 select-none overflow-hidden">
      {/* Background Floating Decorative Clouds */}
      <div className="absolute top-8 left-10 opacity-80 pointer-events-none animate-float">
        <div className="w-28 h-12 bg-white rounded-full relative shadow-sm">
          <div className="w-14 h-14 bg-white rounded-full absolute -top-6 left-4" />
          <div className="w-16 h-16 bg-white rounded-full absolute -top-8 left-10" />
        </div>
      </div>
      <div className="absolute top-20 right-14 opacity-80 pointer-events-none animate-float" style={{ animationDelay: '2s' }}>
        <div className="w-36 h-14 bg-white rounded-full relative shadow-sm">
          <div className="w-16 h-16 bg-white rounded-full absolute -top-7 left-6" />
          <div className="w-20 h-20 bg-white rounded-full absolute -top-10 left-14" />
        </div>
      </div>
      <div className="absolute top-44 left-1/4 opacity-60 pointer-events-none animate-float" style={{ animationDelay: '1s' }}>
        <div className="w-24 h-10 bg-white rounded-full relative shadow-sm">
          <div className="w-12 h-12 bg-white rounded-full absolute -top-5 left-6" />
        </div>
      </div>

      {/* Top Player Stats Ribbon */}
      <header className="relative z-10 max-w-4xl w-full mx-auto bg-white/95 backdrop-blur-md rounded-2xl p-3 md:p-4 shadow-lg border-2 border-white/60">
        <div className="flex flex-wrap items-center justify-between gap-3 text-slate-700 font-game">
          <button
            onClick={onOpenStudentProfile}
            className="flex items-center gap-2 bg-amber-50 hover:bg-amber-100 text-amber-950 px-3 py-1.5 rounded-xl border border-amber-300 transition cursor-pointer active:scale-95"
            title="Klik untuk memasukkan atau mengubah nama siswa"
          >
            <div className="w-6 h-6 rounded-lg bg-amber-200 flex items-center justify-center text-amber-800">
              <User className="w-4 h-4" />
            </div>
            <div className="text-left">
              <span className="block text-2xs font-extrabold text-slate-800 leading-tight">
                {currentStudent ? currentStudent.name : 'Belum Ada Nama'}
              </span>
              <span className="block text-3xs font-bold text-amber-800">
                {currentStudent ? `Kelas ${currentStudent.gradeClass}` : 'Klik untuk Masukkan Nama'}
              </span>
            </div>
            <span className="ml-1 text-3xs bg-amber-400 text-amber-950 px-1.5 py-0.5 rounded-md font-bold">
              {currentStudent ? 'Ubah' : 'Isi Nama'}
            </span>
          </button>

          <div className="flex flex-wrap items-center gap-4 text-xs md:text-sm font-semibold">
            <div className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200">
              <Coins className="w-4 h-4" />
              <span>{stats.totalCoins} Koin</span>
            </div>

            <div className="flex items-center gap-1.5 text-yellow-600 bg-yellow-50 px-2.5 py-1 rounded-xl border border-yellow-200">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-500" />
              <span>{stats.totalStars} / 12 Bintang</span>
            </div>

            <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
              <Map className="w-4 h-4" />
              <span>Dunia {stats.unlockedLevel}/4</span>
            </div>

            <div className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-2.5 py-1 rounded-xl border border-blue-200">
              <Trophy className="w-4 h-4" />
              <span>Rekor: {stats.highScore.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Center Hero & Title */}
      <main className="relative z-10 max-w-3xl w-full mx-auto text-center my-auto py-6">
        {/* Animated Badge */}
        <div className="inline-flex items-center gap-2 bg-amber-400/90 text-amber-950 font-game text-xs md:text-sm font-bold px-4 py-1.5 rounded-full shadow-md mb-3 border-2 border-amber-200">
          <Sparkles className="w-4 h-4 text-amber-900 animate-spin" style={{ animationDuration: '6s' }} />
          <span>GAME PLATFORMER MATEMATIKA KURIKULUM MERDEKA & K13</span>
        </div>

        {/* Big Game Title */}
        <h1 className="font-game text-4xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-tight drop-shadow-[0_6px_0_rgba(180,83,9,0.9)] mb-2">
          <span className="text-red-500 drop-shadow-[0_6px_0_rgba(153,27,27,1)]">M</span>
          <span className="text-amber-400 drop-shadow-[0_6px_0_rgba(180,83,9,1)]">A</span>
          <span className="text-emerald-400 drop-shadow-[0_6px_0_rgba(21,128,61,1)]">R</span>
          <span className="text-blue-500 drop-shadow-[0_6px_0_rgba(30,64,175,1)]">I</span>
          <span className="text-purple-400 drop-shadow-[0_6px_0_rgba(107,33,168,1)]">O </span>
          <span className="text-yellow-300 drop-shadow-[0_6px_0_rgba(180,83,9,1)]">MATH</span>
          <br className="sm:hidden" />
          <span className="text-white drop-shadow-[0_6px_0_rgba(30,58,138,1)]"> ADVENTURE</span>
        </h1>

        {/* Subtitle */}
        <p className="font-game text-base sm:text-xl md:text-2xl font-bold text-sky-950 bg-white/70 backdrop-blur-sm px-6 py-2 rounded-2xl max-w-xl mx-auto shadow-sm border border-white/80 mb-6">
          “Jelajahi Dunia, Pecahkan Soal, Raih Kemenangan!”
        </p>

        {/* Original Mascot Character Preview */}
        <div className="relative inline-block mb-6">
          <div className="w-32 h-32 md:w-40 md:h-40 mx-auto bg-gradient-to-tr from-amber-300 to-yellow-100 rounded-full border-4 border-white shadow-xl flex items-center justify-center relative overflow-hidden group hover:scale-105 transition-transform">
            {/* Mascot Character Avatar SVG */}
            <svg viewBox="0 0 100 100" className="w-28 h-28 md:w-36 md:h-36 drop-shadow-md">
              {/* Character Face & Body */}
              <circle cx="50" cy="52" r="22" fill="#FCD34D" />
              {/* Cheeks */}
              <circle cx="38" cy="56" r="4.5" fill="#F87171" opacity="0.6" />
              <circle cx="62" cy="56" r="4.5" fill="#F87171" opacity="0.6" />
              {/* Big Eyes */}
              <ellipse cx="43" cy="49" rx="3.5" ry="4.5" fill="#0F172A" />
              <ellipse cx="57" cy="49" rx="3.5" ry="4.5" fill="#0F172A" />
              <circle cx="44.5" cy="47" r="1.5" fill="#FFFFFF" />
              <circle cx="58.5" cy="47" r="1.5" fill="#FFFFFF" />
              {/* Joyful Smile */}
              <path d="M 44 58 Q 50 66 56 58" stroke="#0F172A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              {/* Blue Adventurer Shirt */}
              <path d="M 32 72 Q 50 68 68 72 L 72 96 Q 50 100 28 96 Z" fill="#2563EB" />
              {/* Yellow Overalls Buttons */}
              <circle cx="40" cy="78" r="3" fill="#F59E0B" />
              <circle cx="60" cy="78" r="3" fill="#F59E0B" />
              {/* Red Adventurer Cap */}
              <path d="M 24 45 Q 50 16 76 45 Z" fill="#DC2626" />
              {/* Cap Brim */}
              <ellipse cx="50" cy="43" rx="27" ry="6" fill="#B91C1C" />
              {/* Cap Badge with Math Symbol '+' */}
              <circle cx="50" cy="30" r="9" fill="#FFFFFF" />
              <text x="50" y="34" fontSize="13" fontWeight="bold" fontFamily="Fredoka, sans-serif" fill="#DC2626" textAnchor="middle">+</text>
            </svg>
          </div>
          <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-yellow-950 text-xs font-bold font-game px-3 py-1 rounded-full border-2 border-white shadow-md">
            Rio Petualang
          </div>
        </div>

        {/* Featured Mission Banner: SMP 9 Volume Tabung & Kerucut (5 Soal • 10 Menit) */}
        <div className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 p-1 rounded-3xl shadow-xl max-w-lg mx-auto mb-5 border-2 border-white hover:scale-[1.01] transition-transform">
          <div className="bg-white/95 backdrop-blur-xs rounded-2xl p-3 sm:p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0 border border-amber-300">
                <Sparkles className="w-6 h-6 text-amber-600 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-game text-3xs font-extrabold text-white bg-red-600 px-2 py-0.5 rounded-full">
                    SMP KELAS 9
                  </span>
                  <span className="font-game text-3xs font-bold text-amber-800 flex items-center gap-1 bg-amber-100 px-2 py-0.5 rounded-full">
                    <Clock className="w-3 h-3 text-amber-700" /> 5 SOAL • MAKS 10 MENIT
                  </span>
                </div>
                <h4 className="font-game text-sm md:text-base font-extrabold text-slate-900 leading-tight">
                  Misi Khusus: Volume Tabung & Kerucut
                </h4>
              </div>
            </div>

            <button
              onClick={onOpenSpecialMission}
              className="w-full sm:w-auto bg-gradient-to-b from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-amber-950 font-game text-xs md:text-sm font-black py-2.5 px-4 rounded-xl game-btn-shadow border border-amber-300 transition shrink-0 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>MULAI TANTANGAN</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Action Menu Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 max-w-lg mx-auto">
          {/* Main Action: Mulai Petualangan */}
          <button
            onClick={onStartAdventure}
            className="w-full sm:w-auto flex-1 flex items-center justify-center gap-3 bg-gradient-to-b from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-game text-lg md:text-xl font-bold py-3.5 px-6 rounded-2xl game-btn-shadow border-2 border-emerald-300 transition-transform active:scale-95"
          >
            <Play className="w-6 h-6 fill-white" />
            <span>MULAI PETUALANGAN</span>
          </button>

          {/* Pilih Level */}
          <button
            onClick={onOpenLevelSelect}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-gradient-to-b from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-amber-950 font-game text-base md:text-lg font-bold py-3 px-5 rounded-2xl game-btn-shadow border-2 border-amber-200 transition-transform active:scale-95"
          >
            <Map className="w-5 h-5 text-amber-900" />
            <span>PILIH LEVEL</span>
          </button>
        </div>

        {/* Secondary Utility Controls */}
        <div className="grid grid-cols-3 gap-2 md:gap-3 max-w-md mx-auto mt-4 font-game text-xs md:text-sm">
          <button
            onClick={onOpenGuide}
            className="flex flex-col items-center justify-center gap-1.5 bg-white/90 hover:bg-white text-slate-800 font-bold py-2.5 px-2 rounded-xl shadow-md border border-white transition active:scale-95"
          >
            <BookOpen className="w-5 h-5 text-sky-600" />
            <span>PANDUAN</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="flex flex-col items-center justify-center gap-1.5 bg-white/90 hover:bg-white text-slate-800 font-bold py-2.5 px-2 rounded-xl shadow-md border border-white transition active:scale-95"
          >
            <Volume2 className="w-5 h-5 text-amber-600" />
            <span>SUARA</span>
          </button>

          <button
            onClick={onOpenTeacherMode}
            className="flex flex-col items-center justify-center gap-1.5 bg-white/90 hover:bg-white text-slate-800 font-bold py-2.5 px-2 rounded-xl shadow-md border border-white transition active:scale-95"
          >
            <GraduationCap className="w-5 h-5 text-purple-600" />
            <span>MODE GURU</span>
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center text-xs text-sky-950 font-semibold bg-white/40 backdrop-blur-xs py-2 px-4 rounded-xl max-w-md mx-auto">
        Koleksi Soal Terstandar SMP Kelas 7, 8, dan 9 • Dapat dimainkan di HP Android, Tablet, & Laptop
      </footer>
    </div>
  );
};
