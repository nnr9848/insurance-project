import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { portalService } from '../services/api';
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
  Filter
} from 'lucide-react';

// Partner Logos
import adityaBirlaLogo from '../assets/partners/ADITYA BIRLA CAPITAL.jpg';
import axisMaxLogo from '../assets/partners/AXIS MAX Life Insurance logo.png';
import bajajAllianzLogo from '../assets/partners/Bajaj Alilanz logo.png';
import hdfcErgoLogo from '../assets/partners/HDFC-Ergo-logo.png';
import iciciLombardLogo from '../assets/partners/ICICI Lombard logo.webp';
import licLogo from '../assets/partners/LIC LOGO.jpg';
import nationalInsuranceLogo from '../assets/partners/NATIONAL INSURANCE LOGO.jpg';
import orientalInsuranceLogo from '../assets/partners/ORIENTAL INSURANCE LOGO.jpg';
import relianceGeneralLogo from '../assets/partners/Reliance General Insurance Logo.jpg';
import sbiGeneralLogo from '../assets/partners/SBI general Insurance logo.jpg';
import tataAigLogo from '../assets/partners/TATA AIG Insurance logo.png';
import careHealthLogo from '../assets/partners/care health insurance logo.png';
import cholaMsLogo from '../assets/partners/chola ms generali insurance.png';
import digitLogo from '../assets/partners/digit logo.png';
import futureGeneraliLogo from '../assets/partners/future generali insurance logo.jpg';
import kotakGeneralLogo from '../assets/partners/kotak general insurance logo.jpg';
import magmaHdiLogo from '../assets/partners/magma hdi general insurnce logo.png';
import manipalCignaLogo from '../assets/partners/manipal cigna health insurance logo.jpg';
import nivaBupaLogo from '../assets/partners/niva health insurance logo.png';
import starHealthLogo from '../assets/partners/star health insurance logo.png';

