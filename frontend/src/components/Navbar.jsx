import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { X, LogIn, LayoutDashboard, LogOut } from 'lucide-react';
import logoImg from '../assets/logo.png';

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
          {/* Home Brand Logo button */}
          <NavLink to="/" className="nav-brand-logo-btn" title="Aadhiraksha Home" aria-label="Go to Home">
            <div style={{
              background: '#ffffff',
              padding: '0.2rem 0.5rem',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
              height: '40px'
            }}>
              <img 
                src={logoImg} 
                alt="Aadhiraksha Logo" 
                style={{ height: '32px', width: 'auto', objectFit: 'contain' }} 
              />
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

      {/* Mobile Drawer - Opens from Right (Classic View) */}
      {isMobileOpen && (
        <div className="mobile-backdrop" onClick={() => setIsMobileOpen(false)} />
      )}
      <div className={`mobile-drawer ${isMobileOpen ? 'open' : ''}`}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: '1.25rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          marginBottom: '1rem'
        }}>
          <span style={{
            color: '#f59e0b',
            fontWeight: 800,
            fontSize: '0.85rem',
            letterSpacing: '1px',
            textTransform: 'uppercase'
          }}>
            Menu Navigation
          </span>
          <button 
            onClick={() => setIsMobileOpen(false)}
            aria-label="Close navigation menu"
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              color: '#ffffff',
              cursor: 'pointer',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Links List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <NavLink 
            to="/new-policy-support" 
            onClick={() => setIsMobileOpen(false)} 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            style={{ padding: '0.65rem 0.85rem', borderRadius: '8px' }}
          >
            NEW POLICY SUPPORT
          </NavLink>

          <NavLink 
            to="/renewal-port" 
            onClick={() => setIsMobileOpen(false)} 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            style={{ padding: '0.65rem 0.85rem', borderRadius: '8px' }}
          >
            RENEWAL / PORT POLICY
          </NavLink>

          <NavLink 
            to="/claim-support" 
            onClick={() => setIsMobileOpen(false)} 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            style={{ padding: '0.65rem 0.85rem', borderRadius: '8px' }}
          >
            CLAIM SUPPORT
          </NavLink>

          <NavLink 
            to="/network-hospitals" 
            onClick={() => setIsMobileOpen(false)} 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            style={{ padding: '0.65rem 0.85rem', borderRadius: '8px' }}
          >
            NETWORK HOSPITALS
          </NavLink>

          <NavLink 
            to="/become-posp" 
            onClick={() => setIsMobileOpen(false)} 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            style={{ padding: '0.65rem 0.85rem', borderRadius: '8px' }}
          >
            BECOME POSP AGENT
          </NavLink>

          <NavLink 
            to="/loans" 
            onClick={() => setIsMobileOpen(false)} 
            className={({ isActive }) => `nav-item nav-item-highlight ${isActive ? 'active' : ''}`}
            style={{ padding: '0.65rem 0.85rem', borderRadius: '8px', color: '#f59e0b', fontWeight: 800 }}
          >
            LOANS
          </NavLink>
        </div>

        {/* Partner & Staff Portals Section */}
        <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <div style={{
            fontSize: '0.72rem',
            fontWeight: 800,
            color: '#f59e0b',
            letterSpacing: '0.6px',
            textTransform: 'uppercase',
            marginBottom: '0.85rem'
          }}>
            Partner & Staff Portals
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {isAuthenticated ? (
              <>
                {isAdmin ? (
                  <Link 
                    to="/admin" 
                    onClick={() => setIsMobileOpen(false)}
                    style={{
                      background: 'rgba(16, 185, 129, 0.15)',
                      border: '1px solid #10b981',
                      color: '#34d399',
                      padding: '0.65rem 1rem',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.88rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      textDecoration: 'none'
                    }}
                  >
                    <LayoutDashboard size={16} /> Admin Dashboard
                  </Link>
                ) : (
                  <Link 
                    to="/become-posp" 
                    onClick={() => setIsMobileOpen(false)}
                    style={{
                      background: 'rgba(245, 158, 11, 0.15)',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      color: '#f59e0b',
                      padding: '0.65rem 1rem',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.88rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      textDecoration: 'none'
                    }}
                  >
                    ⭐ POSP Agent Portal
                  </Link>
                )}

                <button 
                  onClick={() => { setIsMobileOpen(false); handleLogout(); }}
                  style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#fca5a5',
                    padding: '0.65rem 1rem',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer'
                  }}
                >
                  <LogOut size={16} /> Logout ({user?.fullName?.split(' ')[0] || 'User'})
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  onClick={() => setIsMobileOpen(false)}
                  style={{
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(52, 211, 153, 0.35)',
                    color: '#a7f3d0',
                    padding: '0.7rem 1rem',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    textDecoration: 'none'
                  }}
                >
                  ⭐ POSP Agent Login
                </Link>

                <Link 
                  to="/login" 
                  onClick={() => setIsMobileOpen(false)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    padding: '0.7rem 1rem',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    textDecoration: 'none'
                  }}
                >
                  👤 Staff / Admin Portal
                </Link>
              </>
            )}

            {/* Quick Call Support Pill */}
            <a 
              href="tel:+91814205679"
              style={{
                marginTop: '0.5rem',
                background: '#f59e0b',
                color: '#04281f',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                fontWeight: 800,
                fontSize: '0.88rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                textDecoration: 'none',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
              }}
            >
              📞 Call Support: +91 814205679
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
