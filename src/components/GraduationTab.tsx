import React, { useRef, useState } from 'react';
import { Printer, Award, FileText, CheckCircle, AlertTriangle, Upload, Check, Trash2 } from 'lucide-react';
import { AppState, ClassName, Student } from '../types';
import { calcExamAverage, calcFinalIjazahScore, calcReport6SemesterAverage, getPredikat } from '../utils/calc';

interface GraduationTabProps {
  appState: AppState;
  onOpenDKN: () => void;
  onOpenSKL: (student: Student) => void;
  onOpenExamModal: (student: Student) => void;
  onUpdateSerial: (studentId: string, serial: string) => void;
  onExportExcel: () => void;
  onUpdateSchoolKop?: (kopDataUrl: string | undefined) => void;
  onShowToast?: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

export const GraduationTab: React.FC<GraduationTabProps> = ({
  appState,
  onOpenDKN,
  onOpenSKL,
  onOpenExamModal,
  onUpdateSerial,
  onUpdateSchoolKop,
  onShowToast,
}) => {
  const [filterClass, setFilterClass] = useState<ClassName | 'ALL'>('ALL');
  const kopInputRef = useRef<HTMLInputElement>(null);

  const filteredStudents = appState.students.filter(
    (s) => filterClass === 'ALL' || s.classRoom === filterClass
  );

  const handleKopUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onShowToast?.('Format Salah', 'File harus berupa gambar (PNG, JPG, atau WebP).', 'error');
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      onShowToast?.('Ukuran Terlalu Besar', 'Maksimal ukuran gambar Kop adalah 4 MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      if (result) {
        onUpdateSchoolKop?.(result);
        onShowToast?.(
          'Kop SKL Berhasil Diunggah',
          'Gambar kop surat resmi sekolah siap digunakan pada Cetak SKL semua siswa.',
          'success'
        );
      }
    };
    reader.readAsDataURL(file);

