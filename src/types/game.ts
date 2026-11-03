export type GradeLevel = 'SMP 7' | 'SMP 8' | 'SMP 9';

export type MathTopic =
  | 'Bilangan Bulat & Pecahan'
  | 'Aljabar & Persamaan'
  | 'Aritmetika Sosial'
  | 'Teorema Pythagoras'
  | 'Geometri & Bangun Datar'
  | 'Pola Bilangan'
  | 'Sistem Persamaan (SPLDV)'
  | 'Eksponen & Bentuk Akar'
  | 'Persamaan Kuadrat'
  | 'Statistika & Peluang'
  | 'Volume Tabung & Kerucut';

export interface MathQuestion {
  id: string;
  grade: GradeLevel;
  topic: MathTopic;
  question: string;
  formula?: string; // Optional math formula highlight
  options: string[];
  correctAnswerIndex: number;
  explanation: string; // Step-by-step explanation
  isCustom?: boolean; // Created by teacher
}

export interface LevelConfig {
  id: number;
  title: string;
  subtitle: string;
  gradeLabel: string;
  theme: 'grass' | 'plains' | 'forest' | 'castle';
  worldLength: number; // in pixels
  timeLimit: number; // in seconds
  requiredQuestions: number;
  description: string;
  backgroundColor: string;
  groundColor: string;
  grassColor: string;
}

export interface PlayerStats {
  totalCoins: number;
  highScore: number;
  totalStars: number;
  unlockedLevel: number; // 1 to 4
  levelStars: Record<number, number>; // levelId -> stars (1-3)
  levelHighScores: Record<number, number>; // levelId -> score
  totalQuestionsAnswered: number;
  correctAnswersCount: number;
}

export interface SoundSettings {
  bgmEnabled: boolean;
  sfxEnabled: boolean;
  volume: number; // 0 to 1
}

export interface Entity {
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  vy: number;
}

export interface BlockEntity {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'question' | 'brick' | 'ground' | 'pipe' | 'platform' | 'castle';
  hit: boolean;
  bounceOffset: number;
  question?: MathQuestion;
}

export interface CoinEntity {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  collected: boolean;
  frame: number;
}

export interface EnemyEntity {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  vy: number;
  type: 'slime' | 'spiky' | 'flying';
  alive: boolean;
  squishProgress: number; // for squash animation
  initialX: number;
  patrolDistance: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  text?: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  gradeClass: string; // e.g. "9A", "9B", "8A", "7C"
  studentNumber?: string; // Nomor Absen
  registeredAt: string;
}

export interface StudentScoreRecord {
  id: string;
  studentId: string;
  studentName: string;
  gradeClass: string;
  studentNumber?: string;
  missionTitle: string;
  category: 'UJIAN_KHUSUS' | 'PETUALANGAN';
  score: number; // 0 - 100
  pointsEarned: number;
  coinsEarned: number;
  correctAnswers: number;
  totalQuestions: number;
  accuracy: number; // 0 - 100%
  timeSpentSeconds: number;
  completedAt: string; // Formatted date string
  passedKKM: boolean; // >= 75
}

