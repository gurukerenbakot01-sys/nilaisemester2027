import React from 'react';
import { Users, BookOpen, GraduationCap, ArrowRight, UserPlus, CheckCircle2 } from 'lucide-react';
import { AppState, ClassName } from '../types';
import { calcExamAverage, calcFinalIjazahScore, calcReport6SemesterAverage } from '../utils/calc';

interface DashboardTabProps {
  appState: AppState;
  onNavigateTab: (tabId: string) => void;
  onOpenAddStudent: () => void;
  onOpenDKN: () => void;
  onExportExcel: () => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  appState,
  onNavigateTab,
  onOpenAddStudent,
}) => {
  const totalStudents = appState.students.length;

  let grandFinalScoreSum = 0;
  let passedCount = 0;

  appState.students.forEach((s) => {
    const avgR = calcReport6SemesterAverage(appState.grades[s.id]);
    const avgE = calcExamAverage(appState.exams[s.id]);
    const finalScore = calcFinalIjazahScore(
      avgR,
      avgE,
      appState.school.reportWeight,
      appState.school.examWeight
    );
    grandFinalScoreSum += finalScore;
    if (finalScore >= appState.school.passingGrade) {
      passedCount++;
    }
  });

  const overallAvg = totalStudents > 0 ? (grandFinalScoreSum / totalStudents).toFixed(1) : '-';
  const passingRate = totalStudents > 0 ? Math.round((passedCount / totalStudents) * 100) : 0;

  const classes: ClassName[] = ['6A', '6B', '6C', '6D'];

  return (
    <div className="space-y-6">
      {/* Empty State Alert if 0 students */}
      {totalStudents === 0 && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-bold text-base flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse"></span>
              <span>Data Siswa & Nilai Masih Kosong (Siap Diisi)</span>
            </h3>
            <p className="text-xs text-blue-200">
              Aplikasi telah disiapkan dalam kondisi bersih tanpa data bawaan. Anda dapat menambahkan siswa satu per satu atau langsung mengunggah file Excel (.xlsx).
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenAddStudent}
              className="px-3.5 py-2 bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-300 hover:to-blue-400 text-white font-semibold text-xs rounded-xl shadow-xs transition"
            >
              + Tambah Siswa Baru
            </button>
            <button
              onClick={() => onNavigateTab('excel')}
              className="px-3.5 py-2 bg-blue-800/80 hover:bg-blue-700/80 text-white font-semibold text-xs rounded-xl border border-blue-600/50 transition"
            >
              Upload Excel
            </button>
          </div>
        </div>
      )}

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-white via-sky-50/40 to-blue-50/70 p-5 rounded-2xl border border-blue-200/80 shadow-sm hover:border-blue-300 transition">
          <div className="flex items-center justify-between text-blue-900/80">
            <span className="text-xs font-bold uppercase tracking-wider">Total Siswa Kelas 6</span>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-sky-500 text-white flex items-center justify-center shadow-xs">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-blue-950 mt-2 num-font">{totalStudents}</p>
          <div className="flex items-center gap-1.5 text-xs text-blue-700/80 mt-1 font-medium">
            <span>Rombel: 6A, 6B, 6C, 6D</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white via-blue-50/40 to-indigo-50/70 p-5 rounded-2xl border border-blue-200/80 shadow-sm hover:border-blue-300 transition">
          <div className="flex items-center justify-between text-blue-900/80">
            <span className="text-xs font-bold uppercase tracking-wider">Cakupan Nilai Rapor</span>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center shadow-xs">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-blue-800 mt-2 num-font">6 Smt</p>
          <div className="flex items-center gap-1.5 text-xs text-blue-700/80 mt-1 font-medium">
            <span>K4 (1&2), K5 (1&2), K6 (1&2)</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white via-indigo-50/40 to-blue-100/60 p-5 rounded-2xl border border-blue-200/80 shadow-sm hover:border-blue-300 transition">
          <div className="flex items-center justify-between text-blue-900/80">
            <span className="text-xs font-bold uppercase tracking-wider">Rata-Rata Nilai Ijazah</span>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-blue-700 text-white flex items-center justify-center shadow-xs">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-indigo-900 mt-2 num-font">{overallAvg}</p>
          <div className="flex items-center gap-1.5 text-xs text-indigo-700/80 mt-1 font-medium">
            <span>Bobot: 60% Rapor + 40% Ujian</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white via-sky-50/40 to-cyan-50/70 p-5 rounded-2xl border border-blue-200/80 shadow-sm hover:border-blue-300 transition">
          <div className="flex items-center justify-between text-blue-900/80">
            <span className="text-xs font-bold uppercase tracking-wider">Tingkat Kelulusan</span>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-600 text-white flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-blue-700 mt-2 num-font">{passingRate}%</p>
          <div className="flex items-center gap-1.5 text-xs text-blue-800/80 mt-1 font-medium">
            <span>{passedCount} dari {totalStudents} siswa lulus KKM</span>
          </div>
        </div>
      </div>

      {/* Class Breakdown Grid */}
      <div className="bg-gradient-to-br from-white via-blue-50/20 to-sky-50/40 p-5 rounded-2xl border border-blue-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-blue-950 text-base">
              Rekapitulasi Per Rombongan Belajar (Kelas 6A - 6D)
            </h3>
            <p className="text-xs text-slate-500">
              Distribusi siswa dan rata-rata nilai akhir per kelas tahun ajaran {appState.school.academicYear}
            </p>
          </div>
          <button
            onClick={onOpenAddStudent}
            className="px-3.5 py-1.5 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Tambah Siswa</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {classes.map((cls) => {
            const classStudents = appState.students.filter((s) => s.classRoom === cls);
            let classSum = 0;
            let classPass = 0;
            classStudents.forEach((s) => {
              const r = calcReport6SemesterAverage(appState.grades[s.id]);
              const e = calcExamAverage(appState.exams[s.id]);
              const fin = calcFinalIjazahScore(r, e, 60, 40);
              classSum += fin;
              if (fin >= appState.school.passingGrade) classPass++;
            });
            const clsAvg = classStudents.length > 0 ? (classSum / classStudents.length).toFixed(1) : '-';

            return (
              <div
                key={cls}
                className="p-4 rounded-xl border border-blue-200/80 bg-gradient-to-br from-white to-blue-50/60 hover:to-blue-100/60 shadow-2xs transition"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-base text-blue-950">Kelas {cls}</span>
                  <span className="text-xs font-bold text-blue-800 px-2 py-0.5 bg-blue-100/90 border border-blue-200 rounded-md">
                    {classStudents.length} Siswa
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Rata-Rata Nilai</span>
                  <span className="font-bold text-blue-900 num-font">{clsAvg}</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Kelulusan</span>
                  <span className="font-bold text-blue-700">
                    {classStudents.length > 0 ? `${Math.round((classPass / classStudents.length) * 100)}%` : '-'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3 Main Action Cards with Blue Gradient theme */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-gradient-to-br from-white to-blue-50/40 p-5 rounded-2xl border border-blue-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition">
          <div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-800 text-white flex items-center justify-center mb-3 shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-blue-950 text-base">Kelola Data Siswa</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Daftar siswa Kelas 6A, 6B, 6C, dan 6D lengkap dengan NIS, NISN, orang tua, cetak rapor perorangan, dan tombol edit/hapus.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('students')}
            className="mt-4 px-4 py-2.5 bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 hover:from-blue-800 hover:to-indigo-800 text-white rounded-xl text-xs font-semibold flex items-center justify-between shadow-sm transition"
          >
            <span>Buka Data Siswa</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-gradient-to-br from-white to-sky-50/40 p-5 rounded-2xl border border-blue-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition">
          <div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-700 text-white flex items-center justify-center mb-3 shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-blue-950 text-base">Input Nilai 6 Semester</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Input dan rekapitulasi nilai rapor 9 mata pelajaran untuk K4 Smt 1/2, K5 Smt 1/2, K6 Smt 1/2 dengan fitur isi cepat & simpan instan.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('semesters')}
            className="mt-4 px-4 py-2.5 bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 hover:from-sky-500 hover:to-blue-500 text-white rounded-xl text-xs font-semibold flex items-center justify-between shadow-sm transition"
          >
            <span>Input Nilai Rapor</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-gradient-to-br from-white to-indigo-50/40 p-5 rounded-2xl border border-blue-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition">
          <div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-700 to-blue-900 text-white flex items-center justify-center mb-3 shadow-xs">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-blue-950 text-base">Ujian Sekolah & Rekap Ijazah</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Nilai ujian tulis, ujian praktek, cetak DKN Ijazah, dan Surat Keterangan Lulus (SKL) resmi SD Negeri Babelan Kota 01.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('graduation')}
            className="mt-4 px-4 py-2.5 bg-gradient-to-r from-indigo-800 via-blue-800 to-blue-950 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl text-xs font-semibold flex items-center justify-between shadow-sm transition"
          >
            <span>Buka Rekap Ijazah</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
