import React from 'react';
import { PhoneCall } from 'lucide-react';

export default function PospApplicationsView({
  pospList = [],
  onUpdateStatus
}) {
  return (
    <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#091726', margin: '0 0 0.2rem' }}>POSP Agent Applications</h3>
          <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>Review agent KYC, certificates, and IRDAI compliance</p>
        </div>
        <span style={{ background: '#fef3c7', color: '#b45309', fontSize: '0.78rem', fontWeight: 700, padding: '0.25rem 0.65rem', borderRadius: '999px' }}>
          {pospList.filter(p => p.status === 'PENDING').length} Pending Approval
        </span>
      </div>

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
