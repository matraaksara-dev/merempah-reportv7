# Infrastructure Plan & Boilerplate Structure

Dokumen ini merangkum arsitektur dasar, skema data, struktur folder, dan strategi deployment untuk Aplikasi Web Pengelolaan Laporan Keuangan & Audit Stok Cafe. Dokumen ini dirancang dalam perspektif *high-level* agar mudah dipahami dan diimplementasikan oleh developer.

## 🚀 Milestone 1: Arsitektur Aliran Data & Keamanan (Data Flow)

- [ ] **Alur Komunikasi Sistem (React -> GAS -> Google Sheets)**
  Aplikasi Frontend (React) akan bertindak sebagai antarmuka utama pengguna. Setiap kali terjadi interaksi pengiriman data (submit form), React akan melakukan HTTP POST request ke URL Web App Google Apps Script (GAS). GAS bertindak sebagai *middleware* (API serverless) yang akan menerima request, memvalidasi payload, lalu mengeksekusi operasi baca/tulis ke Google Sheets yang berfungsi sebagai basis data utama. Setelah operasi selesai, GAS akan mengembalikan respons dalam format JSON ke React untuk memperbarui antarmuka pengguna.

- [ ] **Strategi Keamanan Endpoint GAS**
  URL Web App GAS berpotensi dieksploitasi jika terekspos tanpa perlindungan. Untuk memitigasi risiko spam atau manipulasi data, kita akan menerapkan **Validasi Token Sederhana (Simple Token Validation)**. 
  - Aplikasi React akan menyematkan sebuah rahasia (misalnya parameter `api_token` atau di dalam payload JSON) pada setiap *request* yang dikirim, yang bersumber dari Environment Variables rahasia.
  - Skrip GAS akan membandingkan token yang diterima dengan token konstan (`SECRET_TOKEN`) yang ditanamkan dalam kode GAS.
  - Jika token tidak cocok atau tidak disertakan, skrip GAS akan langsung menghentikan proses dan mengembalikan pesan *Unauthorized* tanpa melakukan perubahan apa pun pada Google Sheets.

## 📊 Milestone 2: Cetak Biru Skema Data (Google Sheets Blueprint)

Google Sheets akan dipisahkan menjadi minimal dua sheet dengan standarisasi tipe data kolom (Data Type) agar proses kalkulasi aman dari kesalahan format:

- [ ] **Desain `Sheet_Keuangan`**
  | Nama Kolom | Tipe Data Asumsi | Deskripsi |
  | :--- | :--- | :--- |
  | **ID** | String | *Unique Identifier* transaksi (misal: UUID atau kombinasi Timestamp). |
  | **Tanggal** | Date/Datetime | Waktu pencatatan transaksi yang tervalidasi secara sistem. |
  | **Jenis** | String (Enum) | Pilihan statis: `Pemasukan` atau `Pengeluaran`. |
  | **Kategori** | String | Kategori alokasi (misal: Bahan Baku, Operasional, Penjualan). |
  | **Nominal** | Number | Nilai uang transaksi. Harus berupa angka absolut di tingkat sistem (tidak mengandung format mata uang Rp/. saat dikirim). |
  | **Keterangan** | String | Deskripsi penjelasan transaksi. |
  | **User** | String | Nama atau inisial kasir/staf penginput data. |

- [ ] **Desain `Sheet_Audit_Stok`**
  | Nama Kolom | Tipe Data Asumsi | Deskripsi |
  | :--- | :--- | :--- |
  | **ID** | String | *Unique Identifier* catatan laporan audit. |
  | **Tanggal** | Date/Datetime | Waktu pencatatan audit stok di lapangan. |
  | **Nama_Barang** | String | Nama bahan/item yang diaudit. |
  | **Stok_Sistem** | Number | Jumlah stok teoretis berdasarkan catatan sistem/pembukuan terakhir. |
  | **Stok_Fisik** | Number | Jumlah stok aktual hasil perhitungan fisik. |
  | **Selisih** | Number | Hasil hitung dari `Stok_Fisik` dikurangi `Stok_Sistem`. Nilai minus (-) menandakan barang hilang/susut. |
  | **Satuan** | String | Satuan pengukuran (misal: kg, gram, pcs, botol). |
  | **Keterangan** | String | Catatan khusus jika terdapat kejanggalan atau penyesuaian. |
  | **User** | String | Nama atau inisial staf pelaksana audit. |

