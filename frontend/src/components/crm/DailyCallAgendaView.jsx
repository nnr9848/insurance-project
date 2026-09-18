import React, { useState, useEffect } from 'react';
import { 
  PhoneCall, 
  Phone, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Calendar, 
  MessageSquare, 
  User, 
  Filter, 
  ChevronRight, 
  X,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { crmService } from '../../services/api';

export default function DailyCallAgendaView({ onOpenClient360, onOpenMeetingModal }) {
  const [dueToday, setDueToday] = useState([]);
  const [overdue, setOverdue] = useState([]);
  const [activeTab, setActiveTab] = useState('dueToday'); // 'dueToday' | 'overdue'
  const [loading, setLoading] = useState(true);

  // Call Logger Modal
  const [showCallModal, setShowCallModal] = useState(false);
  const [activeTask, setActiveTask] = useState(null);
  const [callForm, setCallForm] = useState({
    callResult: 'INTERESTED',
    callDurationSeconds: 120,
    callNotes: '',
    nextFollowUpDate: '',
    nextFollowUpTime: '10:30',
    updateStageTo: 'FOLLOWUP'
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadAgenda();
  }, []);

  const loadAgenda = async () => {
    setLoading(true);
    try {
      const [dueData, overdueData] = await Promise.all([
        crmService.getDueTodayFollowUps(),
        crmService.getOverdueFollowUps()
      ]);
      setDueToday(dueData);
      setOverdue(overdueData);
    } catch (err) {
      console.error('Failed to load call agenda:', err);
      // Fallback demo data
      setDueToday([
        {
          id: 101,
          clientId: 1,
          clientCode: 'CL-801245',
          clientName: 'Ahmed Ali',
          clientPhone: '+91 9849012345',
          insuranceType: 'Health Insurance',
          scheduledDatetime: new Date(Date.now() + 3600000).toISOString(),
          channel: 'PHONE_CALL',
          status: 'PENDING',
          notes: 'Client requested health quotation comparison with Star Health and Care.'
        },
        {
          id: 102,
          clientId: 2,
          clientCode: 'CL-801246',
          clientName: 'Venkatesh Rao',
          clientPhone: '+91 9988112233',
          insuranceType: 'Term Life Insurance',
          scheduledDatetime: new Date(Date.now() + 7200000).toISOString(),
          channel: 'PHONE_CALL',
          status: 'PENDING',
          notes: 'Discuss 1 Cr term quote options and tax savings under 80C.'
        }
      ]);
      setOverdue([
        {
          id: 103,
          clientId: 3,
          clientCode: 'CL-801247',
          clientName: 'Dr. Sunita Deshmukh',
          clientPhone: '+91 9849556677',
          insuranceType: 'Vehicle / Motor Insurance',
          scheduledDatetime: new Date(Date.now() - 86400000).toISOString(),
          channel: 'PHONE_CALL',
          status: 'PENDING',
          notes: 'Policy expiring in 10 days - urgent callback needed for NCB retention.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCallModal = (task) => {
    setActiveTask(task);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().slice(0, 10);

    setCallForm({
      callResult: 'INTERESTED',
      callDurationSeconds: 120,
      callNotes: '',
      nextFollowUpDate: dateStr,
      nextFollowUpTime: '11:00',
      updateStageTo: 'FOLLOWUP'
    });
    setShowCallModal(true);
  };

  const handleCallSubmit = async (e) => {
    e.preventDefault();
    if (!activeTask) return;
    setSubmitting(true);
    try {
      const combinedDateTime = callForm.nextFollowUpDate 
        ? `${callForm.nextFollowUpDate}T${callForm.nextFollowUpTime || '10:00'}:00` 
        : null;

      await crmService.logCall({
        clientId: activeTask.clientId,
        callResult: callForm.callResult,
        callDurationSeconds: Number(callForm.callDurationSeconds) || 0,
        callNotes: callForm.callNotes,
        nextFollowUpDate: combinedDateTime,
        updateStageTo: callForm.updateStageTo
      });

      setShowCallModal(false);
      loadAgenda();
      alert('Call disposition logged and next follow-up scheduled successfully!');
    } catch (err) {
      alert('Failed to log call: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const openWhatsApp = (phone, name) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const text = encodeURIComponent(`Hello ${name}, I tried calling you regarding your insurance inquiry at Aadhiraksha InsurTech. When would be a good time to connect?`);
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  };

  const activeList = activeTab === 'dueToday' ? dueToday : overdue;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Top Cockpit Stats Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        
        <div style={{
          background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
          color: '#ffffff',
          borderRadius: '16px',
          padding: '1.25rem 1.5rem',
          boxShadow: '0 4px 14px rgba(5, 150, 105, 0.25)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: '#a7f3d0' }}>
              Calls Due Today
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '2px' }}>
              {dueToday.length}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#d1fae5' }}>Scheduled client follow-ups</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '14px' }}>
            <PhoneCall size={28} />
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
          color: '#ffffff',
          borderRadius: '16px',
          padding: '1.25rem 1.5rem',
          boxShadow: '0 4px 14px rgba(220, 38, 38, 0.25)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: '#fecaca' }}>
              Overdue Follow-ups
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '2px' }}>
              {overdue.length}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#fee2e2' }}>Requires immediate advisor action</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '14px' }}>
            <AlertCircle size={28} />
          </div>
        </div>

        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
        }}>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>
              Call Completion Target
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f2b48', marginTop: '2px' }}>
              85%
            </div>
            <div style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 600 }}>↑ 12% vs yesterday</div>
          </div>
          <div style={{ background: '#f0fdf4', color: '#059669', padding: '12px', borderRadius: '14px' }}>
            <CheckCircle2 size={28} />
          </div>
        </div>

      </div>

      {/* Agenda Tabs & Queue */}
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        padding: '1.25rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
      }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '1.25rem' }}>
          <button
            onClick={() => setActiveTab('dueToday')}
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'dueToday' ? '#0f2b48' : '#f1f5f9',
              color: activeTab === 'dueToday' ? '#ffffff' : '#64748b',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Clock size={16} /> Due Today ({dueToday.length})
          </button>

          <button
            onClick={() => setActiveTab('overdue')}
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'overdue' ? '#b91c1c' : '#f1f5f9',
              color: activeTab === 'overdue' ? '#ffffff' : '#64748b',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <AlertCircle size={16} /> Overdue Queue ({overdue.length})
          </button>
        </div>

        {/* Task Cards List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            Loading call agenda...
          </div>
        ) : activeList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            <CheckCircle2 size={40} color="#059669" style={{ margin: '0 auto 0.75rem auto' }} />
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f2b48' }}>All Caught Up!</div>
            <p style={{ fontSize: '0.85rem', margin: '4px 0 0 0' }}>No pending tasks in this queue right now.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {activeList.map((task) => {
              const taskDate = new Date(task.scheduledDatetime);
              const timeFormatted = taskDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

              return (
                <div
                  key={task.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '14px',
                    padding: '1rem 1.25rem',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {/* Left: Client & Call info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '12px',
                      background: activeTab === 'overdue' ? '#fee2e2' : '#ecfdf5',
                      color: activeTab === 'overdue' ? '#dc2626' : '#059669',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <PhoneCall size={20} />
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 800, color: '#0f2b48', fontSize: '0.95rem' }}>
                          {task.clientName}
                        </span>
                        <span style={{ fontSize: '0.72rem', background: '#ffffff', border: '1px solid #cbd5e1', padding: '2px 6px', borderRadius: '4px', fontWeight: 600, color: '#475569' }}>
                          {task.clientCode}
                        </span>
                        <span style={{ fontSize: '0.74rem', background: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: '9999px', fontWeight: 700 }}>
                          {task.insuranceType}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.84rem', color: '#475569', marginTop: '3px' }}>
                        📞 <strong>{task.clientPhone}</strong> • Scheduled: <strong>{timeFormatted}</strong>
                      </div>

                      {task.notes && (
                        <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px', fontStyle: 'italic' }}>
                          "{task.notes}"
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Quick Action Trigger Buttons */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {/* Call & Log Button */}
                    <button
                      onClick={() => handleOpenCallModal(task)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                        color: '#ffffff',
                        border: 'none',
                        padding: '9px 16px',
                        borderRadius: '10px',
                        fontWeight: 700,
                        fontSize: '0.84rem',
                        cursor: 'pointer',
                        boxShadow: '0 4px 10px rgba(5, 150, 105, 0.2)'
                      }}
                    >
                      <Phone size={14} /> Call & Log Result
                    </button>

                    {/* WhatsApp */}
                    <button
                      onClick={() => openWhatsApp(task.clientPhone, task.clientName)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: '#dcfce7',
                        color: '#15803d',
                        border: '1px solid #86efac',
                        padding: '8px 12px',
                        borderRadius: '10px',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        cursor: 'pointer'
                      }}
                    >
                      <MessageSquare size={14} /> WhatsApp
                    </button>

                    {/* Schedule Meet */}
                    <button
                      onClick={() => onOpenMeetingModal && onOpenMeetingModal({ id: task.clientId, fullName: task.clientName, phoneNumber: task.clientPhone, insuranceType: task.insuranceType })}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: '#eff6ff',
                        color: '#2563eb',
                        border: '1px solid #bfdbfe',
                        padding: '8px 12px',
                        borderRadius: '10px',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        cursor: 'pointer'
                      }}
                    >
                      <Calendar size={14} /> Meet
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Standardized 11-Point Call Disposition Modal */}
      {showCallModal && activeTask && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.7)',
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
                  Log Call Disposition: {activeTask.clientName}
                </h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>
                  {activeTask.clientPhone} • {activeTask.insuranceType}
                </p>
              </div>
              <button
                onClick={() => setShowCallModal(false)}
                style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCallSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {/* 1. Call Result Outcome Dropdown (11 Standardized Dispositions) */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Call Disposition Result *
                </label>
                <select
                  value={callForm.callResult}
                  onChange={(e) => setCallForm({ ...callForm, callResult: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', fontWeight: 600, background: '#ffffff' }}
                >
                  <option value="INTERESTED">✅ Call Answered - Interested</option>
                  <option value="QUOTE_REQUESTED">📋 Call Answered - Requesting Quotation</option>
                  <option value="CALL_BACK">⏳ Call Answered - Call Back Later</option>
                  <option value="MEETING_REQUESTED">📅 Call Answered - Schedule Meeting</option>
                  <option value="DOCS_REQUESTED">📁 Call Answered - Collecting KYC / Docs</option>
                  <option value="CONVERTED">🎉 Call Answered - Converted to Sale</option>
                  <option value="NOT_INTERESTED">❌ Call Answered - Not Interested</option>
                  <option value="NOT_ANSWERED">📞 Call Not Answered / Ringing</option>
                  <option value="BUSY">📴 Line Busy / Rejected</option>
                  <option value="WRONG_NUMBER">🚫 Wrong / Invalid Number</option>
                  <option value="LOST">⛔ Lost Lead</option>
                </select>
              </div>

              {/* 2. Call Notes */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Call Discussion Notes *
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder="e.g. Client requested quotation breakdown comparing Star Health Optima with Care Supreme. Budget is ₹18,000/yr."
                  value={callForm.callNotes}
                  onChange={(e) => setCallForm({ ...callForm, callNotes: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>

              {/* 3. Next Follow-up Scheduler */}
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f2b48', marginBottom: '8px' }}>
                  📅 Schedule Next Follow-up
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '2px' }}>
                      Next Call Date
                    </label>
                    <input
                      type="date"
                      value={callForm.nextFollowUpDate}
                      onChange={(e) => setCallForm({ ...callForm, nextFollowUpDate: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '2px' }}>
                      Next Call Time
                    </label>
                    <input
                      type="time"
                      value={callForm.nextFollowUpTime}
                      onChange={(e) => setCallForm({ ...callForm, nextFollowUpTime: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowCallModal(false)}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ flex: 2, padding: '10px', borderRadius: '8px', border: 'none', background: '#059669', color: '#ffffff', fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer' }}
                >
                  {submitting ? 'Saving...' : 'Save & Set Reminder'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
