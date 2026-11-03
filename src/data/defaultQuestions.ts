import { MathQuestion } from '../types/game';

export const DEFAULT_SMP_QUESTIONS: MathQuestion[] = [
  // --- KELAS 7: BILANGAN BULAT & PECAHAN ---
  {
    id: 'smp7-bil-1',
    grade: 'SMP 7',
    topic: 'Bilangan Bulat & Pecahan',
    question: 'Hasil dari perhitungan (-15) + 24 - (-8) adalah...',
    options: ['1', '17', '-1', '9'],
    correctAnswerIndex: 1,
    explanation: '(-15) + 24 - (-8) = 9 + 8 = 17. Pengurangan dengan bilangan negatif sama dengan penjumlahan bilangan positif.',
  },
  {
    id: 'smp7-bil-2',
    grade: 'SMP 7',
    topic: 'Bilangan Bulat & Pecahan',
    question: 'Hasil dari (-6) × 4 : (-2) + 7 adalah...',
    options: ['19', '-5', '5', '12'],
    correctAnswerIndex: 0,
    explanation: 'Dahulukan perkalian dan pembagian: (-6) × 4 = -24. Kemudian (-24) : (-2) = +12. Terakhir 12 + 7 = 19.',
  },
  {
    id: 'smp7-bil-3',
    grade: 'SMP 7',
    topic: 'Bilangan Bulat & Pecahan',
    question: 'Hasil dari 3/4 + 2/3 - 1/2 adalah...',
    options: ['11/12', '5/6', '7/12', '1/3'],
    correctAnswerIndex: 0,
    explanation: 'Samakan penyebut ke KPK yaitu 12: 9/12 + 8/12 - 6/12 = (9 + 8 - 6)/12 = 11/12.',
  },
  {
    id: 'smp7-bil-4',
    grade: 'SMP 7',
    topic: 'Bilangan Bulat & Pecahan',
    question: 'Suhu di dalam kulkas -4°C, sedangkan suhu di luar ruangan 28°C. Selisih suhu keduanya adalah...',
    options: ['24°C', '32°C', '-32°C', '28°C'],
    correctAnswerIndex: 1,
    explanation: 'Selisih suhu = suhu tertinggi - suhu terendah = 28 - (-4) = 28 + 4 = 32°C.',
  },

  // --- KELAS 7: ALJABAR & PLSV ---
  {
    id: 'smp7-alj-1',
    grade: 'SMP 7',
    topic: 'Aljabar & Persamaan',
    question: 'Jika 3x + 7 = 25, maka nilai dari x adalah...',
    options: ['4', '6', '8', '5'],
    correctAnswerIndex: 1,
    explanation: '3x = 25 - 7 => 3x = 18 => x = 18 / 3 = 6.',
  },
  {
    id: 'smp7-alj-2',
    grade: 'SMP 7',
    topic: 'Aljabar & Persamaan',
    question: 'Bentuk sederhana dari 5x - 3y + 2x + 7y adalah...',
    options: ['7x + 4y', '7x - 4y', '3x + 10y', '11xy'],
    correctAnswerIndex: 0,
    explanation: 'Kumpulkan suku-suku sejenis: (5x + 2x) + (-3y + 7y) = 7x + 4y.',
  },
  {
    id: 'smp7-alj-3',
    grade: 'SMP 7',
    topic: 'Aljabar & Persamaan',
    question: 'Hasil dari 4(2a - 3b) - 2(a - 5b) adalah...',
    options: ['6a - 2b', '6a + 2b', '7a - 8b', '6a - 22b'],
    correctAnswerIndex: 0,
    explanation: 'Jabarkan kurung: 8a - 12b - 2a + 10b = (8a - 2a) + (-12b + 10b) = 6a - 2b.',
  },

  // --- KELAS 7: ARITMETIKA SOSIAL ---
  {
    id: 'smp7-arit-1',
    grade: 'SMP 7',
    topic: 'Aritmetika Sosial',
    question: 'Sebuah jaket harganya Rp 120.000 mendapat diskon 25%. Berapa harga yang harus dibayar?',
    options: ['Rp 85.000', 'Rp 90.000', 'Rp 95.000', 'Rp 100.000'],
    correctAnswerIndex: 1,
    explanation: 'Potongan diskon = 25/100 × 120.000 = Rp 30.000. Harga bayar = 120.000 - 30.000 = Rp 90.000.',
  },
  {
    id: 'smp7-arit-2',
    grade: 'SMP 7',
    topic: 'Aritmetika Sosial',
    question: 'Pak Rio membeli sepeda Rp 800.000 lalu menjualnya kembali Rp 920.000. Persentase keuntungannya adalah...',
    options: ['12%', '15%', '18%', '20%'],
    correctAnswerIndex: 1,
    explanation: 'Untung = 920.000 - 800.000 = Rp 120.000. %Untung = (120.000 / 800.000) × 100% = 15%.',
  },

  // --- KELAS 8: TEOREMA PYTHAGORAS ---
  {
    id: 'smp8-pyt-1',
    grade: 'SMP 8',
    topic: 'Teorema Pythagoras',
    question: 'Sebuah segitiga siku-siku memiliki panjang sisi alas 6 cm dan tinggi 8 cm. Panjang sisi miring (hipotenusa) adalah...',
    options: ['9 cm', '10 cm', '12 cm', '14 cm'],
    correctAnswerIndex: 1,
    explanation: 'c² = a² + b² = 6² + 8² = 36 + 64 = 100. Jadi c = √100 = 10 cm (Tripel Pythagoras 6, 8, 10).',
  },
  {
    id: 'smp8-pyt-2',
    grade: 'SMP 8',
    topic: 'Teorema Pythagoras',
    question: 'Jika panjang sisi miring segitiga siku-siku adalah 13 cm dan salah satu sisi siku-sikunya 5 cm, maka panjang sisi lainnya adalah...',
    options: ['8 cm', '10 cm', '12 cm', '11 cm'],
    correctAnswerIndex: 2,
    explanation: 'b² = c² - a² = 13² - 5² = 169 - 25 = 144. b = √144 = 12 cm.',
  },

  // --- KELAS 8: POLA BILANGAN ---
  {
    id: 'smp8-pola-1',
    grade: 'SMP 8',
    topic: 'Pola Bilangan',
    question: 'Diberikan barisan aritmetika: 3, 7, 11, 15, ... Suku ke-10 (U10) adalah...',
    options: ['35', '39', '43', '41'],
    correctAnswerIndex: 1,
    explanation: 'Suku pertama (a) = 3, beda (b) = 4. Rumus Un = a + (n - 1)b. U10 = 3 + (10 - 1) × 4 = 3 + 36 = 39.',
  },
  {
    id: 'smp8-pola-2',
    grade: 'SMP 8',
    topic: 'Pola Bilangan',
    question: 'Dua suku berikutnya dari barisan Fibonacci 1, 1, 2, 3, 5, 8, ... adalah...',
    options: ['11 dan 14', '13 dan 21', '12 dan 18', '10 dan 15'],
    correctAnswerIndex: 1,
    explanation: 'Pola Fibonacci menjumlahkan 2 bilangan sebelumnya: 5 + 8 = 13, lalu 8 + 13 = 21.',
  },

  // --- KELAS 8: SPLDV ---
  {
    id: 'smp8-spldv-1',
    grade: 'SMP 8',
    topic: 'Sistem Persamaan (SPLDV)',
    question: 'Diketahui x + y = 14 dan x - y = 4. Maka nilai dari x × y adalah...',
    options: ['45', '40', '50', '36'],
    correctAnswerIndex: 0,
    explanation: 'Jumlahkan kedua persamaan: 2x = 18 => x = 9. Substitusi: 9 + y = 14 => y = 5. Nilai x × y = 9 × 5 = 45.',
  },

  // --- KELAS 8: LINGKARAN & GEOMETRI ---
  {
    id: 'smp8-geom-1',
    grade: 'SMP 8',
    topic: 'Geometri & Bangun Datar',
    question: 'Sebuah taman berbentuk lingkaran memiliki jari-jari 7 m. Keliling taman tersebut adalah... (gunakan π = 22/7)',
    options: ['22 m', '44 m', '88 m', '154 m'],
    correctAnswerIndex: 1,
    explanation: 'Keliling = 2 × π × r = 2 × (22/7) × 7 = 44 meter.',
  },
  {
    id: 'smp8-geom-2',
    grade: 'SMP 8',
    topic: 'Geometri & Bangun Datar',
    question: 'Luas lingkaran dengan jari-jari 10 cm adalah... (gunakan π = 3,14)',
    options: ['314 cm²', '62,8 cm²', '157 cm²', '628 cm²'],
    correctAnswerIndex: 0,
    explanation: 'Luas = π × r² = 3,14 × 10 × 10 = 314 cm².',
  },

  // --- KELAS 9: EKSPONEN & BENTUK AKAR ---
  {
    id: 'smp9-eks-1',
    grade: 'SMP 9',
    topic: 'Eksponen & Bentuk Akar',
    question: 'Hasil dari (2³ × 2⁴) : 2⁵ adalah...',
    options: ['2', '4', '8', '16'],
    correctAnswerIndex: 1,
    explanation: 'Gunakan sifat eksponen: 2^(3 + 4 - 5) = 2^2 = 4.',
  },
  {
    id: 'smp9-eks-2',
    grade: 'SMP 9',
    topic: 'Eksponen & Bentuk Akar',
    question: 'Bentuk sederhana dari √48 + √27 - √75 adalah...',
    options: ['2√3', '3√3', '4√3', '√3'],
    correctAnswerIndex: 0,
    explanation: '√48 = 4√3, √27 = 3√3, √75 = 5√3. Jadi (4√3 + 3√3) - 5√3 = 7√3 - 5√3 = 2√3.',
  },

  // --- KELAS 9: PERSAMAAN KUADRAT ---
  {
    id: 'smp9-pkuad-1',
    grade: 'SMP 9',
    topic: 'Persamaan Kuadrat',
    question: 'Akar-akar dari persamaan kuadrat x² - 7x + 12 = 0 adalah...',
    options: ['x = 2 atau x = 5', 'x = 3 atau x = 4', 'x = -3 atau x = -4', 'x = 1 atau x = 12'],
    correctAnswerIndex: 1,
    explanation: 'Faktorkan: (x - 3)(x - 4) = 0. Maka x = 3 atau x = 4.',
  },

  // --- KELAS 8/9: STATISTIKA & PELUANG ---
  {
    id: 'smp8-stat-1',
    grade: 'SMP 8',
    topic: 'Statistika & Peluang',
    question: 'Nilai ulangan matematika 5 orang siswa: 70, 80, 85, 90, 75. Nilai rata-rata (mean) adalah...',
    options: ['78', '80', '82', '84'],
    correctAnswerIndex: 1,
    explanation: 'Rata-rata = (70 + 80 + 85 + 90 + 75) / 5 = 400 / 5 = 80.',
  },
  {
    id: 'smp9-pel-1',
    grade: 'SMP 9',
    topic: 'Statistika & Peluang',
    question: 'Sebuah dadu bersisi 6 dilempar sekali. Peluang munculnya mata dadu bilangan prima adalah...',
    options: ['1/6', '1/3', '1/2', '2/3'],
    correctAnswerIndex: 2,
    explanation: 'Mata dadu prima = {2, 3, 5} ada 3 buah dari total 6 sisi. Peluang = 3/6 = 1/2.',
  },

  // --- KELAS 9: VOLUME TABUNG & KERUCUT (5 SOAL KHUSUS) ---
  {
    id: 'smp9-tab-1',
    grade: 'SMP 9',
    topic: 'Volume Tabung & Kerucut',
    question: 'Sebuah tabung memiliki jari-jari alas r = 7 cm dan tinggi t = 20 cm. Berapakah volume tabung tersebut? (Gunakan π = 22/7)',
    formula: 'V_tabung = π × r² × t',
    options: ['1.540 cm³', '3.080 cm³', '4.620 cm³', '6.160 cm³'],
    correctAnswerIndex: 1,
    explanation: 'Volume tabung = π × r² × t = (22/7) × 7 × 7 × 20 = 22 × 7 × 20 = 154 × 20 = 3.080 cm³.',
  },
  {
    id: 'smp9-ker-2',
    grade: 'SMP 9',
    topic: 'Volume Tabung & Kerucut',
    question: 'Sebuah kerucut memiliki jari-jari alas r = 7 cm dan tinggi t = 12 cm. Berapakah volume kerucut tersebut? (Gunakan π = 22/7)',
    formula: 'V_kerucut = (1/3) × π × r² × t',
    options: ['616 cm³', '1.848 cm³', '308 cm³', '924 cm³'],
    correctAnswerIndex: 0,
    explanation: 'Volume kerucut = (1/3) × π × r² × t = (1/3) × (22/7) × 49 × 12 = 4 × 154 = 616 cm³. (Volume kerucut adalah sepertiga dari tabung berukuran sama).',
  },
  {
    id: 'smp9-tabker-3',
    grade: 'SMP 9',
    topic: 'Volume Tabung & Kerucut',
    question: 'Sebuah tabung dan kerucut memiliki jari-jari alas dan tinggi yang sama persis. Jika volume tabung adalah 1.800 cm³, maka volume kerucut tersebut adalah...',
    formula: 'V_kerucut = (1/3) × V_tabung',
    options: ['450 cm³', '600 cm³', '900 cm³', '5.400 cm³'],
    correctAnswerIndex: 1,
    explanation: 'Karena jari-jari (r) dan tingginya (t) sama, maka volume kerucut tepat sepertiga volume tabung: V = (1/3) × 1.800 = 600 cm³.',
  },
  {
    id: 'smp9-ker-4',
    grade: 'SMP 9',
    topic: 'Volume Tabung & Kerucut',
    question: 'Sebuah kerucut memiliki jari-jari alas r = 6 cm dan panjang garis pelukis s = 10 cm. Berapakah volume kerucut tersebut? (Gunakan π = 3,14)',
    formula: 't = √(s² - r²),  V = (1/3) × π × r² × t',
    options: ['301,44 cm³', '376,80 cm³', '904,32 cm³', '150,72 cm³'],
    correctAnswerIndex: 0,
    explanation: '1) Cari tinggi kerucut dengan Pythagoras: t = √(10² - 6²) = √(100 - 36) = √64 = 8 cm. 2) Hitung volume: V = (1/3) × 3,14 × 6² × 8 = (1/3) × 3,14 × 36 × 8 = 3,14 × 12 × 8 = 301,44 cm³.',
  },
  {
    id: 'smp9-tab-5',
    grade: 'SMP 9',
    topic: 'Volume Tabung & Kerucut',
    question: 'Sebuah wadah berbentuk tabung berdiameter 20 cm terisi air sebanyak 6.280 cm³ hingga penuh. Berapakah tinggi wadah tabung tersebut? (Gunakan π = 3,14)',
    formula: 'r = d/2 = 10 cm,  t = V / (π × r²)',
    options: ['15 cm', '20 cm', '25 cm', '30 cm'],
    correctAnswerIndex: 1,
    explanation: '1) Jari-jari alas r = 20 / 2 = 10 cm. 2) Luas alas tabung = π × r² = 3,14 × 10² = 314 cm². 3) Tinggi tabung = Volume / Luas alas = 6.280 / 314 = 20 cm.',
  },
];

export const SMP9_TABUNG_KERUCUT_QUESTIONS = DEFAULT_SMP_QUESTIONS.slice(-5);

