import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Video, 
  MapPin, 
  Clock, 
  Users, 
  Plus, 
  Copy, 
  Check, 
  ExternalLink, 
  CheckCircle2, 
  X, 
  Filter,
  Phone
} from 'lucide-react';
import { crmService } from '../../services/api';

export default function MeetingCalendarView({ preselectedClient, onCloseModal }) {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showScheduleModal, setShowScheduleModal] = useState(!!preselectedClient);
  const [copiedMeetId, setCopiedMeetId] = useState(null);

  const [scheduleForm, setScheduleForm] = useState({
    clientId: preselectedClient?.id || '',
    title: preselectedClient ? `Insurance Consultation with ${preselectedClient.fullName}` : '',
    purpose: 'Detailed Plan Comparison & Policy Finalization',
    product: preselectedClient?.insuranceType || 'Health Insurance',
    meetingDate: new Date().toISOString().slice(0, 10),
    startTime: '11:00',
    endTime: '11:30',
    meetingType: 'GOOGLE_MEET',
    location: '',
    notes: ''
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadMeetings();
  }, []);

  const loadMeetings = async () => {
    setLoading(true);
    try {
      const data = await crmService.getUpcomingMeetings();
      setMeetings(data);
    } catch (err) {
      console.error('Failed to load meetings:', err);
      // Fallback demo meetings
      setMeetings([
        {
          id: 201,
          clientId: 3,
          clientName: 'Dr. Sunita Deshmukh',
          clientPhone: '+91 9849556677',
          clientEmail: 'dr.sunita@example.com',
          advisorName: 'Priya Sharma',
          title: 'Hyundai Creta Zero-Dep Motor Insurance Consultation',
          purpose: 'Finalize NCB transfer and add-ons breakdown',
          product: 'Vehicle / Motor Insurance',
          meetingDatetime: new Date(Date.now() + 86400000).toISOString(),
          endDatetime: new Date(Date.now() + 86400000 + 1800000).toISOString(),
          googleMeetUrl: 'https://meet.google.com/adh-zpxk-mnq',
          meetingType: 'GOOGLE_MEET',
          status: 'SCHEDULED',
          outcomeNotes: 'Client wants zero room-rent equivalent cashless garage list.'
        },
        {
          id: 202,
          clientId: 2,
          clientName: 'Venkatesh Rao',
          clientPhone: '+91 9988112233',
          clientEmail: 'v.rao@example.com',
          advisorName: 'Rajesh Kumar',
          title: 'Term Life Insurance 1 Cr Comparison Meeting',
          purpose: 'Review HDFC Life vs Max Life comparison sheet',
          product: 'Term Life Insurance',
          meetingDatetime: new Date(Date.now() + 172800000).toISOString(),
          endDatetime: new Date(Date.now() + 172800000 + 1800000).toISOString(),
          googleMeetUrl: 'https://meet.google.com/adh-vkrw-qwe',
          meetingType: 'GOOGLE_MEET',
          status: 'SCHEDULED',
          outcomeNotes: 'Scheduled via client portal request.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const startDateTime = `${scheduleForm.meetingDate}T${scheduleForm.startTime}:00`;
      const endDateTime = `${scheduleForm.meetingDate}T${scheduleForm.endTime}:00`;

      await crmService.scheduleMeeting({
        clientId: scheduleForm.clientId || 1,
        title: scheduleForm.title,
        purpose: scheduleForm.purpose,
        product: scheduleForm.product,
        meetingDatetime: startDateTime,
        endDatetime: endDateTime,
        meetingType: scheduleForm.meetingType,
        location: scheduleForm.location,
        notes: scheduleForm.notes
      });

      setShowScheduleModal(false);
      loadMeetings();
      alert('Meeting scheduled successfully with Google Meet link generated!');
      if (onCloseModal) onCloseModal();
    } catch (err) {
      alert('Failed to schedule meeting: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyLink = (meetUrl, id) => {
    navigator.clipboard.writeText(meetUrl);
    setCopiedMeetId(id);
    setTimeout(() => setCopiedMeetId(null), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Top Header & Scheduling Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f2b48', margin: 0 }}>
            Meeting Calendar & Google Meet Scheduler
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.88rem', margin: '4px 0 0 0' }}>
            Schedule client consultations, generate Google Meet video links, and sync team agendas.
          </p>
        </div>

        <button
          onClick={() => setShowScheduleModal(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            color: '#ffffff',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '12px',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)'
          }}
        >
          <Plus size={18} /> Schedule New Meeting
        </button>
      </div>

      {/* Upcoming Meetings List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b', background: '#fff', borderRadius: '16px' }}>
            Loading scheduled meetings...
          </div>
        ) : meetings.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <CalendarIcon size={40} color="#94a3b8" style={{ margin: '0 auto 0.75rem auto' }} />
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f2b48' }}>No Upcoming Meetings</div>
            <p style={{ fontSize: '0.85rem', margin: '4px 0 0 0' }}>Schedule a consultation using the button above.</p>
          </div>
        ) : (
          meetings.map((m) => {
            const meetingDate = new Date(m.meetingDatetime);
            const dateStr = meetingDate.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
            const timeStr = meetingDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            return (
              <div
                key={m.id}
                style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  padding: '1.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1.25rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                }}
              >
                {/* Left: Meeting Title & Time */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                  <div style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '14px',
                    background: '#eff6ff',
                    color: '#2563eb',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    fontWeight: 800,
                    lineHeight: 1
                  }}>
                    <Video size={24} />
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f2b48' }}>
                        {m.title}
                      </span>
                      <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '9999px' }}>
                        {m.status}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '4px' }}>
                      👤 Client: <strong>{m.clientName}</strong> ({m.clientPhone}) • Advisor: <strong>{m.advisorName || 'Assigned Advisor'}</strong>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.82rem', color: '#64748b', marginTop: '6px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CalendarIcon size={14} color="#059669" /> {dateStr}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={14} color="#059669" /> {timeStr}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Users size={14} color="#2563eb" /> {m.product}
                      </span>
                    </div>

                    {m.purpose && (
                      <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '6px', fontStyle: 'italic' }}>
                        "{m.purpose}"
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Google Meet & Action Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {m.googleMeetUrl && (
                    <>
                      <a
                        href={m.googleMeetUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                          color: '#ffffff',
                          padding: '10px 18px',
                          borderRadius: '10px',
                          fontWeight: 700,
                          fontSize: '0.86rem',
                          textDecoration: 'none',
                          boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)'
                        }}
                      >
                        <Video size={16} /> Join Google Meet
                      </a>

                      <button
                        onClick={() => handleCopyLink(m.googleMeetUrl, m.id)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          background: '#f8fafc',
                          border: '1px solid #cbd5e1',
                          padding: '10px 12px',
                          borderRadius: '10px',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          color: '#334155',
                          cursor: 'pointer'
                        }}
                        title="Copy Google Meet Link"
                      >
                        {copiedMeetId === m.id ? <Check size={14} color="#059669" /> : <Copy size={14} />}
                        {copiedMeetId === m.id ? 'Copied!' : 'Copy Link'}
                      </button>
                    </>
                  )}
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Schedule Meeting Modal */}
      {showScheduleModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '560px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #0f2b48 0%, #091726 100%)',
              color: '#ffffff',
              padding: '1.25rem 1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
                  Schedule Consultation & Google Meet
                </h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>
                  Auto-generates Google Meet link and synchronizes calendar
                </p>
              </div>
              <button
                onClick={() => setShowScheduleModal(false)}
                style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Meeting Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Health Insurance Plan Consultation"
                  value={scheduleForm.title}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, title: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Meeting Type
                  </label>
                  <select
                    value={scheduleForm.meetingType}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, meetingType: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', background: '#ffffff' }}
                  >
                    <option value="GOOGLE_MEET">Google Meet Video Call</option>
                    <option value="IN_PERSON">In-Person Client Visit</option>
                    <option value="PHONE">Phone Conference</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Insurance Product
                  </label>
                  <select
                    value={scheduleForm.product}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, product: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', background: '#ffffff' }}
                  >
                    <option value="Health Insurance">Health Insurance</option>
                    <option value="Term Life Insurance">Term Life Insurance</option>
                    <option value="Vehicle / Motor Insurance">Vehicle Insurance</option>
                    <option value="Group / SME Insurance">Group / SME</option>
                    <option value="Loans & Financing">Loans</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={scheduleForm.meetingDate}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, meetingDate: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Start Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={scheduleForm.startTime}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, startTime: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    End Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={scheduleForm.endTime}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, endTime: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Meeting Purpose & Agenda
                </label>
                <textarea
                  rows="2"
                  placeholder="e.g. Present Star Health vs Care Supreme 10 Lakhs comparative breakdown and finalize proposal form."
                  value={scheduleForm.purpose}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, purpose: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ flex: 2, padding: '10px', borderRadius: '8px', border: 'none', background: '#2563eb', color: '#ffffff', fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer' }}
                >
                  {submitting ? 'Generating Meet...' : 'Create & Generate Google Meet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
