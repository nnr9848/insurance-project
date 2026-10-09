import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  FileText, 
  Download, 
  ShieldCheck, 
  Phone, 
  Mail, 
  CheckCircle2, 
  ArrowLeft, 
  Sparkles, 
  ExternalLink,
  ChevronRight,
  Clock,
  HeartHandshake,
  AlertCircle,
  FileCheck,
  Send,
  UserCheck
} from 'lucide-react';
import { portalService } from '../services/api';
import { PARTNER_LOGO_MAP, DEFAULT_PARTNERS_FALLBACK } from '../utils/partnerAssetCatalog';
import { useBusinessProfile } from '../context/BusinessProfileContext';
import { useAuth } from '../context/AuthContext';
import { getStoredAttribution } from '../utils/trafficAttribution';

export default function PartnerDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { businessProfile } = useBusinessProfile();
  const { user, isAuthenticated } = useAuth();

  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Instant Quote / Inquiry Form State
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    city: 'Hyderabad',
    coverageType: 'Health Insurance',
    estimatedCover: '10 Lakhs',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formError, setFormError] = useState('');

  const phone = businessProfile?.primaryPhone || '+91 8367415156';
  const cleanPhone = phone.replace(/\s+/g, '');
  const email = businessProfile?.supportEmail || 'info@aadhirakshainsurance.com';

  // Load Partner Details
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    const loadPartner = async () => {
      try {
        const data = await portalService.getPartnerBySlug(slug);
        if (isMounted && data) {
          setPartner(data);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Backend partner slug endpoint unavailable, trying fallback catalog:', err);
      }

      // Check fallback list
      const fallback = DEFAULT_PARTNERS_FALLBACK.find(p => p.slug === slug || p.slug === slug.toLowerCase());
      if (isMounted) {
        if (fallback) {
          setPartner(fallback);
        } else {
          setError('Insurance Partner not found.');
        }
        setLoading(false);
      }
    };

    loadPartner();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  // Prepopulate form if user is logged in
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.fullName || prev.fullName,
        phoneNumber: user.phoneNumber || prev.phoneNumber,
        email: user.email && !user.email.includes('@aadhiraksha.internal') ? user.email : prev.email,
        city: user.city || prev.city
      }));
    }
  }, [user]);

  // Resolve Logo
  const getLogoSrc = () => {
    if (!partner) return '';
    if (partner.logoUrl) return partner.logoUrl;
    if (partner.logoKey && PARTNER_LOGO_MAP[partner.logoKey]) return PARTNER_LOGO_MAP[partner.logoKey];
    return '';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formError) setFormError('');
  };

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.phoneNumber.trim()) {
      setFormError('Please enter your Full Name and 10-digit Mobile Number.');
      return;
    }

    const cleanPhoneVal = formData.phoneNumber.replace(/\D/g, '');
    if (cleanPhoneVal.length !== 10) {
      setFormError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setSubmitting(true);
    setFormError('');

    try {
      const attribution = getStoredAttribution();
      const planDetailsPayload = JSON.stringify({
        source: attribution?.source || 'Partner Brochure Page',
        campaign: attribution?.campaign || 'Organic / Partner Showcase',
        partnerName: partner.name,
        partnerSlug: partner.slug,
        category: partner.category,
        coverageType: formData.coverageType,
        estimatedCover: formData.estimatedCover,
        requestedBrochure: partner.brochureUrl || 'Default Insurer Literature',
        submittedAt: new Date().toISOString()
      });

      await portalService.submitQuote({
        fullName: formData.fullName.trim(),
        phoneNumber: cleanPhoneVal,
        email: formData.email.trim() || null,
        city: formData.city.trim() || 'Hyderabad',
        category: partner.category === 'health' ? 'Health Insurance' : (partner.category === 'life' ? 'Life Insurance' : 'General Insurance'),
        subCategory: partner.name + ' - Brochure Inquiry',
        planDetails: planDetailsPayload
      });

      setSubmitSuccess(true);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to submit inquiry. Please call our helpline.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <div style={{ textAlign: 'center', color: '#64748b' }}>
          <div className="spinner-border" style={{ width: '2.5rem', height: '2.5rem', marginBottom: '1rem' }} />
          <p style={{ fontWeight: 600 }}>Loading Partner Information & Brochure...</p>
        </div>
      </div>
    );
  }

  if (error || !partner) {
    return (
      <div style={{ minHeight: '60vh', padding: '3rem 1rem', textAlign: 'center', background: '#f8fafc' }}>
        <div className="container" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <AlertCircle size={48} color="#ef4444" style={{ margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-navy)', marginBottom: '8px' }}>
            Partner Not Found
          </h2>
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
            We could not find the requested insurance company page.
          </p>
          <Link 
            to="/" 
            style={{
              background: 'var(--primary-navy)',
              color: '#ffffff',
              padding: '10px 20px',
              borderRadius: '10px',
              fontWeight: 700,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <ArrowLeft size={16} /> Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  const logoSrc = getLogoSrc();
  const highlightsList = partner.keyHighlights 
    ? partner.keyHighlights.split(',').map(s => s.trim()).filter(Boolean)
    : [
        'Over 10,000+ Cashless Hospital & Garage Tie-ups',
        'Direct Assistance with Fast Cashless Claims',
        'Transparent Policy Clauses & Zero Hidden Deductibles',
        'Official IRDAI Authorized Insurer'
      ];

  return (
    <div className="partner-detail-page" style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '4rem' }}>
      
      {/* 1. Breadcrumb Bar */}
      <div style={{ background: '#ffffff', borderBottom: '1px solid var(--border-subtle)', padding: '12px 1rem' }}>
        <div className="container" style={{ maxWidth: '1180px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#64748b' }}>
            <Link to="/" style={{ color: 'var(--primary-navy)', fontWeight: 600, textDecoration: 'none' }}>Home</Link>
            <ChevronRight size={14} />
            <span>Our Network</span>
            <ChevronRight size={14} />
            <span style={{ color: 'var(--accent-gold)', fontWeight: 700 }}>{partner.name}</span>
          </div>

          <Link 
            to="/" 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.82rem',
              fontWeight: 700,
              color: 'var(--primary-navy)',
              textDecoration: 'none'
            }}
          >
            <ArrowLeft size={14} /> Back to Network
          </Link>
        </div>
      </div>

      {/* 2. Hero Header */}
      <section style={{
        background: 'linear-gradient(135deg, #091a2f 0%, #0f2b48 100%)',
        color: '#ffffff',
        padding: '3rem 1rem 3.5rem',
        position: 'relative'
      }}>
        <div className="container" style={{ maxWidth: '1180px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
            
            {/* White Logo Badge Card */}
            <div style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '1.25rem 1.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
              minWidth: '180px',
              height: '90px'
            }}>
              {logoSrc ? (
                <img 
                  src={logoSrc} 
                  alt={partner.name} 
                  style={{ maxHeight: '55px', maxWidth: '160px', objectFit: 'contain' }}
                />
              ) : (
                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-navy)' }}>{partner.name}</span>
              )}
            </div>

            {/* Partner Title & Regulatory Category */}
            <div style={{ flex: 1, minWidth: '280px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{
                  background: 'rgba(217, 119, 6, 0.25)',
                  color: 'var(--accent-gold)',
                  padding: '4px 10px',
                  borderRadius: '9999px',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  border: '1px solid rgba(217, 119, 6, 0.4)'
                }}>
                  {partner.category === 'health' ? 'Health Insurance' : (partner.category === 'life' ? 'Life & Protection' : 'Motor & General')}
                </span>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: '#4ade80',
                  fontSize: '0.78rem',
                  fontWeight: 700
                }}>
                  <ShieldCheck size={14} /> IRDAI Authorised Partner
                </span>
              </div>

              <h1 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', fontWeight: 900, margin: '0 0 10px', color: '#ffffff' }}>
                {partner.name} Official Product Literature & Plans
              </h1>

              <p style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: 1.6, margin: 0, maxWidth: '720px' }}>
                {partner.description || `Explore verified policy coverage, cashless network hospitals, and official sales brochures for ${partner.name}. Compare quotes with zero agent bias through Aadhiraksha.`}
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 3. Main Grid: Brochure Hub & Instant Quote / Advisory Form */}
      <div className="container" style={{ maxWidth: '1180px', margin: '-1.75rem auto 0', padding: '0 1rem', position: 'relative', zIndex: 10 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.75rem',
          alignItems: 'start'
        }}>
          
          {/* LEFT: Official Brochure Showcase Card */}
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            padding: '2rem',
            border: '1px solid var(--border-subtle)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.06)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
              <FileText size={22} color="var(--accent-gold)" />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-navy)', margin: 0 }}>
                Company Brochure & Policy Wordings
              </h2>
            </div>

            <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Download or preview the official insurer brochure detailing inclusions, exclusions, waiting periods, room-rent limits, and day-care procedures.
            </p>

            {/* Brochure Action Box */}
            <div style={{
              background: '#f8fafc',
              borderRadius: '16px',
              border: '1.5px dashed #cbd5e1',
              padding: '1.75rem',
              textAlign: 'center',
              marginBottom: '1.75rem'
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: '#ecfdf5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem'
              }}>
                <FileCheck size={28} />
              </div>

              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary-navy)', marginBottom: '6px' }}>
                {partner.name} - Official Product Literature
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 1.25rem' }}>
                Latest updated edition • Authorized for policyholders across India
              </p>

              {partner.brochureUrl ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
                  <a
                    href={partner.brochureUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      background: 'var(--primary-navy)',
                      color: '#ffffff',
                      padding: '11px 22px',
                      borderRadius: '10px',
                      fontWeight: 700,
                      fontSize: '0.88rem',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 12px rgba(15, 43, 72, 0.2)'
                    }}
                  >
                    <Download size={16} /> Download Official PDF Brochure
                  </a>

                  <a
                    href={partner.brochureUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      background: '#ffffff',
                      color: 'var(--primary-navy)',
                      border: '1px solid #cbd5e1',
                      padding: '11px 18px',
                      borderRadius: '10px',
                      fontWeight: 700,
                      fontSize: '0.88rem',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <ExternalLink size={15} /> Preview Inline
                  </a>
                </div>
              ) : (
                <div>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#fef3c7',
                    color: '#92400e',
                    padding: '8px 14px',
                    borderRadius: '10px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    marginBottom: '1rem'
                  }}>
                    <Clock size={15} /> Direct digital PDF being indexed by admin
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
                    Submit the quick form to the right to receive the exact tailored brochure and quote directly on WhatsApp or Email within 5 minutes.
                  </p>
                </div>
              )}
            </div>

            {/* Key Policy Highlights */}
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary-navy)', marginBottom: '12px' }}>
                Key Coverage Advantages:
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {highlightsList.map((highlight, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <CheckCircle2 size={18} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span style={{ fontSize: '0.88rem', color: '#334155', fontWeight: 600 }}>{highlight}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Official Claim Escalation & Support Desk */}
            <div style={{
              marginTop: '2rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid #f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Need claim support for {partner.name}?</div>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                  Aadhiraksha 24/7 Claim Concierge Desk
                </div>
              </div>
              <a
                href={`tel:${cleanPhone}`}
                style={{
                  background: '#ecfdf5',
                  color: '#065f46',
                  border: '1px solid #a7f3d0',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Phone size={14} /> Call {phone}
              </a>
            </div>

          </div>

          {/* RIGHT: Instant Quote & Brochure Dispatch Form */}
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            padding: '2rem',
            border: '1px solid var(--border-subtle)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.06)'
          }}>
            
            {submitSuccess ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: '#ecfdf5',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem',
                  boxShadow: '0 4px 14px rgba(5, 150, 105, 0.25)'
                }}>
                  <CheckCircle2 size={36} />
                </div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary-navy)', marginBottom: '8px' }}>
                  Inquiry Received Successfully!
                </h3>
                <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                  Our senior advisory desk has registered your inquiry for <strong>{partner.name}</strong>. A licensed expert will send the custom brochure comparison and discounted premium calculation to <strong>{formData.phoneNumber}</strong>.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <a
                    href={`https://wa.me/918367415156?text=Hi%20Aadhiraksha,%20I%20requested%20the%20brochure%20and%20quote%20for%20${encodeURIComponent(partner.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      background: '#25d366',
                      color: '#ffffff',
                      padding: '12px',
                      borderRadius: '10px',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    Chat on WhatsApp Directly <ExternalLink size={15} />
                  </a>

                  <button
                    onClick={() => {
                      setSubmitSuccess(false);
                      setFormData(prev => ({ ...prev, notes: '' }));
                    }}
                    style={{
                      background: '#f1f5f9',
                      border: 'none',
                      color: '#475569',
                      padding: '10px',
                      borderRadius: '10px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Submit Another Request
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <Sparkles size={20} color="var(--accent-gold)" />
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-navy)', margin: 0 }}>
                    Get Instant Quote & Brochure on WhatsApp
                  </h3>
                </div>
                <p style={{ fontSize: '0.84rem', color: '#64748b', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                  Compare official plans from {partner.name} with up to 15% special online discount through Aadhiraksha.
                </p>

                {isAuthenticated && user && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    background: '#ecfdf5',
                    borderRadius: '10px',
                    border: '1px solid #a7f3d0',
                    fontSize: '0.78rem',
                    color: '#065f46',
                    marginBottom: '1.25rem'
                  }}>
                    <UserCheck size={15} color="#059669" />
                    <span>Inquiring as verified client: <strong>{user.fullName || user.phoneNumber}</strong></span>
                  </div>
                )}

                {formError && (
                  <div style={{
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    color: '#b91c1c',
                    fontSize: '0.82rem',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <AlertCircle size={16} />
                    <span>{formError}</span>
                  </div>
                )}

                <form onSubmit={handleInquirySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="Enter your name"
                      required
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: '10px',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '0.88rem'
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        Mobile Number *
                      </label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        placeholder="10-digit mobile"
                        required
                        style={{
                          width: '100%',
                          padding: '11px 14px',
                          borderRadius: '10px',
                          border: '1px solid var(--border-subtle)',
                          fontSize: '0.88rem'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        City
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="e.g. Hyderabad"
                        style={{
                          width: '100%',
                          padding: '11px 14px',
                          borderRadius: '10px',
                          border: '1px solid var(--border-subtle)',
                          fontSize: '0.88rem'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="name@example.com"
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: '10px',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '0.88rem'
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        Coverage Type
                      </label>
                      <select
                        name="coverageType"
                        value={formData.coverageType}
                        onChange={handleInputChange}
                        style={{
                          width: '100%',
                          padding: '11px 12px',
                          borderRadius: '10px',
                          border: '1px solid var(--border-subtle)',
                          background: '#ffffff',
                          fontSize: '0.85rem'
                        }}
                      >
                        <option value="Health Insurance">Health Insurance</option>
                        <option value="Family Floater">Family Floater</option>
                        <option value="Term Life Cover">Term Life Cover</option>
                        <option value="Car Insurance">Car Insurance</option>
                        <option value="Two Wheeler">Two Wheeler</option>
                        <option value="Commercial Liability">Commercial Liability</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        Sum Insured Target
                      </label>
                      <select
                        name="estimatedCover"
                        value={formData.estimatedCover}
                        onChange={handleInputChange}
                        style={{
                          width: '100%',
                          padding: '11px 12px',
                          borderRadius: '10px',
                          border: '1px solid var(--border-subtle)',
                          background: '#ffffff',
                          fontSize: '0.85rem'
                        }}
                      >
                        <option value="5 Lakhs">₹5 Lakhs</option>
                        <option value="10 Lakhs">₹10 Lakhs</option>
                        <option value="25 Lakhs">₹25 Lakhs</option>
                        <option value="50 Lakhs">₹50 Lakhs</option>
                        <option value="1 Crore">₹1 Crore</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      marginTop: '8px',
                      background: 'linear-gradient(135deg, var(--accent-gold) 0%, #ea580c 100%)',
                      color: '#ffffff',
                      border: 'none',
                      padding: '13px 20px',
                      borderRadius: '12px',
                      fontWeight: 800,
                      fontSize: '0.94rem',
                      cursor: submitting ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 8px 20px rgba(234, 88, 12, 0.3)',
                      transition: 'transform 0.15s ease'
                    }}
                  >
                    {submitting ? (
                      <>Sending Inquiry...</>
                    ) : (
                      <>Request Brochure & Best Quote <Send size={16} /></>
                    )}
                  </button>

                  <div style={{ textAlign: 'center', fontSize: '0.74rem', color: '#94a3b8', marginTop: '4px' }}>
                    🔒 Zero Spam Promise • Your data is protected under IRDAI confidentiality norms
                  </div>

                </form>
              </div>
            )}

          </div>

        </div>
      </div>

    </div>
  );
}
