import React, { useState } from 'react';
import { SoundSettings } from '../types/game';
import { X, Volume2, VolumeX, Music, Bell, RotateCcw, AlertTriangle } from 'lucide-react';

interface SettingsModalProps {
  settings: SoundSettings;
  onUpdateSettings: (newSettings: SoundSettings) => void;
  onResetData: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onResetData,
  onClose,
}) => {
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const handleToggleBgm = () => {
    onUpdateSettings({ ...settings, bgmEnabled: !settings.bgmEnabled });
  };

  const handleToggleSfx = () => {
    onUpdateSettings({ ...settings, sfxEnabled: !settings.sfxEnabled });
  };

  const handleChangeVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const volume = parseFloat(e.target.value);
    onUpdateSettings({ ...settings, volume });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn select-none">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-4 border-amber-400 relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-amber-500" />
            <span className="font-game text-xl font-bold text-slate-800">
              PENGATURAN SUARA
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Audio Controls */}
        <div className="space-y-4 mb-6">
          {/* Master Volume Slider */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-2 font-game font-semibold text-xs text-slate-700">
              <span>Volume Utama</span>
              <span className="font-mono-score font-bold">{Math.round(settings.volume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.volume}
              onChange={handleChangeVolume}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>

          {/* BGM Toggle */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-3">
              <Music className="w-5 h-5 text-sky-600" />
              <div>
                <span className="font-game font-bold text-slate-800 block text-sm">
                  Musik Latar (BGM)
                </span>
                <span className="text-xs text-slate-500">
                  Melodi petualangan retro 8-bit
                </span>
              </div>
            </div>

            <button
              onClick={handleToggleBgm}
              className={`w-12 h-7 flex items-center rounded-full p-1 transition-colors ${
                settings.bgmEnabled ? 'bg-emerald-500 justify-end' : 'bg-slate-300 justify-start'
              }`}
            >
              <div className="bg-white w-5 h-5 rounded-full shadow-md" />
            </button>
          </div>

          {/* SFX Toggle */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-amber-600" />
              <div>
                <span className="font-game font-bold text-slate-800 block text-sm">
                  Efek Suara (SFX)
                </span>
                <span className="text-xs text-slate-500">
                  Lompatan, koin, benturan, & jawaban
                </span>
              </div>
            </div>

            <button
              onClick={handleToggleSfx}
              className={`w-12 h-7 flex items-center rounded-full p-1 transition-colors ${
                settings.sfxEnabled ? 'bg-emerald-500 justify-end' : 'bg-slate-300 justify-start'
              }`}
            >
              <div className="bg-white w-5 h-5 rounded-full shadow-md" />
            </button>
          </div>
        </div>

        {/* Reset Data Section */}
        <div className="pt-3 border-t border-slate-100">
          {!showConfirmReset ? (
            <button
              onClick={() => setShowConfirmReset(true)}
              className="w-full flex items-center justify-center gap-2 text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 py-2.5 px-3 rounded-xl font-game text-xs font-bold border border-red-200 transition"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Seluruh Progres Permainan</span>
            </button>
          ) : (
            <div className="p-3 bg-red-50 rounded-2xl border border-red-200 text-center animate-fadeIn">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-red-700 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span>Yakin ingin mereset semua bintang & koin?</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onResetData();
                    setShowConfirmReset(false);
                    onClose();
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-game font-bold text-xs py-2 rounded-xl transition"
                >
                  Ya, Reset Sekarang
                </button>
                <button
                  onClick={() => setShowConfirmReset(false)}
                  className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-game font-bold text-xs py-2 rounded-xl transition"
                >
                  Batal
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
