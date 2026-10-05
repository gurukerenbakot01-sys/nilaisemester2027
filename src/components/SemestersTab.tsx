import React, { useState } from 'react';
import { Save, FileSpreadsheet, Sparkles, AlertCircle } from 'lucide-react';
import { AppState, ClassName, SemesterKey, SEMESTER_LABELS, SubjectGrades, SUBJECT_LABELS } from '../types';
import { SUBJECT_KEYS, calcSemesterAverage } from '../utils/calc';
import { exportSemesterToExcel } from '../utils/excel';

interface SemestersTabProps {
  appState: AppState;
  onUpdateGrade: (
    studentId: string,
    semester: SemesterKey,
    subject: keyof SubjectGrades,
    value: number
  ) => void;
  onSaveGrades: () => void;
  onBulkFillGrades: (semester: SemesterKey, classRoom: ClassName, value: number) => void;
  onShowToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

export const SemestersTab: React.FC<SemestersTabProps> = ({
  appState,
  onUpdateGrade,
  onSaveGrades,
  onBulkFillGrades,
  onShowToast,
}) => {
  const [selectedSemester, setSelectedSemester] = useState<SemesterKey>('K6_S1');
  const [selectedClass, setSelectedClass] = useState<ClassName>('6A');

  const studentsInClass = appState.students.filter((s) => s.classRoom === selectedClass);

  const handleExportSemester = async () => {
    try {
      await exportSemesterToExcel(appState, selectedSemester, selectedClass);
      onShowToast(
        `File Excel Nilai ${selectedClass} (${selectedSemester}) Berhasil Diunduh!`,
        'Format tabel dengan border dan header biru rapi.',
        'success'
      );
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      onShowToast('Gagal Mengunduh Excel', msg, 'error');
    }
  };

  const handleBulkFill = (val: number) => {
    if (confirm(`Isi semua nilai yang kosong/0 pada ${selectedClass} (${selectedSemester}) dengan nilai ${val}?`)) {
      onBulkFillGrades(selectedSemester, selectedClass, val);
      onShowToast(`Nilai standar (${val}) berhasil diterapkan!`, undefined, 'success');
    }
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-blue-200/80 shadow-sm space-y-4">
      {/* Top Filter and Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="text-xs text-slate-600 block mb-1 font-semibold">Pilih Semester:</label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value as SemesterKey)}
              className="text-xs border border-blue-200 rounded-xl px-3 py-1.5 font-bold text-blue-900 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
            >
              <option value="K4_S1">Kelas 4 Semester 1 (TP 2024/2025)</option>
              <option value="K4_S2">Kelas 4 Semester 2 (TP 2024/2025)</option>
              <option value="K5_S1">Kelas 5 Semester 1 (TP 2025/2026)</option>
              <option value="K5_S2">Kelas 5 Semester 2 (TP 2025/2026)</option>
              <option value="K6_S1">Kelas 6 Semester 1 (TP 2026/2027)</option>
              <option value="K6_S2">Kelas 6 Semester 2 (TP 2026/2027)</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-600 block mb-1 font-semibold">Pilih Rombel:</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value as ClassName)}
              className="text-xs border border-blue-200 rounded-xl px-3 py-1.5 font-extrabold text-blue-950 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
            >
              <option value="6A">Kelas 6A</option>
              <option value="6B">Kelas 6B</option>
              <option value="6C">Kelas 6C</option>
              <option value="6D">Kelas 6D</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleBulkFill(85)}
            className="px-3.5 py-1.5 bg-gradient-to-r from-sky-50 to-blue-100 hover:from-sky-100 hover:to-blue-200 text-blue-900 border border-blue-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition shadow-2xs"
            title="Isi otomatis nilai yang masih 0 dengan nilai 85"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Isi Standar (85)</span>
          </button>

          <button
            onClick={handleExportSemester}
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-900 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition border border-slate-200"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-blue-700" />
            <span>Export Nilai Ini (.xlsx)</span>
          </button>

          <button
            onClick={onSaveGrades}
            className="px-4 py-2 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 active:from-blue-800 active:to-indigo-800 text-white text-xs font-semibold rounded-xl shadow-sm flex items-center gap-1.5 transition"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Nilai Semester</span>
          </button>
        </div>
      </div>

      {/* Information Header with Blue Gradient */}
      <div className="p-3 bg-gradient-to-r from-blue-50 via-sky-50 to-indigo-50 border border-blue-200 rounded-xl flex items-center justify-between text-xs text-blue-950">
        <div className="flex items-center gap-2 font-medium">
          <AlertCircle className="w-4 h-4 text-blue-700 shrink-0" />
          <span>
            Sedang mengedit nilai: <strong className="text-blue-900 font-bold">{SEMESTER_LABELS[selectedSemester]}</strong> · Rombongan Belajar: <strong className="text-blue-900 font-bold">Kelas {selectedClass}</strong> ({studentsInClass.length} Siswa)
          </span>
        </div>
        <span className="text-[11px] font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded border border-blue-200">
          Standar KKM Rata-Rata: &ge; 75.0
        </span>
      </div>

      {/* Table with Blue Gradient Header */}
      <div className="overflow-x-auto border border-blue-200 rounded-xl shadow-2xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white font-semibold">
            <tr>
              <th className="py-2.5 px-3 border-r border-blue-800/60 w-10 text-center">No</th>
              <th className="py-2.5 px-3 border-r border-blue-800/60 min-w-48">Nama Siswa</th>
              {SUBJECT_KEYS.map((sub) => (
                <th
                  key={sub}
                  className="py-2.5 px-1.5 border-r border-blue-800/60 text-center w-14"
                  title={SUBJECT_LABELS[sub].fullName}
                >
                  {SUBJECT_LABELS[sub].label}
                </th>
              ))}
              <th className="py-2.5 px-3 text-center bg-blue-950 min-w-20 font-bold">Rata-Rata</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-100/70">
            {studentsInClass.length === 0 ? (
              <tr>
                <td colSpan={12} className="py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center space-y-1">
                    <p className="font-bold text-blue-950 text-sm">
                      Belum Ada Siswa di Kelas {selectedClass}
                    </p>
                    <p className="text-xs text-slate-500">
                      Silakan tambahkan data siswa terlebih dahulu di tab <strong>"Data Siswa"</strong> atau impor file Excel di tab <strong>"Integrasi Database Excel"</strong>.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              studentsInClass.map((s, idx) => {
                const grades = (appState.grades[s.id] && appState.grades[s.id][selectedSemester]) || ({} as SubjectGrades);
                const avg = calcSemesterAverage(grades);

                return (
                  <tr key={s.id} className="hover:bg-blue-50/40 transition">
                    <td className="py-2 px-3 border-r border-blue-100 text-center num-font text-slate-500">
                      {idx + 1}
                    </td>
                    <td className="py-2 px-3 border-r border-blue-100 font-semibold text-slate-900">
                      <div>{s.name}</div>
                      <div className="text-[11px] text-blue-600/80 num-font font-medium">{s.nisn}</div>
                    </td>
                    {SUBJECT_KEYS.map((sub) => {
                      const val = grades[sub] ?? 0;
                      return (
                        <td key={sub} className="py-1 px-1 border-r border-blue-100 text-center">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={val === 0 ? '' : val}
                            onChange={(e) =>
                              onUpdateGrade(
                                s.id,
                                selectedSemester,
                                sub,
                                Math.max(0, Math.min(100, Number(e.target.value) || 0))
                              )
                            }
                            className="w-12 text-center border border-blue-200 hover:border-blue-400 focus:border-blue-600 rounded-lg py-1 num-font text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-600 bg-white"
                          />
                        </td>
                      );
                    })}
                    <td className="py-2 px-3 text-center font-extrabold text-blue-950 num-font bg-blue-100/50">
                      {avg > 0 ? avg.toFixed(1) : ''}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
