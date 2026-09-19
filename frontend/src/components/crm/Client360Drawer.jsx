import React, { useState, useEffect } from 'react';
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
  AlertCircle,
  UserCheck,
  Check,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { crmService } from '../../services/api';

export default function Client360Drawer({ client, onClose, onOpenCallModal, onOpenMeetingModal, onLeadUpdated }) {
  if (!client) return null;

  const { isSuperAdmin, isManager, user } = useAuth();
  const canReassign = isSuperAdmin || isManager;

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'timeline' | 'documents'
  const [currentClient, setCurrentClient] = useState(client);
  const [advisors, setAdvisors] = useState([]);
  
  // Reassign Modal state
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [targetAdvisorId, setTargetAdvisorId] = useState(client.assignedAdvisorId ? String(client.assignedAdvisorId) : '');
  const [reassignReason, setReassignReason] = useState('');
  const [reassigning, setReassigning] = useState(false);

  // Live Audit Logs State
  const [auditLogs, setAuditLogs] = useState([]);
  const [loadingAudit, setLoadingAudit] = useState(false);

  useEffect(() => {
    setCurrentClient(client);
    setTargetAdvisorId(client.assignedAdvisorId ? String(client.assignedAdvisorId) : '');
    if (client?.id) {
      loadClientAuditLogs(client.id);
    }
  }, [client]);

  const loadClientAuditLogs = async (clientId) => {
    setLoadingAudit(true);
    try {
      const logs = await crmService.getClientAuditLogs(clientId);
      setAuditLogs(logs || []);
    } catch (err) {
      console.error('Failed to load client audit logs:', err);
    } finally {
      setLoadingAudit(false);
    }
  };

  useEffect(() => {
    if (canReassign) {
      loadAdvisors();
    }
  }, [canReassign]);

  const loadAdvisors = async () => {
    try {
      const data = await crmService.getAdvisors();
      setAdvisors(data || []);
    } catch (err) {
      console.error('Failed to load advisors:', err);
    }
  };

  const handleReassignSubmit = async (e) => {
    e.preventDefault();
    if (!targetAdvisorId) {
      alert('Please select an Advisor');
      return;
    }
    setReassigning(true);
    try {
      const updated = await crmService.reassignLead(
        currentClient.id,
        Number(targetAdvisorId),
        reassignReason || 'Reassigned from Client 360 Drawer'
      );
      
      const targetAdv = advisors.find(a => String(a.id) === String(targetAdvisorId));
      const targetAdvisorName = targetAdv ? targetAdv.fullName : 'New Advisor';

      // Prepend reassignment audit item to timeline immediately
      setReassignHistory(prev => [
        {
          date: 'Just now',
          title: `Reassigned to ${targetAdvisorName}`,
          desc: `Transferred ownership from ${currentClient.assignedAdvisorName || 'Unassigned'} to ${targetAdvisorName}.`,
          reason: reassignReason || 'Direct management portfolio realignment',
          performedBy: user?.name || user?.fullName || 'Manager',
          icon: <UserCheck size={14} color="#4338ca" />
        },
        ...prev
      ]);

      setCurrentClient(prev => ({ ...prev, ...updated }));
      setShowReassignModal(false);
      if (onLeadUpdated) onLeadUpdated(updated);
    } catch (err) {
      alert('Failed to reassign client: ' + (err.response?.data?.message || err.message));
    } finally {
      setReassigning(false);
    }
  };

  const openWhatsApp = () => {
    const cleanPhone = (client.whatsappNumber || client.phoneNumber).replace(/[^0-9]/g, '');
    const text = encodeURIComponent(`Hello ${client.fullName}, this is your dedicated Insurance Specialist from Aadhiraksha InsurTech regarding your ${client.insuranceType} policy.`);
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  };

  const [reassignHistory, setReassignHistory] = useState([
    {
      date: 'Today, 10:45 AM',
      title: `Assigned to ${currentClient.assignedAdvisorName || 'Advisor'}`,
      desc: currentClient.notes?.includes('reassigned') || currentClient.notes?.includes('Specialist')
        ? currentClient.notes
        : `Handed over by Branch Management for dedicated advisory and quotation support.`,
      reason: 'Portfolio workload optimization & client specialist alignment',
      performedBy: currentClient.managerName || 'Branch Management',
      icon: <UserCheck size={14} color="#4338ca" />
    }
  ]);

  const sampleTimeline = [
    ...reassignHistory,
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', color: '#0f2b48' }}>
                    Assigned Team & Advisor
                  </div>
                  {canReassign && (
                    <button
                      onClick={() => setShowReassignModal(true)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: '#e0e7ff',
                        color: '#4338ca',
                        border: '1px solid #c7d2fe',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      <UserCheck size={13} /> Reassign
                    </button>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.85rem' }}>
                  <div>
                    <div style={{ color: '#64748b', fontSize: '0.75rem' }}>Insurance Advisor</div>
                    <div style={{ fontWeight: 700, color: '#0f2b48' }}>{currentClient.assignedAdvisorName || 'Unassigned'}</div>
                  </div>
                  <div>
                    <div style={{ color: '#64748b', fontSize: '0.75rem' }}>Branch Manager</div>
                    <div style={{ fontWeight: 700, color: '#0f2b48' }}>{currentClient.managerName || 'None'}</div>
                  </div>
                </div>
              </div>

              {/* Card 4: Notes */}
              {currentClient.notes && (
                <div style={{ background: '#fef3c7', borderRadius: '12px', padding: '1rem', border: '1px solid #fde68a' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: '#92400e', marginBottom: '4px' }}>
                    Advisor Notes
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#78350f', lineHeight: 1.4 }}>
                    {currentClient.notes}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 2: ACTIVITY TIMELINE & AUDIT TRAIL */}
          {activeTab === 'timeline' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f2b48', textTransform: 'uppercase' }}>
                  Live Audit Trail & Change History ({auditLogs.length})
                </div>
                <button
                  onClick={() => loadClientAuditLogs(currentClient.id)}
                  disabled={loadingAudit}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: '3px 8px',
                    fontSize: '0.74rem',
                    color: '#475569',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  <RefreshCw size={12} className={loadingAudit ? 'animate-spin' : ''} /> Refresh
                </button>
              </div>

              {loadingAudit ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                  <div style={{ width: '24px', height: '24px', border: '2px solid #cbd5e1', borderTopColor: '#f59e0b', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 8px auto' }} />
                  <span style={{ fontSize: '0.8rem' }}>Loading verified audit records...</span>
                </div>
              ) : auditLogs.length === 0 ? (
                <div style={{ background: '#ffffff', borderRadius: '12px', padding: '1.5rem', textAlign: 'center', border: '1px solid #e2e8f0', color: '#94a3b8' }}>
                  <ShieldCheck size={32} color="#cbd5e1" style={{ margin: '0 auto 8px auto' }} />
                  <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#475569' }}>No audit history recorded yet</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>Any status transitions, reassignments, or field edits will appear here.</div>
                </div>
              ) : (
                auditLogs.map((log) => {
                  const isReassign = log.action === 'REASSIGN';
                  const isStageChange = log.action === 'STATUS_CHANGE' || log.fieldName === 'stage';
                  const isCallLog = log.action === 'CALL_LOG';
                  const isMeeting = log.action === 'MEETING_SCHEDULED';

                  let badgeColor = '#0f2b48';
                  let badgeBg = '#f1f5f9';
                  let icon = <Clock size={14} color="#64748b" />;

                  if (isReassign) {
                    badgeColor = '#6d28d9';
                    badgeBg = '#ede9fe';
                    icon = <UserCheck size={14} color="#6d28d9" />;
                  } else if (isStageChange) {
                    badgeColor = '#b45309';
                    badgeBg = '#fef3c7';
                    icon = <CheckCircle2 size={14} color="#b45309" />;
                  } else if (isCallLog) {
                    badgeColor = '#0369a1';
                    badgeBg = '#e0f2fe';
                    icon = <Phone size={14} color="#0369a1" />;
                  } else if (isMeeting) {
                    badgeColor = '#a21caf';
                    badgeBg = '#fae8ff';
                    icon = <Calendar size={14} color="#a21caf" />;
                  }

                  const formattedDate = log.timestamp 
                    ? new Date(log.timestamp).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      })
                    : 'Recent';

                  return (
                    <div
                      key={log.id}
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
                        background: badgeBg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {icon}
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                          <div style={{ fontWeight: 700, color: '#0f2b48', fontSize: '0.88rem' }}>
                            {log.action === 'UPDATE' ? `Updated ${log.fieldName || 'field'}` : log.action.replace('_', ' ')}
                          </div>
                          {log.performedByName && (
                            <span style={{ fontSize: '0.72rem', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '1px 6px', borderRadius: '4px', color: '#64748b', fontWeight: 600 }}>
                              by {log.performedByName}
                            </span>
                          )}
                        </div>

                        <div style={{ fontSize: '0.74rem', color: '#94a3b8', margin: '2px 0 6px 0' }}>
                          {formattedDate}
                        </div>

                        {/* Value Diff */}
                        {log.oldValue || log.newValue ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', background: '#f8fafc', padding: '6px 8px', borderRadius: '6px', border: '1px solid #f1f5f9', flexWrap: 'wrap' }}>
                            {log.oldValue && (
                              <span style={{ color: '#dc2626', textDecoration: 'line-through', background: '#fef2f2', padding: '1px 4px', borderRadius: '3px' }}>
                                {log.oldValue}
                              </span>
                            )}
                            {log.oldValue && log.newValue && <span style={{ color: '#94a3b8' }}>→</span>}
                            {log.newValue && (
                              <span style={{ color: '#16a34a', fontWeight: 700, background: '#f0fdf4', padding: '1px 4px', borderRadius: '3px' }}>
                                {log.newValue}
                              </span>
                            )}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  );
                })
              )}
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

      {/* Modal: Reassign Advisor */}
      {showReassignModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          zIndex: 13000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '500px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden'
          }}>
            <div style={{
              background: '#ffffff',
              padding: '1.25rem 1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid #e2e8f0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: '#e0e7ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#4338ca'
                }}>
                  <UserCheck size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#0f2b48' }}>
                    Reassign Lead Advisor
                  </h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                    {currentClient.fullName} ({currentClient.clientCode})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowReassignModal(false)}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  color: '#64748b',
                  cursor: 'pointer',
                  borderRadius: '8px',
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleReassignSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Target Insurance Advisor *
                </label>
                <select
                  required
                  value={targetAdvisorId}
                  onChange={(e) => setTargetAdvisorId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    background: '#ffffff',
                    fontWeight: 600,
                    color: '#0f2b48'
                  }}
                >
                  <option value="">-- Choose Target Advisor --</option>
                  {advisors.map(adv => (
                    <option key={adv.id} value={adv.id}>
                      {adv.fullName} • {adv.branchCity || adv.employeeCode || 'Advisor'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Reassignment Reason / Transfer Notes
                </label>
                <textarea
                  rows="3"
                  placeholder="e.g. Assigned to specialist advisor for corporate health quote..."
                  value={reassignReason}
                  onChange={(e) => setReassignReason(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowReassignModal(false)}
                  disabled={reassigning}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reassigning}
                  style={{
                    flex: 2,
                    padding: '10px',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #4338ca, #3730a3)',
                    color: '#ffffff',
                    fontWeight: 700,
                    cursor: reassigning ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  {reassigning ? <RefreshCw size={14} className="animate-spin" /> : <Check size={16} />}
                  Confirm Reassign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
