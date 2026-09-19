import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { RefreshCw, ArrowRightLeft, ShieldCheck, CheckCircle2, Send, AlertTriangle } from 'lucide-react';
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
    <div style={{ padding: '3.5rem 0', background: '#f8fafc' }}>
      <div className="container">
        <div className="section-title-box">
          <span className="section-badge">Policy Continuity</span>
          <h1 className="section-title">Renew or Port Your Existing Policy</h1>
          <p className="section-subtitle">
            Never let your coverage lapse. Transfer or renew with zero loss of accumulated waiting periods and No Claim Bonus (NCB).
          </p>
        </div>

        <div style={{ maxWidth: '720px', margin: '0 auto', background: '#fff', padding: '2.5rem', borderRadius: '20px', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-subtle)' }}>
          {/* Action Tabs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
            <button
              type="button"
              onClick={() => handleTabSwitch('renew')}
              style={{
                padding: '0.85rem',
                borderRadius: '12px',
                border: `2px solid ${activeTab === 'renew' ? '#059669' : '#cbd5e1'}`,
                background: activeTab === 'renew' ? '#059669' : '#fff',
                color: activeTab === 'renew' ? '#fff' : '#0f2b48',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s ease',
                boxShadow: activeTab === 'renew' ? '0 4px 12px rgba(5, 150, 105, 0.25)' : 'none'
              }}
            >
              <RefreshCw size={18} />
              Instant Policy Renewal
            </button>

            <button
              type="button"
              onClick={() => handleTabSwitch('port')}
              style={{
                padding: '0.85rem',
                borderRadius: '12px',
                border: `2px solid ${activeTab === 'port' ? '#059669' : '#cbd5e1'}`,
                background: activeTab === 'port' ? '#059669' : '#fff',
                color: activeTab === 'port' ? '#fff' : '#0f2b48',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s ease',
                boxShadow: activeTab === 'port' ? '0 4px 12px rgba(5, 150, 105, 0.25)' : 'none'
              }}
            >
              <ArrowRightLeft size={18} />
              Port Policy to Aadhiraksha
            </button>
          </div>

          {activeTab === 'port' && (
            <div style={{
              background: '#fef3c7',
              border: '1px solid #f59e0b',
              padding: '1rem',
              borderRadius: '10px',
              marginBottom: '1.5rem',
              display: 'flex',
              gap: '0.75rem',
              fontSize: '0.85rem',
              color: '#92400e'
            }}>
              <AlertTriangle size={20} style={{ flexShrink: 0 }} />
              <div>
                <strong>IRDAI Porting Notice:</strong> Health policy porting requests should be initiated at least 45 days prior to your policy renewal date to transfer all waiting period credits.
              </div>
            </div>
          )}

          {submitted ? (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <CheckCircle2 size={52} color="#10b981" style={{ margin: '0 auto 1rem' }} />
              <h3>Request Submitted Successfully!</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
                Our policy operations executive will verify your policy details and reach out at <strong>{formData.phoneNumber}</strong> with renewed quotation terms.
              </p>
              <button onClick={() => setSubmitted(false)} className="btn-submit-quote" style={{ maxWidth: '300px', margin: '0 auto' }}>
                Submit Another Request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter policyholder name"
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
                    placeholder="10-digit mobile"
                    className="form-input"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Policy Type *</label>
                  <select
                    className="form-select"
                    value={formData.policyType}
                    onChange={(e) => setFormData({ ...formData, policyType: e.target.value })}
                  >
                    <option value="Health Insurance">Health Insurance</option>
                    <option value="Motor / Car Insurance">Motor / Car Insurance</option>
                    <option value="Two Wheeler Insurance">Two Wheeler Insurance</option>
                    <option value="Term Life Insurance">Term Life Insurance</option>
                    <option value="Commercial / Fire Insurance">Commercial / Fire Insurance</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Current Insurance Company *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Star Health, HDFC ERGO, ICICI"
                    className="form-input"
                    value={formData.currentInsurer}
                    onChange={(e) => setFormData({ ...formData, currentInsurer: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Existing Policy Number</label>
                  <input
                    type="text"
                    placeholder="e.g. POL-98231024"
                    className="form-input"
                    value={formData.policyNumber}
                    onChange={(e) => setFormData({ ...formData, policyNumber: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Policy Expiry / Due Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-submit-quote" style={{ marginTop: '1.25rem' }}>
                {loading ? 'Processing...' : (
                  <>
                    <Send size={16} />
                    {activeTab === 'renew' ? 'Request Renewal Quote' : 'Initiate Porting Verification'}
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
