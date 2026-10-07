import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Award, 
  Users, 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  CheckCircle2, 
  ArrowRight, 
  HeartHandshake, 
  FileText, 
  Compass, 
  Sparkles, 
  Clock, 
  ExternalLink,
  ChevronRight,
  X,
  Camera,
  Layers,
  HelpCircle
} from 'lucide-react';
import { useBusinessProfile } from '../context/BusinessProfileContext';

// Slide Images for visual aesthetics
import familyHero from '../assets/slides/family_hero.png';
import healthHero from '../assets/slides/health_hero.jpg';
import businessHero from '../assets/slides/business_hero.jpg';
import vehicleHero from '../assets/slides/vehicle_hero.jpg';
import loansHero from '../assets/slides/loans_hero.jpg';
import businessTravelHero from '../assets/slides/business_travel_hero.jpg';

// Insurer logos
import hdfcLogo from '../assets/partners/HDFC-Ergo-logo.png';
import iciciLogo from '../assets/partners/ICICI Lombard logo.webp';
import starLogo from '../assets/partners/star health insurance logo.png';
import careLogo from '../assets/partners/care health insurance logo.png';
import tataLogo from '../assets/partners/TATA AIG Insurance logo.png';
import nivaLogo from '../assets/partners/niva health insurance logo.png';
import bajajLogo from '../assets/partners/Bajaj Alilanz logo.png';
import licLogo from '../assets/partners/LIC LOGO.jpg';

