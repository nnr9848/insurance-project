import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Globe, ShieldCheck, Headphones } from 'lucide-react';
import logoImg from '../assets/logo.png';
import { useBusinessProfile } from '../context/BusinessProfileContext';

export default function Footer() {
  const { businessProfile } = useBusinessProfile();

  const phone = businessProfile?.primaryPhone || '+91 8367415156';
  const cleanPhone = phone.replace(/\s+/g, '');
  const email = businessProfile?.supportEmail || 'info@aadhirakshainsurance.com';
  const website = businessProfile?.websiteUrl || 'https://www.aadhirakshainsurance.com';
  const addressLine1 = businessProfile?.officeAddressLine1 || '4th Floor, Mytri Constructions,';
  const addressLine2 = businessProfile?.officeAddressLine2 || 'Opp: ECIL Busstop, ECIL, Hyderabad.';

  return (
    <footer className="main-footer-modern">
      <div className="container" style={{ maxWidth: '1240px' }}>
        {/* Top Brand & Action Grid */}
        <div className="footer-top-grid">
          {/* Left Column: Brand & Communication Address */}
          <div className="footer-brand-col">
            <div className="footer-logo-card">
              <img 
                src={logoImg} 
                alt="Aadhiraksha Insurance Marketing & Financial Services" 
                className="footer-logo-img"
              />
            </div>

            <div className="footer-address-box">
              <MapPin size={20} className="footer-pin-icon" />
              <div>
                <div className="footer-address-title">Communication Address:</div>
                <div className="footer-address-text">
                  {addressLine1}<br />
                  {addressLine2}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: 1-Tap Touch Action Cards & Quick Connect */}
          <div className="footer-actions-col">
            <div className="footer-irdai-badge">
              <ShieldCheck size={16} />
              <span>IRDAI Registered Insurance & Financial Services Portal</span>
            </div>

            <div className="footer-contact-actions">
              {/* Call Action Button */}
              <a href={`tel:${cleanPhone}`} className="footer-touch-pill">
                <div className="touch-pill-icon-box phone-box">
                  <Phone size={16} />
                </div>
                <div className="touch-pill-content">
                  <span className="pill-sub">Talk to Expert</span>
                  <span className="pill-main">{phone}</span>
                </div>
              </a>

              {/* Email Action Button */}
              <a href={`mailto:${email}`} className="footer-touch-pill">
                <div className="touch-pill-icon-box mail-box">
                  <Mail size={16} />
                </div>
                <div className="touch-pill-content">
                  <span className="pill-sub">Email Support</span>
                  <span className="pill-main">{email}</span>
                </div>
              </a>

              {/* Website */}
              <a 
                href={website} 
                target="_blank" 
                rel="noreferrer" 
                className="footer-touch-pill"
              >
                <div className="touch-pill-icon-box web-box">
                  <Globe size={16} />
                </div>
                <div className="touch-pill-content">
                  <span className="pill-sub">Official Website</span>
                  <span className="pill-main">{website.replace(/^https?:\/\//, '')}</span>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Legal Bar */}
        <div className="footer-bottom-bar">
          <div className="footer-copyright">
            &copy; {new Date().getFullYear()} Aadhiraksha Insurance & Financial Services Pvt Ltd. All Rights Reserved. | Designed by <a href="https://www.prabhatech.com/" target="_blank" rel="noopener noreferrer" className="designer-tag" style={{ textDecoration: 'none' }}>PrabhaTech</a>
          </div>

          <div className="footer-legal-links">
            <Link to="/privacy-policy" className="legal-link">Privacy Policy</Link>
            <Link to="/terms-of-service" className="legal-link">Terms of Service</Link>
            <Link to="/irdai-disclaimer" className="legal-link">IRDAI Disclaimer</Link>
            <Link to="/grievance-redressal" className="legal-link">Grievance Redressal</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

