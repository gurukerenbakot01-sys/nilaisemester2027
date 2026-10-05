import React, { useState, useEffect } from 'react';
import { X, Award, Save } from 'lucide-react';
import { AppState, Student, ExamScores, SubjectGrades, SUBJECT_LABELS } from '../types';
import { SUBJECT_KEYS, calcExamAverage } from '../utils/calc';

interface ExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  appState: AppState;
  onSaveExams: (studentId: string, examScores: ExamScores) => void;
}

export const ExamModal: React.FC<ExamModalProps> = ({
  isOpen,
  onClose,
  student,
  appState,
  onSaveExams,
}) => {
  const [examState, setExamState] = useState<ExamScores>(() => {
    const base: Partial<ExamScores> = {};
    for (const key of SUBJECT_KEYS) {
      base[key] = { written: 0, practice: 0, finalExam: 0 };
    }
    return base as ExamScores;
  });

  useEffect(() => {
    if (student) {
      const existing = appState.exams[student.id];
      const base: Partial<ExamScores> = {};
      for (const key of SUBJECT_KEYS) {
        if (existing && existing[key]) {
          base[key] = { ...existing[key]! };
        } else {
          base[key] = {
            written: 0,
            practice: 0,
            finalExam: 0,
          };
        }
      }
      setExamState(base as ExamScores);
    }
  }, [student, appState.exams, isOpen]);

  if (!isOpen || !student) return null;

  const handleScoreChange = (
    subject: keyof SubjectGrades,
    field: 'written' | 'practice',
    value: number
  ) => {
    const val = Math.max(0, Math.min(100, value || 0));
    setExamState((prev) => {
      const current = prev[subject] || { written: 0, practice: 0, finalExam: 0 };
      const updated = { ...current, [field]: val };
      if (SUBJECT_LABELS[subject].hasPractice) {
        updated.finalExam = Math.round((updated.written + updated.practice) / 2);
      } else {
        updated.finalExam = updated.written;
      }
      return {
        ...prev,
        [subject]: updated,
      };
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveExams(student.id, examState);
    onClose();
  };

  const currentAverage = calcExamAverage(examState);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-blue-950/60 backdrop-blur-xs no-print">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-blue-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header with Blue Gradient */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-400 to-blue-500 text-white flex items-center justify-center shadow-xs">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                Input Nilai Ujian Sekolah · {student.name}
              </h3>
              <p className="text-xs text-blue-200 font-medium">
                Kelas {student.classRoom} · NISN {student.nisn}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-blue-200 hover:text-white p-1.5 rounded-lg hover:bg-blue-800/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto flex-1">
          <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-sky-50 p-3 rounded-xl border border-blue-200 text-xs">
            <span className="text-blue-950 font-medium">
              Ujian Sekolah terdiri dari Ujian Tulis & Praktek (mata pelajaran tertentu).
            </span>
            <span className="font-bold text-blue-900 text-sm num-font">
              Rata-Rata: {currentAverage.toFixed(1)}
            </span>
          </div>

          <div className="border border-blue-200 rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-xs text-left">
              <thead className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Mata Pelajaran</th>
                  <th className="py-2.5 px-3 text-center w-28">Nilai Tulis</th>
                  <th className="py-2.5 px-3 text-center w-28">Nilai Praktek</th>
                  <th className="py-2.5 px-3 text-center w-28 bg-blue-950">Nilai Akhir Ujian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-100">
                {SUBJECT_KEYS.map((key) => {
                  const subjectMeta = SUBJECT_LABELS[key];
                  const item = examState[key] || { written: 0, practice: 0, finalExam: 0 };

                  return (
                    <tr key={key} className="hover:bg-blue-50/50">
                      <td className="py-2 px-3 font-medium text-slate-800">
                        {subjectMeta.fullName}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={item.written === 0 ? '' : item.written}
                          onChange={(e) => handleScoreChange(key, 'written', Number(e.target.value))}
                          className="w-16 px-2 py-1 text-center border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-600 num-font font-semibold text-blue-950"
                        />
                      </td>
                      <td className="py-2 px-3 text-center">
                        {subjectMeta.hasPractice ? (
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={item.practice === 0 ? '' : item.practice}
                            onChange={(e) => handleScoreChange(key, 'practice', Number(e.target.value))}
                            className="w-16 px-2 py-1 text-center border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-600 num-font font-semibold text-blue-950"
                          />
                        ) : (
                          <span className="text-slate-400 text-[11px]">- (Teori)</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-center font-bold text-blue-950 bg-blue-50/60 num-font">
                        {item.finalExam > 0 ? item.finalExam : ''}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl shadow-md flex items-center gap-1.5 transition"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Nilai Ujian</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
