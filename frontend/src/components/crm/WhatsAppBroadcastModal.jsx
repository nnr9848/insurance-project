import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  History, 
  Sparkles, 
  Layers, 
  FileText,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import WhatsAppIcon from '../common/WhatsAppIcon';
import { portalService } from '../../services/api';

/**
 * Enterprise Insurance Broadcast Campaigns & Templates
 */
const BROADCAST_TEMPLATES = [
  {
    id: 'NEW_SCHEME',
    label: '🚀 IRDAI New Product Launch',
    title: 'New High-Restoration Health Plan Launched',
    description: 'Announce 100% restoration, zero room-rent capping, and OPD coverage.',
    message: `We are pleased to introduce our comprehensive *Comprehensive Health Shield Plan* underwritten by top IRDAI insurers.

✨ *Highlights:*
• Zero Room-Rent sub-limits
• 100% Day-One Unlimited Restoration
• Cashless treatment across 14,000+ network hospitals
• 30-min cashless pre-auth assistance

Contact your assigned Aadhiraksha Insurance Advisor for an instant quote tailored for your family.`
  },
  {
    id: 'RENEWAL_FEST',
    label: '🛡 Policy Renewal & Porting Drive',
    title: 'Protect Your Continuity Credits & Waiting Periods',
    description: 'Campaign encouraging policyholders to renew or port ahead of expiry.',
    message: `Ensure your healthcare safety net remains uninterrupted! Renew or port your existing health/motor policy with *Aadhiraksha Insurance* to retain all accrued cumulative bonuses and pre-existing disease waiting credits.

📞 Reply to this message or speak to our claims desk for seamless zero-lapse renewal processing.`
  },
  {
    id: 'MOTOR_DISCOUNT',
    label: '🚗 Commercial & Private Motor Special',
    title: 'Up to 85% OD Discount on Comprehensive Motor Insurance',
    description: 'Promotional announcement for zero-depreciation motor insurance.',
    message: `Exclusive Drive: Get comprehensive motor coverage for your car or two-wheeler with instant policy issuance.

🚗 *Includes:*
• Nil-Depreciation Bumper-to-Bumper cover
• 24x7 Roadside Assistance & Engine Protect
• Cashless claims at all authorized manufacturer workshops

Get your instant quote in 60 seconds with our digital advisory desk.`
  },
  {
    id: 'POSP_INCENTIVE',
    label: '🏆 POSP Partner Sprint & Incentive',
    title: 'POSP Rewards: Accelerate Your Monthly Commissions',
    description: 'Motivational broadcast to POSP Agent network regarding sprint bonuses.',
    message: `Dear POSP Partner,

Our latest Sales Sprint is officially live! Drive retail health and motor policies this month to unlock tiered milestone rewards, executive gadget bonuses, and spot payouts.

Log in to your Aadhiraksha POSP Portal to view live leaderboard standings and contest rules.`
  }
];

