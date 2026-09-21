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
  ChevronRight, 
  X,
  Sparkles,
  ArrowRight,
  UserCheck,
  Check,
  RefreshCw,
  Video,
  ExternalLink,
  Plus
} from 'lucide-react';
import { crmService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { formatWhatsAppNumber } from '../../utils/crmDeduplication';
import WhatsAppIcon from '../common/WhatsAppIcon';
import ScheduleActivityModal from './ScheduleActivityModal';

export default function DailyCallAgendaView({ onOpenClient360, onOpenMeetingModal }) {
  const { isSuperAdmin, isManager, user } = useAuth();
  const canReassign = isSuperAdmin || isManager;

  const [dueToday, setDueToday] = useState([]);
  const [overdue, setOverdue] = useState([]);
  const [todayMeetings, setTodayMeetings] = useState([]);
  const [advisors, setAdvisors] = useState([]);
  const [activeTab, setActiveTab] = useState('dueToday'); // 'dueToday' | 'overdue' | 'meetings'
  const [loading, setLoading] = useState(true);
  const [showScheduleActivityModal, setShowScheduleActivityModal] = useState(false);

  // Quick Reassign Modal state for Overdue cards
  const [reassignTask, setReassignTask] = useState(null);
  const [targetAdvisorId, setTargetAdvisorId] = useState('');
  const [reassignReason, setReassignReason] = useState('');
  const [reassigning, setReassigning] = useState(false);

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
    if (!targetAdvisorId || !reassignTask) {
      alert('Please select an Advisor');
      return;
    }
    setReassigning(true);
    try {
      await crmService.reassignLead(
        reassignTask.clientId,
        Number(targetAdvisorId),
        reassignReason || 'Reassigned from Overdue Follow-ups Cockpit'
      );
      setReassignTask(null);
      await loadAgenda();
    } catch (err) {
      alert('Failed to reassign lead: ' + (err.response?.data?.message || err.message));
    } finally {
      setReassigning(false);
    }
  };

  const loadAgenda = async () => {
    setLoading(true);
    try {
      const [dueData, overdueData, meetingsData] = await Promise.all([
        crmService.getDueTodayFollowUps().catch(() => []),
        crmService.getOverdueFollowUps().catch(() => []),
        crmService.getUpcomingMeetings().catch(() => [])
      ]);
      setDueToday(dueData || []);
      setOverdue(overdueData || []);
      setTodayMeetings(meetingsData || []);
    } catch (err) {
      console.error('Failed to load call agenda:', err);
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
    const cleanPhone = formatWhatsAppNumber(phone);
    const text = encodeURIComponent(`Hello ${name}, I tried calling you regarding your insurance inquiry at Aadhiraksha InsurTech. When would be a good time to connect?`);
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  };

  const [filterType, setFilterType] = useState('PENDING'); // 'PENDING' | 'ALL' | 'COMPLETED' | 'MEETING' | 'CALL' | 'OVERDUE'
  const [selectedEventModal, setSelectedEventModal] = useState(null);
  const [meetingOutcomeModal, setMeetingOutcomeModal] = useState(null);
  const [outcomeForm, setOutcomeForm] = useState({
    outcomeTag: 'INTERESTED',
    notes: ''
  });

  // Unify today's items into a single chronological agenda
  const unifiedTodayItems = [
    ...todayMeetings.map(m => {
      const dt = m.meetingDatetime ? new Date(m.meetingDatetime) : new Date();
      return {
        id: `meet-${m.id}`,
        originalId: m.id,
        kind: 'MEETING',
        datetime: dt,
        title: m.title || `Advisory Consultation`,
        clientName: m.clientName,
        clientId: m.clientId,
        clientPhone: m.clientPhone,
        clientCode: m.clientCode,
        insuranceType: m.product || 'General Advisory',
        status: m.status,
        googleMeetUrl: m.googleMeetUrl,
        purpose: m.purpose,
        advisorName: m.advisorName,
        outcomeNotes: m.outcomeNotes,
        badgeColor: '#2563eb',
        bgColor: '#eff6ff',
        borderColor: '#bfdbfe'
      };
    }),
    ...dueToday.map(d => {
      const dt = d.scheduledDatetime ? new Date(d.scheduledDatetime) : new Date();
      return {
        id: `call-${d.id}`,
        originalId: d.id,
        kind: 'CALL',
        datetime: dt,
        title: d.title || `Scheduled Follow-up Callback`,
        clientName: d.clientName,
        clientId: d.clientId,
        clientPhone: d.clientPhone,
        clientCode: d.clientCode,
        insuranceType: d.insuranceType || 'Insurance Lead',
        status: 'PENDING_CALL',
        notes: d.notes,
        advisorName: d.advisorName,
        advisorId: d.advisorId,
        badgeColor: '#059669',
        bgColor: '#ecfdf5',
        borderColor: '#a7f3d0'
      };
    })
  ].sort((a, b) => a.datetime - b.datetime);

  const completedMeetingsCount = todayMeetings.filter(m => m.status === 'COMPLETED').length;
  const pendingTasksCount = unifiedTodayItems.filter(i => i.status !== 'COMPLETED').length;
  const totalTodayTasks = unifiedTodayItems.length;
  const overdueTasksCount = overdue.length;

  // Filtered dataset
  const displayedItems = (() => {
    if (filterType === 'OVERDUE') {
      return overdue.map(o => {
        const dt = o.scheduledDatetime ? new Date(o.scheduledDatetime) : new Date();
        return {
          id: `overdue-${o.id}`,
          originalId: o.id,
          kind: 'OVERDUE_CALL',
          datetime: dt,
          title: o.title || `Missed Follow-up Callback`,
          clientName: o.clientName,
          clientId: o.clientId,
          clientPhone: o.clientPhone,
          clientCode: o.clientCode || `CL-${o.clientId}`,
          insuranceType: o.insuranceType || 'Insurance Lead',
          status: 'OVERDUE',
          notes: o.notes,
          advisorName: o.advisorName,
          advisorId: o.advisorId,
          badgeColor: '#dc2626',
          bgColor: '#fef2f2',
          borderColor: '#fecaca'
        };
      });
    }
    if (filterType === 'PENDING') return unifiedTodayItems.filter(i => i.status !== 'COMPLETED');
    if (filterType === 'COMPLETED') return unifiedTodayItems.filter(i => i.status === 'COMPLETED');
    if (filterType === 'MEETING') return unifiedTodayItems.filter(i => i.kind === 'MEETING');
    if (filterType === 'CALL') return unifiedTodayItems.filter(i => i.kind === 'CALL');
    return unifiedTodayItems;
  })();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* 1. Unified Cockpit KPI Ribbon */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        
        {/* Card 1: Today's Total Work Schedule */}
        <div 
          onClick={() => setFilterType('ALL')}
          style={{
            background: filterType !== 'OVERDUE' ? 'linear-gradient(135deg, #0f2b48 0%, #1e40af 100%)' : '#ffffff',
            color: filterType !== 'OVERDUE' ? '#ffffff' : '#0f2b48',
            border: filterType !== 'OVERDUE' ? 'none' : '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '1.25rem 1.5rem',
            boxShadow: filterType !== 'OVERDUE' ? '0 8px 20px -4px rgba(15, 43, 72, 0.3)' : '0 2px 6px rgba(0,0,0,0.02)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: filterType !== 'OVERDUE' ? '#93c5fd' : '#64748b' }}>
              Today's Schedule
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '2px', lineHeight: 1 }}>
              {totalTodayTasks}
            </div>
            <div style={{ fontSize: '0.76rem', color: filterType !== 'OVERDUE' ? '#dbeafe' : '#64748b', marginTop: '6px' }}>
              {todayMeetings.length} Meets • {dueToday.length} Callbacks
            </div>
          </div>
          <div style={{ background: filterType !== 'OVERDUE' ? 'rgba(255,255,255,0.15)' : '#eff6ff', color: filterType !== 'OVERDUE' ? '#ffffff' : '#2563eb', padding: '12px', borderRadius: '14px' }}>
            <Calendar size={28} />
          </div>
        </div>

        {/* Card 2: Overdue Action Required */}
        <div 
          onClick={() => setFilterType('OVERDUE')}
          style={{
            background: filterType === 'OVERDUE' 
              ? 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)' 
              : (overdue.length > 0 ? '#fff1f2' : '#ffffff'),
            color: filterType === 'OVERDUE' ? '#ffffff' : (overdue.length > 0 ? '#991b1b' : '#0f2b48'),
            border: filterType === 'OVERDUE' ? 'none' : (overdue.length > 0 ? '1px solid #fecdd3' : '1px solid #e2e8f0'),
            borderRadius: '16px',
            padding: '1.25rem 1.5rem',
            boxShadow: filterType === 'OVERDUE' ? '0 8px 20px -4px rgba(220, 38, 38, 0.3)' : '0 2px 6px rgba(0,0,0,0.02)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: filterType === 'OVERDUE' ? '#fecaca' : '#dc2626' }}>
              Overdue Tasks
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '2px', lineHeight: 1 }}>
              {overdueTasksCount}
            </div>
            <div style={{ fontSize: '0.76rem', color: filterType === 'OVERDUE' ? '#fee2e2' : (overdue.length > 0 ? '#b91c1c' : '#64748b'), marginTop: '6px' }}>
              {overdue.length > 0 ? '⚠️ Immediate action needed' : '✓ Zero overdue tasks'}
            </div>
          </div>
          <div style={{ background: filterType === 'OVERDUE' ? 'rgba(255,255,255,0.15)' : (overdue.length > 0 ? '#fee2e2' : '#f8fafc'), color: filterType === 'OVERDUE' ? '#ffffff' : '#dc2626', padding: '12px', borderRadius: '14px' }}>
            <AlertCircle size={28} />
          </div>
        </div>

        {/* Card 3: Completion Progress */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
        }}>
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748b' }}>
              Completed Today
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f2b48', marginTop: '2px', lineHeight: 1 }}>
              {completedMeetingsCount}
            </div>
            <div style={{ fontSize: '0.76rem', color: '#059669', fontWeight: 700, marginTop: '6px' }}>
              {totalTodayTasks > 0 ? `${Math.round((completedMeetingsCount / totalTodayTasks) * 100)}% of today's workload completed` : 'All tasks up to date'}
            </div>
          </div>
          <div style={{ background: '#f0fdf4', color: '#059669', padding: '12px', borderRadius: '14px' }}>
            <CheckCircle2 size={28} />
          </div>
        </div>

      </div>

      {/* 2. Unified Chronological Activity Feed */}
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        padding: '1.25rem 1.5rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
      }}>
        
        {/* Header & Filter Pills Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f2b48', margin: 0 }}>
              {filterType === 'OVERDUE' ? '⚠️ Overdue Action Queue' : 'Today\'s Chronological Work Schedule'}
            </h2>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
              {filterType === 'OVERDUE' 
                ? 'Tasks requiring immediate catch-up or advisor reallocation' 
                : new Date().toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
            </div>
          </div>

          {/* Quick Filter Pill Chips & Action Button */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '6px', background: '#f1f5f9', padding: '4px', borderRadius: '10px', flexWrap: 'wrap' }}>
              {[
                { id: 'ALL', label: `All Today (${totalTodayTasks})` },
                { id: 'PENDING', label: `⏳ Pending (${pendingTasksCount})` },
                { id: 'COMPLETED', label: `✓ Completed (${completedMeetingsCount})` },
                { id: 'MEETING', label: `🎥 Meets (${todayMeetings.length})` },
                { id: 'CALL', label: `📞 Calls (${dueToday.length})` },
                { id: 'OVERDUE', label: `⚠️ Overdue (${overdue.length})` }
              ].map(pill => (
                <button
                  key={pill.id}
                  onClick={() => setFilterType(pill.id)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '7px',
                    border: 'none',
                    background: filterType === pill.id ? '#ffffff' : 'transparent',
                    color: filterType === pill.id ? '#0f2b48' : '#64748b',
                    fontWeight: filterType === pill.id ? 800 : 600,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    boxShadow: filterType === pill.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowScheduleActivityModal(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                color: '#ffffff',
                border: 'none',
                padding: '7px 14px',
                borderRadius: '9px',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)',
                whiteSpace: 'nowrap'
              }}
            >
              <Plus size={15} /> Schedule Activity
            </button>
          </div>
        </div>

        {/* Task Feed List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            <div style={{ width: '32px', height: '32px', border: '3px solid #cbd5e1', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px auto' }} />
            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Syncing today's agenda...</div>
          </div>
        ) : displayedItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#64748b' }}>
            <CheckCircle2 size={44} color="#059669" style={{ margin: '0 auto 0.75rem auto' }} />
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f2b48' }}>All Caught Up!</div>
            <p style={{ fontSize: '0.84rem', color: '#64748b', maxWidth: '420px', margin: '4px auto 0 auto' }}>
              {filterType === 'OVERDUE' 
                ? 'No overdue follow-ups in the queue. Great job maintaining customer SLAs!' 
                : 'No pending meetings or callbacks scheduled for this view.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {displayedItems.map((item) => {
              const isMeet = item.kind === 'MEETING';
              const isCompleted = item.status === 'COMPLETED';
              // An item is overdue only if it has an explicit OVERDUE status or came from the overdue past queue
              const isOverdue = !isCompleted && (item.kind === 'OVERDUE_CALL' || item.status === 'OVERDUE');
              const timeParts = item.datetime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).split(' ');
              const timeDigits = timeParts[0];
              const timePeriod = timeParts[1] || '';

              return (
                <div
                  key={item.id}
                  className="crm-agenda-compact-card"
                  style={{
                    background: isCompleted ? '#f0fdf4' : (isOverdue ? '#fff1f2' : '#ffffff'),
                    border: isCompleted ? '1px solid #bbf7d0' : (isOverdue ? '1px solid #fecdd3' : '1px solid #e2e8f0'),
                    borderRadius: '10px',
                    padding: '0.75rem 0.85rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.45rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                  }}
                >
                  {/* Row 1: Left (Time Badge + Prospect Name + Code + Category + Status) | Right (1-Tap Circular Channels & Status) */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                    
                    {/* Identity & Badges */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1, flexWrap: 'wrap' }}>
                      {/* Compact Time Pill */}
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                        background: isCompleted ? '#dcfce7' : (isOverdue ? '#fee2e2' : (isMeet ? '#eff6ff' : '#ecfdf5')),
                        color: isCompleted ? '#15803d' : (isOverdue ? '#dc2626' : (isMeet ? '#2563eb' : '#059669')),
                        border: `1px solid ${isCompleted ? '#bbf7d0' : (isOverdue ? '#fecaca' : (isMeet ? '#bfdbfe' : '#a7f3d0'))}`,
                        padding: '1px 6px',
                        borderRadius: '6px',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        whiteSpace: 'nowrap',
                        flexShrink: 0
                      }}>
                        {isMeet ? <Video size={11} /> : <PhoneCall size={11} />}
                        <span>{timeDigits} {timePeriod}</span>
                      </span>

                      {/* Prospect Name */}
                      <span 
                        onClick={() => onOpenClient360 && onOpenClient360({ id: item.clientId, fullName: item.clientName, phoneNumber: item.clientPhone })}
                        style={{ fontWeight: 800, color: '#0f2b48', fontSize: '0.88rem', cursor: 'pointer', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                      >
                        {item.clientName}
                      </span>

                      {/* Client Code */}
                      {item.clientCode && (
                        <span 
                          onClick={() => onOpenClient360 && onOpenClient360({ id: item.clientId, fullName: item.clientName, phoneNumber: item.clientPhone })}
                          style={{ fontFamily: 'monospace', fontWeight: 700, color: '#059669', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '0px 4px', borderRadius: '4px', fontSize: '0.65rem', cursor: 'pointer', flexShrink: 0 }}
                        >
                          {item.clientCode}
                        </span>
                      )}

                      {/* Vertical Badge */}
                      <span style={{ fontSize: '0.68rem', background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', padding: '1px 5px', borderRadius: '4px', fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0 }}>
                        {item.insuranceType}
                      </span>

                      {/* Status Pill */}
                      {isCompleted ? (
                        <span style={{ fontSize: '0.65rem', background: '#dcfce7', color: '#15803d', fontWeight: 800, padding: '1px 5px', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                          ✓ COMPLETED
                        </span>
                      ) : isOverdue ? (
                        <span style={{ fontSize: '0.65rem', background: '#fee2e2', color: '#dc2626', fontWeight: 800, padding: '1px 5px', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                          ⚠️ OVERDUE
                        </span>
                      ) : item.datetime < new Date() ? (
                        <span style={{ fontSize: '0.65rem', background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', fontWeight: 700, padding: '1px 5px', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                          ⏱️ Outcome Pending
                        </span>
                      ) : null}
                    </div>

                    {/* Right: Quick Reach Touch Icons (Call, WhatsApp, Meet Link) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                      {/* 1-Tap Telephony Phone Call */}
                      {item.clientPhone && (
                        <button
                          type="button"
                          onClick={() => handleOpenCallModal(item)}
                          title={`Call ${item.clientName} (${item.clientPhone})`}
                          style={{
                            width: '26px',
                            height: '26px',
                            borderRadius: '6px',
                            background: '#ecfdf5',
                            color: '#059669',
                            border: '1px solid #a7f3d0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            padding: 0
                          }}
                        >
                          <Phone size={12} />
                        </button>
                      )}

                      {/* 1-Tap WhatsApp */}
                      {item.clientPhone && (
                        <button
                          type="button"
                          onClick={() => openWhatsApp(item.clientPhone, item.clientName)}
                          title="Open WhatsApp"
                          style={{
                            width: '26px',
                            height: '26px',
                            borderRadius: '6px',
                            background: '#f0fdf4',
                            color: '#16a34a',
                            border: '1px solid #bbf7d0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            padding: 0
                          }}
                        >
                          <WhatsAppIcon size={12} color="#16a34a" />
                        </button>
                      )}

                      {/* 1-Tap Google Meet Video Link */}
                      {isMeet && item.googleMeetUrl && (
                        <a
                          href={item.googleMeetUrl}
                          target="_blank"
                          rel="noreferrer"
                          title="Open Google Meet"
                          style={{
                            width: '26px',
                            height: '26px',
                            borderRadius: '6px',
                            background: '#eff6ff',
                            color: '#2563eb',
                            border: '1px solid #bfdbfe',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textDecoration: 'none'
                          }}
                        >
                          <Video size={12} />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Row 2: Topic / Notes & Action Buttons */}
                  <div style={{
                    borderTop: '1px dashed #e2e8f0',
                    paddingTop: '0.4rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.4rem'
                  }}>
                    {/* Left: Title & Purpose */}
                    <div style={{ fontSize: '0.74rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', minWidth: 0, flex: 1 }}>
                      <span style={{ fontWeight: 600, color: '#334155' }}>{item.title}</span>
                      {item.advisorName && (
                        <span style={{ fontSize: '0.68rem', background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '0px 4px', borderRadius: '3px', color: '#64748b' }}>
                          Advisor: {item.advisorName}
                        </span>
                      )}
                      {(item.purpose || item.notes || item.outcomeNotes) && (
                        <span style={{ color: item.outcomeNotes ? '#059669' : '#64748b', fontStyle: item.notes ? 'italic' : 'normal', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '320px' }}>
                          • {item.outcomeNotes ? `✓ ${item.outcomeNotes}` : (item.purpose || `"${item.notes}"`)}
                        </span>
                      )}
                    </div>

                    {/* Right: Compact Action Buttons */}
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', flexShrink: 0, marginLeft: 'auto' }}>
                      {/* Mark Completed (for Meetings) */}
                      {isMeet && !isCompleted && (
                        <button
                          type="button"
                          onClick={() => {
                            setMeetingOutcomeModal(item);
                            setOutcomeForm({
                              outcomeTag: 'INTERESTED',
                              notes: ''
                            });
                          }}
                          style={{
                            background: '#059669',
                            color: '#ffffff',
                            border: 'none',
                            padding: '3px 7px',
                            borderRadius: '5px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px'
                          }}
                        >
                          <CheckCircle2 size={11} /> Mark Done
                        </button>
                      )}

                      {/* Log Call (for Phone tasks) */}
                      {!isMeet && !isCompleted && (
                        <button
                          type="button"
                          onClick={() => handleOpenCallModal(item)}
                          style={{
                            background: '#059669',
                            color: '#ffffff',
                            border: 'none',
                            padding: '3px 7px',
                            borderRadius: '5px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px'
                          }}
                        >
                          <PhoneCall size={11} /> Log Call
                        </button>
                      )}

                      {/* Reassign (if manager & overdue) */}
                      {canReassign && isOverdue && (
                        <button
                          type="button"
                          onClick={() => {
                            setReassignTask(item);
                            setTargetAdvisorId(item.advisorId ? String(item.advisorId) : '');
                            setReassignReason('');
                          }}
                          style={{
                            background: '#e0e7ff',
                            color: '#4338ca',
                            border: '1px solid #c7d2fe',
                            padding: '3px 6px',
                            borderRadius: '5px',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          Reassign
                        </button>
                      )}

                      {/* Schedule Followup Meeting Link */}
                      {!isMeet && (
                        <button
                          type="button"
                          onClick={() => onOpenMeetingModal && onOpenMeetingModal({ id: item.clientId, fullName: item.clientName, phoneNumber: item.clientPhone, insuranceType: item.insuranceType })}
                          style={{
                            background: '#eff6ff',
                            color: '#2563eb',
                            border: '1px solid #bfdbfe',
                            padding: '3px 7px',
                            borderRadius: '5px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px'
                          }}
                        >
                          <Calendar size={11} /> Meet
                        </button>
                      )}

                      {/* Client 360 */}
                      <button
                        type="button"
                        onClick={() => onOpenClient360 && onOpenClient360({ id: item.clientId, fullName: item.clientName, phoneNumber: item.clientPhone })}
                        style={{
                          background: '#f8fafc',
                          border: '1px solid #cbd5e1',
                          color: '#475569',
                          padding: '3px 7px',
                          borderRadius: '5px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Client 360 &rarr;
                      </button>
                    </div>

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
              background: '#ffffff',
              padding: '1.25rem 1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid #e2e8f0'
            }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#0f2b48', letterSpacing: '-0.2px' }}>
                  Log Call Disposition: {activeTask.clientName}
                </h3>
                <p style={{ margin: '3px 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                  {activeTask.clientPhone} • {activeTask.insuranceType}
                </p>
              </div>
              <button
                onClick={() => setShowCallModal(false)}
                style={{ 
                  background: '#f8fafc', 
                  border: '1px solid #e2e8f0', 
                  color: '#64748b', 
                  cursor: 'pointer',
                  borderRadius: '8px',
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#0f2b48'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#64748b'; }}
              >
                <X size={18} />
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

      {/* Reassign Advisor Modal for Overdue / Agenda Tasks */}
      {reassignTask && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          zIndex: 12000,
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
                    Reassign Overdue Client
                  </h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                    {reassignTask.clientName} ({reassignTask.clientCode})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setReassignTask(null)}
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
                  Reassignment Reason / Transfer Note
                </label>
                <textarea
                  rows="3"
                  placeholder="e.g. Overdue follow-up reallocated to active advisor for immediate callback..."
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
                  onClick={() => setReassignTask(null)}
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
                  Reassign Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Custom Enterprise Consultation Outcome Modal */}
      {meetingOutcomeModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'none',
          zIndex: 1100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          animation: 'fadeIn 0.15s ease'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '18px',
            maxWidth: '520px',
            width: '100%',
            boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #f1f5f9',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#f8fafc'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: '#dcfce7', color: '#16a34a', padding: '8px', borderRadius: '10px' }}>
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f2b48' }}>
                    Log Consultation Outcome
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '1px' }}>
                    {meetingOutcomeModal.clientName} • {meetingOutcomeModal.insuranceType}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setMeetingOutcomeModal(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px', borderRadius: '6px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={async (e) => {
              e.preventDefault();
              setSubmitting(true);
              try {
                const combinedNotes = `[${outcomeForm.outcomeTag}] ${outcomeForm.notes.trim() || 'Consultation completed.'}`;
                await crmService.updateMeetingOutcome(meetingOutcomeModal.originalId, {
                  status: 'COMPLETED',
                  outcomeNotes: combinedNotes
                });
                setMeetingOutcomeModal(null);
                await loadAgenda();
              } catch (err) {
                alert('Failed to update meeting outcome: ' + (err.response?.data?.message || err.message));
              } finally {
                setSubmitting(false);
              }
            }} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              
              {/* Outcome Category Select Pills */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                  Consultation Result / Customer Sentiment
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                  {[
                    { id: 'INTERESTED', label: '⭐ Interested / Quote Req.', bg: '#eff6ff', border: '#bfdbfe', color: '#1d4ed8' },
                    { id: 'WON', label: '🎉 Deal Closed / Purchased', bg: '#f0fdf4', border: '#bbf7d0', color: '#15803d' },
                    { id: 'FOLLOWUP', label: '📅 Callback Needed', bg: '#fef3c7', border: '#fde68a', color: '#b45309' },
                    { id: 'NOT_INTERESTED', label: '❌ Not Interested', bg: '#fef2f2', border: '#fecaca', color: '#b91c1c' }
                  ].map(tag => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => setOutcomeForm(prev => ({ ...prev, outcomeTag: tag.id }))}
                      style={{
                        padding: '10px',
                        borderRadius: '10px',
                        border: `2px solid ${outcomeForm.outcomeTag === tag.id ? tag.color : '#e2e8f0'}`,
                        background: outcomeForm.outcomeTag === tag.id ? tag.bg : '#ffffff',
                        color: outcomeForm.outcomeTag === tag.id ? tag.color : '#475569',
                        fontWeight: outcomeForm.outcomeTag === tag.id ? 800 : 600,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {tag.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Outcome Notes Textarea */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Consultation Notes & Next Steps
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder="e.g. Presented Star Health Optima vs Care Supreme. Client requested formal quotation with 10L Sum Insured..."
                  value={outcomeForm.notes}
                  onChange={(e) => setOutcomeForm(prev => ({ ...prev, notes: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    lineHeight: '1.4',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '0.25rem' }}>
                <button
                  type="button"
                  onClick={() => setMeetingOutcomeModal(null)}
                  disabled={submitting}
                  style={{
                    flex: 1,
                    padding: '10px',
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
                    padding: '10px',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    color: '#ffffff',
                    fontWeight: 700,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 12px -2px rgba(5, 150, 105, 0.3)'
                  }}
                >
                  {submitting ? <RefreshCw size={15} className="animate-spin" /> : <Check size={16} />}
                  Save & Complete Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Consolidated Schedule Activity Modal */}
      {showScheduleActivityModal && (
        <ScheduleActivityModal
          isOpen={showScheduleActivityModal}
          onClose={() => setShowScheduleActivityModal(false)}
          onSuccess={() => loadAgenda()}
        />
      )}

    </div>
  );
}
