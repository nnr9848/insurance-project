import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Navbar from './components/Navbar';
import HeaderModern from './components/HeaderModern';
import Footer from './components/Footer';
import DesignModeToggle from './components/DesignModeToggle';
import { ThemeModeProvider, useThemeMode } from './context/ThemeModeContext';

import Home from './pages/Home';
import HomeClassic from './pages/HomeClassic';
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
  const location = useLocation();

  // If viewing explicit /classic path or user toggled classic mode
  const isClassic = location.pathname === '/classic' || designMode === 'classic';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative' }}>
      {/* Header: PolicyBazaar Modern header by default, classic 2-bar only in classic mode */}
      {isClassic ? (
        <>
          <Header />
          <Navbar />
        </>
      ) : (
        <HeaderModern />
      )}
      
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/classic" element={<HomeClassic />} />
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
