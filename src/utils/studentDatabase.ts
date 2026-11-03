import { StudentProfile, StudentScoreRecord } from '../types/game';

const CURRENT_STUDENT_KEY = 'mario_math_current_student_v1';
const SCORE_RECORDS_KEY = 'mario_math_score_records_db_v1';

// Seed demo data so teachers can immediately preview the gradebook
const INITIAL_DEMO_RECORDS: StudentScoreRecord[] = [
  {
    id: 'rec_demo_1',
    studentId: 'std_demo_1',
    studentName: 'Ahmad Fauzi',
    gradeClass: '9A',
    studentNumber: '02',
    missionTitle: 'Volume Tabung & Kerucut (SMP 9)',
    category: 'UJIAN_KHUSUS',
    score: 100,
    pointsEarned: 2500,
    coinsEarned: 25,
    correctAnswers: 5,
    totalQuestions: 5,
    accuracy: 100,
    timeSpentSeconds: 245, // 04:05
    completedAt: '2026-11-02 08:30:15',
    passedKKM: true,
  },
  {
    id: 'rec_demo_2',
    studentId: 'std_demo_2',
    studentName: 'Siti Nurhaliza',
    gradeClass: '9A',
    studentNumber: '28',
    missionTitle: 'Volume Tabung & Kerucut (SMP 9)',
    category: 'UJIAN_KHUSUS',
    score: 80,
    pointsEarned: 2000,
    coinsEarned: 20,
    correctAnswers: 4,
    totalQuestions: 5,
    accuracy: 80,
    timeSpentSeconds: 320, // 05:20
    completedAt: '2026-11-02 08:42:00',
    passedKKM: true,
  },
  {
    id: 'rec_demo_3',
    studentId: 'std_demo_3',
    studentName: 'Bima Pratama',
    gradeClass: '9B',
    studentNumber: '07',
    missionTitle: 'Volume Tabung & Kerucut (SMP 9)',
    category: 'UJIAN_KHUSUS',
    score: 60,
    pointsEarned: 1500,
    coinsEarned: 15,
    correctAnswers: 3,
    totalQuestions: 5,
    accuracy: 60,
    timeSpentSeconds: 410, // 06:50
    completedAt: '2026-11-02 09:15:30',
    passedKKM: false,
  },
  {
    id: 'rec_demo_4',
    studentId: 'std_demo_4',
    studentName: 'Dewi Lestari',
    gradeClass: '8B',
    studentNumber: '11',
    missionTitle: 'Dunia 2: Dataran Pythagoras & Pola',
    category: 'PETUALANGAN',
    score: 85,
    pointsEarned: 2150,
    coinsEarned: 18,
    correctAnswers: 4,
    totalQuestions: 4,
    accuracy: 100,
    timeSpentSeconds: 165,
    completedAt: '2026-11-02 10:20:10',
    passedKKM: true,
  },
  {
    id: 'rec_demo_5',
    studentId: 'std_demo_5',
    studentName: 'Rizky Ramadhan',
    gradeClass: '7A',
    studentNumber: '24',
    missionTitle: 'Dunia 1: Lembah Bilangan & Aljabar',
    category: 'PETUALANGAN',
    score: 90,
    pointsEarned: 2400,
    coinsEarned: 22,
    correctAnswers: 3,
    totalQuestions: 3,
    accuracy: 100,
    timeSpentSeconds: 140,
    completedAt: '2026-11-02 11:05:40',
    passedKKM: true,
  },
  {
    id: 'rec_demo_6',
    studentId: 'std_demo_6',
    studentName: 'Fajar Nugraha',
    gradeClass: '9D',
    studentNumber: '15',
    missionTitle: 'Volume Tabung & Kerucut (SMP 9)',
    category: 'UJIAN_KHUSUS',
    score: 100,
    pointsEarned: 2500,
    coinsEarned: 25,
    correctAnswers: 5,
    totalQuestions: 5,
    accuracy: 100,
    timeSpentSeconds: 210,
    completedAt: '2026-11-02 11:20:00',
    passedKKM: true,
  },
];

export function getCurrentStudent(): StudentProfile | null {
  try {
    const raw = localStorage.getItem(CURRENT_STUDENT_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveCurrentStudent(profile: StudentProfile): void {
  try {
    localStorage.setItem(CURRENT_STUDENT_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save current student profile', e);
  }
}

export function getAllScoreRecords(): StudentScoreRecord[] {
  try {
    const raw = localStorage.getItem(SCORE_RECORDS_KEY);
    if (!raw) {
      // Initialize with demo data
      localStorage.setItem(SCORE_RECORDS_KEY, JSON.stringify(INITIAL_DEMO_RECORDS));
      return INITIAL_DEMO_RECORDS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return INITIAL_DEMO_RECORDS;
  } catch {
    return INITIAL_DEMO_RECORDS;
  }
}

export function saveScoreRecord(
  data: Omit<StudentScoreRecord, 'id' | 'completedAt' | 'passedKKM'>
): StudentScoreRecord {
  const records = getAllScoreRecords();
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const formattedDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  const newRecord: StudentScoreRecord = {
    ...data,
    id: `rec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    completedAt: formattedDate,
    passedKKM: data.score >= 75,
  };

  const updated = [newRecord, ...records];
  try {
    localStorage.setItem(SCORE_RECORDS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save score record to database', e);
  }

  return newRecord;
}

export function deleteScoreRecord(id: string): void {
  const records = getAllScoreRecords();
  const updated = records.filter((r) => r.id !== id);
  try {
    localStorage.setItem(SCORE_RECORDS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to delete score record', e);
  }
}

export function clearAllScoreRecords(): void {
  try {
    localStorage.setItem(SCORE_RECORDS_KEY, JSON.stringify([]));
  } catch (e) {
    console.error('Failed to clear score records', e);
  }
}

export function exportScoresToCSV(records: StudentScoreRecord[]): void {
  const headers = [
    'No',
    'Nama Siswa',
    'Kelas',
    'No Absen',
    'Materi / Ujian',
    'Kategori',
    'Nilai (0-100)',
    'Jawaban Benar',
    'Total Soal',
    'Akurasi (%)',
    'Koin Emas',
    'Waktu Pengerjaan (Detik)',
    'Status KKM (≥75)',
    'Waktu Selesai',
  ];

  const rows = records.map((r, idx) => [
    idx + 1,
    `"${r.studentName.replace(/"/g, '""')}"`,
    `"${r.gradeClass}"`,
    `"${r.studentNumber || '-'}"`,
    `"${r.missionTitle.replace(/"/g, '""')}"`,
    `"${r.category}"`,
    r.score,
    r.correctAnswers,
    r.totalQuestions,
    `${r.accuracy}%`,
    r.coinsEarned,
    r.timeSpentSeconds,
    r.passedKKM ? 'Tuntas' : 'Remedial',
    `"${r.completedAt}"`,
  ]);

  const csvContent =
    'data:text/csv;charset=utf-8,\uFEFF' +
    [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `rekap_nilai_siswa_mario_math_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export function exportScoresToJSON(records: StudentScoreRecord[]): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(records, null, 2));
  const link = document.createElement('a');
  link.setAttribute('href', dataStr);
  link.setAttribute('download', `database_nilai_mario_math_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(link);
  link.click();
  link.remove();
}
