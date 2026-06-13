import React from 'react';

/**
 * Main Layout bertema Green & Cream Merempah Cafe.
 * Mengikuti header dan tab navigasi horizontal sesuai Index.html lama.
 */
export function MainLayout({ children, activeTab, setActiveTab, onLogout }) {
  const tabs = [
    { id: 'handover', name: '1. Handover' },
    { id: 'cashflow', name: '2. Cashflow' },
    { id: 'kasbon', name: '3. Kasbon' },
  ];

  return (
    <div className="min-h-screen bg-bg-cream flex flex-col text-text-main antialiased selection:bg-accent-gold/30">
      {/* Header Utama */}
      <header className="bg-accent-green text-white text-center py-4 border-b-4 border-accent-gold relative shadow-lg z-10 shrink-0">
        <div className="container mx-auto px-4 max-w-4xl flex justify-between items-center">
          <div className="w-10"></div> {/* Spacer to center the title */}
          <h1 className="text-lg md:text-2xl font-black tracking-widest text-white m-0 uppercase select-none">
            MEREMPAH CAFE &amp; SPICE
          </h1>
          {onLogout ? (
            <button
              onClick={onLogout}
              className="text-white/70 hover:text-white hover:bg-white/10 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wider uppercase border border-white/20 transition-all duration-200 cursor-pointer"
              title="Logout Sistem"
            >
              Keluar
            </button>
          ) : (
            <div className="w-10"></div>
          )}
        </div>
      </header>

      {/* Tab Navigasi Horizontal */}
      <nav className="bg-[#111] flex select-none shrink-0 shadow-md">
        <div className="container mx-auto max-w-4xl flex w-full">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3.5 text-center font-bold text-[10px] md:text-xs tracking-wider uppercase transition-all duration-300 outline-none cursor-pointer border-none
                  ${isActive 
                    ? 'bg-accent-gold text-[#111] shadow-[inset_0_-2px_0_rgba(0,0,0,0.2)]' 
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/50'
                  }`}
              >
                {tab.name}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Kontainer Konten Scrollable */}
      <main className="flex-1 overflow-y-auto py-8 px-4">
        <div className="container mx-auto max-w-xl md:max-w-2xl flex flex-col gap-6">
          {children}
        </div>
      </main>
      
      {/* Footer Hak Cipta Muted */}
      <footer className="text-center py-4 text-[10px] text-text-muted select-none shrink-0 border-t border-border-soft bg-white/20">
        © {new Date().getFullYear()} PT. Seduhlur Indo Group. Seluruh Hak Cipta Dilindungi.
      </footer>
    </div>
  );
}
