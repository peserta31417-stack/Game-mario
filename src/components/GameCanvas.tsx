import React, { useEffect, useRef, useState, useCallback } from 'react';
import { LevelConfig, MathQuestion, PlayerStats, SoundSettings, StudentProfile } from '../types/game';
import { PlatformerEngine } from '../game/engine';
import { MathModal } from './MathModal';
import { VictoryModal } from './VictoryModal';
import { GameOverModal } from './GameOverModal';
import { soundManager } from '../utils/audio';
import { saveScoreRecord } from '../utils/studentDatabase';
import {
  Heart,
  Coins,
  Clock,
  Pause,
  Play,
  Volume2,
  VolumeX,
  RotateCcw,
  Menu,
  ArrowLeft,
  ArrowRight,
  Zap,
} from 'lucide-react';

interface GameCanvasProps {
  level: LevelConfig;
  allQuestions: MathQuestion[];
  stats: PlayerStats;
  currentStudent: StudentProfile | null;
  soundSettings: SoundSettings;
  onUpdateStats: (newStats: PlayerStats) => void;
  onToggleSound: () => void;
  onBackToMenu: () => void;
  onSelectNextLevel: (nextLevelId: number) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  level,
  allQuestions,
  stats,
  currentStudent,
  soundSettings,
  onUpdateStats,
  onToggleSound,
  onBackToMenu,
  onSelectNextLevel,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<PlatformerEngine | null>(null);

  // HUD State
  const [currentScore, setCurrentScore] = useState(0);
  const [currentCoins, setCurrentCoins] = useState(0);
  const [currentLives, setCurrentLives] = useState(3);
  const [timeRemaining, setTimeRemaining] = useState(level.timeLimit);
  const [isPaused, setIsPaused] = useState(false);

