import React, { useState } from 'react';
import {
  Edit3,
  X,
  Save,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { portalService } from '../../services/api';
import { useBusinessProfile } from '../../context/BusinessProfileContext';
import { useToast } from '../../context/ToastContext';

/**
 * InContextPageEditorModal
 * Standard In-Page Admin Floating Editor Drawer/Modal.
 * Adheres strictly to Zero Blur rule (clean crisp transparent black backdrop rgba(15, 23, 42, 0.65)).
 */
export default function InContextPageEditorModal({
  isOpen,
  onClose,
  pageTitle,
  pageRoute,
  fields = []
}) {
  const { businessProfile, refreshBusinessProfile } = useBusinessProfile();
  const toast = useToast();

  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);

  // Initialize form data whenever modal opens or profile changes
  React.useEffect(() => {
    if (isOpen && businessProfile) {
      const initial = {};
      fields.forEach(f => {
        initial[f.name] = (businessProfile[f.name] !== undefined && businessProfile[f.name] !== null && businessProfile[f.name] !== '')
          ? businessProfile[f.name]
          : (f.defaultValue || '');
      });
      setFormData(initial);
    }
  }, [isOpen, businessProfile, fields]);

  // Industry Standard: Escape key handler & body scroll lock
  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.keyCode === 27) {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      await portalService.updateBusinessProfile(formData);
      await refreshBusinessProfile();
      toast.success(`${pageTitle} content updated successfully!`);
      onClose();
    } catch (err) {
      console.error('Failed to update in-context page content:', err);
      toast.error('Failed to save changes: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'none' // Strict Rule 10 standard
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#ffffff',
          width: '100%',
          maxWidth: '640px',
          maxHeight: '90vh',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'fadeIn 0.15s ease'
        }}
      >
        {/* Modal Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          background: '#0f2b48',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38bdf8'
            }}>
              <Edit3 size={18} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                  Edit {pageTitle}
                </h3>
                <span style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '4px', fontFamily: 'monospace' }}>
                  {pageRoute}
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Changes will publish directly to the live website.
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body: Dynamic Fields */}
        <form onSubmit={handleSave} style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {fields.map(field => (
            <div key={field.name}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
                {field.label}
              </label>

              {field.type === 'textarea' ? (
                <textarea
                  name={field.name}
                  rows={field.rows || 3}
                  value={formData[field.name] || ''}
                  onChange={handleChange}
                  placeholder={field.placeholder || ''}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    fontSize: '0.88rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    lineHeight: 1.5,
                    fontFamily: 'inherit'
                  }}
                />
              ) : (
                <input
                  type={field.type || 'text'}
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={handleChange}
                  placeholder={field.placeholder || ''}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    fontSize: '0.88rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontFamily: 'inherit'
                  }}
                />
              )}

              {field.helpText && (
                <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '4px' }}>
                  {field.helpText}
                </div>
              )}
            </div>
          ))}

          {/* Modal Footer Controls */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '10px',
            paddingTop: '1rem',
            borderTop: '1px solid #e2e8f0'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '9px 18px',
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                color: '#475569',
                fontSize: '0.84rem',
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
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 22px',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                border: 'none',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '0.84rem',
                fontWeight: 800,
                cursor: saving ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)'
              }}
            >
              <Save size={15} />
              <span>{saving ? 'Publishing...' : 'Save & Publish'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * InContextAdminBar
 * Renders a crisp top floating bar on public pages when an admin or manager is logged in.
 */
export function InContextAdminBar({ pageTitle, onEditClick }) {
  return (
    <div style={{
      position: 'relative',
      background: 'linear-gradient(90deg, #0f2b48 0%, #1e3a5f 100%)',
      color: '#ffffff',
      padding: '8px 16px',
      borderBottom: '2px solid #0284c7',
      zIndex: 100
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            fontSize: '0.7rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            background: 'rgba(2, 132, 199, 0.3)',
            color: '#38bdf8',
            padding: '2px 8px',
            borderRadius: '4px',
            border: '1px solid rgba(56, 189, 248, 0.3)'
          }}>
            Admin Mode
          </span>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#e2e8f0' }}>
            Viewing <strong>{pageTitle}</strong> as authorized manager.
          </span>
        </div>

        <button
          type="button"
          onClick={onEditClick}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: '#0284c7',
            color: '#ffffff',
            border: 'none',
            padding: '5px 14px',
            borderRadius: '6px',
            fontSize: '0.78rem',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(2, 132, 199, 0.4)',
            transition: 'all 0.15s ease'
          }}
        >
          <Edit3 size={13} />
          <span>Edit Page Content</span>
        </button>
      </div>
    </div>
  );
}

/**
 * SectionEditTrigger
 * Sleek, high-comfort floating badge button placed directly on specific page sections.
 * Gives admins instant visual affordance to edit only that exact section.
 */
export function SectionEditTrigger({ label = 'Edit', tooltip, onClick, style = {} }) {
  const displayTooltip = tooltip || (label === 'Edit' ? 'Edit section content' : `Edit ${label}`);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        if (onClick) onClick();
      }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        background: 'rgba(15, 23, 42, 0.85)',
        color: '#ffffff',
        border: '1px solid rgba(255, 255, 255, 0.25)',
        padding: '3px 10px',
        borderRadius: '9999px',
        fontSize: '0.72rem',
        fontWeight: 700,
        cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.18)',
        transition: 'all 0.15s ease',
        zIndex: 50,
        ...style
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-1px)';
        e.currentTarget.style.background = '#0284c7';
        e.currentTarget.style.borderColor = '#38bdf8';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.background = 'rgba(15, 23, 42, 0.85)';
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
      }}
      title={displayTooltip}
    >
      <Edit3 size={11} color="#f59e0b" />
      <span>{label}</span>
    </button>
  );
}
