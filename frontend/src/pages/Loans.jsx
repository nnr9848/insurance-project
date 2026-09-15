import React, { useState } from 'react';
import { Banknote, CheckCircle2, Calculator, ArrowRight, ShieldCheck, Send } from 'lucide-react';
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
    <div style={{ padding: '3.5rem 0', background: '#f8fafc' }}>
      <div className="container">
        <div className="section-title-box">
          <span className="section-badge">Financial Services</span>
          <h1 className="section-title">Fast Loans & Credit Financing</h1>
          <p className="section-subtitle">
            Lowest interest benchmarking across 30+ leading public & private banks for Home, Personal, Business, and LAP loans.
          </p>
        </div>

        {/* Loan Types Showcase */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '3rem' }}>
          {[
            { name: 'Home Loans', rate: 'Starting @ 8.35% p.a.', desc: 'Up to 90% property value financing with up to 30 yrs tenure.' },
            { name: 'Personal Loans', rate: 'Starting @ 10.49% p.a.', desc: 'Instant paperless approval up to ₹40 Lakhs with zero collateral.' },
            { name: 'Business / MSME Loans', rate: 'Starting @ 11.25% p.a.', desc: 'Working capital and term loans for business expansion.' },
            { name: 'Loan Against Property', rate: 'Starting @ 9.00% p.a.', desc: 'High loan amount against residential or commercial properties.' }
          ].map((item, idx) => (
            <div
              key={idx}
              onClick={() => setLoanType(item.name)}
              style={{
                background: '#fff',
                padding: '1.5rem',
                borderRadius: '16px',
                border: `2px solid ${loanType === item.name ? 'var(--accent-gold)' : 'var(--border-subtle)'}`,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: loanType === item.name ? 'var(--shadow-gold)' : 'var(--shadow-sm)'
              }}
            >
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-gold-hover)', background: '#fef3c7', padding: '0.2rem 0.6rem', borderRadius: '9999px', display: 'inline-block', marginBottom: '0.5rem' }}>
                {item.rate}
              </span>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.3rem' }}>{item.name}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{item.desc}</p>
            </div>
          ))}
        </div>

        {/* EMI Calculator & Apply Split */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
          {/* Interactive Calculator */}
          <div style={{ background: '#fff', padding: '2rem', borderRadius: '20px', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <Calculator size={22} color="var(--primary-navy)" />
              <h3 style={{ fontSize: '1.25rem' }}>Interactive EMI Calculator</h3>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Loan Amount:</span>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                  ₹{loanAmount.toLocaleString('en-IN')}
                </span>
              </div>
              <input
                type="range"
                min="100000"
                max="20000000"
                step="50000"
                value={loanAmount}
                onChange={(e) => setLoanAmount(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent-gold)' }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Tenure (Years):</span>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                  {tenureYears} Years ({tenureYears * 12} Months)
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                value={tenureYears}
                onChange={(e) => setTenureYears(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent-gold)' }}
              />
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Interest Rate (% p.a.):</span>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                  {interestRate}%
                </span>
              </div>
              <input
                type="range"
                min="7"
                max="24"
                step="0.1"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent-gold)' }}
              />
            </div>

            {/* Calculated Breakdown Card */}
            <div style={{ background: 'var(--primary-navy)', color: '#fff', borderRadius: '14px', padding: '1.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.85rem', color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Estimated Monthly EMI
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--accent-gold)', margin: '0.25rem 0 1rem' }}>
                ₹{monthlyEMI.toLocaleString('en-IN')}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.85rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.75rem' }}>
                <div>
                  <span style={{ color: '#94a3b8' }}>Total Interest:</span>
                  <div style={{ fontWeight: 700 }}>₹{Math.round(totalInterest).toLocaleString('en-IN')}</div>
                </div>
                <div>
                  <span style={{ color: '#94a3b8' }}>Total Amount:</span>
                  <div style={{ fontWeight: 700 }}>₹{Math.round(totalPayment).toLocaleString('en-IN')}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Apply Form */}
          <div style={{ background: '#fff', padding: '2rem', borderRadius: '20px', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-md)' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Apply for {loanType}</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Submit your inquiry to compare offers with instant sanction letters from top banking partners.
            </p>

            {submitted ? (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <CheckCircle2 size={48} color="#10b981" style={{ margin: '0 auto 1rem' }} />
                <h4>Loan Request Received!</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                  Our loan specialist will call you at <strong>{formData.phoneNumber}</strong> to verify eligibility and initiate bank sanctioning.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter full name"
                    className="form-input"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit mobile"
                    className="form-input"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address (Optional)</label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    className="form-input"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">City *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Hyderabad"
                      className="form-input"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Monthly Income / Turnover</label>
                    <input
                      type="text"
                      placeholder="e.g. ₹75,000"
                      className="form-input"
                      value={formData.monthlyIncome}
                      onChange={(e) => setFormData({ ...formData, monthlyIncome: e.target.value })}
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn-submit-quote" style={{ marginTop: '0.75rem' }}>
                  {loading ? 'Submitting...' : <><Send size={16} /> Check Bank Loan Eligibility</>}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
