import React, { useState, useEffect, useRef } from 'react';
import {
  Trophy,
  Plane,
  Percent,
  Calendar,
  Upload,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  Download,
  Trash2,
  Edit3,
  X,
  AlertCircle,
  FileText,
  FileCheck,
  Send,
  Building2,
  Shield,
  Eye,
  Camera
} from 'lucide-react';
import { salesContestService, portalService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import WhatsAppIcon from '../common/WhatsAppIcon';

export default function SalesContestsManagerView({ isAgentView = false }) {
  const { isSuperAdmin, isManager } = useAuth();
  const canManage = !isAgentView && (isSuperAdmin || isManager);
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('CREATE'); // 'CREATE' | 'EDIT'
  const [saving, setSaving] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // File Upload States
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const bannerFileRef = useRef(null);
  const docFileRef = useRef(null);

  // Broadcast Offer State
  const [broadcastingId, setBroadcastingId] = useState(null);
  const [broadcastSuccess, setBroadcastSuccess] = useState('');

  // Form State
  const [form, setForm] = useState({
    title: '',
    description: '',
    contestType: 'TRIP',
    sponsorInsurer: 'Aadhiraksha',
    startDate: '',
    endDate: '',
    targetMetricType: 'GWP_AMOUNT',
    targetValue: '',
    rewardDescription: '',
    bannerImageUrl: '',
    brochureDocUrl: '',
    isActive: true
  });

  const loadContests = async () => {
    setLoading(true);
    try {
      const data = isAgentView 
        ? await salesContestService.getActiveContests() 
        : await salesContestService.getAllContests();
      setContests(Array.isArray(data) ? data : []);
    } catch (err) {
      setErrorMsg('Failed to load sales contests: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContests();
  }, []);

  const openCreateModal = () => {
    const today = new Date().toISOString().split('T')[0];
    const nextMonth = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
    setModalMode('CREATE');
    setCurrentId(null);
    setForm({
      title: '',
      description: '',
      contestType: 'TRIP',
      sponsorInsurer: 'Aadhiraksha',
      startDate: today,
      endDate: nextMonth,
      targetMetricType: 'GWP_AMOUNT',
      targetValue: '500000',
      rewardDescription: '',
      bannerImageUrl: '',
      brochureDocUrl: '',
      isActive: true
    });
    setErrorMsg('');
    setShowModal(true);
  };

  const openEditModal = (contest) => {
    setModalMode('EDIT');
    setCurrentId(contest.id);
    setForm({
      title: contest.title || '',
      description: contest.description || '',
      contestType: contest.contestType || 'TRIP',
      sponsorInsurer: contest.sponsorInsurer || 'Aadhiraksha',
      startDate: contest.startDate ? contest.startDate.split('T')[0] : '',
      endDate: contest.endDate ? contest.endDate.split('T')[0] : '',
      targetMetricType: contest.targetMetricType || 'GWP_AMOUNT',
      targetValue: contest.targetValue ? String(contest.targetValue) : '',
      rewardDescription: contest.rewardDescription || '',
      bannerImageUrl: contest.bannerImageUrl || '',
      brochureDocUrl: contest.brochureDocUrl || '',
      isActive: contest.isActive !== false
    });
    setErrorMsg('');
    setShowModal(true);
  };

  const handleBannerUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBanner(true);
    try {
      const res = await salesContestService.uploadAsset(file);
      setForm(prev => ({ ...prev, bannerImageUrl: res.url }));
    } catch (err) {
      alert('Failed to upload image banner: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleDocUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingDoc(true);
    try {
      const res = await salesContestService.uploadAsset(file);
      setForm(prev => ({ ...prev, brochureDocUrl: res.url }));
    } catch (err) {
      alert('Failed to upload brochure document: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    try {
      const payload = {
        title: form.title,
        description: form.description,
        contestType: form.contestType,
        sponsorInsurer: form.sponsorInsurer,
        startDate: form.startDate,
        endDate: form.endDate,
        targetMetricType: form.targetMetricType,
        targetValue: form.targetValue ? parseFloat(form.targetValue) : 0,
        rewardDescription: form.rewardDescription,
        bannerImageUrl: form.bannerImageUrl,
        brochureDocUrl: form.brochureDocUrl,
        isActive: form.isActive
      };

      if (modalMode === 'CREATE') {
        await salesContestService.createContest(payload);
      } else {
        await salesContestService.updateContest(currentId, payload);
      }
      setShowModal(false);
      loadContests();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to save contest');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to remove the contest "${title}"?`)) return;
    try {
      await salesContestService.deleteContest(id);
      loadContests();
    } catch (err) {
      alert('Failed to delete contest: ' + (err.response?.data?.message || err.message));
    }
  };

  // WhatsApp Broadcast Trigger directly from a contest card
  const handleQuickWhatsAppBroadcast = async (contest) => {
    if (!window.confirm(`Broadcast contest "${contest.title}" to all POSP agent network via Twilio WhatsApp?`)) return;
    setBroadcastingId(contest.id);
    setBroadcastSuccess('');
    try {
      const allPosps = await portalService.getPOSPProfiles();
      const recipients = (allPosps || []).map(p => p.phoneNumber || p.user?.phoneNumber).filter(Boolean);
      const cleanRecipients = Array.from(new Set(recipients));

      if (cleanRecipients.length === 0) {
        alert('No registered POSP agent phone numbers found to broadcast.');
        return;
      }

      const res = await portalService.broadcastWhatsAppOffers({
        title: `🏆 New Contest Alert: ${contest.title}`,
        message: `${contest.description}\n\n🎯 Target: ${contest.targetMetricType === 'GWP_AMOUNT' ? '₹' + Number(contest.targetValue).toLocaleString() + ' GWP' : contest.targetValue + ' Policies'}\n🎁 Reward: ${contest.rewardDescription}\n📅 Valid: ${contest.startDate} to ${contest.endDate}\nSponsor: ${contest.sponsorInsurer}\n\nLogin to POSP Partner Portal for full terms & brochure.`,
        recipients: cleanRecipients
      });
      setBroadcastSuccess(`Broadcast sent successfully to ${res.sentCount} agents!`);
      setTimeout(() => setBroadcastSuccess(''), 5000);
    } catch (err) {
      alert('Failed to broadcast contest: ' + (err.response?.data?.message || err.message));
    } finally {
      setBroadcastingId(null);
    }
  };

  // Filter & Search
  const filteredContests = contests.filter(c => {
    if (filterType !== 'ALL' && c.contestType !== filterType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (c.title || '').toLowerCase().includes(q);
      const matchSponsor = (c.sponsorInsurer || '').toLowerCase().includes(q);
      const matchReward = (c.rewardDescription || '').toLowerCase().includes(q);
      if (!matchTitle && !matchSponsor && !matchReward) return false;
    }
    return true;
  });

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Hidden file inputs */}
      <input type="file" ref={bannerFileRef} onChange={handleBannerUpload} style={{ display: 'none' }} accept="image/*" />
      <input type="file" ref={docFileRef} onChange={handleDocUpload} style={{ display: 'none' }} accept=".pdf,.doc,.docx" />

      {/* Header Row */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.5rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid #e2e8f0'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #0f2b48, #1e3a8a)',
              color: '#f59e0b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Trophy size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f2b48', margin: 0 }}>
                Sales Contests, Trips & Campaigns Hub
              </h2>
              <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '2px 0 0' }}>
                Drive advisor production through monthly trips, commission boosters, and marketing collateral locker
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {(isSuperAdmin || isManager) && (
            <button
              onClick={openCreateModal}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#059669',
                color: '#ffffff',
                border: 'none',
                padding: '9px 18px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(5, 150, 105, 0.25)'
              }}
            >
              <Plus size={16} /> Create New Contest / Sprint
            </button>
          )}
        </div>
      </div>

      {broadcastSuccess && (
        <div style={{
          marginBottom: '1rem',
          padding: '10px 14px',
          background: '#ecfdf5',
          border: '1px solid #a7f3d0',
          borderRadius: '8px',
          color: '#065f46',
          fontSize: '0.85rem',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle2 size={16} color="#059669" /> {broadcastSuccess}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        background: '#ffffff',
        padding: '0.85rem 1.25rem',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        marginBottom: '1.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
      }}>
        {/* Category Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'ALL', label: 'All Sprints', icon: Trophy },
            { id: 'TRIP', label: 'Trip Incentives', icon: Plane },
            { id: 'COMMISSION_BONUS', label: 'Commission Boosters', icon: Percent },
            { id: 'COLLATERAL_FLYER', label: 'Marketing Kit', icon: FileText }
          ].map(tab => {
            const Icon = tab.icon;
            const active = filterType === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  border: active ? '1px solid #0f2b48' : '1px solid #e2e8f0',
                  background: active ? '#0f2b48' : '#ffffff',
                  color: active ? '#ffffff' : '#475569',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <Icon size={14} color={active ? '#f59e0b' : '#64748b'} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', width: '280px', maxWidth: '100%' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search contests, trips, sponsors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 10px 6px 32px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.82rem',
              outline: 'none',
              background: '#f8fafc'
            }}
          />
        </div>
      </div>

      {/* Contests Cards Grid */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
          Loading active sales contests and marketing campaigns...
        </div>
      ) : filteredContests.length === 0 ? (
        <div style={{
          padding: '3rem',
          textAlign: 'center',
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px dashed #cbd5e1'
        }}>
          <Trophy size={40} color="#cbd5e1" style={{ marginBottom: '10px' }} />
          <h3 style={{ fontSize: '1rem', color: '#334155', fontWeight: 800 }}>No Campaigns Found</h3>
          <p style={{ fontSize: '0.82rem', color: '#64748b', maxWidth: '400px', margin: '4px auto 14px' }}>
            There are currently no active contests matching your filter. Create a new trip incentive or commission booster above.
          </p>
          <button
            onClick={openCreateModal}
            style={{
              background: '#0f2b48',
              color: '#ffffff',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            + Create First Contest
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: '1.5rem'
        }}>
          {filteredContests.map(c => {
            const today = new Date().toISOString().split('T')[0];
            const isOngoing = c.isActive && today >= c.startDate && today <= c.endDate;
            const isUpcoming = c.isActive && today < c.startDate;
            const isExpired = today > c.endDate;

            return (
              <div
                key={c.id}
                style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  border: isOngoing ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                  boxShadow: isOngoing ? '0 4px 15px rgba(5, 150, 105, 0.08)' : '0 2px 8px rgba(0,0,0,0.03)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
              >
                <div>
                  {/* Poster Banner Image (if uploaded) */}
                  {c.bannerImageUrl && (
                    <div style={{ height: '160px', width: '100%', overflow: 'hidden', background: '#0f2b48', position: 'relative' }}>
                      <img
                        src={c.bannerImageUrl}
                        alt={c.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div style={{
                        position: 'absolute',
                        top: '10px',
                        left: '10px',
                        background: 'rgba(15, 23, 42, 0.75)',
                        color: '#ffffff',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        letterSpacing: '0.04em'
                      }}>
                        {c.sponsorInsurer}
                      </div>
                    </div>
                  )}

                  <div style={{ padding: '1.25rem' }}>
                    
                    {/* Status Pill & Type */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '3px 8px',
                        borderRadius: '20px',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        background: isOngoing ? '#ecfdf5' : isUpcoming ? '#eff6ff' : '#f1f5f9',
                        color: isOngoing ? '#059669' : isUpcoming ? '#2563eb' : '#64748b'
                      }}>
                        <Clock size={12} />
                        {isOngoing ? '🟢 Active Sprint' : isUpcoming ? '🟡 Upcoming' : '⚪ Concluded'}
                      </span>

                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        color: '#0f2b48',
                        background: '#f8fafc',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        border: '1px solid #e2e8f0'
                      }}>
                        {c.contestType.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Title & Description */}
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f2b48', margin: '0 0 6px', lineHeight: 1.35 }}>
                      {c.title}
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5, margin: '0 0 1rem' }}>
                      {c.description}
                    </p>

                    {/* Key Metrics / Target Box */}
                    <div style={{
                      background: '#f8fafc',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: '1px solid #e2e8f0',
                      marginBottom: '1rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <span style={{ display: 'block', fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                          Target Qualification
                        </span>
                        <span style={{ fontSize: '0.95rem', fontWeight: 900, color: '#059669' }}>
                          {c.targetMetricType === 'GWP_AMOUNT' ? `₹${Number(c.targetValue).toLocaleString()} GWP` : `${c.targetValue} Policies`}
                        </span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ display: 'block', fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                          Validity
                        </span>
                        <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#334155' }}>
                          {c.startDate} to {c.endDate}
                        </span>
                      </div>
                    </div>

                    {/* Reward description */}
                    {c.rewardDescription && (
                      <div style={{
                        padding: '8px 10px',
                        background: 'rgba(245, 158, 11, 0.08)',
                        border: '1px solid rgba(245, 158, 11, 0.25)',
                        borderRadius: '8px',
                        fontSize: '0.78rem',
                        color: '#92400e',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '6px',
                        marginBottom: '1rem'
                      }}>
                        <Sparkles size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span><strong>Prize / Payout:</strong> {c.rewardDescription}</span>
                      </div>
                    )}

                    {/* Downloadable Brochure/Circular Link */}
                    {c.brochureDocUrl && (
                      <a
                        href={c.brochureDocUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          color: '#0284c7',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          textDecoration: 'none',
                          marginBottom: '0.5rem'
                        }}
                      >
                        <Download size={14} /> Download Official Circular / Flyer
                      </a>
                    )}
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div style={{
                  padding: '0.85rem 1.25rem',
                  background: '#f8fafc',
                  borderTop: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  {canManage ? (
                    <>
                      {/* WhatsApp Broadcast 1-Click Trigger */}
                      <button
                        onClick={() => handleQuickWhatsAppBroadcast(c)}
                        disabled={broadcastingId === c.id}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          background: '#047857',
                          color: '#ffffff',
                          border: 'none',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                        title="Send instant WhatsApp broadcast to all POSP agents"
                      >
                        <WhatsAppIcon size={13} color="#ffffff" />
                        {broadcastingId === c.id ? 'Broadcasting...' : 'Broadcast to Agents'}
                      </button>

                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => openEditModal(c)}
                          style={{
                            background: '#ffffff',
                            border: '1px solid #cbd5e1',
                            borderRadius: '6px',
                            padding: '6px 8px',
                            cursor: 'pointer',
                            color: '#475569',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                          title="Edit Contest"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id, c.title)}
                          style={{
                            background: '#ffffff',
                            border: '1px solid #fecaca',
                            borderRadius: '6px',
                            padding: '6px 8px',
                            cursor: 'pointer',
                            color: '#dc2626',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                          title="Delete Contest"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                        Accredited POSP Agent Incentive Sprint
                      </span>
                      <span style={{
                        background: '#dcfce7',
                        color: '#166534',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: 700
                      }}>
                        Direct Credit Eligible
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT CONTEST MODAL (Rule 10 standard: crisp dark transparent overlay) */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '680px',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '1.25rem 1.5rem',
              background: '#0f2b48',
              color: '#ffffff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Trophy size={20} color="#f59e0b" />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>
                    {modalMode === 'CREATE' ? 'Create Sales Contest / Incentive Sprint' : 'Edit Sales Contest'}
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>
                    Configure monthly trip rewards, volume boosters, and date-to-date eligibility
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              
              {/* Contest Title */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Contest / Campaign Title *
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Goa Beach Leadership Retreat 2026"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  required
                />
              </div>

              {/* Type & Sponsor Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Contest Category *
                  </label>
                  <select
                    value={form.contestType}
                    onChange={(e) => setForm({ ...form, contestType: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  >
                    <option value="TRIP">✈️ Trip Incentive (Domestic / International)</option>
                    <option value="COMMISSION_BONUS">💰 Commission Booster (+X% Payout)</option>
                    <option value="COLLATERAL_FLYER">📄 Marketing Kit / Promotional Flyer</option>
                    <option value="RECOGNITION">🏅 Recognition & Hall of Fame</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Sponsor / Insurer Partner
                  </label>
                  <input
                    type="text"
                    value={form.sponsorInsurer}
                    onChange={(e) => setForm({ ...form, sponsorInsurer: e.target.value })}
                    placeholder="e.g. Aadhiraksha, HDFC ERGO, Star Health"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              {/* Date to Date Validity */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                    required
                  />
                </div>
              </div>

              {/* Target Metric & Target Value */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Qualification Metric Type
                  </label>
                  <select
                    value={form.targetMetricType}
                    onChange={(e) => setForm({ ...form, targetMetricType: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  >
                    <option value="GWP_AMOUNT">Gross Written Premium (₹ GWP)</option>
                    <option value="POLICY_COUNT">Number of Sold Policies</option>
                    <option value="OPEN">Open Eligibility (All Active Advisors)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Target Benchmark Value
                  </label>
                  <input
                    type="number"
                    value={form.targetValue}
                    onChange={(e) => setForm({ ...form, targetValue: e.target.value })}
                    placeholder="e.g. 500000 (for ₹5L) or 10 (policies)"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              {/* Reward & Payout Description */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Reward Details / Prize Description *
                </label>
                <input
                  type="text"
                  value={form.rewardDescription}
                  onChange={(e) => setForm({ ...form, rewardDescription: e.target.value })}
                  placeholder="e.g. 3D/2N 5-Star Luxury Resort Stay in Goa + Gala Dinner"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  required
                />
              </div>

              {/* Detailed Description */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Rules, Eligibility & Terms
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Detail the policies that count (e.g. Comprehensive Motor, Health floaters), payment cutoff dates, and eligibility criteria..."
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                />
              </div>

              {/* Asset Uploads: Poster Image & Brochure Document */}
              <div style={{
                background: '#f8fafc',
                padding: '1rem',
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                <h4 style={{ margin: 0, fontSize: '0.8rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase' }}>
                  Media & Documents Locker
                </h4>

                {/* Poster Banner */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>
                      Promotional Poster / Banner Image
                    </span>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                      {form.bannerImageUrl ? form.bannerImageUrl.split('/').pop() : 'No image uploaded yet'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => bannerFileRef.current?.click()}
                    disabled={uploadingBanner}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    <Camera size={13} /> {uploadingBanner ? 'Uploading...' : 'Upload Image'}
                  </button>
                </div>

                {/* Brochure PDF */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>
                      Official Circular / PDF Brochure
                    </span>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                      {form.brochureDocUrl ? form.brochureDocUrl.split('/').pop() : 'No document uploaded yet'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => docFileRef.current?.click()}
                    disabled={uploadingDoc}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    <FileCheck size={13} /> {uploadingDoc ? 'Uploading...' : 'Upload Circular (PDF)'}
                  </button>
                </div>
              </div>

              {/* Status checkbox */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="contestActive"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                />
                <label htmlFor="contestActive" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', cursor: 'pointer' }}>
                  Active & Visible in Agent Portals
                </label>
              </div>

              {/* Modal Footer Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '0.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    background: '#f1f5f9',
                    color: '#475569',
                    border: 'none',
                    padding: '9px 16px',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    background: '#059669',
                    color: '#ffffff',
                    border: 'none',
                    padding: '9px 20px',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {saving ? 'Saving...' : modalMode === 'CREATE' ? 'Publish Contest' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