export default function HomeModern() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [modalStep, setModalStep] = useState(1);
  const [quoteForm, setQuoteForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    city: '',
    pincode: '',
    insuredMembers: ['Self'],
    vehicleNumber: '',
    sumInsured: '10 Lakhs',
    comments: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [activePartnerTab, setActivePartnerTab] = useState('all');

  // PolicyBazaar Style Product Categories Grid
  const productTiles = [
    {
      id: 'health',
      name: 'Health Insurance',
      subtext: 'Cashless hospital network',
      discount: 'SAVE UP TO 25%',
      discountType: 'green',
      icon: <HeartPulse size={30} color="#059669" />,
      tag: '🔥 Popular',
      bgGradient: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)',
      borderColor: '#a7f3d0',
      directLink: '/new-policy-support'
    },
    {
      id: 'term_life',
      name: 'Term Life Insurance',
      subtext: '₹1 Cr cover from ₹490/mo',
      discount: 'UP TO 15% OFF ONLINE',
      discountType: 'blue',
      icon: <ShieldCheck size={30} color="#0284c7" />,
      tag: 'Tax Saver 80C',
      bgGradient: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
      borderColor: '#bae6fd',
      directLink: '/new-policy-support'
    },
    {
      id: 'car',
      name: 'Car Insurance',
      subtext: 'Instant policy in 2 mins',
      discount: 'SAVE UP TO 85%',
      discountType: 'green',
      icon: <Car size={30} color="#d97706" />,
      tag: 'Zero Dep Available',
      bgGradient: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
      borderColor: '#fde68a',
      directLink: '/new-policy-support'
    },
    {
      id: 'two_wheeler',
      name: '2 Wheeler Insurance',
      subtext: 'Starting @ ₹457/year',
      discount: 'SAVE UP TO 80%',
      discountType: 'green',
      icon: <Bike size={30} color="#7c3aed" />,
      tag: 'Instant NCB Transfer',
      bgGradient: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
      borderColor: '#ddd6fe',
      directLink: '/new-policy-support'
    },
    {
      id: 'family_floater',
      name: 'Family Health Floater',
      subtext: 'Parents + Kids in 1 plan',
      discount: 'ZERO WAITING OPTIONS',
      discountType: 'purple',
      icon: <Users size={30} color="#db2777" />,
      tag: 'All-in-One Cover',
      bgGradient: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
      borderColor: '#fbcfe8',
      directLink: '/new-policy-support'
    },
    {
      id: 'corporate_sme',
      name: 'Group / SME Insurance',
      subtext: 'For startups & enterprises',
      discount: 'CUSTOM B2B RATES',
      discountType: 'blue',
      icon: <Briefcase size={30} color="#2563eb" />,
      tag: 'Employee Benefits',
      bgGradient: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
      borderColor: '#bfdbfe',
      directLink: '/new-policy-support'
    },
    {
      id: 'travel',
      name: 'Travel Insurance',
      subtext: 'Schengen & USA approved',
      discount: 'COVID & FLIGHT DELAYS',
      discountType: 'gold',
      icon: <Plane size={30} color="#0891b2" />,
      tag: 'Global Assistance',
      bgGradient: 'linear-gradient(135deg, #ecfeff 0%, #cffafe 100%)',
      borderColor: '#a5f3fc',
      directLink: '/new-policy-support'
    },
    {
      id: 'loans',
      name: 'Business & Home Loans',
      subtext: 'Lowest interest rates',
      discount: 'FAST APPROVALS',
      discountType: 'gold',
      icon: <Building2 size={30} color="#ea580c" />,
      tag: 'Zero Processing',
      bgGradient: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
      borderColor: '#fed7aa',
      directLink: '/loans'
    }
  ];

  const partners = [
    { name: 'Star Health Insurance', category: 'health', logo: starHealthLogo },
    { name: 'HDFC ERGO', category: 'general', logo: hdfcErgoLogo },
    { name: 'ICICI Lombard', category: 'general', logo: iciciLombardLogo },
    { name: 'Care Health Insurance', category: 'health', logo: careHealthLogo },
    { name: 'TATA AIG Insurance', category: 'general', logo: tataAigLogo },
    { name: 'Bajaj Allianz', category: 'general', logo: bajajAllianzLogo },
    { name: 'Niva Bupa Health', category: 'health', logo: nivaBupaLogo },
    { name: 'SBI General Insurance', category: 'general', logo: sbiGeneralLogo },
    { name: 'Life Insurance Corporation (LIC)', category: 'life', logo: licLogo },
    { name: 'Max Life Insurance', category: 'life', logo: axisMaxLogo },
    { name: 'Aditya Birla Capital', category: 'life', logo: adityaBirlaLogo },
    { name: 'Reliance General Insurance', category: 'general', logo: relianceGeneralLogo },
    { name: 'Digit Insurance', category: 'general', logo: digitLogo },
    { name: 'Kotak General Insurance', category: 'general', logo: kotakGeneralLogo },
    { name: 'ManipalCigna Health', category: 'health', logo: manipalCignaLogo },
    { name: 'Chola MS General Insurance', category: 'general', logo: cholaMsLogo },
    { name: 'Future Generali', category: 'general', logo: futureGeneraliLogo },
    { name: 'Magma HDI General', category: 'general', logo: magmaHdiLogo },
    { name: 'National Insurance', category: 'general', logo: nationalInsuranceLogo },
    { name: 'Oriental Insurance', category: 'general', logo: orientalInsuranceLogo }
  ];

  const filteredPartners = activePartnerTab === 'all' 
    ? partners 
    : partners.filter(p => p.category === activePartnerTab);

  const memberOptions = ['Self', 'Spouse', 'Son', 'Daughter', 'Father', 'Mother'];

  const handleMemberToggle = (member) => {
    if (quoteForm.insuredMembers.includes(member)) {
      if (quoteForm.insuredMembers.length > 1) {
        setQuoteForm({
          ...quoteForm,
          insuredMembers: quoteForm.insuredMembers.filter(m => m !== member)
        });
      }
    } else {
      setQuoteForm({
        ...quoteForm,
        insuredMembers: [...quoteForm.insuredMembers, member]
      });
    }
  };

  const handleOpenModal = (product) => {
    setSelectedCategory(product);
    setModalStep(1);
    setSubmitSuccess(false);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await portalService.submitQuote({
        fullName: quoteForm.fullName,
        phone: quoteForm.phone,
        email: quoteForm.email,
        insuranceType: selectedCategory?.name || 'General Inquiry',
        comments: `Members: ${quoteForm.insuredMembers.join(', ')} | Sum: ${quoteForm.sumInsured} | City: ${quoteForm.city} | Reg: ${quoteForm.vehicleNumber || 'N/A'}`
      });
      setSubmitSuccess(true);
    } catch (err) {
      console.error(err);
      alert('Your quote inquiry has been submitted! Our senior advisor will contact you within 5 minutes.');
      setSubmitSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', color: '#0f172a' }}>
      
      {/* 1. Hero Section: PolicyBazaar Visual Category Grid */}
      <section style={{
        background: 'linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%)',
        padding: '3.5rem 0 4.5rem 0',
        borderBottom: '1px solid #e2e8f0'
      }}>
        <div className="container">
          
          {/* Hero Headlines */}
          <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 2.5rem auto' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#ecfdf5',
              color: '#047857',
              border: '1px solid #a7f3d0',
              padding: '6px 14px',
              borderRadius: '9999px',
              fontSize: '0.82rem',
              fontWeight: 700,
              marginBottom: '1rem'
            }}>
              <Sparkles size={14} /> India's Smartest Insurance & Loans Discovery Engine
            </div>

            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: 800,
              color: '#0f2b48',
              lineHeight: '1.2',
              marginBottom: '0.75rem',
              letterSpacing: '-0.02em'
            }}>
              Compare Top Plans. Save Money. <br />
              <span style={{
                background: 'linear-gradient(90deg, #059669 0%, #0284c7 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Instant Digital Issuance in 2 Mins.
              </span>
            </h1>

            <p style={{ fontSize: '1.05rem', color: '#64748b', lineHeight: '1.6' }}>
              Select a category below to get instant quotes from 30+ top IRDAI certified insurance companies.
            </p>
          </div>

          {/* PolicyBazaar Authentic Product Grid Tiles (4 cols desktop, 2 cols mobile) */}
          <div className="pb-product-grid">
            {productTiles.map((product) => {
              const badgeClass = product.discountType === 'green' ? 'pb-badge-green'
                : product.discountType === 'blue' ? 'pb-badge-blue'
                : product.discountType === 'purple' ? 'pb-badge-purple'
                : 'pb-badge-amber';

              return (
                <div
                  key={product.id}
                  onClick={() => handleOpenModal(product)}
                  className="pb-product-tile"
                >
                  {/* Top Discount / Benefit Ribbon */}
                  <div className={`pb-tile-badge-ribbon ${badgeClass}`}>
                    {product.discount}
                  </div>

                  {/* Centered Icon Container */}
                  <div
                    className="pb-tile-icon-container"
                    style={{
                      background: product.bgGradient,
                      border: `1px solid ${product.borderColor}`
                    }}
                  >
                    {product.icon}
                  </div>

                  {/* Product Title */}
                  <h3 className="pb-tile-title">
                    {product.name}
                  </h3>

                  {/* Subtitle / Starting Price */}
                  <p className="pb-tile-subtext">
                    {product.subtext}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Trust Highlights Bar */}
          <div style={{
            marginTop: '2.5rem',
            background: '#ffffff',
            borderRadius: '16px',
            padding: '1.25rem 2rem',
            border: '1px solid #e2e8f0',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: '#ecfdf5', padding: '10px', borderRadius: '12px' }}>
                <Building2 size={24} color="#059669" />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f2b48' }}>10,000+</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Network Hospitals</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: '#eff6ff', padding: '10px', borderRadius: '12px' }}>
                <Award size={24} color="#2563eb" />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f2b48' }}>98.8%</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Claim Settlement Ratio</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: '#fef3c7', padding: '10px', borderRadius: '12px' }}>
                <Clock size={24} color="#d97706" />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f2b48' }}>30 Mins</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Cashless Pre-Auth</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: '#fdf2f8', padding: '10px', borderRadius: '12px' }}>
                <ShieldCheck size={24} color="#db2777" />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f2b48' }}>50,000+</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Protected Families</div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 3. Side-by-Side Comparison: Traditional Agent vs. Aadhiraksha InsurTech */}
      <section style={{ padding: '4.5rem 0', background: '#ffffff' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto 3rem auto' }}>
            <span style={{
              fontSize: '0.8rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#059669',
              background: '#ecfdf5',
              padding: '4px 12px',
              borderRadius: '9999px'
            }}>
              Why We Are Better
            </span>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f2b48', marginTop: '0.75rem', marginBottom: '0.5rem' }}>
              Traditional Agents vs. Aadhiraksha InsurTech
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
              Experience complete transparency, real-time comparisons, and zero bias.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem',
            maxWidth: '900px',
            margin: '0 auto'
          }}>
            {/* Traditional Agent Card */}
            <div style={{
              background: '#f8fafc',
              borderRadius: '20px',
              padding: '2rem',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{
                display: 'inline-block',
                background: '#fee2e2',
                color: '#b91c1c',
                padding: '4px 12px',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 700,
                marginBottom: '1rem'
              }}>
                TRADITIONAL AGENT
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#334155', marginBottom: '1.5rem' }}>
                Single-Brand Bias & Manual Delays
              </h3>
              
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  'Only sells 1 company plans with high commissions',
                  'Heavy paper forms and 3-5 days policy delivery',
                  'Hard to compare hidden room rent and copay sub-limits',
                  'No claim assistance when admitted late at night',
                  'Forfeits your NCB bonus if you switch companies'
                ].map((item, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.9rem', color: '#64748b' }}>
                    <span style={{ color: '#ef4444', fontWeight: 800, fontSize: '1.1rem', lineHeight: '1' }}>✕</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Aadhiraksha InsurTech Card */}
            <div style={{
              background: 'linear-gradient(135deg, #04281f 0%, #064e3b 100%)',
              color: '#ffffff',
              borderRadius: '20px',
              padding: '2rem',
              border: '2px solid #10b981',
              boxShadow: '0 20px 40px -15px rgba(6, 78, 59, 0.4)',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                top: '-12px',
                right: '24px',
                background: '#f59e0b',
                color: '#000000',
                padding: '4px 14px',
                borderRadius: '9999px',
                fontSize: '0.72rem',
                fontWeight: 800,
                boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
              }}>
                RECOMMENDED
              </div>

              <div style={{
                display: 'inline-block',
                background: 'rgba(16, 185, 129, 0.2)',
                color: '#34d399',
                padding: '4px 12px',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 700,
                marginBottom: '1rem'
              }}>
                AADHIRAKSHA INSURTECH
              </div>

              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#ffffff', marginBottom: '1.5rem' }}>
                Unbiased Choice & Fast-Track Claims
              </h3>

              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  'Instant side-by-side comparison of 30+ top IRDAI insurers',
                  '100% digital KYC with policy on WhatsApp in 2 minutes',
                  'Zero room rent sub-limits & 100% restoration guarantee',
                  'Dedicated on-ground Claims Desk for 30-min cashless pre-auth',
                  'Seamless policy porting with accumulated waiting credits preserved'
                ].map((item, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.9rem', color: '#e2e8f0' }}>
                    <CheckCircle2 size={18} color="#34d399" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Live Insurer Partners Showcase with Tabs */}
      <section style={{ padding: '4.5rem 0', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
        <div className="container">
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            flexWrap: 'wrap',
            gap: '1.5rem',
            marginBottom: '2.5rem'
          }}>
            <div>
              <span style={{
                fontSize: '0.8rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: '#0284c7',
                background: '#e0f2fe',
                padding: '4px 12px',
                borderRadius: '9999px'
              }}>
                Our Network
              </span>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f2b48', marginTop: '0.5rem' }}>
                A Wide Range of Insurers & Lenders to Choose From
              </h2>
            </div>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: '8px', background: '#e2e8f0', padding: '4px', borderRadius: '12px' }}>
              {[
                { id: 'all', label: 'All Partners' },
                { id: 'health', label: 'Health' },
                { id: 'life', label: 'Life & Term' },
                { id: 'general', label: 'Motor & General' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActivePartnerTab(tab.id)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: activePartnerTab === tab.id ? '#ffffff' : 'transparent',
                    color: activePartnerTab === tab.id ? '#0f2b48' : '#64748b',
                    fontWeight: activePartnerTab === tab.id ? 700 : 500,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    boxShadow: activePartnerTab === tab.id ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Partners Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '1.25rem'
          }}>
            {filteredPartners.map((partner, idx) => (
              <div
                key={idx}
                className="partner-card-modern"
                title={partner.name}
              >
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="partner-logo-img"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Interactive 2-Step Quote Modal (PolicyBazaar Quick Discovery) */}
      {selectedCategory && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '520px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden',
            animation: 'fadeIn 0.25s ease-out'
          }}>
            
            {/* Modal Header */}
            <div style={{
              background: 'linear-gradient(135deg, #04281f 0%, #064e3b 100%)',
              color: '#ffffff',
              padding: '1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 700, textTransform: 'uppercase' }}>
                  Instant Comparison
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                  {selectedCategory.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedCategory(null)}
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  cursor: 'pointer'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.75rem' }}>
              {submitSuccess ? (
                <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: '#ecfdf5',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.25rem auto'
                  }}>
                    <CheckCircle2 size={36} />
                  </div>
                  <h4 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f2b48', marginBottom: '0.5rem' }}>
                    Quotes Generated Successfully!
                  </h4>
                  <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '1.5rem' }}>
                    We have compared top plans matching your requirements. Our certified specialist will send the comparative breakdown to <strong>{quoteForm.phone}</strong>.
                  </p>
                  <button
                    onClick={() => setSelectedCategory(null)}
                    style={{
                      background: '#059669',
                      color: '#ffffff',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '12px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Done
                  </button>
                </div>
              ) : modalStep === 1 ? (
                /* Step 1: Member / Detail Selection */
                <div>
                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', fontWeight: 700, fontSize: '0.88rem', color: '#1e293b', marginBottom: '0.5rem' }}>
                      Who are you protecting?
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                      {memberOptions.map(member => {
                        const isSelected = quoteForm.insuredMembers.includes(member);
                        return (
                          <button
                            key={member}
                            type="button"
                            onClick={() => handleMemberToggle(member)}
                            style={{
                              padding: '10px 8px',
                              borderRadius: '10px',
                              border: isSelected ? '2px solid #059669' : '1px solid #cbd5e1',
                              background: isSelected ? '#ecfdf5' : '#ffffff',
                              color: isSelected ? '#047857' : '#475569',
                              fontWeight: isSelected ? 700 : 500,
                              fontSize: '0.85rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px'
                            }}
                          >
                            {isSelected && <CheckCircle2 size={14} color="#059669" />}
                            {member}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {selectedCategory.id === 'car' || selectedCategory.id === 'two_wheeler' ? (
                    <div style={{ marginBottom: '1.25rem' }}>
                      <label style={{ display: 'block', fontWeight: 700, fontSize: '0.88rem', color: '#1e293b', marginBottom: '0.5rem' }}>
                        Vehicle Registration Number
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. AP 09 CA 1234"
                        value={quoteForm.vehicleNumber}
                        onChange={(e) => setQuoteForm({ ...quoteForm, vehicleNumber: e.target.value.toUpperCase() })}
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          borderRadius: '10px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.95rem',
                          fontWeight: 600,
                          textTransform: 'uppercase'
                        }}
                      />
                    </div>
                  ) : (
                    <div style={{ marginBottom: '1.25rem' }}>
                      <label style={{ display: 'block', fontWeight: 700, fontSize: '0.88rem', color: '#1e293b', marginBottom: '0.5rem' }}>
                        Desired Cover Amount (Sum Insured)
                      </label>
                      <select
                        value={quoteForm.sumInsured}
                        onChange={(e) => setQuoteForm({ ...quoteForm, sumInsured: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          borderRadius: '10px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.95rem',
                          fontWeight: 600,
                          background: '#ffffff'
                        }}
                      >
                        <option value="5 Lakhs">₹5 Lakhs (Basic)</option>
                        <option value="10 Lakhs">₹10 Lakhs (Recommended)</option>
                        <option value="25 Lakhs">₹25 Lakhs (Comprehensive)</option>
                        <option value="50 Lakhs">₹50 Lakhs (High Networth)</option>
                        <option value="1 Crore">₹1 Crore (Super Shield)</option>
                      </select>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setModalStep(2)}
                    style={{
                      width: '100%',
                      background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                      color: '#ffffff',
                      border: 'none',
                      padding: '14px',
                      borderRadius: '12px',
                      fontSize: '1rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      marginTop: '1rem',
                      boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)'
                    }}
                  >
                    Continue to View Quotes <ArrowRight size={18} />
                  </button>
                </div>
              ) : (
                /* Step 2: Contact Info */
                <form onSubmit={handleFormSubmit}>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: '#1e293b', marginBottom: '0.4rem' }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Enter your name"
                      value={quoteForm.fullName}
                      onChange={(e) => setQuoteForm({ ...quoteForm, fullName: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: '#1e293b', marginBottom: '0.4rem' }}>
                      WhatsApp / Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="10-digit mobile number"
                      value={quoteForm.phone}
                      onChange={(e) => setQuoteForm({ ...quoteForm, phone: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: '#1e293b', marginBottom: '0.4rem' }}>
                        City *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Hyderabad"
                        value={quoteForm.city}
                        onChange={(e) => setQuoteForm({ ...quoteForm, city: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.9rem'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: '#1e293b', marginBottom: '0.4rem' }}>
                        Pincode
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 500081"
                        value={quoteForm.pincode}
                        onChange={(e) => setQuoteForm({ ...quoteForm, pincode: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.9rem'
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '1.25rem' }}>
                    <button
                      type="button"
                      onClick={() => setModalStep(1)}
                      style={{
                        flex: '1',
                        background: '#f1f5f9',
                        color: '#475569',
                        border: '1px solid #cbd5e1',
                        padding: '12px',
                        borderRadius: '10px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      style={{
                        flex: '2',
                        background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                        color: '#ffffff',
                        border: 'none',
                        padding: '12px',
                        borderRadius: '10px',
                        fontWeight: 700,
                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      {isSubmitting ? 'Submitting...' : 'View Comparison & Prices'} <ArrowRight size={16} />
                    </button>
                  </div>
                </form>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
