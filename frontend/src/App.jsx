import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Navbar from './components/Navbar';
import HeaderModern from './components/HeaderModern';
import Footer from './components/Footer';
import DesignModeToggle from './components/DesignModeToggle';
import { ThemeModeProvider, useThemeMode } from './context/ThemeModeContext';

import Home from './pages/Home';
import NewPolicySupport from './pages/NewPolicySupport';
import RenewalPort from './pages/RenewalPort';
import ClaimSupport from './pages/ClaimSupport';
import NetworkHospitals from './pages/NetworkHospitals';
import BecomePOSP from './pages/BecomePOSP';
import Loans from './pages/Loans';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';

function AppContent() {
  const { designMode } = useThemeMode();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative' }}>
      {/* Dynamic Header: Single unified PolicyBazaar header in modern mode, classic 2-bar in classic mode */}
      {designMode === 'modern' ? (
        <HeaderModern />
      ) : (
        <>
          <Header />
          <Navbar />
        </>
      )}
      
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/new-policy-support" element={<NewPolicySupport />} />
          <Route path="/renewal-port" element={<RenewalPort />} />
          <Route path="/claim-support" element={<ClaimSupport />} />
          <Route path="/network-hospitals" element={<NetworkHospitals />} />
          <Route path="/become-posp" element={<BecomePOSP />} />
          <Route path="/loans" element={<Loans />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </main>

      <Footer />
      <DesignModeToggle />
    </div>
  );
}

export default function App() {
  return (
    <ThemeModeProvider>
      <AppContent />
    </ThemeModeProvider>
  );
}
