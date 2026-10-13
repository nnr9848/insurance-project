import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  Phone, 
  Mail, 
  ShieldCheck, 
  ChevronDown,
  ChevronRight,
  ExternalLink,
  HeartHandshake,
  Clock,
  ArrowRight
} from 'lucide-react';
import logoImg from '../assets/logo.png';
import { useBusinessProfile } from '../context/BusinessProfileContext';
import WhatsAppIcon from './common/WhatsAppIcon';
import { 
  LinkedInIcon, 
  YouTubeIcon, 
  InstagramIcon, 
  FacebookIcon, 
  XTwitterIcon 
} from './common/SocialBrandIcons';

export default function Footer() {
  const { businessProfile } = useBusinessProfile();

  // Accordion state for native mobile screens (< 768px)
  const [openAccordions, setOpenAccordions] = useState({
    products: false,
    services: false,
    company: false
  });

  const toggleAccordion = (key) => {
    setOpenAccordions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const phone = businessProfile?.primaryPhone || '+91 8367415156';
  const cleanPhone = phone.replace(/\s+/g, '');
  const email = businessProfile?.supportEmail || 'info@aadhirakshainsurance.com';
  const addressLine1 = businessProfile?.officeAddressLine1 || '4th Floor, Mytri Constructions,';
  const addressLine2 = businessProfile?.officeAddressLine2 || 'Opp: ECIL Busstop, ECIL, Hyderabad.';
  const irdaiNo = businessProfile?.irdaiRegistrationNo || 'IRDAI/IMF/TS/2026/00482';
  const mapsLink = businessProfile?.googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(`${addressLine1} ${addressLine2}`)}`;

  // Filtered active social media links
  const socialLinks = [
    {
      key: 'linkedin',
      name: 'LinkedIn',
      url: businessProfile?.linkedinUrl,
      icon: <LinkedInIcon size={18} />,
      className: 'linkedin'
    },
    {
      key: 'youtube',
      name: 'YouTube',
      url: businessProfile?.youtubeUrl,
      icon: <YouTubeIcon size={18} />,
      className: 'youtube'
    },
    {
      key: 'instagram',
      name: 'Instagram',
      url: businessProfile?.instagramUrl,
      icon: <InstagramIcon size={18} />,
      className: 'instagram'
    },
    {
      key: 'facebook',
      name: 'Facebook',
      url: businessProfile?.facebookUrl,
      icon: <FacebookIcon size={18} />,
      className: 'facebook'
    },
    {
      key: 'x-twitter',
      name: 'X (Twitter)',
      url: businessProfile?.xTwitterUrl,
      icon: <XTwitterIcon size={18} />,
      className: 'x-twitter'
    },
    {
      key: 'maps',
      name: 'Google Maps Pin',
      url: mapsLink,
      icon: <MapPin size={18} />,
      className: 'maps'
    }
  ].filter(s => !!s.url);

  return (
    <footer className="main-footer-modern">
      <div className="container" style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 1rem' }}>

        {/* 1. NATIVE MOBILE QUICK ACTION DOCK (Visible only on mobile/tablet) */}
        <div className="footer-mobile-dock">
          <div className="footer-mobile-dock-header">
            <span className="dock-badge">
              <Clock size={13} /> 24/7 Dedicated Assistance
            </span>
            <span className="dock-phone">{phone}</span>
          </div>
          <div className="footer-mobile-dock-grid">
            <a href={`tel:${cleanPhone}`} className="dock-btn call-btn">
              <Phone size={16} /> <span>Call Helpline</span>
            </a>
            <a 
              href={`https://wa.me/${cleanPhone.replace('+', '')}?text=${encodeURIComponent('Hello Aadhiraksha, I need assistance with an insurance claim / quote.')}`}
              target="_blank" 
              rel="noopener noreferrer" 
              className="dock-btn wa-btn"
            >
              <WhatsAppIcon size={16} color="#ffffff" /> <span>WhatsApp Desk</span>
            </a>
            <a href={mapsLink} target="_blank" rel="noopener noreferrer" className="dock-btn maps-btn">
              <MapPin size={16} /> <span>Navigate Pin</span>
            </a>
          </div>
        </div>

        {/* 2. BALANCED 3-COLUMN COMPACT LAYOUT */}
        <div className="footer-compact-grid">

          {/* COLUMN 1: Brand Authority, IRDAI Badge & Social Links */}
          <div className="footer-col brand-col">
            <div className="footer-logo-card">
              <img 
                src={logoImg} 
                alt="Aadhiraksha Insurance Marketing & Financial Services" 
                className="footer-logo-img"
              />
            </div>

            <div className="footer-irdai-pill">
              <ShieldCheck size={14} color="#34d399" />
              <span>IRDAI Reg: {irdaiNo}</span>
            </div>

            <p className="footer-brand-tagline">
              Licensed insurance marketing firm providing 100% cashless hospital coordination & zero-headache claims concierge.
            </p>

            {/* Social Links Row */}
            {socialLinks.length > 0 && (
              <div className="footer-social-wrapper">
                <span className="footer-social-title">Follow & Connect:</span>
                <div className="footer-social-icons">
                  {socialLinks.map(s => (
                    <a
                      key={s.key}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`footer-social-btn ${s.className}`}
                      title={`Aadhiraksha on ${s.name}`}
                      aria-label={`Aadhiraksha on ${s.name}`}
                    >
                      {s.icon}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* COLUMN 2: Quick Services & Key Portals (Accordion on Mobile) */}
          <div className={`footer-col links-col accordion-col ${openAccordions.services ? 'open' : ''}`}>
            <button 
              type="button" 
              className="footer-accordion-header"
              onClick={() => toggleAccordion('services')}
              aria-expanded={openAccordions.services}
            >
              <span>Quick Services</span>
              <ChevronDown size={18} className="accordion-chevron" />
            </button>
            <div className="footer-accordion-body">
              <ul className="footer-clean-links">
                <li><Link to="/insurance/health">Health & Critical Illness Cover</Link></li>
                <li><Link to="/insurance/motor">Motor & Zero-Dep Protection</Link></li>
                <li><Link to="/renew-policy" className="highlight-link">🔄 Instant Policy Renewal</Link></li>
                <li><Link to="/port-policy" style={{ color: '#c4b5fd', fontWeight: 700 }}>⚡ Port Policy (Switch Insurer)</Link></li>
                <li><Link to="/claim-support?tab=file" className="highlight-link">⚡ Instant Claim Intimation</Link></li>
                <li><Link to="/network-hospitals">Cashless Hospital Network (10,000+)</Link></li>
                <li><Link to="/blog" style={{ color: '#38bdf8', fontWeight: 700 }}>📚 Insurance Knowledge & Blog Hub</Link></li>
                <li><Link to="/about">About Us & Leadership Story</Link></li>
                <li><Link to="/become-posp">Become a Certified POSP Agent</Link></li>
              </ul>
            </div>
          </div>

          {/* COLUMN 3: Office Address & Direct Assistance (Accordion on Mobile) */}
          <div className={`footer-col contact-col accordion-col ${openAccordions.company ? 'open' : ''}`}>
            <button 
              type="button" 
              className="footer-accordion-header"
              onClick={() => toggleAccordion('company')}
              aria-expanded={openAccordions.company}
            >
              <span>Office & Assistance</span>
              <ChevronDown size={18} className="accordion-chevron" />
            </button>

            <div className="footer-accordion-body">
              <div className="footer-contact-list">
                <div className="footer-contact-row">
                  <MapPin size={18} className="contact-icon pin" />
                  <div className="contact-details">
                    <span className="contact-label">Communication Address</span>
                    <p className="contact-text">{addressLine1}<br />{addressLine2}</p>
                    <a href={mapsLink} target="_blank" rel="noopener noreferrer" className="contact-map-link">
                      Navigate via Google Maps <ExternalLink size={12} />
                    </a>
                  </div>
                </div>

                <div className="footer-contact-row">
                  <Phone size={18} className="contact-icon phone" />
                  <div className="contact-details">
                    <span className="contact-label">24/7 Helpline</span>
                    <a href={`tel:${cleanPhone}`} className="contact-val-link">{phone}</a>
                  </div>
                </div>

                <div className="footer-contact-row">
                  <Mail size={18} className="contact-icon mail" />
                  <div className="contact-details">
                    <span className="contact-label">Advisory & Support</span>
                    <a href={`mailto:${email}`} className="contact-val-link">{email}</a>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* 3. BOTTOM STATUTORY & COPYRIGHT BAR */}
        <div className="footer-bottom-bar">
          <div className="footer-copyright">
            &copy; {new Date().getFullYear()} Aadhiraksha Insurance Marketing & Financial Services Pvt Ltd. All Rights Reserved. | Designed by <a href="https://www.prabhatech.com/" target="_blank" rel="noopener noreferrer" className="designer-tag">PrabhaTech</a>
          </div>

          <div className="footer-legal-links">
            <Link to="/about" className="legal-link">About Us</Link>
            <span className="legal-dot">•</span>
            <Link to="/privacy-policy" className="legal-link">Privacy Policy</Link>
            <span className="legal-dot">•</span>
            <Link to="/terms-of-service" className="legal-link">Terms of Service</Link>
            <span className="legal-dot">•</span>
            <Link to="/irdai-disclaimer" className="legal-link">IRDAI Disclaimer</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}


