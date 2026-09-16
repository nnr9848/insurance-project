import React, { useState } from 'react';
import { useThemeMode } from '../context/ThemeModeContext';
import { Sparkles, LayoutGrid, Check } from 'lucide-react';

export default function DesignModeToggle() {
  const { designMode, toggleDesignMode } = useThemeMode();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* Expanded Menu */}
      {isExpanded && (
        <div style={{
          background: 'rgba(15, 23, 42, 0.92)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          padding: '12px',
          marginBottom: '12px',
          boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.5)',
          width: '240px',
          color: '#ffffff',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: '#94a3b8',
            marginBottom: '8px',
            paddingLeft: '6px'
          }}>
            Experience Switcher
          </div>

          <button
            onClick={() => {
              toggleDesignMode('modern');
              setIsExpanded(false);
            }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 12px',
              borderRadius: '10px',
              border: 'none',
              background: designMode === 'modern' ? 'linear-gradient(135deg, #059669 0%, #047857 100%)' : 'transparent',
              color: '#ffffff',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.88rem',
              marginBottom: '4px',
              transition: 'all 0.2s ease',
              textAlign: 'left'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} color="#fbbf24" />
              Modern PolicyBazaar UX
            </span>
            {designMode === 'modern' && <Check size={16} />}
          </button>

          <button
            onClick={() => {
              toggleDesignMode('classic');
              setIsExpanded(false);
            }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 12px',
              borderRadius: '10px',
              border: 'none',
              background: designMode === 'classic' ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' : 'transparent',
              color: '#ffffff',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.88rem',
              transition: 'all 0.2s ease',
              textAlign: 'left'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <LayoutGrid size={16} color="#38bdf8" />
              Classic Corporate View
            </span>
            {designMode === 'classic' && <Check size={16} />}
          </button>
        </div>
      )}

      {/* Floating Pill Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '10px 18px',
          borderRadius: '9999px',
          background: designMode === 'modern' 
            ? 'linear-gradient(135deg, #04281f 0%, #0f3d32 100%)'
            : 'linear-gradient(135deg, #0f2b48 0%, #1e3a5f 100%)',
          color: '#ffffff',
          border: '1.5px solid rgba(245, 158, 11, 0.4)',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 0 15px rgba(245, 158, 11, 0.2)',
          cursor: 'pointer',
          fontWeight: 700,
          fontSize: '0.85rem',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        <span style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          background: designMode === 'modern' ? '#10b981' : '#38bdf8',
          color: '#000000',
          fontSize: '11px',
          fontWeight: 800
        }}>
          {designMode === 'modern' ? 'PB' : 'CL'}
        </span>
        <span>
          {designMode === 'modern' ? '⚡ Modern UX Active' : '🏛️ Classic View Active'}
        </span>
        <span style={{ fontSize: '0.75rem', opacity: 0.8, color: '#f59e0b' }}>
          Switch ▾
        </span>
      </button>
    </div>
  );
}
