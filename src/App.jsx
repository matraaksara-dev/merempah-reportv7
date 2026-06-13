import React, { useState, useEffect } from 'react';
import { MainLayout } from './layouts/MainLayout';
import { PasswordGate } from './components/PasswordGate';
import { Handover } from './pages/Handover';
import { Cashflow } from './pages/Cashflow';
import { Kasbon } from './pages/Kasbon';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('mrp_authenticated') === 'true';
  });
  const [activeTab, setActiveTab] = useState('handover');

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    sessionStorage.setItem('mrp_authenticated', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('mrp_authenticated');
  };

  if (!isAuthenticated) {
    return <PasswordGate onSuccess={handleLoginSuccess} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'handover':
        return <Handover />;
      case 'cashflow':
        return <Cashflow />;
      case 'kasbon':
        return <Kasbon />;
      default:
        return <Handover />;
    }
  };

  return (
    <MainLayout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
      onLogout={handleLogout}
    >
      {renderContent()}
    </MainLayout>
  );
}

export default App;
