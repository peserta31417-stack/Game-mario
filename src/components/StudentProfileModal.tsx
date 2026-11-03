import React, { useState } from 'react';
import { StudentProfile } from '../types/game';
import { saveCurrentStudent } from '../utils/studentDatabase';
import { User, School, Hash, CheckCircle, X, Sparkles } from 'lucide-react';

interface StudentProfileModalProps {
  currentStudent: StudentProfile | null;
  onSave: (student: StudentProfile) => void;
  onClose: () => void;
}

const DEFAULT_CLASSES = ['7A', '7B', '7C', '8A', '8B', '8C', '9A', '9B', '9C'];

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  currentStudent,
  onSave,
  onClose,
}) => {
  const [name, setName] = useState(currentStudent?.name || '');
  const [gradeClass, setGradeClass] = useState(currentStudent?.gradeClass || '9A');
  const [studentNumber, setStudentNumber] = useState(currentStudent?.studentNumber || '');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Harap masukkan Nama Lengkap kamu!');
      return;
    }
    if (!gradeClass.trim()) {
      setErrorMsg('Harap pilih atau masukkan Kelas!');
      return;
    }

    const student: StudentProfile = {
      id: currentStudent?.id || `std_${Date.now()}`,
      name: name.trim(),
      gradeClass: gradeClass.trim().toUpperCase(),
      studentNumber: studentNumber.trim() || undefined,
      registeredAt: currentStudent?.registeredAt || new Date().toISOString(),
    };

    saveCurrentStudent(student);
    onSave(student);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn select-none">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-4 border-amber-400 relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-game text-lg font-bold text-slate-800">
                PROFIL SISWA
              </h3>
              <p className="text-2xs text-slate-500 font-semibold">
                Masukkan identitas agar nilaimu tercatat di buku nilai guru
              </p>
            </div>
          </div>
          {currentStudent && (
            <button
              onClick={onClose}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {errorMsg && (
          <div className="mb-3 p-2.5 bg-red-100 text-red-800 rounded-xl text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold text-slate-700">
          {/* Name Field */}
          <div>
            <label className="block text-slate-800 font-bold mb-1">
              Nama Lengkap Siswa <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 focus-within:ring-2 focus-within:ring-amber-400 focus-within:bg-white transition">
              <User className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Contoh: Budi Santoso"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setErrorMsg(null);
                }}
                className="bg-transparent w-full text-sm font-semibold text-slate-800 focus:outline-hidden"
                autoFocus
              />
            </div>
          </div>

          {/* Grade Class Field */}
          <div>
            <label className="block text-slate-800 font-bold mb-1">
              Kelas SMP <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-amber-400 focus-within:bg-white transition mb-2">
              <School className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Pilih di bawah atau ketik kelas sendiri (misal: 9A)"
                value={gradeClass}
                onChange={(e) => setGradeClass(e.target.value)}
                className="bg-transparent w-full text-sm font-semibold text-slate-800 focus:outline-hidden"
              />
            </div>

            {/* Quick Class Pills */}
            <div className="flex flex-wrap gap-1.5">
              {DEFAULT_CLASSES.map((cls) => (
                <button
                  type="button"
                  key={cls}
                  onClick={() => setGradeClass(cls)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-game font-bold transition ${
                    gradeClass === cls
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cls}
                </button>
              ))}
            </div>
          </div>

          {/* Student Number (Nomor Absen) */}
          <div>
            <label className="block text-slate-800 font-bold mb-1">
              Nomor Absen (Opsional)
            </label>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 focus-within:ring-2 focus-within:ring-amber-400 focus-within:bg-white transition">
              <Hash className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Contoh: 14"
                value={studentNumber}
                onChange={(e) => setStudentNumber(e.target.value)}
                className="bg-transparent w-full text-sm font-semibold text-slate-800 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Submit CTA */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-b from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-amber-950 font-game text-sm md:text-base font-bold py-3 px-6 rounded-2xl game-btn-shadow border border-amber-300 transition active:scale-95 cursor-pointer"
            >
              <CheckCircle className="w-5 h-5 text-amber-950" />
              <span>SIMPAN IDENTITAS & MULAI</span>
            </button>
          </div>
        </form>

        <div className="mt-3 text-center text-3xs text-slate-400 font-medium">
          Setiap skor ujian dan level petualanganmu otomatis tersimpan di Buku Nilai Guru.
        </div>
      </div>
    </div>
  );
};
