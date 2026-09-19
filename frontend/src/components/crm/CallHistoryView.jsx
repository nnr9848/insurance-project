import React, { useState, useEffect } from 'react';
import { 
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
  Sparkles, 
  RefreshCw, 
  MessageSquare, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Activity,
  Check,
  FileSpreadsheet
} from 'lucide-react';
import { crmService } from '../../services/api';

const CALL_RESULTS = [
  { id: 'INTERESTED', label: 'Interested', color: '#16a34a', bg: '#dcfce7' },
  { id: 'QUOTE_REQUESTED', label: 'Quote Requested', color: '#0284c7', bg: '#e0f2fe' },
  { id: 'MEETING_REQUESTED', label: 'Meeting Scheduled', color: '#7c3aed', bg: '#ede9fe' },
  { id: 'DOCS_REQUESTED', label: 'Docs Requested', color: '#059669', bg: '#d1fae5' },
  { id: 'CALL_BACK', label: 'Call Back Requested', color: '#d97706', bg: '#fef3c7' },
  { id: 'ANSWERED', label: 'Connected / Answered', color: '#2563eb', bg: '#eff6ff' },
  { id: 'NOT_ANSWERED', label: 'Not Answered / Busy', color: '#dc2626', bg: '#fee2e2' },
  { id: 'NOT_INTERESTED', label: 'Not Interested', color: '#64748b', bg: '#f1f5f9' },
  { id: 'CONVERTED', label: 'Policy Converted', color: '#15803d', bg: '#bbf7d0' },
  { id: 'LOST', label: 'Lost to Competitor', color: '#991b1b', bg: '#fecaca' }
];

