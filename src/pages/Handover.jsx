import React, { useState, useEffect, useRef } from 'react';
import { gasService } from '../services/gasService';
import { fNum, formatDTLocalDDMMYY, formatJam, cleanName } from '../utils/format';

export function Handover() {
  // --- STATE PENARIKAN DATA AUTOMATIS ---
  const [loadingModal, setLoadingModal] = useState('loading'); // 'loading', 'success', 'error'
  const [fetchedModalVal, setFetchedModalVal] = useState(0);
  const [omzetAkumulasiSebelumnya, setOmzetAkumulasiSebelumnya] = useState(0);

  // --- STATE DATA FORM ---
  const [waktu, setWaktu] = useState('');
  const [stafLama, setStafLama] = useState('');
  const [stafBaru, setStafBaru] = useState('');
  const [modalLaci, setModalLaci] = useState('');
  const [omzetPosTotal, setOmzetPosTotal] = useState('');
  const [omzetTunai, setOmzetTunai] = useState('');
  const [pengeluaran, setPengeluaran] = useState('');
  const [rincianPengeluaran, setRincianPengeluaran] = useState('');
  const [catatanStok, setCatatanStok] = useState('');
  const [fisikLaci, setFisikLaci] = useState('');
  const [setorKas, setSetorKas] = useState('');

  // Checkbox Kebersihan & Operasional (7 items)
  const [checklists, setChecklists] = useState(Array(7).fill(false));
  
  // Checkbox TTD Digital
  const [accLama, setAccLama] = useState(false);
  const [accBaru, setAccBaru] = useState(false);

  // --- STATE ACTION & LOADING ---
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupContent, setPopupContent] = useState('');
  const [statusMessage, setStatusMessage] = useState(null);

  // Reference untuk PDF Render element
  const printRef = useRef(null);

  // --- window.onload / useEffect MOUNT ---
  useEffect(() => {
    // Set default waktu lokal sekarang (format YYYY-MM-DDTHH:MM)
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    setWaktu(now.toISOString().slice(0, 16));

    // Tarik data modal otomatis dari GAS
    gasService.getModalData()
      .then(res => {
        const modal = res.modal || 0;
        setFetchedModalVal(modal);
        setModalLaci(modal);
        
        const omzetAkumulasi = res.omzetAkumulasiTerakhir || 0;
        setOmzetAkumulasiSebelumnya(omzetAkumulasi);
        
        setLoadingModal('success');
      })
      .catch(err => {
        console.error("Gagal getModal:", err);
        setLoadingModal('error');
      });
  }, []);

  // --- CHECKBOX TOGGLE ---
  const toggleChecklist = (index) => {
    const updated = [...checklists];
    updated[index] = !updated[index];
    setChecklists(updated);
  };

  // --- PERHITUNGAN MATEMATIS ---
  const numModalLaci = parseFloat(modalLaci) || 0;
  const numOmzetPosTotal = parseFloat(omzetPosTotal) || 0;
  const numOmzetTunai = parseFloat(omzetTunai) || 0;
  const numPengeluaran = parseFloat(pengeluaran) || 0;
  const numFisikLaci = parseFloat(fisikLaci) || 0;
  const numSetorKas = parseFloat(setorKas) || 0;

  // Akumulasi sekarang - akumulasi sebelumnya
  const omzetShiftIni = numOmzetPosTotal - omzetAkumulasiSebelumnya;

  // TOTAL SISTEM (A) = Modal Awal + Omzet Tunai - Pengeluaran
  const totalSistem = numModalLaci + numOmzetTunai - numPengeluaran;

  // SELISIH = Fisik Laci (B) - Total Sistem (A)
  const selisih = numFisikLaci - totalSistem;

  // MODAL DITINGGAL = Fisik Laci (B) - Setor Kas Besar
  const modalDitinggal = numFisikLaci - numSetorKas;

  // --- SUBMIT & CETAK HANDOVER ---
  const handleProcessHandover = async () => {
    // 1. Validasi 7 Checklist
    if (!checklists.every(item => item)) {
      alert("⚠️ Selesaikan ke-7 item checklist kebersihan & operasional!");
      return;
    }
    // 2. Validasi TTD Digital
    if (!accLama || !accBaru) {
      alert("⚠️ Centang Tanda Tangan Digital Otorisasi!");
      return;
    }
    // 3. Validasi Field Wajib
    if (!stafLama || !stafBaru) {
      alert("⚠️ Staf Lama dan Staf Baru wajib diisi!");
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    // Kumpulkan payload data untuk dikirim ke GAS
    const payloadData = {
      waktu: waktu,
      staf_lama: stafLama,
      staf_baru: stafBaru,
      modal_awal: numModalLaci,
      omzet_tunai: numOmzetTunai,
      pengeluaran: numPengeluaran,
      sistem_a: totalSistem,
      fisik_b: numFisikLaci,
      selisih: selisih,
      ket_selisih: document.getElementById('h_ket_selisih_ref')?.value || '',
      setor_kasbesar: numSetorKas,
      modal_ditinggal: modalDitinggal,
      acc_lama: "TTD Valid",
      acc_baru: "TTD Valid",
      status_checklist: "Selesai 7/7",
      ket_keluar: rincianPengeluaran,
      catatan: catatanStok,
      omzet_akumulasi_pos: numOmzetPosTotal,
      omzet_akumulasi_sebelumnya: omzetAkumulasiSebelumnya,
      omzet_per_shift: Math.max(0, omzetShiftIni)
    };

    // Siapkan berkas PDF
    const cleanLama = cleanName(stafLama);
    const cleanBaru = cleanName(stafBaru);
    const tglStr = formatDTLocalDDMMYY(waktu);
    const jamStr = formatJam();
    const pdfFilename = `${cleanLama}_${cleanBaru}_HANDOVER_${tglStr}_${jamStr}.pdf`;

    // Ambil referensi dari document hidden element untuk PDF
    const element = printRef.current;
    
    // Set referensi nomor dan waktu cetak di PDF
    const refNumText = "HO-" + tglStr + "-" + jamStr;
    const cetakWaktuText = new Date().toLocaleString('id-ID');
    document.getElementById('pdf-ref-text').innerText = refNumText;
    document.getElementById('pdf-cetak-text').innerText = cetakWaktuText;

    const opt = {
      margin: [0, 0, 0, 0],
      filename: pdfFilename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, allowTaint: true, scrollY: 0, windowWidth: 794 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
      // 1. Eksekusi Cetak PDF secara Lokal
      if (window.html2pdf) {
        await window.html2pdf().set(opt).from(element).save();
      } else {
        console.warn("Library html2pdf tidak ditemukan di window.");
      }

      // 2. Submit data ke Google Sheet via Apps Script
      await gasService.submitHandover(payloadData);

      // 3. Update status berhasil
      setPopupContent(`
        <b>Handover berhasil direkam!</b><br><br>
        Data shift tersimpan ke Google Sheets.<br>
        PDF <b>${pdfFilename}</b> telah diunduh.<br><br>
        ⚡ Omzet shift ini: <b>${fNum(Math.max(0, omzetShiftIni))}</b><br><br>
        Terima kasih telah menyelesaikan prosedur handover. 🙏
      `);
      setShowPopup(true);
      
      // Update omzet akumulasi lokal agar sinkron untuk input selanjutnya
      setOmzetAkumulasiSebelumnya(numOmzetPosTotal);
      
      // Reset checklist & TTD digital setelah sukses
      setChecklists(Array(7).fill(false));
      setAccLama(false);
      setAccBaru(false);
      
      setStatusMessage({ type: 'success', text: '✅ Handover Disimpan & Terunduh!' });
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: 'error', text: `❌ Proses gagal: ${err.message}` });
      alert(`Gagal memproses handover: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* STATUS LOADING AUTOMATIS MODAL & OMZET */}
      <div className={`p-4 rounded-xl text-xs font-semibold border transition-all duration-300 shadow-sm
        ${loadingModal === 'loading' ? 'bg-amber-50 text-amber-800 border-amber-200 animate-pulse' : ''}
        ${loadingModal === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-100' : ''}
        ${loadingModal === 'error' ? 'bg-rose-50 text-rose-800 border-rose-100' : ''}
      `}>
        <div className="flex items-center gap-2">
          <span>⚠️</span>
          <span>Harap selesaikan 7 item checklist sebelum handover fisik.</span>
        </div>
        <div className="mt-1.5 font-bold">
          {loadingModal === 'loading' && "🔄 Sedang menarik data modal awal otomatis..."}
          {loadingModal === 'success' && `✅ Modal Awal ${fNum(fetchedModalVal)} & data akumulasi omzet berhasil ditarik otomatis.`}
          {loadingModal === 'error' && "⚠️ Gagal tarik data otomatis. Isi modal & omzet akumulasi secara manual."}
        </div>
      </div>

      {/* SECTION A: CHECKLIST AREA & OPERASIONAL */}
      <section className="bg-card border border-border-soft rounded-2xl p-6 shadow-sm">
        <h3 className="text-xs font-extrabold text-white bg-accent-green py-2.5 px-4 rounded-t-xl -mx-6 -mt-6 mb-4 tracking-wider uppercase">
          A. CHECKLIST AREA &amp; OPERASIONAL
        </h3>
        
        <div className="space-y-4">
          <div>
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-2">Area Kebersihan</span>
            <div className="bg-bg-cream/40 border border-border-soft/40 p-3 rounded-xl space-y-2">
              {[
                "1. Lantai sudah disapu & dipel",
                "2. Meja & kursi sudah dilap",
                "3. Area bar/dapur bersih & rapi",
                "4. Toilet dicek & dibersihkan",
                "5. Sampah sudah dibuang"
              ].map((item, idx) => (
                <label key={idx} className="flex items-start gap-3 text-xs font-medium cursor-pointer text-text-main select-none">
                  <input
                    type="checkbox"
                    checked={checklists[idx]}
                    onChange={() => toggleChecklist(idx)}
                    className="w-4 h-4 accent-accent-green rounded cursor-pointer mt-0.5"
                  />
                  <span>{item}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-2">Persiapan Operasional</span>
            <div className="bg-bg-cream/40 border border-border-soft/40 p-3 rounded-xl space-y-2">
              {[
                "6. Peralatan sudah dicuci",
                "7. Lampu non-operasional mati"
              ].map((item, idx) => {
                const actualIdx = idx + 5;
                return (
                  <label key={actualIdx} className="flex items-start gap-3 text-xs font-medium cursor-pointer text-text-main select-none">
                    <input
                      type="checkbox"
                      checked={checklists[actualIdx]}
                      onChange={() => toggleChecklist(actualIdx)}
                      className="w-4 h-4 accent-accent-green rounded cursor-pointer mt-0.5"
                    />
                    <span>{item}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION B: INFO SHIFT & KAS LACI */}
      <section className="bg-card border border-border-soft rounded-2xl p-6 shadow-sm">
        <h3 className="text-xs font-extrabold text-white bg-accent-green py-2.5 px-4 rounded-t-xl -mx-6 -mt-6 mb-4 tracking-wider uppercase">
          B. INFO SHIFT &amp; KAS LACI
        </h3>

        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-extrabold text-text-muted tracking-wider uppercase mb-1">Waktu</label>
            <input
              type="datetime-local"
              value={waktu}
              onChange={(e) => setWaktu(e.target.value)}
              className="w-full py-2.5 px-3 bg-white border border-border-soft rounded-xl text-xs outline-none focus:border-accent-green focus:ring-1 focus:ring-accent-green"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-extrabold text-text-muted tracking-wider uppercase mb-1">Staf Lama</label>
              <input
                type="text"
                value={stafLama}
                onChange={(e) => setStafLama(e.target.value)}
                placeholder="Nama staf keluar"
                className="w-full py-2.5 px-3 bg-white border border-border-soft rounded-xl text-xs outline-none focus:border-accent-green focus:ring-1 focus:ring-accent-green"
              />
            </div>
            <div>
              <label className="text-[10px] font-extrabold text-text-muted tracking-wider uppercase mb-1">Staf Baru</label>
              <input
                type="text"
                value={stafBaru}
                onChange={(e) => setStafBaru(e.target.value)}
                placeholder="Nama staf masuk"
                className="w-full py-2.5 px-3 bg-white border border-border-soft rounded-xl text-xs outline-none focus:border-accent-green focus:ring-1 focus:ring-accent-green"
              />
            </div>
          </div>

          {/* BOX MODAL KASIR SEBELUMNYA */}
          <div className="bg-gradient-to-br from-[#0f3460] to-[#16213e] rounded-xl p-4 text-white shadow-sm border border-[#64b5f6]/20">
            <div className="text-[9px] font-bold text-[#90caf9] tracking-wider uppercase">
              💰 Modal Kasir Otomatis dari Shift Sebelumnya
            </div>
            <div className="text-xl font-black text-[#64b5f6] mt-1">
              {fNum(fetchedModalVal)}
            </div>
            <div className="text-[9px] text-[#90caf9]/80 mt-1">
              *Nilai ini diambil dari "Modal Ditinggal" handover terakhir. Edit jika ada koreksi.
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-extrabold text-text-muted tracking-wider uppercase mb-1">Modal Laci (Otomatis)</label>
              <input
                type="number"
                value={modalLaci}
                onChange={(e) => setModalLaci(e.target.value)}
                className="w-full py-2.5 px-3 bg-white border border-border-soft rounded-xl text-xs outline-none focus:border-accent-green focus:ring-1 focus:ring-accent-green font-semibold"
              />
            </div>
            <div>
              <label className="text-[10px] font-extrabold text-text-muted tracking-wider uppercase mb-1">Omzet POS Total (Akumulasi)</label>
              <input
                type="number"
                value={omzetPosTotal}
                onChange={(e) => setOmzetPosTotal(e.target.value)}
                placeholder="Total akumulasi mesin"
                className="w-full py-2.5 px-3 bg-white border border-border-soft rounded-xl text-xs outline-none focus:border-accent-green focus:ring-1 focus:ring-accent-green"
              />
            </div>
          </div>

          {/* BOX DETAIL OMZET PER SHIFT */}
          {(numOmzetPosTotal > 0 || omzetAkumulasiSebelumnya > 0) && (
            <div className="bg-gradient-to-br from-accent-green to-[#2d6a4f] rounded-xl p-4 text-white shadow-sm border border-emerald-500/20">
              <div className="text-[9px] font-bold text-emerald-200 tracking-wider uppercase">
                📊 Rekap Omzet Per Shift
              </div>
              <div className="flex justify-between items-center text-[10px] py-1 border-b border-white/10">
                <span className="text-emerald-200">Akumulasi handover sebelumnya:</span>
                <span className="font-semibold">{fNum(omzetAkumulasiSebelumnya)}</span>
              </div>
              <div className="flex justify-between items-center text-[10px] py-1 border-b border-white/10">
                <span className="text-emerald-200">Akumulasi sekarang (input):</span>
                <span className="font-semibold">{fNum(numOmzetPosTotal)}</span>
              </div>
              <div className="flex justify-between items-center bg-white/10 rounded-lg px-3 py-2 mt-2">
                <span className="text-xs font-bold text-amber-300">⚡ OMZET SHIFT INI</span>
                <span className={`text-sm font-black ${omzetShiftIni < 0 ? 'text-rose-400' : 'text-amber-300'}`}>
                  {fNum(omzetShiftIni)}
                </span>
              </div>
              <p className="text-[9px] text-emerald-200/70 mt-2 leading-relaxed">
                *Omzet shift = Akumulasi sekarang − Akumulasi handover sebelumnya.<br />
                Jika bertanda minus, kemungkinan mesin POS direset. Konfirmasi ke management.
              </p>
            </div>
          )}

          <div>
            <label className="text-[10px] font-extrabold text-text-muted tracking-wider uppercase mb-1">
              Omzet Tunai Laci Shift Ini (untuk rekonsiliasi kas)
            </label>
            <input
              type="number"
              value={omzetTunai}
              onChange={(e) => setOmzetTunai(e.target.value)}
              placeholder="Nominal tunai yang masuk ke laci shift ini"
              className="w-full py-2.5 px-3 bg-white border border-border-soft rounded-xl text-xs outline-none focus:border-accent-green focus:ring-1 focus:ring-accent-green"
            />
            <p className="text-[9px] text-text-muted/80 mt-1">
              *Isi dengan tunai yang masuk ke laci (POS tunai, bukan QRIS/online). Biasanya sama dengan Omzet Shift.
            </p>
          </div>

          <hr className="border-t border-dashed border-border-soft" />

          <div>
            <label className="text-[10px] font-extrabold text-text-muted tracking-wider uppercase mb-1">Total Pengeluaran Shift</label>
            <input
              type="number"
              value={pengeluaran}
              onChange={(e) => setPengeluaran(e.target.value)}
              placeholder="Total Nominal Rp"
              className="w-full py-2.5 px-3 bg-white border border-border-soft rounded-xl text-xs outline-none focus:border-accent-green focus:ring-1 focus:ring-accent-green"
            />
          </div>

          <div>
            <label className="text-[10px] font-extrabold text-text-muted tracking-wider uppercase mb-1">Rincian Pengeluaran Shift</label>
            <textarea
              value={rincianPengeluaran}
              onChange={(e) => setRincianPengeluaran(e.target.value)}
              rows="2"
              placeholder="Format: Nama pengeluaran, Nominal;"
              className="w-full py-2.5 px-3 bg-white border border-border-soft rounded-xl text-xs outline-none focus:border-accent-green focus:ring-1 focus:ring-accent-green font-sans"
            />
          </div>

          <div>
            <label className="text-[10px] font-extrabold text-text-muted tracking-wider uppercase mb-1">TOTAL SISTEM (A)</label>
            <input
              type="text"
              readOnly
              value={fNum(totalSistem)}
              className="w-full py-2.5 px-3 bg-[#fffde7] border border-[#fff59d] rounded-xl text-xs font-bold text-[#d32f2f] outline-none"
            />
          </div>
        </div>
      </section>

      {/* SECTION C: INFO BAHAN BAKU HABIS */}
      <section className="bg-card border border-border-soft rounded-2xl p-6 shadow-sm">
        <h3 className="text-xs font-extrabold text-white bg-amber-700 py-2.5 px-4 rounded-t-xl -mx-6 -mt-6 mb-4 tracking-wider uppercase">
          C. INFO BAHAN BAKU HABIS
        </h3>
        
        <div>
          <label className="text-[10px] font-extrabold text-text-muted tracking-wider uppercase mb-1">Catatan / Stok Tipis</label>
          <textarea
            value={catatanStok}
            onChange={(e) => setCatatanStok(e.target.value)}
            rows="2"
            placeholder="Contoh: Susu UHT sisa 1 karton, Gula aren habis."
            className="w-full py-2.5 px-3 bg-white border border-border-soft rounded-xl text-xs outline-none focus:border-accent-green focus:ring-1 focus:ring-accent-green font-sans"
          />
        </div>
      </section>

      {/* SECTION D: AKTUAL & SETORAN */}
      <section className="bg-card border border-border-soft rounded-2xl p-6 shadow-sm">
        <h3 className="text-xs font-extrabold text-white bg-accent-green py-2.5 px-4 rounded-t-xl -mx-6 -mt-6 mb-4 tracking-wider uppercase">
          D. AKTUAL &amp; SETORAN
        </h3>

        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-extrabold text-text-muted tracking-wider uppercase mb-1">FISIK LACI (B)</label>
            <input
              type="number"
              value={fisikLaci}
              onChange={(e) => setFisikLaci(e.target.value)}
              placeholder="Jumlah uang fisik asli di laci"
              className="w-full py-2.5 px-3 bg-white border border-border-soft rounded-xl text-xs outline-none focus:border-accent-green focus:ring-1 focus:ring-accent-green font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-extrabold text-text-muted tracking-wider uppercase mb-1">SELISIH</label>
              <input
                type="text"
                readOnly
                value={fNum(selisih)}
                className="w-full py-2.5 px-3 bg-[#fffde7] border border-[#fff59d] rounded-xl text-xs font-bold text-[#d32f2f] outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-extrabold text-text-muted tracking-wider uppercase mb-1">Ket. Selisih</label>
              <input
                id="h_ket_selisih_ref"
                type="text"
                placeholder="Penyebab selisih kas"
                className="w-full py-2.5 px-3 bg-white border border-border-soft rounded-xl text-xs outline-none focus:border-accent-green focus:ring-1 focus:ring-accent-green"
              />
            </div>
          </div>

          <hr className="border-t border-dashed border-border-soft" />

          <div>
            <label className="text-[10px] font-extrabold text-text-muted tracking-wider uppercase mb-1">SETOR KAS BESAR</label>
            <input
              type="number"
              value={setorKas}
              onChange={(e) => setSetorKas(e.target.value)}
              placeholder="Uang yang disetor ke brankas/kas besar"
              className="w-full py-2.5 px-3 bg-white border border-border-soft rounded-xl text-xs outline-none focus:border-accent-green focus:ring-1 focus:ring-accent-green"
            />
          </div>

          <div>
            <label className="text-[10px] font-extrabold text-text-muted tracking-wider uppercase mb-1">MODAL TERTINGGAL (untuk shift berikutnya)</label>
            <input
              type="text"
              readOnly
              value={fNum(modalDitinggal)}
              className="w-full py-2.5 px-3 bg-[#fffde7] border border-[#fff59d] rounded-xl text-xs font-bold text-[#d32f2f] outline-none"
            />
          </div>
        </div>
      </section>

      {/* SECTION E: TANDA TANGAN DIGITAL */}
      <section className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 shadow-sm space-y-3">
        <h3 className="text-xs font-extrabold text-white bg-emerald-800 py-2.5 px-4 rounded-t-xl -mx-6 -mt-6 mb-4 tracking-wider uppercase">
          E. TANDA TANGAN DIGITAL
        </h3>

        <label className="flex items-center gap-3 text-xs font-bold cursor-pointer text-emerald-950 select-none">
          <input
            type="checkbox"
            checked={accLama}
            onChange={() => setAccLama(!accLama)}
            className="w-4 h-4 accent-emerald-800 rounded cursor-pointer"
          />
          <span>SAYA STAF LAMA SETUJU DATA BENAR</span>
        </label>
        <label className="flex items-center gap-3 text-xs font-bold cursor-pointer text-emerald-950 select-none">
          <input
            type="checkbox"
            checked={accBaru}
            onChange={() => setAccBaru(!accBaru)}
            className="w-4 h-4 accent-emerald-800 rounded cursor-pointer"
          />
          <span>SAYA STAF BARU MENERIMA KAS FISIK</span>
        </label>
      </section>

      {/* ACTION BUTTON */}
      <button
        onClick={handleProcessHandover}
        disabled={isSubmitting}
        className="w-full py-3.5 bg-accent-green text-white border-none rounded-xl font-bold tracking-widest text-xs uppercase cursor-pointer hover:bg-accent-hover active:scale-[0.98] transition-all duration-200 shadow-md shadow-accent-green/10 disabled:opacity-50 disabled:cursor-not-allowed select-none"
      >
        {isSubmitting ? "⏳ SEDANG PROSES..." : "💾 SIMPAN & CETAK PDF"}
      </button>

      {/* STATUS MESSAGE BOX */}
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
        <div ref={printRef} id="pdf-handover" className="pdf-page">
          <div className="pdf-header-bar">
            <div>
              <div className="pdf-brand">MEREMPAH</div>
              <div className="pdf-brand-sub">CAFE &amp; SPICE · INTERNAL DOCUMENT</div>
            </div>
            <div className="pdf-ref-block">
              REF: <span id="pdf-ref-text"></span><br />
              <span id="pdf-cetak-text"></span>
            </div>
          </div>
          <div className="pdf-doc-title">BERITA ACARA HANDOVER KAS SHIFT</div>
          <div className="pdf-meta">
            <span>WAKTU HANDOVER : <b>{waktu ? waktu.replace('T', ' ') : '-'}</b></span>
            <span>STATUS : <b>TERVERIFIKASI DIGITAL</b></span>
          </div>
          <div className="pdf-meta">
            <span>STAF KELUAR : <b>{(stafLama || '-').toUpperCase()}</b></span>
            <span>STAF MASUK : <b>{(stafBaru || '-').toUpperCase()}</b></span>
          </div>
          <div className="pdf-divider"></div>

          <div className="pdf-section-label">[A] REKONSILIASI KAS SHIFT</div>
          <div className="pdf-row indent"><span>01 · Modal Awal / Saldo Dibawa</span><span>{fNum(modalLaci)}</span></div>
          <div className="pdf-row indent"><span>02 · Omzet Tunai Laci Shift Ini</span><span>{fNum(omzetTunai)}</span></div>
          <div className="pdf-row indent"><span>03 · Total Pengeluaran Shift</span><span>{fNum(pengeluaran)}</span></div>
          <div className="pdf-row total"><span>TOTAL SISTEM (A) = 01+02−03</span><span>{fNum(totalSistem)}</span></div>

          <div className="pdf-section-label" style={{ marginTop: '6px' }}>[B] PERTUMBUHAN OMZET PER SHIFT</div>
          <div className="pdf-row indent"><span>Akumulasi POS handover sebelumnya</span><span>{fNum(omzetAkumulasiSebelumnya)}</span></div>
          <div className="pdf-row indent"><span>Akumulasi POS saat handover ini</span><span>{fNum(omzetPosTotal)}</span></div>
          <div className="pdf-row highlight">
            <span><b>⚡ OMZET BERSIH SHIFT INI</b></span>
            <span><b>{fNum(Math.max(0, omzetShiftIni))}</b></span>
          </div>

          <div className="pdf-section-label" style={{ marginTop: '6px' }}>[C] DETAIL PENGELUARAN SHIFT</div>
          <div className="pdf-row indent" style={{ fontSize: '7.5pt', color: '#444' }}>
            <span style={{ wordBreak: 'break-word', maxWidth: '90%' }}>
              {rincianPengeluaran || '(tidak ada rincian)'}
            </span>
          </div>

          <div className="pdf-section-label" style={{ marginTop: '6px' }}>[D] VERIFIKASI FISIK &amp; SETOR</div>
          <div className="pdf-row indent"><span>04 · Fisik Aktual Laci Dihitung (B)</span><span>{fNum(fisikLaci)}</span></div>
          <div className="pdf-row indent bold"><span>05 · SELISIH (B − A)</span><span>{fNum(selisih)}</span></div>
          <div className="pdf-row indent">
            <span>      Keterangan Selisih</span>
            <span>{document.getElementById('h_ket_selisih_ref')?.value || '-'}</span>
          </div>
          <div className="pdf-divider-dash"></div>
          <div className="pdf-row indent"><span>06 · Disetor ke Kas Besar</span><span>{fNum(setorKas)}</span></div>
          <div className="pdf-row indent bold"><span>07 · MODAL DITINGGAL UNTUK SHIFT BARU</span><span>{fNum(modalDitinggal)}</span></div>

          <div className="pdf-section-label" style={{ marginTop: '6px' }}>[E] CATATAN BAHAN BAKU / STOK</div>
          <div style={{ fontSize: '7.5pt', padding: '3px 12px', wordBreak: 'break-word' }}>
            {catatanStok || '(tidak ada catatan)'}
          </div>

          <div className="pdf-section-label" style={{ marginTop: '6px' }}>[F] OTORISASI DIGITAL</div>
          <div className="pdf-row indent"><span>Staf Keluar :</span><span>✅ DISETUJUI — DATA DINYATAKAN BENAR</span></div>
          <div className="pdf-row indent"><span>Staf Masuk :</span><span>✅ DITERIMA — KAS FISIK DITERIMA</span></div>
          <div className="pdf-row indent"><span>Checklist :</span><span>✅ SELESAI 7/7 ITEM</span></div>

          <div className="pdf-legal">
            PERHATIAN: Dokumen handover ini digenerate otomatis oleh Sistem Operasional Merempah dan bersifat mengikat secara prosedural. Setiap selisih kas wajib dilaporkan kepada Management. Staf penerima shift bertanggung jawab atas kebenaran kas yang dinyatakan diterima.
          </div>
          <div className="pdf-sig-row">
            <div className="pdf-sig-box">
              <div className="pdf-sig-line">
                Staf Keluar<br />
                <b>{(stafLama || '...........').toUpperCase()}</b>
              </div>
            </div>
            <div className="pdf-sig-box">
              <div className="pdf-sig-line">
                Staf Masuk<br />
                <b>{(stafBaru || '...........').toUpperCase()}</b>
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
