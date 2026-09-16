import React, { useState, useRef, useEffect } from 'react';
import { Phone, Shield, User, LogIn, LayoutDashboard, LogOut, ChevronDown, ShieldCheck, Mail } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logoImg from '../assets/logo.png';

export default function Header() {
  const { user, logout, isAuthenticated } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate('/');
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isAdmin = user?.roles?.includes('ROLE_ADMIN') || user?.roles?.includes('ROLE_STAFF');
  const userInitials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  return (
    <header className="top-header">
      {/* Brand Logo & Slogan Row */}
      <div className="header-brand-row">
        <div className="brand-container">
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
            <img 
              src={logoImg} 
              alt="Aadhiraksha Insurance Marketing & Financial Services" 
              style={{ height: '48px', width: 'auto', objectFit: 'contain' }}
            />
          </Link>
        </div>

        {/* Slogan for larger viewports */}
        <div className="slogan-box">
          <p className="slogan-main">Insurance is the first line of defense for everyone's life.</p>
          <p className="slogan-sub">India's No. 1 Most Trusted Insurance Platform For All</p>
        </div>
      </div>

      {/* Action Row: Quick Contact + Single Unified User Profile Menu */}
      <div className="header-actions-row">
        <a href="tel:+918367415156" className="quick-contact" aria-label="Call Aadhiraksha support">
          <div className="contact-icon-wrapper">
            <Phone size={16} />
          </div>
          <div className="contact-details">
            <span className="contact-label">Quick Contact</span>
            <span className="contact-phone">+91 8367415156</span>
          </div>
        </a>

        {isAuthenticated ? (
          <div className="user-profile-menu-wrapper" ref={dropdownRef}>
            {/* Unified User Avatar Trigger */}
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="user-profile-trigger"
              aria-expanded={dropdownOpen}
              aria-label="User Account Menu"
            >
              <div className="user-avatar-circle">
                {userInitials}
              </div>
              <div className="user-trigger-info">
                <span className="user-trigger-name">{user.fullName?.split(' ')[0]}</span>
                <span className="user-trigger-role">{isAdmin ? 'Admin' : 'Member'}</span>
              </div>
              <ChevronDown size={15} className={`user-trigger-chevron ${dropdownOpen ? 'rotate' : ''}`} />
            </button>

            {/* Dropdown Menu Modal */}
            {dropdownOpen && (
              <div className="user-dropdown-card">
                <div className="user-dropdown-header">
                  <div className="dropdown-user-name">{user.fullName}</div>
                  <div className="dropdown-user-email">{user.email}</div>
                  {isAdmin && (
                    <span className="dropdown-role-badge">
                      <ShieldCheck size={12} /> Administrator Access
                    </span>
                  )}
                </div>

                <div className="user-dropdown-links">
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setDropdownOpen(false)}
                      className="dropdown-item dropdown-item-admin"
                    >
                      <LayoutDashboard size={16} />
                      <span>Operations Console</span>
                    </Link>
                  )}
                  {user?.roles?.includes('ROLE_POSP_AGENT') && (
                    <Link
                      to="/become-posp"
                      onClick={() => setDropdownOpen(false)}
                      className="dropdown-item"
                    >
                      <Shield size={16} />
                      <span>POSP Agent Workspace</span>
                    </Link>
                  )}
                </div>

                <div className="user-dropdown-footer">
                  <button onClick={handleLogout} className="dropdown-logout-btn">
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Link
            to="/login"
            className="header-login-btn"
          >
            <LogIn size={15} color="#f59e0b" />
            <span>Sign In</span>
          </Link>
        )}
      </div>
    </header>
  );
}
