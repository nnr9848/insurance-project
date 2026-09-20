import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success', duration = 4000, action = null) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 7);
    setToasts((prev) => [...prev, { id, message, type, action }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback((msg, action) => showToast(msg, 'success', 4000, action), [showToast]);
  const error = useCallback((msg, action) => showToast(msg, 'error', 5000, action), [showToast]);
  const info = useCallback((msg, action) => showToast(msg, 'info', 4000, action), [showToast]);
  const warning = useCallback((msg, action) => showToast(msg, 'warning', 4500, action), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, removeToast, success, error, info, warning }}>
      {children}

      {/* Floating Modern Toast Deck (Top-Right Industry Standard) */}
      <div
        style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          maxWidth: '420px',
          width: 'calc(100vw - 48px)',
          pointerEvents: 'none'
        }}
      >
        {toasts.map((toast) => {
          let bg = '#ffffff';
          let border = '#e2e8f0';
          let iconColor = '#10b981';
          let IconComp = CheckCircle2;
          let shadow = '0 10px 25px -5px rgba(0, 0, 0, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.08)';

          if (toast.type === 'error') {
            border = '#fecaca';
            iconColor = '#ef4444';
            IconComp = AlertCircle;
          } else if (toast.type === 'warning') {
            border = '#fde68a';
            iconColor = '#f59e0b';
            IconComp = AlertTriangle;
          } else if (toast.type === 'info') {
            border = '#bae6fd';
            iconColor = '#0284c7';
            IconComp = Info;
          }

          return (
            <div
              key={toast.id}
              style={{
                background: bg,
                border: `1px solid ${border}`,
                borderRadius: '12px',
                padding: '12px 16px',
                boxShadow: shadow,
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                pointerEvents: 'auto',
                animation: 'slideDownToast 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                backdropFilter: 'none'
              }}
            >
              <div style={{ flexShrink: 0, marginTop: '2px' }}>
                <IconComp size={18} color={iconColor} />
              </div>

              <div style={{ flex: 1, fontSize: '0.84rem', color: '#0f2b48', lineHeight: 1.45, fontWeight: 500 }}>
                {toast.message}

                {toast.action && (
                  <div style={{ marginTop: '6px' }}>
                    <button
                      onClick={() => {
                        toast.action.onClick();
                        removeToast(toast.id);
                      }}
                      style={{
                        background: '#f1f5f9',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        padding: '3px 8px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: '#0f2b48',
                        cursor: 'pointer'
                      }}
                    >
                      {toast.action.label}
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  marginTop: '1px'
                }}
                title="Dismiss"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
