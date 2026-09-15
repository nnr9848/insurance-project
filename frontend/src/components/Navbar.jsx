import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { X, LogIn, LayoutDashboard, LogOut } from 'lucide-react';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const isAdmin = user?.roles?.includes('ROLE_ADMIN') || user?.roles?.includes('ROLE_STAFF');

  return (
    <>
      <nav className="nav-bar">
        <div className="nav-container container">
          {/* Home Brand Logo button (First item in horizontal bar like original site) */}
          <NavLink to="/" className="nav-brand-logo-btn" title="Aadhiraksha Home" aria-label="Go to Home">
            <div className="nav-logo-badge">
              <div className="nav-logo-icon">
                <span style={{ fontWeight: 900, fontSize: '0.95rem', color: '#10b981' }}>🛡️</span>
              </div>
              <div className="nav-logo-text-group">
                <span className="nav-logo-title">AADHIRAKSHA</span>
                <span className="nav-logo-subtitle">INSURANCE & FINANCIAL SERVICES</span>
              </div>
            </div>
          </NavLink>

          {/* Mobile Hamburger Toggle */}
          <button 
            className="mobile-menu-toggle" 
            onClick={() => setIsMobileOpen(true)}
            aria-label="Open navigation menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          {/* Clean Menu Items */}
          <div className="nav-links">
            <NavLink to="/new-policy-support" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              NEW POLICY SUPPORT
            </NavLink>
            <NavLink to="/renewal-port" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              RENEWAL / PORT POLICY
            </NavLink>
            <NavLink to="/claim-support" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              CLAIM SUPPORT
            </NavLink>
            <NavLink to="/network-hospitals" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              NETWORK HOSPITALS
            </NavLink>
            <NavLink to="/become-posp" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              BECOME POSP AGENT
            </NavLink>
            <NavLink to="/loans" className={({ isActive }) => `nav-item nav-item-highlight ${isActive ? 'active' : ''}`}>
              LOANS
            </NavLink>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="mobile-backdrop" onClick={() => setIsMobileOpen(false)} />
      )}
      <div className={`mobile-drawer ${isMobileOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <span style={{ color: '#fff', fontWeight: 800, fontSize: '1.1rem' }}>Menu Navigation</span>
          <button 
            onClick={() => setIsMobileOpen(false)}
            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
          >
            <X size={24} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Link to="/" onClick={() => setIsMobileOpen(false)} className="nav-item">
            🏠 HOME
          </Link>
          <Link to="/new-policy-support" onClick={() => setIsMobileOpen(false)} className="nav-item">
            NEW POLICY SUPPORT
          </Link>
          <Link to="/renewal-port" onClick={() => setIsMobileOpen(false)} className="nav-item">
            RENEWAL / PORT POLICY
          </Link>
          <Link to="/claim-support" onClick={() => setIsMobileOpen(false)} className="nav-item">
            CLAIM SUPPORT
          </Link>
          <Link to="/network-hospitals" onClick={() => setIsMobileOpen(false)} className="nav-item">
            NETWORK HOSPITALS
          </Link>
          <Link to="/become-posp" onClick={() => setIsMobileOpen(false)} className="nav-item">
            BECOME POSP AGENT
          </Link>
          <Link to="/loans" onClick={() => setIsMobileOpen(false)} className="nav-item nav-item-highlight">
            LOANS
          </Link>

          <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            {isAuthenticated ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {isAdmin && (
                  <Link 
                    to="/admin" 
                    onClick={() => setIsMobileOpen(false)}
                    className="btn-portal btn-portal-agent"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <LayoutDashboard size={16} /> Admin Dashboard
                  </Link>
                )}
                <button 
                  onClick={() => { setIsMobileOpen(false); handleLogout(); }}
                  className="btn-portal btn-portal-staff"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            ) : (
              <Link 
                to="/login" 
                onClick={() => setIsMobileOpen(false)}
                className="btn-portal btn-portal-agent"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <LogIn size={16} /> Sign In / Portals
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
