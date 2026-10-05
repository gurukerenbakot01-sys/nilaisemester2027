import { AppState, SchoolConfig, Student, SemesterKey, SubjectGrades, ExamScores } from '../types';

export const DEFAULT_SCHOOL: SchoolConfig = {
  name: 'SD NEGERI BABELAN KOTA 01',
  npsn: '20218123',
  academicYear: '2026/2027',
  address: 'Jl. Raya Babelan No. 01, Babelan Kota, Kec. Babelan',
  district: 'Babelan',
  regency: 'Kabupaten Bekasi',
  headmasterName: 'LAILATUL FAJRIAH, S.Pd.SD',
  headmasterNip: '197808202008012005',
  reportWeight: 60,
  examWeight: 40,
  passingGrade: 75.0,
};

// Data awal siswa dikosongkan sesuai permintaan pengguna
export const INITIAL_STUDENTS: Student[] = [];

export function createInitialAppState(): AppState {
  const grades: Record<string, Partial<Record<SemesterKey, SubjectGrades>>> = {};
  const exams: Record<string, Partial<ExamScores>> = {};

  return {
    school: DEFAULT_SCHOOL,
    students: [],
    grades,
    exams,
  };
}
