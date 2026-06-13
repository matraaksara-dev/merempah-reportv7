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

  const handleLogin = () => {
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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0a0a0a] flex flex-col items-center justify-center z-50 p-4 transition-all duration-300">
      <div className="bg-[#1a1a1a] border border-accent-gold/40 rounded-2xl p-8 md:p-10 w-full max-w-sm text-center shadow-[0_10px_50px_rgba(197,160,89,0.1)] transform duration-300 hover:border-accent-gold/70">
        <div className="text-4xl mb-4 animate-bounce">🔐</div>
        <div className="text-2xl font-extrabold text-accent-gold tracking-widest uppercase mb-1">
          MEREMPAH
        </div>
        <div className="text-[10px] text-zinc-500 tracking-[0.2em] uppercase mb-8">
          Cafe &amp; Spice · Sistem Operasional
        </div>
        
        <input
          ref={inputRef}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="MASUKKAN PASSWORD"
          autoComplete="off"
          className="w-full py-3.5 px-4 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-mono text-center tracking-[0.3em] placeholder:tracking-normal focus:border-accent-gold focus:ring-1 focus:ring-accent-gold outline-none transition-all duration-200 mb-4"
        />
        
        <button
          onClick={handleLogin}
          className="w-full py-3.5 bg-accent-gold text-[#111] border-none rounded-xl font-bold tracking-widest text-xs uppercase cursor-pointer hover:bg-amber-500 active:scale-95 transition-all duration-200 shadow-[0_4px_20px_rgba(197,160,89,0.2)]"
        >
          MASUK →
        </button>

        {error && (
          <div className="mt-4 text-rose-500 text-xs font-bold tracking-wider animate-pulse">
            ⛔ PASSWORD SALAH. COBA LAGI.
          </div>
        )}
      </div>
    </div>
  );
}
