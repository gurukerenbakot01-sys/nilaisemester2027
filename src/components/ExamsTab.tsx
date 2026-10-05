import React, { useState } from 'react';
import { Award, Printer, Sparkles, CheckCircle2, Save } from 'lucide-react';
import { AppState, ClassName, SubjectGrades, SUBJECT_LABELS } from '../types';
import { SUBJECT_KEYS, calcExamAverage } from '../utils/calc';
import { printElement } from '../utils/print';

interface ExamsTabProps {
  appState: AppState;
  onUpdateExamScore: (
    studentId: string,
    subject: keyof SubjectGrades,
    field: 'written' | 'practice',
    value: number
  ) => void;
  onBulkFillExams?: (defaultValue: number) => void;
  onSaveExamsNotification?: () => void;
  onShowToast?: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

export const ExamsTab: React.FC<ExamsTabProps> = ({
  appState,
  onUpdateExamScore,
  onBulkFillExams,
  onSaveExamsNotification,
  onShowToast,
}) => {
  const [filterClass, setFilterClass] = useState<ClassName | 'ALL'>('ALL');

  const filteredStudents = appState.students.filter(
    (s) => filterClass === 'ALL' || s.classRoom === filterClass
  );

  const handlePrintExams = () => {
    printElement(
      'exams-table-printable',
      `Rekap_Nilai_Ujian_${filterClass === 'ALL' ? 'Semua_Kelas' : filterClass}_SDN_Babelan_Kota_01`,
      'landscape'
    );
  };

  const handleQuickFill = () => {
    if (filteredStudents.length === 0) {
      onShowToast?.('Tidak Ada Siswa', 'Belum ada data siswa untuk diisi.', 'info');
      return;
    }
    if (
      window.confirm(
        'Isi nilai ujian sekolah (Tulis & Praktek) otomatis dengan nilai standar 85 untuk seluruh siswa? Anda tetap bisa mengedit masing-masing siswa langsung di kolom.'
      )
    ) {
      onBulkFillExams?.(85);
      onShowToast?.(
        'Nilai Ujian Terisi',
        'Seluruh nilai ujian berhasil diisi dengan nilai standar 85.',
        'success'
      );
    }
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-blue-200/80 shadow-sm space-y-4">
      {/* Header Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 no-print">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-900 flex items-center justify-center font-bold">
              <Award className="w-4 h-4 text-blue-800" />
            </div>
            <div>
              <h2 className="font-bold text-blue-950 text-base">
                Daftar Nilai Ujian Sekolah (Tulis & Praktek)
              </h2>
              <p className="text-xs text-blue-800/80 font-medium">
                Input langsung pada setiap kolom nilai · Otomatis hitung Nilai Akhir & Rata-rata Ujian (40%)
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Filter Kelas */}
          <div className="flex items-center gap-1.5 mr-1">
            <span className="text-xs font-semibold text-slate-700">Filter Kelas:</span>
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value as ClassName | 'ALL')}
              className="text-xs border border-blue-200 rounded-xl px-2.5 py-1.5 bg-white font-semibold text-blue-900 focus:ring-2 focus:ring-blue-600 cursor-pointer"
            >
              <option value="ALL">Semua Kelas (6A - 6D)</option>
              <option value="6A">Kelas 6A</option>
              <option value="6B">Kelas 6B</option>
              <option value="6C">Kelas 6C</option>
              <option value="6D">Kelas 6D</option>
            </select>
          </div>

          {/* Quick Fill Button */}
          {onBulkFillExams && (
            <button
              onClick={handleQuickFill}
              className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-900 text-xs font-semibold rounded-xl border border-blue-200 flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
              title="Isi otomatis nilai default 85 untuk seluruh siswa"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Isi Standar (85)</span>
            </button>
          )}

          {/* Simpan Nilai Button */}
          <button
            onClick={() => onSaveExamsNotification?.()}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
            title="Konfirmasi simpan seluruh nilai ujian"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Simpan Nilai</span>
          </button>

          {/* Cetak Rekap Ujian Button */}
          <button
            onClick={handlePrintExams}
            className="px-4 py-2 bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 hover:from-blue-800 hover:to-indigo-800 text-white text-xs font-semibold rounded-xl shadow-sm flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
            title="Cetak rekapitulasi nilai ujian sekolah (Format Landscape A4)"
          >
            <Printer className="w-3.5 h-3.5 text-sky-300" />
            <span>Cetak Rekap Ujian</span>
          </button>
        </div>
      </div>

