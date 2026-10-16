import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Check, Bold, Italic, Underline, Heading2, Heading3, 
  List, ListOrdered, Link as LinkIcon, RefreshCw, 
  Undo, Redo, AlignLeft, AlignCenter, AlertTriangle, Info, RotateCcw
} from 'lucide-react';
import { portalService } from '../../services/api';
import { useBusinessProfile } from '../../context/BusinessProfileContext';
import { useToast } from '../../context/ToastContext';

/**
 * RichDocumentEditorModal
 * Modern Industry Standard (Notion / Google Docs / Medium Style).
 * 
 * Pure visual WYSIWYG document editor with ZERO confusing raw HTML code clutter.
 * Features:
 * 1. Clean full-page document canvas where everything (including styled amber warning boxes) is visually editable.
 * 2. Visual Ribbon: Headings, Bold/Italic/Underline, Lists, Alignment, Links.
 * 3. 1-Click Callout Inserters: Insert Warning (Section 41) or Info/Advisory callout boxes directly into document.
 * 4. Template Reset button to easily revert to standard legal boilerplate if desired.
 */
export default function RichDocumentEditorModal({
  isOpen,
  onClose,
  documentTitle = 'Document Editor',
  pageRoute = '/page',
  fieldName,
  defaultHtml = '',
  effectiveDateFieldName,
  defaultEffectiveDate = ''
}) {
  const { businessProfile, refreshBusinessProfile } = useBusinessProfile();
  const toast = useToast();

  const [effectiveDate, setEffectiveDate] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const visualEditorRef = useRef(null);

  // Initialize content on modal open
  useEffect(() => {
    if (isOpen) {
      const initialHtml = businessProfile?.[fieldName] || defaultHtml;
      if (effectiveDateFieldName) {
        setEffectiveDate(businessProfile?.[effectiveDateFieldName] || defaultEffectiveDate);
      }
      
      // Delay slightly so DOM node is mounted before populating innerHTML
      setTimeout(() => {
        if (visualEditorRef.current) {
          visualEditorRef.current.innerHTML = initialHtml;
        }
      }, 50);
    }
  }, [isOpen, fieldName, defaultHtml, effectiveDateFieldName, defaultEffectiveDate, businessProfile]);

  // Escape key handler & background body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const origOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = origOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Execute standard formatting commands on visual editor
  const executeCmd = (command, value = null) => {
    if (!visualEditorRef.current) return;
    visualEditorRef.current.focus();
    document.execCommand(command, false, value);
  };

  // Insert a rich Warning/Notice Callout box directly into the visual document
  const insertCalloutBox = (type = 'warning') => {
    if (!visualEditorRef.current) return;
    visualEditorRef.current.focus();

    let calloutHtml = '';
    if (type === 'warning') {
      calloutHtml = `
<div style="background: #fffbeb; border: 1.5px solid #fef3c7; border-radius: 12px; padding: 1.25rem; margin: 1.25rem 0;">
  <h4 style="margin: 0 0 0.5rem 0; color: #92400e; font-size: 0.95rem; font-weight: 800;">
    ⚠️ Statutory Notice / Warning Title:
  </h4>
  <p style="margin: 0; font-size: 0.88rem; color: #78350f; line-height: 1.6;">
    Enter statutory clause, rebate prohibition, or policy warning text here...
  </p>
</div><p><br></p>`;
    } else if (type === 'info') {
      calloutHtml = `
<div style="background: #f0f9ff; border: 1.5px solid #bae6fd; border-radius: 12px; padding: 1.25rem; margin: 1.25rem 0;">
  <h4 style="margin: 0 0 0.5rem 0; color: #0369a1; font-size: 0.95rem; font-weight: 800;">
    ℹ️ Important Information / Policy Advisory:
  </h4>
  <p style="margin: 0; font-size: 0.88rem; color: #0c4a6e; line-height: 1.6;">
    Enter advisory details, cashless hospital information, or tax compliance note here...
  </p>
</div><p><br></p>`;
    }

    document.execCommand('insertHTML', false, calloutHtml);
  };

  const handleResetTemplate = () => {
    if (window.confirm('Reset this document to the default recommended legal template?')) {
      if (visualEditorRef.current) {
        visualEditorRef.current.innerHTML = defaultHtml;
      }
      toast.info('Restored default document template');
    }
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const finalHtml = visualEditorRef.current ? visualEditorRef.current.innerHTML : '';

      const payload = {
        [fieldName]: finalHtml
      };
      if (effectiveDateFieldName) {
        payload[effectiveDateFieldName] = effectiveDate;
      }

      await portalService.updateBusinessProfile(payload);
      await refreshBusinessProfile();

      toast.success(`${documentTitle} saved and published successfully!`);
      onClose();
    } catch (err) {
      console.error('Failed to save document:', err);
      toast.error('Failed to save document: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.70)',
        backdropFilter: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: '1.25rem'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#ffffff',
          width: '100%',
          maxWidth: '1040px',
          height: '90vh',
          maxHeight: '940px',
          borderRadius: '16px',
          border: '1px solid #cbd5e1',
          boxShadow: '0 25px 60px rgba(15, 23, 42, 0.35)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* 1. Header Bar */}
        <div style={{
          padding: '1rem 1.5rem',
          background: '#0f172a',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
                {documentTitle}
              </h2>
              <span style={{
                background: 'rgba(56, 189, 248, 0.15)',
                color: '#38bdf8',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                padding: '2px 8px',
                borderRadius: '9999px',
                fontSize: '0.72rem',
                fontWeight: 700
              }}>
                {pageRoute}
              </span>
            </div>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>
              Edit text, headings, and warning boxes naturally. Changes publish immediately.
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Close editor (Esc)"
          >
            <X size={20} />
          </button>
        </div>

        {/* 2. Ribbon Bar: Effective Date + Formatting Controls */}
        <div style={{
          padding: '0.65rem 1.5rem',
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          {effectiveDateFieldName && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '260px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap' }}>
                Effective Date / Subtitle:
              </label>
              <input
                type="text"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                placeholder="e.g. January 2026 | Effective immediately"
                style={{
                  flex: 1,
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.82rem',
                  color: '#0f172a',
                  background: '#ffffff'
                }}
              />
            </div>
          )}

          {/* Reset Template Action */}
          <button
            type="button"
            onClick={handleResetTemplate}
            title="Restore default boilerplate legal text"
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              padding: '5px 12px',
              borderRadius: '8px',
              fontSize: '0.76rem',
              fontWeight: 700,
              color: '#dc2626',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <RotateCcw size={13} /> Reset Template
          </button>
        </div>

        {/* 3. Word/Notion-Style Formatting Toolbar */}
        <div style={{
          padding: '8px 1.5rem',
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          flexWrap: 'wrap'
        }}>
          <button
            type="button"
            onClick={() => executeCmd('undo')}
            title="Undo (Ctrl+Z)"
            style={ribbonBtnStyle}
          >
            <Undo size={15} />
          </button>
          <button
            type="button"
            onClick={() => executeCmd('redo')}
            title="Redo (Ctrl+Y)"
            style={ribbonBtnStyle}
          >
            <Redo size={15} />
          </button>

          <div style={{ width: '1px', height: '18px', background: '#cbd5e1', margin: '0 4px' }} />

          {/* Paragraph / Headings */}
          <button
            type="button"
            onClick={() => executeCmd('formatBlock', '<p>')}
            title="Normal Paragraph"
            style={{ ...ribbonBtnStyle, fontSize: '0.78rem', fontWeight: 700 }}
          >
            Normal
          </button>
          <button
            type="button"
            onClick={() => executeCmd('formatBlock', '<h2>')}
            title="Heading 2"
            style={ribbonBtnStyle}
          >
            <Heading2 size={16} />
          </button>
          <button
            type="button"
            onClick={() => executeCmd('formatBlock', '<h3>')}
            title="Heading 3"
            style={ribbonBtnStyle}
          >
            <Heading3 size={16} />
          </button>

          <div style={{ width: '1px', height: '18px', background: '#cbd5e1', margin: '0 4px' }} />

          {/* Text Styling */}
          <button
            type="button"
            onClick={() => executeCmd('bold')}
            title="Bold (Ctrl+B)"
            style={ribbonBtnStyle}
          >
            <Bold size={15} />
          </button>
          <button
            type="button"
            onClick={() => executeCmd('italic')}
            title="Italic (Ctrl+I)"
            style={ribbonBtnStyle}
          >
            <Italic size={15} />
          </button>
          <button
            type="button"
            onClick={() => executeCmd('underline')}
            title="Underline (Ctrl+U)"
            style={ribbonBtnStyle}
          >
            <Underline size={15} />
          </button>

          <div style={{ width: '1px', height: '18px', background: '#cbd5e1', margin: '0 4px' }} />

          {/* Lists */}
          <button
            type="button"
            onClick={() => executeCmd('insertUnorderedList')}
            title="Bullet List"
            style={ribbonBtnStyle}
          >
            <List size={16} />
          </button>
          <button
            type="button"
            onClick={() => executeCmd('insertOrderedList')}
            title="Numbered List"
            style={ribbonBtnStyle}
          >
            <ListOrdered size={16} />
          </button>

          <div style={{ width: '1px', height: '18px', background: '#cbd5e1', margin: '0 4px' }} />

          {/* Alignment */}
          <button
            type="button"
            onClick={() => executeCmd('justifyLeft')}
            title="Align Left"
            style={ribbonBtnStyle}
          >
            <AlignLeft size={15} />
          </button>
          <button
            type="button"
            onClick={() => executeCmd('justifyCenter')}
            title="Align Center"
            style={ribbonBtnStyle}
          >
            <AlignCenter size={15} />
          </button>

          <div style={{ width: '1px', height: '18px', background: '#cbd5e1', margin: '0 4px' }} />

          {/* Hyperlink */}
          <button
            type="button"
            onClick={() => {
              const url = prompt('Enter Web Link URL (e.g. https://...):');
              if (url) executeCmd('createLink', url);
            }}
            title="Insert Link"
            style={ribbonBtnStyle}
          >
            <LinkIcon size={15} />
          </button>

          <div style={{ width: '1px', height: '18px', background: '#cbd5e1', margin: '0 4px' }} />

          {/* Rich Callout / Warning Alert Inserters */}
          <button
            type="button"
            onClick={() => insertCalloutBox('warning')}
            title="Insert Amber Warning / Statutory Notice Box"
            style={{
              ...ribbonBtnStyle,
              background: '#fffbeb',
              border: '1px solid #fef3c7',
              color: '#b45309',
              fontSize: '0.76rem',
              fontWeight: 700,
              gap: '4px'
            }}
          >
            <AlertTriangle size={14} color="#b45309" /> + Warning Box
          </button>
          <button
            type="button"
            onClick={() => insertCalloutBox('info')}
            title="Insert Blue Advisory / Info Box"
            style={{
              ...ribbonBtnStyle,
              background: '#f0f9ff',
              border: '1px solid #bae6fd',
              color: '#0369a1',
              fontSize: '0.76rem',
              fontWeight: 700,
              gap: '4px'
            }}
          >
            <Info size={14} color="#0284c7" /> + Advisory Box
          </button>
        </div>

        {/* 4. Pure Clean Document Canvas (100% Height - Zero Code Clutter) */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          background: '#ffffff',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div
            ref={visualEditorRef}
            contentEditable
            suppressContentEditableWarning
            style={{
              flex: 1,
              minHeight: '100%',
              background: '#ffffff',
              padding: '2.5rem clamp(1.5rem, 5vw, 4rem)',
              outline: 'none',
              lineHeight: 1.85,
              color: '#334155',
              fontSize: '1rem',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* 5. Footer Actions */}
        <div style={{
          padding: '1rem 1.5rem',
          background: '#ffffff',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
            Click anywhere on the text or warning boxes to type directly.
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              style={{
                padding: '9px 18px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                background: '#f1f5f9',
                color: '#475569',
                fontSize: '0.88rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 24px',
                borderRadius: '10px',
                border: 'none',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                color: '#ffffff',
                fontSize: '0.88rem',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)',
                opacity: isSaving ? 0.7 : 1
              }}
            >
              {isSaving ? <RefreshCw size={16} className="spin" /> : <Check size={16} />}
              {isSaving ? 'Publishing...' : 'Save & Publish'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const ribbonBtnStyle = {
  background: 'transparent',
  border: '1px solid transparent',
  color: '#475569',
  padding: '6px 8px',
  borderRadius: '6px',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.15s ease'
};
