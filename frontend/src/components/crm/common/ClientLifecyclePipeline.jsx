import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Phone, 
  FileText, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Calendar, 
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  RotateCcw,
  Tag
} from 'lucide-react';
import { crmService } from '../../../services/api';

/**
 * Global CRM Client Lifecycle Stage Definitions
 * Full Ordered Progression for InsurTech CRM
 */
export const CRM_ALL_LIFECYCLE_STAGES = [
  { key: 'NEW_LEAD', label: 'New Lead', altKeys: ['NEW', 'QUALIFIED', 'CONVERTED'], icon: Sparkles, color: '#0284c7', bg: '#e0f2fe', border: '#bae6fd', order: 1 },
  { key: 'CONTACTED', label: 'Contacted', icon: Phone, color: '#d97706', bg: '#fef3c7', border: '#fde68a', order: 2 },
  { key: 'FOLLOWUP', label: 'Follow-up Due', icon: Clock, color: '#ea580c', bg: '#ffedd5', border: '#fed7aa', order: 3 },
  { key: 'MEETING', label: 'Meeting Scheduled', icon: Calendar, color: '#9333ea', bg: '#f3e8ff', border: '#e9d5ff', order: 4 },
  { key: 'QUOTATION', label: 'Quote Shared', altKeys: ['QUOTATION_SHARED'], icon: FileText, color: '#4f46e5', bg: '#e0e7ff', border: '#c7d2fe', order: 5 },
  { key: 'UNDERWRITING', label: 'Underwriting / KYC', icon: ShieldCheck, color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', order: 6 },
  { key: 'POLICY_ISSUED', label: 'Policy Issued 🎉', icon: CheckCircle2, color: '#059669', bg: '#d1fae5', border: '#a7f3d0', order: 7 },
  { key: 'LOST', label: 'Lost / Disqualified', isLost: true, icon: XCircle, color: '#dc2626', bg: '#fee2e2', border: '#fecaca', order: 99 }
];

export const TERMINAL_STAGES = [];

/**
 * Quick note suggestion chips tailored to destination stages
 */
const QUICK_TRANSITION_REASONS = {
  CONTACTED: [
    'Initial phone discussion completed',
    'Customer requested plan comparison',
    'Connected via WhatsApp'
  ],
  FOLLOWUP: [
    'Client asked to call back tomorrow',
    'Client travelling / busy right now',
    'Decision pending with family / spouse'
  ],
  MEETING: [
    'Google Meet scheduled for detailed demo',
    'In-person branch visit arranged',
    'Portfolio consultation booked'
  ],
  QUOTATION: [
    'Multi-insurer quotes shared on WhatsApp',
    'Customized benefit sheet emailed',
    'Revised quotes with higher sum insured'
  ],
  UNDERWRITING: [
    'Proposal form filled & signed',
    'KYC documents & medical reports uploaded',
    'Awaiting medical underwriter approval'
  ],
  POLICY_ISSUED: [
    'Premium payment confirmed by insurer',
    'Policy number generated & sent to client',
    'Welcome kit & tax 80D certificate dispatched'
  ],
  LOST: [
    'Premium pricing too high / budget constraints',
    'Bought from competitor / agent',
    'Customer not interested / unreachable',
    'Disqualified / Duplicate lead inquiry'
  ],
  NEW_LEAD: [
    'Reset lead for fresh qualification',
    'Assigned to new telecaller team'
  ]
};

export const getStageMeta = (stageKey) => {
  const normalizedKey = (stageKey || 'NEW_LEAD').toUpperCase();
  const matched = CRM_ALL_LIFECYCLE_STAGES.find(s => 
    s.key === normalizedKey || (s.altKeys && s.altKeys.includes(normalizedKey))
  );
  return matched || {
    key: normalizedKey,
    label: normalizedKey.replace(/_/g, ' '),
    icon: Sparkles,
    color: '#475569',
    bg: '#f1f5f9',
    border: '#cbd5e1',
    order: 0
  };
};

/**
 * Unified Global Client Lifecycle Pipeline Component
 */
export default function ClientLifecyclePipeline({
  client,
  stage,
  titleLabel,
  onStageUpdated,
  onStageChange,
  compact = false,
  readOnly = false,
  className = ''
}) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [transitionModalState, setTransitionModalState] = useState({
    isOpen: false,
    targetStage: null,
    isDemotion: false
  });
  const [stageTransitionNote, setStageTransitionNote] = useState('');

  const scrollContainerRef = useRef(null);
  const activePillRef = useRef(null);

  const currentStageKey = (stage || client?.stage || 'NEW_LEAD').toUpperCase();
  const currentStageMeta = getStageMeta(currentStageKey);

  // Bulletproof Auto-centering of Active Pill across animated drawers/tabs
  const centerActivePill = () => {
    if (activePillRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const element = activePillRef.current;
      const containerRect = container.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();

      if (containerRect.width > 0 && elementRect.width > 0) {
        const relativeLeft = (elementRect.left - containerRect.left) + container.scrollLeft;
        const targetScrollLeft = relativeLeft - (containerRect.width / 2) + (elementRect.width / 2);
        container.scrollTo({
          left: Math.max(0, targetScrollLeft),
          behavior: 'smooth'
        });
      }
    }
  };

  useEffect(() => {
    // Center immediately and also after next paint/drawer animation finish
    const rafId = requestAnimationFrame(() => {
      centerActivePill();
    });
    const timer = setTimeout(centerActivePill, 80);
    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timer);
    };
  }, [currentStageKey]);

  const initiateTransition = (targetStageKey) => {
    if (targetStageKey === currentStageKey || isUpdating || readOnly) return;
    
    setShowDropdown(false);
    const targetMeta = getStageMeta(targetStageKey);
    const isDemotion = targetStageKey !== 'LOST' && targetMeta.order < currentStageMeta.order;

    setTransitionModalState({
      isOpen: true,
      targetStage: targetMeta,
      isDemotion
    });
    setStageTransitionNote('');
  };

  const executeTransition = async (e) => {
    e?.preventDefault();
    if (!stageTransitionNote.trim() || !transitionModalState.targetStage) return;

    const targetKey = transitionModalState.targetStage.key;
    setIsUpdating(true);

    try {
      const dateStr = new Date().toLocaleDateString('en-IN', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      const transitionType = targetKey === 'LOST' 
        ? '⛔ LOST' 
        : transitionModalState.isDemotion 
          ? '⚠️ DEMOTION' 
          : '⚡ ADVANCED';
      
      const contextPrefix = titleLabel ? `[${titleLabel}] ` : '';
      const noteEntry = `[${dateStr}] ${transitionType} ${contextPrefix}(${currentStageMeta.label} ➔ ${transitionModalState.targetStage.label}): ${stageTransitionNote.trim()}`;

      if (onStageChange) {
        await onStageChange(targetKey, noteEntry, stageTransitionNote.trim());
      } else if (client?.id) {
        const currentNotes = client.notes ? client.notes.trim() : '';
        const updatedNotes = currentNotes ? `${currentNotes}\n${noteEntry}` : noteEntry;

        const payload = {
          ...client,
          stage: targetKey,
          notes: updatedNotes
        };

        const updated = await crmService.updateClient(client.id, payload);
        
        if (onStageUpdated) {
          onStageUpdated({ ...client, ...updated, stage: targetKey, notes: updatedNotes });
        }
      }

      setTransitionModalState({ isOpen: false, targetStage: null, isDemotion: false });
      setStageTransitionNote('');
    } catch (err) {
      console.error('Failed to transition stage:', err);
      alert('Failed to update stage: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsUpdating(false);
    }
  };

  // 1. Compact Mode (for list rows or data sheets)
  if (compact) {
    const IconComponent = currentStageMeta.icon;
    return (
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <button
          type="button"
          disabled={readOnly || isUpdating}
          onClick={() => setShowDropdown(!showDropdown)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            background: currentStageMeta.bg,
            color: currentStageMeta.color,
            border: `1px solid ${currentStageMeta.border}`,
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '0.72rem',
            fontWeight: 700,
            cursor: readOnly ? 'default' : 'pointer'
          }}
          title={readOnly ? currentStageMeta.label : 'Click to change stage'}
        >
          <IconComponent size={12} />
          <span>{currentStageMeta.label}</span>
          {!readOnly && <span style={{ fontSize: '0.65rem', opacity: 0.7 }}>▾</span>}
        </button>

        {showDropdown && !readOnly && (
          <>
            <div 
              onClick={() => setShowDropdown(false)}
              style={{ position: 'fixed', inset: 0, zIndex: 100 }} 
            />
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              marginTop: '4px',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              zIndex: 101,
              minWidth: '180px',
              padding: '4px',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px'
            }}>
              {CRM_ALL_LIFECYCLE_STAGES.map((stg) => {
                const StgIcon = stg.icon;
                const isSelected = stg.key === currentStageKey || (stg.altKeys && stg.altKeys.includes(currentStageKey));
                return (
                  <button
                    key={stg.key}
                    type="button"
                    onClick={() => initiateTransition(stg.key)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      width: '100%',
                      padding: '6px 8px',
                      borderRadius: '6px',
                      border: 'none',
                      background: isSelected ? '#f1f5f9' : 'transparent',
                      color: isSelected ? '#0f2b48' : '#334155',
                      fontSize: '0.74rem',
                      fontWeight: isSelected ? 800 : 500,
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <StgIcon size={12} color={stg.color} />
                    <span>{stg.label}</span>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* Render Mandatory Transition & Confirmation Modal in Compact Mode */}
        {transitionModalState.isOpen && transitionModalState.targetStage && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            zIndex: 13000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            animation: 'fadeIn 0.15s ease-out'
          }}>
            <div style={{
              background: '#ffffff',
              borderRadius: '14px',
              width: '100%',
              maxWidth: '480px',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              border: '1px solid #e2e8f0',
              overflow: 'hidden'
            }}>
              {/* Modal Header Strip */}
              <div style={{
                background: transitionModalState.targetStage.key === 'LOST' 
                  ? '#fff1f2' 
                  : transitionModalState.isDemotion 
                    ? '#fffbeb' 
                    : '#f0fdf4',
                padding: '12px 18px',
                borderBottom: `1px solid ${
                  transitionModalState.targetStage.key === 'LOST' 
                    ? '#fecdd3' 
                    : transitionModalState.isDemotion 
                      ? '#fef3c7' 
                      : '#dcfce7'
                }`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {transitionModalState.targetStage.key === 'LOST' ? (
                    <AlertTriangle size={18} color="#e11d48" />
                  ) : transitionModalState.isDemotion ? (
                    <RotateCcw size={18} color="#d97706" />
                  ) : (
                    <CheckCircle2 size={18} color="#16a34a" />
                  )}
                  <div>
                    <h3 style={{
                      margin: 0,
                      fontSize: '0.92rem',
                      fontWeight: 800,
                      color: transitionModalState.targetStage.key === 'LOST' 
                        ? '#9f1239' 
                        : transitionModalState.isDemotion 
                          ? '#92400e' 
                          : '#166534'
                    }}>
                      {transitionModalState.targetStage.key === 'LOST' 
                        ? 'Mark Lead as Lost / Disqualified' 
                        : transitionModalState.isDemotion 
                          ? 'Demote / Revise Pipeline Stage' 
                          : 'Advance Pipeline Stage'}
                    </h3>
                    <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '1px' }}>
                      {currentStageMeta.label} ➔ <strong>{transitionModalState.targetStage.label}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Body & Compulsory Note Form */}
              <form onSubmit={executeTransition} style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f2b48', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Compulsory Transition Note / Interaction Reason</span>
                  <span style={{ color: '#dc2626' }}>*</span>
                </label>

                {/* 1-Tap Quick Reason Chips */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {(QUICK_TRANSITION_REASONS[transitionModalState.targetStage.key] || [
                    'Stage updated following customer interaction',
                    'Plan details reviewed and acknowledged'
                  ]).map((reasonChip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setStageTransitionNote(reasonChip)}
                      style={{
                        background: stageTransitionNote === reasonChip ? '#eff6ff' : '#f8fafc',
                        color: stageTransitionNote === reasonChip ? '#1d4ed8' : '#475569',
                        border: `1px solid ${stageTransitionNote === reasonChip ? '#bfdbfe' : '#e2e8f0'}`,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.1s ease'
                      }}
                    >
                      + {reasonChip}
                    </button>
                  ))}
                </div>

                {/* Freeform Note Textarea */}
                <textarea
                  rows={3}
                  required
                  placeholder="Type specific customer notes, objections, revised terms, or reason for this change..."
                  value={stageTransitionNote}
                  onChange={(e) => setStageTransitionNote(e.target.value)}
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.82rem',
                    outline: 'none',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                    background: '#ffffff'
                  }}
                />

                {/* Action Buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setTransitionModalState({ isOpen: false, targetStage: null, isDemotion: false })}
                    disabled={isUpdating}
                    style={{
                      padding: '7px 14px',
                      borderRadius: '7px',
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      color: '#475569',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!stageTransitionNote.trim() || isUpdating}
                    style={{
                      padding: '7px 16px',
                      borderRadius: '7px',
                      border: 'none',
                      background: transitionModalState.targetStage.key === 'LOST' 
                        ? '#dc2626' 
                        : transitionModalState.isDemotion 
                          ? '#d97706' 
                          : 'var(--primary-navy)',
                      color: '#ffffff',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: !stageTransitionNote.trim() || isUpdating ? 'not-allowed' : 'pointer',
                      opacity: !stageTransitionNote.trim() || isUpdating ? 0.6 : 1,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    {isUpdating ? 'Saving...' : 'Confirm Stage Change'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 2. Full Standard Horizontal Pipeline Flow
  return (
    <>
      <div style={{
        background: '#ffffff',
        padding: '8px 16px',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        {/* All Continuous Stages in Ordered Progression with Lost as the natural final pill */}
        <div 
          ref={scrollContainerRef}
          className={`crm-pipeline-chevron-bar ${className}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            width: '100%',
            overflowX: 'auto',
            padding: '6px 8px',
            scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch',
            scrollBehavior: 'smooth'
          }}
        >
          {CRM_ALL_LIFECYCLE_STAGES.map((stageItem) => {
            const isCurrent = currentStageKey === stageItem.key || (stageItem.altKeys && stageItem.altKeys.includes(currentStageKey));
            const isCompleted = currentStageMeta.order > stageItem.order && currentStageKey !== 'LOST' && !stageItem.isLost;
            const isLost = stageItem.isLost;
            const StageIcon = stageItem.icon;

            let btnClass = 'crm-pipeline-step-btn';
            if (isLost) btnClass += ' lost';
            if (isCurrent) btnClass += ' active';
            else if (isCompleted) btnClass += ' completed';

            return (
              <button
                key={stageItem.key}
                ref={isCurrent ? activePillRef : null}
                type="button"
                onClick={() => initiateTransition(stageItem.key)}
                disabled={isUpdating || readOnly}
                className={btnClass}
                title={
                  isCurrent 
                    ? `Current Active Stage: ${stageItem.label}` 
                    : isLost
                      ? 'Mark inquiry as lost or disqualified'
                      : stageItem.order < currentStageMeta.order 
                        ? `Click to demote/revise stage to ${stageItem.label}` 
                        : `Click to advance stage to ${stageItem.label}`
                }
              >
                {isCurrent ? (
                  <CheckCircle2 size={12} color={isLost ? '#dc2626' : '#2563eb'} />
                ) : isCompleted ? (
                  <CheckCircle2 size={12} color="#16a34a" />
                ) : (
                  <StageIcon size={12} color={isLost ? '#e11d48' : undefined} />
                )}
                <span>{stageItem.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* COMPULSORY STAGE TRANSITION & NOTE MODAL (Enterprise Standard) */}
      {transitionModalState.isOpen && transitionModalState.targetStage && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          zIndex: 13000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          animation: 'fadeIn 0.15s ease-out'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '14px',
            width: '100%',
            maxWidth: '480px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden'
          }}>
            {/* Modal Header Strip */}
            <div style={{
              background: transitionModalState.targetStage.key === 'LOST' 
                ? '#fff1f2' 
                : transitionModalState.isDemotion 
                  ? '#fffbeb' 
                  : '#f0fdf4',
              padding: '12px 18px',
              borderBottom: `1px solid ${
                transitionModalState.targetStage.key === 'LOST' 
                  ? '#fecdd3' 
                  : transitionModalState.isDemotion 
                    ? '#fef3c7' 
                    : '#dcfce7'
              }`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {transitionModalState.targetStage.key === 'LOST' ? (
                  <AlertTriangle size={18} color="#e11d48" />
                ) : transitionModalState.isDemotion ? (
                  <RotateCcw size={18} color="#d97706" />
                ) : (
                  <CheckCircle2 size={18} color="#16a34a" />
                )}
                <div>
                  <h3 style={{
                    margin: 0,
                    fontSize: '0.92rem',
                    fontWeight: 800,
                    color: transitionModalState.targetStage.key === 'LOST' 
                      ? '#9f1239' 
                      : transitionModalState.isDemotion 
                        ? '#92400e' 
                        : '#166534'
                  }}>
                    {transitionModalState.targetStage.key === 'LOST' 
                      ? 'Mark Lead as Lost / Disqualified' 
                      : transitionModalState.isDemotion 
                        ? 'Demote / Revise Pipeline Stage' 
                        : 'Advance Pipeline Stage'}
                  </h3>
                  <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '1px' }}>
                    {currentStageMeta.label} ➔ <strong>{transitionModalState.targetStage.label}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Body & Compulsory Note Form */}
            <form onSubmit={executeTransition} style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f2b48', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>Compulsory Transition Note / Interaction Reason</span>
                <span style={{ color: '#dc2626' }}>*</span>
              </label>

              {/* 1-Tap Quick Reason Chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {(QUICK_TRANSITION_REASONS[transitionModalState.targetStage.key] || [
                  'Stage updated following customer interaction',
                  'Plan details reviewed and acknowledged'
                ]).map((reasonChip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setStageTransitionNote(reasonChip)}
                    style={{
                      background: stageTransitionNote === reasonChip ? '#eff6ff' : '#f8fafc',
                      color: stageTransitionNote === reasonChip ? '#1d4ed8' : '#475569',
                      border: `1px solid ${stageTransitionNote === reasonChip ? '#bfdbfe' : '#e2e8f0'}`,
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.1s ease'
                    }}
                  >
                    + {reasonChip}
                  </button>
                ))}
              </div>

              {/* Freeform Note Textarea */}
              <textarea
                rows={3}
                required
                placeholder="Type specific customer notes, objections, revised terms, or reason for this change..."
                value={stageTransitionNote}
                onChange={(e) => setStageTransitionNote(e.target.value)}
                autoFocus
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.82rem',
                  outline: 'none',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                  background: '#ffffff'
                }}
              />

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setTransitionModalState({ isOpen: false, targetStage: null, isDemotion: false })}
                  disabled={isUpdating}
                  style={{
                    padding: '7px 14px',
                    borderRadius: '7px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#475569',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!stageTransitionNote.trim() || isUpdating}
                  style={{
                    padding: '7px 16px',
                    borderRadius: '7px',
                    border: 'none',
                    background: transitionModalState.targetStage.key === 'LOST' 
                      ? '#dc2626' 
                      : transitionModalState.isDemotion 
                        ? '#d97706' 
                        : 'var(--primary-navy)',
                    color: '#ffffff',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: !stageTransitionNote.trim() || isUpdating ? 'not-allowed' : 'pointer',
                    opacity: !stageTransitionNote.trim() || isUpdating ? 0.6 : 1,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {isUpdating ? 'Saving...' : 'Confirm Stage Change'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
