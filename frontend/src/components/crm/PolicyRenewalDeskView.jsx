import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Clock, 
  AlertTriangle, 
  Phone, 
  PhoneCall,
  MessageSquare, 
  Mail, 
  CheckCircle2, 
  RefreshCw, 
  Calendar, 
  Search, 
  Filter, 
  ExternalLink, 
  Send, 
  ChevronRight, 
  Sparkles,
  TrendingUp,
  Award,
  Zap,
  Check,
  X
} from 'lucide-react';
import { crmService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function PolicyRenewalDeskView({ onOpenClient360, onOpenMeetingModal }) {
  const { isSuperAdmin, isManager } = useAuth();

  const [summary, setSummary] = useState(null);
  const [renewals, setRenewals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeBucket, setActiveBucket] = useState('ALL'); // ALL, 7_DAYS, 15_DAYS, 30_DAYS, 45_DAYS, EXPIRED
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVertical, setSelectedVertical] = useState('ALL');

  // Trigger Scan state
  const [scanning, setScanning] = useState(false);

  // Send WhatsApp / Reminder Modal
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [reminderChannel, setReminderChannel] = useState('WHATSAPP');
  const [customText, setCustomText] = useState('');
  const [sendingReminder, setSendingReminder] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    loadData();
  }, [activeBucket]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sumData, listData] = await Promise.all([
        crmService.getRenewalSummary().catch(() => null),
        crmService.getRenewalList(activeBucket).catch(() => [])
      ]);
      setSummary(sumData);
      setRenewals(listData || []);
    } catch (err) {
      console.error('Failed to load renewal desk data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleManualScan = async () => {
    setScanning(true);
    try {
      await crmService.triggerRenewalScan();
      alert('Automated Renewal Scan executed! Policy milestone callback tasks have been updated.');
      loadData();
    } catch (err) {
      alert('Failed to trigger scan: ' + (err.response?.data?.message || err.message));
    } finally {
      setScanning(false);
    }
  };

  const handleOpenReminderModal = (item, channel = 'WHATSAPP') => {
    setSelectedItem(item);
    setReminderChannel(channel);
    setCustomText(item.recommendedWhatsAppTemplate || '');
    setShowReminderModal(true);
  };

  const handleSendReminderSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;
    setSendingReminder(true);
    try {
      await crmService.sendRenewalReminder({
        clientId: selectedItem.clientId,
        channel: reminderChannel,
        customMessage: customText
      });

      if (reminderChannel === 'WHATSAPP') {
        const cleanPhone = (selectedItem.whatsappNumber || selectedItem.phoneNumber).replace(/[^0-9]/g, '');
        const encoded = encodeURIComponent(customText);
        window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, '_blank');
      }

      setShowReminderModal(false);
      alert(`Renewal reminder logged and dispatched via ${reminderChannel}!`);
      loadData();
    } catch (err) {
      alert('Failed to dispatch reminder: ' + (err.response?.data?.message || err.message));
    } finally {
      setSendingReminder(false);
    }
  };

  const copyTemplateText = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered dataset
  const filteredRenewals = renewals.filter(r => {
    const matchesSearch = 
      r.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.clientCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.phoneNumber.includes(searchTerm) ||
      (r.existingInsurer && r.existingInsurer.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesVertical = selectedVertical === 'ALL' || r.insuranceType === selectedVertical;
    return matchesSearch && matchesVertical;
  });

  const getUrgencyBadge = (bucket, daysLeft) => {
    if (daysLeft < 0) {
      return { label: `Expired (${Math.abs(daysLeft)}d ago)`, bg: '#fee2e2', color: '#b91c1c', border: '#fca5a5' };
    }
    if (daysLeft === 0) {
      return { label: 'Expires TODAY', bg: '#fef2f2', color: '#dc2626', border: '#f87171' };
    }
    if (daysLeft <= 7) {
      return { label: `${daysLeft} Days Left (Urgent)`, bg: '#fffbeb', color: '#b45309', border: '#fde68a' };
    }
    if (daysLeft <= 15) {
      return { label: `${daysLeft} Days Left`, bg: '#fef3c7', color: '#d97706', border: '#fcd34d' };
    }
    if (daysLeft <= 30) {
      return { label: `${daysLeft} Days Left`, bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' };
    }
    return { label: `${daysLeft} Days Left`, bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* 1. TOP STATS CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem' }}>
        
        {/* Card 1: 7-Day Urgent Expiries */}
        <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '14px', border: '1px solid #fed7aa', boxShadow: '0 2px 6px rgba(234, 88, 12, 0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#c2410c', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Urgent (≤ 7 Days)
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ea580c', marginTop: '0.2rem' }}>
                {summary?.dueIn7Days ?? 0}
              </div>
            </div>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#ffedd5', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={20} />
            </div>
          </div>
          <div style={{ fontSize: '0.74rem', color: '#78716c', marginTop: '0.5rem' }}>
            Requires immediate advisor call & WhatsApp link
          </div>
        </div>

        {/* Card 2: 30-Day Window */}
        <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '14px', border: '1px solid #bfdbfe', boxShadow: '0 2px 6px rgba(37, 99, 235, 0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Due in 30 Days
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#2563eb', marginTop: '0.2rem' }}>
                {summary?.dueIn30Days ?? 0}
              </div>
            </div>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={20} />
            </div>
          </div>
          <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '0.5rem' }}>
            Active renewal pipeline under advisor follow-up
          </div>
        </div>

        {/* Card 3: Expired / Lapsed */}
        <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '14px', border: '1px solid #fecaca', boxShadow: '0 2px 6px rgba(220, 38, 38, 0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#b91c1c', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Expired / Break-in Risk
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#dc2626', marginTop: '0.2rem' }}>
                {summary?.expiredLapsed ?? 0}
              </div>
            </div>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldAlert size={20} />
            </div>
          </div>
          <div style={{ fontSize: '0.74rem', color: '#7f1d1d', marginTop: '0.5rem' }}>
            NCB loss & medical re-checkup threshold
          </div>
        </div>

        {/* Card 4: Renewal Premium at Stake */}
        <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '14px', border: '1px solid #bbf7d0', boxShadow: '0 2px 6px rgba(22, 163, 74, 0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Renewal Premium Value
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#16a34a', marginTop: '0.2rem' }}>
                ₹{(summary?.totalRenewalPremiumAtRisk ? (summary.totalRenewalPremiumAtRisk / 100000).toFixed(2) : '0.00')} L
              </div>
            </div>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <div style={{ fontSize: '0.74rem', color: '#166534', marginTop: '0.5rem' }}>
            Portfolio retention rate: <strong>{summary?.renewalRetentionRate ?? 85}%</strong>
          </div>
        </div>

      </div>

      {/* 2. TOOLBAR & TIMELINE BUCKET TABS */}
      <div style={{
        background: '#ffffff',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        padding: '1rem 1.25rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        {/* Bucket Tabs */}
        <div style={{ display: 'flex', gap: '0.4rem', background: '#f8fafc', padding: '0.3rem', borderRadius: '10px', border: '1px solid #e2e8f0', overflowX: 'auto' }}>
          {[
            { id: 'ALL', label: 'All Renewals' },
            { id: '7_DAYS', label: '⚡ ≤ 7 Days' },
            { id: '15_DAYS', label: '15 Days' },
            { id: '30_DAYS', label: '30 Days' },
            { id: '45_DAYS', label: '45 Days' },
            { id: 'EXPIRED', label: '⚠️ Expired' }
          ].map(b => (
            <button
              key={b.id}
              onClick={() => setActiveBucket(b.id)}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                border: 'none',
                background: activeBucket === b.id ? '#0f2b48' : 'transparent',
                color: activeBucket === b.id ? '#ffffff' : '#64748b',
                fontWeight: activeBucket === b.id ? 700 : 600,
                fontSize: '0.78rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              {b.label}
            </button>
          ))}
        </div>

        {/* Controls: Search, Vertical, Manual Scan */}
        <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <form 
            role="search"
            onSubmit={(e) => e.preventDefault()}
            style={{ position: 'relative', margin: 0 }}
          >
            <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="search"
              name="renewals-search-filter"
              id="renewals-search-filter"
              autoComplete="search"
              data-lpignore="true"
              data-form-type="other"
              placeholder="Search by client, insurer, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '0.45rem 0.75rem 0.45rem 2rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.82rem',
                width: '210px'
              }}
            />
          </form>

          <select
            value={selectedVertical}
            onChange={(e) => setSelectedVertical(e.target.value)}
            style={{ padding: '0.45rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem', background: '#fff', color: '#334155' }}
          >
            <option value="ALL">All Categories</option>
            <option value="Health Insurance">Health</option>
            <option value="Vehicle / Motor Insurance">Motor</option>
            <option value="Term Life Insurance">Life</option>
            <option value="Group / SME Insurance">SME</option>
          </select>

          {isSuperAdmin && (
            <button
              onClick={handleManualScan}
              disabled={scanning}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'linear-gradient(135deg, #059669, #047857)',
                color: '#fff',
                border: 'none',
                padding: '0.45rem 0.9rem',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: scanning ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 4px rgba(5, 150, 105, 0.2)'
              }}
              title="Run Automated Milestone Engine Scan Now"
            >
              <RefreshCw size={13} className={scanning ? 'animate-spin' : ''} />
              {scanning ? 'Scanning...' : 'Run Auto Scan'}
            </button>
          )}
        </div>
      </div>

      {/* 3. POLICY RENEWAL MATRIX TABLE */}
      <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#091726', margin: 0 }}>
              Expiring Policy Portfolio ({filteredRenewals.length})
            </h3>
            <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
              Proactively engage clients to retain policy benefits, No Claim Bonus, and pre-existing illness continuity.
            </span>
          </div>
        </div>

        {/* DESKTOP TABLE VIEW (>= 768px) */}
        <div className="crm-desktop-table-container" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <tr>
                <th style={{ padding: '0.85rem 1rem', color: '#475569', fontWeight: 700 }}>Client & Account</th>
                <th style={{ padding: '0.85rem 1rem', color: '#475569', fontWeight: 700 }}>Insurance & Insurer</th>
                <th style={{ padding: '0.85rem 1rem', color: '#475569', fontWeight: 700 }}>Expiry Timeline</th>
                <th style={{ padding: '0.85rem 1rem', color: '#475569', fontWeight: 700 }}>Sum / Premium</th>
                <th style={{ padding: '0.85rem 1rem', color: '#475569', fontWeight: 700 }}>Advisor</th>
                <th style={{ padding: '0.85rem 1rem', color: '#475569', fontWeight: 700, textAlign: 'center' }}>1-Tap Renewal Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                      <RefreshCw size={16} className="animate-spin" /> Loading renewal portfolio...
                    </div>
                  </td>
                </tr>
              ) : filteredRenewals.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '3.5rem', textAlign: 'center', color: '#64748b' }}>
                    <ShieldCheck size={36} color="#16a34a" style={{ margin: '0 auto 0.5rem' }} />
                    <div style={{ fontWeight: 700, color: '#091726' }}>No policies due in this bucket</div>
                    <p style={{ fontSize: '0.78rem', margin: '0.25rem 0 0' }}>All client insurance accounts are up-to-date and protected.</p>
                  </td>
                </tr>
              ) : (
                filteredRenewals.map((r) => {
                  const urgency = getUrgencyBadge(r.urgencyBucket, r.daysUntilExpiry);
                  return (
                    <tr key={r.clientId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      
                      {/* 1. Client & Contact */}
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div 
                          onClick={() => onOpenClient360 && onOpenClient360({ id: r.clientId, fullName: r.fullName, phoneNumber: r.phoneNumber })}
                          style={{ fontWeight: 800, color: '#091726', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                        >
                          {r.fullName} <ExternalLink size={12} color="#f59e0b" />
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
                          <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#059669' }}>{r.clientCode}</span> • {r.phoneNumber}
                        </div>
                      </td>

                      {/* 2. Insurance Vertical & Existing Insurer */}
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ fontWeight: 700, color: '#1e293b' }}>{r.insuranceType}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                          Current: <strong>{r.existingInsurer}</strong>
                        </div>
                      </td>

                      {/* 3. Expiry Timeline & Urgency Badge */}
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '3px 8px',
                          borderRadius: '8px',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          background: urgency.bg,
                          color: urgency.color,
                          border: `1px solid ${urgency.border}`
                        }}>
                          {urgency.label}
                        </span>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px', fontWeight: 600 }}>
                          Date: {r.policyExpiryDate}
                        </div>
                      </td>

                      {/* 4. Sum Insured & Premium */}
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ fontWeight: 700, color: '#0f2b48' }}>{r.sumInsured || '₹10 Lakhs'}</div>
                        <div style={{ fontSize: '0.74rem', color: '#059669', fontWeight: 700, marginTop: '2px' }}>
                          {r.estimatedPremium ? `₹${r.estimatedPremium.toLocaleString('en-IN')}` : 'Market Premium'}
                        </div>
                      </td>

                      {/* 5. Assigned Advisor */}
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ fontWeight: 600, color: '#334155' }}>{r.assignedAdvisorName}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Branch: {r.city || 'Head Office'}</div>
                      </td>

                      {/* 6. Quick Renewal Actions */}
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: '0.4rem', alignItems: 'center' }}>
                          
                          {/* 1-Tap WhatsApp Renewal Dispatch */}
                          <button
                            onClick={() => handleOpenReminderModal(r, 'WHATSAPP')}
                            style={{
                              background: '#dcfce7',
                              color: '#15803d',
                              border: '1px solid #86efac',
                              padding: '5px 9px',
                              borderRadius: '7px',
                              fontWeight: 700,
                              fontSize: '0.74rem',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem'
                            }}
                            title="Open WhatsApp Renewal Prompt"
                          >
                            <MessageSquare size={13} /> WhatsApp
                          </button>

                          {/* Email Reminder */}
                          {r.email && (
                            <button
                              onClick={() => handleOpenReminderModal(r, 'EMAIL')}
                              style={{
                                background: '#eff6ff',
                                color: '#1d4ed8',
                                border: '1px solid #bfdbfe',
                                padding: '5px 8px',
                                borderRadius: '7px',
                                fontWeight: 700,
                                fontSize: '0.74rem',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem'
                              }}
                              title="Send Email Renewal Notice"
                            >
                              <Mail size={13} /> Email
                            </button>
                          )}

                          {/* Schedule Google Meet Consultation */}
                          <button
                            onClick={() => onOpenMeetingModal && onOpenMeetingModal({ id: r.clientId, fullName: r.fullName, phoneNumber: r.phoneNumber, insuranceType: r.insuranceType })}
                            style={{
                              background: '#f8fafc',
                              color: '#0f2b48',
                              border: '1px solid #cbd5e1',
                              padding: '5px 8px',
                              borderRadius: '7px',
                              fontWeight: 700,
                              fontSize: '0.74rem',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem'
                            }}
                            title="Schedule Renewal Review Meeting"
                          >
                            <Calendar size={13} /> Meet
                          </button>

                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARD DECK VIEW (< 768px) */}
        <div className="crm-mobile-cards-container">
          {loading ? (
            <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: '#64748b', background: '#fff', borderRadius: '12px' }}>
              <RefreshCw size={18} className="animate-spin" style={{ margin: '0 auto 0.5rem' }} />
              <div>Loading renewal portfolio...</div>
            </div>
          ) : filteredRenewals.length === 0 ? (
            <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: '#64748b', background: '#fff', borderRadius: '12px' }}>
              <ShieldCheck size={32} color="#16a34a" style={{ margin: '0 auto 0.5rem' }} />
              <div style={{ fontWeight: 700, color: '#091726' }}>No policies due in this bucket</div>
            </div>
          ) : (
            filteredRenewals.map((r) => {
              const urgency = getUrgencyBadge(r.urgencyBucket, r.daysUntilExpiry);
              return (
                <div 
                  key={r.clientId}
                  style={{
                    background: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.03)'
                  }}
                >
                  {/* Card Header: Client + Urgency Badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <div>
                      <div 
                        onClick={() => onOpenClient360 && onOpenClient360({ id: r.clientId, fullName: r.fullName, phoneNumber: r.phoneNumber })}
                        style={{ fontWeight: 800, fontSize: '0.98rem', color: '#0f2b48', display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}
                      >
                        {r.fullName} <ExternalLink size={12} color="#f59e0b" />
                      </div>
                      <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '2px' }}>
                        <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#059669' }}>{r.clientCode}</span> • {r.city || 'Hyderabad'}
                      </div>
                    </div>

                    <span style={{
                      display: 'inline-block',
                      padding: '3px 8px',
                      borderRadius: '8px',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      background: urgency.bg,
                      color: urgency.color,
                      border: `1px solid ${urgency.border}`,
                      whiteSpace: 'nowrap'
                    }}>
                      {urgency.label}
                    </span>
                  </div>

                  {/* Policy & Financial Details Grid */}
                  <div style={{
                    background: '#f8fafc',
                    padding: '0.65rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.5rem',
                    fontSize: '0.78rem'
                  }}>
                    <div>
                      <div style={{ color: '#64748b', fontSize: '0.7rem' }}>Insurance & Insurer</div>
                      <div style={{ fontWeight: 700, color: '#0f2b48' }}>{r.insuranceType}</div>
                      <div style={{ color: '#475569', fontSize: '0.72rem' }}>{r.existingInsurer}</div>
                    </div>

                    <div>
                      <div style={{ color: '#64748b', fontSize: '0.7rem' }}>Sum Insured & Premium</div>
                      <div style={{ fontWeight: 700, color: '#0f2b48' }}>{r.sumInsured || '₹10 Lakhs'}</div>
                      <div style={{ color: '#15803d', fontWeight: 700, fontSize: '0.72rem' }}>
                        {r.estimatedPremium ? `₹${r.estimatedPremium.toLocaleString('en-IN')}` : 'Market Prem'}
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.74rem', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Expiry: <strong>{r.policyExpiryDate}</strong></span>
                    <span>Advisor: <strong>{r.assignedAdvisorName}</strong></span>
                  </div>

                  {/* 1-Tap Action Buttons Row */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '0.5rem', marginTop: '0.25rem' }}>
                    <button
                      onClick={() => handleOpenReminderModal(r, 'WHATSAPP')}
                      style={{
                        background: '#dcfce7',
                        color: '#15803d',
                        border: '1px solid #86efac',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.35rem'
                      }}
                    >
                      <MessageSquare size={14} /> WhatsApp
                    </button>

                    <a
                      href={`tel:${r.phoneNumber}`}
                      style={{
                        background: '#0f2b48',
                        color: '#ffffff',
                        border: 'none',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '0.78rem',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.35rem'
                      }}
                    >
                      <PhoneCall size={14} /> Call
                    </a>

                    <button
                      onClick={() => onOpenMeetingModal && onOpenMeetingModal({ id: r.clientId, fullName: r.fullName, phoneNumber: r.phoneNumber, insuranceType: r.insuranceType })}
                      style={{
                        background: '#f1f5f9',
                        color: '#334155',
                        border: '1px solid #cbd5e1',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="Schedule Meeting"
                    >
                      <Calendar size={14} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 4. SEND RENEWAL REMINDER MODAL */}
      {showReminderModal && selectedItem && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 12000,
          padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '560px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '1.75rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MessageSquare size={22} color="#15803d" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#091726', margin: 0 }}>
                  Send Policy Renewal Reminder
                </h3>
              </div>
              <button onClick={() => setShowReminderModal(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSendReminderSubmit}>
              <div style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f2b48' }}>
                  {selectedItem.fullName} ({selectedItem.phoneNumber})
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                  {selectedItem.insuranceType} • Expiring: <strong>{selectedItem.policyExpiryDate}</strong> ({selectedItem.daysUntilExpiry >= 0 ? `${selectedItem.daysUntilExpiry} days remaining` : 'Expired'})
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Dispatch Channel</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setReminderChannel('WHATSAPP')}
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      borderRadius: '8px',
                      border: reminderChannel === 'WHATSAPP' ? '2px solid #16a34a' : '1px solid #cbd5e1',
                      background: reminderChannel === 'WHATSAPP' ? '#f0fdf4' : '#fff',
                      color: reminderChannel === 'WHATSAPP' ? '#15803d' : '#475569',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    💬 WhatsApp Direct
                  </button>
                  <button
                    type="button"
                    onClick={() => setReminderChannel('EMAIL')}
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      borderRadius: '8px',
                      border: reminderChannel === 'EMAIL' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                      background: reminderChannel === 'EMAIL' ? '#eff6ff' : '#fff',
                      color: reminderChannel === 'EMAIL' ? '#1d4ed8' : '#475569',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    ✉️ Official Email Notice
                  </button>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <label className="form-label" style={{ margin: 0 }}>Message Content</label>
                  <button
                    type="button"
                    onClick={() => copyTemplateText(customText, selectedItem.clientId)}
                    style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    {copiedId === selectedItem.clientId ? '✓ Copied' : 'Copy Text'}
                  </button>
                </div>
                <textarea
                  rows={6}
                  required
                  className="form-input"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  style={{ fontFamily: 'inherit', fontSize: '0.82rem', lineHeight: 1.5 }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setShowReminderModal(false)}
                  style={{ padding: '0.6rem 1.25rem', background: '#f1f5f9', border: 'none', borderRadius: '8px', fontWeight: 600, color: '#64748b', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingReminder}
                  style={{
                    padding: '0.6rem 1.35rem',
                    background: 'linear-gradient(135deg, #15803d, #166534)',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 700,
                    color: '#fff',
                    cursor: sendingReminder ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    boxShadow: '0 2px 4px rgba(22, 101, 52, 0.2)'
                  }}
                >
                  <Send size={14} /> {sendingReminder ? 'Sending...' : 'Dispatch Reminder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