  // Modals
  const [activeQuestion, setActiveQuestion] = useState<MathQuestion | null>(null);
  const [questionResolver, setQuestionResolver] = useState<((correct: boolean) => void) | null>(null);
  const [victoryData, setVictoryData] = useState<{ timeRemaining: number; coins: number; score: number } | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);

  // Refs to prevent unnecessary re-creations
  const statsRef = useRef(stats);
  statsRef.current = stats;
  const onUpdateStatsRef = useRef(onUpdateStats);
  onUpdateStatsRef.current = onUpdateStats;
  const studentRef = useRef(currentStudent);
  studentRef.current = currentStudent;

  // Setup Engine (Only restarts when level.id changes or user explicitly replays)
  const startLevel = useCallback(() => {
    if (!canvasRef.current) return;

    // Fixed internal platformer resolution (800 x 480) with responsive CSS display scaling
    const canvas = canvasRef.current;
    canvas.width = 800;
    canvas.height = 480;

    // Reset HUD
    setCurrentScore(0);
    setCurrentCoins(0);
    setCurrentLives(3);
    setTimeRemaining(level.timeLimit);
    setIsPaused(false);
    setActiveQuestion(null);
    setVictoryData(null);
    setIsGameOver(false);

    if (engineRef.current) {
      engineRef.current.stop();
    }

    const engine = new PlatformerEngine(canvas, level, allQuestions, {
      onQuestionTrigger: (question, onResolved) => {
        setActiveQuestion(question);
        setQuestionResolver(() => onResolved);
      },
      onCoinCollected: (c) => setCurrentCoins(c),
      onScoreAdded: (s) => setCurrentScore(s),
      onLivesChanged: (l) => setCurrentLives(l),
      onLevelComplete: (res) => {
        setVictoryData(res);
        // Calculate stars
        let stars = 1;
        if (res.score >= 2500 || res.coins >= 18) stars = 3;
        else if (res.score >= 1200 || res.coins >= 10) stars = 2;

        const currentStats = statsRef.current;
        const nextUnlocked = Math.max(currentStats.unlockedLevel, Math.min(level.id + 1, 5));
        const updatedStars = { ...currentStats.levelStars, [level.id]: Math.max(currentStats.levelStars[level.id] || 0, stars) };
        const totalStars = Object.values(updatedStars).reduce((a, b) => a + b, 0);
        const updatedHighScores = {
          ...currentStats.levelHighScores,
          [level.id]: Math.max(currentStats.levelHighScores[level.id] || 0, res.score),
        };
        const maxHighScore = Math.max(currentStats.highScore, res.score);

        onUpdateStatsRef.current({
          ...currentStats,
          totalCoins: currentStats.totalCoins + res.coins,
          highScore: maxHighScore,
          unlockedLevel: nextUnlocked,
          levelStars: updatedStars,
          totalStars,
          levelHighScores: updatedHighScores,
        });

        // Save student progress to Teacher Gradebook Database
        const st = studentRef.current;
        const normalizedScore = Math.min(100, Math.max(60, Math.round((res.score / 2500) * 100)));
        saveScoreRecord({
          studentId: st?.id || `std_${Date.now()}`,
          studentName: st?.name || 'Siswa Petualang',
          gradeClass: st?.gradeClass || level.gradeLabel,
          studentNumber: st?.studentNumber,
          missionTitle: level.title,
          category: 'PETUALANGAN',
          score: normalizedScore,
          pointsEarned: res.score,
          coinsEarned: res.coins,
          correctAnswers: engine.questionsSolved,
          totalQuestions: level.requiredQuestions,
          accuracy: Math.min(100, Math.round((engine.questionsSolved / Math.max(1, level.requiredQuestions)) * 100)),
          timeSpentSeconds: level.timeLimit - res.timeRemaining,
        });
      },
      onGameOver: () => {
        setIsGameOver(true);
      },
    });

    engineRef.current = engine;
    engine.start();
  }, [level.id, allQuestions]);

  useEffect(() => {
    startLevel();
    return () => {
      if (engineRef.current) {
        engineRef.current.stop();
        soundManager.stopBGM();
      }
    };
  }, [level.id]);

  // Sync HUD timer
  useEffect(() => {
    const timerInterval = setInterval(() => {
      if (engineRef.current && !isPaused && !activeQuestion && !victoryData && !isGameOver) {
        setTimeRemaining(engineRef.current.timeRemaining);
      }
    }, 500);
    return () => clearInterval(timerInterval);
  }, [isPaused, activeQuestion, victoryData, isGameOver]);

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!engineRef.current) return;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        engineRef.current.input.left = true;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        engineRef.current.input.right = true;
      }
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === ' ') {
        engineRef.current.input.jump = true;
      }
      if (e.key === 'Shift' || e.key === 'j' || e.key === 'J') {
        engineRef.current.input.dash = true;
      }
      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        togglePause();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!engineRef.current) return;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        engineRef.current.input.left = false;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        engineRef.current.input.right = false;
      }
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === ' ') {
        engineRef.current.input.jump = false;
      }
      if (e.key === 'Shift' || e.key === 'j' || e.key === 'J') {
        engineRef.current.input.dash = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPaused]);

  const togglePause = () => {
    if (!engineRef.current || activeQuestion || victoryData || isGameOver) return;
    if (isPaused) {
      engineRef.current.resume();
      soundManager.startBGM();
      setIsPaused(false);
    } else {
      engineRef.current.pause();
      soundManager.stopBGM();
      setIsPaused(true);
    }
  };

  const handleMathAnswer = (isCorrect: boolean) => {
    if (questionResolver) {
      questionResolver(isCorrect);
      setQuestionResolver(null);
    }
    setActiveQuestion(null);

    // Update global question stats without re-triggering level reset
    const currentStats = statsRef.current;
    onUpdateStatsRef.current({
      ...currentStats,
      totalQuestionsAnswered: currentStats.totalQuestionsAnswered + 1,
      correctAnswersCount: currentStats.correctAnswersCount + (isCorrect ? 1 : 0),
    });
  };

  // Virtual Touch Button handlers
  const handleTouchControl = (
    key: 'left' | 'right' | 'jump' | 'dash',
    isPressed: boolean
  ) => {
    if (!engineRef.current) return;
    engineRef.current.input[key] = isPressed;

    if (isPressed && navigator.vibrate) {
      navigator.vibrate(12);
    }
  };

  return (
    <div className="relative w-full h-screen bg-slate-950 flex flex-col items-center justify-between overflow-hidden select-none touch-none">
      {/* Top Game HUD */}
      <header className="w-full max-w-4xl z-20 px-3 py-2 flex items-center justify-between text-white font-game text-xs md:text-sm">
        {/* World Name & Grade */}
        <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700">
          <span className="font-bold text-amber-400">{level.gradeLabel}</span>
          <span className="hidden sm:inline text-slate-400">|</span>
          <span className="truncate max-w-[150px] sm:max-w-xs text-white font-semibold">
            {level.title}
          </span>
        </div>

        {/* Meters: Score, Coins, Lives, Time */}
        <div className="flex items-center gap-2.5 sm:gap-4 font-bold">
          {/* Score */}
          <div className="flex items-center gap-1 text-yellow-400">
            <span className="hidden sm:inline text-slate-300">SKOR:</span>
            <span className="font-mono-score font-bold text-sm md:text-base">
              {currentScore.toLocaleString()}
            </span>
          </div>

          {/* Coins */}
          <div className="flex items-center gap-1 text-amber-400">
            <Coins className="w-4 h-4 text-yellow-400" />
            <span className="font-mono-score">{currentCoins}</span>
          </div>

          {/* Lives (Hearts) */}
          <div className="flex items-center gap-0.5">
            {[1, 2, 3].map((h) => (
              <Heart
                key={h}
                className={`w-4 h-4 md:w-5 md:h-5 ${
                  h <= currentLives
                    ? 'fill-red-500 text-red-500'
                    : 'fill-slate-600 text-slate-600'
                }`}
              />
            ))}
          </div>

          {/* Time Remaining */}
          <div className={`flex items-center gap-1 ${timeRemaining < 30 ? 'text-red-400 animate-pulse' : 'text-sky-300'}`}>
            <Clock className="w-4 h-4" />
            <span className="font-mono-score font-bold">{timeRemaining}s</span>
          </div>
        </div>

        {/* Action Controls: Sound & Pause */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onToggleSound}
            className="p-1.5 bg-slate-800/80 hover:bg-slate-700 text-white rounded-lg border border-slate-600 transition"
            title="Toggle Suara"
          >
            {soundSettings.bgmEnabled || soundSettings.sfxEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
          </button>

          <button
            onClick={togglePause}
            className="p-1.5 bg-slate-800/80 hover:bg-slate-700 text-white rounded-lg border border-slate-600 transition"
            title="Jeda Permainan (P / Esc)"
          >
            {isPaused ? <Play className="w-4 h-4 text-amber-400" /> : <Pause className="w-4 h-4 text-white" />}
          </button>
        </div>
      </header>

      {/* Main Canvas Viewport with responsive aspect ratio container */}
      <div className="relative flex-1 w-full max-w-5xl flex items-center justify-center p-1 md:p-3 overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-full max-h-[72vh] object-contain rounded-2xl shadow-2xl border-2 border-slate-800 bg-sky-400"
        />

        {/* In-Game Pause Overlay Modal */}
        {isPaused && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-40 animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-xs w-full p-6 text-center shadow-2xl border-4 border-amber-400">
              <h3 className="font-game text-2xl font-bold text-slate-800 mb-1">
                PERMAINAN DIJEDA
              </h3>
              <p className="font-game text-xs text-slate-500 mb-5">
                Ambil nafas sejenak sebelum melanjutkan petualangan!
              </p>

              <div className="space-y-2.5 font-game">
                <button
                  onClick={togglePause}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-b from-emerald-500 to-green-600 text-white font-bold text-sm py-2.5 rounded-xl game-btn-shadow border border-emerald-300"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>LANJUTKAN</span>
                </button>

                <button
                  onClick={startLevel}
                  className="w-full flex items-center justify-center gap-2 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs py-2 rounded-xl border border-amber-300"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>ULANGI DARI AWAL</span>
                </button>

                <button
                  onClick={onBackToMenu}
                  className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2 rounded-xl border border-slate-300"
                >
                  <Menu className="w-4 h-4" />
                  <span>KEMBALI KE MENU</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Onscreen Touch Controls for Android Phone & Tablet */}
      <div className="w-full max-w-4xl z-30 px-4 py-2 sm:py-3 flex items-center justify-between select-none pointer-events-auto">
        {/* Left Side: Virtual D-Pad (Left & Right) */}
        <div className="flex items-center gap-2">
          {/* Left Arrow */}
          <button
            onPointerDown={() => handleTouchControl('left', true)}
            onPointerUp={() => handleTouchControl('left', false)}
            onPointerLeave={() => handleTouchControl('left', false)}
            className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white/20 active:bg-amber-400/80 backdrop-blur-md border-2 border-white/40 flex items-center justify-center text-white active:text-slate-900 shadow-lg active:scale-90 transition-transform cursor-pointer"
          >
            <ArrowLeft className="w-8 h-8" />
          </button>

          {/* Right Arrow */}
          <button
            onPointerDown={() => handleTouchControl('right', true)}
            onPointerUp={() => handleTouchControl('right', false)}
            onPointerLeave={() => handleTouchControl('right', false)}
            className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white/20 active:bg-amber-400/80 backdrop-blur-md border-2 border-white/40 flex items-center justify-center text-white active:text-slate-900 shadow-lg active:scale-90 transition-transform cursor-pointer"
          >
            <ArrowRight className="w-8 h-8" />
          </button>
        </div>

        {/* Center: Quick Control Guide Pill */}
        <div className="hidden sm:block text-slate-400 text-2xs font-semibold text-center">
          PC: A/D/Panah Gerak • Spasi Loncat • Shift Dash
        </div>

        {/* Right Side: Virtual Action Buttons (Dash & Jump) */}
        <div className="flex items-center gap-2.5">
          {/* Dash / Run Fast Button (B) */}
          <button
            onPointerDown={() => handleTouchControl('dash', true)}
            onPointerUp={() => handleTouchControl('dash', false)}
            onPointerLeave={() => handleTouchControl('dash', false)}
            className="w-13 h-13 md:w-15 md:h-15 rounded-2xl bg-sky-500/80 active:bg-sky-400 backdrop-blur-md border-2 border-sky-300 flex flex-col items-center justify-center text-white shadow-lg active:scale-90 transition-transform cursor-pointer"
          >
            <Zap className="w-5 h-5 fill-white" />
            <span className="font-game text-2xs font-bold">DASH</span>
          </button>

          {/* Jump Button (A) */}
          <button
            onPointerDown={() => handleTouchControl('jump', true)}
            onPointerUp={() => handleTouchControl('jump', false)}
            onPointerLeave={() => handleTouchControl('jump', false)}
            className="w-15 h-15 md:w-17 md:h-17 rounded-2xl bg-amber-400 active:bg-amber-300 backdrop-blur-md border-2 border-amber-200 flex flex-col items-center justify-center text-amber-950 shadow-xl active:scale-90 transition-transform cursor-pointer"
          >
            <span className="font-game text-xl font-black">A</span>
            <span className="font-game text-2xs font-bold -mt-1">LOMPAT</span>
          </button>
        </div>
      </div>

      {/* Math Question Modal (triggered from Question Blocks) */}
      {activeQuestion && (
        <MathModal
          question={activeQuestion}
          onAnswer={handleMathAnswer}
        />
      )}

      {/* Victory Level Complete Modal */}
      {victoryData && (
        <VictoryModal
          level={level}
          stats={victoryData}
          hasNextLevel={level.id < 4}
          onNextLevel={() => onSelectNextLevel(level.id + 1)}
          onReplay={startLevel}
          onMainMenu={onBackToMenu}
        />
      )}

      {/* Game Over Modal */}
      {isGameOver && (
        <GameOverModal
          onRetry={startLevel}
          onMainMenu={onBackToMenu}
        />
      )}
    </div>
  );
};
