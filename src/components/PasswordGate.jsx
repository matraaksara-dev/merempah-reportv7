import React, { useState, useEffect, useRef } from 'react';
import { config } from '../config/api';

export function PasswordGate({ onSuccess }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === config.gatePassword) {
      setError(false);
      onSuccess();
    } else {
      setError(true);
      setPassword('');
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center p-5 select-none font-sans"
      style={{
        backgroundColor: '#f7f5f0',
        backgroundImage: `
          radial-gradient(at 0% 0%, rgba(27, 67, 50, 0.08) 0, transparent 50%),
          radial-gradient(at 100% 100%, rgba(27, 67, 50, 0.04) 0, transparent 50%)
        `
      }}
    >
      <div 
        className="bg-white border border-[#e3dec3] backdrop-blur-[12px] rounded-[24px] py-10 px-8 w-full max-w-[420px] shadow-[0_15px_35px_rgba(27, 67, 50, 0.08)] text-center"
        style={{
          animation: 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Brand Badge */}
        <div 
          className="px-4 py-1.5 rounded-full text-[11px] font-bold inline-block mb-5 uppercase tracking-[0.1em] border"
          style={{
            background: 'linear-gradient(135deg, rgba(27, 67, 50, 0.08), rgba(27, 67, 50, 0.04))',
            borderColor: 'rgba(27, 67, 50, 0.15)',
            color: '#1b4332'
          }}
        >
          PT. Seduhlur Indo Group
        </div>

        {/* Heading */}
        <h1 
          className="text-4xl font-bold mb-2.5 leading-tight select-text uppercase tracking-widest"
          style={{
            fontFamily: "'EB Garamond', Garamond, Georgia, serif",
            background: 'linear-gradient(135deg, #081c15 0%, #2d6a4f 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          MEREMPAH
        </h1>

        {/* Subtitle */}
        <p className="text-[#526356] text-[13px] mb-8 leading-relaxed">
          Platform pencatatan handover, cashflow, dan kasbon harian
          <br />
          <strong>Merempah Cafe & Spice</strong>
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="text-left mb-6">
            <label 
              htmlFor="password" 
              className="block text-[12px] font-semibold text-[#526356] mb-2 uppercase tracking-[0.05em]"
            >
              Kata Sandi Akses
            </label>
            <div className="relative">
              <input 
                ref={inputRef}
                type="password" 
                id="password" 
                placeholder="Masukkan password..." 
                required 
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full py-3.5 px-4 bg-white border border-[#e3dec3] rounded-xl text-[#121212] text-[15px] outline-none transition-all duration-200 focus:border-[#1b4332] focus:ring-3 focus:ring-[#1b4332]/10"
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full py-3.5 bg-[#1b4332] text-white border-none rounded-xl text-[15px] font-bold cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 hover:bg-[#081c15] hover:-translate-y-0.5 active:translate-y-0.5 shadow-sm"
          >
            Masuk Sistem
            <svg 
              width="18" 
              height="18" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="shrink-0"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>

          {/* Error Message */}
          {error && (
            <div 
              className="text-[#9a031e] text-[12.5px] mt-3 flex items-center justify-center gap-1.5"
              style={{
                animation: 'shake 0.4s ease'
              }}
            >
              <svg 
                width="14" 
                height="14" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="shrink-0"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              Password salah. Silakan coba lagi.
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
