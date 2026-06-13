// =========================================================
// 0. TOKEN KEAMANAN (API KEY) - MASUKKAN TOKEN AMAN ANDA DI SINI
// =========================================================
const SECRET_TOKEN = "konsistensop123";

// =========================================================
// 1. MENU UTAMA DI SPREADSHEET
// =========================================================
function onOpen() {
  SpreadsheetApp.getUi().createMenu('📦 SISTEM MEREMPAH')
      .addItem('1. Setup / Perbaiki Database', 'setupDatabase')
      .addSeparator()
      .addItem('2. Buka Form Input (Lokal)', 'showForm')
      .addToUi();
}

// =========================================================
// 2. AUTO-GENERATE SHEET & HEADER (SAFE-GUARD)
// =========================================================
function setupDatabase() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // -- A. SETUP DATABASE CASHFLOW --
  var sheetCashflow = ss.getSheetByName("Database_Cashflow");
  if (!sheetCashflow) { sheetCashflow = ss.insertSheet("Database_Cashflow"); }
  if (sheetCashflow.getLastRow() === 0) {
    var headerCashflow = [
      "Tanggal", "PIC", "Saldo Kemarin", "Modal Kasir", "Inject HO", "Total Saldo Awal",
      "Omzet POS", "Omzet QRIS", "Tunai (POS-QRIS)", "Shopee", "Grab", "GoFood", "Total E-Commerce",
      "Total Tunai Awal", "Total Non-Tunai", "Belanja Umum (E1)", "Pengeluaran Lain (E2)", "Ket. Belanja (E3)",
      "Nama Kasbon 1", "Nilai 1", "Nama Kasbon 2", "Nilai 2", "Nama Kasbon 3", "Nilai 3",
      "Nama Kasbon 4", "Nilai 4", "Nama Kasbon 5", "Nilai 5", "Nama Kasbon 6", "Nilai 6",
      "Total Pengeluaran", "Nama Piutang", "Total Piutang", "Tunai-Pengeluaran(G1)", "Uang Fisik(G2)",
      "Selisih(G3)", "Ket Selisih(G4)", "Setor Modal Besok(H1)", "Setor Cashbox(H2)", "Setor HO(H3)",
      "Kategori Dinamis 1", "Ket Dinamis 1", "Nominal Dinamis 1",
      "Kategori Dinamis 2", "Ket Dinamis 2", "Nominal Dinamis 2",
      "Kategori Dinamis 3", "Ket Dinamis 3", "Nominal Dinamis 3",
      "Kategori Dinamis 4", "Ket Dinamis 4", "Nominal Dinamis 4",
      "Kategori Dinamis 5", "Ket Dinamis 5", "Nominal Dinamis 5"
    ];
    sheetCashflow.appendRow(headerCashflow);
    sheetCashflow.getRange(1, 1, 1, headerCashflow.length)
      .setFontWeight("bold").setBackground("#2c3e50").setFontColor("white");
    sheetCashflow.setFrozenRows(1);
  }

  // -- B. SETUP DATABASE HANDOVER --
  var sheetHandover = ss.getSheetByName("Database_Handover");
  if (!sheetHandover) { sheetHandover = ss.insertSheet("Database_Handover"); }
  if (sheetHandover.getLastRow() === 0) {
    var headerHandover = [
      "Timestamp Input",        // 1
      "Waktu Handover",         // 2
      "Staf Keluar (Lama)",     // 3
      "Staf Masuk (Baru)",      // 4
      "1. Modal Awal Laci",     // 5
      "2. Omzet Tunai POS",     // 6  <-- ini adalah nilai AKUMULASI dari POS saat handover
      "3. Pengeluaran Shift",   // 7
      "NILAI SISTEM (A)",       // 8
      "4. FISIK AKTUAL (B)",    // 9
      "5. SELISIH",             // 10
      "Ket. Selisih",           // 11
      "6. Setor Kas Besar",     // 12
      "7. MODAL DITINGGAL",     // 13
      "Otorisasi Keluar",       // 14
      "Otorisasi Masuk",        // 15
      "Status Checklist",       // 16
      "Keterangan Pengeluaran", // 17
      "Catatan Stok",           // 18
      "Omzet Akumulasi POS",    // 19 <-- BARU: snapshot akumulasi omzet POS total dari mesin POS saat handover
      "Omzet Per Shift",        // 20 <-- BARU: hasil kalkulasi omzet shift ini saja (akumulasi ini - akumulasi sebelumnya)
      "Omzet Akumulasi Sebelumnya" // 21 <-- BARU: nilai akumulasi dari handover sebelumnya (untuk audit trail)
    ];
    sheetHandover.appendRow(headerHandover);
    sheetHandover.getRange(1, 1, 1, headerHandover.length)
      .setFontWeight("bold").setBackground("#198754").setFontColor("white");
    sheetHandover.setFrozenRows(1);
  } else {
    // Upgrade kolom lama jika perlu (dari 16 atau 18 ke 21)
    var currentCols = sheetHandover.getLastColumn();
    var newHeaders = [
      { col: 17, label: "Keterangan Pengeluaran" },
      { col: 18, label: "Catatan Stok" },
      { col: 19, label: "Omzet Akumulasi POS" },
      { col: 20, label: "Omzet Per Shift" },
      { col: 21, label: "Omzet Akumulasi Sebelumnya" }
    ];
    newHeaders.forEach(function(h) {
      if (currentCols < h.col) {
        sheetHandover.getRange(1, h.col).setValue(h.label)
          .setFontWeight("bold").setBackground("#198754").setFontColor("white");
      }
    });
  }

  // -- C. SETUP DATABASE KASBON --
  var sheetKasbon = ss.getSheetByName("Database_Kasbon");
  if (!sheetKasbon) { sheetKasbon = ss.insertSheet("Database_Kasbon"); }
  if (sheetKasbon.getLastRow() === 0) {
    var headerKasbon = [
      "Timestamp Input", "Nama Pegawai", "Tanggal Pengajuan",
      "Nominal Kasbon", "Keterangan / Keperluan", "Status Konfirmasi Admin"
    ];
    sheetKasbon.appendRow(headerKasbon);
    sheetKasbon.getRange(1, 1, 1, headerKasbon.length)
      .setFontWeight("bold").setBackground("#d32f2f").setFontColor("white");
    sheetKasbon.setFrozenRows(1);
  }

  SpreadsheetApp.getUi().alert("✅ Setup Selesai! Database telah diperbarui.");
}

