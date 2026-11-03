import { LevelConfig } from '../types/game';

export const GAME_LEVELS: LevelConfig[] = [
  {
    id: 1,
    title: 'Dunia 1: Lembah Bilangan & Aljabar',
    subtitle: 'Materi SMP Kelas 7',
    gradeLabel: 'Kelas 7',
    theme: 'grass',
    worldLength: 3200,
    timeLimit: 180,
    requiredQuestions: 3,
    description: 'Petualangan dimulai di padang rumput cerah! Pecahkan operasi hitung bilangan bulat, pecahan, dan konsep aljabar dasar untuk membuka jalan.',
    backgroundColor: '#38bdf8', // Sky 400
    groundColor: '#b45309', // Amber 700 / dirt
    grassColor: '#22c55e', // Green 500
  },
  {
    id: 2,
    title: 'Dunia 2: Dataran Pythagoras & Pola',
    subtitle: 'Materi SMP Kelas 8',
    gradeLabel: 'Kelas 8',
    theme: 'plains',
    worldLength: 3600,
    timeLimit: 200,
    requiredQuestions: 4,
    description: 'Jelajahi tebing dan bukit tinggi! Kuasai rumus segitiga siku-siku Pythagoras, pola barisan angka, dan luas keliling lingkaran.',
    backgroundColor: '#0ea5e9', // Sky 500
    groundColor: '#78350f', // Warm earth
    grassColor: '#10b981', // Emerald 500
  },
  {
    id: 3,
    title: 'Dunia 3: Hutan Aritmetika Sosial & SPLDV',
    subtitle: 'Materi SMP Kelas 7 & 8',
    gradeLabel: 'Kelas 7-8',
    theme: 'forest',
    worldLength: 4000,
    timeLimit: 220,
    requiredQuestions: 4,
    description: 'Menembus kanopi hutan lebat penuh tantangan! Hitung untung rugi pedagang, diskon belanja, serta sistem persamaan dua variabel.',
    backgroundColor: '#0284c7', // Sky 600
    groundColor: '#451a03', // Deep wood soil
    grassColor: '#15803d', // Green 700
  },
  {
    id: 4,
    title: 'Dunia 4: Kastil Juara Matematika SMP',
    subtitle: 'Materi SMP Kelas 9 & Ujian Sekolah',
    gradeLabel: 'Kelas 9',
    theme: 'castle',
    worldLength: 4400,
    timeLimit: 240,
    requiredQuestions: 5,
    description: 'Puncak benteng kehormatan! Hadapi soal bentuk akar, bilangan berpangkat, persamaan kuadrat, dan peluang untuk menjadi Master Matematika!',
    backgroundColor: '#1e293b', // Deep night twilight / castle atmosphere
    groundColor: '#334155', // Stone floor
    grassColor: '#64748b', // Slate top
  },
  {
    id: 5,
    title: 'Dunia 5: Kuil Tabung & Kerucut',
    subtitle: 'Materi SMP Kelas 9 • Maksimal 10 Menit',
    gradeLabel: 'Kelas 9 Khusus',
    theme: 'plains',
    worldLength: 4200,
    timeLimit: 600, // 10 minutes (600 seconds)
    requiredQuestions: 5,
    description: 'Misi spesial SMP Kelas 9! Kuasai rumus volume bangun ruang sisi lengkung (tabung dan kerucut) dalam waktu maksimal 10 menit.',
    backgroundColor: '#0284c7', // Sky blue
    groundColor: '#7c2d12', // Warm terracotta
    grassColor: '#eab308', // Golden temple path
  },
];
