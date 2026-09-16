import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Phone, 
  LogIn, 
  ChevronDown, 
  HeartPulse, 
  ShieldCheck, 
  Car, 
  Bike, 
  Users, 
  Briefcase, 
  Plane, 
  Building2, 
  FileCheck, 
  Hospital, 
  UserCheck, 
  LayoutDashboard, 
  LogOut, 
  X,
  Menu,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import logoImg from '../assets/logo.png';

export default function HeaderModern() {
  const { user, logout, isAuthenticated } = useAuth();
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [mobileAccordion, setMobileAccordion] = useState('products');
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isAdmin = user?.roles?.includes('ROLE_ADMIN') || user?.roles?.includes('ROLE_STAFF');

  const userInitials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  const toggleDropdown = (name) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  return (
    <>
      <header style={{
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}>
        <div className="container" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '68px',
          gap: '1rem'
        }}>
          
          {/* Left: Brand Logo & Mobile Trigger */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => setIsMobileOpen(true)}
              style={{
                display: 'none',
                background: 'none',
                border: 'none',
                padding: '6px',
                cursor: 'pointer',
                color: '#0f2b48'
              }}
              className="pb-mobile-toggle"
              aria-label="Open Navigation Menu"
            >
              <Menu size={24} />
            </button>

            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
              <img 
                src={logoImg} 
                alt="Aadhiraksha Insurance" 
                style={{ height: '44px', width: 'auto', objectFit: 'contain' }}
              />
            </Link>
          </div>

          {/* Center: Clean Dropdown Navigation (Desktop) */}
          <nav 
            ref={dropdownRef}
            className="pb-desktop-nav"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              height: '100%'
            }}
          >
            {/* 1. Insurance Products Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => toggleDropdown('products')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'none',
                  border: 'none',
                  padding: '8px 12px',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  color: activeDropdown === 'products' ? '#059669' : '#1e293b',
                  cursor: 'pointer',
                  borderRadius: '8px',
                  transition: 'all 0.15s ease'
                }}
              >
                Insurance Products <ChevronDown size={14} style={{ transform: activeDropdown === 'products' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>

              {activeDropdown === 'products' && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  left: '0',
                  width: '320px',
                  background: '#ffffff',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 20px 35px -10px rgba(0, 0, 0, 0.15)',
                  padding: '10px',
                  zIndex: 1100,
                  animation: 'dropdownFadeIn 0.15s ease-out'
                }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#94a3b8', padding: '6px 10px' }}>
                    Popular Categories
                  </div>

                  {[
                    { title: 'Health Insurance', desc: 'Cashless hospital network', icon: <HeartPulse size={18} color="#059669" />, link: '/new-policy-support' },
                    { title: 'Term Life Insurance', desc: '₹1 Cr cover from ₹490/mo', icon: <ShieldCheck size={18} color="#0284c7" />, link: '/new-policy-support' },
                    { title: 'Car & 2-Wheeler Insurance', desc: 'Instant policy in 2 mins', icon: <Car size={18} color="#d97706" />, link: '/new-policy-support' },
                    { title: 'Family Health Floater', desc: 'Cover spouse & kids in 1 plan', icon: <Users size={18} color="#db2777" />, link: '/new-policy-support' },
                    { title: 'Corporate / SME Insurance', desc: 'Group health & fire liability', icon: <Briefcase size={18} color="#2563eb" />, link: '/new-policy-support' },
                    { title: 'Travel Insurance', desc: 'Schengen & US approved', icon: <Plane size={18} color="#0891b2" />, link: '/new-policy-support' }
                  ].map((item, idx) => (
                    <Link
                      key={idx}
                      to={item.link}
                      onClick={() => setActiveDropdown(null)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '8px 10px',
                        borderRadius: '10px',
                        textDecoration: 'none',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{ background: '#f1f5f9', padding: '6px', borderRadius: '8px' }}>
                        {item.icon}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f2b48' }}>{item.title}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{item.desc}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Renew Your Policy Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => toggleDropdown('renewal')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'none',
                  border: 'none',
                  padding: '8px 12px',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  color: activeDropdown === 'renewal' ? '#059669' : '#1e293b',
                  cursor: 'pointer',
                  borderRadius: '8px',
                  transition: 'all 0.15s ease'
                }}
              >
                Renew Your Policy <ChevronDown size={14} style={{ transform: activeDropdown === 'renewal' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>

              {activeDropdown === 'renewal' && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  left: '0',
                  width: '260px',
                  background: '#ffffff',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 20px 35px -10px rgba(0, 0, 0, 0.15)',
                  padding: '8px',
                  zIndex: 1100,
                  animation: 'dropdownFadeIn 0.15s ease-out'
                }}>
                  {[
                    { title: 'Health Insurance Renewal', link: '/renewal-port' },
                    { title: 'Motor / Car Renewal', link: '/renewal-port' },
                    { title: 'Two Wheeler Renewal', link: '/renewal-port' },
                    { title: 'Port Existing Policy', link: '/renewal-port' }
                  ].map((item, idx) => (
                    <Link
                      key={idx}
                      to={item.link}
                      onClick={() => setActiveDropdown(null)}
                      style={{
                        display: 'block',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: '#0f2b48',
                        textDecoration: 'none',
                        transition: 'background 0.15s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      {item.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Claim Support Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => toggleDropdown('claims')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'none',
                  border: 'none',
                  padding: '8px 12px',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  color: activeDropdown === 'claims' ? '#059669' : '#1e293b',
                  cursor: 'pointer',
                  borderRadius: '8px',
                  transition: 'all 0.15s ease'
                }}
              >
                Claim Support <ChevronDown size={14} style={{ transform: activeDropdown === 'claims' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>

              {activeDropdown === 'claims' && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  left: '0',
                  width: '260px',
                  background: '#ffffff',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 20px 35px -10px rgba(0, 0, 0, 0.15)',
                  padding: '8px',
                  zIndex: 1100,
                  animation: 'dropdownFadeIn 0.15s ease-out'
                }}>
                  {[
                    { title: 'File / Intimate a Claim', link: '/claim-support' },
                    { title: 'Track Claim Status', link: '/claim-support' },
                    { title: 'Network Hospitals (Cashless)', link: '/network-hospitals' },
                    { title: 'Become POSP Agent', link: '/become-posp' }
                  ].map((item, idx) => (
                    <Link
                      key={idx}
                      to={item.link}
                      onClick={() => setActiveDropdown(null)}
                      style={{
                        display: 'block',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: '#0f2b48',
                        textDecoration: 'none',
                        transition: 'background 0.15s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      {item.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* 4. Loans Direct Link */}
            <NavLink
              to="/loans"
              style={({ isActive }) => ({
                padding: '8px 12px',
                fontSize: '0.88rem',
                fontWeight: 700,
                color: isActive ? '#059669' : '#0f2b48',
                textDecoration: 'none',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              })}
            >
              <Building2 size={16} color="#d97706" /> Loans
            </NavLink>
          </nav>

          {/* Right: Talk to Expert Pill & Sign In Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            
            {/* Talk to Expert CTA (PolicyBazaar Style) */}
            <a
              href="tel:+918367415156"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#f0fdf4',
                color: '#15803d',
                border: '1.5px solid #86efac',
                padding: '8px 14px',
                borderRadius: '9999px',
                fontWeight: 700,
                fontSize: '0.84rem',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#dcfce7';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#f0fdf4';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <Phone size={14} /> Talk to Expert
            </a>

            {/* Sign In / User Profile */}
            {isAuthenticated ? (
              <div className="user-profile-menu-wrapper" style={{ position: 'relative' }}>
                <button
                  onClick={() => toggleDropdown('userProfile')}
                  className="user-profile-trigger"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    padding: '4px 10px 4px 4px',
                    borderRadius: '9999px',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    background: '#0f2b48',
                    color: '#f59e0b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.75rem'
                  }}>
                    {userInitials}
                  </div>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f2b48' }}>
                    {user.fullName?.split(' ')[0]}
                  </span>
                  <ChevronDown size={14} color="#64748b" />
                </button>

                {activeDropdown === 'userProfile' && (
                  <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: '240px',
                    background: '#ffffff',
                    borderRadius: '14px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 20px 35px -10px rgba(0, 0, 0, 0.15)',
                    padding: '8px',
                    zIndex: 1100
                  }}>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setActiveDropdown(null)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          color: '#059669',
                          textDecoration: 'none'
                        }}
                      >
                        <LayoutDashboard size={16} /> Operations Console
                      </Link>
                    )}
                    <button
                      onClick={() => { setActiveDropdown(null); handleLogout(); }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: '#ef4444',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#0f2b48',
                  color: '#ffffff',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  textDecoration: 'none',
                  boxShadow: '0 4px 10px rgba(15, 43, 72, 0.15)',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#1e3a5f'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#0f2b48'}
              >
                Sign In
              </Link>
            )}

          </div>

        </div>
      </header>

      {/* Modern Left-Side Mobile Drawer Navigation (PolicyBazaar Style) */}
      {isMobileOpen && (
        <div className="mobile-backdrop" onClick={() => setIsMobileOpen(false)} />
      )}
      <div className={`mobile-drawer-left ${isMobileOpen ? 'open' : ''}`}>
        
        {/* Drawer Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: '1rem',
          borderBottom: '1px solid #e2e8f0',
          marginBottom: '0.5rem'
        }}>
          <Link to="/" onClick={() => setIsMobileOpen(false)} style={{ display: 'flex', alignItems: 'center' }}>
            <img src={logoImg} alt="Aadhiraksha" style={{ height: '36px', width: 'auto', objectFit: 'contain' }} />
          </Link>
          <button 
            onClick={() => setIsMobileOpen(false)}
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748b',
              cursor: 'pointer'
            }}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Menu Items with Accordions (PolicyBazaar Mobile UX) */}
        <div style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto', flex: 1, paddingRight: '4px', gap: '8px' }}>
          
          {/* Accordion 1: Insurance Products */}
          <div>
            <button
              onClick={() => setMobileAccordion(mobileAccordion === 'products' ? null : 'products')}
              className={`mobile-accordion-header ${mobileAccordion === 'products' ? 'active' : ''}`}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HeartPulse size={18} color="#059669" /> Insurance Products
              </span>
              <ChevronDown size={16} style={{ transform: mobileAccordion === 'products' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>

            {mobileAccordion === 'products' && (
              <div className="mobile-accordion-body">
                {[
                  { title: 'Health Insurance', icon: <HeartPulse size={15} color="#059669" />, bg: '#ecfdf5', link: '/new-policy-support' },
                  { title: 'Term Life Insurance', icon: <ShieldCheck size={15} color="#0284c7" />, bg: '#e0f2fe', link: '/new-policy-support' },
                  { title: 'Car & 2-Wheeler Insurance', icon: <Car size={15} color="#d97706" />, bg: '#fef3c7', link: '/new-policy-support' },
                  { title: 'Family Health Floater', icon: <Users size={15} color="#db2777" />, bg: '#fdf2f8', link: '/new-policy-support' },
                  { title: 'Corporate / SME Insurance', icon: <Briefcase size={15} color="#2563eb" />, bg: '#eff6ff', link: '/new-policy-support' },
                  { title: 'Travel Insurance', icon: <Plane size={15} color="#0891b2" />, bg: '#ecfeff', link: '/new-policy-support' }
                ].map((item, idx) => (
                  <NavLink
                    key={idx}
                    to={item.link}
                    onClick={() => setIsMobileOpen(false)}
                    className="mobile-menu-link-item"
                  >
                    <div className="mobile-menu-icon-box" style={{ background: item.bg }}>
                      {item.icon}
                    </div>
                    <span>{item.title}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>

          {/* Accordion 2: Renewals & Porting */}
          <div>
            <button
              onClick={() => setMobileAccordion(mobileAccordion === 'renewals' ? null : 'renewals')}
              className={`mobile-accordion-header ${mobileAccordion === 'renewals' ? 'active' : ''}`}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileCheck size={18} color="#0284c7" /> Renewals & Porting
              </span>
              <ChevronDown size={16} style={{ transform: mobileAccordion === 'renewals' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>

            {mobileAccordion === 'renewals' && (
              <div className="mobile-accordion-body">
                {[
                  { title: 'Health Insurance Renewal', icon: <HeartPulse size={15} color="#059669" />, bg: '#ecfdf5', link: '/renewal-port' },
                  { title: 'Motor / Car Renewal', icon: <Car size={15} color="#d97706" />, bg: '#fef3c7', link: '/renewal-port' },
                  { title: 'Two Wheeler Renewal', icon: <Bike size={15} color="#7c3aed" />, bg: '#f5f3ff', link: '/renewal-port' },
                  { title: 'Port Existing Policy', icon: <FileCheck size={15} color="#0284c7" />, bg: '#e0f2fe', link: '/renewal-port' }
                ].map((item, idx) => (
                  <NavLink
                    key={idx}
                    to={item.link}
                    onClick={() => setIsMobileOpen(false)}
                    className="mobile-menu-link-item"
                  >
                    <div className="mobile-menu-icon-box" style={{ background: item.bg }}>
                      {item.icon}
                    </div>
                    <span>{item.title}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>

          {/* Accordion 3: Claims Desk & Network */}
          <div>
            <button
              onClick={() => setMobileAccordion(mobileAccordion === 'claims' ? null : 'claims')}
              className={`mobile-accordion-header ${mobileAccordion === 'claims' ? 'active' : ''}`}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={18} color="#d97706" /> Claims & Hospitals
              </span>
              <ChevronDown size={16} style={{ transform: mobileAccordion === 'claims' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>

            {mobileAccordion === 'claims' && (
              <div className="mobile-accordion-body">
                {[
                  { title: 'File / Intimate Claim', icon: <ShieldCheck size={15} color="#059669" />, bg: '#ecfdf5', link: '/claim-support' },
                  { title: 'Track Claim Status', icon: <FileCheck size={15} color="#0284c7" />, bg: '#e0f2fe', link: '/claim-support' },
                  { title: 'Network Hospitals (Cashless)', icon: <Hospital size={15} color="#d97706" />, bg: '#fef3c7', link: '/network-hospitals' }
                ].map((item, idx) => (
                  <NavLink
                    key={idx}
                    to={item.link}
                    onClick={() => setIsMobileOpen(false)}
                    className="mobile-menu-link-item"
                  >
                    <div className="mobile-menu-icon-box" style={{ background: item.bg }}>
                      {item.icon}
                    </div>
                    <span>{item.title}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>

          {/* Accordion 4: Loans & Partners */}
          <div>
            <button
              onClick={() => setMobileAccordion(mobileAccordion === 'growth' ? null : 'growth')}
              className={`mobile-accordion-header ${mobileAccordion === 'growth' ? 'active' : ''}`}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building2 size={18} color="#ea580c" /> Loans & POSP Portal
              </span>
              <ChevronDown size={16} style={{ transform: mobileAccordion === 'growth' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>

            {mobileAccordion === 'growth' && (
              <div className="mobile-accordion-body">
                {[
                  { title: 'Business & Home Loans', icon: <Building2 size={15} color="#ea580c" />, bg: '#fff7ed', link: '/loans' },
                  { title: 'Become POSP Agent', icon: <UserCheck size={15} color="#7c3aed" />, bg: '#f5f3ff', link: '/become-posp' }
                ].map((item, idx) => (
                  <NavLink
                    key={idx}
                    to={item.link}
                    onClick={() => setIsMobileOpen(false)}
                    className="mobile-menu-link-item"
                  >
                    <div className="mobile-menu-icon-box" style={{ background: item.bg }}>
                      {item.icon}
                    </div>
                    <span>{item.title}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Drawer Footer Actions */}
        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
          <a
            href="tel:+918367415156"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              color: '#ffffff',
              padding: '12px',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '0.88rem',
              textDecoration: 'none',
              marginBottom: '8px',
              boxShadow: '0 4px 12px rgba(5, 150, 105, 0.2)'
            }}
          >
            <Phone size={16} /> Talk to Expert (+91 8367415156)
          </a>

          {!isAuthenticated && (
            <Link
              to="/login"
              onClick={() => setIsMobileOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                color: '#0f2b48',
                padding: '10px',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '0.85rem',
                textDecoration: 'none'
              }}
            >
              <LogIn size={16} /> Partner & Staff Login
            </Link>
          )}
        </div>

      </div>
    </>
  );
}
