export const GAS_CODE_GS = `/**
 * ============================================================================
 * APLIKASI NILAI RAPOR & IJAZAH SD NEGERI BABELAN KOTA 01 TP 2026/2027
 * File: Code.gs
 * Target: Google Apps Script (script.google.com)
 * Integrasi: Database Excel (.xlsx) Berwarna & Web App Dashboard
 * Kelas: 6A, 6B, 6C, 6D
 * Semester: K4 Smt 1, K4 Smt 2, K5 Smt 1, K5 Smt 2, K6 Smt 1, K6 Smt 2
 * Kelulusan: Ujian Sekolah (Tulis & Praktek), Rekap Ijazah
 * Tema: Biru Gradasi (Navy Blue #1E3A8A & Vibrant Blue #2563EB)
 * ============================================================================
 */

function doGet(e) {
  var template = HtmlService.createTemplateFromFile('index');
  return template.evaluate()
    .setTitle('Rapor & Ijazah SDN Babelan Kota 01')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * Menyimpan seluruh data aplikasi ke PropertiesService
 */
function saveAllData(payloadJson) {
  try {
    var userProperties = PropertiesService.getUserProperties();
    userProperties.setProperty('BAKOT01_RAPOR_DB_V2', payloadJson);
    return { success: true, message: 'Data berhasil disimpan ke sistem Google Apps Script!' };
  } catch (err) {
    return { success: false, message: 'Gagal menyimpan: ' + err.toString() };
  }
}

/**
 * Mengambil data aplikasi dari PropertiesService
 */
function getAllData() {
  try {
    var userProperties = PropertiesService.getUserProperties();
    var dataStr = userProperties.getProperty('BAKOT01_RAPOR_DB_V2');
    if (!dataStr) {
      return { success: true, data: null };
    }
    return { success: true, data: JSON.parse(dataStr) };
  } catch (err) {
    return { success: false, message: 'Gagal mengambil data: ' + err.toString() };
  }
}

/**
 * Mengosongkan data di PropertiesService
 */
function clearAllData() {
  try {
    var userProperties = PropertiesService.getUserProperties();
    userProperties.deleteProperty('BAKOT01_RAPOR_DB_V2');
    return { success: true, message: 'Data berhasil dikosongkan.' };
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}

/**
 * Menyimpan data satu siswa
 */
function saveStudent(studentObj) {
  try {
    var dbRes = getAllData();
    var db = dbRes.data || { students: [], grades: {}, exams: {} };
    if (!db.students) db.students = [];
    var idx = -1;
    for (var i = 0; i < db.students.length; i++) {
      if (db.students[i].id === studentObj.id) {
        idx = i;
        break;
      }
    }
    if (idx >= 0) {
      db.students[idx] = studentObj;
    } else {
      db.students.push(studentObj);
    }
    saveAllData(JSON.stringify(db));
    return { success: true, student: studentObj };
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}

/**
 * Menghapus data siswa
 */
function deleteStudent(studentId) {
  try {
    var dbRes = getAllData();
    var db = dbRes.data || { students: [], grades: {}, exams: {} };
    if (db.students) {
      db.students = db.students.filter(function(s) { return s.id !== studentId; });
      if (db.grades && db.grades[studentId]) delete db.grades[studentId];
      if (db.exams && db.exams[studentId]) delete db.exams[studentId];
    }
    saveAllData(JSON.stringify(db));
    return { success: true, studentId: studentId };
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}
`;

export const GAS_INDEX_HTML = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Aplikasi Nilai Rapor & Ijazah SDN Babelan Kota 01 - 2026/2027</title>
  <!-- Tailwind CSS & ExcelJS CDN for Styled Excel (.xlsx) -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
    .num-font { font-family: 'JetBrains Mono', monospace; font-variant-numeric: tabular-nums; }
    @media print {
      .no-print { display: none !important; }
      .print-area { display: block !important; }
      body { background: white !important; }
    }
  </style>
