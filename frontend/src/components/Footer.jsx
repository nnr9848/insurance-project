import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Phone, Mail, MapPin, CheckCircle2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="main-footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Shield size={28} color="#f59e0b" />
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>AADHIRAKSHA</span>
            </div>
            <p style={{ fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1.25rem' }}>
              Aadhiraksha Insurance & Financial Services Pvt Ltd is committed to delivering complete financial security, term protection, health shields, and credit solutions across India.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Phone size={15} color="#f59e0b" />
                <span>+91 8367415156 / +91 814205679</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={15} color="#f59e0b" />
                <span>support@aadhirakshainsurance.com</span>
              </div>
            </div>
          </div>

          {/* Insurance Plans */}
          <div>
            <h4 className="footer-col-title">Insurance Plans</h4>
            <ul className="footer-links">
              <li><Link to="/new-policy-support">Health Insurance (100% Cashless)</Link></li>
              <li><Link to="/new-policy-support">Life & Term Protection</Link></li>
              <li><Link to="/new-policy-support">Zero-Dep Motor Insurance</Link></li>
              <li><Link to="/new-policy-support">Corporate & SME Shields</Link></li>
              <li><Link to="/new-policy-support">Overseas Travel Insurance</Link></li>
            </ul>
          </div>

          {/* Quick Support */}
          <div>
            <h4 className="footer-col-title">Customer Support</h4>
            <ul className="footer-links">
              <li><Link to="/claim-support">Instant Claim Assistance</Link></li>
              <li><Link to="/renewal-port">Port / Renew Policy</Link></li>
              <li><Link to="/network-hospitals">Find Cashless Hospitals</Link></li>
              <li><Link to="/become-posp">Become a POSP Agent</Link></li>
              <li><Link to="/loans">Fast Loan Financing</Link></li>
            </ul>
          </div>

          {/* Portals & Legal */}
          <div>
            <h4 className="footer-col-title">Partner & Admin</h4>
            <ul className="footer-links">
              <li><Link to="/login">POSP Partner Login</Link></li>
              <li><Link to="/login">Staff / Admin Portal</Link></li>
              <li><a href="#privacy">Privacy Policy</a></li>
              <li><a href="#terms">Terms & Conditions</a></li>
              <li><a href="#disclaimer">IRDAI Guidelines Notice</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div>
            &copy; {new Date().getFullYear()} Aadhiraksha Insurance & Financial Services Pvt Ltd. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <span>🔒 256-Bit SSL Encrypted Platform</span>
            <span>⚡ Certified POSP Network</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
