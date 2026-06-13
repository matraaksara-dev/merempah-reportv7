import React, { useState, useEffect, useRef } from 'react';
import { gasService } from '../services/gasService';
import { fNum, formatDDMMYY, formatJam, cleanName } from '../utils/format';

export function Cashflow() {
  // --- STATE DATA FORM ---
  const [tgl, setTgl] = useState('');
  const [pic, setPic] = useState('');
  
  // Saldo Awal
  const [kemarin, setKemarin] = useState('');
  const [modal, setModal] = useState('');
  const [inject, setInject] = useState('');
  
  // Pendapatan & Online
  const [posSys, setPosSys] = useState('');
  const [qris, setQris] = useState('');
  const [shopee, setShopee] = useState('');
  const [grab, setGrab] = useState('');
  const [gofood, setGofood] = useState('');

  // 5 Baris Dinamis Pengeluaran
  const [dynExpenses, setDynExpenses] = useState(
    Array(5).fill(null).map(() => ({ kategori: '', ket: '', nom: '' }))
  );

  // 6 Baris Kasbon Pegawai
  const [kasbons, setKasbons] = useState(
    Array(6).fill(null).map(() => ({ nama: '', nom: '' }))
  );

  // Setoran & Selisih
  const [uangFisik, setUangFisik] = useState('');
  const [ketSelisih, setKetSelisih] = useState('');
  const [modalBsk, setModalBsk] = useState('');
  const [setorKas, setSetorKas] = useState('');
  const [setorHo, setSetorHo] = useState('');

  // --- STATE ACTION & LOADING ---
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupContent, setPopupContent] = useState('');
  const [statusMessage, setStatusMessage] = useState(null);

  // Reference untuk PDF Render element
  const printRef = useRef(null);

  // --- CONSTANT DROPDOWN OPTIONS ---
  const KATEGORI_OPS = ["", "Belanja Bahan", "Transport", "Kebersihan", "Darurat", "Lainnya"];
  const PEGAWAI_OPS = ["", "Nathan", "Friz", "Ardi", "Wanto", "Aziz", "Danu"];

  // Set default tgl hari ini (format YYYY-MM-DD)
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setTgl(today);
  }, []);

  // --- VALUE PARSING ---
  const numKemarin = parseFloat(kemarin) || 0;
  const numModal = parseFloat(modal) || 0;
  const numInject = parseFloat(inject) || 0;
  const numPosSys = parseFloat(posSys) || 0;
  const numQris = parseFloat(qris) || 0;
  const numShopee = parseFloat(shopee) || 0;
  const numGrab = parseFloat(grab) || 0;
  const numGofood = parseFloat(gofood) || 0;
  const numUangFisik = parseFloat(uangFisik) || 0;
  const numModalBsk = parseFloat(modalBsk) || 0;
  const numSetorKas = parseFloat(setorKas) || 0;
  const numSetorHo = parseFloat(setorHo) || 0;

  // --- PERHITUNGAN MATEMATIS CF ---
  const totalSaldoAwal = numKemarin + numModal + numInject;
  
  // TOTAL TUNAI = totalSaldoAwal + (POS_SYS - QRIS)
  const totalTunai = totalSaldoAwal + (numPosSys - numQris);

  // Total Pengeluaran Dinamis
  const totalDyn = dynExpenses.reduce((sum, item) => sum + (parseFloat(item.nom) || 0), 0);
  
  // Total Kasbon
  const totalKasbon = kasbons.reduce((sum, item) => sum + (parseFloat(item.nom) || 0), 0);

  // TOTAL PENGELUARAN = Total Dinamis + Total Kasbon
  const totalPengeluaran = totalDyn + totalKasbon;

  // SELISIH KAS = Uang Fisik - (Total Tunai - Total Pengeluaran)
  const selisih = numUangFisik - (totalTunai - totalPengeluaran);

  // --- UPDATE DYNAMIC EXPENSE FIELD ---
  const handleDynExpenseChange = (index, field, value) => {
    const updated = [...dynExpenses];
    updated[index][field] = value;
    setDynExpenses(updated);
  };

  // --- UPDATE KASBON FIELD ---
  const handleKasbonChange = (index, field, value) => {
    const updated = [...kasbons];
    updated[index][field] = value;
    setKasbons(updated);
  };

  // --- SUBMIT & CETAK CASHFLOW ---
  const handleProcessCashflow = async () => {
    if (!tgl || !pic) {
      alert("⚠️ Tanggal dan PIC wajib diisi!");
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    // Kumpulkan pengeluaran dinamis yang diisi
    const activeDynExpenses = dynExpenses
      .filter(x => x.kategori || x.ket || parseFloat(x.nom) > 0)
      .map(x => ({ kategori: x.kategori, ket: x.ket, nom: parseFloat(x.nom) || 0 }));

    // Struktur payload data untuk disimpan di GAS
    const payloadData = {
      tgl: tgl,
      pic: pic,
      a1: numKemarin,
      a2: numModal,
      a3: numInject,
      total_a: totalSaldoAwal,
      b1: numPosSys,
      b2: numQris,
      b3: numPosSys - numQris,
      c1: numShopee,
      c2: numGrab,
      c3: numGofood,
      total_c: numShopee + numGrab + numGofood,
      total_tunai_final: totalTunai,
      total_non_tunai_final: numQris + numShopee + numGrab + numGofood,
      e1: 0,
      e2: 0,
      e3: "Cek Rincian Dinamis",
      // Kasbon nama & nominal dipetakan k_n1 - k_n6, k_v1 - k_v6
      k_n1: kasbons[0].nama, k_v1: parseFloat(kasbons[0].nom) || 0,
      k_n2: kasbons[1].nama, k_v2: parseFloat(kasbons[1].nom) || 0,
      k_n3: kasbons[2].nama, k_v3: parseFloat(kasbons[2].nom) || 0,
      k_n4: kasbons[3].nama, k_v4: parseFloat(kasbons[3].nom) || 0,
      k_n5: kasbons[4].nama, k_v5: parseFloat(kasbons[4].nom) || 0,
      k_n6: kasbons[5].nama, k_v6: parseFloat(kasbons[5].nom) || 0,
      pengeluaran_dinamis: activeDynExpenses,
      total_e: totalPengeluaran,
      f1: "",
      f2: 0,
      g1: totalTunai - totalPengeluaran,
      g2: numUangFisik,
      g3: selisih,
      g4: ketSelisih,
      h1: numModalBsk,
      h2: numSetorKas,
      h3: numSetorHo
    };

    // Siapkan berkas PDF
    const cleanPic = cleanName(pic);
    const tglStr = formatDDMMYY(tgl);
    const jamStr = formatJam();
    const pdfFilename = `${cleanPic}_CASHFLOW_${tglStr}_${jamStr}.pdf`;

    // Ambil referensi dari document hidden element untuk PDF
    const element = printRef.current;
    
    // Set referensi nomor dan waktu cetak di PDF
    const refNumText = "CF-" + tglStr.replace(/-/g, "") + "-" + jamStr;
    const cetakWaktuText = new Date().toLocaleString('id-ID');
    document.getElementById('pdf-cf-ref').innerText = refNumText;
    document.getElementById('pdf-cf-cetak').innerText = cetakWaktuText;

    const opt = {
      margin: [0, 0, 0, 0],
      filename: pdfFilename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, allowTaint: true, scrollY: 0, windowWidth: 794 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
      // 1. Cetak PDF
      if (window.html2pdf) {
        await window.html2pdf().set(opt).from(element).save();
      }

      // 2. Kirim ke GAS
      await gasService.submitCashflow(payloadData);

      // 3. Tampilkan popup berhasil
      setPopupContent(`
        <b>Cashflow berhasil direkam!</b><br><br>
        Data harian tersimpan ke Google Sheets.<br>
        PDF <b>${pdfFilename}</b> telah diunduh.<br><br>
        Terima kasih, ${pic} atas laporan keuangan yang akurat. 🙏
      `);
      setShowPopup(true);
      
      setStatusMessage({ type: 'success', text: '✅ Tersimpan & Terunduh!' });
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: 'error', text: `❌ Proses gagal: ${err.message}` });
      alert(`Gagal memproses cashflow: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* INFO BANNER */}
      <div className="p-4 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-100 shadow-sm">
        ℹ️ Laporan PDF resmi akan digenerate otomatis saat Anda menekan tombol simpan.
      </div>

      {/* SECTION A: SALDO AWAL */}
      <section className="bg-card border border-border-soft rounded-2xl p-6 shadow-sm">
        <h3 className="text-xs font-extrabold text-white bg-accent-green py-2.5 px-4 rounded-t-xl -mx-6 -mt-6 mb-4 tracking-wider uppercase">
          A. SALDO AWAL
        </h3>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-extrabold text-text-muted tracking-wider uppercase mb-1">Tanggal</label>
              <input
                type="date"
                value={tgl}
                onChange={(e) => setTgl(e.target.value)}
                className="w-full py-2.5 px-3 bg-white border border-border-soft rounded-xl text-xs outline-none focus:border-accent-green focus:ring-1 focus:ring-accent-green"
              />
            </div>
            <div>
              <label className="text-[10px] font-extrabold text-text-muted tracking-wider uppercase mb-1">PIC</label>
              <input
                type="text"
                value={pic}
                onChange={(e) => setPic(e.target.value)}
                placeholder="Nama penanggung jawab"
                className="w-full py-2.5 px-3 bg-white border border-border-soft rounded-xl text-xs outline-none focus:border-accent-green focus:ring-1 focus:ring-accent-green"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-extrabold text-text-muted tracking-wider uppercase mb-1">Kemarin</label>
              <input
                type="number"
                value={kemarin}
                onChange={(e) => setKemarin(e.target.value)}
                placeholder="Rp"
                className="w-full py-2.5 px-2 bg-white border border-border-soft rounded-xl text-xs outline-none focus:border-accent-green focus:ring-1 focus:ring-accent-green"
              />
            </div>
            <div>
              <label className="text-[10px] font-extrabold text-text-muted tracking-wider uppercase mb-1">Modal</label>
              <input
                type="number"
                value={modal}
                onChange={(e) => setModal(e.target.value)}
                placeholder="Rp"
                className="w-full py-2.5 px-2 bg-white border border-border-soft rounded-xl text-xs outline-none focus:border-accent-green focus:ring-1 focus:ring-accent-green"
              />
            </div>
            <div>
              <label className="text-[10px] font-extrabold text-text-muted tracking-wider uppercase mb-1">Inject</label>
              <input
                type="number"
                value={inject}
                onChange={(e) => setInject(e.target.value)}
                placeholder="Rp"
                className="w-full py-2.5 px-2 bg-white border border-border-soft rounded-xl text-xs outline-none focus:border-accent-green focus:ring-1 focus:ring-accent-green"
              />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION B: PENDAPATAN & ONLINE */}
      <section className="bg-card border border-border-soft rounded-2xl p-6 shadow-sm">
        <h3 className="text-xs font-extrabold text-white bg-accent-green py-2.5 px-4 rounded-t-xl -mx-6 -mt-6 mb-4 tracking-wider uppercase">
          B. PENDAPATAN &amp; ONLINE
        </h3>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-extrabold text-text-muted tracking-wider uppercase mb-1">POS SYS</label>
              <input
                type="number"
                value={posSys}
                onChange={(e) => setPosSys(e.target.value)}
                placeholder="Omzet POS"
                className="w-full py-2.5 px-3 bg-white border border-border-soft rounded-xl text-xs outline-none focus:border-accent-green focus:ring-1 focus:ring-accent-green"
              />
            </div>
            <div>
              <label className="text-[10px] font-extrabold text-text-muted tracking-wider uppercase mb-1">QRIS</label>
              <input
                type="number"
                value={qris}
                onChange={(e) => setQris(e.target.value)}
                placeholder="Pemasukan QRIS"
                className="w-full py-2.5 px-3 bg-white border border-border-soft rounded-xl text-xs outline-none focus:border-accent-green focus:ring-1 focus:ring-accent-green"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-extrabold text-text-muted tracking-wider uppercase mb-1">SHOPEE</label>
              <input
                type="number"
                value={shopee}
                onChange={(e) => setShopee(e.target.value)}
                placeholder="ShopeeFood"
                className="w-full py-2.5 px-2 bg-white border border-border-soft rounded-xl text-xs outline-none focus:border-accent-green focus:ring-1 focus:ring-accent-green"
              />
            </div>
            <div>
              <label className="text-[10px] font-extrabold text-text-muted tracking-wider uppercase mb-1">GRAB</label>
              <input
                type="number"
                value={grab}
                onChange={(e) => setGrab(e.target.value)}
                placeholder="GrabFood"
                className="w-full py-2.5 px-2 bg-white border border-border-soft rounded-xl text-xs outline-none focus:border-accent-green focus:ring-1 focus:ring-accent-green"
              />
            </div>
            <div>
              <label className="text-[10px] font-extrabold text-text-muted tracking-wider uppercase mb-1">GOFOOD</label>
              <input
                type="number"
                value={gofood}
                onChange={(e) => setGofood(e.target.value)}
                placeholder="GoFood"
                className="w-full py-2.5 px-2 bg-white border border-border-soft rounded-xl text-xs outline-none focus:border-accent-green focus:ring-1 focus:ring-accent-green"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-extrabold text-text-muted tracking-wider uppercase mb-1">TOTAL TUNAI</label>
            <input
              type="text"
              readOnly
              value={fNum(totalTunai)}
              className="w-full py-2.5 px-3 bg-[#fffde7] border border-[#fff59d] rounded-xl text-xs font-bold text-[#d32f2f] outline-none"
            />
          </div>
        </div>
      </section>

      {/* SECTION C: RINCIAN PENGELUARAN FISIK LACI */}
      <section className="bg-card border border-border-soft rounded-2xl p-6 shadow-sm">
        <h3 className="text-xs font-extrabold text-white bg-amber-700 py-2.5 px-4 rounded-t-xl -mx-6 -mt-6 mb-4 tracking-wider uppercase">
          C. RINCIAN PENGELUARAN FISIK LACI
        </h3>

        <div className="space-y-4">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">Pengeluaran Dinamis</span>
            {dynExpenses.map((expense, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <select
                  value={expense.kategori}
                  onChange={(e) => handleDynExpenseChange(idx, 'kategori', e.target.value)}
                  className="flex-1 py-2 px-2 bg-white border border-border-soft rounded-xl text-[10px] outline-none focus:border-accent-green"
                >
                  <option value="">-Kategori-</option>
                  {KATEGORI_OPS.slice(1).map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={expense.ket}
                  onChange={(e) => handleDynExpenseChange(idx, 'ket', e.target.value)}
                  placeholder="Barang..."
                  className="flex-[1.5] py-2 px-3 bg-white border border-border-soft rounded-xl text-[10px] outline-none focus:border-accent-green"
                />
                <input
                  type="number"
                  value={expense.nom}
                  onChange={(e) => handleDynExpenseChange(idx, 'nom', e.target.value)}
                  placeholder="Rp"
                  className="flex-1 py-2 px-2 bg-white border border-border-soft rounded-xl text-[10px] outline-none focus:border-accent-green font-semibold"
                />
              </div>
            ))}
          </div>

          <hr className="border-t border-dashed border-border-soft" />

          <div className="space-y-2">
            <span className="text-[10px] font-bold text-accent-gold uppercase tracking-wider block mb-1">Kasbon Pegawai</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {kasbons.map((kb, idx) => (
                <div key={idx} className="flex gap-1.5 items-center">
                  <select
                    value={kb.nama}
                    onChange={(e) => handleKasbonChange(idx, 'nama', e.target.value)}
                    className="flex-1 py-2 px-2 bg-white border border-border-soft rounded-xl text-[10px] outline-none focus:border-accent-green"
                  >
                    <option value="">-Nama-</option>
                    {PEGAWAI_OPS.slice(1).map((name) => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={kb.nom}
                    onChange={(e) => handleKasbonChange(idx, 'nom', e.target.value)}
                    placeholder="Rp"
                    className="w-24 py-2 px-2 bg-white border border-border-soft rounded-xl text-[10px] outline-none focus:border-accent-green font-semibold"
                  />
                </div>
              ))}
            </div>
          </div>

          <hr className="border-t border-dashed border-border-soft" />

          <div>
            <label className="text-[10px] font-extrabold text-text-muted tracking-wider uppercase mb-1">TOTAL PENGELUARAN</label>
            <input
              type="text"
              readOnly
              value={fNum(totalPengeluaran)}
              className="w-full py-2.5 px-3 bg-[#fffde7] border border-[#fff59d] rounded-xl text-xs font-bold text-[#d32f2f] outline-none"
            />
          </div>
        </div>
      </section>

      {/* SECTION D: SETORAN & SELISIH */}
      <section className="bg-card border border-border-soft rounded-2xl p-6 shadow-sm">
        <h3 className="text-xs font-extrabold text-white bg-accent-green py-2.5 px-4 rounded-t-xl -mx-6 -mt-6 mb-4 tracking-wider uppercase">
          D. SETORAN &amp; SELISIH
        </h3>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-extrabold text-text-muted tracking-wider uppercase mb-1">UANG FISIK</label>
              <input
                type="number"
                value={uangFisik}
                onChange={(e) => setUangFisik(e.target.value)}
                placeholder="Uang fisik aktual"
                className="w-full py-2.5 px-3 bg-white border border-border-soft rounded-xl text-xs outline-none focus:border-accent-green focus:ring-1 focus:ring-accent-green font-bold"
              />
            </div>
            <div>
              <label className="text-[10px] font-extrabold text-text-muted tracking-wider uppercase mb-1">SELISIH</label>
              <input
                type="text"
                readOnly
                value={fNum(selisih)}
                className="w-full py-2.5 px-3 bg-[#fffde7] border border-[#fff59d] rounded-xl text-xs font-bold text-[#d32f2f] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-extrabold text-text-muted tracking-wider uppercase mb-1">KET SELISIH</label>
            <input
              type="text"
              value={ketSelisih}
              onChange={(e) => setKetSelisih(e.target.value)}
              placeholder="Catatan jika kas selisih"
              className="w-full py-2.5 px-3 bg-white border border-border-soft rounded-xl text-xs outline-none focus:border-accent-green focus:ring-1 focus:ring-accent-green"
            />
          </div>

          <hr className="border-t border-dashed border-border-soft" />

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-extrabold text-text-muted tracking-wider uppercase mb-1">MODAL BSK</label>
              <input
                type="number"
                value={modalBsk}
                onChange={(e) => setModalBsk(e.target.value)}
                placeholder="Rp"
                className="w-full py-2.5 px-2 bg-white border border-border-soft rounded-xl text-xs outline-none focus:border-accent-green focus:ring-1 focus:ring-accent-green font-semibold"
              />
            </div>
            <div>
              <label className="text-[10px] font-extrabold text-text-muted tracking-wider uppercase mb-1">SETOR KAS</label>
              <input
                type="number"
                value={setorKas}
                onChange={(e) => setSetorKas(e.target.value)}
                placeholder="Rp"
                className="w-full py-2.5 px-2 bg-white border border-border-soft rounded-xl text-xs outline-none focus:border-accent-green focus:ring-1 focus:ring-accent-green"
              />
            </div>
            <div>
              <label className="text-[10px] font-extrabold text-text-muted tracking-wider uppercase mb-1">SETOR HO</label>
              <input
                type="number"
                value={setorHo}
                onChange={(e) => setSetorHo(e.target.value)}
                placeholder="Rp"
                className="w-full py-2.5 px-2 bg-white border border-border-soft rounded-xl text-xs outline-none focus:border-accent-green focus:ring-1 focus:ring-accent-green"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ACTION BUTTON */}
      <button
        onClick={handleProcessCashflow}
        disabled={isSubmitting}
        className="w-full py-3.5 bg-accent-gold text-[#111] border-none rounded-xl font-bold tracking-widest text-xs uppercase cursor-pointer hover:bg-amber-500 active:scale-[0.98] transition-all duration-200 shadow-md shadow-accent-gold/10 disabled:opacity-50 disabled:cursor-not-allowed select-none"
      >
        {isSubmitting ? "⏳ SEDANG PROSES..." : "📥 CETAK PDF & SIMPAN"}
      </button>

      {/* STATUS MESSAGE */}
      {statusMessage && (
        <div className={`p-3 text-center font-bold border rounded-xl text-xs mt-2
          ${statusMessage.type === 'success' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : ''}
          ${statusMessage.type === 'error' ? 'bg-rose-100 text-rose-800 border-rose-200' : ''}
        `}>
          {statusMessage.text}
        </div>
      )}

      {/* POPUP OVERLAY SUKSES */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 transition-all duration-300">
          <div className="bg-white rounded-2xl p-8 text-center max-w-sm w-full shadow-2xl scale-100 animate-[popIn_0.3s_ease]">
            <div className="text-5xl mb-3">✅</div>
            <h4 className="text-base font-extrabold text-accent-green uppercase tracking-wide mb-2">
              Terima Kasih!
            </h4>
            <div 
              className="text-xs text-text-muted leading-relaxed mb-6 font-medium"
              dangerouslySetInnerHTML={{ __html: popupContent }}
            />
            <button
              onClick={() => setShowPopup(false)}
              className="py-2.5 px-6 bg-accent-green text-white font-bold text-xs border-none rounded-xl tracking-wider uppercase cursor-pointer hover:bg-accent-hover transition-all duration-200"
            >
              TUTUP
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TEMPLATE DOKUMEN PDF (HIDDEN SECARA VISUAL) */}
      {/* ========================================================= */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0, zIndex: -1000 }}>
        <div ref={printRef} id="pdf-cashflow" className="pdf-page">
          <div className="pdf-header-bar">
            <div>
              <div className="pdf-brand">MEREMPAH</div>
              <div className="pdf-brand-sub">CAFE &amp; SPICE · DAILY FINANCIAL REPORT</div>
            </div>
            <div className="pdf-ref-block">
              MT103 REF: <span id="pdf-cf-ref"></span><br />
              <span id="pdf-cf-cetak"></span>
            </div>
          </div>
          <div className="pdf-doc-title">DAILY CASHFLOW &amp; REKONSILIASI KAS</div>
          <div className="pdf-meta">
            <span>TANGGAL : <b>{tgl || '-'}</b></span>
            <span>PIC SHIFT : <b>{(pic || 'UNKNOWN').toUpperCase()}</b></span>
          </div>
          <div className="pdf-divider"></div>

          <div className="pdf-section-label">[A] SALDO &amp; KAS MASUK</div>
          <div className="pdf-row indent"><span>01 · Saldo Hari Kemarin</span><span>{fNum(kemarin)}</span></div>
          <div className="pdf-row indent"><span>02 · Modal Kasir</span><span>{fNum(modal)}</span></div>
          <div className="pdf-row indent"><span>03 · Inject / Tambahan HO</span><span>{fNum(inject)}</span></div>
          <div className="pdf-row total"><span>TOTAL SALDO AWAL</span><span>{fNum(totalSaldoAwal)}</span></div>

          <div className="pdf-section-label" style={{ marginTop: '5px' }}>[B] PENDAPATAN</div>
          <div className="pdf-row indent"><span>04 · Omzet POS Sistem (Tunai)</span><span>{fNum(posSys)}</span></div>
          <div className="pdf-row indent"><span>05 · QRIS (Non-Tunai, dikurangi)</span><span>{"(" + fNum(qris) + ")"}</span></div>
          <div className="pdf-row indent"><span>06 · Shopee Food</span><span>{fNum(shopee)}</span></div>
          <div className="pdf-row indent"><span>07 · GrabFood</span><span>{fNum(grab)}</span></div>
          <div className="pdf-row indent"><span>08 · GoFood</span><span>{fNum(gofood)}</span></div>
          <div className="pdf-row total"><span>TOTAL TUNAI SEHARUSNYA</span><span>{fNum(totalTunai)}</span></div>

          <div className="pdf-section-label" style={{ marginTop: '5px' }}>[C] PENGELUARAN KAS LACI</div>
          <table className="pdf-table">
            <thead>
              <tr>
                <th>KATEGORI</th>
                <th>KETERANGAN</th>
                <th className="right">NOMINAL (Rp)</th>
              </tr>
            </thead>
            <tbody>
              {/* Dinamis list */}
              {dynExpenses.filter(x => x.kategori || x.ket || parseFloat(x.nom) > 0).map((x, i) => (
                <tr key={'dyn-' + i}>
                  <td>{x.kategori || '-'}</td>
                  <td>{x.ket || '-'}</td>
                  <td className="right">{fNum(x.nom)}</td>
                </tr>
              ))}
              {/* Kasbon list */}
              {kasbons.filter(x => x.nama && parseFloat(x.nom) > 0).map((x, i) => (
                <tr key={'kb-' + i}>
                  <td>Kasbon</td>
                  <td>{x.nama}</td>
                  <td className="right">{fNum(x.nom)}</td>
                </tr>
              ))}
              {/* Jika kosong */}
              {dynExpenses.filter(x => x.kategori || x.ket || parseFloat(x.nom) > 0).length === 0 && 
               kasbons.filter(x => x.nama && parseFloat(x.nom) > 0).length === 0 && (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', fontStyle: 'italic' }}>NIL / TIDAK ADA PENGELUARAN</td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="2" className="right"><b>TOTAL PENGELUARAN</b></td>
                <td className="right"><b>{fNum(totalPengeluaran)}</b></td>
              </tr>
            </tfoot>
          </table>

          <div className="pdf-section-label" style={{ marginTop: '5px' }}>[D] REKONSILIASI &amp; DISTRIBUSI</div>
          <div className="pdf-row indent"><span>Saldo Sistem (Tunai − Pengeluaran)</span><span>{fNum(totalTunai - totalPengeluaran)}</span></div>
          <div className="pdf-row indent"><span>Perhitungan Fisik Laci (Aktual)</span><span>{fNum(uangFisik)}</span></div>
          <div className="pdf-row total"><span>SELISIH KAS</span><span>{fNum(selisih)}</span></div>
          <div className="pdf-row indent" style={{ fontSize: '7pt' }}>
            <span>*Keterangan : <span>{ketSelisih || '-'}</span></span>
          </div>
          <div className="pdf-divider-dash"></div>
          <div className="pdf-row indent"><span>Modal Shift Berikutnya</span><span>{fNum(modalBsk)}</span></div>
          <div className="pdf-row indent"><span>Setor ke Kas Besar (Brankas)</span><span>{fNum(setorKas)}</span></div>
          <div className="pdf-row indent"><span>Setor ke Pusat (HO)</span><span>{fNum(setorHo)}</span></div>

          <div className="pdf-legal">
            PERHATIAN: Dokumen ini digenerate secara otomatis oleh sistem (MT103 Internal Reference). Seluruh penggunaan kas laci dan kas besar wajib mendapatkan persetujuan di grup management operasional sebelum diambil.
          </div>
          <div className="pdf-sig-row">
            <div className="pdf-sig-box">
              <div className="pdf-sig-line">
                PIC Shift<br />
                <b>{(pic || '...........').toUpperCase()}</b>
              </div>
            </div>
            <div className="pdf-sig-box">
              <div className="pdf-sig-line">
                Mengetahui<br />
                MANAGEMENT
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