    if (e.target) {
      e.target.value = '';
    }
  };

  const handleRemoveKop = () => {
    if (window.confirm('Hapus gambar kop surat sekolah dan gunakan format teks default?')) {
      onUpdateSchoolKop?.(undefined);
      onShowToast?.('Kop Surat Direset', 'Kop surat SKL kembali menggunakan teks standar.', 'info');
    }
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-blue-200/80 shadow-sm space-y-4">
      {/* Hidden Kop File Input */}
      <input
        ref={kopInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        className="hidden"
        onChange={handleKopUpload}
      />

      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="font-bold text-blue-950 text-base">
            Rekapitulasi Nilai Ijazah & Kelulusan Kelas 6
          </h2>
          <div className="flex flex-wrap items-center gap-2 text-xs text-blue-800/80 mt-0.5 font-medium">
            <span>Bobot: 60% Rapor (6 Smt) + 40% Ujian Sekolah</span>
            <span aria-hidden="true" className="text-blue-300">·</span>
            <span>Standar KKM: &ge; {appState.school.passingGrade.toFixed(1)}</span>
            {appState.school.kopImageUrl && (
              <>
                <span aria-hidden="true" className="text-blue-300">·</span>
                <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold border border-emerald-200 text-[11px]">
                  <Check className="w-3 h-3" /> Kop Sekolah Aktif
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Class Filter */}
          <div className="flex items-center gap-1.5 mr-1">
            <span className="text-xs font-semibold text-slate-700">Filter:</span>
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value as ClassName | 'ALL')}
              className="text-xs border border-blue-200 rounded-xl px-2.5 py-1.5 bg-white font-semibold text-blue-900 focus:ring-2 focus:ring-blue-600"
            >
              <option value="ALL">Semua Kelas (6A - 6D)</option>
              <option value="6A">Kelas 6A</option>
              <option value="6B">Kelas 6B</option>
              <option value="6C">Kelas 6C</option>
              <option value="6D">Kelas 6D</option>
            </select>
          </div>

          {/* Upload Kop SKL Button */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => kopInputRef.current?.click()}
              className="px-3.5 py-2 bg-gradient-to-r from-blue-700 via-sky-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white text-xs font-semibold rounded-xl shadow-xs flex items-center gap-1.5 transition active:scale-95"
              title="Upload file gambar kop surat resmi untuk Cetak SKL"
            >
              <Upload className="w-3.5 h-3.5 text-sky-200" />
              <span>{appState.school.kopImageUrl ? 'Ganti Kop SKL' : 'Upload Kop SKL'}</span>
            </button>
            {appState.school.kopImageUrl && (
              <button
                onClick={handleRemoveKop}
                className="p-2 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition"
                title="Hapus Kop Gambar SKL"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Cetak DKN Ijazah Button */}
          <button
            onClick={onOpenDKN}
            className="px-4 py-2 bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 hover:from-blue-800 hover:to-indigo-800 text-white text-xs font-semibold rounded-xl shadow-sm flex items-center gap-1.5 transition active:scale-95"
          >
            <Printer className="w-3.5 h-3.5 text-sky-300" />
            <span>Cetak DKN Ijazah</span>
          </button>
        </div>
      </div>

      {/* Table with Blue Gradient Header */}
      <div className="overflow-x-auto border border-blue-200 rounded-xl shadow-2xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white font-semibold">
            <tr>
              <th className="py-2.5 px-3 border-r border-blue-800/60 w-10 text-center">No</th>
              <th className="py-2.5 px-3 border-r border-blue-800/60 w-14 text-center">Kelas</th>
              <th className="py-2.5 px-3 border-r border-blue-800/60 w-28">NISN</th>
              <th className="py-2.5 px-3 border-r border-blue-800/60 min-w-44">Nama Siswa</th>
              <th className="py-2.5 px-3 border-r border-blue-800/60 text-center w-28">
                Rata Rapor (60%)
              </th>
              <th className="py-2.5 px-3 border-r border-blue-800/60 text-center w-32">
                Rata Ujian (40%)
              </th>
              <th className="py-2.5 px-3 border-r border-blue-800/60 text-center w-28 bg-blue-950 font-bold">
                Nilai Akhir
              </th>
              <th className="py-2.5 px-3 border-r border-blue-800/60 text-center w-24">Predikat</th>
              <th className="py-2.5 px-3 border-r border-blue-800/60 text-center w-24">Status</th>
              <th className="py-2.5 px-3 border-r border-blue-800/60 text-center min-w-44">
                No. Seri Ijazah
              </th>
              <th className="py-2.5 px-3 text-center w-28">Aksi SKL</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-100">
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-10 text-center text-slate-400 italic">
                  Belum ada data siswa di kelas yang dipilih. Silakan tambah data siswa atau impor file Excel terlebih dahulu.
                </td>
              </tr>
            ) : (
              filteredStudents.map((s, idx) => {
                const sGrades = appState.grades[s.id];
                const sExams = appState.exams[s.id];
                const avgRapor = calcReport6SemesterAverage(sGrades);
                const avgExam = calcExamAverage(sExams);
                const finalScore = calcFinalIjazahScore(
                  avgRapor,
                  avgExam,
                  appState.school.reportWeight,
                  appState.school.examWeight
                );
                const { predikat, huruf } = getPredikat(finalScore);
                const isPassed = finalScore >= appState.school.passingGrade;
                const defaultSerial = s.ijazahSerial || `DN-02/D-SD/27/${s.classRoom}/${String(idx + 1).padStart(4, '0')}`;

                return (
                  <tr key={s.id} className="hover:bg-blue-50/40 transition">
                    <td className="py-2.5 px-3 border-r border-blue-100 text-center num-font text-slate-500">
                      {idx + 1}
                    </td>
                    <td className="py-2.5 px-3 border-r border-blue-100 text-center">
                      <span className="font-bold text-blue-900 bg-blue-100 px-2 py-0.5 rounded border border-blue-200">
                        {s.classRoom}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 border-r border-blue-100 num-font text-slate-600 font-medium">
                      {s.nisn}
                    </td>
                    <td className="py-2.5 px-3 border-r border-blue-100 font-semibold text-slate-900">
                      {s.name}
                    </td>
                    <td className="py-2.5 px-3 border-r border-blue-100 text-center num-font font-medium text-slate-700">
                      {avgRapor.toFixed(1)}
                    </td>
                    <td className="py-2.5 px-3 border-r border-blue-100 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <span className="num-font font-medium text-slate-700">
                          {avgExam.toFixed(1)}
                        </span>
                        <button
                          onClick={() => onOpenExamModal(s)}
                          className="p-1 hover:bg-blue-100 text-blue-700 rounded-lg transition"
                          title="Input / Edit Nilai Ujian Tulis & Praktek"
                        >
                          <Award className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 border-r border-blue-100 text-center font-extrabold text-blue-950 bg-blue-100/60 num-font text-sm">
                      {finalScore.toFixed(1)}
                    </td>
                    <td className="py-2.5 px-3 border-r border-blue-100 text-center">
                      <span className="font-bold text-blue-900">{huruf}</span>{' '}
                      <span className="text-[11px] text-slate-500">({predikat})</span>
                    </td>
                    <td className="py-2.5 px-3 border-r border-blue-100 text-center">
                      {isPassed ? (
                        <span className="inline-flex items-center gap-1 text-blue-700 font-bold text-xs bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>LULUS</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-700 font-bold text-xs bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>TIDAK LULUS</span>
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 border-r border-blue-100 text-center">
                      <input
                        type="text"
                        value={s.ijazahSerial ?? defaultSerial}
                        onChange={(e) => onUpdateSerial(s.id, e.target.value)}
                        placeholder="DN-02/D-SD/27/..."
                        className="w-full text-center text-xs py-1 px-1.5 border border-blue-200 hover:border-blue-400 rounded-lg num-font font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                      />
                    </td>
                    <td className="py-2.5 px-3 text-center space-x-1">
                      <button
                        onClick={() => onOpenSKL(s)}
                        className="px-2.5 py-1.5 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white rounded-lg font-semibold text-[11px] inline-flex items-center gap-1 transition shadow-xs active:scale-95"
                        title="Cetak Surat Keterangan Lulus (SKL)"
                      >
                        <FileText className="w-3 h-3 text-sky-200" />
                        <span>Cetak SKL</span>
                      </button>
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
