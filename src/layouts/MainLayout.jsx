import React from 'react';

/**
 * Main Layout dengan Sidebar Navigasi modern berbasis Tab.
 */
export function MainLayout({ children, activeTab, setActiveTab }) {
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: '📊' },
    { id: 'keuangan', name: 'Laporan Keuangan', icon: '💰' },
    { id: 'audit_stok', name: 'Audit Stok Cafe', icon: '📦' },
  ];

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col md:flex-row font-sans">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-950 border-b md:border-b-0 md:border-r border-slate-900 flex flex-col shrink-0">
        {/* Logo / Cafe Name */}
        <div className="p-6 border-b border-slate-900 flex items-center gap-3">
          <span className="text-2xl">☕</span>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent leading-none">
              Merempah Cafe
            </h1>
            <span className="text-[10px] text-slate-500 font-medium tracking-wider uppercase">
              Management System
            </span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-1.5">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 cursor-pointer
                  ${isActive 
                    ? 'bg-purple-600/15 text-purple-400 border border-purple-500/25 shadow-md shadow-purple-600/5' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                  }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.name}
              </button>
            );
          })}
        </nav>

        {/* Staf Info Footer */}
        <div className="p-4 border-t border-slate-900 bg-slate-950/50">
          <div className="flex items-center gap-3 px-2 py-1.5">
            <div className="w-8 h-8 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
              S
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-300 leading-none">Staf Cafe</p>
              <span className="text-[10px] text-slate-500 font-medium">Shift Pagi</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 border-b border-slate-900 flex items-center justify-between px-6 bg-slate-950/30 backdrop-blur-md">
          <h2 className="text-sm font-semibold text-slate-400 capitalize">
            Menu / {activeTab.replace('_', ' ')}
          </h2>
          <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
            <span>Server Status:</span>
            <span className="inline-flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Online
            </span>
          </div>
        </header>

        {/* Scrollable Container */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto max-w-6xl w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
