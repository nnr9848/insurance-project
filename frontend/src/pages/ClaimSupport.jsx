import React, { useState } from 'react';
import { Crosshair, PhoneCall, AlertCircle, CheckCircle2, Send, Clock, ShieldCheck } from 'lucide-react';
import { portalService } from '../services/api';

export default function ClaimSupport() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    policyNumber: '',
    claimantName: '',
    contactPhone: '',
    claimType: 'HEALTH',
    hospitalOrGarage: '',
    incidentDate: '',
    description: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await portalService.submitClaim(formData);
      setSubmitted(true);
    } catch (err) {
      alert('Error submitting claim. Please check details and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '3.5rem 0', background: '#f8fafc' }}>
      <div className="container">
        <div className="section-title-box">
          <span className="section-badge">Emergency Assistance</span>
          <h1 className="section-title">24x7 Claim Support & Settlement Desk</h1>
          <p className="section-subtitle">
            Need urgent hospital cashless approval or motor accident support? We guide you step-by-step to quick settlement.
          </p>
        </div>

        {/* Emergency Help Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #0f2b48, #1e3a8a)',
          color: '#fff',
          padding: '2rem',
          borderRadius: '16px',
          marginBottom: '3rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
          boxShadow: 'var(--shadow-lg)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f59e0b', fontWeight: 700, marginBottom: '0.5rem' }}>
              <Clock size={20} />
              <span>EMERGENCY HOSPITALIZATION HELPLINE</span>
            </div>
            <h3 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '0.25rem' }}>Direct Cashless Claim Coordination</h3>
            <p style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>Call our 24x7 priority claim team to expedite TPA pre-authorization within 60 minutes.</p>
          </div>
          <a
            href="tel:+918367415156"
            style={{
              background: '#f59e0b',
              color: '#0f2b48',
              padding: '0.85rem 1.75rem',
              borderRadius: '12px',
              fontWeight: 800,
              fontSize: '1rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 8px 16px rgba(245, 158, 11, 0.4)'
            }}
          >
            <PhoneCall size={20} />
            +91 8367415156
          </a>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          {/* Claim Instructions */}
          <div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '1.25rem' }}>Claim Process & Checklist</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: '#fff', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                <h4 style={{ fontSize: '1rem', color: 'var(--primary-navy)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <ShieldCheck size={18} color="#10b981" /> 1. Cashless Hospitalization
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Show your health insurance e-card and photo ID at the hospital's TPA desk. The hospital will submit pre-auth directly to the insurer.
                </p>
              </div>

              <div style={{ background: '#fff', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                <h4 style={{ fontSize: '1rem', color: 'var(--primary-navy)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <ShieldCheck size={18} color="#2563eb" /> 2. Motor Accident Claim
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Take photos of the vehicle damage, notify the insurer before repairs, and move the car to an authorized cashless network workshop.
                </p>
              </div>

              <div style={{ background: '#fff', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                <h4 style={{ fontSize: '1rem', color: 'var(--primary-navy)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <ShieldCheck size={18} color="#f59e0b" /> 3. Reimbursement Filing
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  For non-network treatments, collect discharge summary, original pharmacy bills, and doctor prescriptions for full reimbursement.
                </p>
              </div>
            </div>
          </div>

          {/* Intimation Form */}
          <div style={{ background: '#fff', padding: '2rem', borderRadius: '16px', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border-subtle)' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Intimate / Track a Claim Online</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Submit claim intimation to notify our claims desk and receive your tracking ticket.
            </p>

            {submitted ? (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <CheckCircle2 size={48} color="#10b981" style={{ margin: '0 auto 1rem' }} />
                <h4>Claim Intimation Recorded!</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                  Your claim ticket has been generated. A claim specialist will call <strong>{formData.contactPhone}</strong> immediately.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Policy Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 1029384756"
                      className="form-input"
                      value={formData.policyNumber}
                      onChange={(e) => setFormData({ ...formData, policyNumber: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Claim Type *</label>
                    <select
                      className="form-select"
                      value={formData.claimType}
                      onChange={(e) => setFormData({ ...formData, claimType: e.target.value })}
                    >
                      <option value="HEALTH">Health / Hospitalization</option>
                      <option value="MOTOR">Motor / Vehicle Damage</option>
                      <option value="LIFE">Life / Term Claim</option>
                      <option value="TRAVEL">Travel / Baggage / Medical</option>
                      <option value="BUSINESS">Business / Commercial Loss</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Claimant / Patient Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Name"
                      className="form-input"
                      value={formData.claimantName}
                      onChange={(e) => setFormData({ ...formData, claimantName: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Contact Phone *</label>
                    <input
                      type="tel"
                      required
                      placeholder="10-digit mobile"
                      className="form-input"
                      value={formData.contactPhone}
                      onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Hospital / Network Garage Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Apollo Hospital, Jubilee Hills"
                    className="form-input"
                    value={formData.hospitalOrGarage}
                    onChange={(e) => setFormData({ ...formData, hospitalOrGarage: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Date of Incident / Admission</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.incidentDate}
                    onChange={(e) => setFormData({ ...formData, incidentDate: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Incident Details / Brief</label>
                  <textarea
                    rows={3}
                    placeholder="Briefly describe the illness, diagnosis or vehicle damage"
                    className="form-textarea"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <button type="submit" disabled={loading} className="btn-submit-quote">
                  {loading ? 'Submitting...' : <><Send size={16} /> Submit Claim Intimation</>}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
