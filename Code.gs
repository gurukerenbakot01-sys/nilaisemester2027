/**
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

/**
 * Opsi Tambahan: Membuat Google Spreadsheet baru di Google Drive dengan tabel bergaris & header biru
 */
function createGoogleSheetsBackup(payloadJson) {
  try {
    var data = JSON.parse(payloadJson);
    var ss = SpreadsheetApp.create('Database_Nilai_SDN_Babelan_Kota_01_' + Utilities.formatDate(new Date(), 'Asia/Jakarta', 'yyyyMMdd_HHmmss'));
    var sheet = ss.getActiveSheet();
    sheet.setName('DATA SISWA');

    // Header Title Banner
    sheet.getRange('A1:J1').merge()
      .setValue('SD NEGERI BABELAN KOTA 01 - KECAMATAN BABELAN, KABUPATEN BEKASI')
      .setBackground('#1E3A8A')
      .setFontColor('#FFFFFF')
      .setFontWeight('bold')
      .setFontSize(12)
      .setHorizontalAlignment('center');

    sheet.getRange('A2:J2').merge()
      .setValue('DATA INDUK PESERTA DIDIK KELAS 6 - TP 2026/2027')
      .setBackground('#2563EB')
      .setFontColor('#FFFFFF')
      .setFontWeight('bold')
      .setFontSize(10)
      .setHorizontalAlignment('center');

    // Table Headers
    var headers = ['No', 'Kelas', 'NIS', 'NISN', 'Nama Lengkap Siswa', 'L/P', 'Tempat Lahir', 'Tanggal Lahir', 'Orang Tua / Wali', 'No. Seri Ijazah'];
    var hRange = sheet.getRange(4, 1, 1, headers.length);
    hRange.setValues([headers])
      .setBackground('#1E3A8A')
      .setFontColor('#FFFFFF')
      .setFontWeight('bold')
      .setHorizontalAlignment('center')
      .setBorder(true, true, true, true, true, true, '#1E3A8A', SpreadsheetApp.BorderStyle.SOLID_MEDIUM);

    // Rows
    if (data.students && data.students.length > 0) {
      var rows = [];
      for (var i = 0; i < data.students.length; i++) {
        var s = data.students[i];
        rows.push([
          i + 1,
          s.classRoom || '',
          s.nis || '',
          s.nisn || '',
          s.name || '',
          s.gender || '',
          s.birthPlace || '',
          s.birthDate || '',
          s.parentName || '',
          s.ijazahSerial || ''
        ]);
      }
      var dataRange = sheet.getRange(5, 1, rows.length, headers.length);
      dataRange.setValues(rows)
        .setFontFamily('Calibri')
        .setFontSize(10)
        .setBorder(true, true, true, true, true, true, '#94A3B8', SpreadsheetApp.BorderStyle.SOLID);

      // Zebra striping
      for (var r = 0; r < rows.length; r++) {
        if (r % 2 === 1) {
          sheet.getRange(5 + r, 1, 1, headers.length).setBackground('#F0F9FF');
        }
      }
    }

    return { success: true, url: ss.getUrl() };
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}