      {/* Printable Container */}
      <div id="exams-table-printable" className="space-y-4">
        {/* Printable Title (visible in print mode) */}
        <div className="print-only text-center border-b-2 border-slate-900 pb-2 mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            PEMERINTAH KABUPATEN BEKASI · DINAS PENDIDIKAN
          </h2>
          <h1 className="text-base font-extrabold uppercase text-slate-900 tracking-tight mt-0.5">
            REKAPITULASI NILAI UJIAN SEKOLAH (TULIS & PRAKTEK) KELAS 6
          </h1>
          <p className="text-xs font-semibold text-slate-800 mt-0.5">
            {appState.school.name} · TAHUN AJARAN {appState.school.academicYear}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Rombongan Belajar: {filterClass === 'ALL' ? 'Semua Kelas (6A - 6D)' : `Kelas ${filterClass}`} · Bobot Kelulusan Ujian: 40%
          </p>
        </div>

        {/* Exams Table with Blue Gradient Header */}
        <div className="overflow-x-auto border border-blue-200 rounded-xl shadow-2xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white font-semibold">
              <tr>
                <th className="py-2 px-1.5 border-r border-blue-800/60 w-8 text-center" rowSpan={2}>No</th>
                <th className="py-2 px-1.5 border-r border-blue-800/60 w-12 text-center" rowSpan={2}>Kelas</th>
                <th className="py-2 px-2 border-r border-blue-800/60 w-24 text-center" rowSpan={2}>NISN</th>
                <th className="py-2 px-3 border-r border-blue-800/60 min-w-44" rowSpan={2}>Nama Siswa</th>
                
                {/* Subject Headers */}
                {SUBJECT_KEYS.map((key) => {
                  const s = SUBJECT_LABELS[key];
                  return (
                    <th
                      key={key}
                      colSpan={s.hasPractice ? 3 : 1}
                      className="py-1.5 px-1 border-r border-blue-800/60 text-center font-bold text-[11px] border-b border-blue-800/40"
                    >
                      {s.label}
                    </th>
                  );
                })}

