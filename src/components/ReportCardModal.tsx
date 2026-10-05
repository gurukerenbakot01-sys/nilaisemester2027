import React from 'react';
import { X, Printer } from 'lucide-react';
import { AppState, Student } from '../types';
import { ALL_SEMESTERS, SUBJECT_KEYS, calcExamAverage, calcFinalIjazahScore, calcReport6SemesterAverage, calcSemesterAverage, calcSubject6SemesterAvg, formatIndoDate, getPredikat } from '../utils/calc';
import { SUBJECT_LABELS } from '../types';
import { printElement } from '../utils/print';

interface ReportCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  appState: AppState;
}

export const ReportCardModal: React.FC<ReportCardModalProps> = ({
  isOpen,
  onClose,
  student,
  appState,
}) => {
  if (!isOpen || !student) return null;

  const studentGrades = appState.grades[student.id] || {};
  const studentExams = appState.exams[student.id] || {};

  const avgRapor = calcReport6SemesterAverage(studentGrades);
  const avgExam = calcExamAverage(studentExams);
  const finalScore = calcFinalIjazahScore(
    avgRapor,
    avgExam,
    appState.school.reportWeight,
    appState.school.examWeight
  );
  const { predikat } = getPredikat(finalScore);

  const handlePrint = () => {
    printElement(
      'report-card-printable-area',
      `Rapor_Semester_${student.name.replace(/\s+/g, '_')}_${student.nisn}`,
      'portrait'
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-blue-950/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-blue-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Controls with Blue Gradient */}
        <div className="px-6 py-3.5 bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white flex items-center justify-between no-print shadow-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
            <h3 className="font-bold text-white text-sm">
              Rekap Rapor 6 Semester · {student.name} ({student.classRoom})
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Rapor</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-blue-200 hover:text-white hover:bg-blue-800/60 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Content Area */}
        <div id="report-card-printable-area" className="p-8 overflow-y-auto flex-1 bg-white text-slate-900 space-y-6 print:p-0">
          {/* Official Letterhead */}
          <div className="text-center border-b-2 border-slate-900 pb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Pemerintah Kabupaten Bekasi · Dinas Pendidikan
            </h4>
            <h1 className="text-xl font-extrabold uppercase text-slate-900 tracking-tight mt-0.5">
              SD NEGERI BABELAN KOTA 01
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              NPSN: {appState.school.npsn} · {appState.school.address} · {appState.school.regency}
            </p>
            <h2 className="text-sm font-bold mt-2 uppercase tracking-wide bg-blue-50/80 text-blue-950 py-1 border-y border-blue-200">
              LEMBAR REKAPITULASI NILAI RAPOR 6 SEMESTER (KELAS 4 - 6)
            </h2>
          </div>

          {/* Student Biodata */}
          <div className="grid grid-cols-2 gap-4 text-xs bg-blue-50/40 p-3.5 rounded-xl border border-blue-200">
            <div className="space-y-1">
              <div className="flex">
                <span className="w-32 text-slate-500 font-medium">Nama Peserta Didik</span>
                <span className="font-bold text-slate-900">: {student.name}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-slate-500 font-medium">NIS / NISN</span>
                <span className="font-medium text-slate-800">: {student.nis} / {student.nisn}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-slate-500 font-medium">Kelas / Rombel</span>
                <span className="font-bold text-blue-900">: {student.classRoom}</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex">
                <span className="w-32 text-slate-500 font-medium">Tempat, Tgl Lahir</span>
                <span className="text-slate-800">: {student.birthPlace}, {formatIndoDate(student.birthDate)}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-slate-500 font-medium">Nama Orang Tua/Wali</span>
                <span className="text-slate-800">: {student.parentName}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-slate-500 font-medium">Tahun Ajaran</span>
                <span className="font-medium text-slate-800">: {appState.school.academicYear}</span>
              </div>
            </div>
          </div>

          {/* Grades Table 6 Semesters */}
          <div className="overflow-x-auto border border-slate-300 rounded-sm">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                  <th rowSpan={2} className="py-2 px-2 border-r border-slate-300 text-center w-8">No</th>
                  <th rowSpan={2} className="py-2 px-3 border-r border-slate-300 text-left">Mata Pelajaran</th>
                  <th colSpan={2} className="py-1 px-2 border-r border-slate-300 text-center bg-slate-200/50">Kelas 4</th>
                  <th colSpan={2} className="py-1 px-2 border-r border-slate-300 text-center bg-slate-200/50">Kelas 5</th>
                  <th colSpan={2} className="py-1 px-2 border-r border-slate-300 text-center bg-slate-200/50">Kelas 6</th>
                  <th rowSpan={2} className="py-2 px-3 text-center bg-blue-50 text-blue-950 font-bold border-l border-slate-300">Rata-Rata Rapor</th>
                </tr>
                <tr className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-300 text-[11px]">
                  <th className="py-1 px-1.5 border-r border-slate-300 text-center w-12">Smt 1</th>
                  <th className="py-1 px-1.5 border-r border-slate-300 text-center w-12">Smt 2</th>
                  <th className="py-1 px-1.5 border-r border-slate-300 text-center w-12">Smt 1</th>
                  <th className="py-1 px-1.5 border-r border-slate-300 text-center w-12">Smt 2</th>
                  <th className="py-1 px-1.5 border-r border-slate-300 text-center w-12">Smt 1</th>
                  <th className="py-1 px-1.5 border-r border-slate-300 text-center w-12">Smt 2</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {SUBJECT_KEYS.map((key, idx) => {
                  const subjectAvg = calcSubject6SemesterAvg(studentGrades, key);
                  return (
                    <tr key={key} className={idx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}>
                      <td className="py-1.5 px-2 border-r border-slate-300 text-center num-font">{idx + 1}</td>
                      <td className="py-1.5 px-3 border-r border-slate-300 font-medium">
                        {SUBJECT_LABELS[key].fullName}
                      </td>
                      {ALL_SEMESTERS.map((sem) => {
                        const val = studentGrades[sem]?.[key] ?? '-';
                        return (
                          <td key={sem} className="py-1.5 px-1.5 border-r border-slate-300 text-center num-font">
                            {val}
                          </td>
                        );
                      })}
                      <td className="py-1.5 px-3 text-center font-bold text-blue-950 bg-blue-50/50 num-font border-l border-slate-300">
                        {subjectAvg.toFixed(1)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 font-bold border-t-2 border-slate-400">
                  <td colSpan={2} className="py-2 px-3 border-r border-slate-300 text-center">
                    RATA-RATA SEMESTER
                  </td>
                  {ALL_SEMESTERS.map((sem) => {
                    const avg = calcSemesterAverage(studentGrades[sem]);
                    return (
                      <td key={sem} className="py-2 px-1.5 border-r border-slate-300 text-center num-font font-bold text-slate-800">
                        {avg.toFixed(1)}
                      </td>
                    );
                  })}
                  <td className="py-2 px-3 text-center font-extrabold text-blue-950 bg-blue-100 num-font text-sm border-l border-slate-300">
                    {avgRapor.toFixed(1)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Graduation Summary Card */}
          <div className="grid grid-cols-3 gap-3 p-4 rounded-xl border border-blue-200 bg-blue-50/40">
            <div className="text-center p-2 rounded-lg bg-white border border-blue-200">
              <span className="text-[11px] text-slate-500 font-medium block">Rata Rapor 6 Smt (60%)</span>
              <span className="text-lg font-bold text-slate-900 num-font">{avgRapor.toFixed(1)}</span>
            </div>
            <div className="text-center p-2 rounded-lg bg-white border border-blue-200">
              <span className="text-[11px] text-slate-500 font-medium block">Rata Ujian Sekolah (40%)</span>
              <span className="text-lg font-bold text-slate-900 num-font">{avgExam.toFixed(1)}</span>
            </div>
            <div className="text-center p-2 rounded-lg bg-gradient-to-r from-blue-700 to-indigo-700 text-white shadow-xs">
              <span className="text-[11px] text-blue-100 font-semibold block">Nilai Akhir Ijazah</span>
              <span className="text-lg font-extrabold num-font">{finalScore.toFixed(1)} ({predikat})</span>
            </div>
          </div>

          {/* Signatures */}
          <div className="pt-6 grid grid-cols-2 gap-8 text-xs text-center">
            <div>
              <p className="text-slate-600">Mengetahui,</p>
              <p className="font-semibold text-slate-800">Orang Tua / Wali Siswa</p>
              <div className="h-16"></div>
              <p className="font-bold underline text-slate-900">
                ( {student.parentName || '...........................................'} )
              </p>
            </div>
            <div>
              <p className="text-slate-600">Babelan, 15 Juni 2027</p>
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
