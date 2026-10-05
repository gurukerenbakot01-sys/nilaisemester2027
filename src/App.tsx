import React, { useState, useEffect } from 'react';
import { AppState, ClassName, ExamScores, SemesterKey, Student, SubjectGrades, SUBJECT_LABELS } from './types';
import { createInitialAppState, DEFAULT_SCHOOL } from './data/initialData';
import { Navbar } from './components/Navbar';
import { DashboardTab } from './components/DashboardTab';
import { StudentsTab } from './components/StudentsTab';
import { SemestersTab } from './components/SemestersTab';
import { ExamsTab } from './components/ExamsTab';
import { GraduationTab } from './components/GraduationTab';
import { ExcelTab } from './components/ExcelTab';
import { StudentModal } from './components/StudentModal';
import { ReportCardModal } from './components/ReportCardModal';
import { SKLModal } from './components/SKLModal';
import { DKNPrintModal } from './components/DKNPrintModal';
import { ExamModal } from './components/ExamModal';
import { ImportSuccessModal } from './components/ImportSuccessModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { exportFullDatabaseToExcel } from './utils/excel';
import { SUBJECT_KEYS } from './utils/calc';
import { LayoutDashboard, Users, BookOpenCheck, Award, GraduationCap, FileSpreadsheet } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'BAKOT01_RAPOR_STORAGE_EMPTY_V2';