// =========================================================
// 3. AMBIL DATA MODAL & OMZET AKUMULASI TERAKHIR
//    Dipanggil doGet & form lokal
// =========================================================
function getLastModalData() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var shHandover = ss.getSheetByName("Database_Handover");
  var shCashflow = ss.getSheetByName("Database_Cashflow");

  var now = new Date();
  var todayStr = Utilities.formatDate(now, "Asia/Jakarta", "dd/MM/yyyy");
  var modalOtomatis = 0;
  var omzetAkumulasiTerakhir = 0; // snapshot akumulasi omzet POS dari handover terakhir

  if (shHandover && shHandover.getLastRow() > 1) {
    var lastRowH = shHandover.getLastRow();
    var numCols = shHandover.getLastColumn();
    var dataH = shHandover.getRange(lastRowH, 1, 1, numCols).getValues()[0];

    var timestampH = dataH[0];
    var tglH = "";
    if (timestampH) tglH = String(timestampH).split(" ")[0];

    // Ambil modal ditinggal (index 12)
    if (tglH === todayStr) {
      modalOtomatis = parseFloat(dataH[12]) || 0;
    } else {
      if (shCashflow && shCashflow.getLastRow() > 1) {
        var dataC = shCashflow.getRange(shCashflow.getLastRow(), 1, 1, shCashflow.getLastColumn()).getValues()[0];
        modalOtomatis = parseFloat(dataC[37]) || 0;
      } else {
        modalOtomatis = parseFloat(dataH[12]) || 0;
      }
    }

    // Ambil snapshot akumulasi omzet POS dari kolom 19 (index 18)
    if (numCols >= 19) {
      omzetAkumulasiTerakhir = parseFloat(dataH[18]) || 0;
    }

  } else if (shCashflow && shCashflow.getLastRow() > 1) {
    var dataC2 = shCashflow.getRange(shCashflow.getLastRow(), 1, 1, shCashflow.getLastColumn()).getValues()[0];
    modalOtomatis = parseFloat(dataC2[37]) || 0;
  }

  return {
    modal: modalOtomatis,
    omzetAkumulasiTerakhir: omzetAkumulasiTerakhir
  };
}

