import ExcelJS from 'exceljs';
import * as XLSX from 'xlsx';
import { AppState, ClassName, ExamScores, SemesterKey, Student, SubjectGrades, SUBJECT_LABELS } from '../types';
import { ALL_SEMESTERS, SUBJECT_KEYS, calcExamAverage, calcFinalIjazahScore, calcReport6SemesterAverage, calcSemesterAverage, getPredikat } from './calc';

// Theme Colors matching the application's blue gradient palette
const COLOR_PRIMARY_NAVY = 'FF1E3A8A'; // Deep Navy Blue (#1E3A8A)
const COLOR_SECONDARY_BLUE = 'FF2563EB'; // Vibrant Blue (#2563EB)
const COLOR_LIGHT_BLUE = 'FFDBEAFE'; // Light Blue highlight (#DBEAFE)
const COLOR_ICE_BLUE = 'FFF0F9FF'; // Soft ice blue for alternating rows (#F0F9FF)
const COLOR_BORDER = 'FF94A3B8'; // Slate border (#94A3B8)
const COLOR_WHITE = 'FFFFFFFF';
const COLOR_TEXT_DARK = 'FF0F172A';

const thinBorder: Partial<ExcelJS.Borders> = {
  top: { style: 'thin', color: { argb: COLOR_BORDER } },
  left: { style: 'thin', color: { argb: COLOR_BORDER } },
  bottom: { style: 'thin', color: { argb: COLOR_BORDER } },
  right: { style: 'thin', color: { argb: COLOR_BORDER } },
};

const headerBorder: Partial<ExcelJS.Borders> = {
  top: { style: 'medium', color: { argb: COLOR_PRIMARY_NAVY } },
  left: { style: 'thin', color: { argb: 'FF3B82F6' } },
  bottom: { style: 'medium', color: { argb: COLOR_PRIMARY_NAVY } },
  right: { style: 'thin', color: { argb: 'FF3B82F6' } },
};

function applyTitleBanner(
  ws: ExcelJS.Worksheet,
  title: string,
  subtitle: string,
  endColLetter: string
) {
  // Row 1: Main Title
  ws.mergeCells(`A1:${endColLetter}1`);
  const r1 = ws.getCell('A1');
  r1.value = title;
  r1.font = { name: 'Calibri', size: 13, bold: true, color: { argb: COLOR_WHITE } };
  r1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_PRIMARY_NAVY } };
  r1.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(1).height = 28;

  // Row 2: Subtitle
  ws.mergeCells(`A2:${endColLetter}2`);
  const r2 = ws.getCell('A2');
  r2.value = subtitle;
  r2.font = { name: 'Calibri', size: 10, bold: true, color: { argb: COLOR_WHITE } };
  r2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_SECONDARY_BLUE } };
  r2.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(2).height = 22;

  // Row 3: Spacer
  ws.getRow(3).height = 8;
}

