import React, { useState } from 'react';
import { 
  Car, 
  Bike, 
  ShieldCheck, 
  Wrench, 
  CheckCircle2, 
  Clock, 
  Zap, 
  ArrowRight, 
  Award,
  Sparkles,
  Percent,
  FileCheck
} from 'lucide-react';
import { portalService } from '../services/api';

export default function MotorInsurance() {
  const [vehicleType, setVehicleType] = useState('car'); // 'car' | 'two_wheeler' | 'commercial'
  const [isBrandNew, setIsBrandNew] = useState(false);
  const [hasZeroDep, setHasZeroDep] = useState(true);
  
  const [formData, setFormData] = useState({
    vehicleNumber: '',
    fullName: '',
    phoneNumber: '',
    email: '',
    city: 'Hyderabad',
    fuelType: 'Petrol',
    previousInsurer: 'HDFC ERGO'
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await portalService.submitQuote({
        categorySlug: 'motor-insurance',
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        city: formData.city,
        planDetails: JSON.stringify({
          category: vehicleType === 'car' ? 'Car Insurance' : vehicleType === 'two_wheeler' ? '2-Wheeler Insurance' : 'Commercial Vehicle Insurance',
          vehicleNumber: isBrandNew ? 'Brand New Vehicle' : (formData.vehicleNumber || 'Not Provided'),
          isBrandNewVehicle: isBrandNew,
          zeroDepreciationCover: hasZeroDep,
          fuelType: formData.fuelType,
          previousInsurer: formData.previousInsurer
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
      
      {/* 1. HERO SECTION (High-Converting Instant Number Lookup Funnel) */}
      <section className="product-funnel-hero">
        {/* Decorative Amber Orb */}
        <div style={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.25) 0%, transparent 70%)',
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
                background: 'rgba(245, 158, 11, 0.2)',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                padding: '6px 14px',
                borderRadius: '9999px',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: '#fbbf24',
                marginBottom: '1rem'
              }}>
                <Sparkles size={15} /> Instant Policy Issuance in 2 Minutes
              </div>

              <h1 style={{
                fontSize: 'clamp(1.85rem, 3.5vw, 2.75rem)',
                fontWeight: 800,
                lineHeight: 1.2,
                margin: '0 0 0.75rem 0',
                color: '#ffffff'
              }}>
                Save up to <span style={{ color: '#fbbf24' }}>85% on Car & Bike</span> Insurance
              </h1>

              <p style={{
                fontSize: '0.98rem',
                color: '#cbd5e1',
                lineHeight: 1.6,
                maxWidth: '520px',
                margin: '0 0 1.75rem 0'
              }}>
                Compare quotes from 20+ leading motor insurers. Get instant No Claim Bonus (NCB) transfer, cashless repairs across 5,500+ network garages, and 24x7 roadside assistance.
              </p>

              {/* Trust Badges (Elevated below Form on Mobile) */}
              <div className="funnel-hero-trust-col">
                <div className="funnel-trust-grid">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.06)', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <Wrench size={22} color="#fbbf24" />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>5,500+ Cashless Garages</div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Pan-India Network</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.06)', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <Percent size={22} color="#34d399" />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>Up to 50% NCB Transfer</div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Transfer from any insurer</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.06)', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <Zap size={22} color="#60a5fa" />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>Zero Inspection Renewal</div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Even for expired policies</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.06)', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <ShieldCheck size={22} color="#a78bfa" />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>Zero Dep Included</div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>100% claim on parts</div>
                    </div>
                  </div>
                </div>

                {/* Insurer Logos Strip */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#94a3b8', fontSize: '0.8rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <span>Official Partner With:</span>
                  <span style={{ color: '#ffffff', fontWeight: 700 }}>TATA AIG • HDFC ERGO • ICICI • Bajaj Allianz • Reliance</span>
                </div>
              </div>
            </div>

            {/* Right Column: High-Conversion Instant Motor Quote Card (Elevated under Title on Mobile) */}
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
                      Motor Quotes Generated!
                    </h3>
                    <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.5, margin: '0 0 1.5rem 0' }}>
                      Thank you <strong>{formData.fullName}</strong>. We've matched your vehicle with the highest discount rates and verified NCB transfers.
                    </p>
                    <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.85rem', color: '#059669', fontWeight: 700 }}>
                      📞 Instant comparative quotation summary sent to {formData.phoneNumber}
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
                      Compare Another Vehicle
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    
                    {/* Vehicle Type Tabs */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1.25rem' }}>
                      {[
                        { id: 'car', label: 'Car Insurance', icon: <Car size={16} /> },
                        { id: 'two_wheeler', label: '2-Wheeler', icon: <Bike size={16} /> },
                        { id: 'commercial', label: 'Commercial', icon: <ShieldCheck size={16} /> }
                      ].map((t) => (
                        <button
                          type="button"
                          key={t.id}
                          onClick={() => setVehicleType(t.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            padding: '9px 4px',
                            borderRadius: '10px',
                            border: `1.5px solid ${vehicleType === t.id ? '#d97706' : '#e2e8f0'}`,
                            background: vehicleType === t.id ? '#fffbeb' : '#ffffff',
                            color: vehicleType === t.id ? '#d97706' : '#64748b',
                            fontWeight: vehicleType === t.id ? 800 : 600,
                            fontSize: '0.78rem',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {t.icon} {t.label}
                        </button>
                      ))}
                    </div>

                    {/* Step A: Vehicle Registration Number Input */}
                    {!isBrandNew ? (
                      <div style={{ marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.3rem' }}>
                          <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>
                            Vehicle Registration Number *
                          </label>
                          <button
                            type="button"
                            onClick={() => setIsBrandNew(true)}
                            style={{ background: 'none', border: 'none', color: '#0284c7', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                          >
                            Brand New Vehicle?
                          </button>
                        </div>
                        <input
                          type="text"
                          required={!isBrandNew}
                          placeholder="e.g. TS-09-EA-1234"
                          value={formData.vehicleNumber}
                          onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value.toUpperCase() })}
                          style={{
                            width: '100%',
                            padding: '12px 14px',
                            borderRadius: '8px',
                            border: '2px solid #cbd5e1',
                            fontSize: '1rem',
                            fontWeight: 800,
                            letterSpacing: '1px',
                            textTransform: 'uppercase',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                    ) : (
                      <div style={{ marginBottom: '1rem', background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#059669' }}>
                          ✨ Brand New Vehicle
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsBrandNew(false)}
                          style={{ background: 'none', border: 'none', color: '#0284c7', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                        >
                          Have Reg No?
                        </button>
                      </div>
                    )}

                    {/* Step B: Add-ons Toggle (Zero Dep) */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: '#f8fafc',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      marginBottom: '1rem'
                    }}>
                      <div>
                        <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f2b48' }}>Include Zero Depreciation Cover</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>100% reimbursement on parts</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={hasZeroDep}
                        onChange={(e) => setHasZeroDep(e.target.checked)}
                        style={{ width: '18px', height: '18px', accentColor: '#d97706', cursor: 'pointer' }}
                      />
                    </div>

                    {/* Step C: Personal Details */}
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Anand Varma"
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
                          Fuel Type
                        </label>
                        <select
                          value={formData.fuelType}
                          onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
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
                          <option value="Petrol">Petrol</option>
                          <option value="Diesel">Diesel</option>
                          <option value="Electric (EV)">Electric (EV)</option>
                          <option value="CNG">CNG Fitted</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        width: '100%',
                        background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
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
                        boxShadow: '0 4px 14px rgba(217, 119, 6, 0.3)',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {loading ? 'Checking Lowest Prices...' : (
                        <>
                          View Instant Motor Prices <ArrowRight size={18} />
                        </>
                      )}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '0.75rem', fontSize: '0.72rem', color: '#64748b' }}>
                      ⚡ Instant policy document download & WhatsApp copy within 2 mins.
                    </div>
                  </form>
                )}

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. MOTOR INSURANCE HIGHLIGHTS */}
      <section style={{ padding: '4rem 0', background: '#ffffff' }}>
        <div className="container">
          
          <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 3rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: '#d97706', letterSpacing: '1px' }}>
              Maximum Savings & Effortless Claims
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f2b48', margin: '0.5rem 0' }}>
              Why Choose Aadhiraksha for Motor Insurance?
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.98rem' }}>
              Whether it is a minor scratch or total loss, our emergency surveyor network guarantees swift claim settlements.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem'
          }}>
            {[
              {
                title: 'Instant Cashless Garage Network',
                desc: 'Drop your vehicle at any of our 5,500+ authorized cashless service centers. We pay the garage directly.',
                icon: <Wrench size={26} color="#d97706" />
              },
              {
                title: 'No Claim Bonus (NCB) Retention',
                desc: 'Transfer up to 50% discount accumulated with your previous insurer. Save thousands on renewal premiums.',
                icon: <Percent size={26} color="#059669" />
              },
              {
                title: 'Zero Depreciation Guarantee',
                desc: 'No deduction on bumper, fiberglass, rubber, or plastic parts during claim settlements.',
                icon: <ShieldCheck size={26} color="#0284c7" />
              },
              {
                title: '24x7 Roadside Assistance (RSA)',
                desc: 'Towing assistance, flat tire changes, emergency fuel delivery, and battery jumpstarts anywhere across India.',
                icon: <Zap size={26} color="#8b5cf6" />
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