// =========================================================
// 4. doGet — ENDPOINT GET (Menampilkan UI Web App & JSONP)
// =========================================================
function doGet(e) {
  var params   = (e && e.parameter) ? e.parameter : {};
  var action   = params.action   || "";
  var callback = params.callback || "";
  var token    = params.token    || "";

  // 1. JIKA DIAKSES TANPA ACTION (USER MEMBUKA LINK WEB APP) -> TAMPILKAN HTML
  if (!action) {
    var template = HtmlService.createTemplateFromFile('Index'); 
    // Inject URL Web App otomatis agar tidak perlu ganti-ganti manual di HTML
    template.scriptUrl = ScriptApp.getService().getUrl(); 
    
    return template.evaluate()
        .setTitle('Sistem Operasional Merempah')
        .addMetaTag('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }

  // 2. JIKA ADA ACTION (SISTEM SEDANG MENARIK DATA MODAL) -> KEMBALIKAN JSONP
  var result = {};
  if (action === "getModal") {
    // Validasi token untuk aksi getModal (sensitif)
    if (!token || token !== SECRET_TOKEN) {
      result = { status: "error", message: "Unauthorized: Token tidak valid." };
    } else {
      result = getLastModalData();
    }
  } else {
    result = { status: "ok", message: "Sistem Merempah API aktif." };
  }

  var jsonStr = JSON.stringify(result);

  if (callback) {
    return ContentService
      .createTextOutput(callback + "(" + jsonStr + ");")
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  } else {
    return ContentService
      .createTextOutput(jsonStr)
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// =========================================================
// 5. doPost — ENDPOINT UNTUK FETCH POST
// =========================================================
function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    var clientToken = payload.token;
    var tipe = payload.tipeForm;
    var data = payload.data;

    // Validasi token keamanan di sisi GAS
    if (!clientToken || clientToken !== SECRET_TOKEN) {
      var unauthResponse = JSON.stringify({ status: "error", pesan: "Unauthorized: Token keamanan tidak valid." });
      return ContentService
        .createTextOutput(unauthResponse)
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (tipe === "handover")      simpanHandover(data);
    else if (tipe === "cashflow") simpanCashflow(data);
    else if (tipe === "kasbon")   simpanKasbon(data);
    else throw new Error("tipeForm tidak dikenal: " + tipe);

    var response = JSON.stringify({ status: "sukses", tipe: tipe });
    return ContentService
      .createTextOutput(response)
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    var errResponse = JSON.stringify({ status: "error", pesan: err.toString() });
    return ContentService
      .createTextOutput(errResponse)
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// =========================================================
// 6. FORM LOKAL (Opsional jika masih ingin dibuka di Sheet)
// =========================================================
function showForm() {
  var html = HtmlService.createTemplateFromFile('Index') // Pastikan ini 'Index'
      .evaluate()
      .setWidth(500)
      .setHeight(800);
  SpreadsheetApp.getUi().showModelessDialog(html, 'Sistem Merempah');
}

function processDataLokal(payload) {
  try {
    if (payload.tipeForm === "handover")      simpanHandover(payload.data);
    else if (payload.tipeForm === "cashflow") simpanCashflow(payload.data);
    else if (payload.tipeForm === "kasbon")   simpanKasbon(payload.data);
    return "Sukses";
  } catch (error) {
    throw new Error(error.toString());
  }
}

// =========================================================
// 7. FUNGSI PENYIMPANAN KE SHEET
// =========================================================
function getTimestamp() {
  return Utilities.formatDate(new Date(), "Asia/Jakarta", "dd/MM/yyyy HH:mm:ss");
}

function simpanHandover(d) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Database_Handover");
  if (!sheet) throw new Error("Sheet Database_Handover belum dibuat! Jalankan Setup Database dulu.");

  var omzetAkumulasiPos      = parseFloat(d.omzet_akumulasi_pos)     || 0;
  var omzetAkumulasiSebelumnya = parseFloat(d.omzet_akumulasi_sebelumnya) || 0;
  var omzetPerShift          = omzetAkumulasiPos - omzetAkumulasiSebelumnya;
  if (omzetPerShift < 0) omzetPerShift = 0; 

  sheet.appendRow([
    getTimestamp(),                // 1
    d.waktu,                       // 2
    d.staf_lama,                   // 3
    d.staf_baru,                   // 4
    d.modal_awal,                  // 5
    d.omzet_tunai,                 // 6
    d.pengeluaran,                 // 7
    d.sistem_a,                    // 8
    d.fisik_b,                     // 9
    d.selisih,                     // 10
    d.ket_selisih,                 // 11
    d.setor_kasbesar,              // 12
    d.modal_ditinggal,             // 13
    d.acc_lama,                    // 14
    d.acc_baru,                    // 15
    d.status_checklist || "Selesai", // 16
    d.ket_keluar,                  // 17
    d.catatan,                     // 18
    omzetAkumulasiPos,             // 19
    omzetPerShift,                 // 20
    omzetAkumulasiSebelumnya       // 21
  ]);
}

function simpanCashflow(d) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Database_Cashflow");
  if (!sheet) throw new Error("Sheet Database_Cashflow belum dibuat! Jalankan Setup Database dulu.");
  var dyn = d.pengeluaran_dinamis || [];
  sheet.appendRow([
    d.tgl, d.pic, d.a1, d.a2, d.a3, d.total_a,
    d.b1, d.b2, d.b3, d.c1, d.c2, d.c3, d.total_c,
    d.total_tunai_final, d.total_non_tunai_final,
    d.e1, d.e2, d.e3,
    d.k_n1, d.k_v1, d.k_n2, d.k_v2, d.k_n3, d.k_v3,
    d.k_n4, d.k_v4, d.k_n5, d.k_v5, d.k_n6, d.k_v6,
    d.total_e, d.f1, d.f2,
    d.g1, d.g2, d.g3, d.g4,
    d.h1, d.h2, d.h3,
    dyn[0] ? dyn[0].kategori : "", dyn[0] ? dyn[0].ket : "", dyn[0] ? dyn[0].nom : "",
    dyn[1] ? dyn[1].kategori : "", dyn[1] ? dyn[1].ket : "", dyn[1] ? dyn[1].nom : "",
    dyn[2] ? dyn[2].kategori : "", dyn[2] ? dyn[2].ket : "", dyn[2] ? dyn[2].nom : "",
    dyn[3] ? dyn[3].kategori : "", dyn[3] ? dyn[3].ket : "", dyn[3] ? dyn[3].nom : "",
    dyn[4] ? dyn[4].kategori : "", dyn[4] ? dyn[4].ket : "", dyn[4] ? dyn[4].nom : ""
  ]);
}

function simpanKasbon(d) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Database_Kasbon");
  if (!sheet) throw new Error("Sheet Database_Kasbon belum dibuat! Jalankan Setup Database dulu.");
  sheet.appendRow([
    getTimestamp(), d.nama, d.tgl_pengajuan, d.nominal, d.keterangan, "Menunggu Konfirmasi"
  ]);
}