import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Video, 
  MapPin, 
  Clock, 
  Users, 
  User,
  Plus, 
  Copy, 
  Check, 
  ExternalLink, 
  CheckCircle2, 
  X, 
  Filter,
  Phone,
  ChevronLeft,
  ChevronRight,
  Shield,
  FileText,
  AlertTriangle,
  Sparkles,
  Search,
  Grid,
  List,
  Columns,
  Download,
  Share2
} from 'lucide-react';
import { crmService } from '../../services/api';
import ScheduleActivityModal from './ScheduleActivityModal';
import { openWhatsAppWithInvite, generateGoogleCalendarUrl } from '../../utils/calendarUtils';

const WhatsAppIcon = ({ size = 16, color = '#25D366' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.472 14.382C17.114 14.203 15.356 13.339 15.028 13.22C14.7 13.1 14.462 13.041 14.223 13.399C13.985 13.757 13.3 14.563 13.091 14.802C12.883 15.041 12.674 15.07 12.316 14.891C11.958 14.712 10.806 14.335 9.444 13.121C8.384 12.176 7.669 11.009 7.46 10.651C7.252 10.293 7.438 10.099 7.618 9.921C7.779 9.761 7.977 9.502 8.156 9.293C8.335 9.084 8.395 8.935 8.514 8.696C8.633 8.457 8.574 8.249 8.484 8.07C8.395 7.891 7.679 6.13 7.381 5.414C7.09 4.717 6.796 4.812 6.578 4.803C6.369 4.793 6.131 4.793 5.892 4.793C5.653 4.793 5.266 4.883 4.938 5.241C4.61 5.599 3.686 6.464 3.686 8.225C3.686 9.986 4.968 11.687 5.147 11.926C5.326 12.165 7.669 15.776 11.248 17.323C12.1 17.691 12.766 17.912 13.284 18.076C14.14 18.348 14.919 18.309 15.536 18.217C16.224 18.114 17.653 17.352 17.951 16.516C18.25 15.68 18.25 14.964 18.16 14.815C18.071 14.666 17.832 14.561 17.472 14.382Z" fill={color}/>
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12C2 13.89 2.525 15.657 3.438 17.17L2.052 22.234L7.247 20.871C8.706 21.603 10.312 22 12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2ZM4 12C4 7.582 7.582 4 12 4C16.418 4 20 7.582 20 12C20 16.418 16.418 20 12 20C10.487 20 9.068 19.578 7.854 18.847L7.545 18.661L4.47 19.468L5.291 16.467L5.086 16.141C4.389 15.029 4 13.565 4 12Z" fill={color}/>
  </svg>
);

export default function MeetingCalendarView({ preselectedClient, onCloseModal, onOpenClient360, onOpenCallModal }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState('month'); // 'month' | 'week' | 'day' | 'agenda'
  const [eventTypeFilter, setEventTypeFilter] = useState('ALL'); // 'ALL' | 'MEETING' | 'FOLLOWUP' | 'RENEWAL'

  const [meetings, setMeetings] = useState([]);
  const [followups, setFollowups] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showScheduleModal, setShowScheduleModal] = useState(!!preselectedClient);
  const [copiedMeetId, setCopiedMeetId] = useState(null);

  // Selected date for slot booking
  const [selectedSlotDate, setSelectedSlotDate] = useState(null);

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

  // Sync state whenever preselectedClient prop updates
  useEffect(() => {
    if (preselectedClient) {
      setScheduleForm({
        clientId: preselectedClient.id,
        title: `Insurance Consultation with ${preselectedClient.fullName}`,
        purpose: 'Detailed Plan Comparison & Policy Finalization',
        product: preselectedClient.insuranceType || 'Health Insurance',
        meetingDate: new Date().toISOString().slice(0, 10),
        startTime: '11:00',
        endTime: '11:30',
        meetingType: 'GOOGLE_MEET',
        location: '',
        notes: ''
      });
      setShowScheduleModal(true);
    }
  }, [preselectedClient]);

  useEffect(() => {
    loadAllCalendarData();
  }, []);

  const loadAllCalendarData = async () => {
    setLoading(true);
    try {
      const [meetingsData, followupsData, leadsData] = await Promise.all([
        crmService.getUpcomingMeetings().catch(() => []),
        crmService.getDueTodayFollowUps().catch(() => []),
        crmService.getClients().catch(() => [])
      ]);
      setMeetings(meetingsData || []);
      setFollowups(followupsData || []);
      setLeads(leadsData || []);
    } catch (err) {
      console.error('Failed to load calendar events:', err);
    } finally {
      setLoading(false);
    }
  };

  // Build unified event list
  const allEvents = [
    // 1. Google Meet & In-Person Consultations
    ...meetings.map(m => ({
      id: `meet-${m.id}`,
      originalId: m.id,
      type: 'MEETING',
      title: m.title || `Consultation with ${m.clientName}`,
      clientName: m.clientName,
      clientId: m.clientId,
      phone: m.clientPhone,
      datetime: new Date(m.meetingDatetime),
      endDatetime: m.endDatetime ? new Date(m.endDatetime) : new Date(new Date(m.meetingDatetime).getTime() + 1800000),
      advisorName: m.advisorName,
      googleMeetUrl: m.googleMeetUrl,
      meetingType: m.meetingType || 'GOOGLE_MEET',
      product: m.product,
      purpose: m.purpose,
      badgeColor: '#2563eb',
      bgColor: '#eff6ff',
      borderColor: '#bfdbfe'
    })),
    // 2. Scheduled Follow-up Calls
    ...followups.map(f => ({
      id: `call-${f.id}`,
      originalId: f.id,
      type: 'FOLLOWUP',
      title: `📞 Callback: ${f.clientName}`,
      clientName: f.clientName,
      clientId: f.clientId,
      phone: f.clientPhone,
      datetime: new Date(f.scheduledDatetime),
      endDatetime: new Date(new Date(f.scheduledDatetime).getTime() + 900000),
      advisorName: f.advisorName,
      product: f.insuranceType,
      purpose: f.notes || 'Scheduled client follow-up callback',
      badgeColor: '#059669',
      bgColor: '#ecfdf5',
      borderColor: '#a7f3d0'
    })),
    // 3. Expiring Policies (Renewals)
    ...leads.filter(l => l.policyExpiryDate).map(l => ({
      id: `ren-${l.id}`,
      originalId: l.id,
      type: 'RENEWAL',
      title: `🛡️ Renewal Due: ${l.fullName}`,
      clientName: l.fullName,
      clientId: l.id,
      phone: l.phoneNumber,
      datetime: new Date(`${l.policyExpiryDate}T10:00:00`),
      endDatetime: new Date(`${l.policyExpiryDate}T10:30:00`),
      advisorName: l.assignedAdvisorName,
      product: l.insuranceType,
      purpose: `Existing policy with ${l.existingInsurer || 'current insurer'} expires on ${l.policyExpiryDate}.`,
      badgeColor: '#d97706',
      bgColor: '#fef3c7',
      borderColor: '#fde68a'
    }))
  ].filter(evt => {
    if (eventTypeFilter === 'ALL') return true;
    return evt.type === eventTypeFilter;
  });

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedDayAgenda, setSelectedDayAgenda] = useState(null);

  // Month navigation helpers
  const prevPeriod = () => {
    if (calendarView === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    } else if (calendarView === 'week') {
      setCurrentDate(new Date(currentDate.getTime() - 7 * 86400000));
    } else {
      setCurrentDate(new Date(currentDate.getTime() - 86400000));
    }
  };

  const nextPeriod = () => {
    if (calendarView === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    } else if (calendarView === 'week') {
      setCurrentDate(new Date(currentDate.getTime() + 7 * 86400000));
    } else {
      setCurrentDate(new Date(currentDate.getTime() + 86400000));
    }
  };

  const goToToday = () => setCurrentDate(new Date());

  const monthYearLabel = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Handle slot click to book
  const handleDateClick = (dateObj) => {
    const formattedDate = dateObj.toISOString().slice(0, 10);
    setScheduleForm(prev => ({ ...prev, meetingDate: formattedDate }));
    setShowScheduleModal(true);
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const startDateTime = `${scheduleForm.meetingDate}T${scheduleForm.startTime}:00`;
      const endDateTime = `${scheduleForm.meetingDate}T${scheduleForm.endTime}:00`;

      // Enterprise UX Guardrail: Prevent scheduling in the past (with 2 min buffer)
      const selectedTime = new Date(startDateTime).getTime();
      const nowBuffer = Date.now() - 2 * 60 * 1000;
      if (selectedTime < nowBuffer) {
        alert('⚠️ Meeting cannot be scheduled in the past. Please choose a future time slot.');
        setSubmitting(false);
        return;
      }

      await crmService.scheduleMeeting({
        clientId: Number(scheduleForm.clientId) || (leads[0]?.id || 1),
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
      loadAllCalendarData();
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

  // 1-Click Direct Google Calendar Sync URL
  const getGoogleCalendarUrl = (evt) => {
    const formatGCalDate = (d) => {
      const pad = (n) => String(n).padStart(2, '0');
      return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
    };

    const startStr = formatGCalDate(new Date(evt.datetime));
    const endStr = formatGCalDate(new Date(evt.endDatetime || new Date(evt.datetime.getTime() + 1800000)));
    const title = encodeURIComponent(evt.title || `Consultation with ${evt.clientName}`);
    const details = encodeURIComponent(
      `Insurance Advisory Consultation\n\n` +
      `Client: ${evt.clientName} (${evt.phone || ''})\n` +
      `Product: ${evt.product || 'Insurance'}\n` +
      (evt.purpose ? `Purpose: ${evt.purpose}\n\n` : '\n') +
      (evt.googleMeetUrl ? `Google Meet Link: ${evt.googleMeetUrl}\n` : '') +
      `\nOrganized via Aadhiraksha InsurTech Portal`
    );
    const location = encodeURIComponent(evt.googleMeetUrl || 'Online Google Meet');

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startStr}/${endStr}&details=${details}&location=${location}`;
  };

  // Standard .ICS File Generator & Downloader for Apple/Outlook/Google Calendar
  const downloadICSFile = (evt) => {
    const formatICSDate = (d) => {
      const pad = (n) => String(n).padStart(2, '0');
      return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
    };

    const startStr = formatICSDate(new Date(evt.datetime));
    const endStr = formatICSDate(new Date(evt.endDatetime || new Date(evt.datetime.getTime() + 1800000)));
    const uid = `meeting-${evt.id || Date.now()}@aadhiraksha.com`;

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Aadhiraksha InsurTech//CRM Calendar//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:REQUEST',
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${formatICSDate(new Date())}`,
      `DTSTART:${startStr}`,
      `DTEND:${endStr}`,
      `SUMMARY:${evt.title || `Consultation with ${evt.clientName}`}`,
      `DESCRIPTION:Insurance Advisory Consultation with ${evt.clientName}\\nProduct: ${evt.product || 'General'}\\nMeet URL: ${evt.googleMeetUrl || 'N/A'}`,
      `LOCATION:${evt.googleMeetUrl || 'Google Meet'}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${(evt.clientName || 'meeting').replace(/\s+/g, '_')}_invite.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  // Month Grid Calculation
  const getMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days = [];

    // Prev month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, daysInPrevMonth - i),
        isCurrentMonth: false
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      });
    }

    // Next month padding to fill 35 or 42 grid
    const totalCells = days.length > 35 ? 42 : 35;
    const remaining = totalCells - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false
      });
    }

    return days;
  };

  // Week Days Calculation
  const getWeekDays = () => {
    const curr = new Date(currentDate);
    const first = curr.getDate() - curr.getDay(); // First day is Sunday
    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push(new Date(curr.setDate(first + i)));
    }
    return days;
  };

  const isSameDay = (d1, d2) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const isToday = (d) => isSameDay(d, new Date());

  const hoursOfDay = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM

  return (
    <div className="crm-calendar-workspace" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* 1. Master Calendar Control Bar */}
      <div 
        style={{ 
          background: 'var(--bg-card)', 
          borderRadius: '16px', 
          padding: '1.25rem 1.5rem', 
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
        }}
      >
        {/* Left: Navigation & Current Month */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <button
              onClick={prevPeriod}
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-main)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--text-main)'
              }}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={nextPeriod}
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-main)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--text-main)'
              }}
            >
              <ChevronRight size={18} />
            </button>
            <button
              onClick={goToToday}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-main)',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                color: 'var(--primary-navy)'
              }}
            >
              Today
            </button>
          </div>

          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary-navy)', margin: 0 }}>
            {monthYearLabel}
          </h2>
        </div>

        {/* Center: Event Type Filter Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--bg-main)', padding: '0.25rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
          {[
            { id: 'ALL', label: 'All Events', color: 'var(--primary-navy)' },
            { id: 'MEETING', label: '🎥 Meets', color: '#2563eb' },
            { id: 'FOLLOWUP', label: '📞 Calls', color: '#059669' },
            { id: 'RENEWAL', label: '🛡️ Renewals', color: '#d97706' }
          ].map(filter => (
            <button
              key={filter.id}
              onClick={() => setEventTypeFilter(filter.id)}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '7px',
                border: 'none',
                background: eventTypeFilter === filter.id ? 'var(--bg-card)' : 'transparent',
                color: eventTypeFilter === filter.id ? filter.color : 'var(--text-muted)',
                fontWeight: eventTypeFilter === filter.id ? 800 : 600,
                fontSize: '0.78rem',
                cursor: 'pointer',
                boxShadow: eventTypeFilter === filter.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
              }}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Right: View Selector & Schedule Action */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ display: 'flex', background: 'var(--bg-main)', padding: '0.25rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            {[
              { id: 'month', label: 'Month', icon: <Grid size={14} /> },
              { id: 'week', label: 'Week', icon: <Columns size={14} /> },
              { id: 'day', label: 'Day', icon: <Clock size={14} /> },
              { id: 'agenda', label: 'Agenda', icon: <List size={14} /> }
            ].map(v => (
              <button
                key={v.id}
                onClick={() => setCalendarView(v.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  padding: '0.4rem 0.75rem',
                  borderRadius: '7px',
                  border: 'none',
                  background: calendarView === v.id ? 'var(--bg-card)' : 'transparent',
                  color: calendarView === v.id ? 'var(--primary-navy)' : 'var(--text-muted)',
                  fontWeight: calendarView === v.id ? 800 : 600,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  boxShadow: calendarView === v.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
                }}
              >
                {v.icon} {v.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              setScheduleForm(prev => ({ ...prev, meetingDate: new Date().toISOString().slice(0, 10) }));
              setShowScheduleModal(true);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'linear-gradient(135deg, var(--accent-gold), var(--accent-gold-hover))',
              color: '#ffffff',
              border: 'none',
              padding: '0.55rem 1rem',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-gold)'
            }}
          >
            <Plus size={15} /> Book Consultation
          </button>
        </div>
      </div>

      {/* 2. CALENDAR VIEW RENDERER */}
      <div 
        style={{ 
          background: 'var(--bg-card)', 
          borderRadius: '16px', 
          border: '1px solid var(--border-subtle)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          overflow: 'hidden'
        }}
      >
        
        {/* VIEW 1: MONTH GRID */}
        {calendarView === 'month' && (
          <div>
            {/* Days Header */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', background: 'var(--bg-main)', borderBottom: '1px solid var(--border-subtle)' }}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
                <div key={day} style={{ padding: '0.75rem 0.5rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: 800, color: idx === 0 || idx === 6 ? 'var(--text-muted)' : 'var(--primary-navy)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {day}
                </div>
              ))}
            </div>

            {/* Month Day Cells */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', minHeight: '600px' }}>
              {getMonthDays().map((dayObj, idx) => {
                const dayEvents = allEvents.filter(e => isSameDay(e.datetime, dayObj.date));
                const today = isToday(dayObj.date);

                return (
                  <div
                    key={idx}
                    onClick={() => handleDateClick(dayObj.date)}
                    style={{
                      borderRight: (idx + 1) % 7 !== 0 ? '1px solid var(--border-subtle)' : 'none',
                      borderBottom: '1px solid var(--border-subtle)',
                      padding: '0.5rem',
                      background: dayObj.isCurrentMonth ? (today ? 'rgba(245, 158, 11, 0.04)' : 'var(--bg-card)') : 'var(--bg-main)',
                      opacity: dayObj.isCurrentMonth ? 1 : 0.45,
                      minHeight: '110px',
                      display: 'flex',
                      flexDirection: 'column',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease'
                    }}
                    className="crm-calendar-cell"
                  >
                    {/* Date Number Badge */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <span style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: today ? 'var(--accent-gold)' : 'transparent',
                        color: today ? '#fff' : (dayObj.isCurrentMonth ? 'var(--text-main)' : 'var(--text-muted)'),
                        fontWeight: today ? 800 : 600,
                        fontSize: '0.78rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {dayObj.date.getDate()}
                      </span>
                      {dayEvents.length > 0 && (
                        <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)' }}>
                          {dayEvents.length} event{dayEvents.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>

                    {/* Event Pills */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', overflow: 'hidden' }}>
                      {dayEvents.slice(0, 3).map((evt) => (
                        <div
                          key={evt.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvent(evt);
                          }}
                          title={`${evt.title} - ${evt.datetime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                          style={{
                            background: evt.bgColor,
                            border: `1px solid ${evt.borderColor}`,
                            borderRadius: '5px',
                            padding: '0.2rem 0.4rem',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            color: evt.badgeColor,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            cursor: 'pointer',
                            transition: 'transform 0.1s ease'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.02)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                        >
                          <span style={{ fontSize: '0.65rem' }}>{evt.datetime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          <span>{evt.title}</span>
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDayAgenda({ date: dayObj.date, events: dayEvents });
                          }}
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            color: 'var(--primary-navy)',
                            background: 'rgba(15, 43, 72, 0.06)',
                            border: '1px solid rgba(15, 43, 72, 0.1)',
                            borderRadius: '4px',
                            padding: '2px 6px',
                            textAlign: 'left',
                            cursor: 'pointer',
                            marginTop: '2px'
                          }}
                        >
                          +{dayEvents.length - 3} more
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* VIEW 2: WEEK VIEW */}
        {calendarView === 'week' && (
          <div>
            {/* Week Header */}
            <div style={{ display: 'grid', gridTemplateColumns: '60px repeat(7, 1fr)', background: 'var(--bg-main)', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ padding: '0.75rem 0.5rem', textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>Time</div>
              {getWeekDays().map((d) => {
                const today = isToday(d);
                return (
                  <div key={d.toISOString()} style={{ padding: '0.65rem 0.5rem', textAlign: 'center', borderLeft: '1px solid var(--border-subtle)', background: today ? 'rgba(245, 158, 11, 0.08)' : 'transparent' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: today ? '#d97706' : 'var(--text-muted)' }}>
                      {d.toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: today ? '#d97706' : 'var(--primary-navy)', marginTop: '2px' }}>
                      {d.getDate()}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Week Hours Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '550px', overflowY: 'auto' }}>
              {hoursOfDay.map((hour) => (
                <div key={hour} style={{ display: 'grid', gridTemplateColumns: '60px repeat(7, 1fr)', borderBottom: '1px solid var(--border-subtle)', minHeight: '52px' }}>
                  <div style={{ padding: '0.4rem 0.5rem', fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center', fontWeight: 600 }}>
                    {hour % 12 === 0 ? 12 : hour % 12}:00 {hour >= 12 ? 'PM' : 'AM'}
                  </div>
                  {getWeekDays().map((d) => {
                    const slotEvents = allEvents.filter(e => isSameDay(e.datetime, d) && e.datetime.getHours() === hour);
                    return (
                      <div 
                        key={d.toISOString()} 
                        onClick={() => handleDateClick(d)}
                        style={{ borderLeft: '1px solid var(--border-subtle)', padding: '0.25rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}
                      >
                        {slotEvents.map(evt => (
                          <div 
                            key={evt.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onOpenClient360) onOpenClient360({ id: evt.clientId, fullName: evt.clientName, phoneNumber: evt.phone });
                            }}
                            style={{ background: evt.bgColor, border: `1px solid ${evt.borderColor}`, color: evt.badgeColor, padding: '0.2rem 0.4rem', borderRadius: '5px', fontSize: '0.7rem', fontWeight: 700 }}
                          >
                            {evt.title}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 3: DAY VIEW */}
        {calendarView === 'day' && (
          <div style={{ padding: '1.25rem 1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <CalendarIcon size={18} color="var(--primary-navy)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-navy)', margin: 0 }}>
                {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </h3>
              {isToday(currentDate) && (
                <span style={{ background: '#fef3c7', color: '#d97706', fontSize: '0.72rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '12px' }}>
                  Today
                </span>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {hoursOfDay.map((hour) => {
                const hourEvents = allEvents.filter(e => isSameDay(e.datetime, currentDate) && e.datetime.getHours() === hour);
                return (
                  <div key={hour} style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '1rem', borderBottom: '1px solid var(--border-subtle)', padding: '0.6rem 0' }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                      {hour % 12 === 0 ? 12 : hour % 12}:00 {hour >= 12 ? 'PM' : 'AM'}
                    </div>
                    <div>
                      {hourEvents.length > 0 ? (
                        hourEvents.map(evt => (
                          <div 
                            key={evt.id} 
                            style={{ background: evt.bgColor, border: `1px solid ${evt.borderColor}`, borderRadius: '10px', padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}
                          >
                            <div>
                              <div style={{ fontWeight: 800, color: evt.badgeColor, fontSize: '0.88rem' }}>{evt.title}</div>
                              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                Client: <strong>{evt.clientName}</strong> ({evt.phone}) • Advisor: {evt.advisorName}
                              </div>
                              {evt.purpose && <div style={{ fontSize: '0.74rem', color: '#64748b', fontStyle: 'italic', marginTop: '3px' }}>"{evt.purpose}"</div>}
                            </div>
                            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                              {evt.googleMeetUrl && (
                                <a 
                                  href={evt.googleMeetUrl} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  style={{ background: '#2563eb', color: '#fff', padding: '0.4rem 0.75rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                                >
                                  <Video size={13} /> Join Meet
                                </a>
                              )}
                              <a
                                href={getGoogleCalendarUrl(evt)}
                                target="_blank"
                                rel="noreferrer"
                                style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '0.4rem 0.65rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                                title="Add to Google Calendar"
                              >
                                <CalendarIcon size={12} /> + GCal
                              </a>
                              <button
                                type="button"
                                onClick={() => downloadICSFile(evt)}
                                style={{ background: '#f8fafc', color: '#475569', border: '1px solid #cbd5e1', padding: '0.4rem 0.65rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                                title="Download .ICS invite"
                              >
                                <Download size={12} /> .ICS
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No consultations scheduled</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* VIEW 4: AGENDA LIST */}
        {calendarView === 'agenda' && (
          <div style={{ padding: '1.25rem 1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {allEvents.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No scheduled consultations, calls, or renewals found.
                </div>
              ) : (
                allEvents.map(evt => (
                  <div
                    key={evt.id}
                    style={{
                      background: 'var(--bg-main)',
                      borderRadius: '12px',
                      border: `1px solid ${evt.borderColor}`,
                      padding: '1rem 1.25rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '1rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: evt.bgColor, color: evt.badgeColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {evt.type === 'MEETING' ? <Video size={20} /> : (evt.type === 'FOLLOWUP' ? <Phone size={20} /> : <Shield size={20} />)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, color: 'var(--primary-navy)', fontSize: '0.92rem' }}>
                          {evt.title}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          👤 <strong>{evt.clientName}</strong> ({evt.phone}) • Product: <strong>{evt.product}</strong>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <CalendarIcon size={12} /> {evt.datetime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Clock size={12} /> {evt.datetime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      {evt.googleMeetUrl && (
                        <>
                          <button
                            onClick={() => handleCopyLink(evt.googleMeetUrl, evt.id)}
                            style={{ background: '#fff', border: '1px solid var(--border-subtle)', padding: '0.45rem 0.65rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-navy)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                            title="Copy Google Meet URL"
                          >
                            {copiedMeetId === evt.id ? <Check size={12} color="#16a34a" /> : <Copy size={12} />} Copy Link
                          </button>
                          <a
                            href={evt.googleMeetUrl}
                            target="_blank"
                            rel="noreferrer"
                            style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '0.45rem 0.75rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                            title="Open Google Meet Session"
                          >
                            <Video size={13} /> Join Meet
                          </a>
                        </>
                      )}

                      {/* 1-Click Direct Google Calendar Sync */}
                      <a
                        href={getGoogleCalendarUrl(evt)}
                        target="_blank"
                        rel="noreferrer"
                        style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '0.45rem 0.65rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                        title="Add this consultation directly to your Google Calendar"
                      >
                        <CalendarIcon size={12} color="#1d4ed8" /> + Google Cal
                      </a>

                      {/* Download standard .ICS Calendar Invite */}
                      <button
                        type="button"
                        onClick={() => downloadICSFile(evt)}
                        style={{ background: '#f8fafc', color: '#475569', border: '1px solid #cbd5e1', padding: '0.45rem 0.65rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                        title="Download .ICS invite file for Outlook / Apple / Mobile Calendar"
                      >
                        <Download size={12} /> .ICS Invite
                      </button>

                      <button
                        onClick={() => {
                          if (onOpenClient360) onOpenClient360({ id: evt.clientId, fullName: evt.clientName, phoneNumber: evt.phone });
                        }}
                        style={{ background: 'var(--primary-navy)', color: '#fff', border: 'none', padding: '0.45rem 0.75rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        Client 360° &rarr;
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>

      {/* 3. CONSOLIDATED SCHEDULE ACTIVITY MODAL */}
      {showScheduleModal && (
        <ScheduleActivityModal
          isOpen={showScheduleModal}
          onClose={() => {
            setShowScheduleModal(false);
            if (onCloseModal) onCloseModal();
          }}
          initialClient={preselectedClient || (leads.find(l => String(l.id) === String(scheduleForm.clientId)) || null)}
          initialType="MEETING"
          onSuccess={() => {
            loadAllCalendarData();
          }}
        />
      )}

      {/* MODAL 2: Event Quick Preview Popover (Industry Standard - Google Calendar / HubSpot) */}
      {selectedEvent && (
        <div
          onClick={() => setSelectedEvent(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'none',
            zIndex: 13000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '520px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden'
            }}
          >
            {/* Header */}
            <div style={{
              background: selectedEvent.bgColor || '#eff6ff',
              padding: '1.25rem 1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              borderBottom: `1px solid ${selectedEvent.borderColor || '#bfdbfe'}`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: '#ffffff',
                  color: selectedEvent.badgeColor || '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}>
                  {selectedEvent.type === 'MEETING' ? <Video size={22} /> : (selectedEvent.type === 'FOLLOWUP' ? <Phone size={22} /> : <Calendar size={22} />)}
                </div>
                <div>
                  <span style={{
                    fontSize: '0.72rem',
                    background: '#ffffff',
                    color: selectedEvent.badgeColor || '#2563eb',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em'
                  }}>
                    {selectedEvent.type === 'MEETING' ? 'Virtual Consultation' : (selectedEvent.type === 'FOLLOWUP' ? 'Scheduled Call' : 'Policy Renewal')}
                  </span>
                  <h3 style={{ margin: '4px 0 0 0', fontSize: '1.1rem', fontWeight: 800, color: '#0f2b48' }}>
                    {selectedEvent.clientName}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Body Details */}
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Topic / Title</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f2b48', marginTop: '2px' }}>
                  {selectedEvent.title || 'Advisory Consultation'}
                </div>
              </div>

              {(() => {
                const startDate = selectedEvent.datetime ? new Date(selectedEvent.datetime) : new Date();
                const endDate = selectedEvent.endDatetime ? new Date(selectedEvent.endDatetime) : new Date(startDate.getTime() + 1800000);
                const dateStr = !isNaN(startDate.getTime()) ? startDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Today';
                const startTimeStr = !isNaN(startDate.getTime()) ? startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '11:00 AM';
                const endTimeStr = !isNaN(endDate.getTime()) ? endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '11:30 AM';

                return (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: '#f8fafc', padding: '12px 14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>Date & Time</div>
                      <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f2b48', marginTop: '2px' }}>
                        {dateStr}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#2563eb', fontWeight: 700 }}>
                        {startTimeStr} - {endTimeStr}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>Insurance Product</div>
                      <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f2b48', marginTop: '2px' }}>
                        {selectedEvent.product || 'General Advisory'}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        Advisor: {selectedEvent.advisorName || 'Assigned Agent'}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {selectedEvent.purpose && (
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Discussion Agenda</div>
                  <div style={{ fontSize: '0.84rem', color: '#334155', background: '#ffffff', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '4px' }}>
                    {selectedEvent.purpose}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                {selectedEvent.googleMeetUrl && (
                  <a
                    href={selectedEvent.googleMeetUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      flex: '1 1 auto',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      background: '#2563eb',
                      color: '#ffffff',
                      padding: '10px 16px',
                      borderRadius: '10px',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      textDecoration: 'none'
                    }}
                  >
                    <Video size={16} /> Join Google Meet
                  </a>
                )}

                {/* 1-Click WhatsApp Invite Dispatch */}
                {selectedEvent.phone && (
                  <button
                    type="button"
                    onClick={() => {
                      openWhatsAppWithInvite({
                        phoneNumber: selectedEvent.phone,
                        clientName: selectedEvent.clientName,
                        title: selectedEvent.title,
                        topic: selectedEvent.purpose || selectedEvent.product,
                        datetime: selectedEvent.datetime,
                        durationMinutes: selectedEvent.durationMinutes || 30,
                        googleMeetUrl: selectedEvent.googleMeetUrl,
                        advisorName: selectedEvent.advisorName
                      });
                    }}
                    style={{
                      background: '#f0fdf4',
                      color: '#16a34a',
                      border: '1px solid #bbf7d0',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <WhatsAppIcon size={15} color="#16a34a" /> Share on WhatsApp
                  </button>
                )}

                {/* 1-Click Add to Google Calendar */}
                <a
                  href={generateGoogleCalendarUrl({
                    title: selectedEvent.title,
                    description: `Aadhiraksha Insurance Consultation with ${selectedEvent.clientName}.\nMeet Link: ${selectedEvent.googleMeetUrl || 'N/A'}\nTopic: ${selectedEvent.purpose || selectedEvent.product || ''}`,
                    location: selectedEvent.googleMeetUrl || 'Online / Google Meet',
                    startTime: selectedEvent.datetime,
                    endTime: new Date(selectedEvent.datetime.getTime() + (selectedEvent.durationMinutes || 30) * 60000)
                  })}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    background: '#eff6ff',
                    color: '#2563eb',
                    border: '1px solid #bfdbfe',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    textDecoration: 'none'
                  }}
                >
                  <CalendarIcon size={14} /> Add to G-Cal
                </a>

                {selectedEvent.googleMeetUrl && (
                  <button
                    type="button"
                    onClick={() => handleCopyLink(selectedEvent.googleMeetUrl, selectedEvent.id)}
                    style={{
                      background: copiedMeetId === selectedEvent.id ? '#ecfdf5' : '#f1f5f9',
                      color: copiedMeetId === selectedEvent.id ? '#059669' : '#334155',
                      border: '1px solid #cbd5e1',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    {copiedMeetId === selectedEvent.id ? <Check size={14} /> : <Copy size={14} />}
                    {copiedMeetId === selectedEvent.id ? 'Copied!' : 'Copy Link'}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    const evt = selectedEvent;
                    setSelectedEvent(null);
                    if (onOpenClient360) {
                      onOpenClient360({ id: evt.clientId, fullName: evt.clientName, phoneNumber: evt.phone });
                    }
                  }}
                  style={{
                    background: '#0f2b48',
                    color: '#ffffff',
                    border: 'none',
                    padding: '10px 16px',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <User size={15} /> Open Client 360
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Day Agenda View (+N more events expander) */}
      {selectedDayAgenda && (
        <div
          onClick={() => setSelectedDayAgenda(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'none',
            zIndex: 13000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '560px',
              maxHeight: '80vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden'
            }}
          >
            <div style={{
              padding: '1.25rem 1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid #e2e8f0',
              background: '#f8fafc'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f2b48' }}>
                  {selectedDayAgenda.date.toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                </h3>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                  {selectedDayAgenda.events.length} Scheduled Activities
                </div>
              </div>
              <button
                onClick={() => setSelectedDayAgenda(null)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '1.25rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {selectedDayAgenda.events.map((evt) => (
                <div
                  key={evt.id}
                  onClick={() => {
                    setSelectedDayAgenda(null);
                    setSelectedEvent(evt);
                  }}
                  style={{
                    background: evt.bgColor,
                    border: `1px solid ${evt.borderColor}`,
                    borderRadius: '12px',
                    padding: '12px 14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: '#ffffff',
                      color: evt.badgeColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {evt.type === 'MEETING' ? <Video size={18} /> : (evt.type === 'FOLLOWUP' ? <Phone size={18} /> : <Calendar size={18} />)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, color: '#0f2b48', fontSize: '0.9rem' }}>
                        {evt.clientName}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        {evt.title} • <strong style={{ color: evt.badgeColor }}>{evt.datetime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
                      </div>
                    </div>
                  </div>

                  <span style={{ fontSize: '0.75rem', color: evt.badgeColor, fontWeight: 700 }}>
                    View Details →
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
