import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';

import Home from './pages/Home';
import HealthInsurance from './pages/HealthInsurance';
import MotorInsurance from './pages/MotorInsurance';
import TermLifeInsurance from './pages/TermLifeInsurance';
import BusinessInsurance from './pages/BusinessInsurance';
import TravelInsurance from './pages/TravelInsurance';
import RenewalPort from './pages/RenewalPort';
import ClaimSupport from './pages/ClaimSupport';
import NetworkHospitals from './pages/NetworkHospitals';
import BecomePOSP from './pages/BecomePOSP';
import Loans from './pages/Loans';
import LegalCompliance from './pages/LegalCompliance';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative' }}>
      {!isAdminRoute && <Header />}
      
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          
          {/* Dedicated Category Funnels (PolicyBazaar InsurTech UX) */}
          <Route path="/insurance/health" element={<HealthInsurance />} />
          <Route path="/insurance/motor" element={<MotorInsurance />} />
          <Route path="/insurance/term-life" element={<TermLifeInsurance />} />
          <Route path="/insurance/business" element={<BusinessInsurance />} />
          <Route path="/insurance/corporate-sme" element={<BusinessInsurance />} />
          <Route path="/insurance/travel" element={<TravelInsurance />} />

          {/* Unified Support & Operational Desks */}
          <Route path="/renewal-port" element={<RenewalPort />} />
          <Route path="/claim-support" element={<ClaimSupport />} />
          <Route path="/network-hospitals" element={<NetworkHospitals />} />
          <Route path="/become-posp" element={<BecomePOSP />} />
          <Route path="/loans" element={<Loans />} />

          {/* Legal, Compliance & IRDAI Regulatory Disclosures */}
          <Route path="/privacy-policy" element={<LegalCompliance />} />
          <Route path="/terms-of-service" element={<LegalCompliance />} />
          <Route path="/irdai-disclaimer" element={<LegalCompliance />} />
          <Route path="/grievance-redressal" element={<LegalCompliance />} />

          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </main>

      {!isAdminRoute && <Footer />}
    </div>
  );
}

