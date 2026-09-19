import React, { useState } from 'react';
import { 
  Award, 
  TrendingUp, 
  DollarSign, 
  CheckCircle2, 
  Send, 
  ShieldCheck, 
  Sparkles,
  ArrowRight,
  BookOpen,
  Briefcase,
  Users,
  Smartphone
} from 'lucide-react';
import { portalService } from '../services/api';

export default function BecomePOSP() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    panNumber: '',
    aadhaarNumber: '',
    city: '',
    state: '',
    experienceYears: 1,
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await portalService.applyPOSP(formData);
      setSubmitted(true);
    } catch (err) {
      alert('Error submitting application. Please verify details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', color: '#0f2b48' }}>
      
      {/* 1. HERO SECTION (Executive Agent Onboarding Banner + Structured Form) */}
      <section className="product-funnel-hero" style={{ background: 'linear-gradient(135deg, #071728 0%, #1e1b4b 100%)' }}>
        {/* Indigo / Purple Glow Orb */}
        <div style={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div className="container">
          <div className="funnel-hero-grid">
            
            {/* Left Column: POSP Career Value Prop */}
            <div className="funnel-hero-intro">
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(99, 102, 241, 0.2)',
                border: '1px solid rgba(129, 140, 248, 0.4)',
                padding: '6px 14px',
                borderRadius: '9999px',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: '#a5b4fc',
                marginBottom: '1.25rem'
              }}>
                <Sparkles size={15} /> IRDAI Certified POSP Agent Partner Program
              </div>

              <h1 style={{
                fontSize: 'clamp(1.85rem, 3.5vw, 2.75rem)',
                fontWeight: 800,
                lineHeight: 1.2,
                margin: '0 0 1rem 0',
                color: '#ffffff'
              }}>
                Become a Certified POSP <br />
                <span style={{ color: '#a5b4fc' }}>Earn Up to ₹1,00,000+/Month*</span>
              </h1>

              <p style={{
                fontSize: '0.98rem',
                color: '#cbd5e1',
                lineHeight: 1.6,
                maxWidth: '520px',
                margin: '0 0 1.75rem 0'
              }}>
                Join Aadhiraksha Insurance as a licensed Point of Sales Person (POSP). Sell Health, Life, Motor, and Commercial policies from 30+ top insurers with instant digital quotation and highest recurring renewal commissions.
              </p>

              {/* Trust Badges & Underwriters below form on mobile */}
              <div className="funnel-hero-trust-col">
                <div className="funnel-trust-grid">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.06)', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <DollarSign size={22} color="#fbbf24" />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>Highest Payouts</div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Bi-weekly commission payouts</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.06)', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <BookOpen size={22} color="#34d399" />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>15-Hr Online Training</div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>IRDAI compliant module</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.06)', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <Smartphone size={22} color="#60a5fa" />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>Digital Agent CRM</div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Instant quotes & policy issuance</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.06)', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <Award size={22} color="#c084fc" />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>Zero Investment</div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>100% free registration</div>
                    </div>
                  </div>
                </div>

                {/* Insurers Strip */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#94a3b8', fontSize: '0.8rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
                  <span>Sell Policies From:</span>
                  <span style={{ color: '#ffffff', fontWeight: 700 }}>HDFC ERGO • TATA AIG • Star Health • ICICI Lombard • Bajaj Allianz • LIC</span>
                </div>
              </div>
            </div>

            {/* Right Column: POSP Registration Lead Card */}
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
                      Application Submitted!
                    </h3>
                    <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.5, margin: '0 0 1.5rem 0' }}>
                      Thank you <strong>{formData.fullName}</strong>. Our POSP onboarding team has received your details and will verify your PAN (<strong>{formData.panNumber}</strong>) to activate training credentials.
                    </p>
                    <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.85rem', color: '#4f46e5', fontWeight: 700 }}>
                      📱 Login details & training LMS link will be sent to {formData.email}
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
                      Register Another Agent
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    
                    <div style={{ marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f2b48', margin: '0 0 0.25rem 0' }}>
                        POSP Partner Registration
                      </h3>
                      <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                        Enter your KYC details to access our digital agent portal.
                      </p>
                    </div>

                    <div className="funnel-responsive-grid-2" style={{ marginBottom: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                          Full Name (as per PAN) *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Suresh Reddy"
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
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="name@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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

                    <div className="funnel-responsive-grid-2" style={{ marginBottom: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                          Mobile Number *
                        </label>
                        <input
                          type="tel"
                          required
                          pattern="[0-9]{10}"
                          placeholder="10-digit mobile"
                          value={formData.phoneNumber}
                          onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
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
                          PAN Card Number *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. ABCDE1234F"
                          value={formData.panNumber}
                          onChange={(e) => setFormData({ ...formData, panNumber: e.target.value.toUpperCase() })}
                          style={{
                            width: '100%',
                            padding: '9px 10px',
                            borderRadius: '8px',
                            border: '1.5px solid #cbd5e1',
                            fontSize: '0.85rem',
                            textTransform: 'uppercase',
                            fontWeight: 700,
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                    </div>

                    <div className="funnel-responsive-grid-2" style={{ marginBottom: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                          City *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Hyderabad"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
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
                          State *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Telangana"
                          value={formData.state}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
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

                    <div className="funnel-responsive-grid-2" style={{ marginBottom: '1.25rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                          Sales Experience (Years)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="40"
                          value={formData.experienceYears}
                          onChange={(e) => setFormData({ ...formData, experienceYears: parseInt(e.target.value) || 0 })}
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
                          Create Portal Password *
                        </label>
                        <input
                          type="password"
                          required
                          placeholder="Min 6 chars"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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

                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        width: '100%',
                        background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
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
                        boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {loading ? 'Submitting Application...' : (
                        <>
                          <Send size={18} /> Apply for POSP Certification <ArrowRight size={18} />
                        </>
                      )}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '0.75rem', fontSize: '0.72rem', color: '#64748b' }}>
                      🎓 Free IRDAI certification training provided upon document verification.
                    </div>
                  </form>
                )}

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. THREE-STEP AGENT ONBOARDING JOURNEY */}
      <section style={{ padding: '4rem 0', background: '#ffffff' }}>
        <div className="container">
          
          <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 3rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: '#4f46e5', letterSpacing: '1px' }}>
              Simple 3-Step Journey
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f2b48', margin: '0.5rem 0' }}>
              How to Become an Aadhiraksha POSP Agent
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.98rem' }}>
              Start issuing policies and earning commission in less than 48 hours.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem'
          }}>
            {[
              {
                step: '01',
                title: 'Online KYC Registration',
                desc: 'Fill in your basic information and submit your PAN and Aadhaar details for instant digital validation.',
                icon: <Briefcase size={26} color="#4f46e5" />
              },
              {
                step: '02',
                title: '15-Hour Digital Certification',
                desc: 'Complete the IRDAI-mandated online video modules and clear the basic multiple-choice assessment.',
                icon: <BookOpen size={26} color="#059669" />
              },
              {
                step: '03',
                title: 'Start Selling & Earning',
                desc: 'Access your dedicated agent dashboard. Compare plans from 30+ insurers, issue instant policies, and receive timely payouts.',
                icon: <TrendingUp size={26} color="#d97706" />
              }
            ].map((item, idx) => (
              <div
                key={idx}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '1.75rem',
                  position: 'relative'
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: '1.25rem',
                  right: '1.25rem',
                  fontSize: '1.2rem',
                  fontWeight: 900,
                  color: '#cbd5e1'
                }}>
                  {item.step}
                </div>

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
