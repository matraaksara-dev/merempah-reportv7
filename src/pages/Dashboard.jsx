import React from 'react';

/**
 * Dashboard View.
 */
export function Dashboard({ onNavigate }) {
  const stats = [
    { title: "Pemasukan Hari Ini", value: "Rp 1.250.000", change: "+12.5% vs kemarin", color: "from-emerald-500/10 to-teal-500/10 border-emerald-500/20 text-emerald-400" },
    { title: "Pengeluaran Hari Ini", value: "Rp 450.000", change: "-3% vs rata-rata", color: "from-rose-500/10 to-orange-500/10 border-rose-500/20 text-rose-400" },
    { title: "Audit Terakhir", value: "12 Barang", change: "100% Selesai hari ini", color: "from-purple-500/10 to-indigo-500/10 border-purple-500/20 text-purple-400" },
    { title: "Selisih Stok", value: "-2 Pcs", change: "Perlu perhatian khusus", color: "from-amber-500/10 to-yellow-500/10 border-amber-500/20 text-amber-400" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Message */}
      <div>
        <h1 className="text-3xl font-bold text-slate-100 tracking-tight mb-2">
          Selamat Datang di Merempah Cafe
        </h1>
        <p className="text-slate-400 text-sm">
          Berikut adalah ringkasan pembukuan keuangan dan kondisi stok fisik per hari ini.
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div 
            key={i} 
            className={`p-6 rounded-2xl border bg-gradient-to-br ${stat.color} transition-all duration-300 hover:scale-[1.02]`}
          >
            <span className="text-xs font-semibold uppercase tracking-wider opacity-80">{stat.title}</span>
            <p className="text-2xl font-bold mt-2.5 mb-1.5">{stat.value}</p>
            <span className="text-[10px] font-medium opacity-60">{stat.change}</span>
          </div>
        ))}
      </div>

      {/* Quick Actions & Recent Activities placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl space-y-4">
          <h3 className="text-base font-bold text-slate-200">Aksi Cepat</h3>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => onNavigate('keuangan')}
              className="p-4 rounded-xl border border-slate-800 bg-slate-950/40 hover:bg-slate-950 text-left transition duration-300 cursor-pointer"
            >
              <span className="text-xl">💰</span>
              <p className="text-sm font-semibold mt-2.5 text-slate-200">Input Keuangan</p>
              <span className="text-[10px] text-slate-500 mt-1 block">Catat pemasukan/pengeluaran</span>
            </button>
            <button 
              onClick={() => onNavigate('audit_stok')}
              className="p-4 rounded-xl border border-slate-800 bg-slate-950/40 hover:bg-slate-950 text-left transition duration-300 cursor-pointer"
            >
              <span className="text-xl">📦</span>
              <p className="text-sm font-semibold mt-2.5 text-slate-200">Audit Stok</p>
              <span className="text-[10px] text-slate-500 mt-1 block">Audit stok fisik harian</span>
            </button>
          </div>
        </div>

        {/* Database Status Info */}
        <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl space-y-4">
          <h3 className="text-base font-bold text-slate-200">Status Database</h3>
          <div className="space-y-3.5">
            <div className="flex justify-between items-center text-xs p-3 rounded-xl bg-slate-950/30 border border-slate-900">
              <span className="text-slate-400">Google Sheets Koneksi</span>
              <span className="font-semibold text-emerald-400">Tersambung (OK)</span>
            </div>
            <div className="flex justify-between items-center text-xs p-3 rounded-xl bg-slate-950/30 border border-slate-900">
              <span className="text-slate-400">Nama Dokumen Sheet</span>
              <span className="font-semibold text-slate-300">mrp-reportsystem_v7</span>
            </div>
            <div className="flex justify-between items-center text-xs p-3 rounded-xl bg-slate-950/30 border border-slate-900">
              <span className="text-slate-400">Token Keamanan API</span>
              <span className="font-semibold text-indigo-400">Aktif (Valid)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
