/**
 * Sentralisasi Konfigurasi API
 * Membaca variabel lingkungan dari .env dengan pengecekan kelayakan.
 */

const API_URL = import.meta.env.VITE_GAS_API_URL;
const API_TOKEN = import.meta.env.VITE_API_SECRET_TOKEN;

if (!API_URL) {
  console.warn("Peringatan: VITE_GAS_API_URL tidak terdefinisi di environment variables.");
}

if (!API_TOKEN) {
  console.warn("Peringatan: VITE_API_SECRET_TOKEN tidak terdefinisi di environment variables.");
}

export const config = {
  apiUrl: API_URL || '',
  apiToken: API_TOKEN || '',
};
