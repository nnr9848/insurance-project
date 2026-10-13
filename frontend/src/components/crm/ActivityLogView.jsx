import React, { useState, useEffect } from 'react';
import { 
  Activity,
  PhoneCall, 
  Phone, 
  Search, 
  Filter, 
  Clock, 
  User, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  RefreshCw, 
  MessageSquare, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  FileSpreadsheet,
  Video,
  ShieldCheck,
  Check,
  MoreVertical,
  CalendarClock
} from 'lucide-react';
import { crmService } from '../../services/api';
import ActionDropdown from '../common/ActionDropdown';
import WhatsAppIcon from '../common/WhatsAppIcon';
import { CrmTablePaginationBar } from './common/CrmTablePaginationBar';
import { formatWhatsAppNumber } from '../../utils/crmDeduplication';

const DISPOSITION_OUTCOMES = [
  { id: 'ALL', label: 'All Dispositions' },
  { id: 'INTERESTED', label: 'Interested', color: '#16a34a', bg: '#dcfce7' },
  { id: 'QUOTE_REQUESTED', label: 'Quote Requested', color: '#0284c7', bg: '#e0f2fe' },
  { id: 'MEETING_REQUESTED', label: 'Meeting Scheduled', color: '#7c3aed', bg: '#ede9fe' },
  { id: 'DOCS_REQUESTED', label: 'Docs Requested', color: '#059669', bg: '#d1fae5' },
  { id: 'CALL_BACK', label: 'Call Back Requested', color: '#d97706', bg: '#fef3c7' },
  { id: 'ANSWERED', label: 'Connected / Answered', color: '#2563eb', bg: '#eff6ff' },
  { id: 'NOT_ANSWERED', label: 'Not Answered / Busy', color: '#dc2626', bg: '#fee2e2' },
  { id: 'NOT_INTERESTED', label: 'Not Interested', color: '#64748b', bg: '#f1f5f9' },
  { id: 'CONVERTED', label: 'Policy Converted', color: '#15803d', bg: '#bbf7d0' },
  { id: 'COMPLETED', label: 'Meeting Completed', color: '#059669', bg: '#d1fae5' },
  { id: 'CANCELLED', label: 'Cancelled', color: '#dc2626', bg: '#fee2e2' }
];

