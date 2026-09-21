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
  MessageSquare
} from 'lucide-react';
import { crmService } from '../../services/api';

/**
 * Consolidated Enterprise Schedule Activity Modal
 * Supports seamless switching between Video Consultations (Google Meet) & Phone Callbacks
 */
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

  // Sync state on open / initial prop changes
  useEffect(() => {
    if (isOpen) {
      setActivityType(initialType || 'MEETING');
      setSelectedClient(initialClient);
      setError(null);

      const now = new Date();
      const nextHour = new Date(now.getTime() + 60 * 60 * 1000);
      const hours = String(nextHour.getHours()).padStart(2, '0');
      const timeStr = `${hours}:00`;

      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      setForm({
        date: dateStr,
        startTime: timeStr,
        durationMinutes: 30,
        title: initialClient
          ? `${initialType === 'CALL' ? 'Follow-up Callback' : 'Advisory Consultation'} with ${initialClient.fullName}`
          : '',
        purpose: 'Detailed Plan Comparison & Policy Finalization',
        product: initialClient?.insuranceType || 'Health Insurance',
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

  // Update title when client or activity type changes
  useEffect(() => {
    if (selectedClient) {
      const typeLabel = activityType === 'CALL' ? 'Follow-up Callback with' : 'Advisory Consultation with';
      setForm(prev => ({
        ...prev,
        title: `${typeLabel} ${selectedClient.fullName}`,
        product: selectedClient.insuranceType || prev.product
      }));
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
        await crmService.scheduleMeeting({
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
      } else {
        // Schedule Phone Callback
        await crmService.scheduleFollowUp({
          clientId: clientId,
          scheduledDatetime: combinedStartIso,
          reminderMilestone: form.reminderMilestone,
          channel: 'PHONE_CALL',
          notes: form.notes || form.title || 'Scheduled Phone Follow-up'
        });
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to schedule activity');
    } finally {
      setSubmitting(false);
    }
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
                    📞 {selectedClient.phoneNumber} • {selectedClient.insuranceType || 'Insurance Lead'}
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
      </div>
    </div>
  );
}
