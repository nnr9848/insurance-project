import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  User, 
  ShieldCheck, 
  Sparkles, 
  RefreshCw, 
  ExternalLink,
  ChevronRight,
  TrendingDown,
  UserCheck,
  Award,
  FileText,
  DollarSign,
  AlertTriangle,
  MessageSquare,
  Check,
  X
} from 'lucide-react';
import { crmService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const REQUEST_TYPES = [
  { id: 'SPECIAL_DISCOUNT', label: 'Special Discount / NCB Waiver', icon: <DollarSign size={14} />, bg: '#eff6ff', color: '#1d4ed8' },
  { id: 'HIGH_SUM_INSURED', label: 'High Sum Insured (>50L)', icon: <Award size={14} />, bg: '#ede9fe', color: '#6d28d9' },
  { id: 'LEAD_REASSIGNMENT', label: 'Lead Reassignment', icon: <UserCheck size={14} />, bg: '#fef3c7', color: '#b45309' },
  { id: 'POLICY_CANCELLATION', label: 'Policy Cancellation', icon: <AlertTriangle size={14} />, bg: '#fee2e2', color: '#b91c1c' },
  { id: 'CLIENT_ARCHIVE', label: 'Client Archive / Soft Delete', icon: <FileText size={14} />, bg: '#f1f5f9', color: '#475569' }
];

export default function ManagerApprovalsView({ onOpenClient360 }) {
  const { isSuperAdmin, isManager, user } = useAuth();
  const canReview = isSuperAdmin || isManager;

  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');

  // Submit Modal state
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [clients, setClients] = useState([]);
  const [advisors, setAdvisors] = useState([]);
  const [formData, setFormData] = useState({
    requestType: 'SPECIAL_DISCOUNT',
    clientId: '',
    currentValue: '',
    proposedValue: '',
    discountPercent: 10,
    targetAdvisorId: '',
    reason: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Review Modal state
  const [activeApproval, setActiveApproval] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewing, setReviewing] = useState(false);

  useEffect(() => {
    fetchApprovals();
    fetchClientsAndAdvisors();
  }, []);

  const fetchApprovals = async () => {
    setLoading(true);
    try {
      const data = await crmService.getApprovals();
      setApprovals(data || []);
    } catch (err) {
      console.error('Failed to fetch approvals:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClientsAndAdvisors = async () => {
    try {
      const [leadsData, advisorsData] = await Promise.all([
        crmService.getLeads(),
        crmService.getAdvisors()
      ]);
      setClients(leadsData || []);
      setAdvisors(advisorsData || []);
    } catch (err) {
      console.error('Failed to load auxiliary data:', err);
    }
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!formData.reason) {
      alert('Please provide a justification reason.');
      return;
    }

    setSubmitting(true);
    try {
      await crmService.submitApprovalRequest({
        ...formData,
        clientId: formData.clientId ? Number(formData.clientId) : null,
        targetAdvisorId: formData.targetAdvisorId ? Number(formData.targetAdvisorId) : null,
        discountPercent: formData.discountPercent ? Number(formData.discountPercent) : null
      });
      setShowSubmitModal(false);
      setFormData({
        requestType: 'SPECIAL_DISCOUNT',
        clientId: '',
        currentValue: '',
        proposedValue: '',
        discountPercent: 10,
        targetAdvisorId: '',
        reason: ''
      });
      fetchApprovals();
    } catch (err) {
      alert('Failed to submit approval: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleReviewDecision = async (status) => {
    if (!activeApproval) return;
    setReviewing(true);
    try {
      await crmService.reviewApprovalRequest(activeApproval.id, {
        status,
        reviewNotes
      });
      setActiveApproval(null);
      setReviewNotes('');
      fetchApprovals();
    } catch (err) {
      alert('Failed to process review: ' + (err.response?.data?.message || err.message));
    } finally {
      setReviewing(false);
    }
  };

  // Filtered approvals
  const filtered = approvals.filter(item => {
    const matchesSearch = 
      (item.clientName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (item.requestedByName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (item.reason?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (item.requestType?.toLowerCase() || '').includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    const matchesType = typeFilter === 'ALL' || item.requestType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return { label: 'Approved ✓', bg: '#dcfce7', text: '#15803d', icon: <CheckCircle2 size={13} /> };
      case 'REJECTED':
        return { label: 'Rejected ✗', bg: '#fee2e2', text: '#b91c1c', icon: <XCircle size={13} /> };
      case 'PENDING':
      default:
        return { label: 'Pending Manager Decision', bg: '#fef3c7', text: '#b45309', icon: <Clock size={13} /> };
    }
  };

  const getTypeMeta = (type) => {
    return REQUEST_TYPES.find(r => r.id === type) || { label: type, icon: <CheckSquare size={14} />, bg: '#f1f5f9', color: '#475569' };
  };

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
            <CheckSquare size={14} /> MANAGER APPROVALS & GOVERNANCE
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.02em', color: '#ffffff' }}>
            Executive Approval Workflows & Exception Desk
          </h2>
          <p style={{ fontSize: '0.84rem', color: '#cbd5e1', margin: 0, lineHeight: 1.5 }}>
            Manage and sign off on high-value quotation discounts, special NCB waivers, HNW policy underwriting exceptions, and portfolio reassignments.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setShowSubmitModal(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#f59e0b',
              color: '#091726',
              border: 'none',
              padding: '9px 16px',
              borderRadius: '8px',
              fontSize: '0.84rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(245, 158, 11, 0.35)'
            }}
          >
            Submit Request
          </button>

          <button
            onClick={fetchApprovals}
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
            {loading ? 'Refreshing...' : 'Refresh'}
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
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
            <Clock size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Pending Review</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f2b48' }}>
              {approvals.filter(a => a.status === 'PENDING').length}
            </div>
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Approved Requests</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f2b48' }}>
              {approvals.filter(a => a.status === 'APPROVED').length}
            </div>
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626' }}>
            <XCircle size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Rejected Exceptions</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f2b48' }}>
              {approvals.filter(a => a.status === 'REJECTED').length}
            </div>
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
            <DollarSign size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Discount Waivers</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f2b48' }}>
              {approvals.filter(a => a.requestType === 'SPECIAL_DISCOUNT').length}
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
          <form 
            role="search"
            onSubmit={(e) => e.preventDefault()}
            style={{ position: 'relative', width: '100%', margin: 0 }}
          >
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="search"
              name="manager-approvals-search-filter"
              id="manager-approvals-search-filter"
              autoComplete="search"
              data-lpignore="true"
              data-form-type="other"
              placeholder="Search by client, advisor, request type, or justification reason..."
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
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
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
            <option value="ALL">All Decision Statuses</option>
            <option value="PENDING">Pending Review</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>

          {/* Request Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
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
            <option value="ALL">All Workflow Types</option>
            {REQUEST_TYPES.map(t => (
              <option key={t.id} value={t.id}>{t.label}</option>
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
            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Loading approval workflows...</div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
            <CheckSquare size={40} color="#cbd5e1" style={{ margin: '0 auto 10px auto' }} />
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#475569' }}>No approval requests found</div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>All advisor discount waivers and policy exceptions will appear here.</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <tr>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>Workflow Type</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>Target Client</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>Proposed Change</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>Submitted By</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>Status</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => {
                  const statusBadge = getStatusBadge(item.status);
                  const typeMeta = getTypeMeta(item.requestType);

                  return (
                    <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s ease' }} onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}>
                      
                      {/* Type */}
                      <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: typeMeta.bg,
                          color: typeMeta.color,
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '0.74rem',
                          fontWeight: 800
                        }}>
                          {typeMeta.icon} {typeMeta.label}
                        </span>
                      </td>

                      {/* Client */}
                      <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                        {item.clientName !== 'N/A' ? (
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontWeight: 700, color: '#0f2b48' }}>{item.clientName}</span>
                              {onOpenClient360 && item.clientId && (
                                <button
                                  onClick={() => onOpenClient360({ id: item.clientId })}
                                  style={{ background: 'none', border: 'none', color: '#0284c7', cursor: 'pointer', padding: 0 }}
                                  title="Open Client 360"
                                >
                                  <ExternalLink size={12} />
                                </button>
                              )}
                            </div>
                            <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{item.clientPhone}</div>
                          </div>
                        ) : (
                          <span style={{ color: '#94a3b8' }}>General Request</span>
                        )}
                      </td>

                      {/* Proposed Change & Justification */}
                      <td style={{ padding: '12px 16px', maxWidth: '320px' }}>
                        {(item.currentValue || item.proposedValue) && (
                          <div style={{ fontSize: '0.78rem', marginBottom: '3px' }}>
                            <span style={{ color: '#dc2626', textDecoration: 'line-through' }}>{item.currentValue}</span>
                            {' → '}
                            <strong style={{ color: '#16a34a' }}>{item.proposedValue}</strong>
                          </div>
                        )}
                        <div style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.reason}
                        </div>
                      </td>

                      {/* Submitted By */}
                      <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: 600, color: '#0f2b48', fontSize: '0.82rem' }}>{item.requestedByName}</div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                          {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '-'}
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          background: statusBadge.bg,
                          color: statusBadge.text,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '0.72rem',
                          fontWeight: 700
                        }}>
                          {statusBadge.icon} {statusBadge.label}
                        </span>
                        {item.managerReviewNotes && (
                          <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            Note: {item.managerReviewNotes}
                          </div>
                        )}
                      </td>

                      {/* Action */}
                      <td style={{ padding: '12px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        {item.status === 'PENDING' && canReview ? (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <button
                              onClick={() => {
                                setActiveApproval(item);
                                setReviewNotes('');
                              }}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                background: '#16a34a',
                                color: '#ffffff',
                                border: 'none',
                                padding: '5px 10px',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              <ShieldCheck size={13} /> Review Decision
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>
                            {item.status === 'PENDING' ? 'Awaiting Manager' : 'Completed'}
                          </span>
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

      {/* SUBMIT REQUEST MODAL */}
      {showSubmitModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'none',
          zIndex: 13000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '560px',
            padding: '1.5rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f2b48', margin: 0 }}>Submit Exception Approval Request</h3>
                <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '2px 0 0 0' }}>Request Branch Manager sign-off for discounts, reassignments, or policy underwriting</p>
              </div>
              <button
                onClick={() => setShowSubmitModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitRequest} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Workflow Request Type *
                </label>
                <select
                  value={formData.requestType}
                  onChange={(e) => setFormData({ ...formData, requestType: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                >
                  {REQUEST_TYPES.map(t => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Target Client (Optional)
                </label>
                <select
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                >
                  <option value="">-- Optional: Link to Client --</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.fullName} ({c.phoneNumber})</option>
                  ))}
                </select>
              </div>

              {formData.requestType === 'SPECIAL_DISCOUNT' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                      Standard Quoted Premium (₹)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ₹16,756"
                      value={formData.currentValue}
                      onChange={(e) => setFormData({ ...formData, currentValue: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                      Discounted Premium (₹)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ₹14,500 (15% off)"
                      value={formData.proposedValue}
                      onChange={(e) => setFormData({ ...formData, proposedValue: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>
              )}

              {formData.requestType === 'LEAD_REASSIGNMENT' && (
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Target Insurance Advisor *
                  </label>
                  <select
                    value={formData.targetAdvisorId}
                    onChange={(e) => setFormData({ ...formData, targetAdvisorId: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  >
                    <option value="">-- Select Target Advisor --</option>
                    {advisors.map(a => (
                      <option key={a.id} value={a.id}>{a.fullName} ({a.designation || 'Advisor'})</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Justification / Business Case *
                </label>
                <textarea
                  required
                  rows="3"
                  placeholder="Provide full context for why this exception is justified (e.g. Corporate HNW group deal, medical leave, competitor price match)..."
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#f59e0b', color: '#091726', fontWeight: 800, cursor: 'pointer' }}
                >
                  {submitting ? 'Submitting...' : 'Submit for Manager Review'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* REVIEW DECISION MODAL */}
      {activeApproval && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'none',
          zIndex: 13000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '520px',
            padding: '1.5rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f2b48', margin: 0 }}>
                Manager Decision: {activeApproval.requestType.replace('_', ' ')}
              </h3>
              <button
                onClick={() => setActiveApproval(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', marginBottom: '1rem', border: '1px solid #e2e8f0', fontSize: '0.84rem' }}>
              <div style={{ marginBottom: '4px' }}>Submitted By: <strong>{activeApproval.requestedByName}</strong></div>
              {activeApproval.clientName !== 'N/A' && (
                <div style={{ marginBottom: '4px' }}>Client: <strong>{activeApproval.clientName}</strong> ({activeApproval.clientPhone})</div>
              )}
              <div style={{ color: '#475569', marginTop: '6px', lineHeight: 1.4 }}>
                <strong>Justification:</strong> {activeApproval.reason}
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                Manager Feedback / Decision Notes (Optional)
              </label>
              <textarea
                rows="3"
                placeholder="e.g. Approved. Corporate discount validated with regional director. Or: Rejected due to loss ratio cap."
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => handleReviewDecision('REJECTED')}
                disabled={reviewing}
                style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', fontWeight: 700, cursor: 'pointer' }}
              >
                Reject Request
              </button>
              <button
                onClick={() => handleReviewDecision('APPROVED')}
                disabled={reviewing}
                style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', background: '#16a34a', color: '#ffffff', fontWeight: 800, cursor: 'pointer' }}
              >
                Approve & Sign-Off
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
