import React, { useEffect } from 'react';
import { X, AlertTriangle, AlertCircle, Trash2, Send, CheckCircle2, Loader2 } from 'lucide-react';
import WhatsAppIcon from './WhatsAppIcon';

/**
 * Enterprise-grade, reusable confirmation modal adhering strictly to project UX guidelines:
 * - Crisp dark overlay rgba(15, 23, 42, 0.65) with backdrop-filter: none (Rule 10)
 * - Highly accessible (Escape key support, visible focus states)
 * - Zero window.confirm() dependency
 * - Reusable across all CRM entities (Delete, Broadcast, Deactivate, Purge, Reseed)
 */
export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger', // 'danger' | 'warning' | 'whatsapp' | 'success' | 'primary'
  isLoading = false,
  entitySummary = null, // Optional { title, subtitle, badge, details }
  confirmIcon: CustomIcon = null
}) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isLoading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  // Determine variant styling tokens
  const getVariantStyles = () => {
    switch (variant) {
      case 'whatsapp':
        return {
          iconBg: '#dcfce7',
          iconColor: '#059669',
          btnBg: '#047857',
          btnHover: '#065f46',
          btnText: '#ffffff',
          defaultIcon: WhatsAppIcon
        };
      case 'danger':
      case 'delete':
        return {
          iconBg: '#fee2e2',
          iconColor: '#dc2626',
          btnBg: '#dc2626',
          btnHover: '#b91c1c',
          btnText: '#ffffff',
          defaultIcon: Trash2
        };
      case 'warning':
        return {
          iconBg: '#fef3c7',
          iconColor: '#d97706',
          btnBg: '#d97706',
          btnHover: '#b45309',
          btnText: '#ffffff',
          defaultIcon: AlertTriangle
        };
      case 'success':
        return {
          iconBg: '#ecfdf5',
          iconColor: '#059669',
          btnBg: '#059669',
          btnHover: '#047857',
          btnText: '#ffffff',
          defaultIcon: CheckCircle2
        };
      case 'primary':
      default:
        return {
          iconBg: '#eff6ff',
          iconColor: '#2563eb',
          btnBg: '#0f2b48',
          btnHover: '#1e3a8a',
          btnText: '#ffffff',
          defaultIcon: AlertCircle
        };
    }
  };

  const styleConfig = getVariantStyles();
  const IconComponent = CustomIcon || styleConfig.defaultIcon;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 20000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'none',
        WebkitBackdropFilter: 'none',
        animation: 'fadeIn 0.15s ease-out'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '460px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.08)',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header with Icon and Close Button */}
        <div
          style={{
            padding: '1.25rem 1.25rem 0.75rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: styleConfig.iconBg,
              color: styleConfig.iconColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <IconComponent size={22} color={styleConfig.iconColor} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <h3
              id="confirm-modal-title"
              style={{
                margin: 0,
                fontSize: '1.1rem',
                fontWeight: 800,
                color: '#0f2b48',
                lineHeight: 1.3
              }}
            >
              {title}
            </h3>
            <p
              style={{
                margin: '4px 0 0',
                fontSize: '0.85rem',
                color: '#64748b',
                lineHeight: 1.45
              }}
            >
              {message}
            </p>
          </div>

          <button
            onClick={onClose}
            disabled={isLoading}
            aria-label="Close dialog"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              padding: '4px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.15s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#334155')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
          >
            <X size={18} />
          </button>
        </div>

        {/* Optional Entity Highlight Preview Card */}
        {entitySummary && (
          <div
            style={{
              margin: '0.5rem 1.25rem 0.75rem',
              padding: '0.75rem 1rem',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  color: '#1e293b',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {entitySummary.title}
              </span>
              {entitySummary.badge && (
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: '#e2e8f0',
                    color: '#334155',
                    flexShrink: 0
                  }}
                >
                  {entitySummary.badge}
                </span>
              )}
            </div>
            {entitySummary.subtitle && (
              <p style={{ margin: '4px 0 0', fontSize: '0.76rem', color: '#64748b', lineHeight: 1.35 }}>
                {entitySummary.subtitle}
              </p>
            )}
            {entitySummary.details && (
              <div
                style={{
                  marginTop: '6px',
                  paddingTop: '6px',
                  borderTop: '1px dashed #cbd5e1',
                  fontSize: '0.75rem',
                  color: '#475569',
                  fontWeight: 600
                }}
              >
                {entitySummary.details}
              </div>
            )}
            {entitySummary.extraContent && (
              <div style={{ marginTop: '8px' }}>
                {entitySummary.extraContent}
              </div>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div
          style={{
            padding: '1rem 1.25rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '10px',
            background: '#ffffff',
            borderTop: '1px solid #f1f5f9'
          }}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#475569',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s ease'
            }}
            onMouseEnter={(e) => {
              if (!isLoading) e.currentTarget.style.background = '#f8fafc';
            }}
            onMouseLeave={(e) => {
              if (!isLoading) e.currentTarget.style.background = '#ffffff';
            }}
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 18px',
              borderRadius: '8px',
              border: 'none',
              background: styleConfig.btnBg,
              color: styleConfig.btnText,
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              if (!isLoading) e.currentTarget.style.background = styleConfig.btnHover;
            }}
            onMouseLeave={(e) => {
              if (!isLoading) e.currentTarget.style.background = styleConfig.btnBg;
            }}
          >
            {isLoading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <IconComponent size={15} color={styleConfig.btnText} />
                <span>{confirmLabel}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
