import React from 'react';
import { Link } from 'react-router-dom';
import HeroSection from '../components/HeroSection';
import { 
  HeartPulse, 
  ShieldCheck, 
  Car, 
  Briefcase, 
  Plane, 
  Banknote, 
  ArrowRight, 
  CheckCircle2, 
  Award, 
  Clock, 
  Users, 
  Building,
  Sparkles,
  Zap,
  Lock,
  Headphones
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

export default function Home() {
  const categories = [
    {
      title: 'Health Insurance',
      desc: '100% Cashless medical coverage across 10,000+ hospitals with no room rent limit.',
      icon: <HeartPulse size={26} />,
      link: '/new-policy-support',
      badge: 'Zero Waiting Period Options'
    },
    {
      title: 'Life & Term Protection',
      desc: 'Guaranteed family safety with high-value term plans and critical illness riders.',
      icon: <ShieldCheck size={26} />,
      link: '/new-policy-support',
      badge: 'Tax Benefit u/s 80C'
    },
    {
      title: 'Motor / Vehicle Insurance',
      desc: 'Zero-depreciation accident damage, engine protector, and 24x7 pan-India towing.',
      icon: <Car size={26} />,
      link: '/new-policy-support',
      badge: 'Instant 2-Minute Renewal'
    },
    {
      title: 'Corporate & SME Insurance',
      desc: 'Tailored commercial property, fire & burglary, marine cargo, and group health.',
      icon: <Briefcase size={26} />,
      link: '/new-policy-support',
      badge: 'Custom Enterprise Quotes'
    },
    {
      title: 'Overseas Travel Insurance',
      desc: 'Coverage for flight delays, lost passports, baggage loss, and overseas hospitalization.',
      icon: <Plane size={26} />,
      link: '/new-policy-support',
      badge: 'Schengen & US Approved'
    },
    {
      title: 'Loans & Financing',
      desc: 'Personal, Home, MSME business, and Loan Against Property with lowest interest rates.',
      icon: <Banknote size={26} />,
      link: '/loans',
      badge: 'Lowest Interest Benchmarking'
    }
  ];

  const partners = [
    { name: 'Star Health Insurance', logo: starHealthLogo },
    { name: 'HDFC ERGO', logo: hdfcErgoLogo },
    { name: 'ICICI Lombard', logo: iciciLombardLogo },
    { name: 'Care Health Insurance', logo: careHealthLogo },
    { name: 'TATA AIG Insurance', logo: tataAigLogo },
    { name: 'Bajaj Allianz', logo: bajajAllianzLogo },
    { name: 'Niva Bupa Health', logo: nivaBupaLogo },
    { name: 'SBI General Insurance', logo: sbiGeneralLogo },
    { name: 'Life Insurance Corporation (LIC)', logo: licLogo },
    { name: 'Max Life Insurance', logo: axisMaxLogo },
    { name: 'Aditya Birla Capital', logo: adityaBirlaLogo },
    { name: 'Reliance General Insurance', logo: relianceGeneralLogo },
    { name: 'Digit Insurance', logo: digitLogo },
    { name: 'Kotak General Insurance', logo: kotakGeneralLogo },
    { name: 'ManipalCigna Health', logo: manipalCignaLogo },
    { name: 'Chola MS General Insurance', logo: cholaMsLogo },
    { name: 'Future Generali', logo: futureGeneraliLogo },
    { name: 'Magma HDI General', logo: magmaHdiLogo },
    { name: 'National Insurance', logo: nationalInsuranceLogo },
    { name: 'Oriental Insurance', logo: orientalInsuranceLogo }
  ];

  const whyChooseUs = [
    {
      icon: <Zap size={26} color="#f59e0b" />,
      title: 'Instant Policy Issuance',
      desc: 'Zero paperwork digital KYC and instant policy delivery to your WhatsApp and email within 2 minutes.'
    },
    {
      icon: <ShieldCheck size={26} color="#10b981" />,
      title: '100% Cashless Settlement',
      desc: 'Empanelled across 10,000+ top hospitals with fast-track cashless pre-authorization in 60 mins.'
    },
    {
      icon: <Award size={26} color="#2563eb" />,
      title: 'Unbiased Comparisons',
      desc: 'We compare 30+ top IRDAI certified insurers to ensure you get maximum coverage at the lowest premium.'
    },
    {
      icon: <Headphones size={26} color="#8b5cf6" />,
      title: 'Dedicated Claim Manager',
      desc: 'Our claims desk stands beside your family during hospital admission and handles all paperwork end-to-end.'
    },
    {
      icon: <Lock size={26} color="#ec4899" />,
      title: 'Continuous Porting Protection',
      desc: 'Switch insurers smoothly without losing your accumulated waiting period credits or No Claim Bonus (NCB).'
    },
    {
      icon: <Users size={26} color="#06b6d4" />,
      title: 'Certified POSP Network',
      desc: 'Over 5,000+ trained advisors pan-India available for doorstep advice and digital consultations.'
    }
  ];

  return (
    <div>
      <HeroSection />

      {/* Services Grid Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-title-box">
            <span className="section-badge">Our Comprehensive Portfolio</span>
            <h2 className="section-title">Insurance & Financial Products Built For You</h2>
            <p className="section-subtitle">
              Compare India's leading insurance carriers and secure the best coverage at guaranteed lowest premiums.
            </p>
          </div>

          <div className="features-grid">
            {categories.map((cat, idx) => (
              <div key={idx} className="feature-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div className="feature-icon-wrapper">
                    {cat.icon}
                  </div>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    background: '#fef3c7',
                    color: '#b45309',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '9999px'
                  }}>
                    {cat.badge}
                  </span>
                </div>
                <h3 className="feature-card-title">{cat.title}</h3>
                <p className="feature-card-desc">{cat.desc}</p>
                <Link to={cat.link} className="feature-card-link">
                  Explore Details <ArrowRight size={15} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Stats Section */}
      <section style={{ background: 'var(--primary-navy)', color: '#fff', padding: '4.5rem 0' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '2.5rem',
            textAlign: 'center'
          }}>
            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent-gold)', marginBottom: '0.25rem' }}>
                10,000+
              </div>
              <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }}>Empanelled Hospitals</div>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>100% Cashless network pan-India</div>
            </div>

            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent-gold)', marginBottom: '0.25rem' }}>
                98.8%
              </div>
              <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }}>Claim Settlement Ratio</div>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Dedicated claim assistance desk</div>
            </div>

            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent-gold)', marginBottom: '0.25rem' }}>
                50,000+
              </div>
              <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }}>Satisfied Families</div>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Protected with trusted policies</div>
            </div>

            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent-gold)', marginBottom: '0.25rem' }}>
                24x7
              </div>
              <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }}>Emergency Support</div>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Fast-track assistance whenever needed</div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section style={{ padding: '5rem 0', background: '#ffffff' }}>
        <div className="container">
          <div className="section-title-box">
            <span className="section-badge">The Aadhiraksha Advantage</span>
            <h2 className="section-title">Why Choose Aadhiraksha Insurance?</h2>
            <p className="section-subtitle">
              We empower Indian families and enterprises with transparent policies, best-in-class claims support, and guaranteed pricing.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.75rem'
          }}>
            {whyChooseUs.map((item, idx) => (
              <div
                key={idx}
                style={{
                  background: '#f8fafc',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '16px',
                  padding: '2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.25s ease',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '14px',
                  background: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.06)',
                  marginBottom: '1.25rem'
                }}>
                  {item.icon}
                </div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--primary-navy)' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Partners Section */}
      <section style={{ padding: '4.5rem 0', background: '#f1f5f9', borderTop: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <div className="section-title-box" style={{ marginBottom: '2.5rem' }}>
            <span className="section-badge">Trusted Insurers</span>
            <h2 className="section-title">Our Insurance Partners</h2>
            <p className="section-subtitle">
              We partner with India's most reputed IRDAI-registered insurance companies to offer you complete peace of mind.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '1.25rem',
            alignItems: 'stretch'
          }}>
            {partners.map((partner, idx) => (
              <div
                key={idx}
                style={{
                  background: '#ffffff',
                  borderRadius: '12px',
                  padding: '1.25rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  minHeight: '88px',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.04)';
                }}
                title={partner.name}
              >
                <img 
                  src={partner.logo} 
                  alt={partner.name}
                  style={{
                    maxHeight: '44px',
                    maxWidth: '130px',
                    width: 'auto',
                    height: 'auto',
                    objectFit: 'contain'
                  }}
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
