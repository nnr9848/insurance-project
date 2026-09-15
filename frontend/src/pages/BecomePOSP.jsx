import React, { useState } from 'react';
import { UserCheck, Award, TrendingUp, DollarSign, CheckCircle2, Send, ShieldAlert } from 'lucide-react';
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
    <div style={{ padding: '3.5rem 0', background: '#f8fafc' }}>
      <div className="container">
        <div className="section-title-box">
          <span className="section-badge">Career & Growth</span>
          <h1 className="section-title">Become a Certified POSP Insurance Agent</h1>
          <p className="section-subtitle">
            Partner with Aadhiraksha Insurance. Sell Life, Health, Motor, and Commercial policies from top insurers with industry-leading commission payouts.
          </p>
        </div>

        {/* Benefits Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', marginBottom: '3.5rem' }}>
          <div style={{ background: '#fff', padding: '1.75rem', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <DollarSign size={24} />
            </div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.4rem' }}>High Earning Potential</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Earn competitive commissions on new policies and recurring renewal payouts with transparent statements.
            </p>
          </div>

          <div style={{ background: '#fff', padding: '1.75rem', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#dbeafe', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Award size={24} />
            </div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.4rem' }}>IRDAI Certification Training</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Complete our 15-hour digital training and certification modules at your own pace with expert mentoring.
            </p>
          </div>

          <div style={{ background: '#fff', padding: '1.75rem', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <TrendingUp size={24} />
            </div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.4rem' }}>Digital Agent Portal</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Issue instant quotes, share payment links, track leads, and manage policy renewals right from your dedicated portal.
            </p>
          </div>
        </div>

        {/* Application Form */}
        <div style={{ maxWidth: '800px', margin: '0 auto', background: '#fff', padding: '2.5rem', borderRadius: '20px', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-subtle)' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--primary-navy)' }}>
            POSP Agent Registration Form
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
            Fill in your KYC information to start your onboarding process.
          </p>

          {submitted ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 0' }}>
              <CheckCircle2 size={56} color="#10b981" style={{ margin: '0 auto 1.25rem' }} />
              <h3>Application Submitted for Review!</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
                Thank you for applying. Our POSP onboarding team has received your documents and will activate your digital credentials shortly.
              </p>
              <button onClick={() => setSubmitted(false)} className="btn-submit-quote" style={{ maxWidth: '280px', margin: '0 auto' }}>
                Register Another Agent
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Full Name (as per PAN) *</label>
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
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    className="form-input"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Mobile Number (WhatsApp Enabled) *</label>
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
                  <label className="form-label">PAN Card Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ABCDE1234F"
                    className="form-input"
                    style={{ textTransform: 'uppercase' }}
                    value={formData.panNumber}
                    onChange={(e) => setFormData({ ...formData, panNumber: e.target.value.toUpperCase() })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Aadhaar Card Number (Optional)</label>
                  <input
                    type="text"
                    placeholder="12-digit Aadhaar"
                    className="form-input"
                    value={formData.aadhaarNumber}
                    onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Insurance Sales Experience (Years)</label>
                  <input
                    type="number"
                    min="0"
                    max="40"
                    className="form-input"
                    value={formData.experienceYears}
                    onChange={(e) => setFormData({ ...formData, experienceYears: parseInt(e.target.value) || 0 })}
                  />
                </div>
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
                  <label className="form-label">State *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Telangana"
                    className="form-input"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Create Portal Password *</label>
                <input
                  type="password"
                  required
                  placeholder="Minimum 6 characters"
                  className="form-input"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>

              <button type="submit" disabled={loading} className="btn-submit-quote" style={{ marginTop: '1.25rem' }}>
                {loading ? 'Submitting Application...' : <><Send size={16} /> Submit POSP Application</>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
