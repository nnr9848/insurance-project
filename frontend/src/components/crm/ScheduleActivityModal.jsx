import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Video,
  Phone,
  Clock,
  User,
  Shield,
  FileText,
  X,
  Check,
  RefreshCw,
  Sparkles,
  Search,
  MessageSquare,
  Copy,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';
import { crmService } from '../../services/api';
import { openWhatsAppWithInvite, generateGoogleCalendarUrl } from '../../utils/calendarUtils';

const WhatsAppIcon = ({ size = 16, color = '#25D366' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.472 14.382C17.114 14.203 15.356 13.339 15.028 13.22C14.7 13.1 14.462 13.041 14.223 13.399C13.985 13.757 13.3 14.563 13.091 14.802C12.883 15.041 12.674 15.07 12.316 14.891C11.958 14.712 10.806 14.335 9.444 13.121C8.384 12.176 7.669 11.009 7.46 10.651C7.252 10.293 7.438 10.099 7.618 9.921C7.779 9.761 7.977 9.502 8.156 9.293C8.335 9.084 8.395 8.935 8.514 8.696C8.633 8.457 8.574 8.249 8.484 8.07C8.395 7.891 7.679 6.13 7.381 5.414C7.09 4.717 6.796 4.812 6.578 4.803C6.369 4.793 6.131 4.793 5.892 4.793C5.653 4.793 5.266 4.883 4.938 5.241C4.61 5.599 3.686 6.464 3.686 8.225C3.686 9.986 4.968 11.687 5.147 11.926C5.326 12.165 7.669 15.776 11.248 17.323C12.1 17.691 12.766 17.912 13.284 18.076C14.14 18.348 14.919 18.309 15.536 18.217C16.224 18.114 17.653 17.352 17.951 16.516C18.25 15.68 18.25 14.964 18.16 14.815C18.071 14.666 17.832 14.561 17.472 14.382Z" fill={color}/>
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12C2 13.89 2.525 15.657 3.438 17.17L2.052 22.234L7.247 20.871C8.706 21.603 10.312 22 12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2ZM4 12C4 7.582 7.582 4 12 4C16.418 4 20 7.582 20 12C20 16.418 16.418 20 12 20C10.487 20 9.068 19.578 7.854 18.847L7.545 18.661L4.47 19.468L5.291 16.467L5.086 16.141C4.389 15.029 4 13.565 4 12Z" fill={color}/>
  </svg>
);

export default function ScheduleActivityModal({
  isOpen,
  onClose,
  initialClient = null,
  initialType = 'MEETING', // 'MEETING' | 'CALL'
  onSuccess
}) {
  const [activityType, setActivityType] = useState(initialType); // 'MEETING' | 'CALL'
  const [clients, setClients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState(initialClient);

  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    startTime: '11:00',
    durationMinutes: 30,
    title: '',
    purpose: 'Detailed Plan Comparison & Policy Finalization',
    product: 'Health Insurance',
    meetingType: 'GOOGLE_MEET',
    location: '',
    reminderMilestone: 'EXACT',
    notes: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [scheduledResult, setScheduledResult] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [clientOpportunities, setClientOpportunities] = useState([]);

  // Auto-set initial values when modal opens
  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      now.setHours(now.getHours() + 1);
      now.setMinutes(0, 0, 0);

      const dateStr = now.toISOString().split('T')[0];
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const timeStr = `${hours}:${minutes}`;

      setSelectedClient(initialClient || null);
      setActivityType(initialType || 'MEETING');
      setScheduledResult(null);
      setError('');
      setSearchQuery('');

      const targetClient = initialClient || null;
      const initialProd = targetClient?.insuranceType || 'Health Insurance';

      setForm({
        clientId: targetClient?.id || '',
        date: dateStr,
        startTime: timeStr,
        durationMinutes: 30,
        title: targetClient
          ? `${(initialType || 'MEETING') === 'CALL' ? 'Follow-up Callback' : 'Advisory Consultation'} with ${targetClient.fullName}`
          : '',
        purpose: 'Detailed Plan Comparison & Policy Finalization',
        product: initialProd,
        meetingType: 'GOOGLE_MEET',
        location: '',
        reminderMilestone: 'EXACT',
        notes: ''
      });

      if (!initialClient) {
        loadClients();
      }
    }
  }, [isOpen, initialClient, initialType]);

  // Extract client's full multi-line opportunity portfolio when selectedClient changes
  useEffect(() => {
    if (selectedClient) {
      const opps = [
        {
          id: 'PRIMARY',
          label: `${selectedClient.insuranceType || 'Health Insurance'} (Primary Lead Policy)`,
          product: selectedClient.insuranceType || 'Health Insurance',
          category: 'PRIMARY'
        }
      ];

      if (selectedClient.notes) {
        const lines = selectedClient.notes.split('\n').filter(Boolean);
        lines.forEach((line, idx) => {
          let cat = 'General';
          if (/health/i.test(line)) cat = 'Health Insurance';
          else if (/life|term/i.test(line)) cat = 'Term Life Insurance';
          else if (/vehicle|motor|car|bike/i.test(line)) cat = 'Motor Vehicle Insurance';
          else if (/business|commercial/i.test(line)) cat = 'Business Insurance';
          else if (/travel/i.test(line)) cat = 'Travel Insurance';
          else if (/loan/i.test(line)) cat = 'Loan Protection';

          const inqMatch = line.match(/Inquiry\s*#?(\d+)/i);
          const inqId = inqMatch ? inqMatch[1] : null;

          opps.push({
            id: `OPP_${idx}`,
            label: `${cat} ${inqId ? `(Inquiry #${inqId})` : ''}`,
            product: cat,
            category: 'LINKED',
            inquiryId: inqId
          });
        });
      }

      setClientOpportunities(opps);

      const typeLabel = activityType === 'CALL' ? 'Follow-up Callback with' : 'Advisory Consultation with';
      setForm(prev => ({
        ...prev,
        title: `${typeLabel} ${selectedClient.fullName}`,
        product: prev.product || selectedClient.insuranceType || 'Health Insurance'
      }));
    } else {
      setClientOpportunities([]);
    }
  }, [selectedClient, activityType]);

  const loadClients = async () => {
    try {
      const data = await crmService.getClients();
      setClients(data || []);
    } catch (err) {
      console.error('Failed to load clients list:', err);
    }
  };

  if (!isOpen) return null;

  const filteredClients = clients.filter(c => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (c.fullName && c.fullName.toLowerCase().includes(q)) ||
      (c.phoneNumber && c.phoneNumber.includes(q)) ||
      (c.clientCode && c.clientCode.toLowerCase().includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q))
    );
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClient && !form.clientId) {
      setError('Please select a client to schedule this activity.');
      return;
    }

    const clientId = selectedClient ? selectedClient.id : form.clientId;
    setSubmitting(true);
    setError(null);

    try {
      const combinedStartIso = `${form.date}T${form.startTime || '11:00'}:00`;
      const startDate = new Date(combinedStartIso);
      const endDate = new Date(startDate.getTime() + (Number(form.durationMinutes) || 30) * 60000);
      const combinedEndIso = `${form.date}T${endDate.toTimeString().slice(0, 5)}:00`;

      if (activityType === 'MEETING') {
        // Schedule Video / In-Person Consultation
        const res = await crmService.scheduleMeeting({
          clientId: clientId,
          title: form.title || `Advisory Consultation with ${selectedClient?.fullName || 'Client'}`,
          purpose: form.purpose,
          product: form.product,
          meetingDatetime: combinedStartIso,
          endDatetime: combinedEndIso,
          meetingType: form.meetingType,
          location: form.location,
          notes: form.notes
        });

        setScheduledResult({
          type: 'MEETING',
          data: res,
          client: selectedClient || { fullName: 'Client', id: clientId },
          datetime: startDate,
          durationMinutes: Number(form.durationMinutes) || 30
        });

        if (onSuccess) onSuccess();
      } else {
        // Schedule Phone Callback
        const res = await crmService.scheduleFollowUp({
          clientId: clientId,
          scheduledDatetime: combinedStartIso,
          reminderMilestone: form.reminderMilestone,
          channel: 'PHONE_CALL',
          notes: form.notes || form.title || 'Scheduled Phone Follow-up'
        });

        setScheduledResult({
          type: 'CALL',
          data: res,
          client: selectedClient || { fullName: 'Client', id: clientId },
          datetime: startDate,
          durationMinutes: Number(form.durationMinutes) || 15
        });

        if (onSuccess) onSuccess();
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to schedule activity');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyLink = (url) => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'none',
      zIndex: 1200,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      animation: 'fadeIn 0.15s ease'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '18px',
        maxWidth: '560px',
        width: '100%',
        boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        maxHeight: '92vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* POST-SCHEDULING CONFIRMATION & SHARING SCREEN */}
        {scheduledResult ? (
          <div style={{ padding: '1.75rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                background: '#dcfce7',
                color: '#16a34a',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '0.75rem'
              }}>
                <CheckCircle2 size={32} />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f2b48' }}>
                {scheduledResult.type === 'MEETING' ? 'Consultation Confirmed!' : 'Callback Scheduled!'}
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.86rem', color: '#64748b' }}>
                Event successfully added to CRM and advisor schedule.
              </p>
            </div>

            {/* Event Summary Box */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b' }}>Client:</span>
                <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f2b48' }}>
                  {scheduledResult.client?.fullName}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b' }}>Scheduled For:</span>
                <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#2563eb' }}>
                  {scheduledResult.datetime.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' })} at {scheduledResult.datetime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                </span>
              </div>
              {scheduledResult.data?.googleMeetUrl && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '6px', borderTop: '1px dashed #cbd5e1' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b' }}>Google Meet:</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#059669', wordBreak: 'break-all' }}>
                    {scheduledResult.data.googleMeetUrl}
                  </span>
                </div>
              )}
            </div>

            {/* Instant 1-Click Sharing Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                Share with Client:
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {/* 1-Click WhatsApp Invite */}
                <button
                  type="button"
                  onClick={() => {
                    openWhatsAppWithInvite({
                      phoneNumber: scheduledResult.client?.phoneNumber,
                      clientName: scheduledResult.client?.fullName,
                      title: scheduledResult.data?.title || form.title,
                      topic: scheduledResult.data?.purpose || form.purpose,
                      datetime: scheduledResult.datetime,
                      durationMinutes: scheduledResult.durationMinutes,
                      googleMeetUrl: scheduledResult.data?.googleMeetUrl,
                      advisorName: scheduledResult.data?.advisorName
                    });
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    background: '#f0fdf4',
                    color: '#16a34a',
                    border: '1px solid #bbf7d0',
                    padding: '11px',
                    borderRadius: '10px',
                    fontWeight: 800,
                    fontSize: '0.84rem',
                    cursor: 'pointer'
                  }}
                >
                  <WhatsAppIcon size={16} color="#16a34a" /> WhatsApp Invite
                </button>

                {/* 1-Click Add to Google Calendar */}
                <a
                  href={generateGoogleCalendarUrl({
                    title: scheduledResult.data?.title || form.title,
                    description: `Aadhiraksha Insurance consultation.\nMeet Link: ${scheduledResult.data?.googleMeetUrl || 'Online'}\nTopic: ${form.purpose}`,
                    location: scheduledResult.data?.googleMeetUrl || 'Online / Google Meet',
                    startTime: scheduledResult.datetime,
                    endTime: new Date(scheduledResult.datetime.getTime() + scheduledResult.durationMinutes * 60000)
                  })}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    background: '#eff6ff',
                    color: '#2563eb',
                    border: '1px solid #bfdbfe',
                    padding: '11px',
                    borderRadius: '10px',
                    fontWeight: 800,
                    fontSize: '0.84rem',
                    cursor: 'pointer',
                    textDecoration: 'none'
                  }}
                >
                  <CalendarIcon size={15} /> Add to G-Cal
                </a>
              </div>

              {scheduledResult.data?.googleMeetUrl && (
                <button
                  type="button"
                  onClick={() => handleCopyLink(scheduledResult.data.googleMeetUrl)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    background: copiedLink ? '#ecfdf5' : '#f8fafc',
                    color: copiedLink ? '#059669' : '#334155',
                    border: '1px solid #cbd5e1',
                    padding: '10px',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer'
                  }}
                >
                  {copiedLink ? <Check size={14} /> : <Copy size={14} />}
                  {copiedLink ? 'Meet Link Copied to Clipboard!' : 'Copy Google Meet Link'}
                </button>
              )}
            </div>

            {/* Done / Dismiss button */}
            <button
              type="button"
              onClick={() => {
                setScheduledResult(null);
                onClose();
              }}
              style={{
                marginTop: '0.5rem',
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                border: 'none',
                background: '#0f2b48',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.88rem',
                cursor: 'pointer'
              }}
            >
              Done & Close
            </button>
          </div>
        ) : (
          <>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid #f1f5f9',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#f8fafc'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              background: activityType === 'MEETING' ? '#e0e7ff' : '#dbeafe',
              color: activityType === 'MEETING' ? '#4338ca' : '#1d4ed8',
              padding: '8px',
              borderRadius: '10px'
            }}>
              {activityType === 'MEETING' ? <Video size={20} /> : <Phone size={20} />}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f2b48' }}>
                Schedule Client Engagement
              </h3>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '1px' }}>
                Book consultations with automatic Google Meet link or calendar callbacks
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px', borderRadius: '6px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} style={{ overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          
          {/* 1. Activity Type Segmented Switch */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              Select Engagement Channel
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', background: '#f1f5f9', padding: '4px', borderRadius: '12px' }}>
              <button
                type="button"
                onClick={() => setActivityType('MEETING')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '10px',
                  borderRadius: '9px',
                  border: 'none',
                  background: activityType === 'MEETING' ? '#ffffff' : 'transparent',
                  color: activityType === 'MEETING' ? '#4338ca' : '#64748b',
                  fontWeight: activityType === 'MEETING' ? 800 : 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  boxShadow: activityType === 'MEETING' ? '0 2px 5px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <Video size={16} /> 🎥 Video Meeting
              </button>

              <button
                type="button"
                onClick={() => setActivityType('CALL')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '10px',
                  borderRadius: '9px',
                  border: 'none',
                  background: activityType === 'CALL' ? '#ffffff' : 'transparent',
                  color: activityType === 'CALL' ? '#1d4ed8' : '#64748b',
                  fontWeight: activityType === 'CALL' ? 800 : 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  boxShadow: activityType === 'CALL' ? '0 2px 5px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <Phone size={16} /> 📞 Phone Callback
              </button>
            </div>
          </div>

          {/* 2. Client Selector / Target Info */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              Target Client
            </label>
            {selectedClient ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px'
                }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f2b48' }}>
                      {selectedClient.fullName} <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>({selectedClient.clientCode || `CL-${selectedClient.id}`})</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                      📞 {selectedClient.phoneNumber}
                    </div>
                  </div>
                  {!initialClient && (
                    <button
                      type="button"
                      onClick={() => setSelectedClient(null)}
                      style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Change
                    </button>
                  )}
                </div>

                {/* Multi-Product Portfolio Opportunity Selector */}
                {clientOpportunities.length > 0 && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#475569', marginBottom: '3px' }}>
                      Consultation Opportunity / Product Line
                    </label>
                    <select
                      value={form.product}
                      onChange={(e) => {
                        const nextProd = e.target.value;
                        setForm(prev => ({
                          ...prev,
                          product: nextProd,
                          title: `${activityType === 'CALL' ? 'Follow-up Callback' : 'Advisory Consultation'} with ${selectedClient.fullName} (${nextProd})`
                        }));
                      }}
                      style={{
                        width: '100%',
                        padding: '8px 11px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.84rem',
                        fontWeight: 600,
                        color: '#0f2b48',
                        background: '#ffffff',
                        boxSizing: 'border-box'
                      }}
                    >
                      {clientOpportunities.map(opp => (
                        <option key={opp.id} value={opp.product}>
                          {opp.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <input
                  type="text"
                  placeholder="Search client by name, phone, or client code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.86rem',
                    boxSizing: 'border-box',
                    marginBottom: '6px'
                  }}
                />
                <div style={{ maxHeight: '140px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                  {filteredClients.slice(0, 10).map(c => (
                    <div
                      key={c.id}
                      onClick={() => {
                        setSelectedClient(c);
                        setSearchQuery('');
                      }}
                      style={{
                        padding: '8px 12px',
                        borderBottom: '1px solid #f1f5f9',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.84rem', color: '#0f2b48' }}>{c.fullName}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{c.phoneNumber} • {c.insuranceType}</div>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: '#2563eb', fontWeight: 700 }}>Select</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 3. Date, Time & Duration Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Date
              </label>
              <input
                type="date"
                required
                value={form.date}
                onChange={(e) => setForm(prev => ({ ...prev, date: e.target.value }))}
                style={{ width: '100%', padding: '9px 10px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.85rem', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Start Time
              </label>
              <input
                type="time"
                required
                value={form.startTime}
                onChange={(e) => setForm(prev => ({ ...prev, startTime: e.target.value }))}
                style={{ width: '100%', padding: '9px 10px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.85rem', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Duration
              </label>
              <select
                value={form.durationMinutes}
                onChange={(e) => setForm(prev => ({ ...prev, durationMinutes: Number(e.target.value) }))}
                style={{ width: '100%', padding: '9px 10px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.85rem', boxSizing: 'border-box', background: '#ffffff' }}
              >
                <option value={15}>15 mins</option>
                <option value={30}>30 mins</option>
                <option value={45}>45 mins</option>
                <option value={60}>60 mins</option>
              </select>
            </div>
          </div>

          {/* 4. Dynamic Channel Specific Options */}
          {activityType === 'MEETING' ? (
            <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 700, color: '#166534' }}>
                <Sparkles size={14} color="#16a34a" /> Instant Google Meet Link
              </div>
              <p style={{ margin: 0, fontSize: '0.76rem', color: '#64748b' }}>
                A secure Google Meet video link will be automatically generated and synchronized with your CRM calendar.
              </p>
            </div>
          ) : (
            <div style={{ background: '#eff6ff', padding: '12px 14px', borderRadius: '12px', border: '1px solid #bfdbfe', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 700, color: '#1e40af' }}>
                <Phone size={14} color="#2563eb" /> Direct Phone Telephony Task
              </div>
              <p style={{ margin: 0, fontSize: '0.76rem', color: '#475569' }}>
                This callback will appear in your <strong>Daily Work Agenda</strong> with 1-click dial and WhatsApp reach buttons.
              </p>
            </div>
          )}

          {/* 5. Agenda & Notes */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
              Topic / Consultation Notes
            </label>
            <textarea
              rows="2"
              placeholder="e.g. Plan comparison discussion, proposal review, or policy clarification..."
              value={form.notes}
              onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                fontSize: '0.85rem',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div style={{ padding: '8px 12px', borderRadius: '8px', background: '#fef2f2', color: '#dc2626', fontSize: '0.82rem', fontWeight: 600 }}>
              {error}
            </div>
          )}

          {/* Submit Buttons */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              style={{
                flex: 1,
                padding: '11px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                background: '#f8fafc',
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
              style={{
                flex: 2,
                padding: '11px',
                borderRadius: '10px',
                border: 'none',
                background: activityType === 'MEETING'
                  ? 'linear-gradient(135deg, #4338ca 0%, #3730a3 100%)'
                  : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: submitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px -2px rgba(37, 99, 235, 0.3)'
              }}
            >
              {submitting ? <RefreshCw size={15} className="animate-spin" /> : <Check size={16} />}
              {activityType === 'MEETING' ? 'Confirm Video Meeting' : 'Schedule Phone Callback'}
            </button>
          </div>
        </form>
        </>
        )}
      </div>
    </div>
  );
}
