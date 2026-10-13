import React, { useState, useEffect } from 'react';
import { 
  List, 
  Calendar as CalendarIcon, 
  Clock, 
  PhoneCall, 
  Video, 
  Plus, 
  CalendarDays
} from 'lucide-react';
import DailyCallAgendaView from './DailyCallAgendaView';
import MeetingCalendarView from './MeetingCalendarView';
import ScheduleActivityModal from './ScheduleActivityModal';

/**
 * WorkScheduleView - Unified Work Schedule Hub
 * Consolidates:
 * 1. Daily Agenda (List View) - Fast, action-oriented execution of calls, Google Meets, and overdue follow-ups for any day.
 * 2. Calendar Planner (Grid View) - Visual month/week/day grid planning of meetings & scheduled tasks.
 * 
 * Supports seamless view mode switching with zero context loss and backward compatibility with ?tab=agenda & ?tab=meetings.
 */
export default function WorkScheduleView({
  initialSubMode = 'agenda', // 'agenda' | 'calendar'
  preselectedMeetingClient = null,
  onClearPreselectedClient = () => {},
  onOpenClient360,
  onNavigateView
}) {
  const [subMode, setSubMode] = useState(initialSubMode);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // Sync if parent updates initialSubMode (e.g. from URL changes or direct action buttons)
  useEffect(() => {
    if (initialSubMode) {
      setSubMode(initialSubMode);
    }
  }, [initialSubMode]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      
      {/* Top Unified Navigation & Mode Switcher Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.85rem',
        background: 'var(--bg-card, #ffffff)',
        padding: '0.55rem 1rem',
        borderRadius: '12px',
        border: '1px solid var(--border-subtle, #e2e8f0)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
      }}>
        {/* Left: View Mode Segmented Controls */}
        <div style={{
          display: 'inline-flex',
          background: 'var(--bg-main, #f1f5f9)',
          padding: '3px',
          borderRadius: '9px',
          border: '1px solid var(--border-subtle, #e2e8f0)'
        }}>
          <button
            type="button"
            onClick={() => {
              setSubMode('agenda');
              if (onNavigateView) onNavigateView('agenda');
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '7px',
              border: 'none',
              background: subMode === 'agenda' ? '#0f2b48' : 'transparent',
              color: subMode === 'agenda' ? '#ffffff' : 'var(--text-muted, #64748b)',
              fontWeight: subMode === 'agenda' ? 800 : 600,
              fontSize: '0.82rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              boxShadow: subMode === 'agenda' ? '0 2px 4px rgba(15, 43, 72, 0.2)' : 'none'
            }}
            title="Daily Agenda (List View)"
          >
            <List size={15} />
            <span>Daily Agenda (List View)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSubMode('calendar');
              if (onNavigateView) onNavigateView('meetings');
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '7px',
              border: 'none',
              background: subMode === 'calendar' ? '#0f2b48' : 'transparent',
              color: subMode === 'calendar' ? '#ffffff' : 'var(--text-muted, #64748b)',
              fontWeight: subMode === 'calendar' ? 800 : 600,
              fontSize: '0.82rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              boxShadow: subMode === 'calendar' ? '0 2px 4px rgba(15, 43, 72, 0.2)' : 'none'
            }}
            title="Calendar Planner (Grid View)"
          >
            <CalendarDays size={15} />
            <span>Calendar Planner (Grid View)</span>
          </button>
        </div>

        {/* Right: Primary Schedule Action Button */}
        <div>
          <button
            type="button"
            onClick={() => setShowScheduleModal(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              color: '#ffffff',
              border: 'none',
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 5px rgba(37, 99, 235, 0.25)',
              whiteSpace: 'nowrap'
            }}
          >
            <Plus size={15} />
            <span>Schedule Activity</span>
          </button>
        </div>
      </div>

      {/* Render Active Modality */}
      {subMode === 'agenda' ? (
        <DailyCallAgendaView
          onOpenClient360={onOpenClient360}
          onOpenMeetingModal={(lead) => {
            setSubMode('calendar');
            if (onNavigateView) onNavigateView('meetings');
          }}
          onNavigateView={onNavigateView}
        />
      ) : (
        <MeetingCalendarView
          preselectedClient={preselectedMeetingClient}
          onCloseModal={onClearPreselectedClient}
          onOpenClient360={onOpenClient360}
          onOpenCallModal={() => {
            setSubMode('agenda');
            if (onNavigateView) onNavigateView('agenda');
          }}
          onNavigateView={onNavigateView}
        />
      )}

      {/* Global Schedule Activity Modal */}
      {showScheduleModal && (
        <ScheduleActivityModal
          isOpen={showScheduleModal}
          onClose={() => setShowScheduleModal(false)}
          onSuccess={() => {
            setShowScheduleModal(false);
          }}
        />
      )}
    </div>
  );
}
