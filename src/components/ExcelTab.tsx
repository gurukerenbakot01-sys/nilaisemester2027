import React, { useRef, useState } from 'react';
import { FileSpreadsheet, Download, Upload, RefreshCw, CheckCircle2, FileCheck, Sparkles, FolderUp } from 'lucide-react';
import { AppState } from '../types';
import { exportBlankTemplateExcel, exportFullDatabaseToExcel, parseExcelFile } from '../utils/excel';

interface ExcelTabProps {
  appState: AppState;
  onApplyImportedData: (data: {
    students?: AppState['students'];
    grades?: AppState['grades'];
    exams?: AppState['exams'];
  }) => void;
  onResetDatabase: () => void;
  onShowToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
  onShowImportSuccessModal?: (summary: {
    fileName: string;
    studentsCount: number;
    classes: string[];
    gradesCount: number;
  }) => void;
}

export const ExcelTab: React.FC<ExcelTabProps> = ({
  appState,
  onApplyImportedData,
  onResetDatabase,
  onShowToast,
  onShowImportSuccessModal,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    studentsCount?: number;
    gradesCount?: number;
    fileName?: string;
    classes?: string[];
  } | null>(null);

  const handleDownloadFullDatabase = async () => {
    try {
      await exportFullDatabaseToExcel(appState);
      onShowToast(
        'Database Excel (.xlsx) Berhasil Diunduh!',
        'Format tabel bergaris rapi & berwarna biru resmi SDN Babelan Kota 01.',
        'success'
      );
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      onShowToast('Gagal Mengunduh Excel', errorMsg, 'error');
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      await exportBlankTemplateExcel();
      onShowToast(
        'Format Template Kosong Berhasil Diunduh!',
        'Format tabel rapi dengan header biru siap diisi.',
        'success'
      );
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      onShowToast('Gagal Mengunduh Template', errorMsg, 'error');
    }
  };

  const handleTriggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const parsed = await parseExcelFile(file);
      onApplyImportedData({
        students: parsed.students,
        grades: parsed.grades,
        exams: parsed.exams,
      });

      const detectedClasses = Array.from(
        new Set((parsed.students || []).map((s) => s.classRoom))
      );

      const summary = {
        fileName: file.name,
        studentsCount: parsed.students?.length || 0,
        classes: detectedClasses,
        gradesCount: parsed.grades ? Object.keys(parsed.grades).length : 0,
      };

      setUploadResult(summary);

      if (onShowImportSuccessModal) {
        onShowImportSuccessModal(summary);
      }

      onShowToast(
        'File Excel Berhasil Diimpor!',
        `Terdeteksi ${summary.studentsCount} data siswa & ${summary.gradesCount} data nilai semester (${summary.classes.join(', ') || 'Semua'}).`,
        'success'
      );
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      onShowToast('Gagal Membaca File Excel', errorMsg, 'error');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-blue-200/80 shadow-sm space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-blue-950">
            Integrasi Database Excel (.xlsx) SD Negeri Babelan Kota 01
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Aplikasi mendukung ekspor & impor file Microsoft Excel offline (.xlsx) bergaris rapi & bertema biru resmi.
          </p>
        </div>

        {/* Prominent Quick Import Button in Header */}
        <button
          onClick={handleTriggerFileInput}
          disabled={isProcessing}
          className="px-4 py-2.5 bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-800 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2 self-start md:self-auto transition transform hover:scale-[1.02]"
        >
          <FolderUp className="w-4 h-4 text-sky-300" />
          <span>{isProcessing ? 'Memproses File...' : 'Impor Database Excel (.xlsx)'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 1: Download Full Database */}
        <div className="p-6 border border-blue-200 rounded-2xl bg-gradient-to-br from-white via-sky-50/50 to-blue-50/80 space-y-3 flex flex-col justify-between shadow-2xs">
          <div>
            <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-sky-500 text-white flex items-center justify-center shadow-xs">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <span className="text-base">Download Database Excel Lengkap</span>
            </div>
            <p className="text-xs text-slate-600 mt-3 leading-relaxed">
              Mengunduh seluruh database aplikasi dalam 1 workbook .xlsx yang terdiri dari 4 sheet:
            </p>
            <ul className="text-xs text-slate-700 mt-2 space-y-1.5 list-disc pl-4 font-medium">
              <li><strong>DATA SISWA</strong> (NIS, NISN, Nama, Orang Tua, No. Ijazah)</li>
              <li><strong>NILAI 6 SEMESTER</strong> (K4 Smt 1/2, K5 Smt 1/2, K6 Smt 1/2)</li>
              <li><strong>UJIAN SEKOLAH</strong> (Nilai Tulis & Praktek semua mapel)</li>
              <li><strong>REKAP IJAZAH</strong> (Rata Rapor 60%, Ujian 40%, Predikat, Kelulusan)</li>
            </ul>
          </div>
          <div className="pt-3 flex flex-wrap gap-2">
            <button
              onClick={handleDownloadFullDatabase}
              className="px-4 py-2.5 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl text-xs font-semibold shadow-md flex items-center gap-2 transition"
            >
              <Download className="w-4 h-4" />
              <span>Download Database .xlsx</span>
            </button>
            <button
              onClick={handleDownloadTemplate}
              className="px-3.5 py-2.5 bg-white hover:bg-blue-50 text-blue-900 border border-blue-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-blue-700" />
              <span>Download Template Kosong</span>
            </button>
          </div>
        </div>

        {/* Card 2: Upload Excel File */}
        <div className="p-6 border border-blue-200 rounded-2xl bg-gradient-to-br from-white via-blue-50/50 to-indigo-50/80 space-y-3 flex flex-col justify-between shadow-2xs">
          <div>
            <div className="flex items-center gap-2 text-indigo-950 font-bold text-sm">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-blue-600 text-white flex items-center justify-center shadow-xs">
                <Upload className="w-4 h-4" />
              </div>
              <span className="text-base">Impor / Unggah File Excel (.xlsx)</span>
            </div>
            <p className="text-xs text-slate-600 mt-3 leading-relaxed">
              Unggah file spreadsheet hasil pengisian guru atau backup data sebelumnya. Sistem akan otomatis mendeteksi kolom NISN, nama siswa, dan nilai semester.
            </p>

            <div className="mt-4">
              <label
                htmlFor="excel-file-upload"
                className="flex flex-col items-center justify-center border-2 border-dashed border-blue-300 hover:border-blue-500 bg-white/90 p-5 rounded-2xl cursor-pointer transition shadow-2xs group"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center text-blue-600 mb-2 transition">
                  <FileCheck className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-blue-950">
                  {isProcessing ? 'Sedang Memproses File Excel...' : 'Pilih atau Seret File Excel (.xlsx / .xls)'}
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5">Format file yang didukung: .xlsx, .xls</span>

                {/* Explicit Button inside dropzone */}
                <button
                  type="button"
                  onClick={handleTriggerFileInput}
                  disabled={isProcessing}
                  className="mt-3 px-4 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-900 rounded-lg text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Pilih File Excel</span>
                </button>
              </label>
              <input
                id="excel-file-upload"
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                disabled={isProcessing}
                className="hidden"
              />
            </div>

            {uploadResult && (
              <div className="mt-3 p-3.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-blue-950">File {uploadResult.fileName} Berhasil Dimuat!</p>
                  <p className="text-[11px] text-blue-800 mt-0.5">
                    Memperbarui <strong>{uploadResult.studentsCount ?? 0} data siswa</strong> dan <strong>{uploadResult.gradesCount ?? 0} set nilai semester</strong>.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Database Maintenance and Reset */}
      <div className="pt-4 border-t border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="text-slate-600">
          <span>Total tersimpan: <strong className="text-blue-950 font-bold">{appState.students.length} siswa</strong> aktif di kelas 6A, 6B, 6C, 6D</span>
        </div>
        <button
          onClick={onResetDatabase}
          className="px-3.5 py-1.5 border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl font-semibold flex items-center gap-1.5 transition self-start sm:self-auto shadow-2xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Kosongkan Seluruh Data Siswa & Nilai</span>
        </button>
      </div>
    </div>
  );
};
