/**
 * Format angka menjadi Rupiah (IDR).
 * @param {number|string} num - Angka yang akan diformat
 * @returns {string} - Hasil format Rp X.XXX.XXX
 */
export function fNum(num) {
  const value = parseFloat(num) || 0;
  return "Rp " + Math.round(value).toLocaleString('id-ID');
}

/**
 * Format tanggal dari YYYY-MM-DD ke DDMMYY.
 */
export function formatDDMMYY(dateStr) {
  if (!dateStr) {
    const d = new Date();
    return String(d.getDate()).padStart(2, '0') + 
           String(d.getMonth() + 1).padStart(2, '0') + 
           String(d.getFullYear()).slice(-2);
  }
  const parts = dateStr.split('-');
  if (parts.length === 3) return parts[2] + parts[1] + parts[0].slice(-2);
  return dateStr.replace(/-/g, '');
}

/**
 * Format waktu lokal ke DDMMYY untuk DateTime-Local input YYYY-MM-DDTHH:MM.
 */
export function formatDTLocalDDMMYY(dtStr) {
  if (!dtStr) return formatDDMMYY('');
  const datePart = dtStr.split('T')[0];
  return formatDDMMYY(datePart);
}

/**
 * Mendapatkan jam saat ini format HHMM.
 */
export function formatJam() {
  const d = new Date();
  return String(d.getHours()).padStart(2, '0') + String(d.getMinutes()).padStart(2, '0');
}

/**
 * Bersihkan nama dari spasi dan karakter khusus untuk nama file PDF.
 */
export function cleanName(s) {
  return (s || 'UNKNOWN').toUpperCase().replace(/\s+/g, '').replace(/[^A-Z0-9]/g, '');
}
