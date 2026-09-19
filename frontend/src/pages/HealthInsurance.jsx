import React, { useState } from 'react';
import { 
  HeartPulse, 
  ShieldCheck, 
  Building2, 
  CheckCircle2, 
  Clock, 
  Zap, 
  ArrowRight, 
  PhoneCall, 
  FileCheck, 
  Sparkles,
  Award,
  ChevronDown
} from 'lucide-react';
import { portalService } from '../services/api';
import healthHeroImg from '../assets/slides/health_hero.jpg';

export default function HealthInsurance() {
  const [selectedMembers, setSelectedMembers] = useState(['Self', 'Spouse']);
  const [eldestAge, setEldestAge] = useState('26-35');
  const [sumInsured, setSumInsured] = useState('₹10 Lakhs');
  const [existingIllness, setExistingIllness] = useState('No');
  
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    city: 'Hyderabad',
    pincode: ''
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const memberList = [
    { id: 'Self', label: 'Self (You)' },
    { id: 'Spouse', label: 'Spouse' },
    { id: 'Son', label: 'Son' },
    { id: 'Daughter', label: 'Daughter' },
    { id: 'Father', label: 'Father' },
    { id: 'Mother', label: 'Mother' }
  ];

  const toggleMember = (m) => {
    if (selectedMembers.includes(m)) {
      if (selectedMembers.length > 1) {
        setSelectedMembers(selectedMembers.filter(x => x !== m));
      }
    } else {
      setSelectedMembers([...selectedMembers, m]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await portalService.submitQuote({
        categorySlug: 'health-insurance',
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        city: formData.city,
        planDetails: JSON.stringify({
          category: 'Comprehensive Health Insurance',
          membersCovered: selectedMembers,
          eldestAgeGroup: eldestAge,
          sumInsured: sumInsured,
          preExistingConditions: existingIllness,
          pincode: formData.pincode || 'Not Specified'
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
      
      {/* 1. HERO SECTION (High-Converting Split Banner) */}
      <section className="product-funnel-hero">
        {/* Subtle Decorative Elements */}
        <div style={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(5, 150, 105, 0.25) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div className="container">
          <div className="funnel-hero-grid">
            
            {/* Title & Micro Value Prop Header */}
            <div className="funnel-hero-intro">
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(5, 150, 105, 0.2)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                padding: '6px 14px',
                borderRadius: '9999px',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: '#34d399',
                marginBottom: '1rem'
              }}>
                <Sparkles size={15} /> 100% Cashless Hospitalization Network
              </div>

              <h1 style={{
                fontSize: 'clamp(1.85rem, 3.5vw, 2.75rem)',
                fontWeight: 800,
                lineHeight: 1.2,
                margin: '0 0 0.75rem 0',
                color: '#ffffff'
              }}>
                Complete Health Cover <br />
                <span style={{ color: '#34d399' }}>Starting @ ₹15/day*</span>
              </h1>

              <p style={{
                fontSize: '0.98rem',
                color: '#cbd5e1',
                lineHeight: 1.6,
                maxWidth: '520px',
                margin: '0 0 1.75rem 0'
              }}>
                Protect your loved ones with zero room rent capping, instant 30-minute cashless approvals at 10,000+ top hospitals across India, and comprehensive daycare coverage.
              </p>

              {/* Trust Value Badges Grid (Elevated below Form on Mobile) */}
              <div className="funnel-hero-trust-col">
                <div className="funnel-trust-grid">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.06)', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <ShieldCheck size={22} color="#34d399" />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>Zero Room Rent Cap</div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Any private suite room</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.06)', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <Building2 size={22} color="#60a5fa" />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>10,000+ Hospitals</div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Pan-India Cashless</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.06)', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <Zap size={22} color="#f59e0b" />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>30-Min Claim Settlement</div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Dedicated claim desk</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.06)', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <Award size={22} color="#a78bfa" />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>Save ₹75,000 Tax</div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Under Section 80D</div>
                    </div>
                  </div>
                </div>

                {/* Verified Insurers Trust Strip */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#94a3b8', fontSize: '0.8rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <span>Official Partner With:</span>
                  <span style={{ color: '#ffffff', fontWeight: 700 }}>Star Health • Care • Niva Bupa • HDFC ERGO • ICICI</span>
                </div>
              </div>
            </div>

            {/* High-Conversion Quotation Lead Card (Elevated under Title on Mobile) */}
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
                      Comparison Proposal Generated!
                    </h3>
                    <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.5, margin: '0 0 1.5rem 0' }}>
                      Thank you <strong>{formData.fullName}</strong>. Our certified health insurance specialist is preparing custom quote comparisons for <strong>{selectedMembers.join(', ')}</strong> with <strong>{sumInsured}</strong> coverage.
                    </p>
                    <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.85rem', color: '#059669', fontWeight: 700 }}>
                      📞 You will receive an instant callback within 5 minutes on {formData.phoneNumber}
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
                      Compare Another Plan
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#059669', letterSpacing: '0.5px' }}>Instant Quote Calculator</div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '2px 0 0 0', color: '#0f2b48' }}>Compare Top Health Plans</h3>
                      </div>
                      <span style={{ fontSize: '0.72rem', background: '#ecfdf5', color: '#059669', padding: '3px 8px', borderRadius: '6px', fontWeight: 800 }}>
                        Save up to 25%
                      </span>
                    </div>

                    {/* Step A: Select Insured Family Members */}
                    <div style={{ marginBottom: '1.25rem' }}>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>
                        1. Who are you protecting?
                      </label>
                      <div className="funnel-responsive-grid-3">
                        {memberList.map((m) => {
                          const isSelected = selectedMembers.includes(m.id);
                          return (
                            <button
                              type="button"
                              key={m.id}
                              onClick={() => toggleMember(m.id)}
                              style={{
                                padding: '8px 6px',
                                borderRadius: '8px',
                                border: `1.5px solid ${isSelected ? '#059669' : '#e2e8f0'}`,
                                background: isSelected ? '#ecfdf5' : '#ffffff',
                                color: isSelected ? '#059669' : '#475569',
                                fontWeight: isSelected ? 800 : 600,
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                                textAlign: 'center'
                              }}
                            >
                              {m.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Step B: Age & Sum Insured Options */}
                    <div className="funnel-responsive-grid-2" style={{ marginBottom: '1.25rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                          Eldest Member Age
                        </label>
                        <select
                          value={eldestAge}
                          onChange={(e) => setEldestAge(e.target.value)}
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
                          <option value="18-25">18 - 25 Yrs</option>
                          <option value="26-35">26 - 35 Yrs</option>
                          <option value="36-45">36 - 45 Yrs</option>
                          <option value="46-55">46 - 55 Yrs</option>
                          <option value="56-65">56 - 65 Yrs</option>
                          <option value="65+">65+ Yrs (Senior)</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                          Desired Sum Insured
                        </label>
                        <select
                          value={sumInsured}
                          onChange={(e) => setSumInsured(e.target.value)}
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
                          <option value="₹5 Lakhs">₹5 Lakhs Cover</option>
                          <option value="₹10 Lakhs">₹10 Lakhs (Recommended)</option>
                          <option value="₹25 Lakhs">₹25 Lakhs Cover</option>
                          <option value="₹50 Lakhs">₹50 Lakhs Cover</option>
                          <option value="₹1 Crore">₹1 Crore Shield</option>
                        </select>
                      </div>
                    </div>

                    {/* Step C: Personal Details */}
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ramesh Sharma"
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
                            padding: '10px 12px',
                            borderRadius: '8px',
                            border: '1.5px solid #cbd5e1',
                            fontSize: '0.88rem',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                          City / State
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Hyderabad"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
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
                      {loading ? 'Fetching Best Quotes...' : (
                        <>
                          View Instant Comparison Plans <ArrowRight size={18} />
                        </>
                      )}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '0.75rem', fontSize: '0.72rem', color: '#64748b' }}>
                      🔒 Zero spam guarantee. Certified advisor comparison assistance within 5 mins.
                    </div>
                  </form>
                )}

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. WHY AADHIRAKSHA HEALTH INSURANCE ADVANTAGES */}
      <section style={{ padding: '4rem 0', background: '#ffffff' }}>
        <div className="container">
          
          <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 3rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: '#059669', letterSpacing: '1px' }}>
              Built for Complete Peace of Mind
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f2b48', margin: '0.5rem 0' }}>
              Why Choose Aadhiraksha for Health Insurance?
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.98rem' }}>
              We don't just sell you a policy. We stand with you during hospitalizations with dedicated claim settlement officers.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem'
          }}>
            {[
              {
                title: 'Zero Out-of-Pocket Room Rent',
                desc: 'No sub-limits on ICU or suite rooms. Choose any hospital room without worrying about proportionate deduction penalties.',
                icon: <Building2 size={26} color="#059669" />
              },
              {
                title: 'Instant 30-Minute Cashless TPA',
                desc: 'Dedicated claim desk assistance that coordinates directly with hospital billing to issue cashless pre-authorization.',
                icon: <Zap size={26} color="#0284c7" />
              },
              {
                title: 'Pre & Post Hospitalization Covered',
                desc: 'Full coverage for 60 days before hospital admission and up to 180 days of diagnostic tests and medications after discharge.',
                icon: <Clock size={26} color="#d97706" />
              },
              {
                title: 'Free Annual Preventive Health Checkups',
                desc: 'Complimentary comprehensive master health checkups every year for all insured family members without reducing your sum insured.',
                icon: <HeartPulse size={26} color="#db2777" />
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

      {/* 3. FREQUENTLY ASKED QUESTIONS */}
      <section style={{ padding: '3.5rem 0', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
        <div className="container" style={{ maxWidth: '840px' }}>
          
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, textAlign: 'center', color: '#0f2b48', marginBottom: '2rem' }}>
            Frequently Asked Questions about Health Insurance
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              {
                q: 'What is the ideal sum insured for a family of 4 in India?',
                a: 'Considering rising medical inflation and healthcare costs in Tier-1 and Tier-2 cities, a minimum coverage of ₹10 Lakhs to ₹25 Lakhs is strongly recommended to protect against major surgeries, oncology treatments, or prolonged ICU stays.'
              },
              {
                q: 'Can I port my existing health insurance policy without losing waiting periods?',
                a: 'Yes! As per IRDAI guidelines, you can seamlessly port your existing health insurance to any partner insurer through Aadhiraksha. All accumulated continuity benefits (waiting period credits and No Claim Bonus) are 100% preserved.'
              },
              {
                q: 'How does Aadhiraksha support me during a hospital claim?',
                a: 'You receive a 24x7 Dedicated Claim Concierge. You simply inform us on WhatsApp or call our claim helpline, and our hospital coordination team manages the TPA paperwork and approvals directly with the hospital.'
              }
            ].map((faq, i) => (
              <div
                key={i}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '1.25rem 1.5rem'
                }}
              >
                <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f2b48', margin: '0 0 0.4rem 0' }}>
                  {faq.q}
                </h3>
                <p style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>
                  {faq.a}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

    </div>
  );
}
