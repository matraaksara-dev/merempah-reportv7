import { config } from '../config/api';

/**
 * Helper untuk melakukan request JSONP untuk menghindari CORS block pada method GET.
 * @param {string} url - URL Google Apps Script Web App
 * @param {object} params - Parameter query
 * @returns {Promise<object>} - Response data
 */
function fetchJSONP(url, params) {
  return new Promise((resolve, reject) => {
    const callbackName = 'cb_gas_' + Math.round(100000 * Math.random());
    
    // Timer timeout untuk membatalkan request jika terlalu lama
    const timeout = setTimeout(() => {
      delete window[callbackName];
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      reject(new Error('Timeout menarik data dari Google Apps Script.'));
    }, 10000);

    window[callbackName] = function(data) {
      clearTimeout(timeout);
      delete window[callbackName];
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      resolve(data);
    };

    const queryParams = { ...params, callback: callbackName };
    const queryString = Object.keys(queryParams)
      .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(queryParams[key]))
      .join('&');

    const script = document.createElement('script');
    script.src = `${url}?${queryString}`;
    script.onerror = () => {
      clearTimeout(timeout);
      delete window[callbackName];
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      reject(new Error('Koneksi Apps Script terputus atau URL tidak valid.'));
    };
    
    document.head.appendChild(script);
  });
}

/**
 * Mengirim data ke Google Apps Script Web App menggunakan POST (Simple Request).
 * Menggunakan Content-Type text/plain untuk melewati restriksi CORS preflight.
 * @param {object} payload - Body request berisi tipeForm dan data
 * @returns {Promise<object>} - Response JSON dari GAS
 */
async function sendToGAS(payload) {
  if (!config.apiUrl) {
    throw new Error("API URL Google Apps Script belum dikonfigurasi.");
  }

  // Bungkus payload dengan token keamanan
  const body = {
    tipeForm: payload.tipeForm,
    token: config.apiToken,
    data: payload.data
  };

  try {
    const response = await fetch(config.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8' // Trik menghindari OPTIONS preflight
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.status === 'error') {
      throw new Error(result.pesan || result.message || 'Terjadi kesalahan pada server GAS.');
    }

    return result;
  } catch (error) {
    console.error("Gagal mengirim data ke GAS:", error);
    throw error;
  }
}

export const gasService = {
  /**
   * Menarik data modal otomatis dari shift sebelumnya dan akumulasi omzet terakhir.
   * Menggunakan request GET via JSONP.
   */
  async getModalData() {
    if (!config.apiUrl) {
      throw new Error("API URL Google Apps Script belum dikonfigurasi.");
    }
    
    const params = {
      action: 'getModal',
      token: config.apiToken
    };
    
    return fetchJSONP(config.apiUrl, params);
  },

  /**
   * Mengirim Laporan Handover
   */
  async submitHandover(data) {
    return sendToGAS({
      tipeForm: 'handover',
      data
    });
  },

  /**
   * Mengirim Laporan Cashflow
   */
  async submitCashflow(data) {
    return sendToGAS({
      tipeForm: 'cashflow',
      data
    });
  },

  /**
   * Mengirim Pengajuan Kasbon Pegawai
   */
  async submitKasbon(data) {
    return sendToGAS({
      tipeForm: 'kasbon',
      data
    });
  }
};
