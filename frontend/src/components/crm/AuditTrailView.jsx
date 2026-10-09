import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Clock, 
  ArrowRight, 
  RefreshCw, 
  Activity, 
  CheckCircle2, 
  PhoneCall, 
  Video, 
  UserCheck, 
  FileEdit, 
  Sparkles,
  Layers,
  Database,
  Eye,
  SlidersHorizontal,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { crmService } from '../../services/api';

export default function AuditTrailView({ onOpenClient360 }) {
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [fieldFilter, setFieldFilter] = useState('ALL');
  const [userFilter, setUserFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(() => {
    const saved = localStorage.getItem('audit_page_size');
    return saved ? parseInt(saved, 10) : 10;
  });

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1);
    try {
      localStorage.setItem('audit_page_size', String(newSize));
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    fetchAuditFeed();
  }, []);

  const fetchAuditFeed = async () => {
    setLoading(true);
    try {
      const data = await crmService.getCompanyAuditFeed();
      setAuditLogs(data || []);
    } catch (err) {
      console.error('Failed to fetch audit feed:', err);
    } finally {
      setLoading(false);
    }
  };

  // Helper formatting for action types
  const getActionBadge = (action) => {
    switch (action) {
      case 'CREATE':
        return { label: 'Created Lead', bg: '#dcfce7', text: '#15803d', icon: <CheckCircle2 size={13} /> };
      case 'UPDATE':
        return { label: 'Updated Field', bg: '#eff6ff', text: '#1d4ed8', icon: <FileEdit size={13} /> };
      case 'REASSIGN':
        return { label: 'Reassigned Lead', bg: '#ede9fe', text: '#6d28d9', icon: <UserCheck size={13} /> };
      case 'STATUS_CHANGE':
        return { label: 'Stage Transition', bg: '#fef3c7', text: '#b45309', icon: <SlidersHorizontal size={13} /> };
      case 'CALL_LOG':
        return { label: 'Call Logged', bg: '#e0f2fe', text: '#0369a1', icon: <PhoneCall size={13} /> };
      case 'MEETING_SCHEDULED':
        return { label: 'Meeting Scheduled', bg: '#fae8ff', text: '#a21caf', icon: <Video size={13} /> };
      default:
        return { label: action, bg: '#f1f5f9', text: '#475569', icon: <Activity size={13} /> };
    }
  };

  const formatTimestamp = (ts) => {
    if (!ts) return 'N/A';
    const date = new Date(ts);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Filtered dataset
  const filteredLogs = auditLogs.filter(item => {
    const matchesSearch = 
      (item.fieldName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (item.performedByName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (item.oldValue?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (item.newValue?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (item.action?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      String(item.entityId || '').includes(searchTerm);

    const matchesAction = actionFilter === 'ALL' || item.action === actionFilter;
    const matchesUser = userFilter === 'ALL' || item.performedByName === userFilter;
    const matchesField = fieldFilter === 'ALL' || item.fieldName === fieldFilter;
    return matchesSearch && matchesAction && matchesUser && matchesField;
  });

  // Pagination calculation
  const totalRecords = filteredLogs.length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalRecords);
  const paginatedLogs = filteredLogs.slice(startIndex, endIndex);

  // Extract unique users and fields for filters
  const uniqueUsers = Array.from(new Set(auditLogs.map(l => l.performedByName).filter(Boolean)));
  const uniqueFields = Array.from(new Set(auditLogs.map(l => l.fieldName).filter(Boolean)));

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
            <ShieldCheck size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-navy, #0f2b48)', margin: 0, letterSpacing: '-0.02em' }}>
                Audit Trail & Compliance
              </h2>
              <span style={{
                background: '#f1f5f9',
                color: '#475569',
                fontSize: '0.72rem',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '999px',
                border: '1px solid #e2e8f0'
              }}>
                {auditLogs.length} Records
              </span>
            </div>
            <p style={{ margin: '1px 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
              Immutable audit ledger capturing change history, author attribution, and stage transitions
            </p>
          </div>
        </div>

        <button
          onClick={fetchAuditFeed}
          disabled={loading}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: '#ffffff',
            color: '#0f2b48',
            border: '1px solid #cbd5e1',
            padding: '7px 12px',
            borderRadius: '8px',
            fontSize: '0.8rem',
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
            <Database size={17} />
          </div>
          <div>
            <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Total Audit Records</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f2b48', lineHeight: 1.2 }}>{auditLogs.length}</div>
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.65rem 0.85rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c3aed', flexShrink: 0 }}>
            <UserCheck size={17} />
          </div>
          <div>
            <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Reassignments Tracked</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f2b48', lineHeight: 1.2 }}>
              {auditLogs.filter(l => l.action === 'REASSIGN').length}
            </div>
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.65rem 0.85rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706', flexShrink: 0 }}>
            <SlidersHorizontal size={17} />
          </div>
          <div>
            <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Stage Transitions</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f2b48', lineHeight: 1.2 }}>
              {auditLogs.filter(l => l.action === 'STATUS_CHANGE' || l.fieldName === 'stage').length}
            </div>
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.65rem 0.85rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a', flexShrink: 0 }}>
            <Calendar size={17} />
          </div>
          <div>
            <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Rescheduled Calls/Dates</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f2b48', lineHeight: 1.2 }}>
              {auditLogs.filter(l => l.fieldName?.toLowerCase().includes('followup') || l.fieldName?.toLowerCase().includes('date')).length}
            </div>
          </div>
        </div>
      </div>

      {/* Control / Filter Bar (Pinned at top of table) */}
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
            style={{
              position: 'relative',
              width: '100%',
              margin: 0
            }}
          >
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="search"
              name="audit-trail-search-filter"
              id="audit-trail-search-filter"
              autoComplete="search"
              data-lpignore="true"
              data-form-type="other"
              placeholder="Search by field, user, old/new value, or Client ID..."
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
          </form>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Action Filter */}
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
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
            <option value="ALL">All Actions</option>
            <option value="UPDATE">Field Updates</option>
            <option value="REASSIGN">Reassignments</option>
            <option value="STATUS_CHANGE">Stage Changes</option>
            <option value="CALL_LOG">Call Logs</option>
            <option value="MEETING_SCHEDULED">Meetings</option>
            <option value="CREATE">New Records</option>
          </select>

          {/* User / Employee Filter */}
          <select
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
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
            <option value="ALL">All Users / Authors</option>
            {uniqueUsers.map(u => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>

          {/* Field Name Filter */}
          <select
            value={fieldFilter}
            onChange={(e) => setFieldFilter(e.target.value)}
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
            <option value="ALL">All Fields</option>
            {uniqueFields.map(f => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>

          {/* Top Mini-Pager (Industry Standard Zero-Scroll Navigation) */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            paddingLeft: '6px',
            borderLeft: '1px solid #e2e8f0',
            fontSize: '0.8rem',
            color: '#475569'
          }}>
            <span style={{ fontWeight: 600 }}>
              <strong>{safeCurrentPage}</strong> / <strong>{totalPages}</strong>
            </span>

            <button
              type="button"
              title="Previous Page"
              disabled={safeCurrentPage <= 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: safeCurrentPage <= 1 ? '#f8fafc' : '#ffffff',
                color: safeCurrentPage <= 1 ? '#94a3b8' : '#0f2b48',
                cursor: safeCurrentPage <= 1 ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <ChevronLeft size={14} />
            </button>

            <button
              type="button"
              title="Next Page"
              disabled={safeCurrentPage >= totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: safeCurrentPage >= totalPages ? '#f8fafc' : '#ffffff',
                color: safeCurrentPage >= totalPages ? '#94a3b8' : '#0f2b48',
                cursor: safeCurrentPage >= totalPages ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Table Feed Card (Viewport-locked Flex container) */}
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
            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Loading live audit logs from database...</div>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <ShieldCheck size={40} color="#cbd5e1" style={{ margin: '0 auto 10px auto' }} />
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#475569' }}>No audit trail records found</div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>
              {searchTerm || actionFilter !== 'ALL' || userFilter !== 'ALL' || fieldFilter !== 'ALL'
                ? 'Try clearing some of your search or filter options.'
                : 'Any CRM updates and advisor actions will be recorded here.'}
            </div>
          </div>
        ) : (
          <>
            <div className="crm-table-scroll-container" style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
              <table className="crm-table" style={{ minWidth: '1060px' }}>
                <thead className="crm-table-head">
                  <tr>
                    <th className="crm-table-th" style={{ minWidth: '170px' }}>Timestamp</th>
                    <th className="crm-table-th" style={{ minWidth: '180px' }}>User / Employee</th>
                    <th className="crm-table-th" style={{ minWidth: '190px' }}>Action & Target</th>
                    <th className="crm-table-th" style={{ minWidth: '160px' }}>Field Modified</th>
                    <th className="crm-table-th" style={{ minWidth: '160px' }}>Original Value</th>
                    <th className="crm-table-th" style={{ minWidth: '160px' }}>Updated Value</th>
                    <th className="crm-table-th" style={{ minWidth: '110px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedLogs.map((log) => {
                  const badge = getActionBadge(log.action);
                  return (
                    <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s ease' }} onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}>
                      
                      {/* Timestamp */}
                      <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', color: '#64748b' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600, color: '#1e293b' }}>
                          <Clock size={13} color="#94a3b8" />
                          {formatTimestamp(log.timestamp)}
                        </div>
                      </td>

                      {/* Performed By */}
                      <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#0f2b48', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', fontWeight: 800 }}>
                            {(log.performedByName || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: '#0f2b48', fontSize: '0.82rem' }}>
                              {log.performedByName || 'System / Auto'}
                            </div>
                            {log.ipAddress && (
                              <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                                IP: {log.ipAddress}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Action & Entity */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: badge.bg,
                            color: badge.text,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '0.72rem',
                            fontWeight: 700
                          }}>
                            {badge.icon} {badge.label}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                            Client #{log.entityId}
                          </span>
                        </div>
                      </td>

                      {/* Field */}
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          background: '#f1f5f9',
                          color: '#334155',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          fontFamily: 'monospace'
                        }}>
                          {log.fieldName || 'RECORD'}
                        </span>
                      </td>

                      {/* Old Value */}
                      <td style={{ padding: '12px 16px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {log.oldValue ? (
                          <span style={{ color: '#dc2626', background: '#fef2f2', padding: '2px 6px', borderRadius: '4px', fontSize: '0.78rem', textDecoration: 'line-through' }}>
                            {log.oldValue}
                          </span>
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontStyle: 'italic' }}>
                            None / New
                          </span>
                        )}
                      </td>

                      {/* New Value */}
                      <td style={{ padding: '12px 16px', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {log.newValue ? (
                          <span style={{ color: '#16a34a', background: '#f0fdf4', padding: '2px 6px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 700 }}>
                            {log.newValue}
                          </span>
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontStyle: 'italic' }}>
                            Cleared
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '12px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        {log.entityId && onOpenClient360 && (
                          <button
                            onClick={() => onOpenClient360({ id: log.entityId })}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              background: '#f8fafc',
                              border: '1px solid #e2e8f0',
                              color: '#0284c7',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            <Eye size={12} /> View Client
                          </button>
                        )}
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Pagination Bar (Pinned to Card Bottom) */}
          <div className="crm-table-pagination-bar" style={{ flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                style={{
                  padding: '3px 8px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: '#334155'
                }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span style={{ color: '#64748b', marginLeft: '6px' }}>
                Showing <strong>{totalRecords === 0 ? 0 : startIndex + 1}</strong> – <strong>{endIndex}</strong> of <strong>{totalRecords}</strong> audit logs
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#64748b', marginRight: '4px' }}>
                Page <strong>{safeCurrentPage}</strong> of <strong>{totalPages}</strong>
              </span>

              <button
                type="button"
                className="crm-pagination-btn"
                disabled={safeCurrentPage <= 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              >
                <ChevronLeft size={14} /> Previous
              </button>

              <button
                type="button"
                className="crm-pagination-btn"
                disabled={safeCurrentPage >= totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>

    </div>
  );
}
