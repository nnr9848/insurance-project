import React, { useState } from 'react';
import { 
  X, 
  ExternalLink, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Building2, 
  User, 
  Phone, 
  Mail, 
  Briefcase, 
  ArrowRight,
  Lock
} from 'lucide-react';
import { portalService } from '../../services/api';

export default function PartnerLeadModal({ partner, onClose, logoSrc }) {
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    companyName: '',
    requirement: partner?.category === 'health' 
      ? 'Health Insurance' 
      : (partner?.category === 'life' ? 'Term / Life Insurance' : 'Motor & General Insurance'),
    city: ''
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!partner) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errorMsg) setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Indian 10-digit mobile validation
    const cleanPhone = (formData.phoneNumber || '').replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!formData.fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      // 1. Prepare structured lead details
      const planDetailsPayload = JSON.stringify({
        source: 'homepage_partner_card',
        partnerName: partner.name,
        partnerId: partner.id || null,
        targetUrl: partner.redirectUrl,
        category: partner.category,
        requirement: formData.requirement,
        companyName: formData.companyName?.trim() || null,
        redirectedAt: new Date().toISOString(),
        action: 'PROCEEDED_TO_INSURER_SITE'
      });

      // 2. Persist lead in CRM database
      await portalService.submitQuote({
        categorySlug: partner.category || 'partner-referral',
        fullName: formData.fullName.trim(),
        phoneNumber: cleanPhone,
        email: formData.email?.trim() || null,
        city: formData.city?.trim() || 'Website Visitor',
        planDetails: planDetailsPayload
      });

      setIsSuccess(true);

      // 3. Seamlessly redirect to partner's configured official website
      setTimeout(() => {
        const targetUrl = partner.redirectUrl || 'https://www.google.com';
        window.open(targetUrl, '_blank', 'noopener,noreferrer');
        onClose();
      }, 900);

    } catch (err) {
      console.error('Failed to submit partner quote lead:', err);
      // Even if network fails, ensure user is not stranded; still permit opening the site
      setErrorMsg('Redirecting you directly to the official portal...');
      setTimeout(() => {
        const targetUrl = partner.redirectUrl || 'https://www.google.com';
        window.open(targetUrl, '_blank', 'noopener,noreferrer');
        onClose();
      }, 1000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="partner-lead-modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'none',
        WebkitBackdropFilter: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem',
        animation: 'fadeInOverlay 0.2s ease-out'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div 
        className="partner-lead-modal-card"
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '520px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid var(--border-subtle, #e2e8f0)',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        {/* Modal Top Accent Header */}
        <div style={{
          background: '#ffffff',
          padding: '1.2rem 1.4rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-subtle, #e2e8f0)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '10px',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
              flexShrink: 0
            }}>
              <img 
                src={logoSrc} 
                alt={partner.name} 
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
              />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '2px' }}>
                <span style={{
                  fontSize: '0.67rem',
                  fontWeight: 700,
                  color: '#059669',
                  background: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  padding: '0.1rem 0.45rem',
                  borderRadius: '999px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.4px'
                }}>
                  <ShieldCheck size={11} color="#059669" /> Official Insurer Portal
                </span>
              </div>
              <h3 style={{ margin: 0, fontSize: '1.12rem', fontWeight: 800, color: 'var(--primary-navy, #0f2b48)', letterSpacing: '-0.2px' }}>
                {partner.name}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={loading}
            aria-label="Close Modal"
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              color: '#64748b',
              padding: '0.45rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#0f172a'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#64748b'; }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Form Content */}
        <div style={{ padding: '1.5rem' }}>
          {isSuccess ? (
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: '#ecfdf5',
                color: '#059669',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}>
                <CheckCircle2 size={32} />
              </div>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-navy, #0f2b48)', margin: '0 0 0.5rem' }}>
                Details Saved Successfully!
              </h4>
              <p style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                Redirecting you to <strong>{partner.name}</strong> official website...
              </p>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.82rem',
                color: 'var(--accent-gold-hover, #d97706)',
                fontWeight: 700
              }}>
                Opening in a secure window <ExternalLink size={14} />
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{
                background: 'var(--bg-main, #f8fafc)',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                border: '1px solid var(--border-subtle, #e2e8f0)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem'
              }}>
                <Sparkles size={16} color="var(--accent-gold, #f59e0b)" />
                <span style={{ fontSize: '0.82rem', color: 'var(--text-main, #1e293b)', fontWeight: 600 }}>
                  Enter your details to check direct premiums & receive dedicated claim assistance from Aadhiraksha.
                </span>
              </div>

              {errorMsg && (
                <div style={{
                  padding: '0.65rem 0.9rem',
                  borderRadius: '8px',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#dc2626',
                  fontSize: '0.84rem',
                  fontWeight: 600
                }}>
                  {errorMsg}
                </div>
              )}

              {/* Full Name Field */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main, #1e293b)', marginBottom: '0.35rem' }}>
                  Full Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.75rem 0.65rem 2.3rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-subtle, #cbd5e1)',
                      fontSize: '0.9rem',
                      outline: 'none',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>
              </div>

              {/* Phone & Email Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main, #1e293b)', marginBottom: '0.35rem' }}>
                    Mobile Number <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b', fontSize: '0.85rem', fontWeight: 700 }}>
                      <Phone size={14} color="#94a3b8" /> +91
                    </div>
                    <input
                      type="tel"
                      name="phoneNumber"
                      maxLength={10}
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      placeholder="98765 43210"
                      required
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.75rem 0.65rem 4.4rem',
                        borderRadius: '8px',
                        border: '1px solid var(--border-subtle, #cbd5e1)',
                        fontSize: '0.9rem',
                        outline: 'none',
                        fontFamily: 'inherit'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main, #1e293b)', marginBottom: '0.35rem' }}>
                    Email Address <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#94a3b8' }}>(Optional)</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.75rem 0.65rem 2.3rem',
                        borderRadius: '8px',
                        border: '1px solid var(--border-subtle, #cbd5e1)',
                        fontSize: '0.9rem',
                        outline: 'none',
                        fontFamily: 'inherit'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Requirement & Company Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main, #1e293b)', marginBottom: '0.35rem' }}>
                    Requirement / Product
                  </label>
                  <select
                    name="requirement"
                    value={formData.requirement}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-subtle, #cbd5e1)',
                      fontSize: '0.88rem',
                      outline: 'none',
                      fontFamily: 'inherit',
                      background: '#ffffff'
                    }}
                  >
                    <option value="Health Insurance">Health Insurance</option>
                    <option value="Motor & Car Insurance">Motor & Car Insurance</option>
                    <option value="Two Wheeler Insurance">Two Wheeler Insurance</option>
                    <option value="Term & Life Insurance">Term & Life Insurance</option>
                    <option value="Group / SME Business Insurance">Group / SME Insurance</option>
                    <option value="Travel Insurance">Travel Insurance</option>
                    <option value="General Commercial Cover">General Commercial Cover</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main, #1e293b)', marginBottom: '0.35rem' }}>
                    Company / Firm Name <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#94a3b8' }}>(Optional)</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Briefcase size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      placeholder="e.g. Acme Enterprises"
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.75rem 0.65rem 2.3rem',
                        borderRadius: '8px',
                        border: '1px solid var(--border-subtle, #cbd5e1)',
                        fontSize: '0.9rem',
                        outline: 'none',
                        fontFamily: 'inherit'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: '0.5rem',
                  background: 'linear-gradient(135deg, var(--accent-gold, #f59e0b) 0%, var(--accent-gold-hover, #d97706) 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '0.85rem 1.25rem',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.35)',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(245, 158, 11, 0.45)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.35)';
                }}
              >
                {loading ? (
                  <>
                    <div style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      border: '2px solid #ffffff',
                      borderTopColor: 'transparent',
                      animation: 'spin 0.6s linear infinite'
                    }} />
                    <span>Connecting to {partner.name}...</span>
                  </>
                ) : (
                  <>
                    <span>Continue to Check Premium on {partner.name}</span>
                    <ArrowRight size={17} />
                  </>
                )}
              </button>

              {/* Compliance & Privacy Footer */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
                fontSize: '0.72rem',
                color: 'var(--text-muted, #64748b)',
                marginTop: '0.25rem',
                textAlign: 'center'
              }}>
                <Lock size={12} color="#10b981" />
                <span>Your information is encrypted & used solely for insurance advisory. IRDAI Regulated.</span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
