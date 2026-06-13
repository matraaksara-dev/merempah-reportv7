import React, { useState, useEffect, useRef } from 'react';
import { config } from '../config/api';

export function PasswordGate({ onSuccess }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault(); // Mencegah reload halaman browser bawaan form
    if (password === config.gatePassword) {
      onSuccess();
    } else {
      setError(true);
      setPassword('');
      if (inputRef.current) {
        inputRef.current.focus();
      }
      const timer = setTimeout(() => setError(false), 3000);
      return () => clearTimeout(timer);
    }
  };

  return (
    <div className="min-h-screen bg-bg-cream flex flex-col justify-between items-center py-8 px-4 select-none font-montserrat">
      {/* Spacer Atas */}
      <div className="h-2 md:h-6"></div>

      {/* Identitas Brand Utama */}
      <header className="text-center max-w-xl flex flex-col items-center">
        {/* Dua Daun Merempah (SVG Vektor - Aksesibilitas aria-hidden) */}
        <svg 
          viewBox="0 0 120 120" 
          className="w-16 h-16 md:w-20 md:h-20 text-accent-green mb-3 transition-transform duration-300 hover:scale-105" 
          fill="currentColor"
          aria-hidden="true"
        >
          {/* Daun Kiri (Kecil) */}
          <path d="M48,76 C37,65 34,49 42,36 C46,30 52,27 53,34 C55,43 54,59 48,76 Z" />
          {/* Daun Kanan (Besar) */}
          <path d="M54,69 C62,49 75,34 86,39 C93,43 90,53 82,64 C72,76 61,77 54,69 Z" />
          {/* Batang/Stem bawah */}
          <path d="M46,82 C48,78 51,74 54,69" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
        </svg>

        {/* Judul Font Garamond (EB Garamond) - select-text diaktifkan agar ramah SEO */}
        <h1 className="text-5xl md:text-6xl text-accent-green font-normal tracking-wide mb-2.5 font-garamond select-text">
          Merempah
        </h1>
        
        {/* Subtitle Aksioma - Menggunakan Montserrat */}
        <h2 className="text-xs md:text-sm text-zinc-600 font-semibold tracking-[0.2em] uppercase mb-1.5 font-montserrat leading-none">
          Warisan Aksioma Nusantara
        </h2>
        
        {/* Subtitle Fitur - Menggunakan Montserrat */}
        <p className="text-[10px] md:text-xs text-zinc-500/80 italic tracking-wide font-montserrat leading-relaxed">
          Aplikasi Laporan keuangan, Handover, Cashflow, Kasbon, dan stock Opname
        </p>
      </header>

      {/* Formulir Input Login Tengah */}
      <main className="w-full max-w-[320px] flex flex-col mt-6">
        <form onSubmit={handleSubmit} className="flex flex-col text-center">
          {/* Label Semantik yang Terhubung dengan Input */}
          <label 
            htmlFor="password-input" 
            className="text-[10px] md:text-[11px] text-zinc-500 font-bold mb-2.5 tracking-wider uppercase font-montserrat"
          >
            Isi password untuk login
          </label>
          
          {/* Input Password (Pill Shape / Rounded Full) */}
          <div className="relative w-full">
            <input
              ref={inputRef}
              id="password-input"
              name="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="123456"
              autoComplete="current-password"
              aria-invalid={error}
              aria-describedby={error ? "login-error" : undefined}
              className={`w-full py-2.5 px-6 pr-12 text-center text-sm font-mono text-zinc-700 bg-white border rounded-full outline-none transition-all duration-200 shadow-[0_2px_8px_rgba(0,0,0,0.02)] font-montserrat focus:ring-2 focus:ring-accent-green/20 focus:border-accent-green
                ${error ? 'border-rose-500 ring-2 ring-rose-500/10' : 'border-zinc-300'}
              `}
            />
            {/* Eye Button untuk Visibility Toggle (type="button" agar tidak memicu form submit) */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 focus:outline-none focus:text-zinc-600 transition-colors duration-150 cursor-pointer p-1"
            >
              {showPassword ? (
                // Eye Slash Icon
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4.5 h-4.5" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              ) : (
                // Eye Icon
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4.5 h-4.5" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
              )}
            </button>
          </div>

          {/* Tombol Login (Warna Mustard Emas) */}
          <button
            type="submit"
            className="w-full py-2.5 bg-[#b08f26] hover:bg-[#967721] focus:bg-[#967721] active:scale-[0.98] focus:ring-2 focus:ring-amber-500/20 text-white border-none rounded-xl font-bold tracking-widest text-sm uppercase cursor-pointer transition-all duration-200 mt-3.5 shadow-md shadow-amber-800/10 font-montserrat"
          >
            Login
          </button>
        </form>

        {/* Pesan Error (Ramah Pembaca Layar / Role Alert) */}
        {error && (
          <div 
            id="login-error" 
            role="alert" 
            className="mt-3.5 text-rose-600 text-[10px] font-bold tracking-wider animate-pulse font-montserrat"
          >
            ⛔ PASSWORD SALAH. COBA LAGI.
          </div>
        )}
      </main>

      {/* Footer Keterangan Bawah */}
      <footer className="text-center max-w-[500px] flex flex-col items-center mt-12 font-montserrat">
        <p className="text-[9px] md:text-[10px] text-zinc-500/80 italic leading-relaxed text-center mb-6 px-4">
          Merempah coffee &amp; spice, adalah entitas brand terpercaya di Kota Malang siap memberikan kesan terbaik dalam Layanan, Fasilitas, dan Produk Berkualitas
        </p>
        <span className="text-[9px] text-zinc-400 font-bold tracking-widest uppercase select-text">
          Copyright. Pandira Technology
        </span>
      </footer>
    </div>
  );
}