## 📁 Milestone 3: Standarisasi Struktur Folder (Boilerplate Proyek React)

Untuk memudahkan pengembangan oleh banyak pemrogram tanpa kebingungan struktural, aplikasi React + Vite + Tailwind akan disusun berdasarkan *concern* fungsional berikut:

- [ ] **Pohon Struktur Folder Dasar (Folder Tree)**
  ```text
  ├── src/
  │   ├── assets/          # Aset statis aplikasi (gambar, ikon svg).
  │   ├── components/      # Komponen UI Reusable (Button, Input, Card, Table).
  │   ├── config/          # Sentralisasi konfigurasi (URL API eksternal, env variables).
  │   ├── hooks/           # Custom React Hooks untuk merapikan logika (useFetch, useForm).
  │   ├── layouts/         # Layout halaman utama (Sidebar, Header, Container Dasar).
  │   ├── pages/           # View halaman utama (Dashboard, Keuangan, AuditStok).
  │   ├── services/        # Logika API & Fetching (fungsi komunikasi ke Web App GAS).
  │   ├── utils/           # Fungsi utilitas (formatter tanggal, formatter rupiah).
  │   ├── App.jsx / .tsx   # Komponen Root & pengaturan Routing.
  │   └── main.jsx / .tsx  # Entry point utama React dan inisialisasi awal.
  ├── .env                 # File environment lokal developer (tidak di-push).
  ├── .env.example         # Templat referensi untuk environment.
  ├── tailwind.config.js   # Pengaturan tema dan utility class Tailwind CSS.
  └── vite.config.js       # Pengaturan builder Vite.
  ```

- [ ] **Aturan Penempatan Tanggung Jawab**
  - **Komponen Reusable**: Harus ditempatkan di `src/components/`. Komponen ini difokuskan hanya pada presentasi (*dumb components*) dan tidak memanggil API secara mandiri.
  - **Konfigurasi & Koneksi**: Dikelola dari `src/config/` lalu dihubungkan melalui `src/services/` untuk memanggil API GAS. Hal ini membuat endpoint dapat mudah dimodifikasi di satu tempat.
  - **Halaman Utama**: Diletakkan di `src/pages/`. Di sinilah interaksi antar komponen terjadi, pemanggilan service (*fetching*), dan pengumpulan *state* dijalankan.

## ☁️ Milestone 4: Strategi Deployment & Manajemen Lingkungan (Environment)

- [ ] **Manajemen Environment Variables di Vercel**
  - Variabel rahasia untuk *production*, seperti URL API GAS (misal: `VITE_GAS_API_URL`) dan Token (misal: `VITE_API_SECRET_TOKEN`), tidak boleh dilakukan *hardcode* dalam proyek.
  - Variabel tersebut dikelola penuh melalui dashboard Vercel pada bagian **Settings > Environment Variables**.
  - Saat tahapan build di Vercel berjalan, variabel ini akan disuntikkan secara otomatis.
  - File `.env.example` berfungsi sebagai pedoman *key* kosong agar pengembang baru tahu konfigurasi apa yang harus mereka isikan di mesin lokal mereka.

- [ ] **Alur Integrasi Berkelanjutan (CI/CD) GitHub ke Vercel**
  - Vercel akan ditautkan secara langsung (*native integration*) ke Repositori GitHub proyek ini.
  - **Auto-Deploy Production**: Vercel otomatis melakukan eksekusi *build* dan menggelar aplikasi ke *production URL* setiap kali ada komit yang di-push atau di-merge ke *branch* utama (biasanya `main` atau `master`).
  - **Preview Deployment**: Jika pengembang membuka *Pull Request*, Vercel secara paralel akan membuat lingkungan isolasi (*Preview Environment*) dan memberikan URL pratayang otomatis agar hasil dapat dites secara real-time sebelum digabung ke sistem utama.
