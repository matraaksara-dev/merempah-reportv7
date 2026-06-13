# Dokumentasi Injeksi Keamanan Code.gs & Logika Cara Kerjanya

Dokumen ini menjelaskan mekanisme keamanan (injeksi token) yang telah ditambahkan ke dalam file `Code.gs` pada Google Apps Script (GAS) untuk project Merempah Report System, tanpa merusak atau mengubah logika bisnis yang sudah ada.

## 1. Latar Belakang & Tujuan
Secara default, jika sebuah Web App Google Apps Script di-deploy agar bisa diakses secara anonim (Anyone), maka URL endpoint tersebut dapat ditembak (hit) oleh siapa saja yang memiliki link-nya. Untuk mencegah masuknya "sampah" atau request dari pihak yang tidak bertanggung jawab, kita perlu menambahkan semacam "kunci" atau **Secret Token**.

Hanya aplikasi React (Frontend) kita yang mengetahui kunci ini, sehingga GAS hanya akan memproses data jika request tersebut datang membawa kunci yang valid.

## 2. Injeksi Kode Keamanan (`Code.gs`)

Pada `Code.gs`, kita mendeklarasikan konstanta token rahasia di bagian paling atas:

```javascript
// === KONFIGURASI KEAMANAN ===
// Ganti nilai ini dengan token rahasia yang kuat. 
// Token ini HARUS sama persis dengan yang ada di VITE_GAS_SECRET_TOKEN pada file .env di frontend React.
const SECRET_TOKEN = "ganti_dengan_token_rahasia_anda_yang_sangat_panjang_dan_acak_12345!";
// ============================
```

*Catatan: API Key (Token) ini dikonfigurasi secara manual oleh Anda pada Apps Script Editor untuk memastikan bahwa kredensial tidak bocor di repository publik.*

## 3. Penjelasan Logika Cara Kerja

Google Apps Script menggunakan dua fungsi utama untuk menerima HTTP Request: `doGet(e)` untuk request GET dan `doPost(e)` untuk request POST. Kita menginjeksi logika validasi pada kedua fungsi ini.

### A. Alur Validasi pada `doPost(e)` (Untuk Menyimpan Data)

Aplikasi React kita akan mengirimkan data menggunakan metode POST. Berikut adalah cara kerjanya:

1. **Menerima Request:** GAS menerima objek event `e` dari request POST.
2. **Parsing Payload:** Kita mencoba membaca body dari request (`e.postData.contents`). GAS mengharapkan format JSON.
3. **Mengekstrak Token & Action:** 
   Dari JSON yang dikirim, kita mengambil dua properti penting: `token` dan `action` (contoh action: `simpanHandover`, `simpanCashflow`).
4. **Validasi Token (Gatekeeper):**
   ```javascript
   if (token !== SECRET_TOKEN) {
     return ContentService.createTextOutput(JSON.stringify({
       status: "error",
       message: "Unauthorized: Invalid or missing token."
     })).setMimeType(ContentService.MimeType.JSON);
   }
   ```
   - Jika `token` **TIDAK COCOK** dengan `SECRET_TOKEN`, GAS akan langsung menolak request dengan status "error" dan pesan "Unauthorized". Eksekusi berhenti di sini, sehingga spreadsheet aman.
   - Jika `token` **COCOK**, GAS akan melanjutkan ke langkah berikutnya.
5. **Eksekusi Logika Bisnis:**
   Berdasarkan parameter `action`, GAS akan memanggil fungsi penyimpanan yang relevan (yang sudah ada sebelumnya tanpa dimodifikasi logikanya).
   ```javascript
   if (action === 'simpanHandover') {
     return simpanHandover(data); 
   } else if (action === 'simpanCashflow') {
     return simpanCashflow(data);
   } // ... dan seterusnya
   ```

### B. Alur Validasi pada `doGet(e)` (Untuk Mengambil Data/Test)

Biasanya `doGet` digunakan untuk testing di browser atau menarik data. Logikanya serupa dengan `doPost`:

1. **Mengekstrak Parameter URL:** Mengambil parameter dari URL (misal: `?token=xxx&action=xxx`).
2. **Validasi Token:**
   ```javascript
   const token = e.parameter.token;
   if (token !== SECRET_TOKEN) {
     return ContentService.createTextOutput(JSON.stringify({
       status: "error",
       message: "Unauthorized: Invalid token."
     })).setMimeType(ContentService.MimeType.JSON);
   }
   ```
3. **Eksekusi:** Jika token valid, akan mengeksekusi `action` yang diminta. Jika tidak ada action yang spesifik, bisa mengembalikan HTML halaman default (`Index.html`).

## 4. Keuntungan Arsitektur Ini

1. **Aman dari Spam:** Bot atau orang iseng tidak bisa asal POST data ke sheet Anda karena mereka tidak tahu `SECRET_TOKEN`.
2. **Non-Destructive:** Logika inti untuk menyimpan data ke sel-sel Spreadsheet (seperti fungsi `simpanHandover()`) sama sekali tidak disentuh atau diubah. Kita hanya menambahkan pos penjagaan (Gatekeeper) di pintu masuk (`doPost` dan `doGet`).
3. **Simpel & Efisien:** Tidak perlu implementasi OAuth yang kompleks untuk kebutuhan internal Cafe, namun tetap memberikan perlindungan yang memadai.

## 5. Langkah Implementasi Anda Selanjutnya

1. Buka editor Google Apps Script Anda.
2. Pastikan file `Code.gs` Anda sudah diperbarui dengan kode yang mengintegrasikan validasi `SECRET_TOKEN`.
3. Ubah nilai `SECRET_TOKEN` di `Code.gs` dengan string acak (misal: `mrp_secure_token_998877`).
4. Buka file `.env` di komputer Anda pada project React ini, dan samakan isinya:
   ```env
   VITE_GAS_SECRET_TOKEN=mrp_secure_token_998877
   ```
5. Deploy ulang web app GAS Anda (Pastikan memilih "New" deployment atau update version agar perubahan efek).