export default function App() {
  const [appState, setAppState] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.students)) {
          return {
            ...parsed,
            school: {
              ...DEFAULT_SCHOOL,
              ...parsed.school,
              headmasterName: DEFAULT_SCHOOL.headmasterName,
              headmasterNip: DEFAULT_SCHOOL.headmasterNip,
            },
          };
        }
      }
    } catch (e) {
      console.error('Failed to parse localStorage data:', e);
    }
    return createInitialAppState();
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'students' | 'semesters' | 'exams' | 'graduation' | 'excel'>('dashboard');

  // Modals state
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [viewingReportStudent, setViewingReportStudent] = useState<Student | null>(null);

  const [isSKLModalOpen, setIsSKLModalOpen] = useState(false);
  const [viewingSKLStudent, setViewingSKLStudent] = useState<Student | null>(null);

  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [editingExamStudent, setEditingExamStudent] = useState<Student | null>(null);

  const [isDKNModalOpen, setIsDKNModalOpen] = useState(false);

  // Excel Import Success state
  const [importSummary, setImportSummary] = useState<{
    fileName: string;
    studentsCount: number;
    classes: string[];
    gradesCount: number;
  } | null>(null);
  const [isImportSuccessOpen, setIsImportSuccessOpen] = useState(false);

  // Toasts state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Persist state to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(appState));
    } catch (err) {
      console.error('Failed to save to localStorage:', err);
    }
  }, [appState]);

  const showToast = (
    title: string,
    message?: string,
    type: 'success' | 'error' | 'info' = 'success'
  ) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Student CRUD
  const handleSaveStudent = (student: Student) => {
    setAppState((prev) => {
      const idx = prev.students.findIndex((s) => s.id === student.id);
      let newStudents: Student[];
      if (idx >= 0) {
        newStudents = [...prev.students];
        newStudents[idx] = student;
      } else {
        newStudents = [student, ...prev.students];
      }
      return {
        ...prev,
        students: newStudents,
      };
    });
    showToast(
      editingStudent ? 'Data Siswa Berhasil Diperbarui!' : 'Siswa Baru Berhasil Ditambahkan!',
      student.name,
      'success'
    );
  };

  const handleDeleteStudent = (studentId: string) => {
    const s = appState.students.find((item) => item.id === studentId);
    if (!s) return;
    if (confirm(`Apakah Anda yakin ingin menghapus siswa "${s.name}" (${s.classRoom})?`)) {
      setAppState((prev) => ({
        ...prev,
        students: prev.students.filter((item) => item.id !== studentId),
      }));
      showToast('Siswa Berhasil Dihapus', s.name, 'info');
    }
  };

  // Grade updates
  const handleUpdateGrade = (
    studentId: string,
    semester: SemesterKey,
    subject: keyof SubjectGrades,
    value: number
  ) => {
    setAppState((prev) => {
      const studentGrades = prev.grades[studentId] || {};
      const semGrades = studentGrades[semester] || ({} as SubjectGrades);
      return {
        ...prev,
        grades: {
          ...prev.grades,
          [studentId]: {
            ...studentGrades,
            [semester]: {
              ...semGrades,
              [subject]: value,
            },
          },
        },
      };
    });
  };

  const handleSaveGrades = () => {
    showToast('Data Nilai Semester Berhasil Disimpan!', 'Semua perubahan nilai tersimpan aman.', 'success');
  };

  const handleBulkFillGrades = (
    semester: SemesterKey,
    classRoom: ClassName,
    value: number
  ) => {
    setAppState((prev) => {
      const newGrades = { ...prev.grades };
      const classStudents = prev.students.filter((s) => s.classRoom === classRoom);

      classStudents.forEach((s) => {
        const studentGrades = newGrades[s.id] || {};
        const semGrades = { ...(studentGrades[semester] || ({} as SubjectGrades)) };
        const subjects: (keyof SubjectGrades)[] = [
          'pai', 'ppkn', 'bindo', 'mtk', 'ipas', 'sbdp', 'pjok', 'sunda', 'bing'
        ];
        subjects.forEach((sub) => {
          if (!semGrades[sub]) {
            semGrades[sub] = value;
          }
        });
        studentGrades[semester] = semGrades;
        newGrades[s.id] = studentGrades;
      });

      return {
        ...prev,
        grades: newGrades,
      };
    });
  };

  // Exam scores update
  const handleSaveExams = (studentId: string, examScores: ExamScores) => {
    setAppState((prev) => ({
      ...prev,
      exams: {
        ...prev.exams,
        [studentId]: examScores,
      },
    }));
    showToast('Nilai Ujian Sekolah Berhasil Disimpan!', undefined, 'success');
  };

  const handleBulkFillExams = (defaultValue: number = 85) => {
    setAppState((prev) => {
      const newExams = { ...prev.exams };
      for (const student of prev.students) {
        const current = newExams[student.id] || {};
        const studentExam: Partial<ExamScores> = { ...current };
        for (const key of SUBJECT_KEYS) {
          const hasPractice = SUBJECT_LABELS[key].hasPractice;
          studentExam[key] = {
            written: defaultValue,
            practice: hasPractice ? defaultValue : 0,
            finalExam: defaultValue,
          };
        }
        newExams[student.id] = studentExam as ExamScores;
      }
      return {
        ...prev,
        exams: newExams,
      };
    });
  };

  // Direct column inline exam score update
  const handleUpdateExamScore = (
    studentId: string,
    subject: keyof SubjectGrades,
    field: 'written' | 'practice',
    value: number
  ) => {
    const val = Math.max(0, Math.min(100, isNaN(value) ? 0 : value));
    setAppState((prev) => {
      const studentExams = prev.exams[studentId] || {};
      const current = studentExams[subject] || { written: 0, practice: 0, finalExam: 0 };
      const updated = { ...current, [field]: val };
      if (SUBJECT_LABELS[subject].hasPractice) {
        updated.finalExam = Math.round((updated.written + updated.practice) / 2);
      } else {
        updated.finalExam = updated.written;
      }
      return {
        ...prev,
        exams: {
          ...prev.exams,
          [studentId]: {
            ...studentExams,
            [subject]: updated,
          },
        },
      };
    });
  };

  // Serial number update
  const handleUpdateSerial = (studentId: string, serial: string) => {
    setAppState((prev) => ({
      ...prev,
      students: prev.students.map((s) =>
        s.id === studentId ? { ...s, ijazahSerial: serial } : s
      ),
    }));
  };

  // School Kop Image update
  const handleUpdateSchoolKop = (kopDataUrl: string | undefined) => {
    setAppState((prev) => ({
      ...prev,
      school: {
        ...prev.school,
        kopImageUrl: kopDataUrl,
      },
    }));
  };

  // Excel handlers
  const handleExportFullDatabase = async () => {
    try {
      await exportFullDatabaseToExcel(appState);
      showToast(
        'Database Excel (.xlsx) Berhasil Diunduh!',
        'Format tabel bergaris rapi & berwarna biru resmi SDN Babelan Kota 01.',
        'success'
      );
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      showToast('Gagal Mengunduh Excel', msg, 'error');
    }
  };

  const handleApplyImportedData = (data: {
    students?: Student[];
    grades?: AppState['grades'];
    exams?: AppState['exams'];
  }) => {
    setAppState((prev) => ({
      ...prev,
      students: data.students && data.students.length > 0 ? data.students : prev.students,
      grades: data.grades && Object.keys(data.grades).length > 0 ? { ...prev.grades, ...data.grades } : prev.grades,
      exams: data.exams && Object.keys(data.exams).length > 0 ? { ...prev.exams, ...data.exams } : prev.exams,
    }));
  };

  const handleResetDatabase = () => {
    if (confirm('Apakah Anda yakin ingin mengosongkan seluruh data siswa dan nilai?')) {
      const initial = createInitialAppState();
      setAppState(initial);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initial));
      showToast('Database Berhasil Dikosongkan', 'Seluruh data siswa dan nilai telah dikosongkan.', 'info');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/40 to-blue-100/50 text-slate-900 flex flex-col selection:bg-blue-200 selection:text-blue-950">
      {/* Top Navbar */}
      <Navbar
        appState={appState}
        onExportExcel={handleExportFullDatabase}
        onNavigateToExcel={() => setActiveTab('excel')}
      />

      {/* Main Full-Width Content Area */}
      <main className="w-full px-3 sm:px-6 lg:px-8 py-4 sm:py-5 space-y-4 sm:space-y-5 flex-1">
        {/* Modern Segmented Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 p-1.5 bg-white/90 backdrop-blur-md rounded-2xl border border-blue-200/90 shadow-sm no-print">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all duration-200 flex items-center gap-2 cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-800 text-white shadow-md shadow-blue-900/30 ring-1 ring-blue-600 scale-[1.02]'
                : 'text-slate-600 hover:text-blue-900 hover:bg-blue-100/70'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-sky-300" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('students')}
            className={`px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all duration-200 flex items-center gap-2 cursor-pointer ${
              activeTab === 'students'
                ? 'bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-800 text-white shadow-md shadow-blue-900/30 ring-1 ring-blue-600 scale-[1.02]'
                : 'text-slate-600 hover:text-blue-900 hover:bg-blue-100/70'
            }`}
          >
            <Users className="w-4 h-4 text-sky-300" />
            <span>Data Siswa</span>
            {appState.students.length > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === 'students' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-900'
                }`}
              >
                {appState.students.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('semesters')}
            className={`px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all duration-200 flex items-center gap-2 cursor-pointer ${
              activeTab === 'semesters'
                ? 'bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-800 text-white shadow-md shadow-blue-900/30 ring-1 ring-blue-600 scale-[1.02]'
                : 'text-slate-600 hover:text-blue-900 hover:bg-blue-100/70'
            }`}
          >
            <BookOpenCheck className="w-4 h-4 text-sky-300" />
            <span>Nilai 6 Semester</span>
          </button>

          <button
            onClick={() => setActiveTab('exams')}
            className={`px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all duration-200 flex items-center gap-2 cursor-pointer ${
              activeTab === 'exams'
                ? 'bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-800 text-white shadow-md shadow-blue-900/30 ring-1 ring-blue-600 scale-[1.02]'
                : 'text-slate-600 hover:text-blue-900 hover:bg-blue-100/70'
            }`}
          >
            <Award className="w-4 h-4 text-sky-300" />
            <span>Nilai Ujian (Tulis & Praktek)</span>
          </button>

          <button
            onClick={() => setActiveTab('graduation')}
            className={`px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all duration-200 flex items-center gap-2 cursor-pointer ${
              activeTab === 'graduation'
                ? 'bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-800 text-white shadow-md shadow-blue-900/30 ring-1 ring-blue-600 scale-[1.02]'
                : 'text-slate-600 hover:text-blue-900 hover:bg-blue-100/70'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-sky-300" />
            <span>Kelulusan & DKN Ijazah</span>
          </button>

          <button
            onClick={() => setActiveTab('excel')}
            className={`px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all duration-200 flex items-center gap-2 cursor-pointer ${
              activeTab === 'excel'
                ? 'bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-800 text-white shadow-md shadow-blue-900/30 ring-1 ring-blue-600 scale-[1.02]'
                : 'text-slate-600 hover:text-blue-900 hover:bg-blue-100/70'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-sky-300" />
            <span>Integrasi Excel</span>
          </button>
        </div>

        {/* Tab Views */}
        {activeTab === 'dashboard' && (
          <DashboardTab
            appState={appState}
            onNavigateTab={(tab) => setActiveTab(tab as typeof activeTab)}
            onOpenAddStudent={() => {
              setEditingStudent(null);
              setIsStudentModalOpen(true);
            }}
            onOpenDKN={() => setIsDKNModalOpen(true)}
            onExportExcel={handleExportFullDatabase}
          />
        )}

        {activeTab === 'students' && (
          <StudentsTab
            appState={appState}
            onOpenAddModal={() => {
              setEditingStudent(null);
              setIsStudentModalOpen(true);
            }}
            onEditStudent={(s) => {
              setEditingStudent(s);
              setIsStudentModalOpen(true);
            }}
            onDeleteStudent={handleDeleteStudent}
            onViewReport={(s) => {
              setViewingReportStudent(s);
              setIsReportModalOpen(true);
            }}
          />
        )}

        {activeTab === 'semesters' && (
          <SemestersTab
            appState={appState}
            onUpdateGrade={handleUpdateGrade}
            onSaveGrades={handleSaveGrades}
            onBulkFillGrades={handleBulkFillGrades}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'exams' && (
          <ExamsTab
            appState={appState}
            onUpdateExamScore={handleUpdateExamScore}
            onBulkFillExams={handleBulkFillExams}
            onSaveExamsNotification={() =>
              showToast(
                'Nilai Ujian Sekolah Tersimpan!',
                'Semua perubahan nilai ujian langsung tersimpan secara aman ke database lokal.',
                'success'
              )
            }
            onShowToast={showToast}
          />
        )}

        {activeTab === 'graduation' && (
          <GraduationTab
            appState={appState}
            onOpenDKN={() => setIsDKNModalOpen(true)}
            onOpenSKL={(s) => {
              setViewingSKLStudent(s);
              setIsSKLModalOpen(true);
            }}
            onOpenExamModal={(s) => {
              setEditingExamStudent(s);
              setIsExamModalOpen(true);
            }}
            onUpdateSerial={handleUpdateSerial}
            onExportExcel={handleExportFullDatabase}
            onUpdateSchoolKop={handleUpdateSchoolKop}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'excel' && (
          <ExcelTab
            appState={appState}
            onApplyImportedData={handleApplyImportedData}
            onResetDatabase={handleResetDatabase}
            onShowToast={showToast}
            onShowImportSuccessModal={(summary) => {
              setImportSummary(summary);
              setIsImportSuccessOpen(true);
            }}
          />
        )}
      </main>

      {/* Modals */}
      <ImportSuccessModal
        isOpen={isImportSuccessOpen}
        onClose={() => setIsImportSuccessOpen(false)}
        onNavigateToStudents={() => {
          setIsImportSuccessOpen(false);
          setActiveTab('students');
        }}
        summary={importSummary}
      />

      <StudentModal
        isOpen={isStudentModalOpen}
        onClose={() => {
          setIsStudentModalOpen(false);
          setEditingStudent(null);
        }}
        onSave={handleSaveStudent}
        editingStudent={editingStudent}
      />

      <ReportCardModal
        isOpen={isReportModalOpen}
        onClose={() => {
          setIsReportModalOpen(false);
          setViewingReportStudent(null);
        }}
        student={viewingReportStudent}
        appState={appState}
      />

      <SKLModal
        isOpen={isSKLModalOpen}
        onClose={() => {
          setIsSKLModalOpen(false);
          setViewingSKLStudent(null);
        }}
        student={viewingSKLStudent}
        appState={appState}
        onUpdateSchoolKop={handleUpdateSchoolKop}
        onShowToast={showToast}
      />

      <DKNPrintModal
        isOpen={isDKNModalOpen}
        onClose={() => setIsDKNModalOpen(false)}
        appState={appState}
      />

      <ExamModal
        isOpen={isExamModalOpen}
        onClose={() => {
          setIsExamModalOpen(false);
          setEditingExamStudent(null);
        }}
        student={editingExamStudent}
        appState={appState}
        onSaveExams={handleSaveExams}
      />

      {/* Toasts */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
