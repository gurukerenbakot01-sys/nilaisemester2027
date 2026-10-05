import { AppState, ExamScores, SemesterKey, Student, SubjectGrades, SUBJECT_LABELS } from '../types';

export const ALL_SEMESTERS: SemesterKey[] = [
  'K4_S1',
  'K4_S2',
  'K5_S1',
  'K5_S2',
  'K6_S1',
  'K6_S2',
];

export const SUBJECT_KEYS = Object.keys(SUBJECT_LABELS) as (keyof SubjectGrades)[];

export function calcSemesterAverage(grades?: SubjectGrades): number {
  if (!grades) return 0;
  let total = 0;
  let count = 0;
  for (const key of SUBJECT_KEYS) {
    if (typeof grades[key] === 'number') {
      total += grades[key];
      count++;
    }
  }
  return count > 0 ? Number((total / count).toFixed(2)) : 0;
}

export function calcSubject6SemesterAvg(
  studentGrades: Partial<Record<SemesterKey, SubjectGrades>> | undefined,
  subject: keyof SubjectGrades
): number {
  if (!studentGrades) return 0;
  let total = 0;
  let count = 0;
  for (const sem of ALL_SEMESTERS) {
    const sGrades = studentGrades[sem];
    if (sGrades && typeof sGrades[subject] === 'number') {
      total += sGrades[subject];
      count++;
    }
  }
  return count > 0 ? Number((total / count).toFixed(2)) : 0;
}

export function calcReport6SemesterAverage(
  studentGrades: Partial<Record<SemesterKey, SubjectGrades>> | undefined
): number {
  if (!studentGrades) return 0;
  let total = 0;
  let count = 0;
  for (const sem of ALL_SEMESTERS) {
    const sGrades = studentGrades[sem];
    if (sGrades) {
      for (const sub of SUBJECT_KEYS) {
        if (typeof sGrades[sub] === 'number') {
          total += sGrades[sub];
          count++;
        }
      }
    }
  }
  return count > 0 ? Number((total / count).toFixed(2)) : 0;
}

export function calcExamAverage(exams: Partial<ExamScores> | undefined): number {
  if (!exams) return 0;
  let total = 0;
  let count = 0;
  for (const sub of SUBJECT_KEYS) {
    const examItem = exams[sub];
    if (examItem && typeof examItem.finalExam === 'number') {
      total += examItem.finalExam;
      count++;
    }
  }
  return count > 0 ? Number((total / count).toFixed(2)) : 0;
}

export function calcFinalIjazahScore(
  avgReport: number,
  avgExam: number,
  reportWeight: number = 60,
  examWeight: number = 40
): number {
  const score = (avgReport * (reportWeight / 100)) + (avgExam * (examWeight / 100));
  return Number(score.toFixed(2));
}

export function getPredikat(score: number): { predikat: string; huruf: 'A' | 'B' | 'C' | 'D' } {
  if (score >= 90) return { predikat: 'Sangat Baik', huruf: 'A' };
  if (score >= 80) return { predikat: 'Baik', huruf: 'B' };
  if (score >= 75) return { predikat: 'Cukup', huruf: 'C' };
  return { predikat: 'Kurang', huruf: 'D' };
}

export function formatIndoDate(dateStr?: string): string {
  if (!dateStr) return '-';
  try {
    const [year, month, day] = dateStr.split('-');
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    if (!year || !month || !day) return dateStr;
    const mIdx = parseInt(month, 10) - 1;
    return `${parseInt(day, 10)} ${months[mIdx] || month} ${year}`;
  } catch {
    return dateStr;
  }
}
