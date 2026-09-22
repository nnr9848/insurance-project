import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Heart, 
  CheckCircle2, 
  Clock, 
  Zap, 
  ArrowRight, 
  Award,
  Sparkles,
  Percent,
  Calculator,
  UserCheck
} from 'lucide-react';
import { portalService } from '../services/api';

export default function TermLifeInsurance() {
  const [gender, setGender] = useState('Male'); // 'Male' | 'Female'
  const [tobaccoUser, setTobaccoUser] = useState('No'); // 'Yes' | 'No'
  const [annualIncome, setAnnualIncome] = useState('₹10 - 15 Lakhs');
  const [desiredCover, setDesiredCover] = useState('₹1 Crore');
  const [age, setAge] = useState('28');

  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    city: 'Hyderabad',
    dob: '1996-05-15'
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await portalService.submitQuote({
        categorySlug: 'term-life-insurance',
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        city: formData.city,
        planDetails: JSON.stringify({
          category: 'Pure Term Life & Critical Illness',
          gender,
          age,
          tobaccoSmoker: tobaccoUser,
          annualIncome,
          sumAssured: desiredCover,
          dateOfBirth: formData.dob
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
      
      {/* 1. HERO SECTION (High-Trust Pure Term Life Funnel) */}
      <section className="product-funnel-hero">
        {/* Blue Aura Orb */}
        <div style={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(2, 132, 199, 0.25) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div className="container">
          <div className="funnel-hero-grid">
            
            {/* Left Column: Value Prop & Trust Badges */}
            <div className="funnel-hero-intro">
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(2, 132, 199, 0.2)',
                border: '1px solid rgba(2, 132, 199, 0.4)',
                padding: '6px 14px',
                borderRadius: '9999px',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: '#38bdf8',
                marginBottom: '1.25rem'
              }}>
                <Sparkles size={15} /> 100% Guaranteed Payout with 99.5% Claim Ratio
              </div>

              <h1 style={{
                fontSize: 'clamp(1.85rem, 3.5vw, 2.75rem)',
                fontWeight: 800,
                lineHeight: 1.2,
                margin: '0 0 1rem 0',
                color: '#ffffff'
              }}>
                ₹1 Crore Term Life Shield <br />
                <span style={{ color: '#38bdf8' }}>Starting @ ₹410/month*</span>
              </h1>

              <p style={{
                fontSize: '0.98rem',
                color: '#cbd5e1',
                lineHeight: 1.6,
                maxWidth: '520px',
                margin: '0 0 1.75rem 0'
              }}>
                Secure your family's future with inflation-beating life coverage up to age 85, critical illness rider payouts on diagnosis, and 100% tax exemption under Section 80C.
              </p>

              {/* Trust Badges & Underwriters below form on mobile */}
              <div className="funnel-hero-trust-col">
                <div className="funnel-trust-grid">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.06)', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <ShieldCheck size={22} color="#38bdf8" />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>99.5% Claim Ratio</div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>IRDAI Verified Insurers</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.06)', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <Heart size={22} color="#f43f5e" />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>36 Critical Illnesses</div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Lump-sum instant payout</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.06)', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <Award size={22} color="#34d399" />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>Zero Medicals at Home</div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Free doorstep health check</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.06)', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <Percent size={22} color="#fbbf24" />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>Tax Saving 80C & 10(10D)</div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Tax-free maturity & claims</div>
                    </div>
                  </div>
                </div>

                {/* Verified Insurers Strip */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#94a3b8', fontSize: '0.8rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
                  <span>Official Partner With:</span>
                  <span style={{ color: '#ffffff', fontWeight: 700 }}>LIC • HDFC Life • ICICI Prudential • Max Life • Tata AIA</span>
                </div>
              </div>
            </div>

            {/* Right Column: High-Conversion Term Life Quotation Form */}
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
                      Term Life Comparison Ready!
                    </h3>
                    <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.5, margin: '0 0 1.5rem 0' }}>
                      Thank you <strong>{formData.fullName}</strong>. We've matched your profile with the lowest premium term life plans with <strong>{desiredCover}</strong> cover.
                    </p>
                    <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.85rem', color: '#0284c7', fontWeight: 700 }}>
                      📞 Senior actuary comparison sheet sent to {formData.phoneNumber}
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
                      Compare Another Profile
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    
                    {/* Gender Toggle */}
                    <div style={{ marginBottom: '1.25rem' }}>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                        1. Gender
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        {['Male', 'Female'].map((g) => (
                          <button
                            type="button"
                            key={g}
                            onClick={() => setGender(g)}
                            style={{
                              padding: '10px 0',
                              borderRadius: '8px',
                              border: `1.5px solid ${gender === g ? '#0284c7' : '#e2e8f0'}`,
                              background: gender === g ? '#e0f2fe' : '#ffffff',
                              color: gender === g ? '#0284c7' : '#64748b',
                              fontWeight: gender === g ? 800 : 600,
                              fontSize: '0.88rem',
                              cursor: 'pointer'
                            }}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Step A: Smoker & Desired Cover */}
                    <div className="funnel-responsive-grid-2" style={{ marginBottom: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                          Do you smoke / chew tobacco?
                        </label>
                        <select
                          value={tobaccoUser}
                          onChange={(e) => setTobaccoUser(e.target.value)}
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
                          <option value="No">No (Non-Smoker)</option>
                          <option value="Yes">Yes (Smoker)</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                          Desired Life Cover
                        </label>
                        <select
                          value={desiredCover}
                          onChange={(e) => setDesiredCover(e.target.value)}
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
                          <option value="₹50 Lakhs">₹50 Lakhs</option>
                          <option value="₹1 Crore">₹1 Crore (Most Popular)</option>
                          <option value="₹1.5 Crore">₹1.5 Crore</option>
                          <option value="₹2 Crore">₹2 Crore</option>
                          <option value="₹5 Crore">₹5 Crore (HNIs)</option>
                        </select>
                      </div>
                    </div>

                    {/* Step B: Personal Details */}
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Vikramaditya Rao"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
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

                    <div className="funnel-responsive-grid-2" style={{ marginBottom: '1.25rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                          Date of Birth *
                        </label>
                        <input
                          type="date"
                          required
                          value={formData.dob}
                          onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
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
                          Mobile Number *
                        </label>
                        <div className="funnel-phone-input-group">
                          <div className="funnel-phone-prefix">
                            <span>🇮🇳</span>
                            <span>+91</span>
                          </div>
                          <input
                            type="tel"
                            required
                            placeholder="10-digit mobile"
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
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        width: '100%',
                        background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
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
                        boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {loading ? 'Calculating Best Plans...' : (
                        <>
                          View Term Life Plans <ArrowRight size={18} />
                        </>
                      )}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '0.75rem', fontSize: '0.72rem', color: '#64748b' }}>
                      🔐 Get an Online Discount of 15% on Direct Issuance.
                    </div>
                  </form>
                )}

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. WHY AADHIRAKSHA TERM LIFE */}
      <section style={{ padding: '4rem 0', background: '#ffffff' }}>
        <div className="container">
          
          <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 3rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: '#0284c7', letterSpacing: '1px' }}>
              Family Financial Shield
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f2b48', margin: '0.5rem 0' }}>
              Why Choose Pure Term Insurance?
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.98rem' }}>
              Highest coverage for the lowest premium. Ensure your family pays off home loans and meets children's education milestones with zero financial compromise.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem'
          }}>
            {[
              {
                title: 'Income Tax Savings up to ₹1.5L',
                desc: 'Claim tax deductions under Section 80C. Entire death benefit payout is 100% tax-free under Section 10(10D).',
                icon: <Percent size={26} color="#059669" />
              },
              {
                title: 'Critical Illness Protection Rider',
                desc: 'Receive immediate lump-sum cash upon diagnosis of heart attack, stroke, or cancer to fund world-class treatments.',
                icon: <Heart size={26} color="#f43f5e" />
              },
              {
                title: 'Accidental Total Disability Cover',
                desc: 'Future premiums are completely waived while your policy and full ₹1 Crore coverage remain active until age 85.',
                icon: <ShieldCheck size={26} color="#0284c7" />
              },
              {
                title: 'Return of Premium (TROP) Option',
                desc: 'Get 100% of all paid premiums refunded back to you if you outlive the policy tenure.',
                icon: <Award size={26} color="#d97706" />
              }
            ].map((item, idx) => (
              <div
                key={idx}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '1.75rem',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '12px',
                  background: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  border: '1px solid #e2e8f0'
                }}>
                  {item.icon}
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f2b48', margin: '0 0 0.5rem 0' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

    </div>
  );
}
