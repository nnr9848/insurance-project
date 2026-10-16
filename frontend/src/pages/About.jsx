import React, { useState, useEffect } from 'react';
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
  ChevronLeft,
  X,
  Camera,
  Layers,
  HelpCircle,
  Folder,
  Images
} from 'lucide-react';
import { useBusinessProfile } from '../context/BusinessProfileContext';

// Slide Images for visual aesthetics
import familyHero from '../assets/slides/family_hero.png';
import healthHero from '../assets/slides/health_hero.jpg';
import businessHero from '../assets/slides/business_hero.jpg';
import vehicleHero from '../assets/slides/vehicle_hero.jpg';
import loansHero from '../assets/slides/loans_hero.jpg';
import businessTravelHero from '../assets/slides/business_travel_hero.jpg';

// Insurer catalog
import { portalService } from '../services/api';
import { PARTNER_LOGO_MAP, DEFAULT_PARTNERS_FALLBACK } from '../utils/partnerAssetCatalog';
import { useAuth } from '../context/AuthContext';
import InContextPageEditorModal, { InContextAdminBar, SectionEditTrigger } from '../components/common/InContextPageEditorModal';

export default function About() {
  const { businessProfile } = useBusinessProfile();
  const { isSuperAdmin, isManager } = useAuth();
  
  // Section-specific editor modals
  const [activeSectionModal, setActiveSectionModal] = useState(null); // 'hero' | 'stats' | 'mission' | 'contact'
  const [activeTab, setActiveTab] = useState('all');
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [partners, setPartners] = useState([]);

  useEffect(() => {
    let isMounted = true;
    portalService.getPartners()
      .then(data => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setPartners(data);
        }
      })
      .catch(err => {
        console.warn('Could not load partners for About page:', err);
      });
    return () => { isMounted = false; };
  }, []);

  const partnerList = partners.length > 0 ? partners : DEFAULT_PARTNERS_FALLBACK;

  const getPartnerLogo = (partner) => {
    if (partner.logoUrl) return partner.logoUrl;
    if (partner.logoKey && PARTNER_LOGO_MAP[partner.logoKey]) return PARTNER_LOGO_MAP[partner.logoKey];
    return PARTNER_LOGO_MAP.starHealthLogo;
  };

  const phone = businessProfile?.primaryPhone || '+91 8367415156';
  const cleanPhone = phone.replace(/\s+/g, '');
  const email = businessProfile?.supportEmail || 'info@aadhirakshainsurance.com';
  const address1 = businessProfile?.officeAddressLine1 || '4th Floor, Mytri Constructions,';
  const address2 = businessProfile?.officeAddressLine2 || 'Opp: ECIL Busstop, ECIL, Hyderabad.';
  const irdaiNo = businessProfile?.irdaiRegistrationNo || 'IRDAI/IMF/TS/2026/00482';

  // Dynamic Gallery items with fallback to curated high-resolution imagery
  const defaultGalleryItems = [
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
    }
  ];

  // Default corporate albums with high-resolution imagery
  const defaultAlbums = [
    {
      id: 'album-hq',
      title: 'Corporate Headquarters & Advisory Suites',
      subtitle: 'ECIL, Hyderabad - 4th Floor Mytri Constructions',
      category: 'office',
      tag: 'Headquarters',
      coverImage: businessHero,
      photos: [
        {
          id: 101,
          title: 'Executive Advisory Suite',
          subtitle: 'Personalized face-to-face consultation desks',
          image: businessHero,
          tag: 'Headquarters'
        },
        {
          id: 102,
          title: 'Policy Onboarding Wing',
          subtitle: 'Digital instant proposal issuance infrastructure',
          image: loansHero,
          tag: 'Headquarters'
        }
      ]
    },
    {
      id: 'album-conclaves',
      title: 'Annual POSP & Advisor Conclaves',
      subtitle: 'Empowering 1,200+ certified regional advisors across Telangana & AP',
      category: 'conclave',
      tag: 'Advisor Network',
      coverImage: familyHero,
      photos: [
        {
          id: 201,
          title: 'Regional Advisor Leadership Summit',
          subtitle: 'Novotel Hitec City Conclave',
          image: familyHero,
          tag: 'Advisor Network'
        }
      ]
    },
    {
      id: 'album-claims',
      title: '24/7 Claim Concierge Desk',
      subtitle: 'Physical claim managers assisting cashless hospital admissions',
      category: 'claims',
      tag: 'Claim Support',
      coverImage: healthHero,
      photos: [
        {
          id: 301,
          title: 'Claim Settlement Concierge in Action',
          subtitle: 'Hospital TPA coordination suite',
          image: healthHero,
          tag: 'Claim Support'
        }
      ]
    },
    {
      id: 'album-awards',
      title: 'Industry Awards & Partner Honours',
      subtitle: 'Top Performance recognition for settlement speed & ethical compliance',
      category: 'awards',
      tag: 'Awards & Honours',
      coverImage: businessTravelHero,
      photos: [
        {
          id: 401,
          title: 'Best Regional InsurTech Marketing Firm',
          subtitle: 'Annual Financial Services Summit Award',
          image: businessTravelHero,
          tag: 'Awards & Honours'
        }
      ]
    },
    {
      id: 'album-community',
      title: 'Family Financial Wellness & Motor Camps',
      subtitle: 'Educating policyholders on porting rights and cashless claims',
      category: 'community',
      tag: 'Community Camp',
      coverImage: vehicleHero,
      photos: [
        {
          id: 501,
          title: 'Secunderabad Road Safety & Zero-Dep Camp',
          subtitle: 'Community outreach initiative',
          image: vehicleHero,
          tag: 'Community Camp'
        }
      ]
    }
  ];

  const normalizeUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('/api/documents/view-file/')) {
      return url.replace('/api/documents/view-file/', '/api/crm/documents/view-file/');
    }
    return url;
  };

  let corporateAlbums = defaultAlbums;
  if (businessProfile?.aboutGalleryPhotosJson) {
    try {
      const parsed = JSON.parse(businessProfile.aboutGalleryPhotosJson);
      if (Array.isArray(parsed) && parsed.length > 0) {
        if (Array.isArray(parsed[0]?.photos)) {
          corporateAlbums = parsed.map(album => ({
            ...album,
            coverImage: normalizeUrl(album.photos?.[0]?.imageUrl || album.coverImage || businessHero),
            photos: (album.photos || []).map(p => ({
              ...p,
              image: normalizeUrl(p.imageUrl || p.image || businessHero)
            }))
          }));
        } else {
          // If legacy flat format, wrap into the default album categories
          corporateAlbums = defaultAlbums.map(alb => {
            const matchedPhotos = parsed.filter(p => p.category === alb.category);
            return {
              ...alb,
              photos: matchedPhotos.length > 0 ? matchedPhotos.map(p => ({ ...p, image: p.imageUrl || p.image || alb.coverImage })) : alb.photos
            };
          });
        }
      }
    } catch (e) {
      corporateAlbums = defaultAlbums;
    }
  }

  // Direct 1-click Lightbox: tracks the active album and the photo within that album
  const [activeAlbumLightbox, setActiveAlbumLightbox] = useState(null);
  const [lightboxPhotoIndex, setLightboxPhotoIndex] = useState(0);

  const heroHeadline = businessProfile?.aboutHeroTitle || 'India’s Most Dependable Bridge Between Families, Protection & Financial Freedom';
  const heroDescription = businessProfile?.aboutHeroDescription || 'At Aadhiraksha Insurance Marketing & Financial Services Pvt Ltd, we believe every Indian family deserves unbiased, transparent, and prompt insurance advisory with zero hidden catches. Rooted in Hyderabad with a pan-regional network of over 1,200 certified advisors, we don\'t just sell policies — we stand beside you during claim settlements.';

  return (
    <div className="about-page-wrapper" style={{ background: '#f8fafc', color: 'var(--text-dark)', minHeight: '100vh' }}>
      

      {/* 1. Modal: Hero Section */}
      <InContextPageEditorModal
        isOpen={activeSectionModal === 'hero'}
        onClose={() => setActiveSectionModal(null)}
        pageTitle="Hero Banner & Executive Story"
        pageRoute="/about (Hero Fold)"
        fields={[
          {
            name: 'aboutHeroTitle',
            label: 'Hero Main Headline',
            defaultValue: 'India’s Most Dependable Bridge Between Families, Protection & Financial Freedom',
            placeholder: 'e.g. India’s Most Dependable Bridge Between Families, Protection & Financial Freedom',
            helpText: 'Primary large headline displayed in the hero banner.'
          },
          {
            name: 'aboutHeroDescription',
            label: 'Executive Story & Ethos',
            type: 'textarea',
            rows: 4,
            defaultValue: "At Aadhiraksha Insurance Marketing & Financial Services Pvt Ltd, we believe every Indian family deserves unbiased, transparent, and prompt insurance advisory with zero hidden catches. Rooted in Hyderabad with a pan-regional network of over 1,200 certified advisors, we don't just sell policies — we stand beside you during claim settlements.",
            placeholder: 'Company founding story, consumer-first philosophy, and advisory network...'
          }
        ]}
      />

      {/* 2. Modal: Impact Statistics */}
      <InContextPageEditorModal
        isOpen={activeSectionModal === 'stats'}
        onClose={() => setActiveSectionModal(null)}
        pageTitle="Live Impact Metrics"
        pageRoute="/about (Impact Bar)"
        fields={[
          {
            name: 'claimsSettledAmount',
            label: 'Claims Settled Amount',
            defaultValue: '₹50+ Cr',
            placeholder: 'e.g. ₹50+ Cr'
          },
          {
            name: 'familiesProtectedCount',
            label: 'Families Protected',
            defaultValue: '25,000+',
            placeholder: 'e.g. 25,000+'
          },
          {
            name: 'certifiedAdvisorsCount',
            label: 'Certified POSP Advisors Count',
            defaultValue: '1,200+',
            placeholder: 'e.g. 1,200+'
          },
          {
            name: 'settlementRatio',
            label: 'Settlement Ratio',
            defaultValue: '98.8%',
            placeholder: 'e.g. 98.8%'
          }
        ]}
      />

      {/* 3. Modal: Mission & Vision */}
      <InContextPageEditorModal
        isOpen={activeSectionModal === 'mission'}
        onClose={() => setActiveSectionModal(null)}
        pageTitle="Mission & Vision Statements"
        pageRoute="/about (Mission & Vision)"
        fields={[
          {
            name: 'aboutMissionStatement',
            label: 'Mission Statement',
            type: 'textarea',
            rows: 3,
            defaultValue: 'To democratize transparent insurance advisory across India, ensuring zero out-of-pocket surprise rejections and 100% cashless hospitalization concierge.',
            placeholder: 'Our core purpose...'
          },
          {
            name: 'aboutVisionStatement',
            label: 'Vision Statement',
            type: 'textarea',
            rows: 3,
            defaultValue: "To become the nation's most trusted insurance marketing firm, empowering families and businesses through ethical advisory and swift claim resolution.",
            placeholder: 'Where we aspire to lead...'
          }
        ]}
      />

      {/* 4. Modal: Headquarters & Contacts */}
      <InContextPageEditorModal
        isOpen={activeSectionModal === 'contact'}
        onClose={() => setActiveSectionModal(null)}
        pageTitle="Headquarters & Contact Details"
        pageRoute="/about (Walk-in Desk)"
        fields={[
          {
            name: 'officeAddressLine1',
            label: 'Office Suite & Building',
            defaultValue: '4th Floor, Mytri Constructions,',
            placeholder: 'e.g. 4th Floor, Mytri Constructions,'
          },
          {
            name: 'officeAddressLine2',
            label: 'Street, City & Pincode',
            defaultValue: 'Opp: ECIL Busstop, ECIL, Hyderabad.',
            placeholder: 'e.g. Opp: ECIL Busstop, ECIL, Hyderabad.'
          },
          {
            name: 'primaryPhone',
            label: 'Main Support Helpline',
            defaultValue: '+91 8367415156',
            placeholder: 'e.g. +91 8367415156'
          },
          {
            name: 'supportEmail',
            label: 'Primary Inquiries Email',
            type: 'email',
            defaultValue: 'info@aadhirakshainsurance.com',
            placeholder: 'e.g. info@aadhirakshainsurance.com'
          }
        ]}
      />

      {/* 1. HERO BANNER */}
      <section className="about-hero-section" style={{ position: 'relative' }}>
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
          
          {/* Section Edit Trigger: Hero Banner */}
          {(isSuperAdmin || isManager) && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.75rem' }}>
              <SectionEditTrigger
                label="Edit"
                tooltip="Edit Hero Banner & Story"
                onClick={() => setActiveSectionModal('hero')}
              />
            </div>
          )}

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
            {heroHeadline}
          </h1>

          <p className="about-hero-desc" style={{
            fontSize: '1.02rem',
            lineHeight: 1.6,
            color: '#cbd5e1',
            maxWidth: '780px',
            margin: '0 0 1.75rem'
          }}>
            {heroDescription}
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
      <section className="about-metrics-bar" style={{ position: 'relative' }}>
        <div className="container" style={{ maxWidth: '1180px', margin: '0 auto', padding: '0 1rem', position: 'relative' }}>
          
          {/* Section Edit Trigger: Impact Metrics */}
          {(isSuperAdmin || isManager) && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
              <SectionEditTrigger
                label="Edit"
                tooltip="Edit Live Impact Stats"
                onClick={() => setActiveSectionModal('stats')}
              />
            </div>
          )}

          <div className="about-metrics-card">
            <div className="about-metric-cell">
              <div className="about-metric-val" style={{ color: 'var(--primary-navy)' }}>
                {businessProfile?.claimsSettledAmount || '₹50+ Cr'}
              </div>
              <div className="about-metric-lbl">
                Claims Settled Seamlessly
              </div>
            </div>

            <div className="about-metric-cell">
              <div className="about-metric-val" style={{ color: 'var(--accent-emerald)' }}>
                {businessProfile?.familiesProtectedCount || '25,000+'}
              </div>
              <div className="about-metric-lbl">
                Families Protected
              </div>
            </div>

            <div className="about-metric-cell">
              <div className="about-metric-val" style={{ color: 'var(--accent-gold)' }}>
                {businessProfile?.certifiedAdvisorsCount || '1,200+'}
              </div>
              <div className="about-metric-lbl">
                Certified Advisors
              </div>
            </div>

            <div className="about-metric-cell">
              <div className="about-metric-val" style={{ color: '#0284c7' }}>
                {businessProfile?.settlementRatio || '98.8%'}
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
          
          <div className="about-gallery-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem' }}>
            <div>
              <span style={{
                color: 'var(--accent-gold)',
                fontSize: '0.82rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <Folder size={14} /> Official Media Collections
              </span>
              <h2 style={{
                fontSize: '2rem',
                fontWeight: 900,
                color: 'var(--primary-navy)',
                margin: '6px 0 0'
              }}>
                Corporate Albums & Outreach
              </h2>
            </div>

            {/* Section Edit Trigger: Corporate Albums */}
            {(isSuperAdmin || isManager) && (
              <div>
                <SectionEditTrigger
                  label="Manage Albums & Photos ↗"
                  onClick={() => {
                    window.open('/admin?tab=gallery', '_blank', 'noopener,noreferrer');
                  }}
                />
              </div>
            )}
          </div>

          {/* ALBUM CARDS GRID (Direct 1-click Lightbox: clicking opens the album's photos directly in modal) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.5rem'
          }}>
            {corporateAlbums.map((album) => {
              const photoCount = album.photos?.length || 0;
              return (
                <div
                  key={album.id}
                  onClick={() => {
                    setActiveAlbumLightbox(album);
                    setLightboxPhotoIndex(0);
                  }}
                  style={{
                    background: '#ffffff',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    border: '1px solid var(--border-subtle)',
                    boxShadow: '0 4px 18px rgba(0, 0, 0, 0.04)',
                    cursor: 'pointer',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.25s, box-shadow 0.25s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 18px 36px rgba(0, 0, 0, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 18px rgba(0, 0, 0, 0.04)';
                  }}
                >
                  {/* Album Cover with Stacking Badge */}
                  <div style={{ position: 'relative', height: '220px', overflow: 'hidden', background: '#091a2f' }}>
                    <img
                      src={album.coverImage}
                      alt={album.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.4s ease'
                      }}
                    />
                    
                    {/* Photo Count Stack Badge */}
                    <div style={{
                      position: 'absolute',
                      bottom: '14px',
                      right: '14px',
                      background: 'rgba(15, 23, 42, 0.85)',
                      color: '#ffffff',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
                    }}>
                      <Images size={14} color="#fbbf24" />
                      <span>{photoCount} Photo{photoCount !== 1 ? 's' : ''}</span>
                    </div>
                  </div>

                  {/* Album Info */}
                  <div style={{ padding: '1.4rem 1.6rem', display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-navy)', margin: '0 0 6px', lineHeight: 1.35 }}>
                        {album.title}
                      </h3>
                      {album.subtitle && (
                        <p style={{ fontSize: '0.84rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                          {album.subtitle}
                        </p>
                      )}
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: 'var(--accent-gold)',
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      marginTop: '12px'
                    }}>
                      <span>View Album ({photoCount} Photo{photoCount !== 1 ? 's' : ''})</span>
                      <ChevronRight size={15} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 5. DIRECT 1-CLICK LIGHTBOX MODAL (Zero blur, crisp dark contrast per AGENTS.md Rule 10) */}
      {activeAlbumLightbox && (() => {
        const photos = activeAlbumLightbox.photos || [];
        const safeIndex = Math.min(Math.max(lightboxPhotoIndex, 0), Math.max(photos.length - 1, 0));
        const currentPhoto = photos[safeIndex] || {
          image: activeAlbumLightbox.coverImage,
          title: activeAlbumLightbox.title,
          subtitle: activeAlbumLightbox.subtitle,
          tag: activeAlbumLightbox.tag
        };
        const hasPrev = safeIndex > 0;
        const hasNext = safeIndex < photos.length - 1;

        const handlePrev = (e) => {
          e?.stopPropagation();
          if (hasPrev) {
            setLightboxPhotoIndex(safeIndex - 1);
          }
        };

        const handleNext = (e) => {
          e?.stopPropagation();
          if (hasNext) {
            setLightboxPhotoIndex(safeIndex + 1);
          }
        };

        return (
          <div 
            onClick={() => setActiveAlbumLightbox(null)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(15, 23, 42, 0.88)',
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
                maxWidth: '860px',
                width: '100%',
                overflow: 'hidden',
                boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveAlbumLightbox(null)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'rgba(15, 23, 42, 0.75)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '50%',
                  width: '38px',
                  height: '38px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 10,
                  transition: 'background 0.2s'
                }}
                aria-label="Close Preview"
              >
                <X size={20} />
              </button>

              {/* Prev / Next Floating Navigation */}
              {hasPrev && (
                <button
                  onClick={handlePrev}
                  style={{
                    position: 'absolute',
                    top: '40%',
                    left: '16px',
                    transform: 'translateY(-50%)',
                    background: 'rgba(15, 23, 42, 0.75)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '50%',
                    width: '42px',
                    height: '42px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 10,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    transition: 'transform 0.15s, background 0.15s'
                  }}
                  aria-label="Previous Photo"
                >
                  <ChevronLeft size={24} />
                </button>
              )}

              {hasNext && (
                <button
                  onClick={handleNext}
                  style={{
                    position: 'absolute',
                    top: '40%',
                    right: '16px',
                    transform: 'translateY(-50%)',
                    background: 'rgba(15, 23, 42, 0.75)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '50%',
                    width: '42px',
                    height: '42px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 10,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    transition: 'transform 0.15s, background 0.15s'
                  }}
                  aria-label="Next Photo"
                >
                  <ChevronRight size={24} />
                </button>
              )}

              {/* Image Box */}
              <div style={{ position: 'relative', width: '100%', height: '420px', minHeight: '380px', background: '#091a2f', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <img 
                  src={currentPhoto.image || currentPhoto.imageUrl} 
                  alt={currentPhoto.title}
                  style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                  onError={(e) => {
                    e.currentTarget.src = businessHero;
                  }}
                />
                
                {/* Counter Pill With Album Context */}
                <div style={{
                  position: 'absolute',
                  bottom: '12px',
                  left: '16px',
                  background: 'rgba(15, 23, 42, 0.85)',
                  color: '#ffffff',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <span style={{ color: '#fbbf24' }}>{activeAlbumLightbox.title}</span>
                  <span style={{ color: '#94a3b8' }}>•</span>
                  <span>{safeIndex + 1} of {Math.max(photos.length, 1)}</span>
                </div>
              </div>

              {/* Caption & Metadata */}
              <div style={{ padding: '1.25rem 1.75rem', background: '#ffffff', borderTop: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {activeAlbumLightbox.title}
                  </span>
                  <span style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 600 }}>
                    {photos.length > 1 ? `Photo ${safeIndex + 1} of ${photos.length}` : '1 of 1'}
                  </span>
                </div>
                {currentPhoto.title && (
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-navy)', margin: '0 0 4px' }}>
                    {currentPhoto.title}
                  </h3>
                )}
                {(currentPhoto.subtitle || activeAlbumLightbox.subtitle) && (
                  <p style={{ fontSize: '0.88rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                    {currentPhoto.subtitle || activeAlbumLightbox.subtitle}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })()}

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
            gap: '1.5rem'
          }}>
            {partnerList.map((p) => {
              const logoSrc = getPartnerLogo(p);
              return (
                <Link
                  key={p.id}
                  to={`/partners/${p.slug || p.id}`}
                  title={`${p.name} — View details & plans`}
                  style={{
                    background: '#f8fafc',
                    padding: '12px 20px',
                    borderRadius: '14px',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '140px',
                    height: '68px',
                    textDecoration: 'none',
                    transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.borderColor = '#cbd5e1';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.06)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <img 
                    src={logoSrc} 
                    alt={p.name} 
                    style={{ maxHeight: '38px', maxWidth: '125px', objectFit: 'contain' }}
                  />
                </Link>
              );
            })}
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
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{
                  color: 'var(--accent-gold)',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}>
                  Walk-In Support Desk
                </span>

                {/* Section Edit Trigger: Headquarters & Walk-In Desk */}
                {(isSuperAdmin || isManager) && (
                  <SectionEditTrigger
                    label="Edit"
                    tooltip="Edit Headquarters Address & Helpline"
                    onClick={() => setActiveSectionModal('contact')}
                  />
                )}
              </div>

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
                href={businessProfile?.googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(`${address1} ${address2}`)}`}
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