</head>
<body class="bg-gradient-to-br from-slate-50 via-sky-50/40 to-blue-100/50 text-slate-900 min-h-screen relative">
  <!-- Top Navigation Bar (Blue Gradient) -->
  <header class="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white border-b border-blue-800/60 sticky top-0 z-40 px-6 py-3.5 flex items-center justify-between no-print shadow-md">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-400 via-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-md ring-2 ring-sky-300/30">
        01
      </div>
      <div>
        <h1 class="text-base font-bold text-white leading-tight">SD NEGERI BABELAN KOTA 01</h1>
        <p class="text-xs text-blue-200">Sistem Nilai Rapor & Rekap Ijazah · TP 2026/2027 · Database Excel</p>
      </div>
    </div>
    <div class="flex flex-wrap items-center gap-2">
      <button onclick="triggerExcelFileInput()" class="px-3.5 py-2 bg-indigo-700/80 hover:bg-indigo-600 text-white text-xs font-semibold rounded-xl border border-indigo-400/30 shadow-xs flex items-center gap-1.5 transition">
        <svg class="w-4 h-4 text-sky-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
        <span>Impor Excel</span>
      </button>
      <button onclick="exportExcelDatabase()" class="px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-semibold rounded-xl shadow-md flex items-center gap-1.5 transition">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
        <span>Download Database Excel (.xlsx)</span>
      </button>
    </div>
  </header>

  <!-- App Container -->
  <div class="max-w-7xl mx-auto p-6 space-y-6">
    <!-- Navigation Tabs (Blue Gradient) -->
    <div class="flex flex-wrap gap-2 border-b border-blue-200 pb-3 no-print">
      <button onclick="switchTab('dashboard')" id="btn-dashboard" class="tab-btn px-4 py-2 text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-800 shadow-md">Dashboard Utama</button>
      <button onclick="switchTab('students')" id="btn-students" class="tab-btn px-4 py-2 text-sm font-medium text-slate-600 hover:text-blue-900 rounded-xl hover:bg-blue-100/60">Data Siswa (6A - 6D)</button>
      <button onclick="switchTab('semesters')" id="btn-semesters" class="tab-btn px-4 py-2 text-sm font-medium text-slate-600 hover:text-blue-900 rounded-xl hover:bg-blue-100/60">Nilai 6 Semester (K4 - K6)</button>
      <button onclick="switchTab('graduation')" id="btn-graduation" class="tab-btn px-4 py-2 text-sm font-medium text-slate-600 hover:text-blue-900 rounded-xl hover:bg-blue-100/60">Kelulusan & Ujian Sekolah</button>
      <button onclick="switchTab('excel')" id="btn-excel" class="tab-btn px-4 py-2 text-sm font-medium text-slate-600 hover:text-blue-900 rounded-xl hover:bg-blue-100/60">Integrasi Database Excel</button>
    </div>

    <!-- TAB 1: DASHBOARD -->
    <div id="tab-dashboard" class="tab-content space-y-6">
      <div id="empty-state-banner" class="hidden p-5 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="space-y-1">
          <h3 class="font-bold text-base flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
            <span>Data Siswa & Nilai Masih Kosong (Siap Diisi)</span>
          </h3>
          <p class="text-xs text-blue-200">
            Aplikasi dalam kondisi bersih. Silakan tambahkan siswa baru atau unggah file database Excel (.xlsx).
          </p>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="openStudentModal()" class="px-3.5 py-2 bg-gradient-to-r from-sky-400 to-blue-500 text-white font-semibold text-xs rounded-xl shadow-xs">+ Tambah Siswa</button>
          <button onclick="triggerExcelFileInput()" class="px-3.5 py-2 bg-blue-800 text-white font-semibold text-xs rounded-xl border border-blue-600">Impor Excel</button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-gradient-to-br from-white via-sky-50/40 to-blue-50/70 p-5 rounded-2xl border border-blue-200 shadow-sm">
          <p class="text-xs font-bold text-blue-900 uppercase tracking-wider">Total Siswa Kelas 6</p>
          <p id="stat-total-students" class="text-3xl font-extrabold text-blue-950 mt-2 num-font">0</p>
          <p class="text-xs text-blue-700/80 mt-1 font-medium">Kelas 6A, 6B, 6C, 6D</p>
        </div>
        <div class="bg-gradient-to-br from-white via-blue-50/40 to-indigo-50/70 p-5 rounded-2xl border border-blue-200 shadow-sm">
          <p class="text-xs font-bold text-blue-900 uppercase tracking-wider">Cakupan Nilai Rapor</p>
          <p class="text-3xl font-extrabold text-blue-800 mt-2 num-font">6 Smt</p>
          <p class="text-xs text-blue-700/80 mt-1 font-medium">K4 (1&2), K5 (1&2), K6 (1&2)</p>
        </div>
        <div class="bg-gradient-to-br from-white via-indigo-50/40 to-blue-100/60 p-5 rounded-2xl border border-blue-200 shadow-sm">
          <p class="text-xs font-bold text-indigo-900 uppercase tracking-wider">Rata-Rata Nilai Ijazah</p>
          <p id="stat-avg-score" class="text-3xl font-extrabold text-indigo-900 mt-2 num-font">-</p>
          <p class="text-xs text-indigo-700/80 mt-1 font-medium">Bobot: 60% Rapor + 40% Ujian</p>
        </div>
        <div class="bg-gradient-to-br from-white via-sky-50/40 to-cyan-50/70 p-5 rounded-2xl border border-blue-200 shadow-sm">
          <p class="text-xs font-bold text-blue-900 uppercase tracking-wider">Tingkat Kelulusan</p>
          <p id="stat-grad-rate" class="text-3xl font-extrabold text-blue-700 mt-2 num-font">0%</p>
          <p class="text-xs text-blue-800/80 mt-1 font-medium">Standar KKM Kelulusan >= 75.0</p>
        </div>
      </div>

      <!-- Action Cards (Blue Gradient) -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div class="bg-gradient-to-br from-white to-blue-50/40 p-5 rounded-2xl border border-blue-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 class="font-bold text-blue-950 text-base">Kelola Data Siswa</h3>
            <p class="text-xs text-slate-600 mt-1">Daftar siswa Kelas 6A, 6B, 6C, dan 6D lengkap dengan NIS, NISN, orang tua, dan tombol Tambah/Edit/Hapus/Cetak Rapor.</p>
          </div>
          <button onclick="switchTab('students')" class="mt-4 px-4 py-2.5 bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-xl text-xs font-semibold hover:from-blue-800 hover:to-indigo-800 transition">Buka Data Siswa</button>
        </div>
        <div class="bg-gradient-to-br from-white to-sky-50/40 p-5 rounded-2xl border border-blue-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 class="font-bold text-blue-950 text-base">Input Nilai 6 Semester</h3>
            <p class="text-xs text-slate-600 mt-1">Input nilai rapor 9 mata pelajaran untuk K4 Smt 1/2, K5 Smt 1/2, K6 Smt 1/2 dengan fitur isi cepat & simpan otomatis.</p>
          </div>
          <button onclick="switchTab('semesters')" class="mt-4 px-4 py-2.5 bg-gradient-to-r from-blue-700 via-sky-600 to-indigo-700 text-white rounded-xl text-xs font-semibold hover:from-blue-600 hover:to-indigo-600 transition">Input Nilai Rapor</button>
        </div>
        <div class="bg-gradient-to-br from-white to-indigo-50/40 p-5 rounded-2xl border border-blue-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 class="font-bold text-blue-950 text-base">Ujian Sekolah & Rekap Ijazah</h3>
            <p class="text-xs text-slate-600 mt-1">Input ujian tulis & praktek, cetak DKN (Daftar Kumpulan Nilai), dan cetak SKL (Surat Keterangan Lulus) per siswa.</p>
          </div>
          <button onclick="switchTab('graduation')" class="mt-4 px-4 py-2.5 bg-gradient-to-r from-indigo-800 to-blue-950 text-white rounded-xl text-xs font-semibold hover:from-indigo-700 hover:to-blue-900 transition">Buka Rekap Ijazah</button>
        </div>
      </div>
    </div>

    <!-- TAB 2: DATA SISWA -->
    <div id="tab-students" class="tab-content hidden space-y-4">
      <div class="bg-white p-5 rounded-2xl border border-blue-200 shadow-sm space-y-4">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <span class="text-xs font-semibold text-slate-700">Filter Kelas:</span>
            <select id="student-class-filter" onchange="renderStudentTable()" class="text-xs border border-blue-200 rounded-xl px-3 py-1.5 bg-white font-semibold text-blue-950">
              <option value="ALL">Semua Kelas (6A - 6D)</option>
              <option value="6A">Kelas 6A</option>
              <option value="6B">Kelas 6B</option>
              <option value="6C">Kelas 6C</option>
              <option value="6D">Kelas 6D</option>
            </select>
          </div>
          <div class="flex items-center gap-2">
            <input type="text" id="student-search" oninput="renderStudentTable()" placeholder="Cari nama / NISN / NIS..." class="text-xs border border-blue-200 rounded-xl px-3 py-1.5 w-64">
            <button onclick="openStudentModal()" class="px-3.5 py-1.5 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white text-xs font-semibold rounded-xl shadow-sm flex items-center gap-1">
              <span>+ Tambah Siswa</span>
            </button>
          </div>
        </div>
        <div class="overflow-x-auto border border-blue-200 rounded-xl">
          <table class="w-full text-left text-xs border-collapse">
            <thead class="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white font-semibold">
              <tr>
                <th class="py-2.5 px-3 border-r border-blue-800/60">No</th>
                <th class="py-2.5 px-3 border-r border-blue-800/60">Kelas</th>
                <th class="py-2.5 px-3 border-r border-blue-800/60">NIS / NISN</th>
                <th class="py-2.5 px-3 border-r border-blue-800/60">Nama Siswa</th>
                <th class="py-2.5 px-3 border-r border-blue-800/60">L/P</th>
                <th class="py-2.5 px-3 border-r border-blue-800/60">Tempat, Tgl Lahir</th>
                <th class="py-2.5 px-3 border-r border-blue-800/60">Orang Tua / Wali</th>
                <th class="py-2.5 px-3 text-center">Aksi & Rapor</th>
              </tr>
            </thead>
            <tbody id="student-table-body" class="divide-y divide-blue-100/70"></tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TAB 3: NILAI SEMESTER -->
    <div id="tab-semesters" class="tab-content hidden space-y-4">
      <div class="bg-white p-5 rounded-2xl border border-blue-200 shadow-sm space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div>
              <label class="text-xs text-slate-600 block mb-1 font-semibold">Pilih Semester:</label>
              <select id="sem-picker" onchange="renderSemesterGrades()" class="text-xs border border-blue-200 rounded-xl px-3 py-1.5 font-bold text-blue-950 bg-white">
                <option value="K4_S1">Kelas 4 Semester 1 (2024/2025)</option>
                <option value="K4_S2">Kelas 4 Semester 2 (2024/2025)</option>
                <option value="K5_S1">Kelas 5 Semester 1 (2025/2026)</option>
                <option value="K5_S2">Kelas 5 Semester 2 (2025/2026)</option>
                <option value="K6_S1" selected>Kelas 6 Semester 1 (2026/2027)</option>
                <option value="K6_S2">Kelas 6 Semester 2 (2026/2027)</option>
              </select>
            </div>
            <div>
              <label class="text-xs text-slate-600 block mb-1 font-semibold">Pilih Kelas:</label>
              <select id="sem-class-picker" onchange="renderSemesterGrades()" class="text-xs border border-blue-200 rounded-xl px-3 py-1.5 font-extrabold text-blue-950 bg-white">
                <option value="6A">Kelas 6A</option>
                <option value="6B">Kelas 6B</option>
                <option value="6C">Kelas 6C</option>
                <option value="6D">Kelas 6D</option>
              </select>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="bulkFillGrades(85)" class="px-3.5 py-1.5 border border-blue-200 bg-blue-50 text-blue-900 text-xs font-semibold rounded-xl">
              Isi Standar (85)
            </button>
            <button onclick="saveCurrentSemesterGrades()" class="px-4 py-2 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white text-xs font-semibold rounded-xl shadow-sm">
              Simpan Nilai Semester
            </button>
          </div>
        </div>
        <div class="overflow-x-auto border border-blue-200 rounded-xl">
          <table class="w-full text-left text-xs border-collapse">
            <thead class="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white font-semibold">
              <tr>
                <th class="py-2.5 px-3 border-r border-blue-800/60">No</th>
                <th class="py-2.5 px-3 border-r border-blue-800/60">Nama Siswa</th>
                <th class="py-2.5 px-2 border-r border-blue-800/60 text-center">PAI</th>
                <th class="py-2.5 px-2 border-r border-blue-800/60 text-center">PPKn</th>
                <th class="py-2.5 px-2 border-r border-blue-800/60 text-center">B.Indo</th>
                <th class="py-2.5 px-2 border-r border-blue-800/60 text-center">MTK</th>
                <th class="py-2.5 px-2 border-r border-blue-800/60 text-center">IPAS</th>
                <th class="py-2.5 px-2 border-r border-blue-800/60 text-center">SBdP</th>
                <th class="py-2.5 px-2 border-r border-blue-800/60 text-center">PJOK</th>
                <th class="py-2.5 px-2 border-r border-blue-800/60 text-center">B.Sunda</th>
                <th class="py-2.5 px-2 border-r border-blue-800/60 text-center">B.Ing</th>
                <th class="py-2.5 px-3 text-center bg-blue-950 font-bold">Rata-Rata</th>
              </tr>
            </thead>
            <tbody id="semester-table-body" class="divide-y divide-blue-100/70"></tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TAB 4: KELULUSAN & REKAP IJAZAH -->
    <div id="tab-graduation" class="tab-content hidden space-y-4">
      <div class="bg-white p-5 rounded-2xl border border-blue-200 shadow-sm space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 class="font-bold text-blue-950 text-base">Rekapitulasi Nilai Ijazah & Kelulusan Siswa Kelas 6</h2>
            <p class="text-xs text-blue-800/80">Bobot: 60% Nilai Rapor (6 Semester) + 40% Ujian Sekolah. KKM Kelulusan: >= 75.0</p>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="printDKN()" class="px-4 py-2 bg-gradient-to-r from-blue-900 to-indigo-900 hover:from-blue-800 hover:to-indigo-800 text-white text-xs font-semibold rounded-xl shadow-sm">
              Cetak DKN Ijazah
            </button>
          </div>
        </div>
        <div class="overflow-x-auto border border-blue-200 rounded-xl">
          <table class="w-full text-left text-xs border-collapse">
            <thead class="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white font-semibold">
              <tr>
                <th class="py-2.5 px-3 border-r border-blue-800/60">No</th>
                <th class="py-2.5 px-3 border-r border-blue-800/60">Kelas</th>
                <th class="py-2.5 px-3 border-r border-blue-800/60">NISN</th>
                <th class="py-2.5 px-3 border-r border-blue-800/60">Nama Siswa</th>
                <th class="py-2.5 px-3 border-r border-blue-800/60 text-center">Rata Rapor</th>
                <th class="py-2.5 px-3 border-r border-blue-800/60 text-center">Rata Ujian</th>
                <th class="py-2.5 px-3 border-r border-blue-800/60 text-center bg-blue-950 font-bold">Nilai Akhir</th>
                <th class="py-2.5 px-3 border-r border-blue-800/60 text-center">Predikat</th>
                <th class="py-2.5 px-3 border-r border-blue-800/60 text-center">Status</th>
                <th class="py-2.5 px-3 border-r border-blue-800/60 text-center">No. Seri Ijazah</th>
                <th class="py-2.5 px-3 text-center">Aksi Dokumen</th>
              </tr>
            </thead>
            <tbody id="graduation-table-body" class="divide-y divide-blue-100/70"></tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TAB 5: INTEGRASI EXCEL -->
    <div id="tab-excel" class="tab-content hidden space-y-6">
      <div class="bg-white p-6 rounded-2xl border border-blue-200 shadow-sm space-y-6">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 class="text-lg font-bold text-blue-950">Database Excel (.xlsx) SD Negeri Babelan Kota 01</h2>
            <p class="text-xs text-slate-500 mt-1">Aplikasi terintegrasi dengan format Microsoft Excel offline (.xlsx) bergaris rapi & bertema biru resmi.</p>
          </div>
          <!-- Explicit Prominent Button Impor Excel -->
          <button onclick="triggerExcelFileInput()" class="px-4 py-2.5 bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-800 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2 self-start md:self-auto transition">
            <svg class="w-4 h-4 text-sky-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
            <span>Impor Database Excel (.xlsx)</span>
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="p-5 border border-blue-200 rounded-2xl bg-gradient-to-br from-white via-sky-50/50 to-blue-50/80 space-y-3">
            <h3 class="font-bold text-blue-950 text-sm">Download Format Excel Lengkap</h3>
            <p class="text-xs text-slate-600">Export database berisi Data Siswa, Nilai 6 Semester K4-K6, Nilai Ujian, dan Rekap Ijazah dengan tabel bergaris & header biru.</p>
            <div class="flex flex-wrap gap-2 pt-1">
              <button onclick="exportExcelDatabase()" class="px-4 py-2.5 bg-gradient-to-r from-blue-700 to-indigo-700 text-white rounded-xl text-xs font-semibold hover:from-blue-600 hover:to-indigo-600 transition shadow-sm">
                Download Database .xlsx
              </button>
              <button onclick="downloadBlankTemplate()" class="px-3.5 py-2.5 bg-white border border-blue-300 text-blue-900 rounded-xl text-xs font-semibold hover:bg-blue-50 transition">
                Download Template Kosong
              </button>
            </div>
          </div>
          <div class="p-5 border border-blue-200 rounded-2xl bg-gradient-to-br from-white via-blue-50/50 to-indigo-50/80 space-y-3">
            <h3 class="font-bold text-indigo-950 text-sm">Upload & Impor File Excel</h3>
            <p class="text-xs text-slate-600">Unggah file database .xlsx untuk memperbarui data siswa dan nilai secara instan.</p>
            
            <div class="mt-2 border-2 border-dashed border-blue-300 hover:border-blue-500 bg-white/90 p-4 rounded-xl text-center cursor-pointer" onclick="triggerExcelFileInput()">
              <p class="text-xs font-bold text-blue-950">Klik di sini untuk Memilih File Excel (.xlsx / .xls)</p>
              <p class="text-[11px] text-slate-400 mt-0.5">Sistem otomatis mendeteksi kolom NISN & nilai</p>
              <button type="button" class="mt-2 px-3.5 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-900 font-bold rounded-lg text-xs">Pilih File Sekarang</button>
            </div>
            <input type="file" id="excel-file-input" onchange="handleExcelUpload(event)" accept=".xlsx, .xls" class="hidden">
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Interactive Floating Toast Container -->
  <div id="toast-container" class="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-md w-full no-print px-4"></div>

  <!-- Modal Dialog Hasil Impor Excel -->
  <div id="import-success-modal" class="fixed inset-0 z-50 hidden flex items-center justify-center p-4 bg-blue-950/70 backdrop-blur-xs no-print">
    <div class="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-blue-200 overflow-hidden flex flex-col">
      <div class="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white p-6 text-center">
        <div class="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-sky-400 via-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-lg ring-4 ring-sky-300/30 mb-3">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
        </div>
        <h3 class="font-extrabold text-lg text-white">Impor Database Berhasil!</h3>
        <p class="text-xs text-blue-200 mt-1">Data dari file Excel telah berhasil dimuat ke dalam aplikasi.</p>
      </div>
      <div class="p-6 space-y-4">
        <div class="p-3 bg-blue-50 rounded-xl border border-blue-100 text-xs">
          <span class="text-slate-500 block text-[11px]">Nama File:</span>
          <span id="import-modal-filename" class="font-bold text-blue-950 truncate block">Database.xlsx</span>
        </div>
        <div class="grid grid-cols-2 gap-3 text-xs">
          <div class="p-3 rounded-xl border border-blue-100 bg-white">
            <span class="text-blue-800 font-semibold block">Data Siswa</span>
            <span id="import-modal-students" class="text-2xl font-extrabold text-blue-950 num-font block mt-1">0</span>
          </div>
          <div class="p-3 rounded-xl border border-blue-100 bg-white">
            <span class="text-sky-800 font-semibold block">Nilai Semester</span>
            <span id="import-modal-grades" class="text-2xl font-extrabold text-blue-950 num-font block mt-1">0</span>
          </div>
        </div>
        <button onclick="closeImportSuccessModal()" class="w-full py-2.5 bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-800 text-white rounded-xl text-xs font-bold shadow-md transition">Lihat Data Siswa Sekarang</button>
      </div>
    </div>
  </div>

  <script>
    var STORAGE_KEY = 'BAKOT01_DATA_STORE_EMPTY_V2';
    var APP_STATE = {
      school: {
        name: 'SD NEGERI BABELAN KOTA 01',
        academicYear: '2026/2027',
        reportWeight: 60,
        examWeight: 40,
        passingGrade: 75.0
      },
      students: [],
      grades: {},
      exams: {}
    };

    function showToast(title, message, type) {
      type = type || 'success';
      var container = document.getElementById('toast-container');
      if (!container) return;

      var toast = document.createElement('div');
      toast.className = 'relative overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-md transition-all duration-300 transform translate-y-0 text-white ' +
        (type === 'success' ? 'bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 border-blue-400/40 shadow-blue-950/50' :
         type === 'error' ? 'bg-gradient-to-br from-slate-900 via-rose-950 to-slate-950 border-rose-500/40 shadow-rose-950/40' :
         'bg-gradient-to-br from-slate-900 via-slate-850 to-blue-950 border-sky-400/40 shadow-slate-950/50');

      var accentColor = (type === 'success' ? 'from-sky-400 via-blue-500 to-indigo-400' : type === 'error' ? 'from-rose-400 to-amber-500' : 'from-cyan-400 to-blue-500');
      var iconHtml = type === 'success' ? '<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>' :
        type === 'error' ? '<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>' :
        '<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>';

      toast.innerHTML = '<div class="h-1 w-full bg-gradient-to-r ' + accentColor + '"></div>' +
        '<div class="p-4 flex items-start gap-3.5">' +
          '<div class="p-2 rounded-xl shrink-0 shadow-md bg-gradient-to-tr from-sky-400 to-blue-600 text-white">' + iconHtml + '</div>' +
          '<div class="flex-1 pr-2">' +
            '<h4 class="font-bold text-sm text-white">' + title + '</h4>' +
            (message ? '<p class="mt-1 text-xs text-blue-100 font-normal leading-relaxed">' + message + '</p>' : '') +
          '</div>' +
          '<button onclick="this.parentElement.parentElement.remove()" class="text-slate-400 hover:text-white p-1">&times;</button>' +
        '</div>';

      container.appendChild(toast);
      setTimeout(function() {
        if (toast && toast.parentElement) toast.remove();
      }, 4000);
    }

    function triggerExcelFileInput() {
      var input = document.getElementById('excel-file-input');
      if (input) input.click();
    }

    function closeImportSuccessModal() {
      document.getElementById('import-success-modal').classList.add('hidden');
      switchTab('students');
    }

    function loadPersistedState() {
      try {
        var local = localStorage.getItem(STORAGE_KEY);
        if (local) {
          var parsed = JSON.parse(local);
          if (parsed && Array.isArray(parsed.students)) {
            APP_STATE = parsed;
            return;
          }
        }
      } catch (e) {
        console.error('Error loading localStorage:', e);
      }
    }

    function persistState() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(APP_STATE));
        if (typeof google !== 'undefined' && google.script && google.script.run) {
          google.script.run.saveAllData(JSON.stringify(APP_STATE));
        }
      } catch (e) {
        console.error('Error saving state:', e);
      }
    }

    function switchTab(tabId) {
      document.querySelectorAll('.tab-content').forEach(function(el) { el.classList.add('hidden'); });
      document.querySelectorAll('.tab-btn').forEach(function(btn) {
        btn.classList.remove('text-white', 'bg-gradient-to-r', 'from-blue-700', 'via-blue-800', 'to-indigo-800', 'shadow-md');
        btn.classList.add('text-slate-600', 'font-medium');
      });
      document.getElementById('tab-' + tabId).classList.remove('hidden');
      var activeBtn = document.getElementById('btn-' + tabId);
      activeBtn.classList.add('text-white', 'bg-gradient-to-r', 'from-blue-700', 'via-blue-800', 'to-indigo-800', 'shadow-md');
      activeBtn.classList.remove('text-slate-600');
    }

    function renderStudentTable() {
      var filterClass = document.getElementById('student-class-filter').value;
      var q = (document.getElementById('student-search').value || '').toLowerCase();
      var tbody = document.getElementById('student-table-body');
      tbody.innerHTML = '';

      var filtered = APP_STATE.students.filter(function(s) {
        var matchClass = (filterClass === 'ALL' || s.classRoom === filterClass);
        var matchQ = !q || s.name.toLowerCase().indexOf(q) !== -1 || s.nisn.indexOf(q) !== -1 || s.nis.indexOf(q) !== -1;
        return matchClass && matchQ;
      });

      if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colSpan="8" class="py-10 text-center text-slate-400 font-medium">Belum ada data siswa. Klik "+ Tambah Siswa" atau "Impor Excel" untuk memulai.</td></tr>';
      } else {
        filtered.forEach(function(s, idx) {
          var tr = document.createElement('tr');
          tr.className = 'hover:bg-blue-50/50';
          tr.innerHTML = '<td class="py-2.5 px-3 border-r border-blue-100 num-font text-center">' + (idx + 1) + '</td>' +
            '<td class="py-2.5 px-3 border-r border-blue-100 font-bold text-blue-900 text-center">' + s.classRoom + '</td>' +
            '<td class="py-2.5 px-3 border-r border-blue-100 num-font">' + s.nis + ' / ' + s.nisn + '</td>' +
            '<td class="py-2.5 px-3 border-r border-blue-100 font-semibold text-slate-900">' + s.name + '</td>' +
            '<td class="py-2.5 px-3 border-r border-blue-100 text-center font-bold text-blue-800">' + s.gender + '</td>' +
            '<td class="py-2.5 px-3 border-r border-blue-100">' + s.birthPlace + ', ' + s.birthDate + '</td>' +
            '<td class="py-2.5 px-3 border-r border-blue-100">' + s.parentName + '</td>' +
            '<td class="py-2.5 px-3 text-center space-x-1.5">' +
              '<button onclick="viewReport(\\'' + s.id + '\\')" class="px-2.5 py-1 bg-blue-100 text-blue-900 hover:bg-blue-200 rounded-lg text-xs font-semibold">Lihat Rapor</button>' +
              '<button onclick="editStudent(\\'' + s.id + '\\')" class="px-2 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs">Edit</button>' +
              '<button onclick="deleteStudent(\\'' + s.id + '\\')" class="px-2 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-xs">Hapus</button>' +
            '</td>';
          tbody.appendChild(tr);
        });
      }

      document.getElementById('stat-total-students').innerText = APP_STATE.students.length;
      var emptyBanner = document.getElementById('empty-state-banner');
      if (emptyBanner) {
        if (APP_STATE.students.length === 0) emptyBanner.classList.remove('hidden');
        else emptyBanner.classList.add('hidden');
      }
    }

    function renderSemesterGrades() {
      var sem = document.getElementById('sem-picker').value;
      var cls = document.getElementById('sem-class-picker').value;
      var tbody = document.getElementById('semester-table-body');
      tbody.innerHTML = '';

      var students = APP_STATE.students.filter(function(s) { return s.classRoom === cls; });
      if (students.length === 0) {
        tbody.innerHTML = '<tr><td colSpan="12" class="py-10 text-center text-slate-400 font-medium">Belum ada siswa di Kelas ' + cls + '.</td></tr>';
        return;
      }

      students.forEach(function(s, idx) {
        var g = (APP_STATE.grades[s.id] && APP_STATE.grades[s.id][sem]) || {};
        var tr = document.createElement('tr');
        tr.className = 'hover:bg-blue-50/40';
        
        var total = (g.pai||0) + (g.ppkn||0) + (g.bindo||0) + (g.mtk||0) + (g.ipas||0) + (g.sbdp||0) + (g.pjok||0) + (g.sunda||0) + (g.bing||0);
        var avg = (total / 9).toFixed(1);

        var subjects = ['pai','ppkn','bindo','mtk','ipas','sbdp','pjok','sunda','bing'];
        var inputsHtml = subjects.map(function(sub) {
          return '<td class="py-2 px-2 border-r border-blue-100 text-center num-font"><input type="number" min="0" max="100" class="w-12 text-center border border-blue-200 rounded-lg py-1 font-semibold text-blue-950" value="' + (g[sub]||0) + '" onchange="updateGrade(\\'' + s.id + '\\', \\'' + sem + '\\', \\'' + sub + '\\', this.value)"></td>';
        }).join('');

        tr.innerHTML = '<td class="py-2 px-3 border-r border-blue-100 num-font text-center">' + (idx + 1) + '</td>' +
          '<td class="py-2 px-3 border-r border-blue-100 font-semibold text-slate-900">' + s.name + '</td>' +
          inputsHtml +
          '<td class="py-2 px-3 text-center font-extrabold text-blue-950 num-font bg-blue-100/60" id="avg-' + s.id + '-' + sem + '">' + avg + '</td>';
        tbody.appendChild(tr);
      });
    }

    function updateGrade(studentId, sem, subject, val) {
      if (!APP_STATE.grades[studentId]) APP_STATE.grades[studentId] = {};
      if (!APP_STATE.grades[studentId][sem]) APP_STATE.grades[studentId][sem] = {};
      APP_STATE.grades[studentId][sem][subject] = Number(val) || 0;
      var g = APP_STATE.grades[studentId][sem];
      var total = (g.pai||0) + (g.ppkn||0) + (g.bindo||0) + (g.mtk||0) + (g.ipas||0) + (g.sbdp||0) + (g.pjok||0) + (g.sunda||0) + (g.bing||0);
      var avgEl = document.getElementById('avg-' + studentId + '-' + sem);
      if (avgEl) avgEl.innerText = (total / 9).toFixed(1);
    }

    function saveCurrentSemesterGrades() {
      persistState();
      showToast('Nilai Semester Berhasil Disimpan!', 'Perubahan nilai siswa tersimpan aman.', 'success');
      renderSemesterGrades();
      renderGraduationTable();
    }

    function bulkFillGrades(val) {
      var sem = document.getElementById('sem-picker').value;
      var cls = document.getElementById('sem-class-picker').value;
      APP_STATE.students.filter(function(s){ return s.classRoom === cls; }).forEach(function(s) {
        if (!APP_STATE.grades[s.id]) APP_STATE.grades[s.id] = {};
        if (!APP_STATE.grades[s.id][sem]) APP_STATE.grades[s.id][sem] = {};
        ['pai','ppkn','bindo','mtk','ipas','sbdp','pjok','sunda','bing'].forEach(function(sub) {
          if (!APP_STATE.grades[s.id][sem][sub]) {
            APP_STATE.grades[s.id][sem][sub] = val;
          }
        });
      });
      renderSemesterGrades();
      showToast('Isi Cepat Berhasil!', 'Nilai standar (' + val + ') diterapkan untuk siswa yang kosong.', 'success');
    }

    function renderGraduationTable() {
      var tbody = document.getElementById('graduation-table-body');
      tbody.innerHTML = '';
      if (APP_STATE.students.length === 0) {
        tbody.innerHTML = '<tr><td colSpan="11" class="py-10 text-center text-slate-400 font-medium">Belum ada data siswa untuk rekap kelulusan.</td></tr>';
        document.getElementById('stat-avg-score').innerText = '-';
        document.getElementById('stat-grad-rate').innerText = '0%';
        return;
      }

      var grandFinalTotal = 0;
      var passedCount = 0;

      APP_STATE.students.forEach(function(s, idx) {
        var sems = ['K4_S1','K4_S2','K5_S1','K5_S2','K6_S1','K6_S2'];
        var grandTotal = 0;
        var count = 0;
        sems.forEach(function(sem) {
          var g = (APP_STATE.grades[s.id] && APP_STATE.grades[s.id][sem]) || {};
          ['pai','ppkn','bindo','mtk','ipas','sbdp','pjok','sunda','bing'].forEach(function(sub) {
            grandTotal += (g[sub] || 0);
            count++;
          });
        });
        var avgRapor = (count > 0 ? (grandTotal / count) : 0).toFixed(1);

        var ex = APP_STATE.exams[s.id] || {};
        var exTotal = 0;
        var exCount = 0;
        ['pai','ppkn','bindo','mtk','ipas','sbdp','pjok','sunda','bing'].forEach(function(sub) {
          exTotal += (ex[sub] ? ex[sub].finalExam : 0);
          exCount++;
        });
        var avgExam = (exTotal / exCount).toFixed(1);
        var finalScore = ((avgRapor * 0.6) + (avgExam * 0.4)).toFixed(1);
        grandFinalTotal += Number(finalScore);

        var isPassed = Number(finalScore) >= 75.0;
        if (isPassed) passedCount++;

        var status = isPassed ? '<span class="text-blue-900 font-bold bg-blue-100 px-2 py-0.5 rounded">LULUS</span>' : '<span class="text-rose-700 font-bold bg-rose-100 px-2 py-0.5 rounded">BELUM LULUS</span>';
        var serial = s.ijazahSerial || ('DN-02/D-SD/27/' + s.classRoom + '/' + String(idx + 1).padStart(4, '0'));

        var tr = document.createElement('tr');
        tr.className = 'hover:bg-blue-50/40';
        tr.innerHTML = '<td class="py-2.5 px-3 border-r border-blue-100 num-font text-center">' + (idx + 1) + '</td>' +
          '<td class="py-2.5 px-3 border-r border-blue-100 font-bold text-blue-900 text-center">' + s.classRoom + '</td>' +
          '<td class="py-2.5 px-3 border-r border-blue-100 num-font text-center">' + s.nisn + '</td>' +
          '<td class="py-2.5 px-3 border-r border-blue-100 font-semibold text-slate-900">' + s.name + '</td>' +
          '<td class="py-2.5 px-3 border-r border-blue-100 text-center num-font">' + avgRapor + '</td>' +
          '<td class="py-2.5 px-3 border-r border-blue-100 text-center num-font">' + avgExam + '</td>' +
          '<td class="py-2.5 px-3 border-r border-blue-100 text-center font-extrabold text-blue-950 num-font bg-blue-100/50">' + finalScore + '</td>' +
          '<td class="py-2.5 px-3 border-r border-blue-100 text-center">Baik</td>' +
          '<td class="py-2.5 px-3 border-r border-blue-100 text-center">' + status + '</td>' +
          '<td class="py-2.5 px-3 border-r border-blue-100 text-center num-font"><input type="text" value="' + serial + '" onchange="updateSerial(\\'' + s.id + '\\', this.value)" class="text-xs border border-blue-200 rounded-lg px-2 py-1 w-44 text-center font-medium"></td>' +
          '<td class="py-2.5 px-3 text-center">' +
            '<button onclick="printSKL(\\'' + s.id + '\\')" class="px-2.5 py-1 bg-gradient-to-r from-blue-700 to-indigo-700 text-white rounded-lg text-xs font-semibold">Cetak SKL</button>' +
          '</td>';
        tbody.appendChild(tr);
      });

      document.getElementById('stat-avg-score').innerText = (grandFinalTotal / APP_STATE.students.length).toFixed(1);
      document.getElementById('stat-grad-rate').innerText = ((passedCount / APP_STATE.students.length) * 100).toFixed(0) + '%';
    }

    function updateSerial(studentId, val) {
      var s = APP_STATE.students.find(function(item){ return item.id === studentId; });
      if (s) {
        s.ijazahSerial = val;
        persistState();
      }
    }

    // Export database with ExcelJS with styled blue headers and full cell borders
    async function exportExcelDatabase() {
      if (typeof ExcelJS === 'undefined') {
        alert('Library ExcelJS belum siap. Membuka versi cadangan.');
        return;
      }
      var wb = new ExcelJS.Workbook();
      wb.creator = 'SD NEGERI BABELAN KOTA 01';

      var NAVY = 'FF1E3A8A';
      var BLUE = 'FF2563EB';
      var LIGHT = 'FFDBEAFE';
      var ICE = 'FFF0F9FF';
      var BORDER = 'FF94A3B8';
      var thinBorder = {
        top: { style: 'thin', color: { argb: BORDER } },
        left: { style: 'thin', color: { argb: BORDER } },
        bottom: { style: 'thin', color: { argb: BORDER } },
        right: { style: 'thin', color: { argb: BORDER } }
      };

      // Sheet 1: DATA SISWA
      var ws1 = wb.addWorksheet('DATA SISWA');
      ws1.mergeCells('A1:J1');
      ws1.getCell('A1').value = 'SD NEGERI BABELAN KOTA 01 - KECAMATAN BABELAN, KABUPATEN BEKASI';
      ws1.getCell('A1').font = { size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
      ws1.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY } };
      ws1.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
      ws1.getRow(1).height = 28;

      ws1.mergeCells('A2:J2');
      ws1.getCell('A2').value = 'DATABASE INDUK PESERTA DIDIK KELAS 6 - TP 2026/2027';
      ws1.getCell('A2').font = { size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
      ws1.getCell('A2').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BLUE } };
      ws1.getCell('A2').alignment = { horizontal: 'center', vertical: 'middle' };
      ws1.getRow(2).height = 20;

      var headers1 = ['No', 'Kelas', 'NIS', 'NISN', 'Nama Lengkap Siswa', 'L/P', 'Tempat Lahir', 'Tanggal Lahir', 'Orang Tua / Wali', 'No. Seri Ijazah'];
      var hRow1 = ws1.getRow(4);
      hRow1.values = headers1;
      hRow1.height = 24;
      headers1.forEach(function(_, idx) {
        var c = hRow1.getCell(idx + 1);
        c.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY } };
        c.alignment = { horizontal: 'center', vertical: 'middle' };
        c.border = thinBorder;
      });

      ws1.columns = [{width:6},{width:8},{width:12},{width:16},{width:32},{width:8},{width:18},{width:15},{width:25},{width:26}];

      APP_STATE.students.forEach(function(s, idx) {
        var row = ws1.getRow(idx + 5);
        row.values = [idx + 1, s.classRoom, s.nis, s.nisn, s.name, s.gender, s.birthPlace, s.birthDate, s.parentName, s.ijazahSerial || ''];
        row.height = 20;
        row.eachCell({ includeEmpty: true }, function(cell) {
          cell.border = thinBorder;
          if (idx % 2 === 1) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ICE } };
        });
      });

      var buffer = await wb.xlsx.writeBuffer();
      var blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      var url = URL.createObjectURL(blob);
      var link = document.createElement('a');
      link.href = url;
      link.download = 'Database_Nilai_SDN_Babelan_Kota_01_2026_2027.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast('Database Excel (.xlsx) Berhasil Diunduh!', 'File dengan format tabel bergaris & header biru resmi.', 'success');
    }

    async function downloadBlankTemplate() {
      if (typeof ExcelJS === 'undefined') return;
      var wb = new ExcelJS.Workbook();
      var ws = wb.addWorksheet('FORMAT_DATA_SISWA');
      ws.mergeCells('A1:I1');
      ws.getCell('A1').value = 'FORMAT DATA SISWA SD NEGERI BABELAN KOTA 01';
      ws.getCell('A1').font = { size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
      ws.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
      ws.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
      ws.getRow(1).height = 28;

      var headers = ['Kelas (6A/6B/6C/6D)', 'NIS', 'NISN (10 Digit)', 'Nama Lengkap Siswa', 'Jenis Kelamin (L/P)', 'Tempat Lahir', 'Tanggal Lahir (YYYY-MM-DD)', 'Nama Orang Tua / Wali', 'No. Seri Ijazah (Opsional)'];
      var hRow = ws.getRow(3);
      hRow.values = headers;
      hRow.height = 24;
      headers.forEach(function(_, idx) {
        var c = hRow.getCell(idx + 1);
        c.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
        c.alignment = { horizontal: 'center', vertical: 'middle' };
      });
      ws.columns = [{width:20},{width:14},{width:18},{width:32},{width:18},{width:18},{width:24},{width:26},{width:26}];

      var buffer = await wb.xlsx.writeBuffer();
      var blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      var url = URL.createObjectURL(blob);
      var link = document.createElement('a');
      link.href = url;
      link.download = 'Template_Input_Excel_SDN_Babelan_Kota_01.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast('Template Kosong Berhasil Diunduh!', 'Format tabel siap diisi guru.', 'success');
    }

    function handleExcelUpload(e) {
      var file = e.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function(evt) {
        try {
          var data = new Uint8Array(evt.target.result);
          var wb = XLSX.read(data, { type: 'array' });
          var sheet = wb.Sheets[wb.SheetNames[0]];
          var rows = XLSX.utils.sheet_to_json(sheet, { range: 3 });
          if (!rows || rows.length === 0) rows = XLSX.utils.sheet_to_json(sheet);
          if (rows && rows.length > 0) {
            var newStudents = [];
            rows.forEach(function(r, idx) {
              var name = r['Nama Lengkap Siswa'] || r['Nama Siswa'] || r['Nama'] || r['nama'];
              if (name && !String(name).toLowerCase().includes('contoh')) {
                newStudents.push({
                  id: 'std-' + (Date.now() + idx),
                  classRoom: r['Kelas'] || r['Kelas (6A/6B/6C/6D)'] || '6A',
                  nis: r['NIS'] || ('' + (2100 + idx)),
                  nisn: r['NISN'] || r['NISN (10 Digit)'] || ('013' + idx),
                  name: name,
                  gender: (r['L/P'] || r['Jenis Kelamin (L/P)'] || 'L').startsWith('P') ? 'P' : 'L',
                  birthPlace: r['Tempat Lahir'] || 'Bekasi',
                  birthDate: r['Tanggal Lahir'] || r['Tanggal Lahir (YYYY-MM-DD)'] || '2014-05-15',
                  parentName: r['Nama Orang Tua / Wali'] || r['Orang Tua / Wali'] || '-',
                  ijazahSerial: r['No. Seri Ijazah'] || r['No Seri Ijazah'] || ''
                });
              }
            });
            if (newStudents.length > 0) {
              APP_STATE.students = newStudents;
              persistState();
              renderStudentTable();
              renderSemesterGrades();
              renderGraduationTable();

              // Update & Show Modal
              document.getElementById('import-modal-filename').innerText = file.name;
              document.getElementById('import-modal-students').innerText = newStudents.length;
              document.getElementById('import-modal-grades').innerText = Object.keys(APP_STATE.grades).length;
              document.getElementById('import-success-modal').classList.remove('hidden');

              showToast('Impor File Excel Berhasil!', 'Berhasil membaca ' + newStudents.length + ' data siswa ke sistem.', 'success');
            } else {
              showToast('Tidak Ada Data Terbaca', 'Pastikan format kolom sesuai dengan template Excel.', 'error');
            }
          }
        } catch (err) {
          showToast('Gagal Membaca Excel', err.message, 'error');
        }
      };
      reader.readAsArrayBuffer(file);
    }

    function viewReport(studentId) {
      showToast('Membuka Rapor', 'Memuat lembar rapor siswa...', 'info');
    }

    function printSKL(studentId) {
      showToast('Menyiapkan SKL', 'Membuka Surat Keterangan Lulus...', 'info');
    }

    function printDKN() {
      window.print();
    }

    function openStudentModal() {
      var name = prompt('Masukkan Nama Siswa Baru:');
      if (!name) return;
      var nisn = prompt('Masukkan NISN (10 Digit):', '013' + Math.floor(1000000 + Math.random() * 9000000));
      var cls = prompt('Masukkan Kelas (6A/6B/6C/6D):', '6A') || '6A';
      var newStudent = {
        id: 'std-' + Date.now(),
        nis: '' + (2100 + APP_STATE.students.length + 1),
        nisn: nisn || '0130000000',
        name: name,
        gender: 'L',
        classRoom: cls,
        birthPlace: 'Bekasi',
        birthDate: '2014-05-15',
        parentName: 'Orang Tua'
      };
      APP_STATE.students.push(newStudent);
      persistState();
      renderStudentTable();
      renderSemesterGrades();
      renderGraduationTable();
      showToast('Siswa Berhasil Ditambahkan!', name + ' (' + cls + ')', 'success');
    }

    function editStudent(studentId) {
      var s = APP_STATE.students.find(function(item){ return item.id === studentId; });
      if (!s) return;
      var newName = prompt('Ubah Nama Siswa:', s.name);
      if (newName) {
        s.name = newName;
        persistState();
        renderStudentTable();
        showToast('Data Siswa Diperbarui!', s.name, 'success');
      }
    }

    function deleteStudent(studentId) {
      var s = APP_STATE.students.find(function(item){ return item.id === studentId; });
      if (confirm('Yakin ingin menghapus data siswa ini?')) {
        APP_STATE.students = APP_STATE.students.filter(function(item){ return item.id !== studentId; });
        persistState();
        renderStudentTable();
        renderSemesterGrades();
        renderGraduationTable();
        showToast('Siswa Dihapus', s ? s.name : '', 'info');
      }
    }

    window.addEventListener('DOMContentLoaded', function() {
      loadPersistedState();
      renderStudentTable();
      renderSemesterGrades();
      renderGraduationTable();
    });
  </script>
</body>
</html>
`;
