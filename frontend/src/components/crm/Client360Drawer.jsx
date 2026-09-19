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
  RefreshCw,
  Globe,
  HeartHandshake,
  DollarSign,
  Award,
  PhoneCall,
  Sparkles,
  Trash2
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

  // Live Quotations State
  const [clientQuotes, setClientQuotes] = useState([]);
  const [loadingQuotes, setLoadingQuotes] = useState(false);

  // Live Documents State
  const [clientDocs, setClientDocs] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);

  // Live Call Logs State
  const [clientCalls, setClientCalls] = useState([]);
  const [loadingCalls, setLoadingCalls] = useState(false);

  useEffect(() => {
    setCurrentClient(client);
    setTargetAdvisorId(client.assignedAdvisorId ? String(client.assignedAdvisorId) : '');
    if (client?.id) {
      loadClientAuditLogs(client.id);
      loadClientQuotes(client.id);
      loadClientDocs(client.id);
      loadClientCalls(client.id);
    }
  }, [client]);

  const loadClientCalls = async (clientId) => {
    setLoadingCalls(true);
    try {
      const data = await crmService.getClientCallLogs(clientId);
      setClientCalls(data || []);
    } catch (err) {
      console.error('Failed to load client call logs:', err);
    } finally {
      setLoadingCalls(false);
    }
  };

  const loadClientDocs = async (clientId) => {
    setLoadingDocs(true);
    try {
      const data = await crmService.getClientDocuments(clientId);
      setClientDocs(data || []);
    } catch (err) {
      console.error('Failed to load client documents:', err);
    } finally {
      setLoadingDocs(false);
    }
  };

  const loadClientQuotes = async (clientId) => {
    setLoadingQuotes(true);
    try {
      const data = await crmService.getClientQuotations(clientId);
      setClientQuotes(data || []);
    } catch (err) {
      console.error('Failed to load client quotations:', err);
    } finally {
      setLoadingQuotes(false);
    }
  };

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
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#ffffff', padding: '0 18px', overflowX: 'auto' }}>
          {[
            { id: 'overview', label: 'Overview & Plan' },
            { id: 'calls', label: `Calls (${clientCalls.length})` },
            { id: 'quotes', label: `Quotations (${clientQuotes.length})` },
            { id: 'documents', label: `Documents (${clientDocs.length})` },
            { id: 'timeline', label: `Timeline & Audit (${auditLogs.length})` }
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
          
          {/* TAB 1: OVERVIEW & CLIENT 360 INFORMATION */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              
              {/* 1. Client Identification & Demographics */}
              <div style={{ background: '#ffffff', borderRadius: '14px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', color: '#0f2b48', marginBottom: '12px', letterSpacing: '0.04em' }}>
                  <User size={15} color="#2563eb" /> Client Information & Profile
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '0.85rem' }}>
                  <div>
                    <div style={{ color: '#64748b', fontSize: '0.74rem', fontWeight: 600 }}>• Client ID</div>
                    <div style={{ fontWeight: 800, color: '#0f2b48', fontFamily: 'monospace', fontSize: '0.92rem' }}>
                      {currentClient.clientCode || `CL-${currentClient.id}`}
                    </div>
                  </div>

                  <div>
                    <div style={{ color: '#64748b', fontSize: '0.74rem', fontWeight: 600 }}>• Name</div>
                    <div style={{ fontWeight: 800, color: '#0f2b48' }}>{currentClient.fullName}</div>
                  </div>

                  <div>
                    <div style={{ color: '#64748b', fontSize: '0.74rem', fontWeight: 600 }}>• Company / Account</div>
                    <div style={{ fontWeight: 700, color: '#334155' }}>
                      {currentClient.companyName || 'Individual / Retail Client'}
                    </div>
                  </div>

                  <div>
                    <div style={{ color: '#64748b', fontSize: '0.74rem', fontWeight: 600 }}>• Date of Birth (DOB)</div>
                    <div style={{ fontWeight: 700, color: '#334155' }}>
                      {currentClient.dob ? new Date(currentClient.dob).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Not Specified'}
                    </div>
                  </div>

                  <div>
                    <div style={{ color: '#64748b', fontSize: '0.74rem', fontWeight: 600 }}>• Location</div>
                    <div style={{ fontWeight: 700, color: '#334155' }}>
                      {currentClient.city || 'Bengaluru'}{currentClient.state ? `, ${currentClient.state}` : ''} {currentClient.pincode ? `(${currentClient.pincode})` : ''}
                    </div>
                  </div>

                  <div>
                    <div style={{ color: '#64748b', fontSize: '0.74rem', fontWeight: 600 }}>• Nationality</div>
                    <div style={{ fontWeight: 700, color: '#059669', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Globe size={13} /> {currentClient.nationality || 'Indian (Resident)'}
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Direct Communication Channels */}
              <div style={{ background: '#ffffff', borderRadius: '14px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', color: '#0f2b48', marginBottom: '12px', letterSpacing: '0.04em' }}>
                  <Phone size={15} color="#059669" /> Direct Contact Channels
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '0.85rem' }}>
                  <div>
                    <div style={{ color: '#64748b', fontSize: '0.74rem', fontWeight: 600 }}>• Mobile Phone</div>
                    <div style={{ fontWeight: 700, color: '#091726', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <a href={`tel:${currentClient.phoneNumber}`} style={{ color: '#2563eb', textDecoration: 'none' }}>
                        {currentClient.phoneNumber}
                      </a>
                    </div>
                  </div>

                  <div>
                    <div style={{ color: '#64748b', fontSize: '0.74rem', fontWeight: 600 }}>• WhatsApp</div>
                    <div style={{ fontWeight: 700, color: '#059669', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <MessageSquare size={13} /> {currentClient.whatsappNumber || currentClient.phoneNumber}
                    </div>
                  </div>

                  <div>
                    <div style={{ color: '#64748b', fontSize: '0.74rem', fontWeight: 600 }}>• Email Address</div>
                    <div style={{ fontWeight: 700, color: '#334155' }}>
                      {currentClient.email ? (
                        <a href={`mailto:${currentClient.email}`} style={{ color: '#2563eb', textDecoration: 'none' }}>
                          {currentClient.email}
                        </a>
                      ) : 'No email provided'}
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Insurance Portfolio & Policy Details */}
              <div style={{ background: '#ffffff', borderRadius: '14px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', color: '#0f2b48', marginBottom: '12px', letterSpacing: '0.04em' }}>
                  <ShieldCheck size={15} color="#d97706" /> Insurance Type & Policy Coverage
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '0.85rem' }}>
                  <div>
                    <div style={{ color: '#64748b', fontSize: '0.74rem', fontWeight: 600 }}>• Insurance Type</div>
                    <div style={{ fontWeight: 800, color: '#0f2b48' }}>{currentClient.insuranceType || 'General Insurance'}</div>
                  </div>

                  <div>
                    <div style={{ color: '#64748b', fontSize: '0.74rem', fontWeight: 600 }}>• Existing Policy / Insurer</div>
                    <div style={{ fontWeight: 700, color: '#d97706' }}>
                      {currentClient.existingInsurer || 'None (New Policy Requirement)'}
                    </div>
                  </div>

                  <div>
                    <div style={{ color: '#64748b', fontSize: '0.74rem', fontWeight: 600 }}>• Policy Expiry Date</div>
                    <div style={{ fontWeight: 700, color: currentClient.policyExpiryDate ? '#b45309' : '#64748b' }}>
                      {currentClient.policyExpiryDate ? new Date(currentClient.policyExpiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Pending Issuance'}
                    </div>
                  </div>

                  <div>
                    <div style={{ color: '#64748b', fontSize: '0.74rem', fontWeight: 600 }}>• Desired Sum Insured</div>
                    <div style={{ fontWeight: 800, color: '#059669' }}>
                      {currentClient.sumInsured || '₹10 Lakhs'}
                    </div>
                  </div>

                  <div>
                    <div style={{ color: '#64748b', fontSize: '0.74rem', fontWeight: 600 }}>• Estimated Premium</div>
                    <div style={{ fontWeight: 800, color: '#059669' }}>
                      {currentClient.estimatedPremium ? `₹${Number(currentClient.estimatedPremium).toLocaleString('en-IN')}` : 'Pending Quote Proposal'}
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Team Ownership, Management & Lead Source */}
              <div style={{ background: '#ffffff', borderRadius: '14px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', color: '#0f2b48', letterSpacing: '0.04em' }}>
                    <HeartHandshake size={15} color="#7c3aed" /> Assigned Team & Lead Origin
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

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '0.85rem' }}>
                  <div>
                    <div style={{ color: '#64748b', fontSize: '0.74rem', fontWeight: 600 }}>• Assigned Employee</div>
                    <div style={{ fontWeight: 800, color: '#0f2b48' }}>
                      {currentClient.assignedAdvisorName || 'Unassigned'}
                    </div>
                  </div>

                  <div>
                    <div style={{ color: '#64748b', fontSize: '0.74rem', fontWeight: 600 }}>• Assigned Manager</div>
                    <div style={{ fontWeight: 800, color: '#0f2b48' }}>
                      {currentClient.managerName || 'Branch Management'}
                    </div>
                  </div>

                  <div>
                    <div style={{ color: '#64748b', fontSize: '0.74rem', fontWeight: 600 }}>• Lead Source</div>
                    <div style={{ fontWeight: 700, color: '#2563eb' }}>
                      {currentClient.leadSource || 'Web Portal Inquiry'}
                    </div>
                  </div>
                </div>
              </div>

              {/* 5. Advisory Notes */}
              {currentClient.notes && (
                <div style={{ background: '#fef3c7', borderRadius: '14px', padding: '1.1rem', border: '1px solid #fde68a' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: '#92400e', marginBottom: '4px' }}>
                    Advisor Discussion & Policy Notes
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#78350f', lineHeight: 1.5 }}>
                    {currentClient.notes}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB: CALL HISTORY LOGS */}
          {activeTab === 'calls' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f2b48', textTransform: 'uppercase' }}>
                  Call Logs & Dispositions ({clientCalls.length})
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => onOpenCallModal && onOpenCallModal(currentClient)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: '#091726',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '4px 10px',
                      fontSize: '0.74rem',
                      cursor: 'pointer',
                      fontWeight: 700
                    }}
                  >
                    <Phone size={12} /> Log New Call
                  </button>
                  <button
                    onClick={() => loadClientCalls(currentClient.id)}
                    disabled={loadingCalls}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      padding: '4px 8px',
                      fontSize: '0.74rem',
                      color: '#475569',
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    <RefreshCw size={12} className={loadingCalls ? 'animate-spin' : ''} /> Refresh
                  </button>
                </div>
              </div>

              {loadingCalls ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                  <div style={{ width: '24px', height: '24px', border: '2px solid #cbd5e1', borderTopColor: '#f59e0b', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 8px auto' }} />
                  <span style={{ fontSize: '0.8rem' }}>Loading call interactions...</span>
                </div>
              ) : clientCalls.length === 0 ? (
                <div style={{ background: '#ffffff', borderRadius: '12px', padding: '1.5rem', textAlign: 'center', border: '1px solid #e2e8f0', color: '#94a3b8' }}>
                  <PhoneCall size={32} color="#cbd5e1" style={{ margin: '0 auto 8px auto' }} />
                  <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#475569' }}>No calls logged for this client yet</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>Click "Log New Call" above to record an advisor interaction.</div>
                </div>
              ) : (
                clientCalls.map(c => {
                  const isPositive = c.callResult === 'INTERESTED' || c.callResult === 'QUOTE_REQUESTED' || c.callResult === 'CONVERTED';
                  const isNotAnswered = c.callResult === 'NOT_ANSWERED' || c.callResult === 'WRONG_NUMBER';

                  let badgeColor = isPositive ? '#15803d' : isNotAnswered ? '#dc2626' : '#0284c7';
                  let badgeBg = isPositive ? '#dcfce7' : isNotAnswered ? '#fee2e2' : '#e0f2fe';

                  return (
                    <div
                      key={c.id}
                      style={{
                        background: '#ffffff',
                        borderRadius: '12px',
                        padding: '1rem',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          color: badgeColor,
                          background: badgeBg,
                          padding: '2px 8px',
                          borderRadius: '6px'
                        }}>
                          {c.callResult.replace('_', ' ')}
                        </span>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                          {c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                        </div>
                      </div>

                      <div style={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.4, margin: '2px 0' }}>
                        {c.callNotes || 'No notes provided.'}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.74rem', color: '#64748b', background: '#f8fafc', padding: '6px 8px', borderRadius: '6px' }}>
                        <div>Duration: <strong>{c.callDurationSeconds ? `${Math.floor(c.callDurationSeconds / 60)}m ${c.callDurationSeconds % 60}s` : '0s'}</strong></div>
                        <div>Advisor: <strong>{c.advisorName}</strong></div>
                        {c.nextFollowUpDate && (
                          <div style={{ color: '#0284c7' }}>
                            Next: <strong>{new Date(c.nextFollowUpDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</strong>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB: QUOTATIONS & PROPOSALS */}
          {activeTab === 'quotes' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f2b48', textTransform: 'uppercase' }}>
                  Client Quotations ({clientQuotes.length})
                </div>
                <button
                  onClick={() => loadClientQuotes(currentClient.id)}
                  disabled={loadingQuotes}
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
                  <RefreshCw size={12} className={loadingQuotes ? 'animate-spin' : ''} /> Refresh
                </button>
              </div>

              {loadingQuotes ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                  <div style={{ width: '24px', height: '24px', border: '2px solid #cbd5e1', borderTopColor: '#f59e0b', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 8px auto' }} />
                  <span style={{ fontSize: '0.8rem' }}>Loading quotation history...</span>
                </div>
              ) : clientQuotes.length === 0 ? (
                <div style={{ background: '#ffffff', borderRadius: '12px', padding: '1.5rem', textAlign: 'center', border: '1px solid #e2e8f0', color: '#94a3b8' }}>
                  <FileText size={32} color="#cbd5e1" style={{ margin: '0 auto 8px auto' }} />
                  <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#475569' }}>No quotations generated yet</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>Generate a new quote from the Quotation Desk in CRM.</div>
                </div>
              ) : (
                clientQuotes.map(q => (
                  <div
                    key={q.id}
                    style={{
                      background: '#ffffff',
                      borderRadius: '12px',
                      padding: '1rem',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#0284c7', background: '#e0f2fe', padding: '2px 6px', borderRadius: '4px' }}>
                          {q.quoteNumber}
                        </span>
                        <div style={{ fontWeight: 800, color: '#0f2b48', fontSize: '0.92rem', marginTop: '4px' }}>
                          {q.insurerName}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                          {q.planName} • {q.planVariant || 'Standard'}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#16a34a' }}>
                          ₹{q.totalPremium}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>incl. 18% GST</div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', background: '#f8fafc', padding: '8px 10px', borderRadius: '8px', fontSize: '0.75rem', border: '1px solid #f1f5f9' }}>
                      <div><span style={{ color: '#64748b' }}>Sum Insured:</span> <strong>{q.sumInsured}</strong></div>
                      <div><span style={{ color: '#64748b' }}>Room Rent:</span> <strong>{q.roomRentLimit}</strong></div>
                      <div><span style={{ color: '#64748b' }}>Restoration:</span> <strong>{q.restorationBenefit}</strong></div>
                      <div><span style={{ color: '#64748b' }}>Status:</span> <strong style={{ color: q.status === 'ACCEPTED' ? '#16a34a' : '#0284c7' }}>{q.status}</strong></div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
                      <button
                        onClick={async () => {
                          const res = await crmService.sendQuoteDispatch(q.id, { channel: 'WHATSAPP', recipientPhone: currentClient.phoneNumber });
                          if (res.whatsAppUrl) window.open(res.whatsAppUrl, '_blank');
                          loadClientQuotes(currentClient.id);
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          background: '#dcfce7',
                          color: '#15803d',
                          border: '1px solid #bbf7d0',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        <MessageSquare size={12} /> WhatsApp Quote
                      </button>
                    </div>
                  </div>
                ))
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

          {/* TAB: DOCUMENT LOCKER & KYC */}
          {activeTab === 'documents' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {/* WhatsApp Checklist & Request Bar */}
              <div style={{
                background: '#f0fdf4',
                borderRadius: '12px',
                padding: '12px 14px',
                border: '1px solid #bbf7d0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                <div>
                  <div style={{ fontWeight: 800, color: '#15803d', fontSize: '0.82rem' }}>Request Client Documents</div>
                  <div style={{ fontSize: '0.72rem', color: '#166534' }}>Send itemized KYC checklist (Aadhaar, PAN, Policy) via WhatsApp</div>
                </div>
                <button
                  onClick={async () => {
                    const res = await crmService.requestDocumentsChecklist(currentClient.id, ['AADHAAR', 'PAN', 'PREVIOUS_POLICY', 'MEDICAL_RECORD']);
                    if (res.whatsAppUrl) window.open(res.whatsAppUrl, '_blank');
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: '#16a34a',
                    color: '#ffffff',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <MessageSquare size={13} /> Send WhatsApp Request
                </button>
              </div>

              {/* Upload trigger */}
              <label style={{
                border: '2px dashed #cbd5e1',
                borderRadius: '12px',
                padding: '1.25rem',
                textAlign: 'center',
                background: '#ffffff',
                cursor: 'pointer',
                display: 'block'
              }}>
                <input 
                  type="file" 
                  style={{ display: 'none' }} 
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      await crmService.uploadDocument({
                        clientId: currentClient.id,
                        documentType: 'OTHER',
                        fileName: file.name,
                        fileUrl: `https://storage.googleapis.com/aadhiraksha-kyc/${Date.now()}-${file.name}`,
                        fileSizeBytes: file.size,
                        fileType: file.type || 'application/pdf'
                      });
                      loadClientDocs(currentClient.id);
                    } catch (err) {
                      alert('Failed to upload file: ' + (err.response?.data?.message || err.message));
                    }
                  }}
                />
                <Upload size={22} color="#059669" style={{ margin: '0 auto 4px auto' }} />
                <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f2b48' }}>
                  Click to Browse & Upload KYC File
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  Aadhaar, PAN Card, Previous Policy, Medical Records (PDF, JPG up to 15MB)
                </div>
              </label>

              {/* Documents List */}
              {loadingDocs ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                  <div style={{ width: '24px', height: '24px', border: '2px solid #cbd5e1', borderTopColor: '#f59e0b', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 8px auto' }} />
                  <span style={{ fontSize: '0.8rem' }}>Loading attached documents...</span>
                </div>
              ) : clientDocs.length === 0 ? (
                <div style={{ background: '#ffffff', borderRadius: '12px', padding: '1.5rem', textAlign: 'center', border: '1px solid #e2e8f0', color: '#94a3b8' }}>
                  <ShieldCheck size={32} color="#cbd5e1" style={{ margin: '0 auto 8px auto' }} />
                  <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#475569' }}>No KYC documents attached yet</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>Upload proposal files or send WhatsApp document request above.</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {clientDocs.map((doc) => {
                    const isVerified = doc.verificationStatus === 'VERIFIED';
                    return (
                      <div
                        key={doc.id}
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
                          <FileText size={20} color={isVerified ? '#16a34a' : '#2563eb'} />
                          <div>
                            <div style={{ fontWeight: 700, color: '#0f2b48', fontSize: '0.85rem' }}>{doc.fileName}</div>
                            <div style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span>{doc.documentType.replace('_', ' ')}</span>
                              <span>•</span>
                              <span style={{ color: isVerified ? '#15803d' : '#b45309', fontWeight: 700 }}>
                                {doc.verificationStatus.replace('_', ' ')}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {!isVerified && (
                            <button
                              onClick={async () => {
                                await crmService.verifyDocument(doc.id, { status: 'VERIFIED', notes: 'Verified in Client 360' });
                                loadClientDocs(currentClient.id);
                              }}
                              style={{ background: '#dcfce7', border: '1px solid #bbf7d0', color: '#15803d', padding: '4px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}
                              title="Mark Verified"
                            >
                              Verify ✓
                            </button>
                          )}
                          <button
                            onClick={() => window.open(doc.fileUrl, '_blank')}
                            style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
                            title="Preview / Download"
                          >
                            <Download size={14} color="#334155" />
                          </button>
                          <button
                            onClick={async () => {
                              if (window.confirm('Delete this document?')) {
                                await crmService.deleteDocument(doc.id);
                                loadClientDocs(currentClient.id);
                              }
                            }}
                            style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
                            title="Delete"
                          >
                            <Trash2 size={14} color="#dc2626" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
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
