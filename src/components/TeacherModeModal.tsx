import React, { useState, useEffect } from 'react';
import { GradeLevel, MathQuestion, MathTopic, PlayerStats, StudentScoreRecord } from '../types/game';
import { DEFAULT_SMP_QUESTIONS } from '../data/defaultQuestions';
import {
  getAllScoreRecords,
  deleteScoreRecord,
  clearAllScoreRecords,
  exportScoresToCSV,
  exportScoresToJSON,
} from '../utils/studentDatabase';
import {
  X,
  Plus,
  Trash2,
  Download,
  Upload,
  RotateCcw,
  Search,
  CheckCircle,
  BarChart3,
  BookOpen,
  Filter,
  FileSpreadsheet,
  Users,
  CheckCircle2,
  XCircle,
  Award,
  Sparkles,
} from 'lucide-react';

interface TeacherModeModalProps {
  questions: MathQuestion[];
  stats: PlayerStats;
  onSaveQuestions: (updated: MathQuestion[]) => void;
  onClose: () => void;
}

const TOPICS: MathTopic[] = [
  'Bilangan Bulat & Pecahan',
  'Aljabar & Persamaan',
  'Aritmetika Sosial',
  'Teorema Pythagoras',
  'Geometri & Bangun Datar',
  'Pola Bilangan',
  'Sistem Persamaan (SPLDV)',
  'Eksponen & Bentuk Akar',
  'Persamaan Kuadrat',
  'Statistika & Peluang',
  'Volume Tabung & Kerucut',
];

