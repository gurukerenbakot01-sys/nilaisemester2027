export type ClassName = '6A' | '6B' | '6C' | '6D';

export type SemesterKey = 'K4_S1' | 'K4_S2' | 'K5_S1' | 'K5_S2' | 'K6_S1' | 'K6_S2';

export interface SubjectGrades {
  pai: number;
  ppkn: number;
  bindo: number;
  mtk: number;
  ipas: number;
  sbdp: number;
  pjok: number;
  sunda: number;
  bing: number;
}

export interface ExamSubjectScore {
  written: number;
  practice: number;
  finalExam: number;
}

export type ExamScores = Record<keyof SubjectGrades, ExamSubjectScore>;

export interface Student {
  id: string;
  nis: string;
  nisn: string;
  name: string;
  gender: 'L' | 'P';
  classRoom: ClassName;
  birthPlace: string;
  birthDate: string;
  parentName: string;
  ijazahSerial?: string;
}

export interface SchoolConfig {
  name: string;
  npsn: string;
  academicYear: string;
  address: string;
  district: string;
  regency: string;
  headmasterName: string;
  headmasterNip: string;
  reportWeight: number; // e.g. 60
  examWeight: number;   // e.g. 40
  passingGrade: number; // e.g. 75
  kopImageUrl?: string; // Base64 data URL of uploaded official school letterhead image
}

export const SUBJECT_LABELS: Record<keyof SubjectGrades, { label: string; fullName: string; hasPractice: boolean }> = {
  pai: { label: 'PAI', fullName: 'Pendidikan Agama & Budi Pekerti', hasPractice: true },
  ppkn: { label: 'PPKn', fullName: 'Pendidikan Pancasila & Kewarganegaraan', hasPractice: false },
  bindo: { label: 'B.Indo', fullName: 'Bahasa Indonesia', hasPractice: true },
  mtk: { label: 'MTK', fullName: 'Matematika', hasPractice: false },
  ipas: { label: 'IPAS', fullName: 'Ilmu Pengetahuan Alam & Sosial', hasPractice: true },
  sbdp: { label: 'SBdP', fullName: 'Seni Budaya dan Prakarya', hasPractice: true },
  pjok: { label: 'PJOK', fullName: 'Pendidikan Jasmani, Olahraga & Kesehatan', hasPractice: true },
  sunda: { label: 'B.Sunda', fullName: 'Muatan Lokal Bahasa Sunda', hasPractice: true },
  bing: { label: 'B.Ing', fullName: 'Bahasa Inggris', hasPractice: false },
};

export const SEMESTER_LABELS: Record<SemesterKey, string> = {
  K4_S1: 'Kelas 4 Semester 1 (TP 2024/2025)',
  K4_S2: 'Kelas 4 Semester 2 (TP 2024/2025)',
  K5_S1: 'Kelas 5 Semester 1 (TP 2025/2026)',
  K5_S2: 'Kelas 5 Semester 2 (TP 2025/2026)',
  K6_S1: 'Kelas 6 Semester 1 (TP 2026/2027)',
  K6_S2: 'Kelas 6 Semester 2 (TP 2026/2027)',
};

export interface AppState {
  school: SchoolConfig;
  students: Student[];
  grades: Record<string, Partial<Record<SemesterKey, SubjectGrades>>>;
  exams: Record<string, Partial<ExamScores>>;
}
