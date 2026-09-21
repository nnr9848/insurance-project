import React from 'react';
import { PhoneCall } from 'lucide-react';

export default function ClaimsIntimationView({ claims = [] }) {
  return (
    <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#091726', margin: '0 0 0.2rem' }}>Insurance Claims Intimation</h3>
          <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>Emergency cashless & reimbursement claim tickets</p>
        </div>
        <span style={{ background: '#eff6ff', color: '#1e40af', fontSize: '0.78rem', fontWeight: 700, padding: '0.25rem 0.65rem', borderRadius: '999px' }}>
          {claims.length} Claims Lodged
        </span>
      </div>

      {/* DESKTOP TABLE VIEW (>= 768px) */}
      <div className="crm-desktop-table-container" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <tr>
              <th style={{ padding: '1rem' }}>Intimation Date</th>
              <th style={{ padding: '1rem' }}>Policy No</th>
              <th style={{ padding: '1rem' }}>Claim Type</th>
              <th style={{ padding: '1rem' }}>Claimant</th>
              <th style={{ padding: '1rem' }}>Hospital / Garage</th>
              <th style={{ padding: '1rem' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {claims.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                  No claims submitted yet.
                </td>
              </tr>
            ) : (
              claims.map((claim) => (
                <tr key={claim.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '1rem', color: '#64748b' }}>
                    {new Date(claim.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 700, color: '#091726' }}>
                    {claim.policyNumber}
                  </td>
                  <td style={{ padding: '1rem' }}>{claim.claimType}</td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 600 }}>{claim.claimantName}</div>
                    <a href={`tel:${claim.contactPhone}`} style={{ fontSize: '0.78rem', color: '#d97706' }}>
                      {claim.contactPhone}
                    </a>
                  </td>
                  <td style={{ padding: '1rem' }}>{claim.hospitalOrGarage || '-'}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ background: '#dbeafe', color: '#1e40af', padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700 }}>
                      {claim.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MOBILE CARD DECK VIEW (< 768px) */}
      <div className="crm-mobile-cards-container">
        {claims.length === 0 ? (
          <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: '#64748b', background: '#fff', borderRadius: '12px' }}>
            No claims submitted yet.
          </div>
        ) : (
          claims.map((claim) => (
            <div
              key={claim.id}
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
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0f2b48' }}>{claim.claimantName}</div>
                  <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '2px' }}>
                    Policy: <strong>{claim.policyNumber}</strong>
                  </div>
                </div>
                <span style={{ background: '#dbeafe', color: '#1e40af', padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 800 }}>
                  {claim.status}
                </span>
              </div>

              <div style={{ background: '#f8fafc', padding: '0.65rem 0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.78rem' }}>
                <div>Type: <strong>{claim.claimType}</strong></div>
                <div>Hospital / Garage: <strong>{claim.hospitalOrGarage || 'General Intimation'}</strong></div>
              </div>

              <a
                href={`tel:${claim.contactPhone}`}
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
                <PhoneCall size={14} /> Call Claimant ({claim.contactPhone})
              </a>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
