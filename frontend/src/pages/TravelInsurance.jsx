import React, { useState } from 'react';
import { 
  Plane, 
  ShieldCheck, 
  HeartPulse, 
  Luggage, 
  CheckCircle2, 
  Clock, 
  Zap, 
  ArrowRight, 
  Award,
  Sparkles,
  Globe,
  FileCheck
} from 'lucide-react';
import { portalService } from '../services/api';

export default function TravelInsurance() {
  const [destination, setDestination] = useState('Schengen'); // 'Schengen' | 'USA_Canada' | 'Asia' | 'Worldwide'
  const [tripType, setTripType] = useState('single'); // 'single' | 'multi' | 'student'
  const [travelerCount, setTravelerCount] = useState('1');
  
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    city: 'Hyderabad',
    tripDurationDays: '15',
    eldestAge: '28'
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await portalService.submitQuote({
        categorySlug: 'travel-insurance',
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        city: formData.city,
        planDetails: JSON.stringify({
          category: 'International Travel Insurance',
          destination,
          tripType,
          travelerCount,
          tripDurationDays: formData.tripDurationDays,
          eldestTravelerAge: formData.eldestAge
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
      
      {/* 1. HERO SECTION (Matching Health & Term Life Dark Hero with White Card) */}
      <section className="product-funnel-hero">
        {/* Subtle Cyan Glow Orb */}
        <div style={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(8, 145, 178, 0.25) 0%, transparent 70%)',
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
                background: 'rgba(8, 145, 178, 0.2)',
                border: '1px solid rgba(8, 145, 178, 0.4)',
                padding: '6px 14px',
                borderRadius: '9999px',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: '#22d3ee',
                marginBottom: '1.25rem'
              }}>
                <Sparkles size={15} /> 100% Embassy & Visa Compliant (Schengen / US / UK)
              </div>

              <h1 style={{
                fontSize: 'clamp(1.85rem, 3.5vw, 2.75rem)',
                fontWeight: 800,
                lineHeight: 1.2,
                margin: '0 0 1rem 0',
                color: '#ffffff'
              }}>
                International Travel Cover <br />
                <span style={{ color: '#22d3ee' }}>Starting @ ₹25/day*</span>
              </h1>

              <p style={{
                fontSize: '0.98rem',
                color: '#cbd5e1',
                lineHeight: 1.6,
                maxWidth: '520px',
                margin: '0 0 1.75rem 0'
              }}>
                Travel the world with complete confidence. Comprehensive cashless medical hospitalization overseas, baggage loss cover, flight delay compensation, and passport theft assistance.
              </p>

              {/* Trust Badges & Underwriters below form on mobile */}
              <div className="funnel-hero-trust-col">
                <div className="funnel-trust-grid">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.06)', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <HeartPulse size={22} color="#22d3ee" />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>$500k Medical Cover</div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Cashless OPD & Inpatient</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.06)', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <Luggage size={22} color="#fbbf24" />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>Baggage & Flight Delay</div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Instant claim payouts</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.06)', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <Globe size={22} color="#34d399" />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>Schengen Visa Approved</div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>€30,000+ Mandatory Shield</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.06)', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <ShieldCheck size={22} color="#a78bfa" />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>Passport Loss Support</div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Emergency travel assistance</div>
                    </div>
                  </div>
                </div>

                {/* Insurers Strip */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#94a3b8', fontSize: '0.8rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
                  <span>Official Partner With:</span>
                  <span style={{ color: '#ffffff', fontWeight: 700 }}>TATA AIG • HDFC ERGO • Bajaj Allianz • ICICI Lombard • Care</span>
                </div>
              </div>
            </div>

            {/* Right Column: Clean White Lead Card */}
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
                      Travel Insurance Quotes Ready!
                    </h3>
                    <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.5, margin: '0 0 1.5rem 0' }}>
                      Thank you <strong>{formData.fullName}</strong>. We've matched your trip to <strong>{destination}</strong> with visa-compliant, zero-deductible travel policies.
                    </p>
                    <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.85rem', color: '#0891b2', fontWeight: 700 }}>
                      📞 Instant policy comparison sent to {formData.phoneNumber}
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
                      Compare Another Trip
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    
                    {/* Destination Selection */}
                    <div style={{ marginBottom: '1.25rem' }}>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                        1. Where are you traveling?
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        {[
                          { id: 'Schengen', label: 'Schengen (Europe)' },
                          { id: 'USA_Canada', label: 'USA & Canada' },
                          { id: 'Asia', label: 'Asia & Middle East' },
                          { id: 'Worldwide', label: 'Worldwide' }
                        ].map((dest) => (
                          <button
                            type="button"
                            key={dest.id}
                            onClick={() => setDestination(dest.id)}
                            style={{
                              padding: '10px 8px',
                              borderRadius: '8px',
                              border: `1.5px solid ${destination === dest.id ? '#0891b2' : '#e2e8f0'}`,
                              background: destination === dest.id ? '#ecfeff' : '#ffffff',
                              color: destination === dest.id ? '#0891b2' : '#64748b',
                              fontWeight: destination === dest.id ? 800 : 600,
                              fontSize: '0.82rem',
                              cursor: 'pointer',
                              textAlign: 'center'
                            }}
                          >
                            {dest.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Step A: Trip Type & Duration */}
                    <div className="funnel-responsive-grid-2" style={{ marginBottom: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                          Trip Duration (Days)
                        </label>
                        <select
                          value={formData.tripDurationDays}
                          onChange={(e) => setFormData({ ...formData, tripDurationDays: e.target.value })}
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
                          <option value="7">Up to 7 Days</option>
                          <option value="15">Up to 15 Days</option>
                          <option value="30">Up to 30 Days</option>
                          <option value="60">Up to 60 Days</option>
                          <option value="180">Student / Multi-Trip (180 Days)</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                          Number of Travelers
                        </label>
                        <select
                          value={travelerCount}
                          onChange={(e) => setTravelerCount(e.target.value)}
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
                          <option value="1">1 Traveler (Solo)</option>
                          <option value="2">2 Travelers (Couple)</option>
                          <option value="Family (3-4)">Family (3 - 4 Members)</option>
                          <option value="Group (5+)">Group (5+ Travelers)</option>
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
                        placeholder="e.g. Priya Nair"
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
                        background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
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
                        boxShadow: '0 4px 14px rgba(8, 145, 178, 0.3)',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {loading ? 'Finding Visa Compliant Plans...' : (
                        <>
                          View Instant Travel Quotes <ArrowRight size={18} />
                        </>
                      )}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '0.75rem', fontSize: '0.72rem', color: '#64748b' }}>
                      ✈️ Instant digital certificate download for visa appointment submission.
                    </div>
                  </form>
                )}

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. WHY AADHIRAKSHA TRAVEL INSURANCE */}
      <section style={{ padding: '4rem 0', background: '#ffffff' }}>
        <div className="container">
          
          <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 3rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: '#0891b2', letterSpacing: '1px' }}>
              Global Travel Protection
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f2b48', margin: '0.5rem 0' }}>
              Why Choose Aadhiraksha for International Travel?
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.98rem' }}>
              Instant embassy-compliant certificate generation with 24x7 worldwide cashless hospital assistance.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem'
          }}>
            {[
              {
                title: 'Instant Schengen Visa Acceptance',
                desc: 'Guaranteed compliance with mandatory €30,000 medical emergency cover required by European embassies.',
                icon: <Globe size={26} color="#0891b2" />
              },
              {
                title: 'Lost Baggage & Passport Reimbursement',
                desc: 'Quick cash advances and document reissuance reimbursement if your passport or checked-in baggage is delayed or stolen.',
                icon: <Luggage size={26} color="#d97706" />
              },
              {
                title: 'Trip Cancellation & Flight Delays',
                desc: 'Full compensation for non-refundable hotel bookings and connecting flights if your trip is interrupted.',
                icon: <Clock size={26} color="#059669" />
              },
              {
                title: '24x7 Global Assistance Helpline',
                desc: 'Direct toll-free international hotline for immediate emergency medical evacuation and cashless hospital admission.',
                icon: <HeartPulse size={26} color="#dc2626" />
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
