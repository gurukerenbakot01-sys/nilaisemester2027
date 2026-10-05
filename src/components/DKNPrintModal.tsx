import React, { useState } from 'react';
import { X, Printer, FileText } from 'lucide-react';
import { AppState, ClassName } from '../types';
import { calcExamAverage, calcFinalIjazahScore, calcReport6SemesterAverage, getPredikat } from '../utils/calc';
import { printElement } from '../utils/print';

interface DKNPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  appState: AppState;
}

export const DKNPrintModal: React.FC<DKNPrintModalProps> = ({
  isOpen,
  onClose,
  appState,
}) => {
  const [selectedClass, setSelectedClass] = useState<ClassName | 'ALL'>('ALL');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  if (!isOpen) return null;

  const filteredStudents = appState.students.filter(
    (s) => selectedClass === 'ALL' || s.classRoom === selectedClass
  );

  const handlePrint = () => {
    printElement(
      'dkn-printable-area',
      `DKN_Ijazah_${selectedClass === 'ALL' ? 'Semua_Kelas' : selectedClass}_SDN_Babelan_Kota_01`,
      orientation
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-blue-950/70 backdrop-blur-xs print:p-0 print:bg-transparent print:static print:z-auto">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-blue-200 overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none print:rounded-none">
        
        {/* Modal Controls with Blue Gradient (Hidden in print) */}
        <div className="px-6 py-3.5 bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white flex items-center justify-between no-print shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-800 flex items-center justify-center text-sky-300">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">
                Cetak Daftar Kumpulan Nilai (DKN) Ijazah Kelas 6
              </h3>
              <p className="text-[11px] text-blue-200">
                SD Negeri Babelan Kota 01 · TP {appState.school.academicYear}
              </p>
            </div>

            <div className="flex items-center gap-1.5 ml-4">
              <span className="text-xs text-blue-200 font-medium">Filter Cetak:</span>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value as ClassName | 'ALL')}
                className="text-xs border border-blue-400/50 rounded-lg px-2.5 py-1 bg-blue-900 text-white font-semibold focus:outline-hidden"
              >
                <option value="ALL">Semua Kelas (6A - 6D)</option>
                <option value="6A">Kelas 6A</option>
                <option value="6B">Kelas 6B</option>
                <option value="6C">Kelas 6C</option>
                <option value="6D">Kelas 6D</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 ml-2">
              <span className="text-xs text-blue-200 font-medium">Kertas:</span>
              <select
                value={orientation}
                onChange={(e) => setOrientation(e.target.value as 'portrait' | 'landscape')}
                className="text-xs border border-blue-400/50 rounded-lg px-2 py-1 bg-blue-900 text-white font-semibold focus:outline-hidden"
              >
                <option value="portrait">A4 Portrait</option>
                <option value="landscape">A4 Landscape</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-gradient-to-r from-sky-400 via-sky-500 to-blue-600 hover:from-sky-300 hover:to-blue-500 text-white text-xs font-bold rounded-lg shadow-md flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
              title="Cetak dokumen DKN ke printer atau simpan sebagai PDF"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Print DKN</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-blue-200 hover:text-white hover:bg-blue-800/60 rounded-lg transition"
              title="Tutup dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Area with ID for isolated printing */}
        <div id="dkn-printable-area" className="p-8 overflow-y-auto flex-1 bg-white text-slate-900 space-y-5 print:p-0 print:overflow-visible">
          <div className="text-center border-b-2 border-slate-900 pb-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              PEMERINTAH KABUPATEN BEKASI · DINAS PENDIDIKAN
            </h2>
            <h1 className="text-lg font-extrabold uppercase text-slate-900 tracking-tight mt-0.5">
              DAFTAR KUMPULAN NILAI (DKN) KELULUSAN & IJAZAH
            </h1>
            <p className="text-xs font-semibold text-slate-800 mt-0.5">
              SD NEGERI BABELAN KOTA 01 · TAHUN AJARAN 2026/2027
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Rombongan Belajar: {selectedClass === 'ALL' ? 'Kelas 6A, 6B, 6C, 6D' : `Kelas ${selectedClass}`} · Bobot: 60% Rapor + 40% Ujian
            </p>
          </div>

          <div className="overflow-x-auto border border-slate-300 rounded-xs">
            <table className="w-full text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-900 font-bold border-b border-slate-300">
                <tr>
                  <th className="py-2 px-2 border-r border-slate-300 text-center w-8">No</th>
                  <th className="py-2 px-2 border-r border-slate-300 text-center w-12">Kelas</th>
                  <th className="py-2 px-2 border-r border-slate-300 text-center w-24">NISN</th>
                  <th className="py-2 px-3 border-r border-slate-300 text-left">Nama Siswa</th>
                  <th className="py-2 px-2 border-r border-slate-300 text-center w-10">L/P</th>
                  <th className="py-2 px-2 border-r border-slate-300 text-center w-20">Rapor (60%)</th>
                  <th className="py-2 px-2 border-r border-slate-300 text-center w-20">Ujian (40%)</th>
                  <th className="py-2 px-2 border-r border-slate-300 text-center w-24 bg-blue-50 font-extrabold">Nilai Akhir</th>
                  <th className="py-2 px-2 border-r border-slate-300 text-center w-16">Predikat</th>
                  <th className="py-2 px-2 border-r border-slate-300 text-center w-20">Status</th>
                  <th className="py-2 px-3 text-center">Nomor Seri Ijazah</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-8 text-center text-slate-500 italic">
                      Tidak ada data siswa untuk kelas yang dipilih.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((s, idx) => {
                    const avgRapor = calcReport6SemesterAverage(appState.grades[s.id]);
                    const avgExam = calcExamAverage(appState.exams[s.id]);
                    const finalScore = calcFinalIjazahScore(
                      avgRapor,
                      avgExam,
                      appState.school.reportWeight,
                      appState.school.examWeight
                    );
                    const { predikat, huruf } = getPredikat(finalScore);
                    const isPassed = finalScore >= appState.school.passingGrade;
                    const serial = s.ijazahSerial || `DN-02/D-SD/27/${s.classRoom}/${String(idx + 1).padStart(4, '0')}`;

                    return (
                      <tr key={s.id} className={idx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}>
                        <td className="py-1.5 px-2 border-r border-slate-300 text-center num-font">{idx + 1}</td>
                        <td className="py-1.5 px-2 border-r border-slate-300 text-center font-bold">{s.classRoom}</td>
                        <td className="py-1.5 px-2 border-r border-slate-300 text-center num-font">{s.nisn}</td>
                        <td className="py-1.5 px-3 border-r border-slate-300 font-medium">{s.name}</td>
                        <td className="py-1.5 px-2 border-r border-slate-300 text-center">{s.gender}</td>
                        <td className="py-1.5 px-2 border-r border-slate-300 text-center num-font">{avgRapor.toFixed(1)}</td>
                        <td className="py-1.5 px-2 border-r border-slate-300 text-center num-font">{avgExam.toFixed(1)}</td>
                        <td className="py-1.5 px-2 border-r border-slate-300 text-center font-bold num-font bg-blue-50/60 text-blue-950">{finalScore.toFixed(1)}</td>
                        <td className="py-1.5 px-2 border-r border-slate-300 text-center">{huruf} ({predikat})</td>
                        <td className="py-1.5 px-2 border-r border-slate-300 text-center font-bold">
                          {isPassed ? <span className="text-blue-900 font-extrabold">LULUS</span> : <span className="text-rose-700">TIDAK LULUS</span>}
                        </td>
                        <td className="py-1.5 px-3 text-center num-font text-slate-700">{serial}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="pt-6 grid grid-cols-2 text-xs">
            <div className="text-left space-y-1">
              <p className="font-semibold text-slate-800">Keterangan Bobot Penilaian:</p>
              <p className="text-slate-600">· Nilai Rapor: 60% (Rata-rata Kelas 4 Smt 1/2, Kelas 5 Smt 1/2, Kelas 6 Smt 1/2)</p>
              <p className="text-slate-600">· Nilai Ujian Sekolah: 40% (Ujian Tulis & Ujian Praktek)</p>
              <p className="text-slate-600">· Batas Kriteria Kelulusan Minimal (KKM): &gt;= {appState.school.passingGrade.toFixed(1)}</p>
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
    </div>
  );
};
