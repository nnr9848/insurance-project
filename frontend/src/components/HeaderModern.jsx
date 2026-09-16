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
  const hoverTimeoutRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  const handleMouseEnter = (name) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setActiveDropdown(name);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 120);
  };

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
      {/* PolicyBazaar-style Translucent Grey Backdrop Overlay */}
      {activeDropdown && (
        <div 
          className="header-backdrop-overlay" 
          onClick={() => setActiveDropdown(null)} 
        />
      )}

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
            <div 
              style={{ position: 'relative' }}
              onMouseEnter={() => handleMouseEnter('products')}
              onMouseLeave={handleMouseLeave}
            >
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
            <div 
              style={{ position: 'relative' }}
              onMouseEnter={() => handleMouseEnter('renewal')}
              onMouseLeave={handleMouseLeave}
            >
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
            <div 
              style={{ position: 'relative' }}
              onMouseEnter={() => handleMouseEnter('claims')}
              onMouseLeave={handleMouseLeave}
            >
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
              <div 
                className="user-profile-menu-wrapper" 
                style={{ position: 'relative' }}
                onMouseEnter={() => handleMouseEnter('userProfile')}
                onMouseLeave={handleMouseLeave}
              >
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
                  fontSize: '0.85rem',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 12px rgba(15, 43, 72, 0.15)',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#0a1e33';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#0f2b48';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <LogIn size={15} /> Sign In
              </Link>
            )}

          </div>

        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 1200,
            animation: 'fadeIn 0.2s ease-out'
          }}
        />
      )}

      {/* Mobile Sidebar Navigation */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: '85%',
          maxWidth: '360px',
          background: '#ffffff',
          zIndex: 1300,
          transform: isMobileOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '10px 0 30px rgba(0, 0, 0, 0.2)'
        }}
      >
        {/* Drawer Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid #e2e8f0',
          background: '#f8fafc'
        }}>
          <img src={logoImg} alt="Aadhiraksha" style={{ height: '36px', width: 'auto' }} />
          <button
            onClick={() => setIsMobileOpen(false)}
            style={{
              background: 'none',
              border: 'none',
              padding: '6px',
              cursor: 'pointer',
              color: '#64748b',
              borderRadius: '8px'
            }}
            aria-label="Close menu"
          >
            <X size={22} />
          </button>
        </div>

        {/* Drawer Scrollable Content with Accordions */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          
          {/* Section 1: Insurance Products (Accordion) */}
          <div style={{ 
            marginBottom: '10px', 
            borderRadius: '12px', 
            border: mobileAccordion === 'products' ? '1.5px solid #a7f3d0' : '1px solid #e2e8f0',
            overflow: 'hidden',
            transition: 'all 0.2s ease',
            background: mobileAccordion === 'products' ? '#fafdfb' : '#ffffff'
          }}>
            <button
              onClick={() => setMobileAccordion(mobileAccordion === 'products' ? '' : 'products')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                background: mobileAccordion === 'products' ? '#ecfdf5' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={18} color="#059669" />
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f2b48' }}>Insurance Products</span>
              </div>
              <ChevronDown 
                size={16} 
                color="#059669" 
                style={{ 
                  transform: mobileAccordion === 'products' ? 'rotate(180deg)' : 'none', 
                  transition: 'transform 0.2s ease' 
                }} 
              />
            </button>

            {mobileAccordion === 'products' && (
              <div style={{ padding: '8px 10px 12px 10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {[
                  { title: 'Health Insurance', desc: 'Cashless hospital network', icon: <HeartPulse size={16} color="#059669" />, link: '/new-policy-support' },
                  { title: 'Term Life Insurance', desc: '₹1 Cr cover from ₹490/mo', icon: <ShieldCheck size={16} color="#0284c7" />, link: '/new-policy-support' },
                  { title: 'Car & 2-Wheeler Insurance', desc: 'Instant policy in 2 mins', icon: <Car size={16} color="#d97706" />, link: '/new-policy-support' },
                  { title: 'Family Health Floater', desc: 'Cover spouse & kids in 1 plan', icon: <Users size={16} color="#db2777" />, link: '/new-policy-support' },
                  { title: 'Corporate / SME Insurance', desc: 'Group health & liability', icon: <Briefcase size={16} color="#2563eb" />, link: '/new-policy-support' },
                  { title: 'Travel Insurance', desc: 'Schengen & US approved', icon: <Plane size={16} color="#0891b2" />, link: '/new-policy-support' }
                ].map((item, idx) => (
                  <Link
                    key={idx}
                    to={item.link}
                    onClick={() => setIsMobileOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      background: '#ffffff',
                      border: '1px solid #f1f5f9'
                    }}
                  >
                    <div style={{ background: '#f8fafc', padding: '6px', borderRadius: '6px' }}>{item.icon}</div>
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f2b48' }}>{item.title}</div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{item.desc}</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Renew Your Policy (Accordion) */}
          <div style={{ 
            marginBottom: '10px', 
            borderRadius: '12px', 
            border: mobileAccordion === 'renewal' ? '1.5px solid #a7f3d0' : '1px solid #e2e8f0',
            overflow: 'hidden',
            transition: 'all 0.2s ease',
            background: mobileAccordion === 'renewal' ? '#fafdfb' : '#ffffff'
          }}>
            <button
              onClick={() => setMobileAccordion(mobileAccordion === 'renewal' ? '' : 'renewal')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                background: mobileAccordion === 'renewal' ? '#ecfdf5' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileCheck size={18} color="#0284c7" />
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f2b48' }}>Renew Your Policy</span>
              </div>
              <ChevronDown 
                size={16} 
                color="#0284c7" 
                style={{ 
                  transform: mobileAccordion === 'renewal' ? 'rotate(180deg)' : 'none', 
                  transition: 'transform 0.2s ease' 
                }} 
              />
            </button>

            {mobileAccordion === 'renewal' && (
              <div style={{ padding: '8px 10px 12px 10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {[
                  { title: 'Health Insurance Renewal', link: '/renewal-port' },
                  { title: 'Motor / Car Renewal', link: '/renewal-port' },
                  { title: 'Two Wheeler Renewal', link: '/renewal-port' },
                  { title: 'Port Existing Policy to Us', link: '/renewal-port' }
                ].map((item, idx) => (
                  <Link
                    key={idx}
                    to={item.link}
                    onClick={() => setIsMobileOpen(false)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      color: '#0f2b48',
                      textDecoration: 'none',
                      background: '#ffffff',
                      border: '1px solid #f1f5f9'
                    }}
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Section 3: Claim Support & Network (Accordion) */}
          <div style={{ 
            marginBottom: '10px', 
            borderRadius: '12px', 
            border: mobileAccordion === 'claims' ? '1.5px solid #a7f3d0' : '1px solid #e2e8f0',
            overflow: 'hidden',
            transition: 'all 0.2s ease',
            background: mobileAccordion === 'claims' ? '#fafdfb' : '#ffffff'
          }}>
            <button
              onClick={() => setMobileAccordion(mobileAccordion === 'claims' ? '' : 'claims')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                background: mobileAccordion === 'claims' ? '#ecfdf5' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Hospital size={18} color="#d97706" />
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f2b48' }}>Claim Support & Network</span>
              </div>
              <ChevronDown 
                size={16} 
                color="#d97706" 
                style={{ 
                  transform: mobileAccordion === 'claims' ? 'rotate(180deg)' : 'none', 
                  transition: 'transform 0.2s ease' 
                }} 
              />
            </button>

            {mobileAccordion === 'claims' && (
              <div style={{ padding: '8px 10px 12px 10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {[
                  { title: 'File / Intimate a Claim', link: '/claim-support' },
                  { title: 'Track Claim Status', link: '/claim-support' },
                  { title: 'Network Hospitals (Cashless)', link: '/network-hospitals' },
                  { title: 'Become POSP Agent', link: '/become-posp' }
                ].map((item, idx) => (
                  <Link
                    key={idx}
                    to={item.link}
                    onClick={() => setIsMobileOpen(false)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      color: '#0f2b48',
                      textDecoration: 'none',
                      background: '#ffffff',
                      border: '1px solid #f1f5f9'
                    }}
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Direct Loan Section */}
          <div style={{ marginTop: '14px', borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
            <Link
              to="/loans"
              onClick={() => setIsMobileOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: '12px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                textDecoration: 'none',
                color: '#0f2b48',
                fontWeight: 700,
                fontSize: '0.88rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Building2 size={18} color="#d97706" />
                <span>Loans & Financial Services</span>
              </div>
              <ArrowRight size={16} color="#64748b" />
            </Link>
          </div>

          {/* User Profile on Mobile */}
          {isAuthenticated && (
            <div style={{ marginTop: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', padding: '0 4px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: '#0f2b48',
                  color: '#f59e0b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.85rem'
                }}>
                  {userInitials}
                </div>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f2b48' }}>{user.fullName}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{user.email || user.username}</div>
                </div>
              </div>

              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setIsMobileOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: '#059669',
                    textDecoration: 'none',
                    background: '#f0fdf4',
                    marginBottom: '8px'
                  }}
                >
                  <LayoutDashboard size={16} /> Operations Console
                </Link>
              )}

              <button
                onClick={() => { setIsMobileOpen(false); handleLogout(); }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: '#ef4444',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  cursor: 'pointer'
                }}
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          )}

        </div>

        {/* Drawer Footer CTA */}
        <div style={{ padding: '16px', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
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
