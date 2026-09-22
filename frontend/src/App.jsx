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

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an unhandled rendering error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2.5rem', margin: '2rem auto', maxWidth: '800px', background: '#fff', border: '1px solid #fecaca', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#dc2626', marginBottom: '1rem' }}>
            <span style={{ fontSize: '1.5rem' }}>⚠️</span>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>CRM Component Render Error</h2>
          </div>
          <p style={{ fontSize: '0.88rem', color: '#475569', marginBottom: '1rem' }}>
            A rendering error occurred in this workspace view:
          </p>
          <pre style={{ background: '#fef2f2', color: '#991b1b', padding: '1rem', borderRadius: '8px', fontSize: '0.82rem', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
            {this.state.error?.toString()}
          </pre>
          <div style={{ marginTop: '1.25rem', display: 'flex', gap: '10px' }}>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = '/admin?tab=clients';
              }}
              style={{ background: '#0f2b48', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
            >
              Go to Client Data Sheet
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}

