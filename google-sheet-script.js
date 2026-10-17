/**
 * ============================================================
 * GOOGLE APPS SCRIPT — WAVE KUNJIR (TSUNAMIAI)
 * Skrip untuk menerima data login pengguna otomatis ke Google Sheets
 * ============================================================
 * 
 * PANDUAN PEMASANGAN (Hanya 3 Langkah Mudah):
 * 1. Buka https://sheets.google.com dan buat Spreadsheet baru dengan judul:
 *    "Data Akun Pengguna - WAVE KUNJIR"
 * 
 * 2. Di menu atas Google Sheets, klik:
 *    Ekstensi (Extensions) > Apps Script
 *    Hapus kode yang ada, lalu COPY-PASTE seluruh kode di file ini ke dalamnya.
 * 
 * 3. Klik tombol biru "Deploy" (Terapkan) > "New deployment" (Penerapan baru)
 *    - Pilih jenis: "Web app" (Aplikasi web)
 *    - Description: "Webhook Akun Wave Kunjir"
 *    - Execute as: "Me" (Saya)
 *    - Who has access: "Anyone" (Siapa saja)
 *    - Klik Deploy & Berikan Izin Akses (Authorize).
 * 
 * 4. Salin URL Web App yang didapat (contoh: https://script.google.com/macros/s/.../exec)
 *    lalu tempelkan ke form "Webhook URL" di tombol Spreadsheet di Dashboard web!
 */

function setupSpreadsheet() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  sheet.setName("Pengguna_TsunamiAI");
  
  // Format Header Kolom
  var headers = [
    ["ID", "Nama Lengkap", "Email Google", "Peran / Role", "No. WhatsApp", "Waktu Login / Registrasi", "Status Akun"]
  ];
  
  var range = sheet.getRange(1, 1, 1, 7);
  range.setValues(headers);
  range.setFontWeight("bold");
  range.setBackground("#059669"); // Hijau Google Sheet
  range.setFontColor("#FFFFFF");
  range.setHorizontalAlignment("center");
  
  // Auto-resize kolom
  sheet.autoResizeColumns(1, 7);
}

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Pengguna_TsunamiAI") || ss.getActiveSheet();
    
    // Pastikan header ada jika baris pertama kosong
    if (sheet.getLastRow() === 0) {
      setupSpreadsheet();
    }
    
    var data;
    if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else {
      data = e.parameter;
    }
    
    var id = data.id || ("USR-" + Utilities.formatDate(new Date(), "GMT+7", "yyyyMMdd-HHmmss"));
    var nama = data.nama || "Pengguna Google";
    var email = data.email || "-";
    var role = data.role || "Warga Desa Kunjir";
    var wa = data.wa || "-";
    var waktu = data.waktu || Utilities.formatDate(new Date(), "GMT+7", "dd/MM/yyyy HH:mm:ss") + " WIB";
    var status = data.status || "Terverifikasi Google";
    
    // Cek apakah email sudah terdaftar sebelumnya untuk update waktu login
    var lastRow = sheet.getLastRow();
    var emailExists = false;
    
    if (lastRow > 1) {
      var emailValues = sheet.getRange(2, 3, lastRow - 1, 1).getValues();
      for (var i = 0; i < emailValues.length; i++) {
        if (emailValues[i][0] === email) {
          // Update baris waktu login terakhir
          sheet.getRange(i + 2, 6).setValue(waktu);
          emailExists = true;
          break;
        }
      }
    }
    
    // Jika belum ada, tambahkan baris baru
    if (!emailExists) {
      sheet.appendRow([id, nama, email, role, wa, waktu, status]);
      
      // Berikan style border tipis
      var newRow = sheet.getLastRow();
      var rowRange = sheet.getRange(newRow, 1, 1, 7);
      rowRange.setFontFamily("Arial");
      rowRange.setFontSize(10);
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({ status: "success", message: "Data akun berhasil disimpan ke Google Sheets", id: id }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Pengguna_TsunamiAI") || ss.getActiveSheet();
  var lastRow = sheet.getLastRow();
  
  if (lastRow <= 1) {
    return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
  }
  
  var values = sheet.getRange(2, 1, lastRow - 1, 7).getValues();
  var users = values.map(function(row) {
    return {
      id: row[0],
      nama: row[1],
      email: row[2],
      role: row[3],
      wa: row[4],
      waktu: row[5],
      status: row[6]
    };
  });
  
  return ContentService
    .createTextOutput(JSON.stringify(users))
    .setMimeType(ContentService.MimeType.JSON);
}
