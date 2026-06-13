import React, { useState } from 'react';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { gasService } from '../services/gasService';

/**
 * Halaman Audit Stok - Boilerplate Skema Data dan Penyelarasan Selisih
 */
export function AuditStok() {
  // Mock data untuk demonstrasi skema kolom Sheet_Audit_Stok
  const [audits, setAudits] = useState([
    {
      id: "AD-1718294001",
      tanggal: "2026-06-13 18:00:00",
      namaBarang: "Biji Kopi House Blend",
      stokSistem: 15.0,
      stokFisik: 14.5,
      selisih: -0.5,
      satuan: "kg",
      keterangan: "Penyusutan selama pembuatan shot espresso",
      user: "Staf Cafe"
    },
    {
      id: "AD-1718294002",
      tanggal: "2026-06-13 18:15:00",
      namaBarang: "Cup Plastik 16oz",
      stokSistem: 500,
      stokFisik: 500,
      selisih: 0,
      satuan: "pcs",
      keterangan: "Stok fisik cocok dengan sistem",
      user: "Staf Cafe"
    }
  ]);

  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // Contoh kalkulasi selisih secara otomatis dan pengiriman data ke GAS
  const handleTestSubmit = async () => {
    setLoading(true);
    setStatusMsg('');

    const stokSistem = 100;
    const stokFisik = 98;
    const selisih = stokFisik - stokSistem; // Selisih otomatis: -2

    // Payload yang sesuai dengan format Sheet_Audit_Stok
    const samplePayload = {
      id: `AD-${Date.now()}`,
      tanggal: new Date().toISOString().slice(0, 19).replace('T', ' '),
      namaBarang: "Susu UHT Full Cream",
      stokSistem: stokSistem,
      stokFisik: stokFisik,
      selisih: selisih,
      satuan: "pcs",
      keterangan: "Contoh pengiriman data audit dengan selisih -2 pcs",
      user: "Staf Cafe"
    };

    try {
      const res = await gasService.submitAuditStok(samplePayload);
      setStatusMsg(`Sukses: ${res.message || 'Audit berhasil dikirim!'}`);
      
      // Tambahkan ke tabel lokal untuk visualisasi
      setAudits(prev => [samplePayload, ...prev]);
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
          Audit Stok Cafe
        </h1>
        <p className="text-slate-400 text-sm">
          Menu pencocokan stok fisik barang dengan catatan di pembukuan sistem.
        </p>
      </div>

      {/* Blueprint Form Layout Info */}
      <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl space-y-6">
        <h3 className="text-base font-bold text-slate-200">
          Formulir Audit (Boilerplate Skema Data & Kalkulasi Otomatis)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Input label="Nama Barang" placeholder="Contoh: Biji Kopi" className="md:col-span-2" />
          <Input label="Satuan" placeholder="kg / pcs / liter" />
          <Input label="Staf Pengaudit" placeholder="Nama Staf" />
          <Input label="Stok Teoretis Sistem" type="number" placeholder="Jumlah di sistem" />
          <Input label="Stok Aktual Fisik" type="number" placeholder="Jumlah riil lapangan" />
          
          {/* Visual Selisih Kalkulasi (Dihitung otomatis) */}
          <div className="flex flex-col gap-2 w-full">
            <span className="text-sm font-medium text-slate-300">Selisih (Stok Fisik - Sistem)</span>
            <div className="w-full px-4 py-2.5 bg-slate-950 border border-slate-900 rounded-xl text-slate-400 font-mono text-sm">
              Selisih otomatis dihitung di frontend
            </div>
          </div>

          <div className="md:col-span-4">
            <Input label="Keterangan Audit" placeholder="Tuliskan catatan selisih/kondisi barang..." />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between border-t border-slate-800/60 pt-6">
          <span className="text-xs text-slate-500">
            * Selisih dihitung dengan rumus sederhana: Selisih = Stok Fisik - Stok Sistem.
          </span>
          <div className="flex items-center gap-3">
            {statusMsg && (
              <span className={`text-xs font-semibold ${statusMsg.startsWith('Sukses') ? 'text-emerald-400' : 'text-rose-400'}`}>
                {statusMsg}
              </span>
            )}
            <Button onClick={handleTestSubmit} disabled={loading}>
              {loading ? 'Mengirim...' : 'Simulasi Kirim Laporan Audit'}
            </Button>
          </div>
        </div>
      </div>

      {/* Blueprint Table View */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-800/80">
          <h3 className="text-base font-bold text-slate-200">Arsitektur Kolom `Sheet_Audit_Stok`</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="p-4">ID (String)</th>
                <th className="p-4">Tanggal (Date)</th>
                <th className="p-4">Nama Barang (String)</th>
                <th className="p-4">Stok Sistem (Number)</th>
                <th className="p-4">Stok Fisik (Number)</th>
                <th className="p-4">Selisih (Number)</th>
                <th className="p-4">Satuan (String)</th>
                <th className="p-4">Keterangan (String)</th>
                <th className="p-4">User (String)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {audits.map((item) => (
                <tr key={item.id} className="hover:bg-slate-900/20 text-slate-300">
                  <td className="p-4 font-mono text-purple-400">{item.id}</td>
                  <td className="p-4">{item.tanggal}</td>
                  <td className="p-4 font-semibold text-slate-200">{item.namaBarang}</td>
                  <td className="p-4 font-mono">{item.stokSistem}</td>
                  <td className="p-4 font-mono">{item.stokFisik}</td>
                  <td className="p-4 font-mono">
                    <span className={`px-2 py-0.5 rounded font-semibold ${
                      item.selisih === 0 
                        ? 'text-slate-400 bg-slate-800/60' 
                        : item.selisih > 0 
                          ? 'text-emerald-400 bg-emerald-500/10' 
                          : 'text-rose-400 bg-rose-500/10'
                    }`}>
                      {item.selisih > 0 ? `+${item.selisih}` : item.selisih}
                    </span>
                  </td>
                  <td className="p-4">{item.satuan}</td>
                  <td className="p-4 text-slate-400 max-w-xs truncate">{item.keterangan}</td>
                  <td className="p-4">{item.user}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
