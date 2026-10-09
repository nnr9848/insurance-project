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
import { CrmTablePaginationBar, CrmTopMiniPager } from './common/CrmTablePaginationBar';

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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(() => {
    const saved = localStorage.getItem('call_history_page_size');
    return saved ? parseInt(saved, 10) : 10;
  });

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1);
    try {
      localStorage.setItem('call_history_page_size', String(newSize));
    } catch (e) {
      // ignore
    }
  };

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

  // Pagination calculation
  const totalRecords = filteredLogs.length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalRecords);
  const paginatedLogs = filteredLogs.slice(startIndex, endIndex);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 120px)',
      maxHeight: 'calc(100vh - 120px)',
      gap: '0.75rem',
      overflow: 'hidden'
    }}>
      
      {/* 1. Sleek Compact Header Bar (Industry Standard SaaS) */}
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
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: '#fef3c7',
            color: '#b45309',
            border: '1px solid #fde68a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <PhoneCall size={18} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-navy, #0f2b48)', margin: 0, letterSpacing: '-0.02em' }}>
                Call History & Telephony Log
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
                {filteredLogs.length} calls
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
              Advisor call recordings, discussion notes, duration analytics & follow-ups
            </p>
          </div>
        </div>

        <button
          onClick={fetchCallHistory}
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
          {loading ? 'Refreshing...' : 'Refresh Logs'}
        </button>
      </div>

      {/* KPI Stats Bar (Compact & Sleek) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '10px',
        flexShrink: 0
      }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.65rem 0.85rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', flexShrink: 0 }}>
            <PhoneCall size={17} />
          </div>
          <div>
            <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Total Calls Logged</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f2b48', lineHeight: 1.2 }}>{totalCalls}</div>
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.65rem 0.85rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a', flexShrink: 0 }}>
            <CheckCircle2 size={17} />
          </div>
          <div>
            <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Connected Calls</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f2b48', lineHeight: 1.2 }}>
              {connectedCalls} <span style={{ fontSize: '0.7rem', color: '#16a34a', fontWeight: 700 }}>({totalCalls > 0 ? Math.round((connectedCalls / totalCalls) * 100) : 0}%)</span>
            </div>
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.65rem 0.85rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c3aed', flexShrink: 0 }}>
            <TrendingUp size={17} />
          </div>
          <div>
            <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Positive Outcomes</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f2b48', lineHeight: 1.2 }}>{convertedCalls}</div>
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.65rem 0.85rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706', flexShrink: 0 }}>
            <Clock size={17} />
          </div>
          <div>
            <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Avg Call Duration</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f2b48', lineHeight: 1.2 }}>{avgTalkMins} mins</div>
          </div>
        </div>
      </div>

      {/* Control & Search Bar (Pinned at top of table) */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 280px' }}>
          <form 
            role="search"
            onSubmit={(e) => e.preventDefault()}
            style={{ position: 'relative', width: '100%', margin: 0 }}
          >
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="search"
              name="call-history-search-filter"
              id="call-history-search-filter"
              autoComplete="search"
              data-lpignore="true"
              data-form-type="other"
              placeholder="Search client, phone, advisor, disposition..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                width: '100%',
                padding: '7px 12px 7px 34px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.82rem',
                outline: 'none'
              }}
            />
          </form>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Result Filter */}
          <select
            value={resultFilter}
            onChange={(e) => {
              setResultFilter(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              padding: '6px 10px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.8rem',
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
            onChange={(e) => {
              setAdvisorFilter(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              padding: '6px 10px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.8rem',
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

          {/* Top Mini Pager */}
          <CrmTopMiniPager
            currentPage={safeCurrentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* Main Table Card (Viewport-locked Flex container) */}
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0
      }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ width: '32px', height: '32px', border: '3px solid #cbd5e1', borderTopColor: '#f59e0b', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px auto' }} />
            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Loading call history logs...</div>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <PhoneCall size={40} color="#cbd5e1" style={{ margin: '0 auto 10px auto' }} />
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#475569' }}>No call logs found</div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>Calls logged from the Daily Call Agenda will appear here.</div>
          </div>
        ) : (
          <>
            <div className="crm-table-scroll-container" style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
              <table className="crm-table" style={{ minWidth: '1060px' }}>
                <thead className="crm-table-head">
                  <tr>
                    <th className="crm-table-th" style={{ minWidth: '170px' }}>Call Date & Time</th>
                    <th className="crm-table-th" style={{ minWidth: '180px' }}>Client</th>
                    <th className="crm-table-th" style={{ minWidth: '150px' }}>Advisor</th>
                    <th className="crm-table-th" style={{ minWidth: '180px' }}>Disposition Outcome</th>
                    <th className="crm-table-th" style={{ minWidth: '110px' }}>Duration</th>
                    <th className="crm-table-th" style={{ minWidth: '240px' }}>Discussion Notes</th>
                    <th className="crm-table-th" style={{ minWidth: '150px' }}>Next Follow-Up</th>
                    <th className="crm-table-th" style={{ minWidth: '120px', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedLogs.map((log) => {
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

            {/* Pinned Bottom Pagination Footer */}
            <CrmTablePaginationBar
              currentPage={safeCurrentPage}
              totalPages={totalPages}
              totalRecords={totalRecords}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={handlePageSizeChange}
              unitName="call logs"
            />
          </>
        )}
      </div>

    </div>
  );
}
