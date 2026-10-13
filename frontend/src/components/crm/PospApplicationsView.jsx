import React, { useState } from 'react';
import { PhoneCall, UserPlus, X, CheckCircle, ShieldCheck } from 'lucide-react';
import { crmService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function PospApplicationsView({
  pospList = [],
  onUpdateStatus,
  onRefresh
}) {
  const { user: authUser, canCreatePosp } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successInfo, setSuccessInfo] = useState(null);

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    panNumber: '',
    city: 'Hyderabad',
    state: 'Telangana',
    password: ''
  });

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    try {
      const payload = {
        fullName: form.fullName,
        email: form.email,
        phoneNumber: form.phoneNumber,
        role: 'ROLE_POSP_AGENT',
        designation: 'POSP Agent Partner',
        department: 'POSP Partner Distribution',
        password: form.password || undefined
      };
      const res = await crmService.createUser(payload);
      setSuccessInfo({
        fullName: res.user.fullName,
        email: res.user.email,
        temporaryPassword: res.temporaryPassword
      });
      setShowAddModal(false);
      setForm({
        fullName: '',
        email: '',
        phoneNumber: '',
        panNumber: '',
        city: 'Hyderabad',
        state: 'Telangana',
        password: ''
      });
      if (onRefresh) onRefresh();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to onboard agent');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#091726', margin: '0 0 0.2rem' }}>POSP Agent Applications & Network</h3>
          <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>Review agent KYC, certificates, and onboard certified partner agents</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ background: '#fef3c7', color: '#b45309', fontSize: '0.78rem', fontWeight: 700, padding: '0.25rem 0.65rem', borderRadius: '999px' }}>
            {pospList.filter(p => p.status === 'PENDING').length} Pending Approval
          </span>

          {canCreatePosp && (
            <button
              onClick={() => { setErrorMsg(''); setShowAddModal(true); }}
              className="crm-emerald-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <UserPlus size={15} /> Onboard New Agent
            </button>
          )}
        </div>
      </div>

      {/* Success Modal / Banner */}
      {successInfo && (
        <div style={{
          margin: '1rem 1.5rem',
          padding: '1rem 1.25rem',
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '10px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#166534', fontWeight: 700, fontSize: '0.9rem' }}>
              <CheckCircle size={18} /> POSP Agent Onboarded Successfully!
            </div>
            <div style={{ fontSize: '0.82rem', color: '#15803d', marginTop: '4px' }}>
              <strong>{successInfo.fullName}</strong> ({successInfo.email}) has been provisioned. 
              Temporary Password: <code style={{ background: '#dcfce7', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>{successInfo.temporaryPassword}</code>
            </div>
          </div>
          <button
            onClick={() => setSuccessInfo(null)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#166534' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Onboard Agent Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '520px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#091726' }}>
                  Onboard POSP Agent Partner
                </h3>
                <p style={{ margin: '3px 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                  Provision certified external agent with automatic reporting hierarchy
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {errorMsg && (
                <div style={{ padding: '8px 12px', background: '#fee2e2', color: '#991b1b', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600 }}>
                  {errorMsg}
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="agent@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={form.phoneNumber}
                    onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    City
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Hyderabad"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Reporting Sponsor
                  </label>
                  <div style={{
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem',
                    background: '#f8fafc',
                    color: '#0f2b48',
                    fontWeight: 600
                  }}>
                    {authUser?.fullName || 'Current User'} (Auto-Linked)
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Custom Password (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Leave blank to auto-generate temporary secure password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#fff',
                    color: '#475569',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="crm-emerald-btn"
                  style={{
                    padding: '8px 20px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    cursor: submitting ? 'not-allowed' : 'pointer'
                  }}
                >
                  {submitting ? 'Onboarding...' : 'Onboard Agent'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DESKTOP TABLE VIEW (>= 768px) */}
      <div className="crm-desktop-table-container" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <tr>
              <th style={{ padding: '1rem' }}>Applicant Name</th>
              <th style={{ padding: '1rem' }}>Location</th>
              <th style={{ padding: '1rem' }}>PAN & Aadhaar</th>
              <th style={{ padding: '1rem' }}>Experience</th>
              <th style={{ padding: '1rem' }}>Status</th>
              <th style={{ padding: '1rem', textAlign: 'center' }}>Action / Verification</th>
            </tr>
          </thead>
          <tbody>
            {pospList.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                  No POSP applications registered.
                </td>
              </tr>
            ) : (
              pospList.map((posp) => (
                <tr key={posp.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 700, color: '#091726' }}>{posp.user?.fullName || 'POSP Partner'}</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{posp.user?.email}</div>
                  </td>
                  <td style={{ padding: '1rem' }}>{posp.city}, {posp.state}</td>
                  <td style={{ padding: '1rem', fontSize: '0.82rem' }}>
                    <div>PAN: <strong>{posp.panNumber}</strong></div>
                    <div>Aadhaar: <strong>{posp.aadhaarNumber || '-'}</strong></div>
                  </td>
                  <td style={{ padding: '1rem' }}>{posp.experienceYears} Years</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      background: posp.status === 'APPROVED' ? '#dcfce7' : posp.status === 'PENDING' ? '#fef3c7' : '#fee2e2',
                      color: posp.status === 'APPROVED' ? '#15803d' : posp.status === 'PENDING' ? '#b45309' : '#b91c1c',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: 700
                    }}>
                      {posp.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', gap: '0.5rem', alignItems: 'center' }}>
                      {posp.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => onUpdateStatus(posp.id, 'APPROVED')}
                            style={{ background: '#059669', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '6px', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => onUpdateStatus(posp.id, 'REJECTED')}
                            style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '6px', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}
                          >
                            Reject
                          </button>
                        </>
                      )}
                      <a
                        href={`tel:${posp.user?.phoneNumber}`}
                        title="Call POSP Applicant"
                        style={{
                          background: '#f1f5f9',
                          color: '#0f2b48',
                          border: '1px solid #cbd5e1',
                          padding: '6px',
                          borderRadius: '6px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          textDecoration: 'none'
                        }}
                      >
                        <PhoneCall size={13} />
                      </a>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MOBILE CARD DECK VIEW (< 768px) */}
      <div className="crm-mobile-cards-container">
        {pospList.length === 0 ? (
          <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: '#64748b', background: '#fff', borderRadius: '12px' }}>
            No POSP applications registered.
          </div>
        ) : (
          pospList.map((posp) => (
            <div
              key={posp.id}
              style={{
                background: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                boxShadow: '0 2px 5px rgba(0,0,0,0.03)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0f2b48' }}>{posp.user?.fullName}</div>
                  <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '2px' }}>
                    {posp.city}, {posp.state} • {posp.experienceYears} Yrs Exp
                  </div>
                </div>
                <span style={{
                  background: posp.status === 'APPROVED' ? '#dcfce7' : posp.status === 'PENDING' ? '#fef3c7' : '#fee2e2',
                  color: posp.status === 'APPROVED' ? '#15803d' : posp.status === 'PENDING' ? '#b45309' : '#b91c1c',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '9999px',
                  fontSize: '0.72rem',
                  fontWeight: 800
                }}>
                  {posp.status}
                </span>
              </div>

              <div style={{ background: '#f8fafc', padding: '0.65rem 0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.78rem' }}>
                <div>PAN: <strong>{posp.panNumber}</strong></div>
                <div>Aadhaar: <strong>{posp.aadhaarNumber || '-'}</strong></div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: posp.status === 'PENDING' ? '1fr 1fr auto' : '1fr', gap: '0.5rem' }}>
                {posp.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => onUpdateStatus(posp.id, 'APPROVED')}
                      style={{ background: '#059669', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '8px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
                    >
                      Approve Partner
                    </button>
                    <button
                      onClick={() => onUpdateStatus(posp.id, 'REJECTED')}
                      style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '8px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
                    >
                      Reject
                    </button>
                  </>
                )}
                <a
                  href={`tel:${posp.user?.phoneNumber}`}
                  style={{
                    background: '#0f2b48',
                    color: '#ffffff',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <PhoneCall size={14} /> Call Agent
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
