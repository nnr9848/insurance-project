import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Globe, ShieldCheck, Headphones } from 'lucide-react';
import logoImg from '../assets/logo.png';

export default function Footer() {
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
                  4th Floor, Mytri Constructions,<br />
                  Opp: ECIL Busstop, ECIL, Hyderabad.
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
              <a href="tel:+918367415156" className="footer-touch-pill">
                <div className="touch-pill-icon-box phone-box">
                  <Phone size={16} />
                </div>
                <div className="touch-pill-content">
                  <span className="pill-sub">Talk to Expert</span>
                  <span className="pill-main">+91 8367415156</span>
                </div>
              </a>

              {/* Email Action Button */}
              <a href="mailto:info@aadhirakshainsurance.com" className="footer-touch-pill">
                <div className="touch-pill-icon-box mail-box">
                  <Mail size={16} />
                </div>
                <div className="touch-pill-content">
                  <span className="pill-sub">Email Support</span>
                  <span className="pill-main">info@aadhirakshainsurance.com</span>
                </div>
              </a>

              {/* Website */}
              <a 
                href="https://www.aadhirakshainsurance.com" 
                target="_blank" 
                rel="noreferrer" 
                className="footer-touch-pill"
              >
                <div className="touch-pill-icon-box web-box">
                  <Globe size={16} />
                </div>
                <div className="touch-pill-content">
                  <span className="pill-sub">Official Website</span>
                  <span className="pill-main">www.aadhirakshainsurance.com</span>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Legal Bar */}
        <div className="footer-bottom-bar">
          <div className="footer-copyright">
            &copy; {new Date().getFullYear()} Aadhiraksha Insurance & Financial Services Pvt Ltd. All Rights Reserved. | Designed by <span className="designer-tag">EsaleMedia</span>
          </div>

          <div className="footer-legal-links">
            <Link to="/new-policy-support" className="legal-link">Privacy Policy</Link>
            <Link to="/claim-support" className="legal-link">Terms of Service</Link>
            <Link to="/renewal-port" className="legal-link">IRDAI Disclaimer</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

