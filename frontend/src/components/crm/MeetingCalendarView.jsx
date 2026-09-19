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
        crmService.getLeads().catch(() => [])
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

  // Calendar Navigation Helpers
  const nextPeriod = () => {
    if (calendarView === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    } else if (calendarView === 'week') {
      setCurrentDate(new Date(currentDate.getTime() + 7 * 86400000));
    } else {
      setCurrentDate(new Date(currentDate.getTime() + 86400000));
    }
  };

  const prevPeriod = () => {
    if (calendarView === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    } else if (calendarView === 'week') {
      setCurrentDate(new Date(currentDate.getTime() - 7 * 86400000));
    } else {
      setCurrentDate(new Date(currentDate.getTime() - 86400000));
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

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
                            if (onOpenClient360) onOpenClient360({ id: evt.clientId, fullName: evt.clientName, phoneNumber: evt.phone });
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
                            gap: '0.25rem'
                          }}
                        >
                          <span style={{ fontSize: '0.65rem' }}>{evt.datetime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          <span>{evt.title}</span>
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--primary-navy)', paddingLeft: '0.2rem' }}>
                          +{dayEvents.length - 3} more
                        </span>
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

      {/* 3. SCHEDULE CONSULTATION MODAL */}
      {showScheduleModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 12000, padding: '1rem' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Video size={22} color="#2563eb" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#091726', margin: 0 }}>Schedule Advisory Consultation</h3>
              </div>
              <button onClick={() => setShowScheduleModal(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Client Name / Lead *</label>
                <select
                  required
                  className="form-input"
                  value={scheduleForm.clientId}
                  onChange={(e) => {
                    const selId = e.target.value;
                    const selLead = leads.find(l => String(l.id) === String(selId));
                    setScheduleForm(prev => ({
                      ...prev,
                      clientId: selId,
                      title: selLead ? `Insurance Consultation with ${selLead.fullName}` : prev.title,
                      product: selLead?.insuranceType || prev.product
                    }));
                  }}
                >
                  <option value="">-- Select Client from CRM --</option>
                  {leads.map(l => (
                    <option key={l.id} value={l.id}>
                      {l.fullName} ({l.phoneNumber}) - {l.insuranceType}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Meeting Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Health Insurance Policy Comparison & Quote Walkthrough"
                  className="form-input"
                  value={scheduleForm.title}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, title: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Date *</label>
                  <input
                    type="date"
                    required
                    className="form-input"
                    value={scheduleForm.meetingDate}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, meetingDate: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Insurance Vertical</label>
                  <select
                    className="form-input"
                    value={scheduleForm.product}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, product: e.target.value })}
                  >
                    <option value="Health Insurance">Health Insurance</option>
                    <option value="Vehicle / Motor Insurance">Motor / Vehicle Insurance</option>
                    <option value="Term Life Insurance">Term Life Insurance</option>
                    <option value="SME & Business Insurance">SME & Business Insurance</option>
                    <option value="Travel Insurance">Travel Insurance</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Start Time *</label>
                  <input
                    type="time"
                    required
                    className="form-input"
                    value={scheduleForm.startTime}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, startTime: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">End Time *</label>
                  <input
                    type="time"
                    required
                    className="form-input"
                    value={scheduleForm.endTime}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, endTime: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Meeting Agenda & Notes</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Walkthrough room rent waiver, restoration benefit, and daycare procedures."
                  className="form-input"
                  value={scheduleForm.notes}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, notes: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  style={{ padding: '0.6rem 1.25rem', background: '#f1f5f9', border: 'none', borderRadius: '8px', fontWeight: 600, color: '#64748b', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ padding: '0.6rem 1.35rem', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', border: 'none', borderRadius: '8px', fontWeight: 700, color: '#fff', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Video size={15} /> {submitting ? 'Creating Meet Link...' : 'Schedule & Generate Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
