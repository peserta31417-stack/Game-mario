import { MathQuestion, PlayerStats, SoundSettings } from '../types/game';
import { DEFAULT_SMP_QUESTIONS } from '../data/defaultQuestions';

const STATS_KEY = 'mario_math_player_stats_v1';
const SOUND_KEY = 'mario_math_sound_settings_v1';
const QUESTIONS_KEY = 'mario_math_custom_questions_v1';

const DEFAULT_STATS: PlayerStats = {
  totalCoins: 0,
  highScore: 0,
  totalStars: 0,
  unlockedLevel: 1,
  levelStars: { 1: 0, 2: 0, 3: 0, 4: 0 },
  levelHighScores: { 1: 0, 2: 0, 3: 0, 4: 0 },
  totalQuestionsAnswered: 0,
  correctAnswersCount: 0,
};

const DEFAULT_SOUND_SETTINGS: SoundSettings = {
  bgmEnabled: true,
  sfxEnabled: true,
  volume: 0.7,
};

export function loadPlayerStats(): PlayerStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return DEFAULT_STATS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_STATS, ...parsed };
  } catch {
    return DEFAULT_STATS;
  }
}

export function savePlayerStats(stats: PlayerStats): void {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error('Failed to save stats to localStorage', e);
  }
}

export function loadSoundSettings(): SoundSettings {
  try {
    const raw = localStorage.getItem(SOUND_KEY);
    if (!raw) return DEFAULT_SOUND_SETTINGS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SOUND_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SOUND_SETTINGS;
  }
}

export function saveSoundSettings(settings: SoundSettings): void {
  try {
    localStorage.setItem(SOUND_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save sound settings', e);
  }
}

export function loadQuestions(): MathQuestion[] {
  try {
    const raw = localStorage.getItem(QUESTIONS_KEY);
    if (!raw) {
      return DEFAULT_SMP_QUESTIONS;
    }
    const parsed = JSON.parse(raw) as MathQuestion[];
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_SMP_QUESTIONS;
  } catch {
    return DEFAULT_SMP_QUESTIONS;
  }
}

export function saveQuestions(questions: MathQuestion[]): void {
  try {
    localStorage.setItem(QUESTIONS_KEY, JSON.stringify(questions));
  } catch (e) {
    console.error('Failed to save questions', e);
  }
}

export function resetAllData(): void {
  try {
    localStorage.removeItem(STATS_KEY);
    localStorage.removeItem(SOUND_KEY);
    localStorage.removeItem(QUESTIONS_KEY);
  } catch (e) {
    console.error('Failed to reset data', e);
  }
}
