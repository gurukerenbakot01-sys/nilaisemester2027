import React, { useRef, useState } from 'react';
import { X, Printer, CheckCircle, Upload, Trash2, Image as ImageIcon, Check, RefreshCw } from 'lucide-react';
import { AppState, Student } from '../types';
import { SUBJECT_KEYS, calcExamAverage, calcFinalIjazahScore, calcReport6SemesterAverage, calcSubject6SemesterAvg, formatIndoDate } from '../utils/calc';
import { SUBJECT_LABELS } from '../types';
import { printElement } from '../utils/print';

interface SKLModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  appState: AppState;
  onUpdateSchoolKop?: (kopDataUrl: string | undefined) => void;
  onShowToast?: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

export const SKLModal: React.FC<SKLModalProps> = ({
  isOpen,
  onClose,
  student,
  appState,
  onUpdateSchoolKop,
  onShowToast,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [useImageKop, setUseImageKop] = useState<boolean>(true);
  const [uploadError, setUploadError] = useState<string | null>(null);

  if (!isOpen || !student) return null;

  const currentKopImage = appState.school.kopImageUrl;

  const studentGrades = appState.grades[student.id];
  const studentExams = appState.exams[student.id];
  const avgRapor = calcReport6SemesterAverage(studentGrades);
  const avgExam = calcExamAverage(studentExams);
  const finalScore = calcFinalIjazahScore(
    avgRapor,
    avgExam,
    appState.school.reportWeight,
    appState.school.examWeight
  );
  const isPassed = finalScore >= appState.school.passingGrade;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (!file.type.startsWith('image/')) {
      const err = 'File harus berupa gambar (PNG, JPG, JPEG, atau WebP).';
      setUploadError(err);
      onShowToast?.('Gagal Unggah', err, 'error');
      return;
    }

    // Validate size (max 4MB)
    if (file.size > 4 * 1024 * 1024) {
      const err = 'Ukuran gambar maksimal 4 MB agar tidak memperlambat dokumen.';
      setUploadError(err);
      onShowToast?.('Ukuran File Terlalu Besar', err, 'error');
      return;
    }

    setUploadError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        onUpdateSchoolKop?.(result);
        setUseImageKop(true);
        onShowToast?.(
          'Kop Sekolah Berhasil Diunggah',
          'Gambar kop surat resmi telah disimpan dan diterapkan ke Cetak SKL.',
          'success'
        );
      }
    };
    reader.onerror = () => {
      const err = 'Gagal membaca file gambar. Silakan coba lagi.';
      setUploadError(err);
      onShowToast?.('Gagal Membaca File', err, 'error');
    };
    reader.readAsDataURL(file);

    // Reset input
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleRemoveKop = () => {
    if (window.confirm('Hapus gambar kop surat dan kembalikan ke kop teks resmi standar?')) {
      onUpdateSchoolKop?.(undefined);
      onShowToast?.('Kop Surat Direset', 'Kop surat dikembalikan ke format teks standar.', 'info');
    }
  };

  const handlePrint = () => {
    printElement(
      'skl-printable-area',
      `SKL_${student.name.replace(/\s+/g, '_')}_${student.nisn}`
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-blue-950/70 backdrop-blur-xs print:p-0 print:bg-transparent print:static print:z-auto">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-blue-200 overflow-hidden flex flex-col max-h-[94vh] print:max-h-none print:shadow-none print:border-none print:rounded-none">
        
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Modal Controls with Blue Gradient (Hidden on Print) */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white flex flex-wrap items-center justify-between gap-3 no-print shadow-md">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-800/80 flex items-center justify-center text-sky-300">
              <CheckCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm leading-tight">
                Surat Keterangan Lulus (SKL)
              </h3>
              <p className="text-[11px] text-blue-200">
                {student.name} · NISN: {student.nisn} · Kelas {student.classRoom}
              </p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {/* Upload Kop Sekolah Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition active:scale-95 border border-sky-400/40"
              title="Upload file gambar kop surat resmi sekolah"
            >
              <Upload className="w-3.5 h-3.5 text-sky-200" />
              <span>{currentKopImage ? 'Ganti Kop Sekolah' : 'Upload Kop Sekolah'}</span>
            </button>

            {/* Quick Remove Kop Button if exists */}
            {currentKopImage && (
              <button
                onClick={handleRemoveKop}
                className="px-2.5 py-1.5 bg-red-600/80 hover:bg-red-600 text-white text-xs font-medium rounded-lg transition active:scale-95 flex items-center gap-1 border border-red-400/30"
                title="Hapus gambar kop dan kembali ke teks standar"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Hapus Kop</span>
              </button>
            )}

            {/* Print Button with Blue Gradient */}
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-gradient-to-r from-sky-400 via-sky-500 to-blue-600 hover:from-sky-300 hover:to-blue-500 text-white text-xs font-bold rounded-lg shadow-md flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak SKL</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 text-blue-200 hover:text-white hover:bg-blue-800/60 rounded-lg transition"
              title="Tutup dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Upload Status Banner (if Kop is active or user wants to toggle) - Hidden on Print */}
        <div className="px-5 py-2 bg-gradient-to-r from-sky-50 to-blue-50 border-b border-blue-200/80 text-xs flex items-center justify-between no-print">
          <div className="flex items-center gap-2 text-slate-700">
            {currentKopImage ? (
              <>
                <span className="flex items-center gap-1 font-semibold text-blue-900 bg-blue-100/80 px-2 py-0.5 rounded-full border border-blue-200">
                  <Check className="w-3 h-3 text-blue-700" /> Kop Gambar Aktif
                </span>
                <span className="text-slate-500 text-[11px] hidden sm:inline">
                  Gambar kop akan langsung tercetak pada dokumen SKL ini.
                </span>
              </>
            ) : (
              <span className="text-slate-600 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                <span>Kop saat ini: <strong>Format Teks Standar</strong>. Klik <em>"Upload Kop Sekolah"</em> untuk menyisipkan kop resmi bergambar.</span>
              </span>
            )}
          </div>

          {currentKopImage && (
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 text-[11px] cursor-pointer text-slate-700 hover:text-blue-900 select-none">
                <input
                  type="checkbox"
                  checked={useImageKop}
                  onChange={(e) => setUseImageKop(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                />
                <span>Tampilkan Kop Gambar</span>
              </label>
            </div>
          )}
        </div>

        {uploadError && (
          <div className="px-5 py-2 bg-rose-50 border-b border-rose-200 text-rose-700 text-xs no-print flex items-center justify-between">
            <span>{uploadError}</span>
            <button onClick={() => setUploadError(null)} className="text-rose-500 hover:text-rose-800">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Printable SKL Sheet Document */}
        <div id="skl-printable-area" className="p-8 sm:p-10 overflow-y-auto flex-1 bg-white text-slate-900 space-y-4 print:p-0 print:overflow-visible print:space-y-3">
          
          {/* KOP SECTION */}
          {currentKopImage && useImageKop ? (
            <div className="relative group border-b-2 border-slate-900 pb-2 mb-3">
              <img
                src={currentKopImage}
                alt="Kop Surat Sekolah SD Negeri Babelan Kota 01"
                className="w-full max-h-36 object-contain mx-auto print:max-h-40"
              />
              
              {/* Quick action buttons on hover in screen view (hidden on print) */}
              <div className="absolute top-1 right-1 no-print opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-slate-900/85 p-1 rounded-md backdrop-blur-xs shadow-md">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2 py-0.5 bg-blue-600 hover:bg-blue-500 text-white text-[10px] rounded font-medium flex items-center gap-1"
                  title="Ganti Gambar Kop"
                >
                  <RefreshCw className="w-2.5 h-2.5" /> Ganti
                </button>
                <button
                  onClick={handleRemoveKop}
                  className="px-2 py-0.5 bg-rose-600 hover:bg-rose-500 text-white text-[10px] rounded font-medium flex items-center gap-1"
                  title="Hapus Gambar Kop"
                >
                  <Trash2 className="w-2.5 h-2.5" /> Hapus
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center border-b-4 border-double border-slate-900 pb-3 relative group">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                PEMERINTAH KABUPATEN BEKASI
              </h3>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                DINAS PENDIDIKAN
              </h3>
              <h1 className="text-xl font-extrabold uppercase text-slate-900 tracking-wide mt-1">
                {appState.school.name}
              </h1>
              <p className="text-xs text-slate-600 mt-0.5">
                Alamat: {appState.school.address} · NPSN: {appState.school.npsn}
              </p>

              {/* Upload prompt helper for teachers on hover/idle (hidden on print) */}
              <div className="no-print mt-2 flex justify-center">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[11px] text-blue-700 hover:text-blue-900 bg-blue-50/80 hover:bg-blue-100 border border-blue-200 px-3 py-1 rounded-md flex items-center gap-1.5 transition font-medium shadow-2xs"
                >
                  <Upload className="w-3.5 h-3.5 text-blue-600" />
                  <span>Upload Gambar Kop Resmi Sekolah (PNG / JPG)</span>
                </button>
              </div>
            </div>
          )}

          {/* Title & Document Number */}
          <div className="text-center space-y-1">
            <h2 className="text-sm font-bold uppercase tracking-wider underline">
              SURAT KETERANGAN LULUS
            </h2>
            <p className="text-xs text-slate-600">
              Nomor: 421.2/048/SDN-BK01/VI/2027
            </p>
          </div>

          <p className="text-xs leading-relaxed text-slate-700 text-justify">
            Kepala SD Negeri Babelan Kota 01, Kecamatan Babelan, Kabupaten Bekasi dengan ini menerangkan bahwa:
          </p>

          {/* Student Info */}
          <div className="pl-4 sm:pl-6 space-y-1 text-xs text-slate-800">
            <div className="flex">
              <span className="w-44 text-slate-600 shrink-0">Nama Siswa</span>
              <span className="font-bold">: {student.name}</span>
            </div>
            <div className="flex">
              <span className="w-44 text-slate-600 shrink-0">Tempat, Tanggal Lahir</span>
              <span>: {student.birthPlace}, {formatIndoDate(student.birthDate)}</span>
            </div>
            <div className="flex">
              <span className="w-44 text-slate-600 shrink-0">Nama Orang Tua / Wali</span>
              <span>: {student.parentName}</span>
            </div>
            <div className="flex">
              <span className="w-44 text-slate-600 shrink-0">Nomor Induk Siswa (NIS)</span>
              <span>: {student.nis}</span>
            </div>
            <div className="flex">
              <span className="w-44 text-slate-600 shrink-0">Nomor Induk Siswa Nasional</span>
              <span className="font-semibold">: {student.nisn}</span>
            </div>
            <div className="flex">
              <span className="w-44 text-slate-600 shrink-0">Kelas</span>
              <span className="font-bold text-blue-900">: {student.classRoom}</span>
            </div>
            <div className="flex">
              <span className="w-44 text-slate-600 shrink-0">Sekolah Asal</span>
              <span>: {appState.school.name}</span>
            </div>
          </div>

          {/* Statement */}
          <div className="p-3 text-center border-2 border-blue-950 rounded-md bg-blue-50/40 print:bg-transparent">
            <p className="text-xs text-slate-600">
              Berdasarkan hasil rapat Dewan Guru SD Negeri Babelan Kota 01 pada tanggal 14 Juni 2027, yang bersangkutan dinyatakan:
            </p>
            <p className="text-lg font-extrabold uppercase mt-1 tracking-widest text-blue-950">
              {isPassed ? 'L U L U S' : 'T I D A K   L U L U S'}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Dari Satuan Pendidikan Sekolah Dasar Tahun Pelajaran 2026/2027
            </p>
          </div>

          {/* Grades Table */}
          <div className="border border-slate-300 rounded-xs overflow-hidden">
            <table className="w-full text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                <tr>
                  <th className="py-1 px-2 border-r border-slate-300 text-center w-8">No</th>
                  <th className="py-1 px-3 border-r border-slate-300 text-left">Mata Pelajaran</th>
                  <th className="py-1 px-3 border-r border-slate-300 text-center w-24">Rata Rapor</th>
                  <th className="py-1 px-3 border-r border-slate-300 text-center w-24">Nilai Ujian</th>
                  <th className="py-1 px-3 text-center w-28 bg-blue-50 print:bg-slate-100">Nilai Akhir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {SUBJECT_KEYS.map((key, idx) => {
                  const sAvgRapor = calcSubject6SemesterAvg(studentGrades, key);
                  const sExam = studentExams?.[key]?.finalExam ?? 0;
                  const sFinal = calcFinalIjazahScore(
                    sAvgRapor,
                    sExam,
                    appState.school.reportWeight,
                    appState.school.examWeight
                  );
                  return (
                    <tr key={key} className={idx % 2 === 1 ? 'bg-slate-50/40' : 'bg-white'}>
                      <td className="py-1 px-2 border-r border-slate-300 text-center num-font">{idx + 1}</td>
                      <td className="py-1 px-3 border-r border-slate-300">{SUBJECT_LABELS[key].fullName}</td>
                      <td className="py-1 px-3 border-r border-slate-300 text-center num-font">{sAvgRapor.toFixed(1)}</td>
                      <td className="py-1 px-3 border-r border-slate-300 text-center num-font">{sExam}</td>
                      <td className="py-1 px-3 text-center font-bold text-slate-900 num-font bg-blue-50/40 print:bg-transparent">{sFinal.toFixed(1)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 font-bold border-t-2 border-slate-400">
                  <td colSpan={2} className="py-1.5 px-3 border-r border-slate-300 text-center">RATA-RATA KELULUSAN</td>
                  <td className="py-1.5 px-3 border-r border-slate-300 text-center num-font">{avgRapor.toFixed(1)}</td>
                  <td className="py-1.5 px-3 border-r border-slate-300 text-center num-font">{avgExam.toFixed(1)}</td>
                  <td className="py-1.5 px-3 text-center num-font text-blue-950 bg-blue-100 print:bg-slate-200 font-extrabold">{finalScore.toFixed(1)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <p className="text-[11px] text-slate-600 italic">
            * Surat Keterangan Lulus ini sah digunakan untuk keperluan pendaftaran ke jenjang SMP/MTs sederajat sebelum ijazah asli diterbitkan.
          </p>

          {/* Signature */}
          <div className="pt-2 flex justify-end text-xs print:pt-4">
            <div className="text-center w-64">
              <p className="text-slate-700">Babelan, 15 Juni 2027</p>
              <p className="font-semibold text-slate-800">Kepala {appState.school.name}</p>
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
