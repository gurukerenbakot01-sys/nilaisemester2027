import React from 'react';
import { CheckCircle2, FileSpreadsheet, Users, GraduationCap, X, ArrowRight } from 'lucide-react';

interface ImportSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToStudents: () => void;
  summary: {
    fileName: string;
    studentsCount: number;
    classes: string[];
    gradesCount: number;
  } | null;
}

export const ImportSuccessModal: React.FC<ImportSuccessModalProps> = ({
  isOpen,
  onClose,
  onNavigateToStudents,
  summary,
}) => {
  if (!isOpen || !summary) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-blue-950/70 backdrop-blur-xs no-print animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-blue-200 overflow-hidden flex flex-col">
        {/* Header with Blue Gradient & Celebration Banner */}
        <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white p-6 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-blue-200 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-sky-400 via-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-lg ring-4 ring-sky-300/30 mb-3">
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>

          <h3 className="font-extrabold text-lg text-white">
            Impor Database Berhasil!
          </h3>
          <p className="text-xs text-blue-200 mt-1 max-w-xs mx-auto">
            File spreadsheet Anda telah berhasil dibaca dan dimasukkan ke dalam sistem SDN Babelan Kota 01.
          </p>
        </div>

        {/* Summary Card */}
        <div className="p-6 space-y-4">
          <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 flex items-center gap-3">
            <FileSpreadsheet className="w-5 h-5 text-blue-700 shrink-0" />
            <div className="overflow-hidden">
              <span className="text-[11px] text-slate-500 block">Nama File Excel</span>
              <span className="font-bold text-xs text-blue-950 truncate block">
                {summary.fileName}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl border border-blue-100 bg-gradient-to-br from-white to-blue-50/50">
              <div className="flex items-center gap-1.5 text-blue-800 font-semibold mb-1">
                <Users className="w-4 h-4 text-blue-600" />
                <span>Data Siswa</span>
              </div>
              <p className="text-2xl font-extrabold text-blue-950 num-font">
                {summary.studentsCount}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Rombel: {summary.classes.join(', ') || '6A-6D'}
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-blue-100 bg-gradient-to-br from-white to-sky-50/50">
              <div className="flex items-center gap-1.5 text-sky-800 font-semibold mb-1">
                <GraduationCap className="w-4 h-4 text-sky-600" />
                <span>Nilai Semester</span>
              </div>
              <p className="text-2xl font-extrabold text-blue-950 num-font">
                {summary.gradesCount}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Siswa telah ternilai
              </p>
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => {
                onClose();
                onNavigateToStudents();
              }}
              className="w-full py-2.5 bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-800 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-2 transition"
            >
              <span>Lihat Data Siswa Sekarang</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
