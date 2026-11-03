import React, { useState, useEffect } from 'react';
import { MathQuestion, PlayerStats, StudentProfile } from '../types/game';
import { SMP9_TABUNG_KERUCUT_QUESTIONS } from '../data/defaultQuestions';
import { soundManager } from '../utils/audio';
import { saveScoreRecord } from '../utils/studentDatabase';
import confetti from 'canvas-confetti';
import {
  Clock,
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Award,
  ChevronRight,
  Play,
  X,
} from 'lucide-react';

interface SpecialMissionModalProps {
  stats: PlayerStats;
  currentStudent: StudentProfile | null;
  onUpdateStats: (newStats: PlayerStats) => void;
  onPlayInPlatformer: () => void;
  onClose: () => void;
}

export const SpecialMissionModal: React.FC<SpecialMissionModalProps> = ({
  stats,
  currentStudent,
  onUpdateStats,
  onPlayInPlatformer,
  onClose,
}) => {
  const questions = SMP9_TABUNG_KERUCUT_QUESTIONS;
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(600); // 10 minutes = 600s
  const [isFinished, setIsFinished] = useState(false);
  const [showFormulaSheet, setShowFormulaSheet] = useState(false);

  // 10-Minute Countdown Timer
  useEffect(() => {
    if (isFinished) return;

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleFinishQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isFinished]);

  const currentQuestion: MathQuestion = questions[currentIdx];
  const hasAnsweredCurrent = selectedAnswers[currentIdx] !== undefined;

  const handleSelectOption = (optIdx: number) => {
    if (hasAnsweredCurrent || isFinished) return;

    const isCorrect = optIdx === currentQuestion.correctAnswerIndex;
    setSelectedAnswers((prev) => ({ ...prev, [currentIdx]: optIdx }));
    setShowExplanation(true);

    if (isCorrect) {
      soundManager.playCorrect();
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch {}
    } else {
      soundManager.playWrong();
    }
  };

  const handleNext = () => {
    setShowExplanation(false);
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      handleFinishQuiz();
    }
  };

  const handleFinishQuiz = () => {
    setIsFinished(true);
    soundManager.playVictory();

    // Calculate score & stats
    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswerIndex) {
        correctCount++;
      }
    });

    const totalAnswered = Object.keys(selectedAnswers).length;
    const earnedStars = correctCount >= 4 ? 3 : correctCount >= 2 ? 2 : 1;
    const earnedCoins = correctCount * 5;

    // Update global progress
    onUpdateStats({
      ...stats,
      totalCoins: stats.totalCoins + earnedCoins,
      totalQuestionsAnswered: stats.totalQuestionsAnswered + totalAnswered,
      correctAnswersCount: stats.correctAnswersCount + correctCount,
      highScore: stats.highScore + correctCount * 500,
    });

    // Save student score record to Teacher Database
    const scoreOutOf100 = Math.round((correctCount / questions.length) * 100);
    saveScoreRecord({
      studentId: currentStudent?.id || `std_${Date.now()}`,
      studentName: currentStudent?.name || 'Siswa Mandiri',
      gradeClass: currentStudent?.gradeClass || 'SMP 9',
      studentNumber: currentStudent?.studentNumber,
      missionTitle: 'Volume Tabung & Kerucut (SMP 9)',
      category: 'UJIAN_KHUSUS',
      score: scoreOutOf100,
      pointsEarned: correctCount * 500,
      coinsEarned: earnedCoins,
      correctAnswers: correctCount,
      totalQuestions: questions.length,
      accuracy: scoreOutOf100,
      timeSpentSeconds: 600 - secondsRemaining,
    });

    try {
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.5 },
      });
    } catch {}
  };

  const handleRetry = () => {
    setCurrentIdx(0);
    setSelectedAnswers({});
    setShowExplanation(false);
    setSecondsRemaining(600);
    setIsFinished(false);
  };

  // Timer formatting (MM:SS)
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  // Timer color indicator
  const timerColor =
    secondsRemaining > 180
      ? 'text-sky-700 bg-sky-100 border-sky-300'
      : secondsRemaining > 60
      ? 'text-amber-700 bg-amber-100 border-amber-300 animate-pulse'
      : 'text-red-700 bg-red-100 border-red-300 animate-ping';

  // Result calculations
  const correctCount = questions.filter(
    (q, idx) => selectedAnswers[idx] === q.correctAnswerIndex
  ).length;
  const timeSpentSecs = 600 - secondsRemaining;
  const accuracyPct = Math.round((correctCount / questions.length) * 100);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 animate-fadeIn select-none">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-5 md:p-7 shadow-2xl border-4 border-amber-400 relative flex flex-col max-h-[94vh] overflow-hidden">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <span className="font-game text-xs font-bold text-amber-950 bg-amber-300 px-3 py-1 rounded-full border border-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              SMP KELAS 9
            </span>
            <span className="font-game text-sm md:text-base font-extrabold text-slate-800">
              Volume Tabung & Kerucut
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Live 10-Minute Countdown Clock */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border font-mono-score font-bold text-sm ${timerColor}`}
              title="Waktu pengerjaan maksimal 10 menit"
            >
              <Clock className="w-4 h-4" />
              <span>{formatTime(secondsRemaining)}</span>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              title="Tutup"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* ACTIVE TEST VIEW */}
        {!isFinished ? (
          <div className="flex-1 flex flex-col min-h-0 overflow-y-auto pr-1">
            {/* Progress Bar & Question Tabs */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-1.5">
                {questions.map((_, idx) => {
                  const isCurrent = idx === currentIdx;
                  const isAnswered = selectedAnswers[idx] !== undefined;
                  const isAnsCorrect = selectedAnswers[idx] === questions[idx].correctAnswerIndex;

                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setCurrentIdx(idx);
                        setShowExplanation(selectedAnswers[idx] !== undefined);
                      }}
                      className={`w-7 h-7 rounded-lg font-game text-xs font-bold transition flex items-center justify-center ${
                        isCurrent
                          ? 'ring-2 ring-amber-500 bg-amber-400 text-amber-950 shadow-sm'
                          : isAnswered
                          ? isAnsCorrect
                            ? 'bg-emerald-500 text-white'
                            : 'bg-red-500 text-white'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Cheat Sheet Toggle Button */}
              <button
                onClick={() => setShowFormulaSheet(!showFormulaSheet)}
                className="flex items-center gap-1 text-xs font-game font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 px-2.5 py-1 rounded-xl border border-sky-200 transition"
              >
                <BookOpen className="w-3.5 h-3.5 text-sky-600" />
                <span>{showFormulaSheet ? 'Sembunyikan Rumus' : 'Buka Rumus'}</span>
              </button>
            </div>

            {/* Formula Cheat Sheet & Diagram (Collapsible) */}
            {showFormulaSheet && (
              <div className="p-3.5 mb-4 bg-gradient-to-r from-sky-50 to-amber-50 rounded-2xl border border-sky-200 text-xs text-slate-800 space-y-2 animate-fadeIn">
                <div className="font-game font-bold text-sm text-sky-950 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Kunci Rumus Bangun Ruang Sisi Lengkung:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                    <strong className="text-amber-800 block mb-1">1. Volume Tabung:</strong>
                    <code className="text-2xs font-mono font-bold bg-amber-100 text-amber-950 px-2 py-0.5 rounded-md">
                      V = π × r² × t
                    </code>
                    <p className="text-3xs text-slate-500 mt-1">
                      r = jari-jari alas, t = tinggi tabung. Jika d diketahui, r = d/2.
                    </p>
                  </div>

                  <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                    <strong className="text-amber-800 block mb-1">2. Volume Kerucut:</strong>
                    <code className="text-2xs font-mono font-bold bg-amber-100 text-amber-950 px-2 py-0.5 rounded-md">
                      V = (1/3) × π × r² × t
                    </code>
                    <p className="text-3xs text-slate-500 mt-1">
                      s² = r² + t² (Garis pelukis). Volume kerucut = 1/3 volume tabung.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Question Card */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="font-game text-xs font-bold text-slate-500">
                  Soal {currentIdx + 1} dari 5
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-2xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {currentQuestion.topic}
                </span>
              </div>

              <h3 className="font-game text-base md:text-lg font-bold text-slate-900 leading-snug">
                {currentQuestion.question}
              </h3>

              {currentQuestion.formula && (
                <div className="mt-2 p-2 bg-amber-50 rounded-xl border border-amber-200 text-center font-mono text-xs md:text-sm font-bold text-amber-900">
                  Petunjuk Rumus: {currentQuestion.formula}
                </div>
              )}
            </div>

            {/* Multiple Choice Options */}
            <div className="space-y-2 mb-4">
              {currentQuestion.options.map((opt, optIdx) => {
                const isSelected = selectedAnswers[currentIdx] === optIdx;
                const isAnswered = selectedAnswers[currentIdx] !== undefined;
                const isCorrect = optIdx === currentQuestion.correctAnswerIndex;

                let btnStyle = 'bg-slate-50 hover:bg-amber-50 border-slate-200 text-slate-800';

                if (isAnswered) {
                  if (isCorrect) {
                    btnStyle = 'bg-emerald-100 border-emerald-500 text-emerald-950 font-bold';
                  } else if (isSelected) {
                    btnStyle = 'bg-red-100 border-red-500 text-red-950 font-bold';
                  } else {
                    btnStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
                  }
                }

                return (
                  <button
                    key={optIdx}
                    disabled={isAnswered}
                    onClick={() => handleSelectOption(optIdx)}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl border-2 text-left transition ${btnStyle} ${
                      !isAnswered ? 'cursor-pointer active:scale-99' : 'cursor-default'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-game font-bold text-xs ${
                        isAnswered && isCorrect
                          ? 'bg-emerald-600 text-white'
                          : isAnswered && isSelected
                          ? 'bg-red-600 text-white'
                          : 'bg-white text-slate-700 border border-slate-300'
                      }`}>
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span className="font-game text-sm font-semibold">{opt}</span>
                    </div>

                    {isAnswered && isCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    )}
                    {isAnswered && isSelected && !isCorrect && (
                      <XCircle className="w-5 h-5 text-red-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation Section */}
            {hasAnsweredCurrent && (
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 mb-4 animate-fadeIn">
                <div className="font-game font-bold mb-1 flex items-center gap-1.5 text-slate-900">
                  <HelpCircle className="w-4 h-4 text-amber-500" />
                  <span>Pembahasan Langkah demi Langkah:</span>
                </div>
                <p className="leading-relaxed text-slate-800">{currentQuestion.explanation}</p>
              </div>
            )}

            {/* Bottom Navigation */}
            <div className="pt-2 flex items-center justify-between gap-3 mt-auto border-t border-slate-100">
              <button
                disabled={currentIdx === 0}
                onClick={() => {
                  setCurrentIdx(currentIdx - 1);
                  setShowExplanation(selectedAnswers[currentIdx - 1] !== undefined);
                }}
                className="text-xs font-game font-bold text-slate-600 disabled:opacity-40 hover:text-slate-900 py-2 px-3 rounded-xl border border-slate-200 transition"
              >
                Sebelumnya
              </button>

              <button
                onClick={handleNext}
                disabled={!hasAnsweredCurrent}
                className="flex items-center gap-1.5 bg-gradient-to-b from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 disabled:opacity-40 text-white font-game text-xs md:text-sm font-bold py-2.5 px-5 rounded-xl game-btn-shadow border border-emerald-300 transition"
              >
                <span>{currentIdx < questions.length - 1 ? 'Soal Berikutnya' : 'Selesai & Lihat Nilai'}</span>
                {currentIdx < questions.length - 1 ? (
                  <ChevronRight className="w-4 h-4" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        ) : (
          /* RESULT / CERTIFICATE VIEW */
          <div className="flex-1 flex flex-col items-center justify-center text-center p-2 overflow-y-auto">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-2 border-2 border-amber-300 shadow-md">
              <Award className="w-9 h-9 text-amber-600" />
            </div>

            <div className="inline-block bg-amber-300 text-amber-950 font-game font-extrabold text-xs px-3 py-1 rounded-full mb-1">
              HASIL UJIAN 10 MENIT
            </div>

            <h3 className="font-game text-2xl md:text-3xl font-black text-slate-800 mb-1">
              {correctCount === 5 ? 'SEMPURNA! MASTER MATEMATIKA' : 'HEBAT! TUGAS SELESAI'}
            </h3>
            <p className="font-game text-xs text-slate-500 mb-4 max-w-sm">
              Materi Bangun Ruang Sisi Lengkung (Volume Tabung & Kerucut) SMP Kelas 9
            </p>

            {/* Scorecard Box */}
            <div className="grid grid-cols-3 gap-3 w-full max-w-md bg-slate-50 p-3.5 rounded-2xl border border-slate-200 mb-4 font-game">
              <div>
                <span className="block text-2xs font-bold text-slate-500 uppercase">Jawaban Benar</span>
                <span className="text-xl font-black text-emerald-600">{correctCount} / 5</span>
              </div>
              <div>
                <span className="block text-2xs font-bold text-slate-500 uppercase">Nilai Akurasi</span>
                <span className="text-xl font-black text-sky-600 font-mono-score">{accuracyPct}%</span>
              </div>
              <div>
                <span className="block text-2xs font-bold text-slate-500 uppercase">Waktu Selesai</span>
                <span className="text-xl font-black text-amber-600 font-mono-score">{formatTime(timeSpentSecs)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="w-full max-w-md space-y-2.5">
              <button
                onClick={onPlayInPlatformer}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-b from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-amber-950 font-game text-sm font-bold py-3 px-4 rounded-xl game-btn-shadow border border-amber-300 transition"
              >
                <Play className="w-4 h-4 fill-amber-950" />
                <span>MAINKAN DI DUNIA PLATFORMER (DUNIA 5)</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleRetry}
                  className="flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-game font-bold text-xs py-2.5 rounded-xl border border-slate-300 transition"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>ULANGI TES</span>
                </button>

                <button
                  onClick={onClose}
                  className="flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-game font-bold text-xs py-2.5 rounded-xl border border-slate-300 transition"
                >
                  <span>KEMBALI KE MENU</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
