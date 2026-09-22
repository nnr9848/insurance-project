import React, { useState } from 'react';
import { 
  PhoneCall, 
  Search, 
  Filter, 
  Plus, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  Building2, 
  User, 
  ArrowUpRight, 
  MessageSquare, 
  Sparkles,
  RefreshCw,
  X,
  Send,
  ExternalLink,
  ChevronRight,
  Check,
  AlertTriangle,
  Flame,
  Archive,
  Inbox
} from 'lucide-react';
import { portalService, crmService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import WhatsAppIcon from '../common/WhatsAppIcon';
import { normalizePhoneNumber, formatWhatsAppNumber } from '../../utils/crmDeduplication';

const CLAIM_STATUSES = [
  { key: 'SUBMITTED', label: 'Submitted (New)', color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe' },
  { key: 'DOCS_PENDING', label: 'Docs Pending', color: '#ea580c', bg: '#fff7ed', border: '#ffedd5' },
  { key: 'UNDER_REVIEW', label: 'Under TPA Review', color: '#8b5cf6', bg: '#f5f3ff', border: '#ddd6fe' },
  { key: 'APPROVED', label: 'Cashless Approved', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
  { key: 'SETTLED', label: 'Settled & Paid 🎉', color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' },
  { key: 'REJECTED', label: 'Repudiated / Closed', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
];

export default function ClaimsIntimationView({ 
  claims = [], 
  setClaims, 
  leads = [], 
  onOpenClient360 
}) {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('ACTIVE'); // 'ACTIVE' | 'DOCS_TPA' | 'SETTLED' | 'ALL'
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [updatingId, setUpdatingId] = useState(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New claim form state
  const [formData, setFormData] = useState({
    policyNumber: '',
    claimantName: '',
    contactPhone: '',
    claimType: 'HEALTH',
    hospitalOrGarage: '',
    incidentDate: new Date().toISOString().split('T')[0],
    description: ''
  });

  // Client matcher: matches claimant phone or policy with existing CRM client
  const findMatchingClient = (claim) => {
    if (!leads || leads.length === 0) return null;
    const claimPhoneNorm = normalizePhoneNumber(claim.contactPhone || '');
    
    return leads.find(l => {
      const leadPhoneNorm = normalizePhoneNumber(l.phone || '');
      const hasPhoneMatch = claimPhoneNorm && leadPhoneNorm && (claimPhoneNorm === leadPhoneNorm || leadPhoneNorm.includes(claimPhoneNorm) || claimPhoneNorm.includes(leadPhoneNorm));
      const hasPolicyMatch = claim.policyNumber && l.notes && l.notes.includes(claim.policyNumber);
      return hasPhoneMatch || hasPolicyMatch;
    });
  };

  const handleStatusChange = async (claimId, newStatus) => {
    setUpdatingId(claimId);
    try {
      const updated = await portalService.updateClaimStatus(claimId, newStatus);
      if (setClaims) {
        setClaims(prev => prev.map(c => c.id === claimId ? { ...c, status: updated.status || newStatus } : c));
      }
      showToast(`Claim status updated to ${newStatus}`, 'success');
    } catch (err) {
      console.error('Failed to update claim status', err);
      showToast('Failed to update claim status. Please try again.', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCreateClaim = async (e) => {
    e.preventDefault();
    if (!formData.policyNumber || !formData.claimantName || !formData.contactPhone) {
      showToast('Please fill in Policy Number, Claimant Name, and Phone.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const saved = await portalService.createAdminClaim(formData);
      if (setClaims) {
        setClaims(prev => [saved, ...prev]);
      }
      showToast('New claim intimation lodged successfully!', 'success');
      setShowNewModal(false);
      setFormData({
        policyNumber: '',
        claimantName: '',
        contactPhone: '',
        claimType: 'HEALTH',
        hospitalOrGarage: '',
        incidentDate: new Date().toISOString().split('T')[0],
        description: ''
      });
    } catch (err) {
      console.error('Failed to lodge claim', err);
      showToast('Failed to lodge claim. Please check details.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleWhatsAppUpdate = (claim) => {
    const rawPhone = normalizePhoneNumber(claim.contactPhone || '');
    if (!rawPhone) {
      showToast('No valid contact number for this claimant.', 'error');
      return;
    }
    const cleanPhone = rawPhone.startsWith('91') ? rawPhone : `91${rawPhone}`;
    const statusMeta = CLAIM_STATUSES.find(s => s.key === claim.status) || { label: claim.status };
    
    const message = `Namaste ${claim.claimantName || 'Sir/Madam'},\n\nThis is an official claim status update from *Aadhiraksha Insurance Assistance Desk* regarding your *${claim.claimType}* claim:\n\n📋 *Policy Number:* ${claim.policyNumber}\n🏥 *Hospital/Service Desk:* ${claim.hospitalOrGarage || 'Intimated'}\n🔄 *Current Status:* *${statusMeta.label.toUpperCase()}*\n\nOur dedicated claims manager is monitoring the settlement with the insurer TPA desk. For immediate emergency queries, you can reply directly to this message.\n\nWarm regards,\n*Aadhiraksha Insurance Claims Team*`;

    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Grouping Counts
  const activeClaimsList = claims.filter(c => c.status !== 'SETTLED' && c.status !== 'REJECTED');
  const docsTpaList = claims.filter(c => c.status === 'UNDER_REVIEW' || c.status === 'DOCS_PENDING');
  const settledList = claims.filter(c => c.status === 'SETTLED' || c.status === 'REJECTED');

  // Filtered claims based on tab + search + filters
  const filteredClaims = claims.filter(c => {
    // 1. Tab segment filter
    if (activeTab === 'ACTIVE' && (c.status === 'SETTLED' || c.status === 'REJECTED')) return false;
    if (activeTab === 'DOCS_TPA' && (c.status !== 'UNDER_REVIEW' && c.status !== 'DOCS_PENDING')) return false;
    if (activeTab === 'SETTLED' && (c.status !== 'SETTLED' && c.status !== 'REJECTED')) return false;

    // 2. Search query filter
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || 
      (c.claimantName && c.claimantName.toLowerCase().includes(q)) ||
      (c.policyNumber && c.policyNumber.toLowerCase().includes(q)) ||
      (c.contactPhone && c.contactPhone.toLowerCase().includes(q)) ||
      (c.hospitalOrGarage && c.hospitalOrGarage.toLowerCase().includes(q));

    // 3. Dropdown filters
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchesType = typeFilter === 'ALL' || (c.claimType && c.claimType.toUpperCase() === typeFilter);

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="crm-claims-desk" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* 1. TOP EXECUTIVE TELEMETRY BAR */}
      <div 
        style={{ 
          background: 'linear-gradient(135deg, #091726 0%, #1e293b 100%)', 
          borderRadius: '16px', 
          padding: '1.4rem 1.6rem', 
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: '0 4px 20px -4px rgba(9, 23, 38, 0.2)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
            <span style={{ 
              background: 'rgba(220, 38, 38, 0.2)', 
              color: '#f87171', 
              border: '1px solid rgba(248, 113, 113, 0.35)', 
              fontSize: '0.72rem', 
              fontWeight: 800, 
              padding: '0.15rem 0.6rem', 
              borderRadius: '20px', 
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}>
              <ShieldAlert size={12} /> Post-Sales Claims Desk
            </span>
            <span style={{ color: '#64748b', fontSize: '0.75rem' }}>•</span>
            <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600 }}>Emergency Cashless & TPA Assistance</span>
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
            Insurance Claims Intimation & Settlement Desk
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: '3px 0 0 0', fontWeight: 500 }}>
            Real-time hospitalization intimations, motor garage surveyor tracking, 1-tap WhatsApp updates, and full client portfolio syncing.
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          style={{
            background: 'linear-gradient(135deg, var(--accent-gold), var(--accent-gold-hover))',
            color: '#ffffff',
            border: 'none',
            padding: '0.65rem 1.15rem',
            borderRadius: '10px',
            fontWeight: 800,
            fontSize: '0.82rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            boxShadow: 'var(--shadow-gold)',
            transition: 'all 0.2s ease'
          }}
        >
          <Plus size={16} /> Lodge New Claim Intimation
        </button>
      </div>

      {/* 2. INDUSTRY STANDARD ACTIVE INBOX TABS */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.25rem' }}>
        <button
          onClick={() => { setActiveTab('ACTIVE'); setStatusFilter('ALL'); }}
          style={{
            padding: '0.6rem 1.1rem',
            borderRadius: '10px 10px 0 0',
            border: 'none',
            background: activeTab === 'ACTIVE' ? 'var(--primary-navy)' : 'transparent',
            color: activeTab === 'ACTIVE' ? '#ffffff' : 'var(--text-muted)',
            fontWeight: 800,
            fontSize: '0.82rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            transition: 'all 0.15s ease'
          }}
        >
          <Flame size={15} color={activeTab === 'ACTIVE' ? '#f59e0b' : 'currentColor'} />
          Active Work Queue
          <span style={{
            background: activeTab === 'ACTIVE' ? '#ef4444' : '#e2e8f0',
            color: activeTab === 'ACTIVE' ? '#ffffff' : '#475569',
            fontSize: '0.7rem',
            fontWeight: 800,
            padding: '0.1rem 0.45rem',
            borderRadius: '999px'
          }}>
            {activeClaimsList.length}
          </span>
        </button>

        <button
          onClick={() => { setActiveTab('DOCS_TPA'); setStatusFilter('ALL'); }}
          style={{
            padding: '0.6rem 1.1rem',
            borderRadius: '10px 10px 0 0',
            border: 'none',
            background: activeTab === 'DOCS_TPA' ? 'var(--primary-navy)' : 'transparent',
            color: activeTab === 'DOCS_TPA' ? '#ffffff' : 'var(--text-muted)',
            fontWeight: 800,
            fontSize: '0.82rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            transition: 'all 0.15s ease'
          }}
        >
          <Clock size={15} color={activeTab === 'DOCS_TPA' ? '#fb923c' : 'currentColor'} />
          Docs / TPA Review
          <span style={{
            background: activeTab === 'DOCS_TPA' ? '#ea580c' : '#e2e8f0',
            color: activeTab === 'DOCS_TPA' ? '#ffffff' : '#475569',
            fontSize: '0.7rem',
            fontWeight: 800,
            padding: '0.1rem 0.45rem',
            borderRadius: '999px'
          }}>
            {docsTpaList.length}
          </span>
        </button>

        <button
          onClick={() => { setActiveTab('SETTLED'); setStatusFilter('ALL'); }}
          style={{
            padding: '0.6rem 1.1rem',
            borderRadius: '10px 10px 0 0',
            border: 'none',
            background: activeTab === 'SETTLED' ? 'var(--primary-navy)' : 'transparent',
            color: activeTab === 'SETTLED' ? '#ffffff' : 'var(--text-muted)',
            fontWeight: 800,
            fontSize: '0.82rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            transition: 'all 0.15s ease'
          }}
        >
          <CheckCircle2 size={15} color={activeTab === 'SETTLED' ? '#4ade80' : 'currentColor'} />
          Settled & Closed Archive
          <span style={{
            background: activeTab === 'SETTLED' ? '#16a34a' : '#e2e8f0',
            color: activeTab === 'SETTLED' ? '#ffffff' : '#475569',
            fontSize: '0.7rem',
            fontWeight: 800,
            padding: '0.1rem 0.45rem',
            borderRadius: '999px'
          }}>
            {settledList.length}
          </span>
        </button>

        <button
          onClick={() => { setActiveTab('ALL'); setStatusFilter('ALL'); }}
          style={{
            padding: '0.6rem 1.1rem',
            borderRadius: '10px 10px 0 0',
            border: 'none',
            background: activeTab === 'ALL' ? 'var(--primary-navy)' : 'transparent',
            color: activeTab === 'ALL' ? '#ffffff' : 'var(--text-muted)',
            fontWeight: 800,
            fontSize: '0.82rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            transition: 'all 0.15s ease'
          }}
        >
          <Inbox size={15} />
          All Historical Claims
          <span style={{
            background: activeTab === 'ALL' ? '#0284c7' : '#e2e8f0',
            color: activeTab === 'ALL' ? '#ffffff' : '#475569',
            fontSize: '0.7rem',
            fontWeight: 800,
            padding: '0.1rem 0.45rem',
            borderRadius: '999px'
          }}>
            {claims.length}
          </span>
        </button>
      </div>

      {/* 3. FILTER & SEARCH CONTROLS */}
      <div 
        style={{ 
          background: 'var(--bg-card)', 
          borderRadius: '14px', 
          border: '1px solid var(--border-subtle)', 
          padding: '0.85rem 1.15rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.85rem'
        }}
      >
        <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: '420px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search claimant, policy #, phone, hospital..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.55rem 0.75rem 0.55rem 2.25rem',
              borderRadius: '9px',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-main)',
              color: 'var(--text-main)',
              fontSize: '0.82rem',
              outline: 'none'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            <Filter size={14} /> Filter:
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{
              padding: '0.5rem 0.75rem',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-main)',
              color: 'var(--text-main)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="ALL">All Claim Types</option>
            <option value="HEALTH">Health</option>
            <option value="MOTOR">Motor / Vehicle</option>
            <option value="LIFE">Life / Term</option>
            <option value="TRAVEL">Travel</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '0.5rem 0.75rem',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-main)',
              color: 'var(--text-main)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="ALL">All Sub-Statuses</option>
            {CLAIM_STATUSES.map(s => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 4. ACTIVE CLAIMS FEED */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {filteredClaims.length === 0 ? (
          <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-subtle)', padding: '3.5rem 1.5rem', textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#eff6ff', color: '#2563eb', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
              <ShieldAlert size={24} />
            </div>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary-navy)', margin: '0 0 0.3rem' }}>
              {activeTab === 'ACTIVE' ? 'All Claims Settled! No Active Pending Queue' : 'No Claims Found in this View'}
            </h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0 0 1.25rem', maxWidth: '420px', marginLeft: 'auto', marginRight: 'auto' }}>
              {searchQuery || statusFilter !== 'ALL' 
                ? 'No claims match your search filters in this tab.' 
                : (activeTab === 'ACTIVE' 
                  ? 'All submitted claims have been processed or settled. Great work!' 
                  : 'There are no claims filed in this category.')}
            </p>
            <button
              onClick={() => setShowNewModal(true)}
              style={{
                background: 'var(--primary-navy)',
                color: '#ffffff',
                border: 'none',
                padding: '0.55rem 1rem',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <Plus size={15} /> Lodge New Claim Intimation
            </button>
          </div>
        ) : (
          filteredClaims.map((claim) => {
            const matchingClient = findMatchingClient(claim);
            const statusObj = CLAIM_STATUSES.find(s => s.key === claim.status) || {
              label: claim.status,
              color: '#475569',
              bg: '#f1f5f9',
              border: '#cbd5e1'
            };

            return (
              <div
                key={claim.id}
                className="crm-agenda-feed-row"
                style={{
                  background: 'var(--bg-card)',
                  borderRadius: '14px',
                  border: '1px solid var(--border-subtle)',
                  padding: '1.15rem 1.25rem',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem'
                }}
              >
                {/* ROW 1: PRIMARY HEADER & CONTACT REACH */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                  
                  {/* Left: Intimation Info & Matching Client */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', flexWrap: 'wrap' }}>
                    
                    {/* Claim Type Badge */}
                    <div style={{
                      padding: '0.3rem 0.65rem',
                      borderRadius: '8px',
                      background: claim.claimType === 'HEALTH' ? '#e0f2fe' : (claim.claimType === 'MOTOR' ? '#fef3c7' : '#f1f5f9'),
                      color: claim.claimType === 'HEALTH' ? '#0284c7' : (claim.claimType === 'MOTOR' ? '#d97706' : '#475569'),
                      fontWeight: 800,
                      fontSize: '0.74rem',
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}>
                      {claim.claimType === 'HEALTH' ? <Building2 size={13} /> : <ShieldAlert size={13} />}
                      {claim.claimType || 'GENERAL'} CLAIM
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.96rem', color: 'var(--primary-navy)' }}>
                          {claim.claimantName}
                        </span>

                        <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                          • Policy: <strong style={{ color: 'var(--text-main)' }}>{claim.policyNumber}</strong>
                        </span>

                        {/* Existing Client 360 Linked Pill */}
                        {matchingClient ? (
                          <button
                            onClick={() => onOpenClient360 && onOpenClient360(matchingClient)}
                            style={{
                              background: '#ecfdf5',
                              color: '#059669',
                              border: '1px solid #a7f3d0',
                              padding: '0.15rem 0.55rem',
                              borderRadius: '20px',
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              transition: 'all 0.15s ease'
                            }}
                            title="Open Client 360 Portfolio"
                          >
                            <User size={11} /> Existing Client: {matchingClient.name} &rarr;
                          </button>
                        ) : (
                          <span style={{ background: '#f1f5f9', color: '#64748b', fontSize: '0.7rem', fontWeight: 600, padding: '0.15rem 0.5rem', borderRadius: '20px' }}>
                            External Claimant
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.25rem', fontSize: '0.76rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                        <span>Intimated on: <strong>{new Date(claim.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong></span>
                        <span>•</span>
                        <span>Hospital / Desk: <strong style={{ color: 'var(--text-main)' }}>{claim.hospitalOrGarage || 'Direct Claim Intimation'}</strong></span>
                        {claim.incidentDate && (
                          <>
                            <span>•</span>
                            <span>Incident Date: <strong>{claim.incidentDate}</strong></span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: 1-Tap Reach & Current Status Badge */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', flexWrap: 'wrap' }}>
                    
                    {/* 1-Tap Call */}
                    <a
                      href={`tel:${claim.contactPhone}`}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: '#eff6ff',
                        color: '#2563eb',
                        border: '1px solid #dbeafe',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textDecoration: 'none',
                        transition: 'all 0.15s ease'
                      }}
                      title={`Direct Call Claimant: ${claim.contactPhone}`}
                    >
                      <PhoneCall size={14} />
                    </a>

                    {/* 1-Tap WhatsApp Update Dispatch */}
                    <button
                      onClick={() => handleWhatsAppUpdate(claim)}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: '#f0fdf4',
                        color: '#16a34a',
                        border: '1px solid #bbf7d0',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                      title="Send Claim Status Update via WhatsApp"
                    >
                      <WhatsAppIcon size={16} />
                    </button>

                    {/* Status Dropdown */}
                    <select
                      value={claim.status}
                      disabled={updatingId === claim.id}
                      onChange={(e) => handleStatusChange(claim.id, e.target.value)}
                      style={{
                        padding: '0.35rem 0.75rem',
                        borderRadius: '20px',
                        border: `1.5px solid ${statusObj.border}`,
                        background: statusObj.bg,
                        color: statusObj.color,
                        fontSize: '0.74rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        outline: 'none',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {CLAIM_STATUSES.map(s => (
                        <option key={s.key} value={s.key}>{s.label}</option>
                      ))}
                    </select>

                    {updatingId === claim.id && (
                      <div style={{ width: '14px', height: '14px', border: '2px solid #3b82f6', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                    )}
                  </div>
                </div>

                {/* ROW 2: DESCRIPTION & BOTTOM ACTIONS */}
                <div style={{ 
                  background: 'var(--bg-main)', 
                  padding: '0.65rem 0.85rem', 
                  borderRadius: '9px', 
                  border: '1px solid var(--border-subtle)', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.6rem'
                }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-main)', flex: '1 1 300px' }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>Claim Details / Remarks: </span>
                    <span>{claim.description || 'No additional remarks provided. Standard TPA intimation docket.'}</span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {matchingClient && (
                      <button
                        onClick={() => onOpenClient360 && onOpenClient360(matchingClient)}
                        style={{
                          background: 'var(--primary-navy)',
                          color: '#ffffff',
                          border: 'none',
                          padding: '0.35rem 0.75rem',
                          borderRadius: '7px',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem'
                        }}
                      >
                        <User size={12} /> Client 360 &rarr;
                      </button>
                    )}

                    <button
                      onClick={() => handleWhatsAppUpdate(claim)}
                      style={{
                        background: '#16a34a',
                        color: '#ffffff',
                        border: 'none',
                        padding: '0.35rem 0.75rem',
                        borderRadius: '7px',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}
                    >
                      <Send size={12} /> WhatsApp Update
                    </button>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* 5. LODGE NEW CLAIM MODAL */}
      {showNewModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{
            background: 'var(--bg-card)',
            width: '100%',
            maxWidth: '520px',
            borderRadius: '16px',
            border: '1px solid var(--border-subtle)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            overflow: 'hidden',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '1.2rem 1.5rem',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'linear-gradient(135deg, var(--primary-navy) 0%, #1e3a5f 100%)',
              color: '#ffffff'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>Lodge New Claim Intimation</h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.76rem', color: '#94a3b8' }}>
                  Record emergency hospitalization or accidental damage claim
                </p>
              </div>
              <button
                onClick={() => setShowNewModal(false)}
                style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateClaim} style={{ padding: '1.4rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                    Policy Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. POL-102938"
                    value={formData.policyNumber}
                    onChange={(e) => setFormData({ ...formData, policyNumber: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-main)',
                      color: 'var(--text-main)',
                      fontSize: '0.82rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                    Claim Type *
                  </label>
                  <select
                    value={formData.claimType}
                    onChange={(e) => setFormData({ ...formData, claimType: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-main)',
                      color: 'var(--text-main)',
                      fontSize: '0.82rem',
                      outline: 'none'
                    }}
                  >
                    <option value="HEALTH">Health / Hospitalization</option>
                    <option value="MOTOR">Motor / Vehicle Damage</option>
                    <option value="LIFE">Life / Death Intimation</option>
                    <option value="TRAVEL">Travel Assistance</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                    Claimant / Patient Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Full name of insured claimant"
                    value={formData.claimantName}
                    onChange={(e) => setFormData({ ...formData, claimantName: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-main)',
                      color: 'var(--text-main)',
                      fontSize: '0.82rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                    Contact Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit mobile"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-main)',
                      color: 'var(--text-main)',
                      fontSize: '0.82rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                    Hospital / Network Garage Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Apollo Hospital, Jubilee Hills"
                    value={formData.hospitalOrGarage}
                    onChange={(e) => setFormData({ ...formData, hospitalOrGarage: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-main)',
                      color: 'var(--text-main)',
                      fontSize: '0.82rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                    Incident / Admission Date
                  </label>
                  <input
                    type="date"
                    value={formData.incidentDate}
                    onChange={(e) => setFormData({ ...formData, incidentDate: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-main)',
                      color: 'var(--text-main)',
                      fontSize: '0.82rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                  Medical Reason / Loss Description / TPA Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Details of hospitalization, diagnosis, accident notes..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-main)',
                    color: 'var(--text-main)',
                    fontSize: '0.82rem',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  style={{
                    padding: '0.55rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-main)',
                    color: 'var(--text-main)',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: '0.55rem 1.25rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'var(--primary-navy)',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  {submitting ? 'Submitting...' : 'Lodge Intimation'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
