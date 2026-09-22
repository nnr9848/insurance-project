import React, { useState } from 'react';
import { 
  Briefcase, 
  Users, 
  Building2, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Zap, 
  ArrowRight, 
  Award,
  Sparkles,
  Flame,
  Ship,
  FileCheck
} from 'lucide-react';
import { portalService } from '../services/api';

export default function BusinessInsurance() {
  const [businessType, setBusinessType] = useState('gmc'); // 'gmc' | 'fire' | 'marine' | 'cyber'
  const [employeeCount, setEmployeeCount] = useState('10-50');
  
  const [formData, setFormData] = useState({
    companyName: '',
    fullName: '',
    workEmail: '',
    phoneNumber: '',
    city: 'Hyderabad',
    industry: 'IT & Software Services'
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await portalService.submitQuote({
        categorySlug: 'corporate-sme-insurance',
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        email: formData.workEmail,
        city: formData.city,
        planDetails: JSON.stringify({
          category: businessType === 'gmc' ? 'Group Medical Cover (GMC)' : businessType === 'fire' ? 'Commercial Fire & Asset Shield' : businessType === 'marine' ? 'Marine Cargo & Transit' : 'Cyber & Directors Liability (D&O)',
          companyName: formData.companyName,
          employeeCount: employeeCount,
          industryType: formData.industry,
          corporateWorkEmail: formData.workEmail
        })
      });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', color: '#0f2b48' }}>
      
      {/* 1. HERO SECTION (B2B Enterprise Quote Funnel) */}
      <section className="product-funnel-hero">
        {/* Purple Enterprise Orb */}
        <div style={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.25) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div className="container">
          <div className="funnel-hero-grid">
            
            {/* Left Column: Value Prop & Trust Elements */}
            <div className="funnel-hero-intro">
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(139, 92, 246, 0.2)',
                border: '1px solid rgba(139, 92, 246, 0.4)',
                padding: '6px 14px',
                borderRadius: '9999px',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: '#c4b5fd',
                marginBottom: '1.25rem'
              }}>
                <Sparkles size={15} /> Comprehensive Enterprise & SME Risk Solutions
              </div>

              <h1 style={{
                fontSize: 'clamp(1.85rem, 3.5vw, 2.75rem)',
                fontWeight: 800,
                lineHeight: 1.2,
                margin: '0 0 1rem 0',
                color: '#ffffff'
              }}>
                Corporate & SME Insurance <br />
                <span style={{ color: '#c4b5fd' }}>Custom Tailored B2B Policies</span>
              </h1>

              <p style={{
                fontSize: '0.98rem',
                color: '#cbd5e1',
                lineHeight: 1.6,
                maxWidth: '520px',
                margin: '0 0 1.75rem 0'
              }}>
                Equip your startup or established enterprise with Group Medical Insurance (GMC), Group Term Life (GTL), Factory Fire & Asset Protection, and Marine Transit Liability.
              </p>

              {/* B2B Trust Grid & Underwriters below form on mobile */}
              <div className="funnel-hero-trust-col">
                <div className="funnel-trust-grid">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.06)', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <Users size={22} color="#c4b5fd" />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>Group Health (GMC)</div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Maternity & OPD Add-ons</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.06)', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <Flame size={22} color="#f87171" />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>Factory & Fire Shield</div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Machinery & Stock cover</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.06)', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <Ship size={22} color="#60a5fa" />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>Marine Cargo Cover</div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Inland & Export transit</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.06)', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <ShieldCheck size={22} color="#34d399" />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>D&O / Cyber Liability</div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Protect Board & Assets</div>
                    </div>
                  </div>
                </div>

                {/* Insurers Strip */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#94a3b8', fontSize: '0.8rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
                  <span>Institutional Underwriters:</span>
                  <span style={{ color: '#ffffff', fontWeight: 700 }}>ICICI Lombard • HDFC ERGO • New India • TATA AIG</span>
                </div>
              </div>
            </div>

            {/* Right Column: High-Conversion B2B RFP Proposal Form */}
            <div className="funnel-hero-card-col">
              <div className="funnel-card-container">
                
                {submitted ? (
                  <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                    <div style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      background: '#ecfdf5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 1.25rem',
                      color: '#059669'
                    }}>
                      <CheckCircle2 size={36} />
                    </div>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: '#0f2b48' }}>
                      Corporate Proposal Initiated!
                    </h3>
                    <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.5, margin: '0 0 1.5rem 0' }}>
                      Thank you <strong>{formData.fullName}</strong>. Our Corporate Risk Underwriter is structuring custom institutional quote comparisons for <strong>{formData.companyName}</strong>.
                    </p>
                    <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.85rem', color: '#8b5cf6', fontWeight: 700 }}>
                      📞 Corporate account executive will reach out to {formData.workEmail}
                    </div>
                    <button
                      onClick={() => setSubmitted(false)}
                      style={{
                        marginTop: '1.5rem',
                        background: '#0f2b48',
                        color: '#ffffff',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '10px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Request Another B2B Quote
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    
                    {/* Business Line Tabs */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', marginBottom: '1.25rem' }}>
                      {[
                        { id: 'gmc', label: 'Group Health (GMC)', icon: <Users size={16} /> },
                        { id: 'fire', label: 'Factory & Fire', icon: <Flame size={16} /> },
                        { id: 'marine', label: 'Marine / Cargo', icon: <Ship size={16} /> },
                        { id: 'cyber', label: 'Cyber / D&O', icon: <ShieldCheck size={16} /> }
                      ].map((t) => (
                        <button
                          type="button"
                          key={t.id}
                          onClick={() => setBusinessType(t.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            padding: '9px 6px',
                            borderRadius: '10px',
                            border: `1.5px solid ${businessType === t.id ? '#8b5cf6' : '#e2e8f0'}`,
                            background: businessType === t.id ? '#f5f3ff' : '#ffffff',
                            color: businessType === t.id ? '#7c3aed' : '#64748b',
                            fontWeight: businessType === t.id ? 800 : 600,
                            fontSize: '0.82rem',
                            cursor: 'pointer'
                          }}
                        >
                          {t.icon} {t.label}
                        </button>
                      ))}
                    </div>

                    {/* Step A: Company Name, Team Size & Industry */}
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                        Company / Business Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Acme Technologies Pvt Ltd"
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: '1.5px solid #cbd5e1',
                          fontSize: '0.88rem',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <div className="funnel-responsive-grid-2" style={{ marginBottom: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                          Employee / Asset Range
                        </label>
                        <select
                          value={employeeCount}
                          onChange={(e) => setEmployeeCount(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '9px 10px',
                            borderRadius: '8px',
                            border: '1.5px solid #cbd5e1',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            color: '#0f2b48',
                            background: '#f8fafc'
                          }}
                        >
                          <option value="5-20">5 - 20 Members</option>
                          <option value="21-50">21 - 50 Members</option>
                          <option value="51-150">51 - 150 Members</option>
                          <option value="150+">150+ (Enterprise)</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                          Industry Sector
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. IT, Manufacturing"
                          value={formData.industry}
                          onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '9px 10px',
                            borderRadius: '8px',
                            border: '1.5px solid #cbd5e1',
                            fontSize: '0.85rem',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                    </div>

                    {/* Step B: Contact Person */}
                    <div className="funnel-responsive-grid-2" style={{ marginBottom: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                          Contact Person *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. HR Manager / CFO"
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '9px 10px',
                            borderRadius: '8px',
                            border: '1.5px solid #cbd5e1',
                            fontSize: '0.85rem',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                          Corporate Work Email *
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="name@company.com"
                          value={formData.workEmail}
                          onChange={(e) => setFormData({ ...formData, workEmail: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '9px 10px',
                            borderRadius: '8px',
                            border: '1.5px solid #cbd5e1',
                            fontSize: '0.85rem',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ marginBottom: '1.25rem' }}>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                        Mobile Phone Number *
                      </label>
                      <div className="funnel-phone-input-group">
                        <div className="funnel-phone-prefix">
                          <span>🇮🇳</span>
                          <span>+91</span>
                        </div>
                        <input
                          type="tel"
                          required
                          placeholder="10-digit mobile number"
                          value={formData.phoneNumber}
                          onChange={(e) => {
                            let digits = e.target.value.replace(/[^0-9]/g, '');
                            if (digits.startsWith('91') && digits.length > 10) digits = digits.slice(2);
                            if (digits.startsWith('0')) digits = digits.slice(1);
                            digits = digits.slice(0, 10);
                            setFormData({ ...formData, phoneNumber: digits });
                          }}
                          className="funnel-phone-input"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        width: '100%',
                        background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                        color: '#ffffff',
                        border: 'none',
                        padding: '12px 18px',
                        borderRadius: '10px',
                        fontSize: '1rem',
                        fontWeight: 800,
                        cursor: loading ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 14px rgba(124, 58, 237, 0.3)',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {loading ? 'Structuring B2B Proposal...' : (
                        <>
                          Request Institutional Quote <ArrowRight size={18} />
                        </>
                      )}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '0.75rem', fontSize: '0.72rem', color: '#64748b' }}>
                      💼 Certified Corporate Risk Advisory with custom SLA guarantees.
                    </div>
                  </form>
                )}

              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