export default function WhatsAppBroadcastModal({
  isOpen,
  onClose,
  defaultTarget = 'CLIENTS', // 'CLIENTS' | 'POSP' | 'CUSTOM'
  clientsList = [],
  pospList = [],
  selectedPhones = [],
  onBroadcastSuccess
}) {
  if (!isOpen) return null;

  const [broadcastTarget, setBroadcastTarget] = useState(defaultTarget);
  const [selectedTemplateId, setSelectedTemplateId] = useState('NEW_SCHEME');
  const [title, setTitle] = useState(BROADCAST_TEMPLATES[0].title);
  const [message, setMessage] = useState(BROADCAST_TEMPLATES[0].message);
  const [customPhonesInput, setCustomPhonesInput] = useState(selectedPhones.join(', '));
  
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState(null);
  const [broadcastError, setBroadcastError] = useState('');

  // Calculate recipients dynamically
  const calculateRecipients = () => {
    let list = [];
    if (broadcastTarget === 'CLIENTS') {
      list = (clientsList || []).map(c => c.whatsappNumber || c.phoneNumber || c.mobileNumber).filter(Boolean);
    } else if (broadcastTarget === 'POSP') {
      list = (pospList || []).map(p => p.phoneNumber || p.user?.phoneNumber || p.phone).filter(Boolean);
    } else if (broadcastTarget === 'SELECTED') {
      list = selectedPhones || [];
    } else if (broadcastTarget === 'CUSTOM') {
      list = (customPhonesInput || '')
        .split(/[\n,]+/)
        .map(s => s.trim().replace(/[^0-9]/g, ''))
        .filter(s => s.length >= 10);
    }
    // Deduplicate
    return Array.from(new Set(list));
  };

  const recipientCount = calculateRecipients().length;

  const handleApplyTemplate = (tpl) => {
    setSelectedTemplateId(tpl.id);
    setTitle(tpl.title);
    setMessage(tpl.message);
  };

  const handleDispatchBroadcast = async (e) => {
    if (e) e.preventDefault();
    setBroadcastError('');
    setBroadcastResult(null);

    const recipients = calculateRecipients();
    if (recipients.length === 0) {
      setBroadcastError('No valid recipient phone numbers found for the selected audience.');
      return;
    }

    if (!title.trim() || !message.trim()) {
      setBroadcastError('Campaign title and announcement message are required.');
      return;
    }

    setBroadcasting(true);
    try {
      const res = await portalService.broadcastWhatsAppOffers({
        title: title.trim(),
        message: message.trim(),
        recipients
      });
      setBroadcastResult(res);
      if (onBroadcastSuccess) {
        onBroadcastSuccess(res);
      }
    } catch (err) {
      setBroadcastError(err.response?.data?.message || err.message || 'Failed to dispatch WhatsApp broadcast campaign.');
    } finally {
      setBroadcasting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'none',
      zIndex: 14000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      animation: 'fadeIn 0.15s ease-out'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '680px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid #e2e8f0',
        overflow: 'hidden'
      }}>
        {/* Sticky Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1.1rem 1.4rem',
          borderBottom: '1px solid #e2e8f0',
          background: '#ffffff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              background: '#ecfdf5',
              padding: '8px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #a7f3d0'
            }}>
              <WhatsAppIcon size={20} color="#16a34a" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f2b48' }}>
                Twilio WhatsApp Promotional Broadcast Hub
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.74rem', color: '#64748b' }}>
                High-deliverability official Twilio Cloud WhatsApp Gateway
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '6px',
              cursor: 'pointer',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleDispatchBroadcast} style={{
          padding: '1.25rem 1.4rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          overflowY: 'auto',
          flex: 1
        }}>
          {/* Target Audience Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0f2b48', marginBottom: '6px' }}>
              Select Broadcast Audience Target
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px' }}>
              {[
                { id: 'CLIENTS', label: 'All Clients', count: (clientsList || []).length, sub: 'CRM Policyholders' },
                { id: 'POSP', label: 'POSP Agents', count: (pospList || []).length, sub: 'Advisor Network' },
                ...(selectedPhones && selectedPhones.length > 0 ? [
                  { id: 'SELECTED', label: 'Selected Rows', count: selectedPhones.length, sub: 'Filtered Selection' }
                ] : []),
                { id: 'CUSTOM', label: 'Custom Numbers', count: null, sub: 'Manual CSV/Paste' }
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setBroadcastTarget(opt.id)}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '9px',
                    border: broadcastTarget === opt.id ? '2px solid #059669' : '1px solid #cbd5e1',
                    background: broadcastTarget === opt.id ? '#ecfdf5' : '#ffffff',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: broadcastTarget === opt.id ? '#065f46' : '#1e293b' }}>
                      {opt.label}
                    </span>
                    {opt.count !== null && (
                      <span style={{
                        fontSize: '0.68rem',
                        background: broadcastTarget === opt.id ? '#a7f3d0' : '#f1f5f9',
                        color: broadcastTarget === opt.id ? '#047857' : '#64748b',
                        padding: '1px 5px',
                        borderRadius: '4px',
                        fontWeight: 700
                      }}>
                        {opt.count}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '2px' }}>
                    {opt.sub}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Phone Numbers Input */}
          {broadcastTarget === 'CUSTOM' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Enter Custom Mobile Numbers (comma or newline separated)
              </label>
              <textarea
                rows={2}
                value={customPhonesInput}
                onChange={(e) => setCustomPhonesInput(e.target.value)}
                placeholder="e.g. 9848314319, 8367415156, +91 9988776655"
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.8rem',
                  fontFamily: 'monospace',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          )}

          {/* Pre-approved / Common Insurance Templates */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#0f2b48', marginBottom: '6px' }}>
              Quick Templates (IRDAI Compliant)
            </label>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {BROADCAST_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => handleApplyTemplate(tpl)}
                  style={{
                    padding: '4px 9px',
                    borderRadius: '6px',
                    border: selectedTemplateId === tpl.id ? '1px solid #059669' : '1px solid #cbd5e1',
                    background: selectedTemplateId === tpl.id ? '#ecfdf5' : '#f8fafc',
                    color: selectedTemplateId === tpl.id ? '#059669' : '#475569',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {tpl.label}
                </button>
              ))}
            </div>
          </div>

          {/* Campaign Title */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#0f2b48', marginBottom: '4px' }}>
              Campaign Headline / Offer Title <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Special Festival Health Plan with Zero Waiting Period"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#0f2b48',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Message Content */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f2b48' }}>
                WhatsApp Announcement Message <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                {message.length} characters • Supports *bold*, _italic_
              </span>
            </div>
            <textarea
              rows={6}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.82rem',
                lineHeight: 1.5,
                color: '#0f2b48',
                boxSizing: 'border-box',
                fontFamily: 'inherit'
              }}
            />
          </div>

          {/* Preflight Info Badge */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={16} color="#059669" />
              <div style={{ fontSize: '0.76rem', color: '#334155' }}>
                Estimated Reach: <strong style={{ color: '#0f2b48' }}>{recipientCount} Verified Number(s)</strong>
              </div>
            </div>
            <span style={{ fontSize: '0.7rem', color: '#64748b', fontStyle: 'italic' }}>
              Dispatches via Twilio WhatsApp Gateway
            </span>
          </div>

          {/* Feedback Messages */}
          {broadcastError && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '10px 12px',
              fontSize: '0.78rem',
              color: '#b91c1c',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <AlertCircle size={14} />
              <span>{broadcastError}</span>
            </div>
          )}

          {broadcastResult && (
            <div style={{
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: '8px',
              padding: '10px 14px',
              fontSize: '0.82rem',
              color: '#065f46',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <CheckCircle2 size={16} color="#059669" />
              <div>
                <strong>Broadcast Dispatched Successfully!</strong>
                <div style={{ fontSize: '0.74rem', marginTop: '2px' }}>
                  {broadcastResult.message || `Dispatched to ${recipientCount} recipients.`}
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={broadcasting}
              style={{
                padding: '9px 16px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#475569',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: broadcasting ? 'not-allowed' : 'pointer'
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={broadcasting || recipientCount === 0 || !title.trim() || !message.trim()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 20px',
                borderRadius: '8px',
                border: 'none',
                background: broadcasting || recipientCount === 0 ? '#94a3b8' : 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                color: '#ffffff',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: broadcasting || recipientCount === 0 ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 6px rgba(5, 150, 105, 0.25)'
              }}
            >
              {broadcasting ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Dispatching to Twilio Queue...</span>
                </>
              ) : (
                <>
                  <Send size={14} />
                  <span>Launch WhatsApp Broadcast ({recipientCount})</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
