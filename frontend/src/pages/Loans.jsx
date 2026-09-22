import React, { useState } from 'react';
import { 
  Banknote, 
  CheckCircle2, 
  Calculator, 
  ArrowRight, 
  ShieldCheck, 
  Send,
  Sparkles,
  Percent,
  Clock,
  Award,
  Building2
} from 'lucide-react';
import { portalService } from '../services/api';

export default function Loans() {
  const [loanAmount, setLoanAmount] = useState(1000000);
  const [tenureYears, setTenureYears] = useState(5);
  const [interestRate, setInterestRate] = useState(8.5);
  const [loanType, setLoanType] = useState('Home Loan');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    city: '',
    monthlyIncome: '₹75,000'
  });

  // Calculate Monthly EMI
  const calculateEMI = () => {
    const p = loanAmount;
    const r = (interestRate / 12) / 100;
    const n = tenureYears * 12;
    if (r === 0) return Math.round(p / n);
    const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return Math.round(emi);
  };

  const monthlyEMI = calculateEMI();
  const totalPayment = monthlyEMI * (tenureYears * 12);
  const totalInterest = totalPayment - loanAmount;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await portalService.submitQuote({
        categorySlug: 'loans',
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        city: formData.city,
        planDetails: JSON.stringify({
          loanType,
          loanAmount: `₹${loanAmount.toLocaleString('en-IN')}`,
          tenureYears,
          monthlyIncome: formData.monthlyIncome,
          estimatedEMI: `₹${monthlyEMI.toLocaleString('en-IN')}`
        })
      });
      setSubmitted(true);
    } catch (err) {
      alert('Error submitting loan inquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', color: '#0f2b48' }}>
      
      {/* 1. HERO SECTION (Split Hero Banner) */}
      <section className="product-funnel-hero" style={{ background: 'linear-gradient(135deg, #071728 0%, #1e293b 100%)' }}>
        {/* Golden / Amber Glow Orb */}
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
                <Sparkles size={15} /> Lowest Interest Rates from 30+ Leading Banks
              </div>

              <h1 style={{
                fontSize: 'clamp(1.85rem, 3.5vw, 2.75rem)',
                fontWeight: 800,
                lineHeight: 1.2,
                margin: '0 0 0.75rem 0',
                color: '#ffffff'
              }}>
                Instant Loan Comparison <br />
                <span style={{ color: '#fbbf24' }}>Starting @ 8.35% p.a.*</span>
              </h1>

              <p style={{
                fontSize: '0.98rem',
                color: '#cbd5e1',
                lineHeight: 1.6,
                maxWidth: '520px',
                margin: '0 0 1.75rem 0'
              }}>
                Compare Home, Personal, Business, and Loan Against Property (LAP) options from top public & private banking partners with instant online eligibility verification.
              </p>

              {/* Supporting Trust Badges (Shown below on Desktop, below Form on Mobile) */}
              <div className="funnel-hero-trust-col">
                <div className="funnel-trust-grid">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.06)', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <Percent size={22} color="#fbbf24" />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>8.35% Base Rate</div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Lowest market rate</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.06)', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <Clock size={22} color="#34d399" />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>24-Hr Sanction</div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Fast digital processing</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.06)', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <Building2 size={22} color="#60a5fa" />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>30+ Bank Partners</div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>SBI, HDFC, ICICI, Axis</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.06)', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <ShieldCheck size={22} color="#a78bfa" />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>Zero Prepayment</div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>On floating loans</div>
                    </div>
                  </div>
                </div>

                {/* Insurers Strip */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#94a3b8', fontSize: '0.8rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <span>Banking Partners:</span>
                  <span style={{ color: '#ffffff', fontWeight: 700 }}>SBI • HDFC Bank • ICICI Bank • Axis Bank • Kotak • Bajaj Finserv</span>
                </div>
              </div>
            </div>

            {/* Interactive EMI Calculator & Lead Form (Elevated directly under Title on Mobile) */}
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
                      Loan Eligibility Initiated!
                    </h3>
                    <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.5, margin: '0 0 1.5rem 0' }}>
                      Thank you <strong>{formData.fullName}</strong>. Our bank credit specialist will call <strong>{formData.phoneNumber}</strong> with pre-approved offers for <strong>{loanType}</strong>.
                    </p>
                    <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.85rem', color: '#d97706', fontWeight: 700 }}>
                      💰 Estimated Monthly EMI: ₹{monthlyEMI.toLocaleString('en-IN')}
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
                      Check Another Loan
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    
                    {/* Loan Category Tabs */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.45rem', marginBottom: '1.25rem' }}>
                      {['Home Loan', 'Personal Loan', 'Business Loan', 'Loan vs Property'].map((t) => (
                        <button
                          type="button"
                          key={t}
                          onClick={() => setLoanType(t)}
                          style={{
                            padding: '8px 6px',
                            borderRadius: '8px',
                            border: `1.5px solid ${loanType === t ? '#d97706' : '#e2e8f0'}`,
                            background: loanType === t ? '#fffbeb' : '#ffffff',
                            color: loanType === t ? '#d97706' : '#64748b',
                            fontWeight: loanType === t ? 800 : 600,
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            textAlign: 'center'
                          }}
                        >
                          {t}
                        </button>
                      ))}
                    </div>

                    {/* EMI Sliders */}
                    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>Loan Amount</span>
                        <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f2b48' }}>₹{loanAmount.toLocaleString('en-IN')}</span>
                      </div>
                      <input
                        type="range"
                        min="100000"
                        max="20000000"
                        step="50000"
                        value={loanAmount}
                        onChange={(e) => setLoanAmount(Number(e.target.value))}
                        style={{ width: '100%', accentColor: '#d97706', marginBottom: '0.75rem' }}
                      />

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>Tenure ({tenureYears} Yrs)</span>
                        <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#059669' }}>EMI: ₹{monthlyEMI.toLocaleString('en-IN')}/mo</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="30"
                        value={tenureYears}
                        onChange={(e) => setTenureYears(Number(e.target.value))}
                        style={{ width: '100%', accentColor: '#059669' }}
                      />
                    </div>

                    {/* Contact Details */}
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Venkat Raman"
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
                      {loading ? 'Checking Bank Offers...' : (
                        <>
                          Get Pre-Approved Loan Offers <ArrowRight size={18} />
                        </>
                      )}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '0.75rem', fontSize: '0.72rem', color: '#64748b' }}>
                      ⚡ Instant credit sanctioning with zero impact on CIBIL score.
                    </div>
                  </form>
                )}

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. LOAN CATEGORIES GRID */}
      <section style={{ padding: '4rem 0', background: '#ffffff' }}>
        <div className="container">
          
          <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 3rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: '#d97706', letterSpacing: '1px' }}>
              Financing Solutions
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f2b48', margin: '0.5rem 0' }}>
              Tailored Credit Products for Every Requirement
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.98rem' }}>
              Direct integrations with leading commercial banks and NBFCs for lowest processing fees.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem'
          }}>
            {[
              {
                title: 'Home Loans & Balance Transfer',
                desc: 'Up to 90% property value financing with up to 30 years tenure. Transfer existing high-cost home loans at lower rates.',
                rate: 'From 8.35% p.a.',
                icon: <Building2 size={26} color="#d97706" />
              },
              {
                title: 'Instant Personal Loans',
                desc: '100% paperless approval up to ₹40 Lakhs with zero collateral and same-day bank account disbursement.',
                rate: 'From 10.49% p.a.',
                icon: <Banknote size={26} color="#059669" />
              },
              {
                title: 'Business & MSME Working Capital',
                desc: 'Collateral-free business expansion loans and overdraft limits tailored for trade, retail, and manufacturing enterprises.',
                rate: 'From 11.25% p.a.',
                icon: <Award size={26} color="#0284c7" />
              },
              {
                title: 'Loan Against Property (LAP)',
                desc: 'Unlock high-value liquidity against residential or commercial properties with flexible repayment tenure up to 15 years.',
                rate: 'From 9.00% p.a.',
                icon: <ShieldCheck size={26} color="#8b5cf6" />
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '12px',
                    background: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    border: '1px solid #e2e8f0'
                  }}>
                    {item.icon}
                  </div>

                  <span style={{
                    background: '#ecfdf5',
                    color: '#059669',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    padding: '0.25rem 0.6rem',
                    borderRadius: '9999px',
                    border: '1px solid #a7f3d0'
                  }}>
                    {item.rate}
                  </span>
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
