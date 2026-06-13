/**
 * GOOGLE APPS SCRIPT (GAS) MIDDLEWARE BOILERPLATE
 * 
 * Skrip ini bertindak sebagai API serverless untuk menerima data dari React
 * dan menyimpannya ke Google Sheets.
 * 
 * Pengaturan:
 * 1. Buat Google Spreadsheet baru.
 * 2. Buat dua sheet baru di dalamnya dengan nama "Sheet_Keuangan" dan "Sheet_Audit_Stok".
 * 3. Buka Extensi > Apps Script, tempel kode ini di Code.gs.
 * 4. Ganti SECRET_TOKEN di bawah ini dengan token aman Anda (harus sama dengan .env).
 * 5. Terapkan (Deploy) sebagai Web App dengan akses: "Anyone" (Siapa saja).
 */

const SECRET_TOKEN = "mrp_secret_token_123456";

/**
 * Handle HTTP POST Request dari React
 */
function doPost(e) {
  try {
    // 1. Parsing payload request
    const requestData = JSON.parse(e.postData.contents);
    const clientToken = requestData.token;
    const action = requestData.action;
    const data = requestData.data;

    // 2. Validasi Token Keamanan (Simple Token Validation)
    if (!clientToken || clientToken !== SECRET_TOKEN) {
      return jsonResponse({
        status: "error",
        message: "Unauthorized: Token keamanan tidak valid atau tidak disertakan."
      }, 401);
    }

    // 3. Membuka Active Spreadsheet
    const doc = SpreadsheetApp.getActiveSpreadsheet();
    
    // 4. Memproses Aksi sesuai Endpoint
    if (action === "keuangan") {
      const sheet = doc.getSheetByName("Sheet_Keuangan");
      if (!sheet) {
        return jsonResponse({ status: "error", message: "Sheet 'Sheet_Keuangan' tidak ditemukan." }, 404);
      }
      
      // Blueprint Kolom: ID, Tanggal, Jenis, Kategori, Nominal, Keterangan, User
      sheet.appendRow([
        data.id,
        data.tanggal,
        data.jenis,
        data.kategori,
        Number(data.nominal), // Tipe data Number
        data.keterangan,
        data.user
      ]);

      return jsonResponse({
        status: "success",
        message: "Data keuangan berhasil disimpan ke Google Sheets!"
      });

    } else if (action === "audit_stok") {
      const sheet = doc.getSheetByName("Sheet_Audit_Stok");
      if (!sheet) {
        return jsonResponse({ status: "error", message: "Sheet 'Sheet_Audit_Stok' tidak ditemukan." }, 404);
      }
      
      // Blueprint Kolom: ID, Tanggal, Nama_Barang, Stok_Sistem, Stok_Fisik, Selisih, Satuan, Keterangan, User
      sheet.appendRow([
        data.id,
        data.tanggal,
        data.namaBarang,
        Number(data.stokSistem),
        Number(data.stokFisik),
        Number(data.selisih), // Selisih dihitung otomatis dari React
        data.satuan,
        data.keterangan,
        data.user
      ]);

      return jsonResponse({
        status: "success",
        message: "Data audit stok berhasil disimpan ke Google Sheets!"
      });

    } else {
      return jsonResponse({
        status: "error",
        message: "Action tidak dikenal. Gunakan 'keuangan' atau 'audit_stok'."
      }, 400);
    }

  } catch (error) {
    return jsonResponse({
      status: "error",
      message: "Terjadi kesalahan internal: " + error.toString()
    }, 500);
  }
}

/**
 * Handle HTTP GET Request (Opsional, untuk tes koneksi sederhana)
 */
function doGet(e) {
  return jsonResponse({
    status: "ok",
    message: "Google Apps Script Web App berjalan dengan baik. Silakan gunakan POST untuk mengirim data."
  });
}

/**
 * Helper untuk mengembalikan respons JSON
 */
function jsonResponse(data, statusCode = 200) {
  const output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}
