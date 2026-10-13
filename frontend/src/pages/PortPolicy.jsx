import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  ArrowRightLeft, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Award, 
  ArrowRight, 
  Percent, 
  FileCheck,
  Check,
  Info
} from 'lucide-react';
import { portalService } from '../services/api';

export default function PortPolicy() {
  const [searchParams] = useSearchParams();
  const typeParam = searchParams.get('type');

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showLifeAdvisory, setShowLifeAdvisory] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    currentInsurer: '',
    policyNumber: '',
    expiryDate: '',
    policyType: 'Health Insurance',
    existingSumInsured: '₹5,00,000',
    waitingPeriodServedYears: '2+ Years',
    claimsMadeInPastYear: 'No'
  });

  useEffect(() => {
    if (typeParam) {
      if (typeParam === 'life' || typeParam === 'term') {
        setShowLifeAdvisory(true);
      } else {
        setShowLifeAdvisory(false);
        const typeMap = {
          health: 'Health Insurance',
          motor: 'Motor / Car Insurance',
          car: 'Motor / Car Insurance',
          two_wheeler: 'Two Wheeler Insurance',
          commercial: 'Commercial / Fire Insurance'
        };
        if (typeMap[typeParam]) {
          setFormData(prev => ({ ...prev, policyType: typeMap[typeParam] }));
        }
      }
    }
  }, [typeParam]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await portalService.submitQuote({
        categorySlug: 'policy-porting',
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        city: formData.currentInsurer,
        planDetails: JSON.stringify({
          action: 'port',
          policyType: formData.policyType,
          currentInsurer: formData.currentInsurer,
          policyNumber: formData.policyNumber,
          expiryDate: formData.expiryDate,
          existingSumInsured: formData.existingSumInsured,
          waitingPeriodServedYears: formData.waitingPeriodServedYears,
          claimsMadeInPastYear: formData.claimsMadeInPastYear
        })
      });
      setSubmitted(true);
    } catch (err) {
      alert('Error submitting porting request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', color: '#0f2b48' }}>
      
      {/* 1. HERO SECTION (Dedicated Policy Porting & Insurer Switch Funnel) */}
      <section className="product-funnel-hero" style={{ background: 'linear-gradient(135deg, #071728 0%, #1e1b4b 100%)' }}>
        {/* Purple / Violet Orb */}
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
            
            {/* Left Column: Porting Value Prop & IRDAI Legal Protection */}
            <div className="funnel-hero-intro">
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(139, 92, 246, 0.2)',
                border: '1px solid rgba(167, 139, 250, 0.4)',
                padding: '6px 14px',
                borderRadius: '9999px',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: '#c4b5fd',
                marginBottom: '1.25rem'
              }}>
                <Sparkles size={15} /> IRDAI Portability Protection • 100% Waiting Period Retention
              </div>

              <h1 style={{
                fontSize: 'clamp(1.85rem, 3.5vw, 2.75rem)',
                fontWeight: 800,
                lineHeight: 1.2,
                margin: '0 0 1rem 0',
                color: '#ffffff'
              }}>
                Port Your Policy to Us <br />
                <span style={{ color: '#c4b5fd' }}>Keep All Waiting Period Credits</span>
              </h1>

              <p style={{
                fontSize: '0.98rem',
                color: '#cbd5e1',
                lineHeight: 1.6,
                maxWidth: '520px',
                margin: '0 0 1.75rem 0'
              }}>
                Unhappy with your current insurer’s claim settlement, premium hikes, or service? Switch your health or motor policy to Aadhiraksha with zero loss of pre-existing disease waiting periods and full bonus transfer.
              </p>

              {/* Porting Rights Checklist */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                marginBottom: '1.75rem',
                maxWidth: '520px'
              }}>
                {[
                  '100% Pre-Existing Disease (PED) waiting credit carried forward',
                  'Retain Cumulative Bonus (CB) and No Claim Bonus (NCB)',
                  'Upgrade to superior cashless network across 14,000+ top hospitals',
                  'Dedicated personal claims concierge assigned for life'
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#e2e8f0', fontSize: '0.88rem' }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: 'rgba(167, 139, 250, 0.25)',
                      border: '1px solid #a78bfa',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      color: '#c4b5fd'
                    }}>
                      <Check size={12} strokeWidth={3} />
                    </div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#94a3b8', fontSize: '0.8rem', flexWrap: 'wrap' }}>
                <span>Port From Any Provider:</span>
                <span style={{ color: '#ffffff', fontWeight: 700 }}>Star Health • Care • HDFC ERGO • Niva Bupa • ICICI Lombard • ManipalCigna</span>
              </div>
            </div>

            {/* Right Column: Porting Form Card */}
            <div className="funnel-hero-card-col">
              <div className="funnel-card-container">
                
                {submitted ? (
                  <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                    <div style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      background: '#f5f3ff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 1.25rem',
                      color: '#7c3aed'
                    }}>
                      <CheckCircle2 size={36} />
                    </div>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: '#0f2b48' }}>
                      Porting Request Initiated!
                    </h3>
                    <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.5, margin: '0 0 1.5rem 0' }}>
                      Thank you <strong>{formData.fullName}</strong>. Our senior policy portability consultant will review your <strong>{formData.currentInsurer}</strong> policy and initiate the statutory porting paperwork with zero break in continuity.
                    </p>
                    <div style={{ background: '#f5f3ff', padding: '1rem', borderRadius: '12px', border: '1px solid #ddd6fe', fontSize: '0.85rem', color: '#6d28d9', fontWeight: 700 }}>
                      ⚡ Priority Porting Dossier created for {formData.policyType}
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
                      Port Another Policy
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      background: '#f5f3ff',
                      border: '1.5px solid #ddd6fe',
                      color: '#7c3aed',
                      fontWeight: 800,
                      fontSize: '0.9rem',
                      marginBottom: '1rem'
                    }}>
                      <ArrowRightLeft size={18} /> Policy Porting Desk (Insurer Switch)
                    </div>

                    {/* Life Insurance Regulatory Notice when navigated via life/term parameter */}
                    {showLifeAdvisory && (
                      <div style={{
                        background: '#eff6ff',
                        border: '1.5px solid #bfdbfe',
                        padding: '0.85rem 1rem',
                        borderRadius: '10px',
                        marginBottom: '1.25rem',
                        display: 'flex',
                        gap: '0.65rem',
                        fontSize: '0.82rem',
                        color: '#1e40af',
                        lineHeight: 1.45
                      }}>
                        <Info size={20} style={{ flexShrink: 0, color: '#2563eb', marginTop: '2px' }} />
                        <div>
                          <strong style={{ display: 'block', marginBottom: '3px', color: '#1e3a8a' }}>
                            Term Life Insurance Cannot Be Ported Under IRDAI Rules
                          </strong>
                          Life contracts are long-term mortality plans and cannot be transferred between insurers. You can either 
                          <Link to="/renew-policy?type=life" style={{ color: '#2563eb', fontWeight: 700, marginLeft: '4px', textDecoration: 'underline' }}>
                            Renew Your Life Policy
                          </Link> or 
                          <Link to="/insurance/term-life" style={{ color: '#2563eb', fontWeight: 700, marginLeft: '4px', textDecoration: 'underline' }}>
                            Compare New Term Plans
                          </Link>. Below you can continue porting your health or vehicle policies.
                        </div>
                      </div>
                    )}

                    {/* IRDAI 45-Day Statutory Notice Alert */}
                    <div style={{
                      background: '#fffbeb',
                      border: '1px solid #fde68a',
                      padding: '0.75rem 0.85rem',
                      borderRadius: '10px',
                      marginBottom: '1.25rem',
                      display: 'flex',
                      gap: '0.5rem',
                      fontSize: '0.78rem',
                      color: '#92400e',
                      lineHeight: 1.4
                    }}>
                      <AlertTriangle size={18} style={{ flexShrink: 0, color: '#d97706' }} />
                      <div>
                        <strong>IRDAI Statutory Porting Rule:</strong> Porting requests must ideally be submitted at least 45 days prior to your policy expiry date to guarantee 100% continuity transfer.
                      </div>
                    </div>

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

                    {/* Step B: Current Insurer & Policy Info */}
                    <div className="funnel-responsive-grid-2" style={{ marginBottom: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                          Current Insurer Name *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Star Health, Care Health"
                          value={formData.currentInsurer}
                          onChange={(e) => setFormData({ ...formData, currentInsurer: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '9px 12px',
                            borderRadius: '8px',
                            border: '1.5px solid #cbd5e1',
                            fontSize: '0.85rem',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                          Policy Category *
                        </label>
                        <select
                          value={formData.policyType}
                          onChange={(e) => {
                            const newType = e.target.value;
                            const isMotor = newType.includes('Motor') || newType.includes('Wheeler');
                            setFormData({
                              ...formData,
                              policyType: newType,
                              existingSumInsured: isMotor ? 'IDV Value ₹5,00,000' : '₹5,00,000',
                              waitingPeriodServedYears: isMotor ? '20% NCB Bonus' : '2+ Years'
                            });
                          }}
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
                          <option value="Health Insurance">Health Insurance (Cashless & PED)</option>
                          <option value="Motor / Car Insurance">Motor / Car Insurance (NCB Transfer)</option>
                          <option value="Two Wheeler Insurance">Two Wheeler Insurance (NCB Transfer)</option>
                        </select>
                      </div>
                    </div>

                    <div className="funnel-responsive-grid-2" style={{ marginBottom: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                          Existing Policy Number
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. P/987654/01/2025"
                          value={formData.policyNumber}
                          onChange={(e) => setFormData({ ...formData, policyNumber: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '9px 12px',
                            borderRadius: '8px',
                            border: '1.5px solid #cbd5e1',
                            fontSize: '0.85rem',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                          Current Expiry Date *
                        </label>
                        <input
                          type="date"
                          required
                          value={formData.expiryDate}
                          onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '9px 12px',
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
                          {formData.policyType.includes('Motor') || formData.policyType.includes('Wheeler') 
                            ? 'Vehicle Insured Value (IDV)' 
                            : 'Existing Sum Insured'}
                        </label>
                        <select
                          value={formData.existingSumInsured}
                          onChange={(e) => setFormData({ ...formData, existingSumInsured: e.target.value })}
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
                          {formData.policyType.includes('Motor') || formData.policyType.includes('Wheeler') ? (
                            <>
                              <option value="IDV Up to ₹2,50,000">IDV Up to ₹2,50,000</option>
                              <option value="IDV ₹5,00,000">IDV ~ ₹5,00,000</option>
                              <option value="IDV ₹10,00,000">IDV ~ ₹10,00,000</option>
                              <option value="IDV ₹15,00,000+">IDV ~ ₹15,00,000+</option>
                            </>
                          ) : (
                            <>
                              <option value="₹3,00,000">₹3,00,000</option>
                              <option value="₹5,00,000">₹5,00,000</option>
                              <option value="₹10,00,000">₹10,00,000</option>
                              <option value="₹15,00,000">₹15,00,000</option>
                              <option value="₹25,00,000+">₹25,00,000+</option>
                              <option value="₹50,00,000+">₹50,00,000+</option>
                            </>
                          )}
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                          {formData.policyType.includes('Motor') || formData.policyType.includes('Wheeler') 
                            ? 'Accumulated NCB Bonus' 
                            : 'Waiting Period Served'}
                        </label>
                        <select
                          value={formData.waitingPeriodServedYears}
                          onChange={(e) => setFormData({ ...formData, waitingPeriodServedYears: e.target.value })}
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
                          {formData.policyType.includes('Motor') || formData.policyType.includes('Wheeler') ? (
                            <>
                              <option value="0% NCB">0% NCB (Claimed Last Year)</option>
                              <option value="20% NCB">20% NCB (1 Claim-Free Year)</option>
                              <option value="25% NCB">25% NCB (2 Claim-Free Years)</option>
                              <option value="35% NCB">35% NCB (3 Claim-Free Years)</option>
                              <option value="45% NCB">45% NCB (4 Claim-Free Years)</option>
                              <option value="50% NCB">50% NCB (Max 5 Years Claim-Free)</option>
                            </>
                          ) : (
                            <>
                              <option value="1 Year">1 Year (Basic Continuity)</option>
                              <option value="2 Years">2 Years (Specific Illness Covered)</option>
                              <option value="3+ Years">3+ Years (Full Pre-Existing Covered)</option>
                              <option value="4+ Years">4+ Years (Max Bonus + Zero PED Wait)</option>
                            </>
                          )}
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '10px',
                        fontSize: '0.95rem',
                        fontWeight: 800,
                        cursor: loading ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)'
                      }}
                    >
                      {loading ? 'Initiating Porting...' : 'Initiate Free Porting Verification'} <ArrowRight size={18} />
                    </button>
                  </form>
                )}

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. WHY PORT TO AADHIRAKSHA */}
      <section style={{ padding: '4rem 0', background: '#ffffff' }}>
        <div className="container">
          
          <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 3rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: '#7c3aed', letterSpacing: '1px' }}>
              IRDAI Legal Portability Rights
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f2b48', margin: '0.5rem 0' }}>
              Why Switch Your Policy to Aadhiraksha?
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.98rem' }}>
              You don’t have to stay stuck with bad service or unfair premium spikes. Porting protects all your earned credits.
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
                desc: 'All waiting periods served with your previous insurer for pre-existing diseases are carried forward 100% under IRDAI guidelines.',
                icon: <ShieldCheck size={26} color="#7c3aed" />
              },
              {
                title: 'No Claim Bonus (NCB) Retention',
                desc: 'Retain up to 50% earned NCB cumulative discounts when transferring your motor or health coverage.',
                icon: <Percent size={26} color="#d97706" />
              },
              {
                title: 'Direct Claims Settlement Concierge',
                desc: 'Get assigned a dedicated claim support manager who assists during emergency hospitalizations with zero call center hassle.',
                icon: <Award size={26} color="#0284c7" />
              },
              {
                title: 'Upgraded Hospital & Cashless Network',
                desc: 'Access over 14,000+ cashless network hospitals and 6,000+ cashless auto garages across India.',
                icon: <FileCheck size={26} color="#059669" />
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