export default function About() {
  const { businessProfile } = useBusinessProfile();
  const [activeTab, setActiveTab] = useState('all');
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const phone = businessProfile?.primaryPhone || '+91 8367415156';
  const cleanPhone = phone.replace(/\s+/g, '');
  const email = businessProfile?.supportEmail || 'info@aadhirakshainsurance.com';
  const address1 = businessProfile?.officeAddressLine1 || '4th Floor, Mytri Constructions,';
  const address2 = businessProfile?.officeAddressLine2 || 'Opp: ECIL Busstop, ECIL, Hyderabad.';
  const irdaiNo = businessProfile?.irdaiRegistrationNo || 'IRDAI/IMF/TS/2026/00482';

  // Gallery items with categories, captions, and curated high-resolution imagery
  const galleryItems = [
    {
      id: 1,
      category: 'office',
      title: 'Corporate Headquarters & Advisory Suite',
      subtitle: 'ECIL, Hyderabad - 4th Floor Mytri Constructions',
      image: businessHero,
      tag: 'Headquarters'
    },
    {
      id: 2,
      category: 'conclave',
      title: 'Annual POSP & Financial Advisor Conclave',
      subtitle: 'Empowering 1,200+ certified regional advisors across Telangana & AP',
      image: familyHero,
      tag: 'Advisor Network'
    },
    {
      id: 3,
      category: 'claims',
      title: '24/7 Claim Concierge Desk in Action',
      subtitle: 'Dedicated physical claim managers assisting cashless hospitalization',
      image: healthHero,
      tag: 'Claim Support'
    },
    {
      id: 4,
      category: 'awards',
      title: 'Top Performance Partner Recognition',
      subtitle: 'Recognized for stellar claim settlement speed & regulatory compliance',
      image: businessTravelHero,
      tag: 'Industry Milestone'
    },
    {
      id: 5,
      category: 'community',
      title: 'Family Financial Wellness & Motor Camp',
      subtitle: 'Educating policyholders on cashless porting & zero-dep protections',
      image: vehicleHero,
      tag: 'Community Camp'
    },
    {
      id: 6,
      category: 'finance',
      title: 'Integrated SME & Business Loan Advisory',
      subtitle: 'Expanding from protection to comprehensive wealth & MSME growth',
      image: loansHero,
      tag: 'Financial Services'
    }
  ];

  const filteredGallery = activeTab === 'all' 
    ? galleryItems 
    : galleryItems.filter(item => item.category === activeTab);

  return (
    <div className="about-page-wrapper" style={{ background: '#f8fafc', color: 'var(--text-dark)', minHeight: '100vh' }}>
      
      {/* 1. HERO BANNER */}
      <section className="about-hero-section">
        {/* Decorative Grid Pattern */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          opacity: 0.6,
          pointerEvents: 'none'
        }} />

        <div className="container" style={{ maxWidth: '1180px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.85rem' }}>
            <span style={{
              background: 'rgba(217, 119, 6, 0.2)',
              color: 'var(--accent-gold)',
              padding: '4px 12px',
              borderRadius: '9999px',
              fontSize: '0.78rem',
              fontWeight: 800,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              border: '1px solid rgba(217, 119, 6, 0.4)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <ShieldCheck size={14} /> Corporate Profile
            </span>
            <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>• {irdaiNo}</span>
          </div>

          <h1 className="about-hero-title" style={{
            fontSize: 'clamp(1.85rem, 4vw, 3rem)',
            fontWeight: 900,
            lineHeight: 1.2,
            margin: '0 0 1rem',
            letterSpacing: '-0.02em',
            color: '#ffffff'
          }}>
            India’s Most Dependable Bridge Between <br />
            <span style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Families, Protection & Financial Freedom
            </span>
          </h1>

          <p className="about-hero-desc" style={{
            fontSize: '1.02rem',
            lineHeight: 1.6,
            color: '#cbd5e1',
            maxWidth: '780px',
            margin: '0 0 1.75rem'
          }}>
            At <strong>Aadhiraksha Insurance Marketing & Financial Services Pvt Ltd</strong>, we believe every Indian family deserves unbiased, transparent, and prompt insurance advisory with zero hidden catches. Rooted in Hyderabad with a pan-regional network of over 1,200 certified advisors, we don't just sell policies — we stand beside you during claim settlements.
          </p>

          <div className="about-hero-actions" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
            <a 
              href={`tel:${cleanPhone}`}
              className="about-hero-btn-primary"
              style={{
                background: 'var(--accent-gold)',
                color: '#ffffff',
                padding: '12px 24px',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '0.92rem',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 10px 20px rgba(217, 119, 6, 0.35)',
                transition: 'transform 0.2s'
              }}
            >
              <Phone size={16} /> Connect with Senior Advisor
            </a>

            <Link 
              to="/become-posp"
              className="about-hero-btn-secondary"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                padding: '12px 22px',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '0.92rem',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Users size={16} /> Join 1,200+ POSP Advisors <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* 2. LIVE IMPACT METRICS */}
      <section className="about-metrics-bar">
        <div className="container" style={{ maxWidth: '1180px', margin: '0 auto', padding: '0 1rem' }}>
          <div className="about-metrics-card">
            <div className="about-metric-cell">
              <div className="about-metric-val" style={{ color: 'var(--primary-navy)' }}>
                ₹50+ Cr
              </div>
              <div className="about-metric-lbl">
                Claims Settled Seamlessly
              </div>
            </div>

            <div className="about-metric-cell">
              <div className="about-metric-val" style={{ color: 'var(--accent-emerald)' }}>
                25,000+
              </div>
              <div className="about-metric-lbl">
                Families Protected
              </div>
            </div>

            <div className="about-metric-cell">
              <div className="about-metric-val" style={{ color: 'var(--accent-gold)' }}>
                1,200+
              </div>
              <div className="about-metric-lbl">
                Certified Advisors
              </div>
            </div>

            <div className="about-metric-cell">
              <div className="about-metric-val" style={{ color: '#0284c7' }}>
                98.8%
              </div>
              <div className="about-metric-lbl">
                Resolution Ratio
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. WHO WE ARE & FOUNDATIONAL PILLARS */}
      <section style={{ padding: '4.5rem 1rem 3rem' }}>
        <div className="container" style={{ maxWidth: '1180px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 3rem' }}>
            <span style={{
              color: 'var(--accent-gold)',
              fontSize: '0.82rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Foundational Standards
            </span>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: 900,
              color: 'var(--primary-navy)',
              margin: '6px 0 12px'
            }}>
              Why Thousands Trust Aadhiraksha
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Unlike pure digital aggregators who hand you an automated quote and disappear during hospital admissions, we provide an omnichannel ecosystem with real people and regional offices.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.5rem'
          }}>
            {[
              {
                icon: <HeartHandshake size={24} color="#059669" />,
                title: 'Human Claim Concierge',
                desc: 'When an emergency hits, our team assists you directly with hospital TPA documentation, pre-authorizations, and quick cashless approvals.'
              },
              {
                icon: <FileText size={24} color="#d97706" />,
                title: 'Zero Hidden Fine Print',
                desc: 'We decipher policy room-rent capping, co-pay clauses, and waiting periods before you commit so there are zero surprises.'
              },
              {
                icon: <Compass size={24} color="#0284c7" />,
                title: '100% Unbiased Multi-Insurer Choice',
                desc: 'We are IRDAI authorized to compare plans across 20+ top life and general insurers to get you the best coverage at optimum premiums.'
              },
              {
                icon: <Building2 size={24} color="#7c3aed" />,
                title: 'Physical Brick-and-Mortar Presence',
                desc: 'Centrally located at ECIL Hyderabad with open walk-in desks for policy servicing, claims verification, and loan advisory.'
              }
            ].map((pillar, idx) => (
              <div 
                key={idx}
                style={{
                  background: '#ffffff',
                  padding: '2rem 1.75rem',
                  borderRadius: '18px',
                  border: '1px solid var(--border-subtle)',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.03)',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
              >
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '12px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem'
                }}>
                  {pillar.icon}
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-navy)', marginBottom: '8px' }}>
                  {pillar.title}
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.55, margin: 0 }}>
                  {pillar.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. INTERACTIVE PHOTO GALLERY & LIFE AT AADHIRAKSHA */}
      <section style={{ padding: '3.5rem 1rem 4.5rem', background: '#f1f5f9' }}>
        <div className="container" style={{ maxWidth: '1180px', margin: '0 auto' }}>
          
          <div className="about-gallery-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2.5rem' }}>
            <div>
              <span style={{
                color: 'var(--accent-gold)',
                fontSize: '0.82rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Life at Aadhiraksha & Moments
              </span>
              <h2 style={{
                fontSize: '2rem',
                fontWeight: 900,
                color: 'var(--primary-navy)',
                margin: '6px 0 0'
              }}>
                Corporate Gallery & Outreach
              </h2>
            </div>

            {/* Native Mobile Swipeable Filter Chips */}
            <div className="about-gallery-chips-wrapper">
              {[
                { id: 'all', label: 'All Photos' },
                { id: 'office', label: 'Headquarters' },
                { id: 'conclave', label: 'POSP Network' },
                { id: 'claims', label: 'Claims Desk' },
                { id: 'community', label: 'Community' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="about-filter-chip"
                  style={{
                    background: activeTab === tab.id ? 'var(--primary-navy)' : 'transparent',
                    color: activeTab === tab.id ? '#ffffff' : '#64748b'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Gallery Grid */}
          <div className="about-gallery-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.5rem'
          }}>
            {filteredGallery.map((item) => (
              <div 
                key={item.id}
                onClick={() => setSelectedPhoto(item)}
                style={{
                  background: '#ffffff',
                  borderRadius: '18px',
                  overflow: 'hidden',
                  border: '1px solid var(--border-subtle)',
                  boxShadow: '0 4px 18px rgba(0, 0, 0, 0.04)',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'transform 0.25s, box-shadow 0.25s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 16px 32px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 18px rgba(0, 0, 0, 0.04)';
                }}
              >
                <div className="about-gallery-card-img-box" style={{ position: 'relative', height: '220px', overflow: 'hidden', background: '#091a2f' }}>
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.4s ease'
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    background: 'rgba(15, 23, 42, 0.75)',
                    color: '#ffffff',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    letterSpacing: '0.03em',
                    textTransform: 'uppercase'
                  }}>
                    {item.tag}
                  </div>
                  <div style={{
                    position: 'absolute',
                    bottom: '12px',
                    right: '12px',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.9)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary-navy)'
                  }}>
                    <Camera size={16} />
                  </div>
                </div>

                <div style={{ padding: '1.25rem 1.4rem' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary-navy)', margin: '0 0 6px' }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0, lineHeight: 1.45 }}>
                    {item.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 5. LIGHTBOX MODAL (Zero blur, crisp per AGENTS.md) */}
      {selectedPhoto && (
        <div 
          onClick={() => setSelectedPhoto(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.85)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              maxWidth: '840px',
              width: '100%',
              overflow: 'hidden',
              boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
              position: 'relative'
            }}
          >
            <button
              onClick={() => setSelectedPhoto(null)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'rgba(15, 23, 42, 0.7)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '50%',
                width: '38px',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 10
              }}
              aria-label="Close Preview"
            >
              <X size={20} />
            </button>

            <img 
              src={selectedPhoto.image} 
              alt={selectedPhoto.title}
              style={{ width: '100%', maxHeight: '480px', objectFit: 'cover', display: 'block' }}
            />

            <div style={{ padding: '1.5rem 1.75rem' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--accent-gold)', textTransform: 'uppercase', marginBottom: '4px' }}>
                {selectedPhoto.tag}
              </div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary-navy)', margin: '0 0 6px' }}>
                {selectedPhoto.title}
              </h3>
              <p style={{ fontSize: '0.92rem', color: '#64748b', margin: 0 }}>
                {selectedPhoto.subtitle}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 6. TRUSTED INSURANCE PARTNERS */}
      <section style={{ padding: '4rem 1rem', background: '#ffffff', borderTop: '1px solid var(--border-subtle)' }}>
        <div className="container" style={{ maxWidth: '1180px', margin: '0 auto', textAlign: 'center' }}>
          <span style={{
            color: 'var(--accent-gold)',
            fontSize: '0.82rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Underwritten By The Best
          </span>
          <h2 style={{
            fontSize: '1.8rem',
            fontWeight: 900,
            color: 'var(--primary-navy)',
            margin: '6px 0 2rem'
          }}>
            Our Authorised Insurer Network
          </h2>

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '2rem'
          }}>
            {[
              { img: hdfcLogo, name: 'HDFC ERGO' },
              { img: iciciLogo, name: 'ICICI Lombard' },
              { img: starLogo, name: 'Star Health' },
              { img: careLogo, name: 'Care Health' },
              { img: tataLogo, name: 'TATA AIG' },
              { img: nivaLogo, name: 'Niva Bupa' },
              { img: bajajLogo, name: 'Bajaj Allianz' },
              { img: licLogo, name: 'LIC of India' }
            ].map((p, idx) => (
              <div 
                key={idx}
                style={{
                  background: '#f8fafc',
                  padding: '14px 20px',
                  borderRadius: '14px',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '130px',
                  height: '64px'
                }}
              >
                <img 
                  src={p.img} 
                  alt={p.name} 
                  style={{ maxHeight: '34px', maxWidth: '120px', objectFit: 'contain' }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. PHYSICAL HEADQUARTERS & WALK-IN ASSISTANCE */}
      <section style={{ padding: '4rem 1rem 5rem', background: '#f8fafc' }}>
        <div className="container" style={{ maxWidth: '1180px', margin: '0 auto' }}>
          <div className="about-headquarters-card" style={{
            background: 'linear-gradient(135deg, #091a2f 0%, #0f2b48 100%)',
            borderRadius: '24px',
            color: '#ffffff',
            padding: '3rem 2.5rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2.5rem',
            alignItems: 'center'
          }}>
            <div>
              <span style={{
                color: 'var(--accent-gold)',
                fontSize: '0.82rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}>
                Walk-In Support Desk
              </span>
              <h2 style={{ fontSize: '2rem', fontWeight: 900, margin: '8px 0 16px', color: '#ffffff' }}>
                Visit Our Hyderabad Headquarters
              </h2>
              <p style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                Prefer discussing high-value commercial liability, family floater porting, or POSP certifications face-to-face? Our advisory desks are open Monday to Saturday.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <MapPin size={20} color="var(--accent-gold)" style={{ flexShrink: 0, marginTop: '3px' }} />
                  <div style={{ fontSize: '0.9rem', color: '#e2e8f0', lineHeight: 1.5 }}>
                    <strong>{address1}</strong><br />
                    {address2}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Phone size={18} color="var(--accent-emerald)" style={{ flexShrink: 0 }} />
                  <a href={`tel:${cleanPhone}`} style={{ color: '#ffffff', fontWeight: 700, textDecoration: 'none', fontSize: '0.92rem' }}>
                    {phone}
                  </a>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Mail size={18} color="#38bdf8" style={{ flexShrink: 0 }} />
                  <a href={`mailto:${email}`} style={{ color: '#ffffff', textDecoration: 'none', fontSize: '0.92rem' }}>
                    {email}
                  </a>
                </div>
              </div>

              <a
                href="https://maps.google.com/?q=Mytri+Constructions+ECIL+Hyderabad"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: 'var(--accent-gold)',
                  color: '#ffffff',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 8px 18px rgba(217, 119, 6, 0.3)'
                }}
              >
                Navigate via Google Maps <ExternalLink size={15} />
              </a>
            </div>

            {/* Quick Consultation Request Card */}
            <div className="about-consultation-box" style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '2rem',
              color: 'var(--text-dark)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)'
            }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-navy)', marginBottom: '8px' }}>
                Need Immediate Protection Advice?
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                Speak with our IRDAI-registered advisors for unbiased plan comparisons tailored to your exact budget.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <a
                  href={`tel:${cleanPhone}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '12px',
                    background: 'var(--primary-navy)',
                    color: '#ffffff',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.92rem',
                    textDecoration: 'none'
                  }}
                >
                  <Phone size={16} /> Direct Phone: {phone}
                </a>

                <Link
                  to="/claim-support"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '12px',
                    background: '#f1f5f9',
                    color: 'var(--primary-navy)',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.92rem',
                    textDecoration: 'none',
                    border: '1px solid #cbd5e1'
                  }}
                >
                  <ShieldCheck size={16} color="var(--accent-emerald)" /> Emergency Claim Assistance
                </Link>

                <Link
                  to="/become-posp"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '12px',
                    background: '#fff7ed',
                    color: '#9a3412',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.92rem',
                    textDecoration: 'none',
                    border: '1px solid #fdba74'
                  }}
                >
                  <Users size={16} color="#ea580c" /> Become a POSP Partner
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
