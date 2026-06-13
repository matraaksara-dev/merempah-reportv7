import React, { useState } from 'react';
import { MainLayout } from './layouts/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { Keuangan } from './pages/Keuangan';
import { AuditStok } from './pages/AuditStok';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onNavigate={setActiveTab} />;
      case 'keuangan':
        return <Keuangan />;
      case 'audit_stok':
        return <AuditStok />;
      default:
        return <Dashboard onNavigate={setActiveTab} />;
    }
  };

  return (
    <MainLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </MainLayout>
  );
}

export default App;
