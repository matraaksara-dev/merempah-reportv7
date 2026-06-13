import React, { useState } from 'react';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { gasService } from '../services/gasService';

/**
 * Halaman Keuangan - Boilerplate Skema Data dan Integrasi API
 */
export function Keuangan() {
  // Mock Data untuk demonstrasi skema kolom Sheet_Keuangan
  const [transactions, setTransactions] = useState([
    {
      id: "TX-1718293021",
      tanggal: "2026-06-13 14:22:10",
      jenis: "Pemasukan",
      kategori: "Penjualan Kopi",
      nominal: 75000,
      keterangan: "Penjualan Espresso & Cappuccino shift pagi",
      user: "Staf Cafe"
    },
    {
      id: "TX-1718293022",
      tanggal: "2026-06-13 15:45:00",
      jenis: "Pengeluaran",
      kategori: "Bahan Baku",
      nominal: 120000,
      keterangan: "Pembelian Susu Fresh Milk 10 kotak",
      user: "Staf Cafe"
    }
  ]);

  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // Contoh fungsi pengiriman payload data sesuai blueprint Keuangan ke GAS
  const handleTestSubmit = async () => {
    setLoading(true);
    setStatusMsg('');

    // Payload yang sesuai dengan format Sheet_Keuangan
    const samplePayload = {
      id: `TX-${Date.now()}`,
      tanggal: new Date().toISOString().slice(0, 19).replace('T', ' '),
      jenis: "Pemasukan",
      kategori: "Penjualan Makanan",
      nominal: 50000,
      keterangan: "Contoh pengiriman data otomatis dari boilerplate",
      user: "Staf Cafe"
    };

    try {
      // Mengirimkan payload ke modul gasService
      const res = await gasService.submitKeuangan(samplePayload);
      setStatusMsg(`Sukses: ${res.message || 'Data berhasil dikirim!'}`);
      
      // Tambahkan ke log tabel lokal untuk visualisasi
      setTransactions(prev => [samplePayload, ...prev]);
    } catch (err) {
      setStatusMsg(`Gagal: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-slate-100 tracking-tight mb-2">
          Laporan Keuangan Harian
        </h1>
        <p className="text-slate-400 text-sm">
          Menu pencatatan transaksi masuk dan keluar serta pengiriman data ke Google Sheets.
        </p>
      </div>

      {/* Blueprint Form Placeholder */}
      <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl space-y-6">
        <h3 className="text-base font-bold text-slate-200">
          Formulir Input (Boilerplate Skema Data)
        </h3>
        
        {/* Visual Input Field mapping */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Input label="ID Transaksi (Auto-generated)" placeholder="UUID / Timestamp Hash" disabled value="TX-Generated-On-Submit" />
          <Input label="Tanggal" type="datetime-local" placeholder="Pilih waktu" />
          <Input label="Jenis Transaksi" placeholder="Pemasukan / Pengeluaran (Enum)" />
          <Input label="Kategori" placeholder="Bahan Baku / Operasional / Penjualan" />
          <Input label="Nominal (Numeric)" type="number" placeholder="Nominal tanpa format rupiah" />
          <Input label="User Penginput" placeholder="Nama Staf" />
          <div className="md:col-span-3">
            <Input label="Keterangan" placeholder="Keterangan transaksi lengkap..." />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between border-t border-slate-800/60 pt-6">
          <span className="text-xs text-slate-500">
            * Tombol di samping akan mensimulasikan pengiriman data riil ke Google Apps Script.
          </span>
          <div className="flex items-center gap-3">
            {statusMsg && (
              <span className={`text-xs font-semibold ${statusMsg.startsWith('Sukses') ? 'text-emerald-400' : 'text-rose-400'}`}>
                {statusMsg}
              </span>
            )}
            <Button onClick={handleTestSubmit} disabled={loading}>
              {loading ? 'Mengirim...' : 'Simulasi Kirim Data Keuangan'}
            </Button>
          </div>
        </div>
      </div>

      {/* Blueprint Table View */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-800/80">
          <h3 className="text-base font-bold text-slate-200">Arsitektur Kolom `Sheet_Keuangan`</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="p-4">ID (String)</th>
                <th className="p-4">Tanggal (Date)</th>
                <th className="p-4">Jenis (Enum)</th>
                <th className="p-4">Kategori (String)</th>
                <th className="p-4">Nominal (Number)</th>
                <th className="p-4">Keterangan (String)</th>
                <th className="p-4">User (String)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-900/20 text-slate-300">
                  <td className="p-4 font-mono text-purple-400">{tx.id}</td>
                  <td className="p-4">{tx.tanggal}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded-full font-semibold ${
                      tx.jenis === 'Pemasukan' ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
                    }`}>
                      {tx.jenis}
                    </span>
                  </td>
                  <td className="p-4">{tx.kategori}</td>
                  <td className="p-4 font-semibold text-slate-200">
                    Rp {tx.nominal.toLocaleString('id-ID')}
                  </td>
                  <td className="p-4 text-slate-400 max-w-xs truncate">{tx.keterangan}</td>
                  <td className="p-4">{tx.user}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