export default function CallHistoryView({ onOpenClient360 }) {
  const [callLogs, setCallLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [resultFilter, setResultFilter] = useState('ALL');
  const [advisorFilter, setAdvisorFilter] = useState('ALL');

  useEffect(() => {
    fetchCallHistory();
  }, []);

  const fetchCallHistory = async () => {
    setLoading(true);
    try {
      const data = await crmService.getCallHistory();
      setCallLogs(data || []);
    } catch (err) {
      console.error('Failed to fetch call history:', err);
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

  const getResultBadge = (result) => {
    const found = CALL_RESULTS.find(r => r.id === result);
    if (found) {
      return { label: found.label, bg: found.bg, color: found.color };
    }
    return { label: result, bg: '#f1f5f9', color: '#475569' };
  };

  // Filtered dataset
  const filteredLogs = callLogs.filter(log => {
    const matchesSearch = 
      (log.clientName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (log.clientPhone?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (log.advisorName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (log.callNotes?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (log.callResult?.toLowerCase() || '').includes(searchTerm.toLowerCase());

    const matchesResult = resultFilter === 'ALL' || log.callResult === resultFilter;
    const matchesAdvisor = advisorFilter === 'ALL' || log.advisorName === advisorFilter;

    return matchesSearch && matchesResult && matchesAdvisor;
  });

  const uniqueAdvisors = Array.from(new Set(callLogs.map(l => l.advisorName).filter(Boolean)));

  // Analytics
  const totalCalls = callLogs.length;
  const connectedCalls = callLogs.filter(l => l.callResult !== 'NOT_ANSWERED' && l.callResult !== 'WRONG_NUMBER').length;
  const convertedCalls = callLogs.filter(l => l.callResult === 'CONVERTED' || l.callResult === 'QUOTE_REQUESTED' || l.callResult === 'INTERESTED').length;
  const totalTalkSeconds = callLogs.reduce((acc, curr) => acc + (curr.callDurationSeconds || 0), 0);
  const avgTalkMins = totalCalls > 0 ? (totalTalkSeconds / totalCalls / 60).toFixed(1) : '0';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #091726 0%, #0f2b48 100%)',
        borderRadius: '16px',
        padding: '1.5rem',
        color: '#ffffff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        boxShadow: '0 4px 14px rgba(0,0,0,0.1)'
      }}>
        <div style={{ maxWidth: '650px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', padding: '4px 10px', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 800, marginBottom: '8px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            <PhoneCall size={14} /> CALL HISTORY & TELEPHONY REPOSITORIES
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.02em', color: '#ffffff' }}>
            Advisor Call Log Archive & Talk Time Analytics
          </h2>
          <p style={{ fontSize: '0.84rem', color: '#cbd5e1', margin: 0, lineHeight: 1.5 }}>
            Audit every client interaction with call duration, outcomes, discussion notes, and scheduled next follow-ups across the branch.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={fetchCallHistory}
            disabled={loading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255,255,255,0.12)',
              color: '#ffffff',
              border: '1px solid rgba(255,255,255,0.2)',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Refreshing...' : 'Refresh Logs'}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '12px'
      }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
            <PhoneCall size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Total Calls Logged</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f2b48' }}>{totalCalls}</div>
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Connected Calls</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f2b48' }}>
              {connectedCalls} <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 700 }}>({totalCalls > 0 ? Math.round((connectedCalls / totalCalls) * 100) : 0}%)</span>
            </div>
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c3aed' }}>
            <TrendingUp size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Positive Outcomes</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f2b48' }}>
              {convertedCalls}
            </div>
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
            <Clock size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Avg Call Duration</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f2b48' }}>
              {avgTalkMins} mins
            </div>
          </div>
        </div>
      </div>

      {/* Control & Search Bar */}
      <div style={{
        background: '#ffffff',
        borderRadius: '14px',
        padding: '1rem 1.25rem',
        border: '1px solid #e2e8f0',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 280px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search by client name, phone, advisor, disposition, or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 34px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.84rem',
                outline: 'none'
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Result Filter */}
          <select
            value={resultFilter}
            onChange={(e) => setResultFilter(e.target.value)}
            style={{
              padding: '7px 10px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.82rem',
              color: '#334155',
              fontWeight: 600,
              outline: 'none',
              background: '#f8fafc'
            }}
          >
            <option value="ALL">All Call Results</option>
            {CALL_RESULTS.map(r => (
              <option key={r.id} value={r.id}>{r.label}</option>
            ))}
          </select>

          {/* Advisor Filter */}
          <select
            value={advisorFilter}
            onChange={(e) => setAdvisorFilter(e.target.value)}
            style={{
              padding: '7px 10px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.82rem',
              color: '#334155',
              fontWeight: 600,
              outline: 'none',
              background: '#f8fafc'
            }}
          >
            <option value="ALL">All Insurance Advisors</option>
            {uniqueAdvisors.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
      }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            <div style={{ width: '32px', height: '32px', border: '3px solid #cbd5e1', borderTopColor: '#f59e0b', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px auto' }} />
            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Loading call history logs...</div>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
            <PhoneCall size={40} color="#cbd5e1" style={{ margin: '0 auto 10px auto' }} />
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#475569' }}>No call logs found</div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>Calls logged from the Daily Call Agenda will appear here.</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <tr>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>Call Date & Time</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>Client</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>Advisor</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>Disposition Outcome</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>Duration</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>Discussion Notes</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>Next Follow-Up</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => {
                  const badge = getResultBadge(log.callResult);

                  return (
                    <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s ease' }} onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}>
                      
                      {/* Date */}
                      <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', color: '#64748b' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600, color: '#1e293b' }}>
                          <Clock size={13} color="#94a3b8" />
                          {log.createdAt ? new Date(log.createdAt).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          }) : '-'}
                        </div>
                      </td>

                      {/* Client */}
                      <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontWeight: 700, color: '#0f2b48' }}>{log.clientName}</span>
                          {onOpenClient360 && (
                            <button
                              onClick={() => onOpenClient360({ id: log.clientId })}
                              style={{ background: 'none', border: 'none', color: '#0284c7', cursor: 'pointer', padding: 0 }}
                              title="Open Client 360"
                            >
                              <ExternalLink size={12} />
                            </button>
                          )}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{log.clientPhone}</div>
                      </td>

                      {/* Advisor */}
                      <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: 600, color: '#0f2b48', fontSize: '0.82rem' }}>
                          {log.advisorName}
                        </div>
                      </td>

                      {/* Outcome Badge */}
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
                      <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', color: '#0f2b48', fontWeight: 600 }}>
                        {formatDuration(log.callDurationSeconds)}
                      </td>

                      {/* Notes */}
                      <td style={{ padding: '12px 16px', maxWidth: '280px' }}>
                        <div style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {log.callNotes || '-'}
                        </div>
                      </td>

                      {/* Next follow up */}
                      <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', color: '#0284c7', fontWeight: 600, fontSize: '0.78rem' }}>
                        {log.nextFollowUpDate ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={13} />
                            {new Date(log.nextFollowUpDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </div>
                        ) : (
                          <span style={{ color: '#94a3b8' }}>None</span>
                        )}
                      </td>

                      {/* Action */}
                      <td style={{ padding: '12px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <a
                          href={`tel:${log.clientPhone}`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: '#eff6ff',
                            color: '#1d4ed8',
                            border: '1px solid #bfdbfe',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            textDecoration: 'none'
                          }}
                        >
                          <Phone size={12} /> Call Again
                        </a>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