export async function exportFullDatabaseToExcel(appState: AppState) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'SD NEGERI BABELAN KOTA 01';
  wb.lastModifiedBy = 'Sistem Nilai Rapor & Ijazah';
  wb.created = new Date();
  wb.modified = new Date();

  // ==========================================
  // SHEET 1: DATA SISWA
  // ==========================================
  const wsStudents = wb.addWorksheet('DATA SISWA', {
    views: [{ showGridLines: true }],
  });

  applyTitleBanner(
    wsStudents,
    `${appState.school.name} - KECAMATAN BABELAN, KABUPATEN BEKASI`,
    `DATABASE INDUK PESERTA DIDIK KELAS 6 - TAHUN AJARAN ${appState.school.academicYear}`,
    'J'
  );

  const studentHeaders = [
    'No',
    'Kelas',
    'NIS',
    'NISN',
    'Nama Lengkap Siswa',
    'L/P',
    'Tempat Lahir',
    'Tanggal Lahir',
    'Orang Tua / Wali',
    'No. Seri Ijazah',
  ];

  const headerRow1 = wsStudents.getRow(4);
  headerRow1.values = studentHeaders;
  headerRow1.height = 26;

  studentHeaders.forEach((_, idx) => {
    const cell = headerRow1.getCell(idx + 1);
    cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: COLOR_WHITE } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_PRIMARY_NAVY } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = headerBorder;
  });

  wsStudents.columns = [
    { key: 'no', width: 6 },
    { key: 'class', width: 10 },
    { key: 'nis', width: 12 },
    { key: 'nisn', width: 16 },
    { key: 'name', width: 32 },
    { key: 'gender', width: 8 },
    { key: 'birthPlace', width: 18 },
    { key: 'birthDate', width: 15 },
    { key: 'parent', width: 26 },
    { key: 'serial', width: 28 },
  ];

  appState.students.forEach((s, idx) => {
    const rowNum = idx + 5;
    const row = wsStudents.getRow(rowNum);
    row.values = [
      idx + 1,
      s.classRoom,
      s.nis,
      s.nisn,
      s.name,
      s.gender,
      s.birthPlace,
      s.birthDate,
      s.parentName,
      s.ijazahSerial || '',
    ];
    row.height = 20;

    const isZebra = idx % 2 === 1;
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      cell.font = { name: 'Calibri', size: 10, color: { argb: COLOR_TEXT_DARK } };
      cell.border = thinBorder;
      if (isZebra) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_ICE_BLUE } };
      }
      if (colNumber === 1 || colNumber === 2 || colNumber === 6) {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      } else if (colNumber === 3 || colNumber === 4 || colNumber === 8 || colNumber === 10) {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      } else {
        cell.alignment = { horizontal: 'left', vertical: 'middle' };
      }
    });
  });

  // ==========================================
  // SHEET 2: NILAI 6 SEMESTER
  // ==========================================
  const wsSem = wb.addWorksheet('NILAI 6 SEMESTER', {
    views: [{ showGridLines: true }],
  });

  applyTitleBanner(
    wsSem,
    `${appState.school.name} - REKAPITULASI NILAI 6 SEMESTER (KELAS 4 - 6)`,
    `DAFTAR NILAI RAPOR 9 MATA PELAJARAN TP ${appState.school.academicYear}`,
    'O'
  );

  const semHeaders = [
    'No',
    'Kelas',
    'NISN',
    'Nama Siswa',
    'Semester',
    'PAI',
    'PPKn',
    'B.Indo',
    'MTK',
    'IPAS',
    'SBdP',
    'PJOK',
    'B.Sunda',
    'B.Inggris',
    'Rata-Rata',
  ];

  const headerRow2 = wsSem.getRow(4);
  headerRow2.values = semHeaders;
  headerRow2.height = 26;

  semHeaders.forEach((_, idx) => {
    const cell = headerRow2.getCell(idx + 1);
    cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: COLOR_WHITE } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_PRIMARY_NAVY } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = headerBorder;
  });

  wsSem.columns = [
    { width: 6 },
    { width: 8 },
    { width: 14 },
    { width: 30 },
    { width: 12 },
    { width: 9 },
    { width: 9 },
    { width: 9 },
    { width: 9 },
    { width: 9 },
    { width: 9 },
    { width: 9 },
    { width: 9 },
    { width: 10 },
    { width: 13 },
  ];

  let currentSemRow = 5;
  let counter = 1;
  appState.students.forEach((s) => {
    ALL_SEMESTERS.forEach((sem) => {
      const g = (appState.grades[s.id] && appState.grades[s.id][sem]) || ({} as SubjectGrades);
      const avg = calcSemesterAverage(g);
      const row = wsSem.getRow(currentSemRow);
      row.values = [
        counter++,
        s.classRoom,
        s.nisn,
        s.name,
        sem,
        g.pai ?? 0,
        g.ppkn ?? 0,
        g.bindo ?? 0,
        g.mtk ?? 0,
        g.ipas ?? 0,
        g.sbdp ?? 0,
        g.pjok ?? 0,
        g.sunda ?? 0,
        g.bing ?? 0,
        avg,
      ];
      row.height = 20;

      const isZebra = (currentSemRow % 2 === 0);
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        cell.font = { name: 'Calibri', size: 10, color: { argb: COLOR_TEXT_DARK } };
        cell.border = thinBorder;
        if (isZebra) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_ICE_BLUE } };
        }
        if (colNumber === 15) {
          cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: COLOR_PRIMARY_NAVY } };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_LIGHT_BLUE } };
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        } else if (colNumber >= 5) {
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        } else if (colNumber === 4) {
          cell.alignment = { horizontal: 'left', vertical: 'middle' };
        } else {
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        }
      });
      currentSemRow++;
    });
  });

  // ==========================================
  // SHEET 3: UJIAN SEKOLAH
  // ==========================================
  const wsExam = wb.addWorksheet('UJIAN SEKOLAH', {
    views: [{ showGridLines: true }],
  });

  applyTitleBanner(
    wsExam,
    `${appState.school.name} - REKAPITULASI UJIAN SEKOLAH TAHUN 2027`,
    'NILAI UJIAN TULIS, UJIAN PRAKTEK, DAN NILAI AKHIR UJIAN SEKOLAH',
    'N'
  );

  const examHeaders = [
    'No',
    'Kelas',
    'NISN',
    'Nama Siswa',
    'PAI',
    'PPKn',
    'B.Indo',
    'MTK',
    'IPAS',
    'SBdP',
    'PJOK',
    'B.Sunda',
    'B.Ing',
    'Rata Ujian',
  ];

  const headerRow3 = wsExam.getRow(4);
  headerRow3.values = examHeaders;
  headerRow3.height = 26;

  examHeaders.forEach((_, idx) => {
    const cell = headerRow3.getCell(idx + 1);
    cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: COLOR_WHITE } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_PRIMARY_NAVY } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = headerBorder;
  });

  wsExam.columns = [
    { width: 6 },
    { width: 8 },
    { width: 14 },
    { width: 30 },
    { width: 9 },
    { width: 9 },
    { width: 9 },
    { width: 9 },
    { width: 9 },
    { width: 9 },
    { width: 9 },
    { width: 9 },
    { width: 9 },
    { width: 14 },
  ];

  appState.students.forEach((s, idx) => {
    const ex = appState.exams[s.id] || {};
    const avgExam = calcExamAverage(ex);
    const rowNum = idx + 5;
    const row = wsExam.getRow(rowNum);
    row.values = [
      idx + 1,
      s.classRoom,
      s.nisn,
      s.name,
      ex.pai?.finalExam ?? 0,
      ex.ppkn?.finalExam ?? 0,
      ex.bindo?.finalExam ?? 0,
      ex.mtk?.finalExam ?? 0,
      ex.ipas?.finalExam ?? 0,
      ex.sbdp?.finalExam ?? 0,
      ex.pjok?.finalExam ?? 0,
      ex.sunda?.finalExam ?? 0,
      ex.bing?.finalExam ?? 0,
      avgExam,
    ];
    row.height = 20;

    const isZebra = idx % 2 === 1;
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      cell.font = { name: 'Calibri', size: 10, color: { argb: COLOR_TEXT_DARK } };
      cell.border = thinBorder;
      if (isZebra) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_ICE_BLUE } };
      }
      if (colNumber === 14) {
        cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: COLOR_PRIMARY_NAVY } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_LIGHT_BLUE } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      } else if (colNumber >= 5) {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      } else if (colNumber === 4) {
        cell.alignment = { horizontal: 'left', vertical: 'middle' };
      } else {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      }
    });
  });

  // ==========================================
  // SHEET 4: REKAP IJAZAH & KELULUSAN
  // ==========================================
  const wsGrad = wb.addWorksheet('REKAP IJAZAH', {
    views: [{ showGridLines: true }],
  });

  applyTitleBanner(
    wsGrad,
    `${appState.school.name} - DAFTAR KUMPULAN NILAI (DKN) IJAZAH KELAS 6`,
    `BOBOT PENILAIAN: 60% RAPOR (6 SMT) + 40% UJIAN SEKOLAH · KKM KELULUSAN >= ${appState.school.passingGrade.toFixed(1)}`,
    'L'
  );

  const gradHeaders = [
    'No',
    'Kelas',
    'NIS',
    'NISN',
    'Nama Siswa',
    'Rata Rapor (60%)',
    'Rata Ujian (40%)',
    'Nilai Akhir Ijazah',
    'Predikat',
    'Huruf',
    'Status Kelulusan',
    'No. Seri Ijazah',
  ];

  const headerRow4 = wsGrad.getRow(4);
  headerRow4.values = gradHeaders;
  headerRow4.height = 26;

  gradHeaders.forEach((_, idx) => {
    const cell = headerRow4.getCell(idx + 1);
    cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: COLOR_WHITE } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_PRIMARY_NAVY } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = headerBorder;
  });

  wsGrad.columns = [
    { width: 6 },
    { width: 8 },
    { width: 12 },
    { width: 15 },
    { width: 32 },
    { width: 18 },
    { width: 18 },
    { width: 18 },
    { width: 14 },
    { width: 10 },
    { width: 18 },
    { width: 28 },
  ];

  appState.students.forEach((s, idx) => {
    const avgRapor = calcReport6SemesterAverage(appState.grades[s.id]);
    const avgExam = calcExamAverage(appState.exams[s.id]);
    const finalScore = calcFinalIjazahScore(avgRapor, avgExam, appState.school.reportWeight, appState.school.examWeight);
    const { predikat, huruf } = getPredikat(finalScore);
    const isPassed = finalScore >= appState.school.passingGrade;
    const status = isPassed ? 'LULUS' : 'TIDAK LULUS';

    const rowNum = idx + 5;
    const row = wsGrad.getRow(rowNum);
    row.values = [
      idx + 1,
      s.classRoom,
      s.nis,
      s.nisn,
      s.name,
      avgRapor,
      avgExam,
      finalScore,
      predikat,
      huruf,
      status,
      s.ijazahSerial || '',
    ];
    row.height = 20;

    const isZebra = idx % 2 === 1;
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      cell.font = { name: 'Calibri', size: 10, color: { argb: COLOR_TEXT_DARK } };
      cell.border = thinBorder;
      if (isZebra) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_ICE_BLUE } };
      }

      if (colNumber === 8) {
        // Nilai Akhir
        cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: COLOR_PRIMARY_NAVY } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_LIGHT_BLUE } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      } else if (colNumber === 11) {
        // Status Kelulusan
        cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: isPassed ? 'FF166534' : 'FF991B1B' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isPassed ? 'FFDCFCE7' : 'FFFEE2E2' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      } else if (colNumber === 5) {
        cell.alignment = { horizontal: 'left', vertical: 'middle' };
      } else {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      }
    });
  });

  // Write buffer and trigger browser download
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const cleanSchool = appState.school.name.replace(/\s+/g, '_');
  link.download = `${cleanSchool}_Database_Nilai_2026_2027.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function exportBlankTemplateExcel() {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'SD NEGERI BABELAN KOTA 01';

  // Sheet 1: Template Data Siswa
  const ws1 = wb.addWorksheet('FORMAT_DATA_SISWA', {
    views: [{ showGridLines: true }],
  });

  applyTitleBanner(
    ws1,
    'FORMAT INPUT DATA SISWA KELAS 6 - SD NEGERI BABELAN KOTA 01',
    'Isi kolom di bawah ini. Pastikan NISN dan Nama Siswa terisi dengan benar.',
    'I'
  );

  const headers1 = [
    'Kelas (6A/6B/6C/6D)',
    'NIS',
    'NISN (10 Digit)',
    'Nama Lengkap Siswa',
    'Jenis Kelamin (L/P)',
    'Tempat Lahir',
    'Tanggal Lahir (YYYY-MM-DD)',
    'Nama Orang Tua / Wali',
    'No. Seri Ijazah (Opsional)',
  ];

  const hRow1 = ws1.getRow(4);
  hRow1.values = headers1;
  hRow1.height = 26;

  headers1.forEach((_, idx) => {
    const c = hRow1.getCell(idx + 1);
    c.font = { name: 'Calibri', size: 10, bold: true, color: { argb: COLOR_WHITE } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_PRIMARY_NAVY } };
    c.alignment = { horizontal: 'center', vertical: 'middle' };
    c.border = headerBorder;
  });

  ws1.columns = [
    { width: 22 },
    { width: 14 },
    { width: 18 },
    { width: 32 },
    { width: 20 },
    { width: 18 },
    { width: 24 },
    { width: 26 },
    { width: 28 },
  ];

  // Example row
  const rExample = ws1.getRow(5);
  rExample.values = [
    '6A',
    '2101',
    '0134829101',
    'Contoh Nama Siswa',
    'L',
    'Bekasi',
    '2014-05-15',
    'Nama Orang Tua',
    'DN-02/D-SD/27/6A/0001',
  ];
  rExample.height = 20;
  rExample.eachCell((c) => {
    c.font = { name: 'Calibri', size: 10, color: { argb: 'FF475569' }, italic: true };
    c.border = thinBorder;
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_ICE_BLUE } };
  });

  // Sheet 2: Template Nilai Semester
  const ws2 = wb.addWorksheet('FORMAT_NILAI_SEMESTER', {
    views: [{ showGridLines: true }],
  });

  applyTitleBanner(
    ws2,
    'FORMAT INPUT NILAI 6 SEMESTER - SD NEGERI BABELAN KOTA 01',
    'Pilihan Semester: K4_S1, K4_S2, K5_S1, K5_S2, K6_S1, K6_S2. Skala nilai 0 - 100.',
    'L'
  );

  const headers2 = [
    'NISN (10 Digit)',
    'Semester (K4_S1 - K6_S2)',
    'PAI',
    'PPKn',
    'B.Indo',
    'MTK',
    'IPAS',
    'SBdP',
    'PJOK',
    'B.Sunda',
    'B.Inggris',
    'Keterangan',
  ];

  const hRow2 = ws2.getRow(4);
  hRow2.values = headers2;
  hRow2.height = 26;

  headers2.forEach((_, idx) => {
    const c = hRow2.getCell(idx + 1);
    c.font = { name: 'Calibri', size: 10, bold: true, color: { argb: COLOR_WHITE } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_PRIMARY_NAVY } };
    c.alignment = { horizontal: 'center', vertical: 'middle' };
    c.border = headerBorder;
  });

  ws2.columns = [
    { width: 18 },
    { width: 24 },
    { width: 10 },
    { width: 10 },
    { width: 10 },
    { width: 10 },
    { width: 10 },
    { width: 10 },
    { width: 10 },
    { width: 10 },
    { width: 10 },
    { width: 18 },
  ];

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'Template_Input_Excel_SDN_Babelan_Kota_01.xlsx';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function exportSemesterToExcel(
  appState: AppState,
  semesterKey: SemesterKey,
  classRoom: ClassName
) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'SD NEGERI BABELAN KOTA 01';

  const ws = wb.addWorksheet(`Nilai ${classRoom} ${semesterKey}`, {
    views: [{ showGridLines: true }],
  });

  applyTitleBanner(
    ws,
    `${appState.school.name} - NILAI KELAS ${classRoom}`,
    `SEMESTER: ${semesterKey} · TAHUN AJARAN ${appState.school.academicYear}`,
    'N'
  );

  const headers = [
    'No',
    'NIS',
    'NISN',
    'Nama Siswa',
    'PAI',
    'PPKn',
    'B.Indo',
    'MTK',
    'IPAS',
    'SBdP',
    'PJOK',
    'B.Sunda',
    'B.Inggris',
    'Rata-Rata',
  ];

  const hRow = ws.getRow(4);
  hRow.values = headers;
  hRow.height = 26;

  headers.forEach((_, idx) => {
    const c = hRow.getCell(idx + 1);
    c.font = { name: 'Calibri', size: 10, bold: true, color: { argb: COLOR_WHITE } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_PRIMARY_NAVY } };
    c.alignment = { horizontal: 'center', vertical: 'middle' };
    c.border = headerBorder;
  });

  ws.columns = [
    { width: 6 },
    { width: 12 },
    { width: 15 },
    { width: 32 },
    { width: 9 },
    { width: 9 },
    { width: 9 },
    { width: 9 },
    { width: 9 },
    { width: 9 },
    { width: 9 },
    { width: 9 },
    { width: 10 },
    { width: 14 },
  ];

  const students = appState.students.filter((s) => s.classRoom === classRoom);
  students.forEach((s, idx) => {
    const g = (appState.grades[s.id] && appState.grades[s.id][semesterKey]) || ({} as SubjectGrades);
    const avg = calcSemesterAverage(g);
    const rowNum = idx + 5;
    const row = ws.getRow(rowNum);
    row.values = [
      idx + 1,
      s.nis,
      s.nisn,
      s.name,
      g.pai ?? 0,
      g.ppkn ?? 0,
      g.bindo ?? 0,
      g.mtk ?? 0,
      g.ipas ?? 0,
      g.sbdp ?? 0,
      g.pjok ?? 0,
      g.sunda ?? 0,
      g.bing ?? 0,
      avg,
    ];
    row.height = 20;

    const isZebra = idx % 2 === 1;
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      cell.font = { name: 'Calibri', size: 10, color: { argb: COLOR_TEXT_DARK } };
      cell.border = thinBorder;
      if (isZebra) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_ICE_BLUE } };
      }
      if (colNumber === 14) {
        cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: COLOR_PRIMARY_NAVY } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_LIGHT_BLUE } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      } else if (colNumber >= 5) {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      } else if (colNumber === 4) {
        cell.alignment = { horizontal: 'left', vertical: 'middle' };
      } else {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      }
    });
  });

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Nilai_${classRoom}_${semesterKey}_SDN_Babelan_Kota_01.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function parseExcelFile(file: File): Promise<{
  students?: Student[];
  grades?: Record<string, Partial<Record<SemesterKey, SubjectGrades>>>;
  exams?: Record<string, Partial<ExamScores>>;
  message: string;
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        const importedStudents: Student[] = [];
        const studentByNisn: Record<string, Student> = {};
        const importedGrades: Record<string, Partial<Record<SemesterKey, SubjectGrades>>> = {};
        const importedExams: Record<string, Partial<ExamScores>> = {};

        // 1. Look for student sheet
        const studentSheetName = workbook.SheetNames.find(
          (name) => /siswa|student/i.test(name)
        );

        if (studentSheetName) {
          const sheet = workbook.Sheets[studentSheetName];
          const rawStudents = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
            range: 3, // Support title banners by reading header from row 4
          });

          // Fallback if empty range
          const fallbackStudents = rawStudents.length > 0 ? rawStudents : XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

          fallbackStudents.forEach((row, idx) => {
            const nisn = String(row['NISN'] || row['nisn'] || row['NISN (10 Digit)'] || '').trim();
            const nis = String(row['NIS'] || row['nis'] || '').trim();
            const name = String(row['Nama Siswa'] || row['Nama Lengkap Siswa'] || row['Nama'] || row['nama'] || '').trim();
            const rawClass = String(row['Kelas'] || row['Kelas (6A/6B/6C/6D)'] || row['classRoom'] || '6A').trim().toUpperCase();
            const classRoom = (['6A', '6B', '6C', '6D'].includes(rawClass) ? rawClass : '6A') as ClassName;
            const gender = String(row['L/P'] || row['Jenis Kelamin (L/P)'] || row['Jenis Kelamin'] || 'L').trim().toUpperCase().startsWith('P') ? 'P' : 'L';
            const birthPlace = String(row['Tempat Lahir'] || 'Bekasi').trim();
            const birthDate = String(row['Tanggal Lahir'] || row['Tanggal Lahir (YYYY-MM-DD)'] || row['Tgl Lahir'] || '2014-05-15').trim();
            const parentName = String(row['Orang Tua / Wali'] || row['Nama Orang Tua / Wali'] || row['Orang Tua'] || '').trim();
            const ijazahSerial = String(row['No Seri Ijazah'] || row['No. Seri Ijazah'] || row['No. Seri Ijazah (Opsional)'] || '').trim();

            if (name && !name.toLowerCase().includes('contoh')) {
              const studentId = `imp-std-${idx + 1}-${Date.now().toString(36)}`;
              const s: Student = {
                id: studentId,
                nis: nis || `${2100 + idx + 1}`,
                nisn: nisn || `013000${String(idx + 1).padStart(4, '0')}`,
                name,
                gender,
                classRoom,
                birthPlace,
                birthDate,
                parentName: parentName || '-',
                ijazahSerial: ijazahSerial || undefined,
              };
              importedStudents.push(s);
              studentByNisn[s.nisn] = s;
            }
          });
        }

        // 2. Look for semester sheet
        const semSheetName = workbook.SheetNames.find(
          (name) => /semester|nilai/i.test(name)
        );

        if (semSheetName) {
          const sheet = workbook.Sheets[semSheetName];
          const rawSem = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
            range: 3,
          });
          const fallbackSem = rawSem.length > 0 ? rawSem : XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

          fallbackSem.forEach((row) => {
            const nisn = String(row['NISN'] || row['NISN (10 Digit)'] || row['nisn'] || '').trim();
            const sem = String(row['Semester'] || row['Semester (K4_S1 - K6_S2)'] || row['semester'] || 'K6_S1').trim().toUpperCase() as SemesterKey;
            const targetStudent = studentByNisn[nisn];

            if (targetStudent && ALL_SEMESTERS.includes(sem)) {
              if (!importedGrades[targetStudent.id]) {
                importedGrades[targetStudent.id] = {};
              }
              importedGrades[targetStudent.id][sem] = {
                pai: Number(row['PAI'] ?? 0),
                ppkn: Number(row['PPKn'] ?? 0),
                bindo: Number(row['B.Indo'] ?? row['Bahasa Indonesia'] ?? 0),
                mtk: Number(row['MTK'] ?? row['Matematika'] ?? 0),
                ipas: Number(row['IPAS'] ?? row['IPA'] ?? 0),
                sbdp: Number(row['SBdP'] ?? 0),
                pjok: Number(row['PJOK'] ?? 0),
                sunda: Number(row['B.Sunda'] ?? row['Bahasa Sunda'] ?? 0),
                bing: Number(row['B.Inggris'] ?? row['B.Ing'] ?? row['Bahasa Inggris'] ?? 0),
              };
            }
          });
        }

        resolve({
          students: importedStudents.length > 0 ? importedStudents : undefined,
          grades: Object.keys(importedGrades).length > 0 ? importedGrades : undefined,
          exams: Object.keys(importedExams).length > 0 ? importedExams : undefined,
          message: `Berhasil membaca file Excel. Ditemukan ${importedStudents.length} siswa dan ${Object.keys(importedGrades).length} data nilai semester.`,
        });
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        reject(new Error(`Gagal memproses file Excel: ${errorMsg}`));
      }
    };
    reader.onerror = () => reject(new Error('Gagal membaca file dari disk.'));
    reader.readAsArrayBuffer(file);
  });
}
