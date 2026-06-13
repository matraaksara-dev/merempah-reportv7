import React, { useState, useEffect, useRef } from 'react';
import { gasService } from '../services/gasService';
import { fNum, formatDDMMYY } from '../utils/format';

export function Kasbon() {
  // --- STATE DATA FORM ---
  const [nama, setNama] = useState('');
  const [tgl, setTgl] = useState('');
  const [nominal, setNominal] = useState('');
  const [keperluan, setKeperluan] = useState('');

  // --- STATE ACTION & LOADING ---
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupContent, setPopupContent] = useState('');
  const [statusMessage, setStatusMessage] = useState(null);

  // Reference untuk PDF Render element
  const printRef = useRef(null);

  // List Pegawai Dropdown
  const PEGAWAI_OPS = ["", "Nathan", "Friz", "Ardi", "Wanto", "Aziz", "Danu"];

  // Set default tgl hari ini (format YYYY-MM-DD)
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setTgl(today);
  }, []);

  const numNominal = parseFloat(nominal) || 0;

  // --- SUBMIT & CETAK KASBON ---
  const handleProcessKasbon = async () => {
    if (!nama) {
      alert("⚠️ Pilih nama pemohon!");
      return;
    }
    if (!nominal || numNominal <= 0) {
      alert("⚠️ Masukkan nominal kasbon yang valid!");
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    const payloadData = {
      nama: nama,
      tgl_pengajuan: tgl,
      nominal: numNominal,
      keterangan: keperluan
    };

    // Siapkan berkas PDF
    const cleanPemohon = nama.toUpperCase().replace(/\s/g, '');
    const tglStr = formatDDMMYY(tgl);
    const pdfFilename = `${cleanPemohon}_${tglStr}.pdf`;

    // Ambil referensi dari document hidden element untuk PDF
    const element = printRef.current;
    
    // Set referensi nomor dan waktu cetak di PDF
    const refNumText = "KB-" + cleanPemohon + "-" + Date.now().toString().slice(-6);
    const cetakWaktuText = new Date().toLocaleString('id-ID');
    document.getElementById('pdf-kb-ref').innerText = refNumText;
    document.getElementById('pdf-kb-cetak').innerText = cetakWaktuText;

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
      await gasService.submitKasbon(payloadData);

      // 3. Tampilkan popup berhasil
      setPopupContent(`
        <b>Kasbon berhasil diajukan!</b><br><br>
        Pengajuan <b>${nama}</b> tersimpan ke database.<br>
        PDF <b>${pdfFilename}</b> telah diunduh.<br><br>
        📲 Kirimkan PDF ke Admin/Hardianto via WhatsApp. 🙏
      `);
      setShowPopup(true);
      
      // Reset form
      setNominal('');
      setKeperluan('');
      
      setStatusMessage({ type: 'success', text: '✅ Berhasil Diajukan!' });
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: 'error', text: `❌ Proses gagal: ${err.message}` });
      alert(`Gagal mengajukan kasbon: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* INFO BANNER */}
      <div className="p-4 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-100 shadow-sm">
        ℹ️ Form pengajuan kasbon. PDF otomatis tercetak untuk dikirim via WA ke Management.
      </div>

      {/* FORM SECTION */}
      <section className="bg-card border border-border-soft rounded-2xl p-6 shadow-sm space-y-4">
        <div>
          <label className="text-[10px] font-extrabold text-text-muted tracking-wider uppercase mb-1">1. Pemohon</label>
          <select
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            className="w-full py-3 px-3 bg-white border border-border-soft rounded-xl text-xs outline-none focus:border-accent-green"
          >
            <option value="">- Pilih Nama -</option>
            {PEGAWAI_OPS.slice(1).map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[10px] font-extrabold text-text-muted tracking-wider uppercase mb-1">2. Tanggal</label>
          <input
            type="date"
            value={tgl}
            onChange={(e) => setTgl(e.target.value)}
            className="w-full py-2.5 px-3 bg-white border border-border-soft rounded-xl text-xs outline-none focus:border-accent-green"
          />
        </div>

        <div>
          <label className="text-[10px] font-extrabold text-text-muted tracking-wider uppercase mb-1">3. Nominal Rp</label>
          <input
            type="number"
            value={nominal}
            onChange={(e) => setNominal(e.target.value)}
            placeholder="Nominal rupiah"
            className="w-full py-2.5 px-3 bg-white border border-border-soft rounded-xl text-xs outline-none focus:border-accent-green font-semibold"
          />
          {numNominal > 500000 && (
            <div className="text-[10px] text-rose-600 font-bold tracking-wide mt-1 animate-pulse">
              ⚠️ Nominal melebihi batas wajar. Pastikan THP cukup (Max 50%).
            </div>
          )}
        </div>

        <div>
          <label className="text-[10px] font-extrabold text-text-muted tracking-wider uppercase mb-1">4. Keperluan</label>
          <input
            type="text"
            value={keperluan}
            onChange={(e) => setKeperluan(e.target.value)}
            placeholder="Alasan pengajuan kasbon"
            className="w-full py-2.5 px-3 bg-white border border-border-soft rounded-xl text-xs outline-none focus:border-accent-green"
          />
        </div>
      </section>

      {/* ACTION BUTTON */}
      <button
        onClick={handleProcessKasbon}
        disabled={isSubmitting}
        className="w-full py-3.5 bg-accent-gold text-[#111] border-none rounded-xl font-bold tracking-widest text-xs uppercase cursor-pointer hover:bg-amber-500 active:scale-[0.98] transition-all duration-200 shadow-md shadow-accent-gold/10 disabled:opacity-50 disabled:cursor-not-allowed select-none"
      >
        {isSubmitting ? "⏳ SEDANG PROSES..." : "📄 CETAK PDF & AJUKAN"}
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
        <div ref={printRef} id="pdf-kasbon" className="pdf-page">
          <div className="pdf-header-bar">
            <div>
              <div className="pdf-brand">MEREMPAH</div>
              <div className="pdf-brand-sub">CAFE &amp; SPICE · HR DOCUMENT</div>
            </div>
            <div className="pdf-ref-block">
              REF: <span id="pdf-kb-ref"></span><br />
              <span id="pdf-kb-cetak"></span>
            </div>
          </div>
          <div className="pdf-doc-title">FORMULIR PENGAJUAN KASBON PEGAWAI</div>
          <div className="pdf-divider"></div>

          <div className="pdf-section-label">[A] DATA PEMOHON</div>
          <div className="pdf-row indent"><span>Nama Pegawai Pemohon</span><span><b>{(nama || '-').toUpperCase()}</b></span></div>
          <div className="pdf-row indent"><span>Tanggal Pengajuan</span><span>{tgl || '-'}</span></div>
          <div className="pdf-row indent"><span>Status Kepegawaian</span><span>AKTIF</span></div>

          <div className="pdf-section-label" style={{ marginTop: '8px' }}>[B] DETAIL PENGAJUAN</div>
          <div className="pdf-row indent"><span>Nominal Diajukan (Rp)</span><span><b>{fNum(nominal)}</b></span></div>
          <div className="pdf-row indent"><span>Tujuan / Keperluan</span><span>{keperluan || '-'}</span></div>
          <div className="pdf-row indent"><span>Metode Pengembalian</span><span>POTONG GAJI BULAN BERJALAN</span></div>

          <div className="pdf-section-label" style={{ marginTop: '8px' }}>[C] STATUS PERSETUJUAN</div>
          <div className="pdf-row indent"><span>Admin / HO</span><span>□ DISETUJUI &nbsp;&nbsp; □ DITOLAK</span></div>
          <div className="pdf-row indent"><span>Tanggal Disetujui</span><span>.............................</span></div>
          <div className="pdf-row indent"><span>Jumlah Disetujui</span><span>Rp .............................</span></div>

          <div className="pdf-legal" style={{ marginTop: '30px' }}>
            PERNYATAAN PEMOHON: Dengan menandatangani formulir ini, saya bersedia untuk dilakukan pemotongan Take Home Pay (THP) pada siklus penggajian bulan berjalan sebesar nominal yang disetujui.
          </div>
          <div className="pdf-sig-row" style={{ marginTop: '24px' }}>
            <div className="pdf-sig-box">
              <div className="pdf-sig-line">
                Menyetujui (Admin/HO)<br />
                ...................
              </div>
            </div>
            <div className="pdf-sig-box">
              <div className="pdf-sig-line">
                Pemohon<br />
                <b>{(nama || '...........').toUpperCase()}</b>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
