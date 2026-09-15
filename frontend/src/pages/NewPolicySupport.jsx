import React, { useState } from 'react';
import { ShieldCheck, HeartPulse, Car, Briefcase, Plane, CheckCircle2, ArrowRight, Send } from 'lucide-react';
import { portalService } from '../services/api';

export default function NewPolicySupport() {
  const [selectedPlan, setSelectedPlan] = useState('health');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    city: '',
    ageGroup: '26-35',
    sumInsured: '₹10 Lakhs'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await portalService.submitQuote({
        categorySlug: `${selectedPlan}-insurance`,
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        city: formData.city,
        planDetails: JSON.stringify({ ageGroup: formData.ageGroup, sumInsured: formData.sumInsured })
      });
      setSubmitted(true);
    } catch (err) {
      alert('Error submitting inquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '3.5rem 0', background: '#f8fafc' }}>
      <div className="container">
        <div className="section-title-box">
          <span className="section-badge">Policy Advisory</span>
          <h1 className="section-title">New Policy Support & Advisory</h1>
          <p className="section-subtitle">
            Get personalized coverage recommendations tailored to your family's health profile, vehicles, or business needs.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          {/* Plan Options */}
          <div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>1. Select Insurance Category</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { id: 'health', name: 'Comprehensive Health Insurance', desc: '100% cashless, zero room rent cap, no co-pay options.', icon: <HeartPulse size={24} color="#10b981" /> },
                { id: 'life', name: 'Term Life & Critical Illness', desc: 'Financial shield for dependents up to age 85.', icon: <ShieldCheck size={24} color="#2563eb" /> },
                { id: 'vehicle', name: 'Motor & Zero-Dep Cover', desc: 'Comprehensive vehicle damage + 3rd party liability.', icon: <Car size={24} color="#f59e0b" /> },
                { id: 'business', name: 'Commercial & SME Shield', desc: 'Employee group health, factory fire, and cargo protection.', icon: <Briefcase size={24} color="#8b5cf6" /> },
                { id: 'travel', name: 'Overseas Travel Protection', desc: 'Emergency medical, baggage loss, trip cancellation.', icon: <Plane size={24} color="#ec4899" /> },
              ].map((plan) => (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  style={{
                    background: '#fff',
                    border: `2px solid ${selectedPlan === plan.id ? 'var(--primary-navy)' : 'var(--border-subtle)'}`,
                    borderRadius: '12px',
                    padding: '1.25rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    transition: 'all 0.2s ease',
                    boxShadow: selectedPlan === plan.id ? '0 4px 12px rgba(15, 43, 72, 0.12)' : 'none'
                  }}
                >
                  <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '10px' }}>
                    {plan.icon}
                  </div>
                  <div style={{ flexGrow: 1 }}>
                    <h4 style={{ fontSize: '1rem', marginBottom: '0.2rem' }}>{plan.name}</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{plan.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div>
            <div style={{ background: '#fff', padding: '2rem', borderRadius: '16px', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border-subtle)' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>2. Request Personalized Quotations</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                Fill out the form below to receive comparison charts from certified IRDAI insurers.
              </p>

              {submitted ? (
                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                  <CheckCircle2 size={48} color="#10b981" style={{ margin: '0 auto 1rem' }} />
                  <h4>Inquiry Successfully Logged!</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                    Our licensed advisors will analyze your request and provide quotation charts on <strong>{formData.phoneNumber}</strong>.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Your Full Name"
                      className="form-input"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="10-digit mobile number"
                      className="form-input"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email Address (Optional)</label>
                    <input
                      type="email"
                      placeholder="name@domain.com"
                      className="form-input"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Age Group</label>
                      <select
                        className="form-select"
                        value={formData.ageGroup}
                        onChange={(e) => setFormData({ ...formData, ageGroup: e.target.value })}
                      >
                        <option value="18-25">18 - 25 Yrs</option>
                        <option value="26-35">26 - 35 Yrs</option>
                        <option value="36-45">36 - 45 Yrs</option>
                        <option value="46-55">46 - 55 Yrs</option>
                        <option value="56+">56+ Yrs (Senior)</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Sum Insured</label>
                      <select
                        className="form-select"
                        value={formData.sumInsured}
                        onChange={(e) => setFormData({ ...formData, sumInsured: e.target.value })}
                      >
                        <option value="₹5 Lakhs">₹5 Lakhs</option>
                        <option value="₹10 Lakhs">₹10 Lakhs</option>
                        <option value="₹25 Lakhs">₹25 Lakhs</option>
                        <option value="₹50 Lakhs">₹50 Lakhs</option>
                        <option value="₹1 Crore+">₹1 Crore+</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">City / State *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Hyderabad, Telangana"
                      className="form-input"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>

                  <button type="submit" disabled={loading} className="btn-submit-quote" style={{ marginTop: '1rem' }}>
                    {loading ? 'Submitting...' : <><Send size={16} /> Request Custom Plan Comparison</>}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
