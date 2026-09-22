import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  RefreshCw, 
  ArrowRightLeft, 
  ShieldCheck, 
  CheckCircle2, 
  Send, 
  AlertTriangle,
  Clock,
  Sparkles,
  Award,
  ArrowRight,
  Percent,
  FileCheck
} from 'lucide-react';
import { portalService } from '../services/api';

export default function RenewalPort() {
  const [searchParams, setSearchParams] = useSearchParams();
  const actionParam = searchParams.get('action');
  const typeParam = searchParams.get('type');

  const [activeTab, setActiveTab] = useState(actionParam === 'port' ? 'port' : 'renew');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    currentInsurer: '',
    policyNumber: '',
    expiryDate: '',
    policyType: 'Health Insurance'
  });

  useEffect(() => {
    if (actionParam) {
      setActiveTab(actionParam === 'port' ? 'port' : 'renew');
    }
    if (typeParam) {
      const typeMap = {
        health: 'Health Insurance',
        motor: 'Motor / Car Insurance',
        car: 'Motor / Car Insurance',
        two_wheeler: 'Two Wheeler Insurance',
        life: 'Term Life Insurance',
        commercial: 'Commercial / Fire Insurance'
      };
      if (typeMap[typeParam]) {
        setFormData(prev => ({ ...prev, policyType: typeMap[typeParam] }));
      }
    }
  }, [actionParam, typeParam]);

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setSearchParams({ action: tab, type: typeParam || 'health' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await portalService.submitQuote({
        categorySlug: activeTab === 'port' ? 'policy-porting' : 'policy-renewal',
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        city: formData.currentInsurer,
        planDetails: JSON.stringify({
          action: activeTab,
          policyType: formData.policyType,
          currentInsurer: formData.currentInsurer,
          policyNumber: formData.policyNumber,
          expiryDate: formData.expiryDate
        })
      });
      setSubmitted(true);
    } catch (err) {
      alert('Error submitting request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', color: '#0f2b48' }}>
      
      {/* 1. HERO SECTION (Split Hero Banner matching Health / Motor standard) */}
      <section className="product-funnel-hero">
        {/* Subtle Green/Emerald Orb */}
        <div style={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div className="container">
          <div className="funnel-hero-grid">
            
            {/* Left Column: Value Prop & Continuity Guarantees */}
            <div className="funnel-hero-intro">
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(16, 185, 129, 0.2)',
                border: '1px solid rgba(52, 211, 153, 0.4)',
                padding: '6px 14px',
                borderRadius: '9999px',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: '#34d399',
                marginBottom: '1.25rem'
              }}>
                <Sparkles size={15} /> 100% Policy Continuity & No Claim Bonus Protection
              </div>

              <h1 style={{
                fontSize: 'clamp(1.85rem, 3.5vw, 2.75rem)',
                fontWeight: 800,
                lineHeight: 1.2,
                margin: '0 0 1rem 0',
                color: '#ffffff'
              }}>
                Renew or Port Policy <br />
                <span style={{ color: '#34d399' }}>Zero Loss of Waiting Periods</span>
              </h1>

              <p style={{
                fontSize: '0.98rem',
                color: '#cbd5e1',
                lineHeight: 1.6,
                maxWidth: '520px',
                margin: '0 0 1.75rem 0'
              }}>
                Never let your insurance coverage lapse. Renew instantly across all major insurers, or port your policy seamlessly to Aadhiraksha with 100% accumulated pre-existing waiting period retention.
              </p>

              {/* Trust Badges & Underwriters below form on mobile */}
              <div className="funnel-hero-trust-col">
                <div className="funnel-trust-grid">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.06)', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <ShieldCheck size={22} color="#34d399" />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>Full Continuity</div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Transfer waiting period credit</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.06)', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <Percent size={22} color="#fbbf24" />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>Up to 50% NCB Transfer</div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Retain motor & health bonus</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.06)', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <Clock size={22} color="#60a5fa" />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>Instant Renewal</div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Digital copy in 2 minutes</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.06)', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <FileCheck size={22} color="#a78bfa" />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>Zero Paperwork</div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Direct insurer verification</div>
                    </div>
                  </div>
                </div>

                {/* Insurers Strip */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#94a3b8', fontSize: '0.8rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
                  <span>Empanelled Insurers:</span>
                  <span style={{ color: '#ffffff', fontWeight: 700 }}>Star Health • Care • HDFC ERGO • ICICI Lombard • TATA AIG • Niva Bupa</span>
                </div>
              </div>
            </div>

            {/* Right Column: High-Conversion Lead Card */}
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
                      {activeTab === 'renew' ? 'Renewal Request Registered!' : 'Porting Request Initiated!'}
                    </h3>
                    <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.5, margin: '0 0 1.5rem 0' }}>
                      Thank you <strong>{formData.fullName}</strong>. Our policy operations executive will verify your <strong>{formData.currentInsurer}</strong> policy and contact you at <strong>{formData.phoneNumber}</strong>.
                    </p>
                    <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.85rem', color: '#059669', fontWeight: 700 }}>
                      📋 Policy continuity reference created for {formData.policyType}
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
                      Submit Another Policy
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    
                    {/* Action Tabs */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1.25rem' }}>
                      <button
                        type="button"
                        onClick={() => handleTabSwitch('renew')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          padding: '10px 8px',
                          borderRadius: '10px',
                          border: `1.5px solid ${activeTab === 'renew' ? '#059669' : '#e2e8f0'}`,
                          background: activeTab === 'renew' ? '#ecfdf5' : '#ffffff',
                          color: activeTab === 'renew' ? '#059669' : '#64748b',
                          fontWeight: activeTab === 'renew' ? 800 : 600,
                          fontSize: '0.85rem',
                          cursor: 'pointer'
                        }}
                      >
                        <RefreshCw size={16} /> Instant Renewal
                      </button>

                      <button
                        type="button"
                        onClick={() => handleTabSwitch('port')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          padding: '10px 8px',
                          borderRadius: '10px',
                          border: `1.5px solid ${activeTab === 'port' ? '#059669' : '#e2e8f0'}`,
                          background: activeTab === 'port' ? '#ecfdf5' : '#ffffff',
                          color: activeTab === 'port' ? '#059669' : '#64748b',
                          fontWeight: activeTab === 'port' ? 800 : 600,
                          fontSize: '0.85rem',
                          cursor: 'pointer'
                        }}
                      >
                        <ArrowRightLeft size={16} /> Port Policy
                      </button>
                    </div>

                    {activeTab === 'port' && (
                      <div style={{
                        background: '#fffbeb',
                        border: '1px solid #fde68a',
                        padding: '0.75rem 0.85rem',
                        borderRadius: '10px',
                        marginBottom: '1rem',
                        display: 'flex',
                        gap: '0.5rem',
                        fontSize: '0.78rem',
                        color: '#92400e',
                        lineHeight: 1.4
                      }}>
                        <AlertTriangle size={18} style={{ flexShrink: 0, color: '#d97706' }} />
                        <div>
                          <strong>IRDAI Porting Guidelines:</strong> Health policy porting requests should be initiated at least 45 days prior to expiry to retain full waiting period credits.
                        </div>
                      </div>
                    )}

                    {/* Step A: Personal Contact */}
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                        Full Name (as on existing policy) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ramesh Chandra"
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

                    <div className="funnel-responsive-grid-2" style={{ marginBottom: '1rem' }}>
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

                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                          Email Address
                        </label>
                        <input
                          type="email"
                          placeholder="name@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                    </div>

                    {/* Step B: Policy Details */}
                    <div className="funnel-responsive-grid-2" style={{ marginBottom: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                          Policy Category *
                        </label>
                        <select
                          value={formData.policyType}
                          onChange={(e) => setFormData({ ...formData, policyType: e.target.value })}
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
                          <option value="Health Insurance">Health Insurance</option>
                          <option value="Motor / Car Insurance">Motor / Car Insurance</option>
                          <option value="Two Wheeler Insurance">Two Wheeler Insurance</option>
                          <option value="Term Life Insurance">Term Life Insurance</option>
                          <option value="Commercial / Fire Insurance">Commercial / Fire Insurance</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                          Current Insurer *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Star Health, HDFC ERGO"
                          value={formData.currentInsurer}
                          onChange={(e) => setFormData({ ...formData, currentInsurer: e.target.value })}
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
                          Existing Policy Number
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. POL-98231024"
                          value={formData.policyNumber}
                          onChange={(e) => setFormData({ ...formData, policyNumber: e.target.value })}
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
                          Expiry / Due Date
                        </label>
                        <input
                          type="date"
                          value={formData.expiryDate}
                          onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
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
                        background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
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
                        boxShadow: '0 4px 14px rgba(5, 150, 105, 0.3)',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {loading ? 'Processing...' : (
                        <>
                          {activeTab === 'renew' ? 'Request Instant Renewal Quote' : 'Initiate Porting Verification'} <ArrowRight size={18} />
                        </>
                      )}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '0.75rem', fontSize: '0.72rem', color: '#64748b' }}>
                      🔒 Direct insurer verification with zero loss of accumulated benefits.
                    </div>
                  </form>
                )}

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. WHY RENEW & PORT WITH AADHIRAKSHA */}
      <section style={{ padding: '4rem 0', background: '#ffffff' }}>
        <div className="container">
          
          <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 3rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: '#059669', letterSpacing: '1px' }}>
              Seamless Continuity
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f2b48', margin: '0.5rem 0' }}>
              Why Renew or Port with Aadhiraksha?
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.98rem' }}>
              We protect your hard-earned waiting period credits and secure the highest loyalty renewal discounts.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem'
          }}>
            {[
              {
                title: 'Waiting Period Continuity Protection',
                desc: 'When porting health insurance, all waiting periods served with your existing insurer for pre-existing diseases are carried forward 100%.',
                icon: <ShieldCheck size={26} color="#059669" />
              },
              {
                title: 'No Claim Bonus (NCB) Retention',
                desc: 'Retain up to 50% earned NCB discounts on your motor and health policies when transferring between providers.',
                icon: <Percent size={26} color="#d97706" />
              },
              {
                title: 'Single-Window Escalation Support',
                desc: 'Avoid call center hold queues. Our dedicated policy retention desk directly coordinates renewals and porting with underwriting teams.',
                icon: <Award size={26} color="#0284c7" />
              },
              {
                title: 'Grace Period Renewal Reminders',
                desc: 'Receive automated multi-channel WhatsApp and SMS alerts well ahead of expiry to ensure zero lapse in critical coverage.',
                icon: <Clock size={26} color="#8b5cf6" />
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
