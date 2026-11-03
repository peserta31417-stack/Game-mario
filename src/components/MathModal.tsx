import React, { useState } from 'react';
import { MathQuestion } from '../types/game';
import { CheckCircle2, XCircle, HelpCircle, ArrowRight, Lightbulb, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface MathModalProps {
  question: MathQuestion;
  onAnswer: (isCorrect: boolean) => void;
}

export const MathModal: React.FC<MathModalProps> = ({ question, onAnswer }) => {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedIdx(idx);
    setIsAnswered(true);

    const isCorrect = idx === question.correctAnswerIndex;
    if (isCorrect) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch {
        // Safe fallback if confetti unavailable
      }
    }
  };

  const handleContinue = () => {
    const isCorrect = selectedIdx === question.correctAnswerIndex;
    onAnswer(isCorrect);
  };

  const isCorrect = selectedIdx === question.correctAnswerIndex;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 animate-fadeIn select-none">
      <div className="bg-white rounded-3xl max-w-xl w-full p-5 md:p-7 shadow-2xl border-4 border-amber-400 relative overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header Badge */}
        <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="font-game text-xs font-bold text-amber-950 bg-amber-300 px-3 py-1 rounded-full border border-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              BALOK MISTERI ?
            </span>
            <span className="text-xs font-semibold text-slate-500">
              {question.grade} • {question.topic}
            </span>
          </div>
        </div>

        {/* Question Text */}
        <div className="mb-5">
          <h3 className="font-game text-lg md:text-xl font-bold text-slate-900 leading-snug">
            {question.question}
          </h3>
          {question.formula && (
            <div className="mt-2.5 p-3 bg-amber-50 rounded-xl border border-amber-200 text-center font-mono-score font-bold text-amber-900 text-base md:text-lg">
              {question.formula}
            </div>
          )}
        </div>

        {/* Options List */}
        <div className="space-y-2.5 mb-5 overflow-y-auto">
          {question.options.map((opt, idx) => {
            const letter = String.fromCharCode(65 + idx); // A, B, C, D
            let btnStyle = 'bg-slate-50 hover:bg-amber-50 border-slate-200 text-slate-800';

            if (isAnswered) {
              if (idx === question.correctAnswerIndex) {
                btnStyle = 'bg-emerald-100 border-emerald-500 text-emerald-950 font-bold';
              } else if (idx === selectedIdx) {
                btnStyle = 'bg-red-100 border-red-500 text-red-950 font-bold';
              } else {
                btnStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
              }
            }

            return (
              <button
                key={idx}
                disabled={isAnswered}
                onClick={() => handleSelectOption(idx)}
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl border-2 text-left transition-all ${btnStyle} ${
                  !isAnswered ? 'active:scale-98 cursor-pointer' : 'cursor-default'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-game font-bold text-sm ${
                    isAnswered && idx === question.correctAnswerIndex
                      ? 'bg-emerald-600 text-white'
                      : isAnswered && idx === selectedIdx
                      ? 'bg-red-600 text-white'
                      : 'bg-white text-slate-700 shadow-sm border border-slate-300'
                  }`}>
                    {letter}
                  </span>
                  <span className="font-game text-sm md:text-base font-semibold">
                    {opt}
                  </span>
                </div>

                {isAnswered && idx === question.correctAnswerIndex && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                )}
                {isAnswered && idx === selectedIdx && idx !== question.correctAnswerIndex && (
                  <XCircle className="w-5 h-5 text-red-600 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Explanation & Result (Appears after answer) */}
        {isAnswered && (
          <div className="mb-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 animate-fadeIn">
            <div className="flex items-center gap-2 mb-1.5 font-game font-bold text-sm">
              {isCorrect ? (
                <span className="text-emerald-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Jawaban Benar! (+500 Poin & 5 Koin)
                </span>
              ) : (
                <span className="text-red-700 flex items-center gap-1.5">
                  <XCircle className="w-4 h-4 text-red-600" />
                  Kurang Tepat!
                </span>
              )}
            </div>

            <div className="flex items-start gap-2 text-xs md:text-sm text-slate-700 mt-2">
              <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-800">Pembahasan: </span>
                <span>{question.explanation}</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-2">
          {isAnswered ? (
            <button
              onClick={handleContinue}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-b from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-game text-base md:text-lg font-bold py-3 px-6 rounded-2xl game-btn-shadow border border-emerald-300 transition active:scale-95"
            >
              <span>LANJUTKAN PERJALANAN</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-500">
              <HelpCircle className="w-4 h-4 text-amber-500" />
              <span>Pilih salah satu jawaban yang menurutmu paling tepat.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