export const TeacherModeModal: React.FC<TeacherModeModalProps> = ({
  questions,
  stats,
  onSaveQuestions,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'database' | 'list' | 'add' | 'stats'>('database');
  const [filterGrade, setFilterGrade] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Score Records State
  const [scoreRecords, setScoreRecords] = useState<StudentScoreRecord[]>([]);
  const [dbClassFilter, setDbClassFilter] = useState<string>('all');
  const [dbSearchQuery, setDbSearchQuery] = useState<string>('');

  useEffect(() => {
    setScoreRecords(getAllScoreRecords());
  }, []);

  // New Question Form State
  const [newGrade, setNewGrade] = useState<GradeLevel>('SMP 7');
  const [newTopic, setNewTopic] = useState<MathTopic>('Bilangan Bulat & Pecahan');
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newFormula, setNewFormula] = useState('');
  const [newOptions, setNewOptions] = useState(['', '', '', '']);
  const [newCorrectIdx, setNewCorrectIdx] = useState(0);
  const [newExplanation, setNewExplanation] = useState('');

  const flashMessage = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const filteredQuestions = questions.filter((q) => {
    const matchGrade = filterGrade === 'all' || q.grade === filterGrade;
    const matchQuery =
      searchQuery === '' ||
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.topic.toLowerCase().includes(searchQuery.toLowerCase());
    return matchGrade && matchQuery;
  });

  // Database Filtered Records
  const filteredScoreRecords = scoreRecords.filter((rec) => {
    const matchClass = dbClassFilter === 'all' || rec.gradeClass.toUpperCase() === dbClassFilter.toUpperCase();
    const query = dbSearchQuery.toLowerCase();
    const matchSearch =
      dbSearchQuery === '' ||
      rec.studentName.toLowerCase().includes(query) ||
      rec.missionTitle.toLowerCase().includes(query) ||
      rec.gradeClass.toLowerCase().includes(query);
    return matchClass && matchSearch;
  });

  // Database Summary Statistics
  const totalEntries = filteredScoreRecords.length;
  const avgScore =
    totalEntries > 0
      ? Math.round(
          filteredScoreRecords.reduce((acc, curr) => acc + curr.score, 0) / totalEntries
        )
      : 0;
  const passedCount = filteredScoreRecords.filter((r) => r.passedKKM).length;
  const passRate = totalEntries > 0 ? Math.round((passedCount / totalEntries) * 100) : 0;
  const maxScore =
    totalEntries > 0
      ? Math.max(...filteredScoreRecords.map((r) => r.score))
      : 0;

  // Extract unique classes for filter
  const uniqueClasses = Array.from(new Set(scoreRecords.map((r) => r.gradeClass))).sort();

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim() || newOptions.some((opt) => !opt.trim())) {
      flashMessage('Harap isi teks soal dan ke-4 pilihan jawaban!');
      return;
    }

    const created: MathQuestion = {
      id: `custom_${Date.now()}`,
      grade: newGrade,
      topic: newTopic,
      question: newQuestionText.trim(),
      formula: newFormula.trim() || undefined,
      options: newOptions.map((o) => o.trim()),
      correctAnswerIndex: newCorrectIdx,
      explanation: newExplanation.trim() || 'Jawaban didasarkan pada rumus matematika standar.',
      isCustom: true,
    };

    const updated = [created, ...questions];
    onSaveQuestions(updated);
    flashMessage('Soal baru berhasil ditambahkan!');

    // Reset Form
    setNewQuestionText('');
    setNewFormula('');
    setNewOptions(['', '', '', '']);
    setNewExplanation('');
    setActiveTab('list');
  };

  const handleDeleteQuestion = (id: string) => {
    const updated = questions.filter((q) => q.id !== id);
    onSaveQuestions(updated);
    flashMessage('Soal berhasil dihapus.');
  };

  const handleResetToDefaults = () => {
    if (window.confirm('Kembalikan bank soal ke kurikulum default SMP?')) {
      onSaveQuestions(DEFAULT_SMP_QUESTIONS);
      flashMessage('Bank soal dikembalikan ke standar awal.');
    }
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(questions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'bank_soal_mario_math_smp.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed) && parsed.length > 0) {
          onSaveQuestions(parsed);
          flashMessage(`Berhasil mengimpor ${parsed.length} soal!`);
        } else {
          flashMessage('Format file JSON tidak sesuai.');
        }
      } catch {
        flashMessage('Gagal membaca file JSON.');
      }
    };
    reader.readAsText(file);
  };

  const handleDeleteRecord = (id: string) => {
    deleteScoreRecord(id);
    setScoreRecords(getAllScoreRecords());
    flashMessage('Catatan nilai siswa berhasil dihapus.');
  };

  const handleClearDatabase = () => {
    if (window.confirm('Yakin ingin mengosongkan seluruh database nilai siswa?')) {
      clearAllScoreRecords();
      setScoreRecords([]);
      flashMessage('Database nilai siswa berhasil dikosongkan.');
    }
  };

  const accuracy =
    stats.totalQuestionsAnswered > 0
      ? Math.round((stats.correctAnswersCount / stats.totalQuestionsAnswered) * 100)
      : 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 animate-fadeIn select-none">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl border-4 border-purple-500 relative flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <div className="flex items-center gap-2">
            <span className="font-game text-lg sm:text-2xl font-bold text-slate-800">
              MODE GURU & DATABASE NILAI
            </span>
            <span className="font-game text-xs font-bold text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-full">
              SMP 7, 8 & 9
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Status Flash Banner */}
        {statusMessage && (
          <div className="mb-3 p-2.5 bg-purple-100 text-purple-900 rounded-xl text-xs font-bold font-game flex items-center gap-2 animate-fadeIn">
            <CheckCircle className="w-4 h-4 text-purple-700" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-2 mb-4 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab('database')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-game text-xs sm:text-sm font-bold transition cursor-pointer ${
              activeTab === 'database'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Buku Nilai Siswa ({scoreRecords.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-game text-xs sm:text-sm font-bold transition cursor-pointer ${
              activeTab === 'list'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Bank Soal ({questions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('add')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-game text-xs sm:text-sm font-bold transition cursor-pointer ${
              activeTab === 'add'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Soal Baru</span>
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-game text-xs sm:text-sm font-bold transition cursor-pointer ${
              activeTab === 'stats'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Statistik Game</span>
          </button>
        </div>

        {/* TAB 0: STUDENT GRADEBOOK DATABASE */}
        {activeTab === 'database' && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Quick KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3 font-game">
              <div className="p-2.5 bg-sky-50 rounded-2xl border border-sky-200">
                <span className="block text-3xs font-bold text-sky-800 uppercase">Total Ujian</span>
                <span className="text-xl font-extrabold text-sky-600">{totalEntries}</span>
              </div>
              <div className="p-2.5 bg-purple-50 rounded-2xl border border-purple-200">
                <span className="block text-3xs font-bold text-purple-800 uppercase">Rata-rata Kelas</span>
                <span className="text-xl font-extrabold text-purple-600">{avgScore} / 100</span>
              </div>
              <div className="p-2.5 bg-emerald-50 rounded-2xl border border-emerald-200">
                <span className="block text-3xs font-bold text-emerald-800 uppercase">Ketuntasan (≥75)</span>
                <span className="text-xl font-extrabold text-emerald-600">{passRate}%</span>
              </div>
              <div className="p-2.5 bg-amber-50 rounded-2xl border border-amber-200">
                <span className="block text-3xs font-bold text-amber-800 uppercase">Nilai Tertinggi</span>
                <span className="text-xl font-extrabold text-amber-600">{maxScore}</span>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2 flex-1 min-w-[200px] bg-slate-100 rounded-xl px-3 py-1.5 border border-slate-200">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Cari nama siswa atau materi ujian..."
                  value={dbSearchQuery}
                  onChange={(e) => setDbSearchQuery(e.target.value)}
                  className="bg-transparent text-xs w-full focus:outline-hidden text-slate-700 font-semibold"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={dbClassFilter}
                  onChange={(e) => setDbClassFilter(e.target.value)}
                  className="bg-slate-100 text-xs font-semibold text-slate-700 py-1.5 px-2.5 rounded-xl border border-slate-200 focus:outline-hidden"
                >
                  <option value="all">Semua Kelas</option>
                  {uniqueClasses.map((c) => (
                    <option key={c} value={c}>
                      Kelas {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Buttons: Export to Excel / JSON */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => exportScoresToCSV(filteredScoreRecords)}
                  className="flex items-center gap-1.5 text-xs font-game font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 py-1.5 px-3 rounded-xl border border-emerald-300 transition cursor-pointer"
                  title="Unduh file Excel (.CSV) untuk e-Rapor"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Ekspor Excel (.CSV)</span>
                </button>

                <button
                  onClick={() => exportScoresToJSON(filteredScoreRecords)}
                  className="flex items-center gap-1.5 text-xs font-game font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 py-1.5 px-2.5 rounded-xl border border-slate-300 transition cursor-pointer"
                  title="Unduh file JSON"
                >
                  <Download className="w-3.5 h-3.5 text-slate-600" />
                  <span>JSON</span>
                </button>
              </div>
            </div>

            {/* Scrollable Gradebook Table */}
            <div className="flex-1 overflow-x-auto overflow-y-auto rounded-2xl border border-slate-200 bg-white">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-game text-3xs font-extrabold uppercase sticky top-0 z-10 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">No</th>
                    <th className="py-2.5 px-3">Nama Siswa</th>
                    <th className="py-2.5 px-3">Kelas</th>
                    <th className="py-2.5 px-3">Materi / Misi</th>
                    <th className="py-2.5 px-3">Nilai</th>
                    <th className="py-2.5 px-3">Benar</th>
                    <th className="py-2.5 px-3">Akurasi</th>
                    <th className="py-2.5 px-3">Waktu</th>
                    <th className="py-2.5 px-3">Status KKM</th>
                    <th className="py-2.5 px-3">Tanggal</th>
                    <th className="py-2.5 px-2 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {filteredScoreRecords.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="py-12 text-center text-slate-400 text-xs">
                        Belum ada catatan nilai siswa yang sesuai.
                      </td>
                    </tr>
                  ) : (
                    filteredScoreRecords.map((rec, idx) => (
                      <tr key={rec.id} className="hover:bg-slate-50 transition">
                        <td className="py-2.5 px-3 text-slate-400 font-mono-score">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">
                          {rec.studentName}
                          {rec.studentNumber && (
                            <span className="text-3xs font-normal text-slate-400 ml-1">
                              (Absen #{rec.studentNumber})
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="bg-slate-100 text-slate-700 font-game text-3xs px-2 py-0.5 rounded-md font-bold">
                            {rec.gradeClass}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 max-w-[180px] truncate text-slate-800" title={rec.missionTitle}>
                          {rec.missionTitle}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`font-mono-score font-bold text-sm ${
                            rec.score >= 75 ? 'text-emerald-600' : 'text-red-600'
                          }`}>
                            {rec.score}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono-score text-slate-600">
                          {rec.correctAnswers}/{rec.totalQuestions}
                        </td>
                        <td className="py-2.5 px-3 font-mono-score">
                          {rec.accuracy}%
                        </td>
                        <td className="py-2.5 px-3 font-mono-score text-slate-500 text-3xs">
                          {Math.floor(rec.timeSpentSeconds / 60)}m {rec.timeSpentSeconds % 60}s
                        </td>
                        <td className="py-2.5 px-3">
                          {rec.passedKKM ? (
                            <span className="inline-flex items-center gap-1 text-3xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Tuntas
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-3xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                              <XCircle className="w-3 h-3 text-red-600" />
                              Remedial
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-3xs text-slate-400 font-mono-score whitespace-nowrap">
                          {rec.completedAt}
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <button
                            onClick={() => handleDeleteRecord(rec.id)}
                            className="text-slate-400 hover:text-red-600 p-1 rounded-md transition cursor-pointer"
                            title="Hapus Nilai Ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 mt-2 text-xs">
              <span className="text-3xs text-slate-500">
                KKM Standar: 75 • Data tersimpan otomatis di perangkat & dapat diunduh untuk e-Rapor
              </span>
              <button
                onClick={handleClearDatabase}
                className="text-2xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 py-1 px-2.5 rounded-lg border border-red-200 transition cursor-pointer"
              >
                Kosongkan Database Nilai
              </button>
            </div>
          </div>
        )}

        {/* TAB 1: QUESTION LIST */}
        {activeTab === 'list' && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Search and Filters */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2 flex-1 min-w-[200px] bg-slate-100 rounded-xl px-3 py-1.5 border border-slate-200">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Cari materi atau kata kunci soal..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-xs w-full focus:outline-hidden text-slate-700"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={filterGrade}
                  onChange={(e) => setFilterGrade(e.target.value)}
                  className="bg-slate-100 text-xs font-semibold text-slate-700 py-1.5 px-2.5 rounded-xl border border-slate-200 focus:outline-hidden"
                >
                  <option value="all">Semua Kelas</option>
                  <option value="SMP 7">Kelas 7</option>
                  <option value="SMP 8">Kelas 8</option>
                  <option value="SMP 9">Kelas 9</option>
                </select>
              </div>
            </div>

            {/* Questions Scrollable List */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {filteredQuestions.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs font-semibold">
                  Tidak ada soal yang cocok dengan pencarian.
                </div>
              ) : (
                filteredQuestions.map((q, idx) => (
                  <div
                    key={q.id || idx}
                    className="p-3 bg-slate-50 rounded-2xl border border-slate-200 hover:border-purple-300 transition text-left"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-game text-2xs font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                          {q.grade}
                        </span>
                        <span className="text-2xs font-semibold text-slate-500">
                          {q.topic}
                        </span>
                        {q.isCustom && (
                          <span className="font-game text-2xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                            Kustom Guru
                          </span>
                        )}
                      </div>

                      {q.isCustom && (
                        <button
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50 transition"
                          title="Hapus Soal"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <p className="font-game text-xs font-bold text-slate-800 mb-2">
                      {q.question}
                    </p>

                    <div className="grid grid-cols-2 gap-1.5 text-2xs mb-2">
                      {q.options.map((opt, oIdx) => (
                        <div
                          key={oIdx}
                          className={`p-1.5 rounded-lg border ${
                            oIdx === q.correctAnswerIndex
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                              : 'bg-white border-slate-200 text-slate-600'
                          }`}
                        >
                          <span className="font-bold mr-1">{String.fromCharCode(65 + oIdx)}.</span>
                          {opt}
                        </div>
                      ))}
                    </div>

                    <div className="text-2xs text-slate-500 bg-white p-2 rounded-lg border border-slate-100">
                      <strong className="text-slate-700">Pembahasan: </strong>
                      {q.explanation}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-200 mt-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportJSON}
                  className="flex items-center gap-1.5 text-xs font-game font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 py-1.5 px-3 rounded-xl border border-slate-300 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-slate-600" />
                  <span>Ekspor Bank Soal JSON</span>
                </button>

                <label className="flex items-center gap-1.5 text-xs font-game font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 py-1.5 px-3 rounded-xl border border-slate-300 cursor-pointer transition">
                  <Upload className="w-3.5 h-3.5 text-slate-600" />
                  <span>Impor JSON</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportJSON}
                    className="hidden"
                  />
                </label>
              </div>

              <button
                onClick={handleResetToDefaults}
                className="flex items-center gap-1.5 text-xs font-game font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 py-1.5 px-3 rounded-xl border border-amber-200 transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                <span>Reset Bank Soal</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: ADD NEW QUESTION */}
        {activeTab === 'add' && (
          <form onSubmit={handleAddQuestion} className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tingkat Kelas</label>
                <select
                  value={newGrade}
                  onChange={(e) => setNewGrade(e.target.value as GradeLevel)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-semibold text-slate-800 focus:outline-hidden"
                >
                  <option value="SMP 7">SMP Kelas 7</option>
                  <option value="SMP 8">SMP Kelas 8</option>
                  <option value="SMP 9">SMP Kelas 9</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Topik Materi</label>
                <select
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value as MathTopic)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-semibold text-slate-800 focus:outline-hidden"
                >
                  {TOPICS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Teks Soal Matematika</label>
              <textarea
                rows={2}
                placeholder="Contoh: Sebuah tabung memiliki jari-jari 7 cm dan tinggi 10 cm. Berapakah volumenya?"
                value={newQuestionText}
                onChange={(e) => setNewQuestionText(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-800 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Rumus / Formula Highlight (Opsional)</label>
              <input
                type="text"
                placeholder="Contoh: V = π × r² × t"
                value={newFormula}
                onChange={(e) => setNewFormula(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-mono text-slate-800 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">4 Pilihan Jawaban & Tentukan Jawaban Benar</label>
              <div className="space-y-1.5">
                {newOptions.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correctChoice"
                      checked={newCorrectIdx === idx}
                      onChange={() => setNewCorrectIdx(idx)}
                      className="w-4 h-4 text-purple-600 focus:ring-purple-500 cursor-pointer"
                      title="Tandai sebagai kunci jawaban benar"
                    />
                    <span className="font-bold text-slate-700 w-4">
                      {String.fromCharCode(65 + idx)}.
                    </span>
                    <input
                      type="text"
                      placeholder={`Pilihan ${String.fromCharCode(65 + idx)}`}
                      value={opt}
                      onChange={(e) => {
                        const updated = [...newOptions];
                        updated[idx] = e.target.value;
                        setNewOptions(updated);
                      }}
                      className="flex-1 bg-slate-50 border border-slate-300 rounded-xl p-2 text-slate-800 focus:outline-hidden"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Pembahasan Langkah demi Langkah</label>
              <textarea
                rows={2}
                placeholder="Jelaskan cara pengerjaannya agar siswa mengerti konsepnya..."
                value={newExplanation}
                onChange={(e) => setNewExplanation(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-800 focus:outline-hidden"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-b from-purple-600 to-indigo-700 hover:from-purple-500 hover:to-indigo-600 text-white font-game text-sm font-bold py-2.5 rounded-xl game-btn-shadow border border-purple-400 transition cursor-pointer"
            >
              SIMPAN SOAL KE GAME
            </button>
          </form>
        )}

        {/* TAB 3: GAMEPLAY ACCURACY STATS */}
        {activeTab === 'stats' && (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-4 bg-sky-50 rounded-2xl border border-sky-200">
                <span className="block text-2xs font-bold text-sky-800 uppercase mb-1">
                  Total Soal Dijawab
                </span>
                <span className="font-game text-2xl font-extrabold text-sky-600">
                  {stats.totalQuestionsAnswered}
                </span>
              </div>

              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                <span className="block text-2xs font-bold text-emerald-800 uppercase mb-1">
                  Jawaban Benar
                </span>
                <span className="font-game text-2xl font-extrabold text-emerald-600">
                  {stats.correctAnswersCount}
                </span>
              </div>

              <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200">
                <span className="block text-2xs font-bold text-purple-800 uppercase mb-1">
                  Akurasi Rata-rata
                </span>
                <span className="font-game text-2xl font-extrabold text-purple-600">
                  {accuracy}%
                </span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-2">
              <h4 className="font-game font-bold text-slate-900 text-sm">
                Petunjuk Integrasi Penilaian Guru:
              </h4>
              <p>
                1. Setiap kali siswa mengerjakan <strong>Misi 10 Menit: Volume Tabung & Kerucut</strong> atau menyelesaikan <strong>Dunia Petualangan</strong>, hasil nilainya langsung masuk ke tab <strong>Buku Nilai Siswa</strong>.
              </p>
              <p>
                2. Guru dapat mengunduh seluruh rekap nilai dalam format <strong>Excel (.CSV)</strong> untuk dimasukkan ke lembar penilaian harian atau aplikasi e-Rapor sekolah.
              </p>
              <p>
                3. Siswa dapat mengganti nama mereka kapan saja melalui tombol profil di halaman awal.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
