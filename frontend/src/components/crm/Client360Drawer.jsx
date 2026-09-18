import React, { useState } from 'react';
import { 
  X, 
  Phone, 
  MessageSquare, 
  Calendar, 
  Mail, 
  Building2, 
  MapPin, 
  ShieldCheck, 
  FileText, 
  Clock, 
  CheckCircle2, 
  Upload, 
  Download, 
  ExternalLink,
  Tag,
  User,
  AlertCircle
} from 'lucide-react';

export default function Client360Drawer({ client, onClose, onOpenCallModal, onOpenMeetingModal }) {
  if (!client) return null;

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'timeline' | 'documents'

  const openWhatsApp = () => {
    const cleanPhone = (client.whatsappNumber || client.phoneNumber).replace(/[^0-9]/g, '');
    const text = encodeURIComponent(`Hello ${client.fullName}, this is your dedicated Insurance Specialist from Aadhiraksha InsurTech regarding your ${client.insuranceType} policy.`);
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  };

  const sampleTimeline = [
    { date: 'Today, 2:30 PM', title: 'Call Logged by Advisor', desc: 'Discussed family floater plan options. Client requested quotation comparing Star Health Optima vs Care Supreme.', icon: <Phone size={14} color="#059669" /> },
    { date: 'Yesterday, 11:00 AM', title: 'Stage Changed to FOLLOWUP', desc: 'Lead moved from NEW_LEAD to FOLLOWUP.', icon: <CheckCircle2 size={14} color="#0284c7" /> },
    { date: '16 Sep 2026, 4:15 PM', title: 'Web Inquiry Received', desc: 'Inquiry submitted from Aadhiraksha homepage discovery engine.', icon: <Clock size={14} color="#f59e0b" /> }
  ];

  const sampleDocs = [
    { name: 'Aadhaar_Card_Verified.pdf', type: 'AADHAAR', date: '16 Sep 2026', size: '1.2 MB' },
    { name: 'Previous_StarHealth_Policy.pdf', type: 'PREVIOUS_POLICY', date: '16 Sep 2026', size: '2.4 MB' }
  ];

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(3px)',
      zIndex: 12000,
      display: 'flex',
      justifyContent: 'flex-end',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '580px',
        background: '#ffffff',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-10px 0 35px rgba(0, 0, 0, 0.25)',
        animation: 'slideLeft 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        
        {/* Drawer Header */}
        <div style={{
          background: 'linear-gradient(135deg, #0f2b48 0%, #071728 100%)',
          color: '#ffffff',
          padding: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', background: 'rgba(255,255,255,0.15)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                {client.clientCode}
              </span>
              <span style={{ fontSize: '0.75rem', background: '#ecfdf5', color: '#059669', padding: '2px 8px', borderRadius: '9999px', fontWeight: 800 }}>
                {client.stage}
              </span>
            </div>

            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '8px 0 2px 0' }}>
              {client.fullName}
            </h2>
            {client.companyName && (
              <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                {client.companyName}
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.12)',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              cursor: 'pointer'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* 1-Tap Quick Action Communication Bar */}
        <div style={{
          background: '#f8fafc',
          padding: '12px 18px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          gap: '8px',
          overflowX: 'auto'
        }}>
          <button
            onClick={() => onOpenCallModal && onOpenCallModal({ clientId: client.id, clientName: client.fullName, clientPhone: client.phoneNumber, insuranceType: client.insuranceType })}
            style={{
              flex: 1,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              background: '#059669',
              color: '#ffffff',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer'
            }}
          >
            <Phone size={14} /> Call & Log
          </button>

          <button
            onClick={openWhatsApp}
            style={{
              flex: 1,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              background: '#15803d',
              color: '#ffffff',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer'
            }}
          >
            <MessageSquare size={14} /> WhatsApp
          </button>

          <button
            onClick={() => onOpenMeetingModal && onOpenMeetingModal(client)}
            style={{
              flex: 1,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer'
            }}
          >
            <Calendar size={14} /> Google Meet
          </button>
        </div>

        {/* Drawer Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#ffffff', padding: '0 18px' }}>
          {[
            { id: 'overview', label: 'Overview & Plan' },
            { id: 'timeline', label: 'Activity Timeline' },
            { id: 'documents', label: 'Document Locker' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '12px 14px',
                border: 'none',
                background: 'none',
                fontWeight: 700,
                fontSize: '0.85rem',
                color: activeTab === tab.id ? '#059669' : '#64748b',
                borderBottom: activeTab === tab.id ? '2px solid #059669' : 'none',
                cursor: 'pointer'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Drawer Scrollable Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem', background: '#f8fafc' }}>
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {/* Card 1: Insurance Details */}
              <div style={{ background: '#ffffff', borderRadius: '12px', padding: '1.25rem', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', color: '#0f2b48', marginBottom: '10px' }}>
                  Insurance Requirements
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.85rem' }}>
                  <div>
                    <div style={{ color: '#64748b', fontSize: '0.75rem' }}>Category</div>
                    <div style={{ fontWeight: 700, color: '#0f2b48' }}>{client.insuranceType}</div>
                  </div>
                  <div>
                    <div style={{ color: '#64748b', fontSize: '0.75rem' }}>Desired Sum Insured</div>
                    <div style={{ fontWeight: 700, color: '#0f2b48' }}>{client.sumInsured || '-'}</div>
                  </div>
                  <div>
                    <div style={{ color: '#64748b', fontSize: '0.75rem' }}>Est. Premium</div>
                    <div style={{ fontWeight: 700, color: '#059669' }}>
                      {client.estimatedPremium ? `₹${Number(client.estimatedPremium).toLocaleString()}` : 'Pending Quote'}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#64748b', fontSize: '0.75rem' }}>Existing Insurer</div>
                    <div style={{ fontWeight: 700, color: '#d97706' }}>{client.existingInsurer || 'None (New)'}</div>
                  </div>
                </div>
              </div>

              {/* Card 2: Contact & Location */}
              <div style={{ background: '#ffffff', borderRadius: '12px', padding: '1.25rem', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', color: '#0f2b48', marginBottom: '10px' }}>
                  Contact Details
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#334155' }}>
                    <Phone size={14} color="#059669" /> {client.phoneNumber}
                  </div>
                  {client.email && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#334155' }}>
                      <Mail size={14} color="#2563eb" /> {client.email}
                    </div>
                  )}
                  {client.city && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#334155' }}>
                      <MapPin size={14} color="#ea580c" /> {client.city}, {client.state || 'Telangana'} {client.pincode && `(${client.pincode})`}
                    </div>
                  )}
                </div>
              </div>

              {/* Card 3: Ownership & Governance */}
              <div style={{ background: '#ffffff', borderRadius: '12px', padding: '1.25rem', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', color: '#0f2b48', marginBottom: '10px' }}>
                  Assigned Team & Advisor
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.85rem' }}>
                  <div>
                    <div style={{ color: '#64748b', fontSize: '0.75rem' }}>Insurance Advisor</div>
                    <div style={{ fontWeight: 700, color: '#0f2b48' }}>{client.assignedAdvisorName || 'Unassigned'}</div>
                  </div>
                  <div>
                    <div style={{ color: '#64748b', fontSize: '0.75rem' }}>Branch Manager</div>
                    <div style={{ fontWeight: 700, color: '#0f2b48' }}>{client.managerName || 'None'}</div>
                  </div>
                </div>
              </div>

              {/* Card 4: Notes */}
              {client.notes && (
                <div style={{ background: '#fef3c7', borderRadius: '12px', padding: '1rem', border: '1px solid #fde68a' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: '#92400e', marginBottom: '4px' }}>
                    Advisor Notes
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#78350f', lineHeight: 1.4 }}>
                    {client.notes}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 2: ACTIVITY TIMELINE */}
          {activeTab === 'timeline' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {sampleTimeline.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    background: '#ffffff',
                    borderRadius: '12px',
                    padding: '1rem',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px'
                  }}
                >
                  <div style={{
                    padding: '8px',
                    borderRadius: '10px',
                    background: '#f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {item.icon}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#0f2b48', fontSize: '0.88rem' }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#94a3b8', margin: '2px 0 6px 0' }}>
                      {item.date}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.4 }}>
                      {item.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: DOCUMENT LOCKER */}
          {activeTab === 'documents' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{
                border: '2px dashed #cbd5e1',
                borderRadius: '12px',
                padding: '1.5rem',
                textAlign: 'center',
                background: '#ffffff',
                cursor: 'pointer'
              }}>
                <Upload size={24} color="#059669" style={{ margin: '0 auto 6px auto' }} />
                <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0f2b48' }}>
                  Upload KYC or Proposal Document
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Aadhaar, PAN Card, Previous Policy, Medical Records (PDF, JPG up to 10MB)
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {sampleDocs.map((doc, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: '#ffffff',
                      borderRadius: '10px',
                      padding: '10px 14px',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <FileText size={18} color="#2563eb" />
                      <div>
                        <div style={{ fontWeight: 700, color: '#0f2b48', fontSize: '0.85rem' }}>{doc.name}</div>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{doc.type} • {doc.date} • {doc.size}</div>
                      </div>
                    </div>

                    <button
                      style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
                      title="Download"
                    >
                      <Download size={14} color="#334155" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