                <th className="py-2 px-2.5 text-center w-20 bg-blue-950 font-bold" rowSpan={2}>
                  Rata Ujian
                </th>
              </tr>
              <tr className="bg-blue-900/90 text-blue-100 text-[10px]">
                {SUBJECT_KEYS.map((key) => {
                  const s = SUBJECT_LABELS[key];
                  if (s.hasPractice) {
                    return (
                      <React.Fragment key={`${key}-sub`}>
                        <th className="py-1 px-1 border-r border-blue-800/60 text-center w-11 font-medium" title="Ujian Tulis">Tul</th>
                        <th className="py-1 px-1 border-r border-blue-800/60 text-center w-11 font-medium" title="Ujian Praktek">Prk</th>
                        <th className="py-1 px-1 border-r border-blue-800/60 text-center w-11 font-bold text-sky-200" title="Nilai Akhir Ujian (Rata-rata)">Akh</th>
                      </React.Fragment>
                    );
                  }
                  return (
                    <th key={`${key}-sub`} className="py-1 px-1 border-r border-blue-800/60 text-center w-12 font-medium" title="Ujian Tulis">
                      Nilai
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={24} className="py-10 text-center text-slate-400 italic">
                    Belum ada data siswa di kelas yang dipilih. Silakan tambah data siswa atau impor file Excel terlebih dahulu.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s, idx) => {
                  const sExams = appState.exams[s.id];
                  const avgExam = calcExamAverage(sExams);

                  return (
                    <tr key={s.id} className="hover:bg-blue-50/40 transition">
                      <td className="py-1.5 px-1.5 border-r border-blue-100 text-center num-font text-slate-500">
                        {idx + 1}
                      </td>
                      <td className="py-1.5 px-1.5 border-r border-blue-100 text-center">
                        <span className="font-bold text-blue-900 bg-blue-100 px-1.5 py-0.5 rounded text-[11px] border border-blue-200">
                          {s.classRoom}
                        </span>
                      </td>
                      <td className="py-1.5 px-1.5 border-r border-blue-100 num-font text-slate-600 font-medium text-center">
                        {s.nisn}
                      </td>
                      <td className="py-1.5 px-3 border-r border-blue-100 font-semibold text-slate-900 whitespace-nowrap">
                        {s.name}
                      </td>

                      {/* Direct Inline Score Input Columns */}
                      {SUBJECT_KEYS.map((key) => {
                        const sLabel = SUBJECT_LABELS[key];
                        const item = sExams?.[key];
                        const written = item?.written ?? 0;
                        const practice = item?.practice ?? 0;
                        const finalExam = item?.finalExam ?? 0;

                        if (sLabel.hasPractice) {
                          return (
                            <React.Fragment key={`${s.id}-${key}`}>
                              {/* Tulis */}
                              <td className="py-1 px-1 border-r border-blue-100 text-center">
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={written === 0 ? '' : written}
                                  onChange={(e) => {
                                    const val = e.target.value === '' ? 0 : Number(e.target.value);
                                    onUpdateExamScore(s.id, key, 'written', val);
                                  }}
                                  className="screen-only w-10 text-center py-1 px-0.5 border border-blue-200 hover:border-blue-400 focus:border-blue-600 rounded-md text-xs font-semibold num-font bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-600"
                                  title={`Nilai Ujian Tulis ${sLabel.label}`}
                                />
                                <span className="print-only num-font">{written > 0 ? written : ''}</span>
                              </td>

                              {/* Praktek */}
                              <td className="py-1 px-1 border-r border-blue-100 text-center">
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={practice === 0 ? '' : practice}
                                  onChange={(e) => {
                                    const val = e.target.value === '' ? 0 : Number(e.target.value);
                                    onUpdateExamScore(s.id, key, 'practice', val);
                                  }}
                                  className="screen-only w-10 text-center py-1 px-0.5 border border-blue-200 hover:border-blue-400 focus:border-blue-600 rounded-md text-xs font-semibold num-font bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-600"
                                  title={`Nilai Ujian Praktek ${sLabel.label}`}
                                />
                                <span className="print-only num-font">{practice > 0 ? practice : ''}</span>
                              </td>

                              {/* Nilai Akhir (Otomatis) */}
                              <td className="py-1 px-1 border-r border-blue-100 text-center bg-blue-50/40">
                                <span className="font-bold text-blue-900 num-font text-xs">
                                  {finalExam > 0 ? finalExam : ''}
                                </span>
                              </td>
                            </React.Fragment>
                          );
                        }

                        {/* Subject without practice (PPKn, MTK, B.Inggris) */}
                        return (
                          <td key={`${s.id}-${key}`} className="py-1 px-1 border-r border-blue-100 text-center">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={written === 0 ? '' : written}
                              onChange={(e) => {
                                const val = e.target.value === '' ? 0 : Number(e.target.value);
                                onUpdateExamScore(s.id, key, 'written', val);
                              }}
                              className="screen-only w-12 text-center py-1 px-0.5 border border-blue-200 hover:border-blue-400 focus:border-blue-600 rounded-md text-xs font-semibold num-font bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-600"
                              title={`Nilai Ujian ${sLabel.label}`}
                            />
                            <span className="print-only num-font">{written > 0 ? written : ''}</span>
                          </td>
                        );
                      })}

                      {/* Rata Ujian (Otomatis) */}
                      <td className="py-1.5 px-2 text-center font-extrabold text-blue-950 bg-blue-100/60 num-font text-xs">
                        {avgExam > 0 ? avgExam.toFixed(1) : ''}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Legend / Info Footer */}
        <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl text-xs text-blue-950 flex flex-wrap items-center justify-between gap-2 no-print">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1 font-semibold text-blue-900">
              <CheckCircle2 className="w-4 h-4 text-blue-700" /> Keterangan Kolom:
            </span>
            <span><strong>Tul</strong> = Nilai Ujian Tulis (Ketik langsung di kolom)</span>
            <span><strong>Prk</strong> = Nilai Ujian Praktek (Ketik langsung di kolom)</span>
            <span><strong>Akh</strong> = Nilai Akhir Ujian (Dihitung otomatis: (Tulis + Praktek) / 2)</span>
          </div>
          <p className="text-[11px] text-blue-800/80 italic">
            * Bobot Ujian Sekolah adalah 40% dalam perhitungan Nilai Ijazah Kelulusan.
          </p>
        </div>

        {/* Printable Signature Block (visible only in print) */}
        <div className="print-only pt-6 grid grid-cols-2 text-xs">
          <div className="text-left space-y-1">
            <p className="font-semibold text-slate-800">Catatan Pelaksanaan Ujian Sekolah:</p>
            <p className="text-slate-600">· Penilaian mencakup Ujian Tulis dan Ujian Praktek sesuai kurikulum.</p>
            <p className="text-slate-600">· Nilai Ujian berkontribusi 40% terhadap nilai akhir Ijazah.</p>
          </div>
          <div className="text-center w-64 ml-auto">
            <p className="text-slate-700">Babelan, 15 Juni 2027</p>
            <p className="font-semibold text-slate-800">Kepala SD Negeri Babelan Kota 01</p>
            <div className="h-16"></div>
            <p className="font-bold underline text-slate-900">{appState.school.headmasterName}</p>
            <p className="text-slate-600">NIP. {appState.school.headmasterNip}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
