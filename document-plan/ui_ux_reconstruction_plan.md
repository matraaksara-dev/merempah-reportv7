# Rencana Rekonstruksi UI & UX: Sistem Operasional Merempah

Dokumen ini memuat detail rencana untuk merekonstruksi UI dan UX dari versi Google Apps Script (HTML murni) ke dalam ekosistem React (Vite) + Tailwind CSS. Seluruh fungsionalitas dan instruksi teks wajib dipertahankan.

## 1. Panduan Desain & Palet Warna (Tailwind Config)
Referensi dari `theme_green_cream.css` akan dikonversi menjadi konfigurasi Tailwind kustom (`tailwind.config.js`):

- **Background & Permukaan:**
  - `bg-cream`: `#f7f5f0` (Background utama aplikasi)
  - `bg-card`: `#ffffff` (Background kotak/container konten)
- **Aksen & Brand (Green & Gold):**
  - `accent-green`: `#1b4332` (Warna utama tombol, header, badge)
  - `accent-hover`: `#081c15` (Warna hover untuk tombol hijau)
  - `accent-gold`: `#c5a059` (Warna tab aktif, tombol cetak PDF, border header)
  - `gold-highlight`: `#ffd166` (Digunakan di kotak Omzet Shift)
- **Teks & Tipografi:**
  - `text-main`: `#121212` (Teks standar)
  - `text-muted`: `#526356` (Teks keterangan, petunjuk kecil)
  - *Font Family*: 'Plus Jakarta Sans', sans-serif.
- **Feedback & Status:**
  - `success`: `#2d6a4f` / `#d1e7dd` (Background)
  - `error`: `#9a031e` / `#ff6b6b` (Validasi error)
  - `warning`: `#856404` / `#fff3cd` (Info penting)
- **Border & Pembatas:**
  - `border-soft`: `#e3dec3`
  - `border-gray`: `#ddd`

## 2. Struktur Layout UI

Aplikasi akan dibagi menjadi beberapa *State* utama.

### A. Gatekeeper (Password Gate)
- **Desain UX:** Tetap full-screen dengan background gelap (`#0a0a0a` / gradient).
- **Elemen:** Ikon gembok 🔐, Judul "MEREMPAH", Subtitle "Cafe & Spice · Sistem Operasional".
- **Interaksi:** Input password terpusat. Animasi error ("PASSWORD SALAH. COBA LAGI.") berwarna merah jika gagal.

### B. Header & Navigasi Utama
- **Header:** Background hijau `accent-green` dengan garis bawah tebal `accent-gold`. Teks tengah: "MEREMPAH CAFE & SPICE".
- **Tab Navigation:** Sistem tab horizontal (Handover, Cashflow, Kasbon).
  - *Inactive:* Background gelap (`#111`), teks abu-abu.
  - *Active:* Background `accent-gold`, teks gelap.

### C. Komponen Form Dasar
- **Form Card / Section:** Menggunakan background putih (`bg-card`), rounded corners (`rounded-xl` atau `24px`), border `border-soft`, drop shadow lembut.
- **Judul Section (A, B, C):** Header bar di dalam card. (Misal: Background gelap, tulisan emas).
- **Input Field:** Full width, border abu-abu transisi ke emas/hijau saat *focus*. Label di atas input (huruf tebal, uppercase kecil).
- **Readonly Input (Kalkulasi):** Background kekuningan (`#fffde7`), border kuning, teks merah (`#d32f2f`) agar terlihat jelas bahwa itu tidak bisa diedit.

## 3. Preservasi Teks & Fungsionalitas per Tab

### Tab 1: Handover
- **Info Alert:** "⚠️ Harap selesaikan 7 item checklist sebelum handover fisik." dan status penarikan data modal awal.
- **Section A (Checklist):** 7 checkbox wajib. Dipisah menjadi 'Area Kebersihan' (5 item) dan 'Persiapan Operasional' (2 item).
- **Section B (Info Shift & Kas Laci):**
  - Kotak informasi "Modal Kasir Otomatis dari Shift Sebelumnya" (Desain dark blue gradient / elegan).
  - Field: Waktu, Staf Lama, Staf Baru, Modal Laci, Omzet POS Total.
  - *Kotak Analisa Omzet:* Menampilkan kalkulasi Omzet Shift Ini (Akumulasi sekarang - akumulasi sebelumnya). Teks warning "Jika tanda minus...".
  - Omzet Tunai Laci Shift Ini, Total Pengeluaran Shift (dengan rincian teks).
  - Kalkulasi TOTAL SISTEM (A).
- **Section C (Bahan Baku):** Textarea untuk catatan stok. Desain header kecoklatan.
- **Section D (Aktual & Setoran):** Field Fisik Laci (B), Selisih, Keterangan Selisih, Setor Kas Besar, dan kalkulasi Modal Tertinggal.
- **Section E (Tanda Tangan Digital):** 2 Checkbox persetujuan staf lama dan baru.
- **Aksi:** Tombol "SIMPAN & CETAK PDF".

### Tab 2: Cashflow
- **Info Alert:** "Laporan PDF resmi akan digenerate otomatis saat Anda menekan tombol simpan."
- **Section A (Saldo Awal):** Tgl, PIC, Kemarin, Modal, Inject.
- **Section B (Pendapatan & Online):** POS SYS, QRIS, SHOPEE, GRAB, GOFOOD, Kalkulasi TOTAL TUNAI.
- **Section C (Rincian Pengeluaran):** 5 baris dinamis (Kategori dropdown, Keterangan, Nominal Rp). Form kasbon (Dropdown Nama, Nominal) untuk 6 orang. Kalkulasi TOTAL PENGELUARAN.
- **Section D (Setoran & Selisih):** Uang Fisik, Selisih (Kalkulasi), Ket Selisih, Modal Bsk, Setor Kas, Setor HO.
- **Aksi:** Tombol "CETAK PDF & SIMPAN" (Warna Emas).

### Tab 3: Kasbon
- **Info Alert:** "📝 Form pengajuan kasbon. PDF otomatis tercetak untuk dikirim via WA ke Management."
- **Form:** Dropdown Pemohon, Tanggal, Nominal (dengan warning > 500k), Keperluan.
- **Aksi:** Tombol "CETAK PDF & AJUKAN".

## 4. Rencana Implementasi Komponen (React)
- `App.jsx`: Menampung *state* otentikasi (Password Gate) dan State navigasi Tab.
- `components/ui/`: Kumpulan komponen reusable (`Button`, `Card`, `InputField`, `AlertBox`).
- `components/features/`: `HandoverForm`, `CashflowForm`, `KasbonForm`.
- `services/pdfGenerator.js`: Modul terpisah yang menggunakan `html2pdf.js` untuk merender container hidden yang identik desainnya dengan file Index.html versi lama (PDF Page styles).

## 5. Kesimpulan Rekonstruksi
Dengan desain ini, aplikasi akan **terasa baru, modern, dan premium** (berkat animasi halus Tailwind, palet green & cream), **namun** pengguna (staf operasional) **tidak perlu belajar ulang** karena posisi form, label teks, kalkulasi otomatis, dan urutan checklist sama persis 100% dengan versi lama.
