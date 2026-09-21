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
  ChevronRight
} from 'lucide-react';
import { crmService } from '../../services/api';

export default function AuditTrailView({ onOpenClient360 }) {
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [fieldFilter, setFieldFilter] = useState('ALL');
  const [userFilter, setUserFilter] = useState('ALL');

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

  // Extract unique users and fields for filters
  const uniqueUsers = Array.from(new Set(auditLogs.map(l => l.performedByName).filter(Boolean)));
  const uniqueFields = Array.from(new Set(auditLogs.map(l => l.fieldName).filter(Boolean)));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Top Banner & Governance Overview */}
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
            <ShieldCheck size={14} /> ZERO-TAMPER COMPLIANCE AUDIT
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.02em', color: '#ffffff' }}>
            Enterprise Audit Trail & Change Governance
          </h2>
          <p style={{ fontSize: '0.84rem', color: '#cbd5e1', margin: 0, lineHeight: 1.5 }}>
            Every CRM modification, follow-up reschedule, stage transition, reassignment, and advisor call is permanently recorded with exact before-and-after states, author attribution, and timestamps.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={fetchAuditFeed}
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
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Refreshing...' : 'Refresh Logs'}
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '12px'
      }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
            <Database size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Total Audit Records</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f2b48' }}>{auditLogs.length}</div>
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c3aed' }}>
            <UserCheck size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Reassignments Tracked</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f2b48' }}>
              {auditLogs.filter(l => l.action === 'REASSIGN').length}
            </div>
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
            <SlidersHorizontal size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Stage Transitions</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f2b48' }}>
              {auditLogs.filter(l => l.action === 'STATUS_CHANGE' || l.fieldName === 'stage').length}
            </div>
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
            <Calendar size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Rescheduled Calls/Dates</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f2b48' }}>
              {auditLogs.filter(l => l.fieldName?.toLowerCase().includes('followup') || l.fieldName?.toLowerCase().includes('date')).length}
            </div>
          </div>
        </div>
      </div>

      {/* Control / Filter Bar */}
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
        </div>
      </div>

      {/* Main Table Feed */}
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
            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Loading live audit logs from database...</div>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
            <ShieldCheck size={40} color="#cbd5e1" style={{ margin: '0 auto 10px auto' }} />
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#475569' }}>No audit trail records found</div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>
              {searchTerm || actionFilter !== 'ALL' || userFilter !== 'ALL' || fieldFilter !== 'ALL'
                ? 'Try clearing some of your search or filter options.'
                : 'Any CRM updates and advisor actions will be recorded here.'}
            </div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <tr>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>Timestamp</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>User / Employee</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>Action & Target</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>Field Modified</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>Original Value</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>Updated Value</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => {
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
        )}
      </div>

    </div>
  );
}
