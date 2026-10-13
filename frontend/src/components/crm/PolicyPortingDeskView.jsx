import React, { useState } from 'react';
import { 
  ArrowRightLeft, 
  ShieldCheck, 
  Clock, 
  AlertTriangle, 
  Phone, 
  MessageSquare, 
  Mail, 
  CheckCircle2, 
  Search, 
  Filter, 
  ExternalLink, 
  Calendar,
  Sparkles,
  ArrowRight,
  User,
  Building2,
  FileText,
  Percent,
  Check,
  X,
  ChevronRight
} from 'lucide-react';
import { formatWhatsAppNumber } from '../../utils/crmDeduplication';
import WhatsAppIcon from '../common/WhatsAppIcon';
import InsurerLogoBadge from '../common/InsurerLogoBadge';
import { CrmTablePaginationBar, CrmTopMiniPager } from './common/CrmTablePaginationBar';
import { useToast } from '../../context/ToastContext';
import { portalService } from '../../services/api';

export default function PolicyPortingDeskView({ 
  quotes = [], 
  onOpenClient360,
  onRefreshQuotes
}) {
  const toast = useToast();

  const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL' | 'URGENT' | 'SAFE' | 'NEW' | 'PROCESSED'
  const [searchTerm, setSearchTerm] = useState('');
  const [insurerFilter, setInsurerFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [updatingQuoteId, setUpdatingQuoteId] = useState(null);

  // Helper to extract porting plan details safely
  const parsePortingDetails = (q) => {
    let details = {};
    if (q.planDetails) {
      try {
        details = typeof q.planDetails === 'string' ? JSON.parse(q.planDetails) : q.planDetails;
      } catch (e) {
        details = {};
      }
    }
    return {
      currentInsurer: details.currentInsurer || q.city || 'Not Specified',
      policyNumber: details.policyNumber || 'Not Provided',
      expiryDate: details.expiryDate || '',
      policyType: details.policyType || 'Health Insurance',
      existingSumInsured: details.existingSumInsured || '₹5,00,000',
      waitingPeriodServedYears: details.waitingPeriodServedYears || '1+ Year',
      claimsMadeInPastYear: details.claimsMadeInPastYear || 'No'
    };
  };

  // Filter only porting requests
  const portingRequests = quotes.filter(q => {
    const slug = (q.categorySlug || '').toLowerCase();
    return slug.includes('port');
  });

  // Calculate days remaining to policy expiry
  const getDaysToExpiry = (expiryDateStr) => {
    if (!expiryDateStr) return null;
    const expiry = new Date(expiryDateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = expiry - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Compute SLA Urgency Buckets
  const urgentCount = portingRequests.filter(q => {
    const { expiryDate } = parsePortingDetails(q);
    const days = getDaysToExpiry(expiryDate);
    return days !== null && days <= 45;
  }).length;

  const safeCount = portingRequests.filter(q => {
    const { expiryDate } = parsePortingDetails(q);
    const days = getDaysToExpiry(expiryDate);
    return days !== null && days > 45;
  }).length;

  const newCount = portingRequests.filter(q => (q.status || 'NEW') === 'NEW').length;

  // Filter list
  const filteredList = portingRequests.filter(q => {
    const details = parsePortingDetails(q);
    const days = getDaysToExpiry(details.expiryDate);

    // Search query
    const matchSearch = !searchTerm || 
      (q.fullName && q.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (q.phoneNumber && q.phoneNumber.includes(searchTerm)) ||
      (details.currentInsurer && details.currentInsurer.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (details.policyNumber && details.policyNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    // Insurer filter
    const matchInsurer = insurerFilter === 'ALL' || details.currentInsurer.toLowerCase() === insurerFilter.toLowerCase();

    // Bucket filter
    let matchBucket = true;
    if (activeFilter === 'URGENT') {
      matchBucket = days !== null && days <= 45;
    } else if (activeFilter === 'SAFE') {
      matchBucket = days !== null && days > 45;
    } else if (activeFilter === 'NEW') {
      matchBucket = (q.status || 'NEW') === 'NEW';
    } else if (activeFilter === 'PROCESSED') {
      matchBucket = q.status === 'CONTACTED' || q.status === 'QUALIFIED' || q.status === 'CONVERTED';
    }

    return matchSearch && matchInsurer && matchBucket;
  });

  // Unique insurers list for filter dropdown
  const uniqueInsurers = Array.from(new Set(
    portingRequests.map(q => parsePortingDetails(q).currentInsurer).filter(ins => ins && ins !== 'Not Specified')
  ));

  // Pagination
  const totalPages = Math.ceil(filteredList.length / pageSize) || 1;
  const paginatedList = filteredList.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Status update handler
  const handleUpdateStatus = async (quoteId, newStatus) => {
    setUpdatingQuoteId(quoteId);
    try {
      await portalService.updateQuoteStatus(quoteId, newStatus);
      toast.success(`Porting dossier updated to ${newStatus}`);
      if (onRefreshQuotes) await onRefreshQuotes();
    } catch (err) {
      toast.error('Failed to update porting status: ' + (err.message || 'Error'));
    } finally {
      setUpdatingQuoteId(null);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: 'calc(100vh - 120px)',
      maxHeight: 'calc(100vh - 120px)',
      gap: '0.75rem', 
      overflow: 'hidden' 
    }}>
      
      {/* 1. TOP STATS CARDS (COMPACT ROW matching Policy Renewal Desk & User Management) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.65rem', flexShrink: 0 }}>
        
        {/* Card 1: All Porting Dossiers */}
        <div 
          onClick={() => setActiveFilter('ALL')}
          style={{
            background: activeFilter === 'ALL' ? '#f5f3ff' : '#ffffff',
            border: `1.5px solid ${activeFilter === 'ALL' ? '#7c3aed' : '#e2e8f0'}`,
            borderRadius: '12px',
            padding: '0.75rem 1rem',
            cursor: 'pointer',
            transition: 'all 0.15s',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6d28d9', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              All Dossiers
            </span>
            <ArrowRightLeft size={16} color="#7c3aed" />
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f2b48', marginTop: '0.1rem' }}>
            {portingRequests.length}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
            Total switch inquiries
          </div>
        </div>

        {/* Card 2: Critical < 45 Days */}
        <div 
          onClick={() => setActiveFilter('URGENT')}
          style={{
            background: activeFilter === 'URGENT' ? '#fff1f2' : '#ffffff',
            border: `1.5px solid ${activeFilter === 'URGENT' ? '#e11d48' : '#fed7aa'}`,
            borderRadius: '12px',
            padding: '0.75rem 1rem',
            cursor: 'pointer',
            transition: 'all 0.15s',
            boxShadow: '0 1px 3px rgba(225, 29, 72, 0.05)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#e11d48', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              ⚠️ &lt; 45 Days (Critical)
            </span>
            <AlertTriangle size={16} color="#e11d48" />
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#e11d48', marginTop: '0.1rem' }}>
            {urgentCount}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#9f1239' }}>
            Immediate submission needed
          </div>
        </div>

        {/* Card 3: Safe Window > 45 Days */}
        <div 
          onClick={() => setActiveFilter('SAFE')}
          style={{
            background: activeFilter === 'SAFE' ? '#f0fdf4' : '#ffffff',
            border: `1.5px solid ${activeFilter === 'SAFE' ? '#16a34a' : '#bbf7d0'}`,
            borderRadius: '12px',
            padding: '0.75rem 1rem',
            cursor: 'pointer',
            transition: 'all 0.15s',
            boxShadow: '0 1px 3px rgba(22, 163, 74, 0.05)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Safe Window (&gt; 45D)
            </span>
            <ShieldCheck size={16} color="#16a34a" />
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#16a34a', marginTop: '0.1rem' }}>
            {safeCount}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#166534' }}>
            100% continuity guaranteed
          </div>
        </div>

        {/* Card 4: New / Uncontacted */}
        <div 
          onClick={() => setActiveFilter('NEW')}
          style={{
            background: activeFilter === 'NEW' ? '#fffbeb' : '#ffffff',
            border: `1.5px solid ${activeFilter === 'NEW' ? '#d97706' : '#fde68a'}`,
            borderRadius: '12px',
            padding: '0.75rem 1rem',
            cursor: 'pointer',
            transition: 'all 0.15s',
            boxShadow: '0 1px 3px rgba(217, 119, 6, 0.05)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Uncontacted Leads
            </span>
            <Sparkles size={16} color="#d97706" />
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#d97706', marginTop: '0.1rem' }}>
            {newCount}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#92400e' }}>
            Awaiting prompt callback
          </div>
        </div>

      </div>

      {/* 2. TOOLBAR (Search, Insurer Filter & Mini Pager) */}
      <div style={{
        background: '#ffffff',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        padding: '0.85rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '260px' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '360px' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
              type="text"
              placeholder="Search by client name, mobile, policy no., or insurer..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                width: '100%',
                padding: '8px 12px 8px 32px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.84rem'
              }}
            />
          </div>

          <select
            value={insurerFilter}
            onChange={(e) => {
              setInsurerFilter(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.84rem',
              fontWeight: 600,
              color: '#0f2b48',
              background: '#ffffff'
            }}
          >
            <option value="ALL">All Current Insurers ({portingRequests.length})</option>
            {uniqueInsurers.map(ins => (
              <option key={ins} value={ins}>{ins}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CrmTopMiniPager
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredList.length}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* 3. DATA TABLE / PORTING DOSSIERS LIST (Screen-locked scrollable) */}
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0
      }}>
        {filteredList.length === 0 ? (
          <div style={{ padding: '3.5rem 1rem', textAlign: 'center', color: '#64748b' }}>
            <ArrowRightLeft size={36} color="#cbd5e1" style={{ margin: '0 auto 0.75rem' }} />
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f2b48', margin: '0 0 4px' }}>
              No Policy Porting Requests Found
            </h4>
            <p style={{ fontSize: '0.82rem', margin: 0 }}>
              {searchTerm || insurerFilter !== 'ALL' || activeFilter !== 'ALL'
                ? 'Try resetting your search query or status filter above.'
                : 'When prospective policyholders apply on /port-policy, they will appear here with regulatory SLA countdowns.'}
            </p>
          </div>
        ) : (
          <div className="crm-table-scroll-container" style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
            <table className="crm-table">
              <thead className="crm-table-head" style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                <tr>
                  <th className="crm-table-th" style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>Prospect / Contact</th>
                  <th className="crm-table-th" style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>Current Insurer & Policy</th>
                  <th className="crm-table-th" style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>Continuity Served</th>
                  <th className="crm-table-th" style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>Expiry & IRDAI SLA</th>
                  <th className="crm-table-th" style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>Dossier Status</th>
                  <th className="crm-table-th" style={{ padding: '0.85rem 1rem', fontWeight: 700, textAlign: 'right' }}>Direct Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedList.map(q => {
                  const details = parsePortingDetails(q);
                  const days = getDaysToExpiry(details.expiryDate);
                  const isUrgent = days !== null && days <= 45;
                  const cleanPhone = q.phoneNumber ? formatWhatsAppNumber(q.phoneNumber) : '';

                  const waMessage = `Hello ${q.fullName || 'Sir/Madam'}, greetings from Aadhiraksha Insurance Portability Desk. Regarding your request to port your ${details.currentInsurer} (${details.policyType}) policy with 100% waiting period continuity retention, our senior consultant is ready to review your current policy schedule. How may we proceed?`;

                  return (
                    <tr 
                      key={q.id}
                      style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      {/* Prospect / Contact */}
                      <td style={{ padding: '0.85rem 1rem', verticalAlign: 'top' }}>
                        <div style={{ fontWeight: 800, color: '#0f2b48', fontSize: '0.88rem' }}>
                          {q.fullName || 'Prospect'}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                          <Phone size={12} />
                          <span>{q.phoneNumber || 'No phone'}</span>
                        </div>
                        {q.email && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: '#94a3b8', marginTop: '2px' }}>
                            <Mail size={12} />
                            <span>{q.email}</span>
                          </div>
                        )}
                      </td>

                      {/* Current Insurer & Policy */}
                      <td style={{ padding: '0.85rem 1rem', verticalAlign: 'top' }}>
                        <div>
                          <InsurerLogoBadge name={details.currentInsurer} size="xs" />
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '4px' }}>
                          {details.policyType}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px', fontFamily: 'monospace' }}>
                          Pol #: {details.policyNumber}
                        </div>
                      </td>

                      {/* Continuity Details */}
                      <td style={{ padding: '0.85rem 1rem', verticalAlign: 'top' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#f5f3ff', border: '1px solid #ddd6fe', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, color: '#6d28d9' }}>
                          <ShieldCheck size={12} />
                          <span>{details.waitingPeriodServedYears} Active</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                          Sum Insured: <strong style={{ color: '#0f2b48' }}>{details.existingSumInsured}</strong>
                        </div>
                      </td>

                      {/* Expiry Date & SLA Countdown */}
                      <td style={{ padding: '0.85rem 1rem', verticalAlign: 'top' }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f2b48' }}>
                          {details.expiryDate ? new Date(details.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Not provided'}
                        </div>
                        
                        {days !== null ? (
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            marginTop: '4px',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            background: isUrgent ? '#ffe4e6' : '#ecfdf5',
                            color: isUrgent ? '#e11d48' : '#059669',
                            border: `1px solid ${isUrgent ? '#fecdd3' : '#a7f3d0'}`
                          }}>
                            {isUrgent ? <AlertTriangle size={11} /> : <Clock size={11} />}
                            <span>{days > 0 ? `${days} Days Left (45D SLA)` : 'Expired / Grace Window'}</span>
                          </div>
                        ) : (
                          <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
                            No expiry date recorded
                          </div>
                        )}
                      </td>

                      {/* Dossier Status */}
                      <td style={{ padding: '0.85rem 1rem', verticalAlign: 'top' }}>
                        <select
                          value={q.status || 'NEW'}
                          disabled={updatingQuoteId === q.id}
                          onChange={(e) => handleUpdateStatus(q.id, e.target.value)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            border: '1px solid #cbd5e1',
                            background: (q.status === 'NEW' || !q.status) ? '#fffbeb' : (q.status === 'QUALIFIED' || q.status === 'CONVERTED') ? '#ecfdf5' : '#f8fafc',
                            color: (q.status === 'NEW' || !q.status) ? '#d97706' : (q.status === 'QUALIFIED' || q.status === 'CONVERTED') ? '#059669' : '#334155'
                          }}
                        >
                          <option value="NEW">⚡ New Application</option>
                          <option value="CONTACTED">📞 In Touch (Collecting Docs)</option>
                          <option value="QUALIFIED">📋 Submitted to Insurer</option>
                          <option value="CONVERTED">✅ Ported Successfully</option>
                          <option value="ARCHIVED">❌ Abandoned / Rejected</option>
                        </select>
                      </td>

                      {/* Quick Communication Actions */}
                      <td style={{ padding: '0.85rem 1rem', verticalAlign: 'top', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                          {cleanPhone && (
                            <a
                              href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(waMessage)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Chat on WhatsApp"
                              style={{
                                width: '30px',
                                height: '30px',
                                borderRadius: '8px',
                                background: '#ecfdf5',
                                border: '1px solid #a7f3d0',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#059669',
                                textDecoration: 'none'
                              }}
                            >
                              <WhatsAppIcon size={14} color="#059669" />
                            </a>
                          )}

                          {q.phoneNumber && (
                            <a
                              href={`tel:${q.phoneNumber}`}
                              title="Call Client"
                              style={{
                                width: '30px',
                                height: '30px',
                                borderRadius: '8px',
                                background: '#eff6ff',
                                border: '1px solid #bfdbfe',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#2563eb',
                                textDecoration: 'none'
                              }}
                            >
                              <Phone size={13} />
                            </a>
                          )}

                          {onOpenClient360 && (
                            <button
                              type="button"
                              onClick={() => onOpenClient360({
                                fullName: q.fullName,
                                phone: q.phoneNumber,
                                email: q.email,
                                city: details.currentInsurer,
                                policyType: details.policyType
                              })}
                              title="Open Client 360 Profile"
                              style={{
                                padding: '5px 10px',
                                borderRadius: '8px',
                                background: '#f8fafc',
                                border: '1px solid #cbd5e1',
                                fontSize: '0.74rem',
                                fontWeight: 700,
                                color: '#0f2b48',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <span>360°</span>
                              <ChevronRight size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 5. Pagination Bar */}
        {filteredList.length > 0 && (
          <CrmTablePaginationBar
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={filteredList.length}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
            itemName="porting requests"
          />
        )}
      </div>

    </div>
  );
}
