import { config } from '../config/api';

/**
 * Mengirim data ke Google Apps Script Web App.
 * @param {string} action - Tipe aksi (misal: 'keuangan' atau 'audit')
 * @param {object} payload - Data transaksi/audit
 * @returns {Promise<object>} - Response JSON dari GAS
 */
async function sendToGAS(action, payload) {
  if (!config.apiUrl) {
    throw new Error("API URL Google Apps Script belum dikonfigurasi.");
  }

  // Menambahkan token keamanan ke payload
  const body = {
    action,
    token: config.apiToken,
    data: payload
  };

  try {
    const response = await fetch(config.apiUrl, {
      method: 'POST',
      mode: 'cors', // Menghindari isu CORS
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.status === 'error') {
      throw new Error(result.message || 'Terjadi kesalahan pada server GAS.');
    }

    return result;
  } catch (error) {
    console.error("Gagal mengirim data ke GAS:", error);
    throw error;
  }
}

export const gasService = {
  /**
   * Mengirim Laporan Keuangan Harian
   * Blueprint: ID, Tanggal, Jenis, Kategori, Nominal, Keterangan, User
   */
  async submitKeuangan(data) {
    return sendToGAS('keuangan', data);
  },

  /**
   * Mengirim Laporan Audit Stok Cafe
   * Blueprint: ID, Tanggal, Nama_Barang, Stok_Sistem, Stok_Fisik, Selisih, Satuan, Keterangan, User
   */
  async submitAuditStok(data) {
    return sendToGAS('audit_stok', data);
  }
};
