import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Globe, Shield } from 'lucide-react';
import logoImg from '../assets/logo.png';

export default function Footer() {
  return (
    <footer style={{ background: '#04281f', color: '#ffffff', paddingTop: '4rem', paddingBottom: '2.5rem' }}>
      <div className="container" style={{ maxWidth: '1240px' }}>
        {/* Top Info Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '3rem',
          alignItems: 'start',
          paddingBottom: '3.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          {/* Left Column: Brand Box & Address */}
          <div>
            {/* White Brand Card */}
            <div style={{
              background: '#ffffff',
              padding: '0.65rem 1rem',
              borderRadius: '12px',
              display: 'inline-flex',
              alignItems: 'center',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.25)',
              marginBottom: '1.75rem'
            }}>
              <img 
                src={logoImg} 
                alt="Aadhiraksha Insurance Marketing & Financial Services" 
                style={{ height: '44px', width: 'auto', objectFit: 'contain' }}
              />
            </div>

            {/* Communication Address */}
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <MapPin size={22} color="#f59e0b" style={{ flexShrink: 0, marginTop: '0.2rem' }} />
              <div>
                <div style={{ fontWeight: 800, fontSize: '1rem', color: '#f8fafc', marginBottom: '0.35rem' }}>
                  Communication Address:
                </div>
                <div style={{ color: '#cbd5e1', fontSize: '0.92rem', lineHeight: '1.6', maxWidth: '340px' }}>
                  4th Floor, Mytri Constructions,<br />
                  Opp: ECIL Busstop, ECIL, Hyderabad.
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Links */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            justifyContent: 'center',
            paddingTop: '0.5rem'
          }}>
            {/* Website */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <Globe size={19} color="#f59e0b" style={{ flexShrink: 0 }} />
              <div style={{ fontSize: '0.95rem', color: '#cbd5e1' }}>
                Website:{' '}
                <a 
                  href="https://www.aadhirakshainsurance.com" 
                  target="_blank" 
                  rel="noreferrer"
                  style={{ color: '#ffffff', fontWeight: 700, textDecoration: 'none' }}
                >
                  www.aadhirakshainsurance.com
                </a>
              </div>
            </div>

            {/* Contact No */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <Phone size={19} color="#f59e0b" style={{ flexShrink: 0 }} />
              <div style={{ fontSize: '0.95rem', color: '#cbd5e1' }}>
                Contact No:{' '}
                <a 
                  href="tel:+918367415156" 
                  style={{ color: '#ffffff', fontWeight: 700, textDecoration: 'none' }}
                >
                  +91 8367415156
                </a>
              </div>
            </div>

            {/* Mail Id */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <Mail size={19} color="#f59e0b" style={{ flexShrink: 0 }} />
              <div style={{ fontSize: '0.95rem', color: '#cbd5e1' }}>
                Mail Id:{' '}
                <a 
                  href="mailto:info@aadhirakshainsurance.com" 
                  style={{ color: '#ffffff', fontWeight: 700, textDecoration: 'none' }}
                >
                  info@aadhirakshainsurance.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          paddingTop: '2rem',
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1.25rem',
          fontSize: '0.85rem',
          color: '#94a3b8'
        }}>
          <div>
            &copy; {new Date().getFullYear()} Aadhiraksha Insurance & Financial Services Pvt Ltd. All Rights Reserved. | Designed by <span style={{ color: '#f59e0b', fontWeight: 700 }}>EsaleMedia</span>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <Link to="/renewal-port" style={{ color: '#cbd5e1', transition: 'color 0.2s' }}>Privacy Policy</Link>
            <Link to="/claim-support" style={{ color: '#cbd5e1', transition: 'color 0.2s' }}>Terms of Service</Link>
            <Link to="/network-hospitals" style={{ color: '#cbd5e1', transition: 'color 0.2s' }}>IRDAI Disclaimer</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

