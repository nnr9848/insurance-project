import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import HeroSection from '../components/HeroSection';
import { portalService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useBusinessProfile } from '../context/BusinessProfileContext';
import {
  HeartPulse,
  ShieldCheck,
  Car,
  Bike,
  Users,
  Briefcase,
  Plane,
  Building2,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Zap,
  Lock,
  Headphones,
  Award,
  ChevronRight,
  Flame,
  Clock,
  Shield,
  Percent,
  X,
  FileCheck,
  PhoneCall,
  Search,
  Filter,
  Edit3,
  Plus,
  Trash2,
  Save,
  Check
} from 'lucide-react';

import PartnerLeadModal from '../components/common/PartnerLeadModal';
import CustomerReviewsSection from '../components/common/CustomerReviewsSection';
import { PARTNER_LOGO_MAP, DEFAULT_PARTNERS_FALLBACK } from '../utils/partnerAssetCatalog';

export default function Home() {
  const { isSuperAdmin, isManager } = useAuth();
  const { businessProfile, refreshBusinessProfile } = useBusinessProfile();
  const [activePartnerTab, setActivePartnerTab] = useState('all');
  const [activeComparisonTab, setActiveComparisonTab] = useState('aadhiraksha'); // 'aadhiraksha' | 'traditional'
  const [showAllPartnersMobile, setShowAllPartnersMobile] = useState(false);
  const [selectedPartnerModal, setSelectedPartnerModal] = useState(null);
  const [dbPartners, setDbPartners] = useState([]);

  // Why Choose Us Comparison Inline Edit State
  const [isEditingWhyUs, setIsEditingWhyUs] = useState(false);
  const [savingWhyUs, setSavingWhyUs] = useState(false);
  const [whyUsForm, setWhyUsForm] = useState({
    whyUsBadge: '',
    whyUsTitle: '',
    whyUsSubtitle: '',
    whyUsTraditionalBadge: '',
    whyUsTraditionalTitle: '',
    whyUsTraditionalPoints: [],
    whyUsAadhirakshaBadge: '',
    whyUsAadhirakshaTitle: '',
    whyUsAadhirakshaRibbon: '',
    whyUsAadhirakshaPoints: []
  });

  // Parse points from JSON or fallback
  const getPointsList = (jsonStr, fallback) => {
    try {
      if (!jsonStr) return fallback;
      const parsed = typeof jsonStr === 'string' ? JSON.parse(jsonStr) : jsonStr;
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : fallback;
    } catch {
      return fallback;
    }
  };

  const defaultTraditionalPoints = [
    'Only sells 1 company plans with high commissions',
    'Heavy paper forms and 3-5 days policy delivery',
    'Hard to compare hidden room rent and copay sub-limits',
    'No claim assistance when admitted late at night',
    'Forfeits your NCB bonus if you switch companies'
  ];

  const defaultAadhirakshaPoints = [
    'Instant side-by-side comparison of 30+ top IRDAI insurers',
    '100% digital KYC with policy on WhatsApp in 2 minutes',
    'Zero room rent sub-limits & 100% restoration guarantee',
    'Dedicated on-ground Claims Desk for 30-min cashless pre-auth',
    'Seamless policy porting with accumulated waiting credits preserved'
  ];

  const traditionalPoints = getPointsList(businessProfile?.whyUsTraditionalPointsJson, defaultTraditionalPoints);
  const aadhirakshaPoints = getPointsList(businessProfile?.whyUsAadhirakshaPointsJson, defaultAadhirakshaPoints);

  const openWhyUsEditor = () => {
    setWhyUsForm({
      whyUsBadge: businessProfile?.whyUsBadge || 'Why We Are Better',
      whyUsTitle: businessProfile?.whyUsTitle || 'Traditional Agents vs. Aadhiraksha InsurTech',
      whyUsSubtitle: businessProfile?.whyUsSubtitle || 'Experience complete transparency, real-time comparisons, and zero bias.',
      whyUsTraditionalBadge: businessProfile?.whyUsTraditionalBadge || 'TRADITIONAL AGENT',
      whyUsTraditionalTitle: businessProfile?.whyUsTraditionalTitle || 'Single-Brand Bias & Manual Delays',
      whyUsTraditionalPoints: [...traditionalPoints],
      whyUsAadhirakshaBadge: businessProfile?.whyUsAadhirakshaBadge || 'AADHIRAKSHA INSURTECH',
      whyUsAadhirakshaTitle: businessProfile?.whyUsAadhirakshaTitle || 'Unbiased Choice & Fast-Track Claims',
      whyUsAadhirakshaRibbon: businessProfile?.whyUsAadhirakshaRibbon || 'RECOMMENDED',
      whyUsAadhirakshaPoints: [...aadhirakshaPoints]
    });
    setIsEditingWhyUs(true);
  };

  const saveWhyUsChanges = async (e) => {
    e.preventDefault();
    setSavingWhyUs(true);
    try {
      await portalService.updateBusinessProfile({
        whyUsBadge: whyUsForm.whyUsBadge,
        whyUsTitle: whyUsForm.whyUsTitle,
        whyUsSubtitle: whyUsForm.whyUsSubtitle,
        whyUsTraditionalBadge: whyUsForm.whyUsTraditionalBadge,
        whyUsTraditionalTitle: whyUsForm.whyUsTraditionalTitle,
        whyUsTraditionalPointsJson: JSON.stringify(whyUsForm.whyUsTraditionalPoints.filter(p => p.trim())),
        whyUsAadhirakshaBadge: whyUsForm.whyUsAadhirakshaBadge,
        whyUsAadhirakshaTitle: whyUsForm.whyUsAadhirakshaTitle,
        whyUsAadhirakshaRibbon: whyUsForm.whyUsAadhirakshaRibbon,
        whyUsAadhirakshaPointsJson: JSON.stringify(whyUsForm.whyUsAadhirakshaPoints.filter(p => p.trim()))
      });
      if (refreshBusinessProfile) await refreshBusinessProfile();
      setIsEditingWhyUs(false);
    } catch (err) {
      alert('Failed to save comparison content: ' + (err.response?.data?.message || err.message));
    } finally {
      setSavingWhyUs(false);
    }
  };

  // PolicyBazaar Style Product Categories Grid
  const productTiles = [
    {
      id: 'health',
      name: 'Health Insurance',
      subtext: 'Cashless hospital network',
      discount: 'SAVE UP TO 25%',
      mobileDiscount: '25% OFF',
      discountType: 'green',
      icon: <HeartPulse size={30} color="#059669" />,
      tag: '🔥 Popular',
      bgGradient: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)',
      borderColor: '#a7f3d0',
      directLink: '/insurance/health'
    },
    {
      id: 'term_life',
      name: 'Term Life Insurance',
      subtext: '₹1 Cr cover from ₹410/mo',
      discount: 'UP TO 15% OFF ONLINE',
      mobileDiscount: '15% OFF',
      discountType: 'blue',
      icon: <ShieldCheck size={30} color="#0284c7" />,
      tag: 'Tax Saver 80C',
      bgGradient: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
      borderColor: '#bae6fd',
      directLink: '/insurance/term-life'
    },
    {
      id: 'car',
      name: 'Car Insurance',
      subtext: 'Instant policy in 2 mins',
      discount: 'SAVE UP TO 85%',
      mobileDiscount: '85% OFF',
      discountType: 'green',
      icon: <Car size={30} color="#d97706" />,
      tag: 'Zero Dep Available',
      bgGradient: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
      borderColor: '#fde68a',
      directLink: '/insurance/motor'
    },
    {
      id: 'two_wheeler',
      name: '2 Wheeler Insurance',
      subtext: 'Starting @ ₹457/year',
      discount: 'SAVE UP TO 80%',
      mobileDiscount: '80% OFF',
      discountType: 'green',
      icon: <Bike size={30} color="#7c3aed" />,
      tag: 'Instant NCB Transfer',
      bgGradient: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
      borderColor: '#ddd6fe',
      directLink: '/insurance/motor'
    },
    {
      id: 'family_floater',
      name: 'Family Health Floater',
      subtext: 'Parents + Kids in 1 plan',
      discount: 'ZERO WAITING OPTIONS',
      mobileDiscount: '0 Wait',
      discountType: 'purple',
      icon: <Users size={30} color="#db2777" />,
      tag: 'All-in-One Cover',
      bgGradient: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
      borderColor: '#fbcfe8',
      directLink: '/insurance/health'
    },
    {
      id: 'corporate_sme',
      name: 'Group / SME Insurance',
      subtext: 'For startups & enterprises',
      discount: 'CUSTOM B2B RATES',
      mobileDiscount: 'B2B',
      discountType: 'blue',
      icon: <Briefcase size={30} color="#2563eb" />,
      tag: 'Employee Benefits',
      bgGradient: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
      borderColor: '#bfdbfe',
      directLink: '/insurance/business'
    },
    {
      id: 'travel',
      name: 'Travel Insurance',
      subtext: 'Schengen & USA approved',
      discount: 'COVID & FLIGHT DELAYS',
      mobileDiscount: 'Global',
      discountType: 'gold',
      icon: <Plane size={30} color="#0891b2" />,
      tag: 'Global Assistance',
      bgGradient: 'linear-gradient(135deg, #ecfeff 0%, #cffafe 100%)',
      borderColor: '#a5f3fc',
      directLink: '/insurance/travel'
    },
    {
      id: 'loans',
      name: 'Business & Home Loans',
      subtext: 'Lowest interest rates',
      discount: 'FAST APPROVALS',
      mobileDiscount: 'Fast',
      discountType: 'gold',
      icon: <Building2 size={30} color="#ea580c" />,
      tag: 'Zero Processing',
      bgGradient: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
      borderColor: '#fed7aa',
      directLink: '/loans'
    }
  ];

  // Load partners dynamically from database (with fallback to default seed)
  useEffect(() => {
    let isMounted = true;
    portalService.getPartners()
      .then(data => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setDbPartners(data);
        }
      })
      .catch(err => {
        console.warn('Could not fetch backend partners, using initial catalog:', err);
      });
    return () => { isMounted = false; };
  }, []);

  const activePartnerList = dbPartners.length > 0 ? dbPartners : DEFAULT_PARTNERS_FALLBACK;

  const filteredPartners = activePartnerTab === 'all' 
    ? activePartnerList 
    : activePartnerList.filter(p => p.category === activePartnerTab);

  const getPartnerLogo = (partner) => {
    if (partner.logoUrl) return partner.logoUrl;
    if (partner.logoKey && PARTNER_LOGO_MAP[partner.logoKey]) return PARTNER_LOGO_MAP[partner.logoKey];
    return PARTNER_LOGO_MAP.starHealthLogo;
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', color: '#0f172a' }}>
      
      {/* 1. Hero Slider & Quick Quote Form */}
      <HeroSection />

      {/* 2. PolicyBazaar Visual Product Category Grid */}
      <section className="pb-discovery-section">
        <div className="container">
          
          {/* Hero Discovery Headlines */}
          <div className="pb-discovery-header">
            <div className="pb-discovery-badge">
              <Sparkles size={14} /> 
              <span className="badge-desktop-text">India's Smartest Insurance & Loans Discovery Engine</span>
              <span className="badge-mobile-text">30+ IRDAI Certified Partners</span>
            </div>

            <h1 className="pb-discovery-title">
              <span className="title-desktop-view">
                Compare Top Plans. Save Money. <br className="pb-title-break" />
                <span className="pb-title-gradient">
                  Instant Digital Issuance in 2 Mins.
                </span>
              </span>
              <span className="title-mobile-view">
                Compare Top Plans & Save Money
              </span>
            </h1>

            <p className="pb-discovery-subtitle">
              <span className="sub-desktop-text">
                Select a category below to get instant quotes from 30+ top IRDAI certified insurance companies.
              </span>
              <span className="sub-mobile-text">
                Select a category below for instant digital issuance in 2 mins.
              </span>
            </p>
          </div>

          {/* PolicyBazaar Authentic Product Grid Tiles (4 cols desktop, 3 cols mobile) */}
          <div className="pb-product-grid">
            {productTiles.map((product) => {
              const badgeClass = product.discountType === 'green' ? 'pb-badge-green'
                : product.discountType === 'blue' ? 'pb-badge-blue'
                : product.discountType === 'purple' ? 'pb-badge-purple'
                : 'pb-badge-amber';

              return (
                <Link
                  key={product.id}
                  to={product.directLink}
                  className="pb-product-tile"
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  {/* Centered Icon Container with Anchored Top-Right Micro Badge */}
                  <div className="pb-tile-icon-wrapper">
                    {/* Top-Right Micro Discount Badge (Desktop full text, Mobile micro tag) */}
                    <div className={`pb-tile-badge-ribbon ${badgeClass}`}>
                      <span className="badge-desktop-text">{product.discount}</span>
                      <span className="badge-mobile-text">{product.mobileDiscount || product.discount}</span>
                    </div>

                    <div
                      className="pb-tile-icon-container"
                      style={{
                        background: product.bgGradient,
                        border: `1px solid ${product.borderColor}`
                      }}
                    >
                      {product.icon}
                    </div>
                  </div>

                  {/* Product Title */}
                  <h3 className="pb-tile-title">
                    {product.name}
                  </h3>

                  {/* Subtitle / Starting Price (Desktop only) */}
                  <p className="pb-tile-subtext">
                    {product.subtext}
                  </p>
                </Link>
              );
            })}
          </div>

          {/* Trust Highlights Bar (Compact 2x2 on Mobile, 4-col on Desktop) */}
          <div className="pb-trust-highlights-bar">
            <div className="pb-trust-item">
              <div className="pb-trust-icon-box">
                <Building2 size={22} />
              </div>
              <div className="pb-trust-info">
                <div className="pb-trust-val">10,000+</div>
                <div className="pb-trust-lbl">Network Hospitals</div>
              </div>
            </div>

            <div className="pb-trust-item">
              <div className="pb-trust-icon-box">
                <Award size={22} />
              </div>
              <div className="pb-trust-info">
                <div className="pb-trust-val">98.8%</div>
                <div className="pb-trust-lbl">Claim Settlement</div>
              </div>
            </div>

            <div className="pb-trust-item">
              <div className="pb-trust-icon-box">
                <Clock size={22} />
              </div>
              <div className="pb-trust-info">
                <div className="pb-trust-val">30 Mins</div>
                <div className="pb-trust-lbl">Cashless Pre-Auth</div>
              </div>
            </div>

            <div className="pb-trust-item">
              <div className="pb-trust-icon-box">
                <ShieldCheck size={22} />
              </div>
              <div className="pb-trust-info">
                <div className="pb-trust-val">50,000+</div>
                <div className="pb-trust-lbl">Protected Families</div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 3. Side-by-Side Comparison: Traditional Agent vs. Aadhiraksha InsurTech (Fully Dynamic + In-Context Admin Edit) */}
      <section className="pb-comparison-section" style={{ position: 'relative' }}>
        <div className="container" style={{ position: 'relative' }}>
          
          {/* Admin / Manager In-Context Inline Edit Trigger Button */}
          {(isSuperAdmin || isManager) && (
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginBottom: '1rem'
            }}>
              <button
                onClick={openWhyUsEditor}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#0f2b48',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  padding: '7px 14px',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(15, 43, 72, 0.15)',
                  transition: 'all 0.2s ease'
                }}
                title="Edit Comparison Headings and Comparison Points Directly"
              >
                <Edit3 size={14} color="#f59e0b" /> Edit Comparison Section
              </button>
            </div>
          )}

          <div className="pb-comparison-header">
            <span className="pb-badge-pill">
              {businessProfile?.whyUsBadge || 'Why We Are Better'}
            </span>
            <h2 className="pb-comparison-title">
              {businessProfile?.whyUsTitle || 'Traditional Agents vs. Aadhiraksha InsurTech'}
            </h2>
            <p className="pb-comparison-subtitle">
              {businessProfile?.whyUsSubtitle || 'Experience complete transparency, real-time comparisons, and zero bias.'}
            </p>
          </div>

          {/* Mobile Segmented Toggle (< 768px) */}
          <div className="pb-comparison-mobile-tabs">
            <button
              onClick={() => setActiveComparisonTab('aadhiraksha')}
              className={`pb-comp-tab-btn ${activeComparisonTab === 'aadhiraksha' ? 'active-aadhiraksha' : ''}`}
            >
              <CheckCircle2 size={16} />
              {businessProfile?.whyUsAadhirakshaBadge || 'Aadhiraksha InsurTech'}
            </button>
            <button
              onClick={() => setActiveComparisonTab('traditional')}
              className={`pb-comp-tab-btn ${activeComparisonTab === 'traditional' ? 'active-traditional' : ''}`}
            >
              <span style={{ fontSize: '1rem', lineHeight: '1' }}>✕</span>
              {businessProfile?.whyUsTraditionalBadge || 'Traditional Agent'}
            </button>
          </div>

          <div className="pb-comparison-grid">
            {/* Traditional Agent Card */}
            <div className={`pb-comp-card pb-comp-card-traditional ${activeComparisonTab === 'traditional' ? 'mobile-visible' : 'mobile-hidden'}`}>
              <div className="pb-comp-badge pb-comp-badge-red">
                {businessProfile?.whyUsTraditionalBadge || 'TRADITIONAL AGENT'}
              </div>
              <h3 className="pb-comp-card-title pb-comp-card-title-dark">
                {businessProfile?.whyUsTraditionalTitle || 'Single-Brand Bias & Manual Delays'}
              </h3>
              
              <ul className="pb-comp-list">
                {traditionalPoints.map((item, idx) => (
                  <li key={idx} className="pb-comp-item pb-comp-item-negative">
                    <span className="pb-comp-cross">✕</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Aadhiraksha InsurTech Card */}
            <div className={`pb-comp-card pb-comp-card-aadhiraksha ${activeComparisonTab === 'aadhiraksha' ? 'mobile-visible' : 'mobile-hidden'}`}>
              <div className="pb-comp-top-ribbon">
                {businessProfile?.whyUsAadhirakshaRibbon || 'RECOMMENDED'}
              </div>

              <div className="pb-comp-badge pb-comp-badge-emerald">
                {businessProfile?.whyUsAadhirakshaBadge || 'AADHIRAKSHA INSURTECH'}
              </div>

              <h3 className="pb-comp-card-title pb-comp-card-title-light">
                {businessProfile?.whyUsAadhirakshaTitle || 'Unbiased Choice & Fast-Track Claims'}
              </h3>

              <ul className="pb-comp-list">
                {aadhirakshaPoints.map((item, idx) => (
                  <li key={idx} className="pb-comp-item pb-comp-item-positive">
                    <CheckCircle2 size={18} color="#34d399" className="pb-comp-check" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Live Insurer Partners Showcase with Tabs */}
      <section className="pb-partners-section">
        <div className="container">
          <div className="pb-partners-header-row">
            <div>
              <span className="pb-partners-badge">
                Our Network
              </span>
              <h2 className="pb-partners-title">
                <span className="title-desktop-view">A Wide Range of Insurers & Lenders to Choose From</span>
                <span className="title-mobile-view">30+ Leading Insurance Partners</span>
              </h2>
            </div>

            {/* Filter Tabs (Horizontal scroll on mobile) */}
            <div className="pb-partners-tabs-wrapper">
              <div className="pb-partners-tabs">
                {[
                  { id: 'all', label: 'All Partners' },
                  { id: 'health', label: 'Health' },
                  { id: 'life', label: 'Life & Term' },
                  { id: 'general', label: 'Motor & General' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActivePartnerTab(tab.id);
                      setShowAllPartnersMobile(false);
                    }}
                    className={`pb-partner-tab-btn ${activePartnerTab === tab.id ? 'active' : ''}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Partners Grid */}
          <div className={`pb-partners-grid ${showAllPartnersMobile ? 'mobile-expanded' : 'mobile-clamped'}`}>
            {filteredPartners.map((partner, idx) => {
              const logo = getPartnerLogo(partner);
              const partnerSlug = partner.slug || partner.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
              return (
                <Link
                  key={partner.id || idx}
                  to={`/partners/${partnerSlug}`}
                  className="partner-card-modern"
                  title={`View official plans, brochures & quotes for ${partner.name}`}
                  style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <img
                    src={logo}
                    alt={partner.name}
                    className="partner-logo-img"
                    loading="lazy"
                  />
                </Link>
              );
            })}
          </div>

          {/* Mobile "View All Partners" Toggle Button (< 640px) */}
          {filteredPartners.length > 6 && (
            <div className="pb-partners-mobile-toggle-box">
              <button
                type="button"
                className="pb-partners-show-more-btn"
                onClick={() => setShowAllPartnersMobile(!showAllPartnersMobile)}
              >
                {showAllPartnersMobile ? (
                  <>Show Fewer Partners <ChevronRight size={16} style={{ transform: 'rotate(-90deg)' }} /></>
                ) : (
                  <>View All {filteredPartners.length} Partners <ChevronRight size={16} style={{ transform: 'rotate(90deg)' }} /></>
                )}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Customer Ratings, Reviews & Social Proof Section */}
      <CustomerReviewsSection />

      {/* Partner Lead Capture & Direct Portal Redirection Modal */}
      {selectedPartnerModal && (
        <PartnerLeadModal
          partner={selectedPartnerModal.partner}
          logoSrc={selectedPartnerModal.logo}
          onClose={() => setSelectedPartnerModal(null)}
        />
      )}

      {/* IN-CONTEXT WHY CHOOSE US COMPARISON EDIT MODAL (Rule 10 Compliant) */}
      {isEditingWhyUs && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1200,
          padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '720px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '1.25rem 1.5rem',
              background: '#0f2b48',
              color: '#ffffff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Edit3 size={18} color="#f59e0b" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Edit 'Why Choose Us' Comparison</h3>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>Update comparison headings, badges, and key advantages in real-time</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditingWhyUs(false)}
                style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={saveWhyUsChanges} style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Main Section Headings */}
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.85rem', fontWeight: 800, color: '#0f2b48', textTransform: 'uppercase' }}>Section Header</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>Top Pill Badge</label>
                    <input
                      type="text"
                      value={whyUsForm.whyUsBadge}
                      onChange={(e) => setWhyUsForm({ ...whyUsForm, whyUsBadge: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>Main Title</label>
                    <input
                      type="text"
                      value={whyUsForm.whyUsTitle}
                      onChange={(e) => setWhyUsForm({ ...whyUsForm, whyUsTitle: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                      required
                    />
                  </div>
                </div>
                <div style={{ marginTop: '10px' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>Subtitle</label>
                  <input
                    type="text"
                    value={whyUsForm.whyUsSubtitle}
                    onChange={(e) => setWhyUsForm({ ...whyUsForm, whyUsSubtitle: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                    required
                  />
                </div>
              </div>

              {/* Side-by-Side Editors */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                
                {/* Traditional Agent Column */}
                <div style={{ background: '#fef2f2', padding: '1rem', borderRadius: '12px', border: '1px solid #fecaca' }}>
                  <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.82rem', fontWeight: 800, color: '#991b1b' }}>Traditional Agent Column</h4>
                  
                  <div style={{ marginBottom: '8px' }}>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#7f1d1d', marginBottom: '2px' }}>Badge</label>
                    <input
                      type="text"
                      value={whyUsForm.whyUsTraditionalBadge}
                      onChange={(e) => setWhyUsForm({ ...whyUsForm, whyUsTraditionalBadge: e.target.value })}
                      style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #fca5a5', fontSize: '0.78rem' }}
                    />
                  </div>
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#7f1d1d', marginBottom: '2px' }}>Heading</label>
                    <input
                      type="text"
                      value={whyUsForm.whyUsTraditionalTitle}
                      onChange={(e) => setWhyUsForm({ ...whyUsForm, whyUsTraditionalTitle: e.target.value })}
                      style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #fca5a5', fontSize: '0.78rem' }}
                    />
                  </div>

                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#7f1d1d', marginBottom: '4px' }}>Pain Points / Negative Points</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {whyUsForm.whyUsTraditionalPoints.map((point, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <input
                          type="text"
                          value={point}
                          onChange={(e) => {
                            const updated = [...whyUsForm.whyUsTraditionalPoints];
                            updated[idx] = e.target.value;
                            setWhyUsForm({ ...whyUsForm, whyUsTraditionalPoints: updated });
                          }}
                          style={{ flex: 1, padding: '5px 8px', borderRadius: '6px', border: '1px solid #fca5a5', fontSize: '0.76rem', background: '#ffffff' }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = whyUsForm.whyUsTraditionalPoints.filter((_, i) => i !== idx);
                            setWhyUsForm({ ...whyUsForm, whyUsTraditionalPoints: updated });
                          }}
                          style={{ background: 'transparent', border: 'none', color: '#b91c1c', cursor: 'pointer', padding: '2px' }}
                          title="Remove point"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setWhyUsForm({ ...whyUsForm, whyUsTraditionalPoints: [...whyUsForm.whyUsTraditionalPoints, ''] })}
                      style={{
                        marginTop: '4px',
                        background: '#ffffff',
                        border: '1px dashed #f87171',
                        borderRadius: '6px',
                        padding: '4px 8px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: '#b91c1c',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px'
                      }}
                    >
                      <Plus size={12} /> Add Point
                    </button>
                  </div>
                </div>

                {/* Aadhiraksha InsurTech Column */}
                <div style={{ background: '#ecfdf5', padding: '1rem', borderRadius: '12px', border: '1px solid #a7f3d0' }}>
                  <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.82rem', fontWeight: 800, color: '#065f46' }}>Aadhiraksha InsurTech Column</h4>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '8px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#047857', marginBottom: '2px' }}>Badge</label>
                      <input
                        type="text"
                        value={whyUsForm.whyUsAadhirakshaBadge}
                        onChange={(e) => setWhyUsForm({ ...whyUsForm, whyUsAadhirakshaBadge: e.target.value })}
                        style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #6ee7b7', fontSize: '0.78rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#047857', marginBottom: '2px' }}>Top Ribbon</label>
                      <input
                        type="text"
                        value={whyUsForm.whyUsAadhirakshaRibbon}
                        onChange={(e) => setWhyUsForm({ ...whyUsForm, whyUsAadhirakshaRibbon: e.target.value })}
                        style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #6ee7b7', fontSize: '0.78rem' }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#047857', marginBottom: '2px' }}>Heading</label>
                    <input
                      type="text"
                      value={whyUsForm.whyUsAadhirakshaTitle}
                      onChange={(e) => setWhyUsForm({ ...whyUsForm, whyUsAadhirakshaTitle: e.target.value })}
                      style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #6ee7b7', fontSize: '0.78rem' }}
                    />
                  </div>

                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#047857', marginBottom: '4px' }}>Value Props / Positive Points</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {whyUsForm.whyUsAadhirakshaPoints.map((point, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <input
                          type="text"
                          value={point}
                          onChange={(e) => {
                            const updated = [...whyUsForm.whyUsAadhirakshaPoints];
                            updated[idx] = e.target.value;
                            setWhyUsForm({ ...whyUsForm, whyUsAadhirakshaPoints: updated });
                          }}
                          style={{ flex: 1, padding: '5px 8px', borderRadius: '6px', border: '1px solid #6ee7b7', fontSize: '0.76rem', background: '#ffffff' }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = whyUsForm.whyUsAadhirakshaPoints.filter((_, i) => i !== idx);
                            setWhyUsForm({ ...whyUsForm, whyUsAadhirakshaPoints: updated });
                          }}
                          style={{ background: 'transparent', border: 'none', color: '#047857', cursor: 'pointer', padding: '2px' }}
                          title="Remove point"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setWhyUsForm({ ...whyUsForm, whyUsAadhirakshaPoints: [...whyUsForm.whyUsAadhirakshaPoints, ''] })}
                      style={{
                        marginTop: '4px',
                        background: '#ffffff',
                        border: '1px dashed #34d399',
                        borderRadius: '6px',
                        padding: '4px 8px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: '#059669',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px'
                      }}
                    >
                      <Plus size={12} /> Add Point
                    </button>
                  </div>
                </div>

              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '0.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsEditingWhyUs(false)}
                  style={{
                    background: '#f1f5f9',
                    color: '#475569',
                    border: 'none',
                    padding: '9px 16px',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingWhyUs}
                  style={{
                    background: '#059669',
                    color: '#ffffff',
                    border: 'none',
                    padding: '9px 20px',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Save size={15} />
                  {savingWhyUs ? 'Saving...' : 'Save Comparison Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