export default function ActivityLogView({ onOpenClient360, onOpenMeetingModal, onNavigateView }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL'); // 'ALL' | 'CALL' | 'MEETING' | 'RENEWAL'
  const [outcomeFilter, setOutcomeFilter] = useState('ALL');
  const [advisorFilter, setAdvisorFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL'); // 'ALL' | 'TODAY' | 'YESTERDAY' | 'WEEK' | 'MONTH'

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(() => {
    const saved = localStorage.getItem('crm_activity_log_page_size');
    return saved ? parseInt(saved, 10) : 10;
  });

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1);
    try {
      localStorage.setItem('crm_activity_log_page_size', String(newSize));
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    loadAllActivities();
  }, []);

  const loadAllActivities = async () => {
    setLoading(true);
    try {
      const [callsData, meetingsData, renewalsData] = await Promise.all([
        crmService.getCallHistory().catch(() => []),
        crmService.getUpcomingMeetings().catch(() => []),
        crmService.getRenewalList('ALL').catch(() => [])
      ]);

      const normalizedCalls = (callsData || []).map(c => ({
        id: `call-${c.id}`,
        rawId: c.id,
        type: 'CALL',
        timestamp: new Date(c.createdAt || Date.now()),
        clientName: c.clientName || 'Unknown Client',
        clientPhone: c.clientPhone || '',
        clientId: c.clientId,
        advisorName: c.advisorName || 'Advisor',
        title: `Phone Call Disposition: ${c.callResult || 'LOGGED'}`,
        outcome: c.callResult || 'LOGGED',
        durationSeconds: c.callDurationSeconds || 0,
        notes: c.callNotes || '',
        nextFollowUp: c.nextFollowUpDate,
        googleMeetUrl: null
      }));

      const normalizedMeetings = (meetingsData || []).map(m => ({
        id: `meet-${m.id}`,
        rawId: m.id,
        type: 'MEETING',
        timestamp: new Date(m.meetingDatetime || m.createdAt || Date.now()),
        clientName: m.clientName || 'Unknown Client',
        clientPhone: m.clientPhone || '',
        clientId: m.clientId,
        advisorName: m.advisorName || 'Advisor',
        title: m.title || `Client Consultation`,
        outcome: m.status || 'SCHEDULED',
        durationSeconds: (m.durationMinutes || 30) * 60,
        notes: m.outcomeNotes || m.purpose || 'Client meeting consultation',
        nextFollowUp: null,
        googleMeetUrl: m.googleMeetUrl
      }));

      // Combined and sorted by timestamp DESC
      const combined = [...normalizedCalls, ...normalizedMeetings].sort((a, b) => b.timestamp - a.timestamp);
      setActivities(combined);
    } catch (err) {
      console.error('Failed to load activity log:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds || seconds === 0) return '0s (Ringing/Missed)';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  const getOutcomeBadge = (outcome) => {
    const found = DISPOSITION_OUTCOMES.find(o => o.id === outcome);
    if (found) {
      return { label: found.label, bg: found.bg, color: found.color };
    }
    return { label: outcome || 'LOGGED', bg: '#f1f5f9', color: '#475569' };
  };

  const openWhatsApp = (phone, name) => {
    const cleanPhone = formatWhatsAppNumber(phone);
    const text = encodeURIComponent(`Hello ${name}, connecting with you from Aadhiraksha Insurance.`);
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  };

  // Date filtering logic
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const filteredActivities = activities.filter(act => {
    // 1. Channel / Type
    if (typeFilter !== 'ALL' && act.type !== typeFilter) return false;

    // 2. Disposition / Outcome
    if (outcomeFilter !== 'ALL' && act.outcome !== outcomeFilter) return false;

    // 3. Advisor
    if (advisorFilter !== 'ALL' && act.advisorName !== advisorFilter) return false;

    // 4. Date Range
    if (dateFilter === 'TODAY' && act.timestamp < startOfToday) return false;
    if (dateFilter === 'YESTERDAY' && (act.timestamp < startOfYesterday || act.timestamp >= startOfToday)) return false;
    if (dateFilter === 'WEEK' && act.timestamp < sevenDaysAgo) return false;
    if (dateFilter === 'MONTH' && act.timestamp < thirtyDaysAgo) return false;

    // 5. Search query
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match = (act.clientName?.toLowerCase() || '').includes(q) ||
                    (act.clientPhone?.toLowerCase() || '').includes(q) ||
                    (act.advisorName?.toLowerCase() || '').includes(q) ||
                    (act.title?.toLowerCase() || '').includes(q) ||
                    (act.notes?.toLowerCase() || '').includes(q) ||
                    (act.outcome?.toLowerCase() || '').includes(q);
      if (!match) return false;
    }

    return true;
  });

  const uniqueAdvisors = Array.from(new Set(activities.map(a => a.advisorName).filter(Boolean)));

  // Helper: Format Relative Time or Exact Time adhering to 48-hour threshold
  const formatActivityTime = (dateObj) => {
    if (!dateObj) return { time: '-', relative: null };

    const diffMs = Date.now() - dateObj.getTime();
    const diffMinutes = Math.floor(diffMs / (60 * 1000));
    const diffHours = Math.floor(diffMs / (60 * 60 * 1000));

    // Time string: e.g. "05:32 AM"
    const timeStr = dateObj.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    // Check if event is from today (local calendar day)
    const isToday = dateObj.toDateString() === new Date().toDateString();

    if (isToday) {
      if (diffMinutes < 5) {
        return { time: timeStr, relative: 'Just now' };
      }
      if (diffMinutes < 60) {
        return { time: timeStr, relative: `${diffMinutes}m ago` };
      }
      if (diffHours < 24) {
        return { time: timeStr, relative: `${diffHours}h ago` };
      }
    }

    return { time: timeStr, relative: null };
  };

  // Helper: Extract Day Group Key (YYYY-MM-DD)
  const getDayKey = (dateObj) => {
    if (!dateObj) return 'unknown';
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper: Friendly Day Section Label (Clean Typographic Hierarchy)
  const getDayHeaderLabel = (dateObj) => {
    if (!dateObj) return { title: 'Past Activities', subtitle: '' };

    const now = new Date();
    const todayStr = getDayKey(now);

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = getDayKey(yesterday);

    const itemDayStr = getDayKey(dateObj);

    if (itemDayStr === todayStr) {
      return {
        title: 'Today',
        subtitle: dateObj.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })
      };
    }
    if (itemDayStr === yesterdayStr) {
      return {
        title: 'Yesterday',
        subtitle: dateObj.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })
      };
    }
    return {
      title: dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      subtitle: dateObj.toLocaleDateString('en-IN', { weekday: 'long' })
    };
  };

  // Analytics Cockpit
  const totalEngagements = activities.length;
  const totalCalls = activities.filter(a => a.type === 'CALL').length;
  const totalMeetings = activities.filter(a => a.type === 'MEETING').length;
  const positiveTouchpoints = activities.filter(a => 
    a.outcome === 'CONVERTED' || a.outcome === 'INTERESTED' || a.outcome === 'QUOTE_REQUESTED' || a.outcome === 'COMPLETED'
  ).length;

  // Pagination calculation
  const totalRecords = filteredActivities.length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalRecords);
  const paginatedActivities = filteredActivities.slice(startIndex, endIndex);

  // Group paginated items by Day for sectioned feed display
  const groupedActivities = [];
  paginatedActivities.forEach(item => {
    const dayKey = getDayKey(item.timestamp);
    let group = groupedActivities.find(g => g.dayKey === dayKey);
    if (!group) {
      group = {
        dayKey,
        header: getDayHeaderLabel(item.timestamp),
        items: []
      };
      groupedActivities.push(group);
    }
    group.items.push(item);
  });

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 120px)',
      maxHeight: 'calc(100vh - 120px)',
      gap: '0.75rem',
      overflow: 'hidden'
    }}>
      
      {/* 1. Header Bar with Title & Refresh */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        padding: '0 0 0.25rem 0',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
            color: '#1d4ed8',
            border: '1px solid #bfdbfe',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Activity size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-navy, #0f2b48)', margin: 0, letterSpacing: '-0.02em' }}>
                Activity Log & Omni-Channel Feed
              </h2>
              <span style={{
                background: '#f1f5f9',
                color: '#475569',
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '999px',
                border: '1px solid #e2e8f0'
              }}>
                {filteredActivities.length} total events
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
              Unified chronological timeline of phone calls, Google Meet consultations, follow-ups & outcomes
            </p>
          </div>
        </div>

        <button
          onClick={loadAllActivities}
          disabled={loading}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: '#ffffff',
            color: '#0f2b48',
            border: '1px solid #cbd5e1',
            padding: '6px 12px',
            borderRadius: '8px',
            fontSize: '0.78rem',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            transition: 'all 0.15s ease'
          }}
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} color="#059669" />
          {loading ? 'Syncing Feed...' : 'Sync Activity Feed'}
        </button>
      </div>

      {/* 2. Top Aggregate Metric Cockpit */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '10px',
        flexShrink: 0
      }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.65rem 0.85rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', flexShrink: 0 }}>
            <Activity size={17} />
          </div>
          <div>
            <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Total Engagements</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f2b48', lineHeight: 1.2 }}>{totalEngagements}</div>
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.65rem 0.85rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706', flexShrink: 0 }}>
            <PhoneCall size={17} />
          </div>
          <div>
            <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Phone Calls</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f2b48', lineHeight: 1.2 }}>{totalCalls}</div>
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.65rem 0.85rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c3aed', flexShrink: 0 }}>
            <Video size={17} />
          </div>
          <div>
            <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Consultations & Meets</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f2b48', lineHeight: 1.2 }}>{totalMeetings}</div>
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.65rem 0.85rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a', flexShrink: 0 }}>
            <CheckCircle2 size={17} />
          </div>
          <div>
            <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Positive Touchpoints</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f2b48', lineHeight: 1.2 }}>
              {positiveTouchpoints} <span style={{ fontSize: '0.7rem', color: '#16a34a', fontWeight: 700 }}>({totalEngagements > 0 ? Math.round((positiveTouchpoints / totalEngagements) * 100) : 0}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Multi-Channel Filter Bar */}
      <div style={{
        background: '#ffffff',
        borderRadius: '12px',
        padding: '0.75rem 1rem',
        border: '1px solid #e2e8f0',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0
      }}>
        
        {/* Search Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 240px' }}>
          <form 
            role="search"
            onSubmit={(e) => e.preventDefault()}
            style={{ position: 'relative', width: '100%', margin: 0 }}
          >
            <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="search"
              placeholder="Search client, phone, advisor, notes..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                width: '100%',
                padding: '6px 12px 6px 32px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.82rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </form>
        </div>

        {/* Filter Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          
          {/* Channel / Type Filter Pill Tabs */}
          <div style={{
            display: 'inline-flex',
            background: '#f1f5f9',
            padding: '3px',
            borderRadius: '8px',
            gap: '2px'
          }}>
            <button
              type="button"
              onClick={() => { setTypeFilter('ALL'); setCurrentPage(1); }}
              style={{
                padding: '4px 10px',
                fontSize: '0.74rem',
                fontWeight: 700,
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                background: typeFilter === 'ALL' ? '#ffffff' : 'transparent',
                color: typeFilter === 'ALL' ? '#0f2b48' : '#64748b',
                boxShadow: typeFilter === 'ALL' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none'
              }}
            >
              All Types
            </button>
            <button
              type="button"
              onClick={() => { setTypeFilter('CALL'); setCurrentPage(1); }}
              style={{
                padding: '4px 10px',
                fontSize: '0.74rem',
                fontWeight: 700,
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                background: typeFilter === 'CALL' ? '#ffffff' : 'transparent',
                color: typeFilter === 'CALL' ? '#d97706' : '#64748b',
                boxShadow: typeFilter === 'CALL' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none'
              }}
            >
              📞 Calls
            </button>
            <button
              type="button"
              onClick={() => { setTypeFilter('MEETING'); setCurrentPage(1); }}
              style={{
                padding: '4px 10px',
                fontSize: '0.74rem',
                fontWeight: 700,
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                background: typeFilter === 'MEETING' ? '#ffffff' : 'transparent',
                color: typeFilter === 'MEETING' ? '#2563eb' : '#64748b',
                boxShadow: typeFilter === 'MEETING' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none'
              }}
            >
              📅 Meets
            </button>
          </div>

          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => { setDateFilter(e.target.value); setCurrentPage(1); }}
            style={{
              padding: '6px 10px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.8rem',
              color: '#334155',
              background: '#ffffff',
              outline: 'none',
              fontWeight: 600
            }}
          >
            <option value="ALL">All Time</option>
            <option value="TODAY">Today</option>
            <option value="YESTERDAY">Yesterday</option>
            <option value="WEEK">Last 7 Days</option>
            <option value="MONTH">Last 30 Days</option>
          </select>

          {/* Disposition Outcome Filter */}
          <select
            value={outcomeFilter}
            onChange={(e) => { setOutcomeFilter(e.target.value); setCurrentPage(1); }}
            style={{
              padding: '6px 10px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.8rem',
              color: '#334155',
              background: '#ffffff',
              outline: 'none',
              fontWeight: 600
            }}
          >
            {DISPOSITION_OUTCOMES.map(o => (
              <option key={o.id} value={o.id}>{o.label}</option>
            ))}
          </select>

          {/* Advisor Filter */}
          {uniqueAdvisors.length > 0 && (
            <select
              value={advisorFilter}
              onChange={(e) => { setAdvisorFilter(e.target.value); setCurrentPage(1); }}
              style={{
                padding: '6px 10px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.8rem',
                color: '#334155',
                background: '#ffffff',
                outline: 'none',
                fontWeight: 600
              }}
            >
              <option value="ALL">All Team Members</option>
              {uniqueAdvisors.map(adv => (
                <option key={adv} value={adv}>{adv}</option>
              ))}
            </select>
          )}

          {/* Clear Filter Button if any active */}
          {(typeFilter !== 'ALL' || outcomeFilter !== 'ALL' || advisorFilter !== 'ALL' || dateFilter !== 'ALL' || searchTerm) && (
            <button
              type="button"
              onClick={() => {
                setTypeFilter('ALL');
                setOutcomeFilter('ALL');
                setAdvisorFilter('ALL');
                setDateFilter('ALL');
                setSearchTerm('');
                setCurrentPage(1);
              }}
              style={{
                padding: '5px 10px',
                fontSize: '0.74rem',
                fontWeight: 600,
                color: '#dc2626',
                background: '#fee2e2',
                border: '1px solid #fecaca',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* 4. Table Container */}
      <div style={{
        flex: 1,
        minHeight: 0,
        background: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '40px', color: '#64748b' }}>
            <RefreshCw size={26} className="animate-spin" color="#0284c7" />
            <div style={{ marginTop: '12px', fontWeight: 600, fontSize: '0.88rem' }}>Loading unified activity log...</div>
          </div>
        ) : filteredActivities.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '40px', color: '#64748b' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', marginBottom: '12px' }}>
              <Activity size={24} />
            </div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1e293b' }}>No activities match your filters</div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>Try resetting filters or adjusting date ranges.</div>
          </div>
        ) : (
          <>
            <div className="crm-table-scroll-container" style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
              <table className="crm-table" style={{ minWidth: '1100px' }}>
                <thead className="crm-table-head">
                  <tr>
                    <th className="crm-table-th" style={{ width: '60px', textAlign: 'center' }}>Type</th>
                    <th className="crm-table-th" style={{ minWidth: '160px' }}>Timestamp</th>
                    <th className="crm-table-th" style={{ minWidth: '190px' }}>Client</th>
                    <th className="crm-table-th" style={{ minWidth: '150px' }}>Advisor</th>
                    <th className="crm-table-th" style={{ minWidth: '180px' }}>Status / Disposition</th>
                    <th className="crm-table-th" style={{ minWidth: '100px' }}>Duration</th>
                    <th className="crm-table-th" style={{ minWidth: '260px' }}>Activity Notes & Details</th>
                    <th className="crm-table-th" style={{ minWidth: '140px' }}>Next Action</th>
                    <th className="crm-table-th" style={{ minWidth: '110px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedActivities.map((group) => (
                    <React.Fragment key={group.dayKey}>
                      {/* Day Group Section Header Divider (Clean Minimalist Typography) */}
                      <tr style={{ background: '#f8fafc', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
                        <td colSpan={9} style={{ padding: '8px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f2b48' }}>
                                {group.header.title}
                              </span>
                              {group.header.subtitle && (
                                <>
                                  <span style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>•</span>
                                  <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#64748b' }}>
                                    {group.header.subtitle}
                                  </span>
                                </>
                              )}
                            </div>
                            <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#94a3b8' }}>
                              {group.items.length} {group.items.length === 1 ? 'activity' : 'activities'}
                            </span>
                          </div>
                        </td>
                      </tr>

                      {/* Day Group Activity Items */}
                      {group.items.map((act) => {
                        const badge = getOutcomeBadge(act.outcome);
                        const isCall = act.type === 'CALL';
                        const timeMeta = formatActivityTime(act.timestamp);
                        const isToday = act.timestamp.toDateString() === new Date().toDateString();

                        return (
                          <tr 
                            key={act.id} 
                            style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s ease' }} 
                            onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'} 
                            onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
                          >
                            {/* Type Icon Badge */}
                            <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                              <div style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '8px',
                                margin: '0 auto',
                                background: isCall ? '#fef3c7' : '#eff6ff',
                                color: isCall ? '#d97706' : '#2563eb',
                                border: `1px solid ${isCall ? '#fde68a' : '#bfdbfe'}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }} title={isCall ? 'Phone Call' : 'Scheduled Meeting'}>
                                {isCall ? <PhoneCall size={14} /> : <Video size={14} />}
                              </div>
                            </td>

                            {/* Timestamp: Clean Time + Relative indicator for today */}
                            <td 
                              style={{ padding: '12px 16px', whiteSpace: 'nowrap', color: '#64748b' }}
                              title={act.timestamp.toLocaleString('en-IN', {
                                weekday: 'long',
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                                hour12: true
                              })}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Clock size={13} color="#94a3b8" />
                                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e293b' }}>
                                  {timeMeta.time}
                                </span>
                                {timeMeta.relative && (
                                  <span style={{
                                    fontSize: '0.68rem',
                                    fontWeight: 700,
                                    color: '#059669',
                                    background: '#ecfdf5',
                                    padding: '1px 5px',
                                    borderRadius: '4px',
                                    border: '1px solid #a7f3d0'
                                  }}>
                                    {timeMeta.relative}
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Client Details */}
                        <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontWeight: 700, color: '#0f2b48' }}>{act.clientName}</span>
                            {onOpenClient360 && act.clientId && (
                              <button
                                onClick={() => onOpenClient360({ id: act.clientId })}
                                style={{ background: 'none', border: 'none', color: '#0284c7', cursor: 'pointer', padding: 0 }}
                                title="Open Client 360"
                              >
                                <ExternalLink size={12} />
                              </button>
                            )}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{act.clientPhone || 'No Phone'}</div>
                        </td>

                        {/* Advisor */}
                        <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                          <div style={{ fontWeight: 600, color: '#0f2b48', fontSize: '0.82rem' }}>
                            {act.advisorName}
                          </div>
                        </td>

                        {/* Status / Outcome Badge */}
                        <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: badge.bg,
                            color: badge.color,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '0.72rem',
                            fontWeight: 700
                          }}>
                            {badge.label}
                          </span>
                        </td>

                        {/* Duration */}
                        <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', color: '#0f2b48', fontWeight: 600, fontSize: '0.78rem' }}>
                          {formatDuration(act.durationSeconds)}
                        </td>

                        {/* Notes */}
                        <td style={{ padding: '12px 16px', maxWidth: '300px' }}>
                          <div style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {act.notes || '-'}
                          </div>
                        </td>

                        {/* Next Action / Follow up */}
                        <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', color: '#0284c7', fontWeight: 600, fontSize: '0.78rem' }}>
                          {act.nextFollowUp ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Calendar size={13} />
                              {new Date(act.nextFollowUp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </div>
                          ) : act.googleMeetUrl ? (
                            <a 
                              href={act.googleMeetUrl} 
                              target="_blank" 
                              rel="noreferrer"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#2563eb', textDecoration: 'none' }}
                            >
                              <Video size={13} /> Join Link
                            </a>
                          ) : (
                            <span style={{ color: '#94a3b8' }}>None</span>
                          )}
                        </td>

                        {/* Actions (Dynamic Screen-Aware Dropdown) */}
                        <td style={{ padding: '12px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            {act.clientPhone && (
                              <a
                                href={`tel:${act.clientPhone}`}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: '28px',
                                  height: '28px',
                                  borderRadius: '6px',
                                  background: '#eff6ff',
                                  color: '#1d4ed8',
                                  border: '1px solid #bfdbfe',
                                  textDecoration: 'none'
                                }}
                                title={`Call ${act.clientName}`}
                              >
                                <Phone size={13} />
                              </a>
                            )}

                            <ActionDropdown
                              menuWidth="210px"
                              trigger={({ isOpen }) => (
                                <button
                                  type="button"
                                  className="crm-agenda-circle-btn"
                                  style={{
                                    width: '28px',
                                    height: '28px',
                                    borderRadius: '6px',
                                    border: '1px solid #cbd5e1',
                                    background: isOpen ? '#f1f5f9' : '#ffffff',
                                    color: '#334155',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    padding: 0
                                  }}
                                  title="More Actions"
                                >
                                  <MoreVertical size={14} />
                                </button>
                              )}
                            >
                              {({ close }) => (
                                <>
                                  {act.clientPhone && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        close();
                                        openWhatsApp(act.clientPhone, act.clientName);
                                      }}
                                      style={{
                                        width: '100%',
                                        padding: '7px 10px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        border: 'none',
                                        background: 'transparent',
                                        color: '#16a34a',
                                        fontSize: '0.8rem',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        borderRadius: '6px',
                                        textAlign: 'left'
                                      }}
                                      onMouseEnter={(e) => e.currentTarget.style.background = '#f0fdf4'}
                                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                      <WhatsAppIcon size={14} color="#16a34a" /> WhatsApp Client
                                    </button>
                                  )}

                                  {onOpenMeetingModal && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        close();
                                        onOpenMeetingModal({
                                          id: act.clientId,
                                          fullName: act.clientName,
                                          phoneNumber: act.clientPhone
                                        });
                                      }}
                                      style={{
                                        width: '100%',
                                        padding: '7px 10px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        border: 'none',
                                        background: 'transparent',
                                        color: '#2563eb',
                                        fontSize: '0.8rem',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        borderRadius: '6px',
                                        textAlign: 'left'
                                      }}
                                      onMouseEnter={(e) => e.currentTarget.style.background = '#eff6ff'}
                                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                      <Calendar size={14} /> Schedule Meeting
                                    </button>
                                  )}

                                  {onOpenClient360 && act.clientId && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        close();
                                        onOpenClient360({ id: act.clientId });
                                      }}
                                      style={{
                                        width: '100%',
                                        padding: '7px 10px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        border: 'none',
                                        background: 'transparent',
                                        color: '#0f2b48',
                                        fontSize: '0.8rem',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        borderRadius: '6px',
                                        textAlign: 'left'
                                      }}
                                      onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                      <User size={14} color="#0f2b48" /> View Client 360 &rarr;
                                    </button>
                                  )}
                                </>
                              )}
                            </ActionDropdown>
                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </React.Fragment>
              ))}
            </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <CrmTablePaginationBar
              currentPage={safeCurrentPage}
              totalPages={totalPages}
              totalRecords={totalRecords}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={handlePageSizeChange}
              unitName="activity logs"
            />
          </>
        )}
      </div>

    </div>
  );
}
