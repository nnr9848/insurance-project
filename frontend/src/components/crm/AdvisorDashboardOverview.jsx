import React from 'react';
import { 
  PhoneCall, 
  Clock, 
  Calendar, 
  UserPlus, 
  HeartHandshake, 
  FileSpreadsheet, 
  Award, 
  TrendingUp, 
  Sparkles, 
  RefreshCw, 
  ArrowUpRight, 
  ChevronRight, 
  Video, 
  MapPin, 
  Send, 
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  DollarSign,
  Briefcase,
  Flame,
  PhoneForwarded,
  ShieldCheck,
  Zap
} from 'lucide-react';

export default function AdvisorDashboardOverview({
  user,
  analytics,
  loading,
  onRefresh,
  onNavigateView,
  onSelectClient
}) {
  // Fallback data when analytics is loading or empty
  const data = analytics || {
    advisorName: user?.fullName || 'Insurance Advisor',
    designation: 'Certified Insurance Advisor',
    branch: 'Bengaluru Main Hub',
    managerName: 'Branch Manager',
    callsToday: 0,
    overdueFollowups: 0,
    meetingsToday: 0,
    newLeads: 0,
    interestedClients: 0,
    quotationPending: 0,
    policiesClosedMonth: 0,
    monthlyTargetPremium: 350000,
    monthlyAchievedPremium: 0,
    targetAchievementPercentage: 0.0,
    conversionRate: 0.0,
    todayFollowUps: [],
    upcomingMeetings: [],
    pipelineBreakdown: [],
    recentActivities: []
  };

  const formatCurrency = (val) => {
    const num = Number(val || 0);
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num);
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch {
      return dateStr;
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="crm-advisor-cockpit" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      {/* 1. Header Banner */}
      <div 
        style={{ 
          background: 'linear-gradient(135deg, var(--primary-navy) 0%, #17375e 100%)', 
          borderRadius: '16px', 
          padding: '1.5rem 1.75rem', 
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem',
          boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.15)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
            <span style={{ 
              background: 'rgba(217, 119, 6, 0.25)', 
              color: '#fbbf24', 
              border: '1px solid rgba(251, 191, 36, 0.4)', 
              fontSize: '0.72rem', 
              fontWeight: 800, 
              padding: '0.2rem 0.6rem', 
              borderRadius: '20px', 
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}>
              <Zap size={12} /> Advisor Daily Cockpit
            </span>
            <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>•</span>
            <span style={{ color: '#cbd5e1', fontSize: '0.82rem', fontWeight: 600 }}>{data.branch}</span>
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
            Welcome back, {data.advisorName}!
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.84rem', margin: '4px 0 0 0', fontWeight: 500 }}>
            Reporting to <strong>{data.managerName}</strong>. Let's turn follow-ups into issued policies today.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button
            onClick={onRefresh}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              padding: '0.55rem 0.9rem',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.2s ease'
            }}
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <button
            onClick={() => onNavigateView('agenda')}
            style={{
              background: 'linear-gradient(135deg, var(--accent-gold), var(--accent-gold-hover))',
              color: '#ffffff',
              border: 'none',
              padding: '0.55rem 1rem',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: 'var(--shadow-gold)'
            }}
          >
            <PhoneCall size={15} /> Start Calling Agenda &rarr;
          </button>
        </div>
      </div>

      {/* TOP SECTION: 7 KPI CARDS */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Flame size={18} color="#ea580c" /> Today's Sales Telemetry & KPI Targets
          </h3>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Live Performance Tracker
          </span>
        </div>

        <div 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', 
            gap: '1rem' 
          }}
        >
          {/* 1. Today's Calls */}
          <div 
            onClick={() => onNavigateView('agenda')}
            style={{
              background: '#ffffff',
              borderRadius: '14px',
              padding: '1.2rem',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.borderColor = '#2563eb';
              e.currentTarget.style.boxShadow = '0 6px 12px rgba(37, 99, 235, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = '#e2e8f0';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Today’s Calls
              </span>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PhoneCall size={16} color="#2563eb" />
              </div>
            </div>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-navy)', marginTop: '0.4rem' }}>
                {data.callsToday}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#2563eb', fontWeight: 700, marginTop: '0.2rem' }}>
                Agenda Queue &rarr;
              </div>
            </div>
          </div>

          {/* 2. Overdue Follow-ups */}
          <div 
            onClick={() => onNavigateView('agenda')}
            style={{
              background: data.overdueFollowups > 0 ? '#fef2f2' : '#ffffff',
              borderRadius: '14px',
              padding: '1.2rem',
              border: data.overdueFollowups > 0 ? '1px solid #fecaca' : '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.borderColor = '#dc2626';
              e.currentTarget.style.boxShadow = '0 6px 12px rgba(220, 38, 38, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = data.overdueFollowups > 0 ? '#fecaca' : '#e2e8f0';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: data.overdueFollowups > 0 ? '#b91c1c' : '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Overdue Follow-ups
              </span>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={16} color="#dc2626" />
              </div>
            </div>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: data.overdueFollowups > 0 ? '#dc2626' : 'var(--primary-navy)', marginTop: '0.4rem' }}>
                {data.overdueFollowups}
              </div>
              <div style={{ fontSize: '0.72rem', color: data.overdueFollowups > 0 ? '#b91c1c' : '#64748b', fontWeight: 700, marginTop: '0.2rem' }}>
                {data.overdueFollowups > 0 ? '⚠️ High SLA Alert' : '✓ Clean SLA'}
              </div>
            </div>
          </div>

          {/* 3. Meetings Today */}
          <div 
            onClick={() => onNavigateView('meetings')}
            style={{
              background: '#ffffff',
              borderRadius: '14px',
              padding: '1.2rem',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.borderColor = '#7c3aed';
              e.currentTarget.style.boxShadow = '0 6px 12px rgba(124, 58, 237, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = '#e2e8f0';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Meetings Today
              </span>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Calendar size={16} color="#7c3aed" />
              </div>
            </div>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-navy)', marginTop: '0.4rem' }}>
                {data.meetingsToday}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#7c3aed', fontWeight: 700, marginTop: '0.2rem' }}>
                Video & Visits &rarr;
              </div>
            </div>
          </div>

          {/* 4. New Leads */}
          <div 
            onClick={() => onNavigateView('clients')}
            style={{
              background: '#ffffff',
              borderRadius: '14px',
              padding: '1.2rem',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.borderColor = '#0284c7';
              e.currentTarget.style.boxShadow = '0 6px 12px rgba(2, 132, 199, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = '#e2e8f0';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                New Leads
              </span>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f0f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <UserPlus size={16} color="#0284c7" />
              </div>
            </div>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-navy)', marginTop: '0.4rem' }}>
                {data.newLeads}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 700, marginTop: '0.2rem' }}>
                Fresh Inquiries &rarr;
              </div>
            </div>
          </div>

          {/* 5. Interested Clients */}
          <div 
            onClick={() => onNavigateView('pipeline')}
            style={{
              background: '#ffffff',
              borderRadius: '14px',
              padding: '1.2rem',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.borderColor = '#d97706';
              e.currentTarget.style.boxShadow = '0 6px 12px rgba(217, 119, 6, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = '#e2e8f0';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Interested Clients
              </span>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <HeartHandshake size={16} color="#d97706" />
              </div>
            </div>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-navy)', marginTop: '0.4rem' }}>
                {data.interestedClients}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#d97706', fontWeight: 700, marginTop: '0.2rem' }}>
                In Discussion &rarr;
              </div>
            </div>
          </div>

          {/* 6. Quotation Pending */}
          <div 
            onClick={() => onNavigateView('crm-quotes')}
            style={{
              background: '#ffffff',
              borderRadius: '14px',
              padding: '1.2rem',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.borderColor = '#059669';
              e.currentTarget.style.boxShadow = '0 6px 12px rgba(5, 150, 105, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = '#e2e8f0';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Quotation Pending
              </span>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileSpreadsheet size={16} color="#059669" />
              </div>
            </div>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-navy)', marginTop: '0.4rem' }}>
                {data.quotationPending}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700, marginTop: '0.2rem' }}>
                Quotes Desk &rarr;
              </div>
            </div>
          </div>

          {/* 7. Policies Closed This Month */}
          <div 
            onClick={() => onNavigateView('pipeline')}
            style={{
              background: '#ffffff',
              borderRadius: '14px',
              padding: '1.2rem',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.borderColor = '#16a34a';
              e.currentTarget.style.boxShadow = '0 6px 12px rgba(22, 163, 74, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = '#e2e8f0';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Policies Closed
              </span>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Award size={16} color="#16a34a" />
              </div>
            </div>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#16a34a', marginTop: '0.4rem' }}>
                {data.policiesClosedMonth}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 700, marginTop: '0.2rem' }}>
                {formatCurrency(data.monthlyAchievedPremium)} GWP 🎉
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: TODAY'S FOLLOW-UPS & SECTION 3: UPCOMING MEETINGS (2 COLUMNS) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.5rem' }}>
        
        {/* Section 2: Today's Follow-ups */}
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '1.1rem 1.4rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafbfc' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PhoneForwarded size={16} color="#2563eb" />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: '#0f2b48' }}>Today’s Follow-ups</h4>
                <p style={{ margin: 0, fontSize: '0.76rem', color: '#64748b' }}>Due calls, WhatsApp updates & scheduled reminders</p>
              </div>
            </div>
            <button 
              onClick={() => onNavigateView('agenda')}
              style={{ background: 'transparent', border: 'none', color: '#2563eb', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
            >
              View Full Agenda &rarr;
            </button>
          </div>

          <div style={{ padding: '1rem 1.25rem', flex: 1, overflowY: 'auto', maxHeight: '340px' }}>
            {data.todayFollowUps && data.todayFollowUps.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {data.todayFollowUps.map((item, idx) => (
                  <div 
                    key={item.followUpId || idx}
                    style={{
                      padding: '0.85rem 1rem',
                      borderRadius: '12px',
                      background: item.isOverdue ? '#fef2f2' : '#f8fafc',
                      border: item.isOverdue ? '1px solid #fecaca' : '1px solid #e2e8f0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '0.75rem'
                    }}
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                        <span 
                          onClick={() => item.clientId && onSelectClient({ id: item.clientId, fullName: item.clientName, phoneNumber: item.phoneNumber })}
                          style={{ fontSize: '0.92rem', fontWeight: 800, color: '#091726', cursor: 'pointer', textDecoration: 'underline' }}
                        >
                          {item.clientName}
                        </span>
                        {item.isOverdue && (
                          <span style={{ fontSize: '0.65rem', fontWeight: 800, background: '#fee2e2', color: '#dc2626', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                            OVERDUE
                          </span>
                        )}
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, background: '#e0f2fe', color: '#0284c7', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                          {item.policyCategory || 'Insurance'}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.78rem', color: '#475569', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {item.remarks}
                      </p>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.2rem', display: 'inline-block' }}>
                        🕒 Due: {formatTime(item.scheduledTime)}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                      <a
                        href={`tel:${item.phoneNumber}`}
                        style={{
                          background: '#eff6ff',
                          color: '#2563eb',
                          border: '1px solid #bfdbfe',
                          padding: '0.45rem 0.65rem',
                          borderRadius: '8px',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem'
                        }}
                      >
                        <PhoneCall size={13} /> Call
                      </a>
                      <a
                        href={`https://wa.me/91${item.phoneNumber?.replace(/\D/g, '')}?text=Hello%20${encodeURIComponent(item.clientName || 'Sir/Madam')},%20this%20is%20${encodeURIComponent(data.advisorName)}%20from%20Aadhiraksha%20Insurance.`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          background: '#ecfdf5',
                          color: '#059669',
                          border: '1px solid #a7f3d0',
                          padding: '0.45rem 0.65rem',
                          borderRadius: '8px',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem'
                        }}
                      >
                        <Send size={13} /> WhatsApp
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: '#64748b' }}>
                <CheckCircle2 size={36} color="#10b981" style={{ margin: '0 auto 0.6rem auto', display: 'block' }} />
                <h5 style={{ margin: '0 0 0.3rem', fontSize: '0.95rem', fontWeight: 800, color: '#091726' }}>All Clear for Today!</h5>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>No pending follow-ups in your immediate queue.</p>
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Upcoming Meetings */}
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '1.1rem 1.4rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafbfc' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Calendar size={16} color="#7c3aed" />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: '#0f2b48' }}>Upcoming Meetings</h4>
                <p style={{ margin: 0, fontSize: '0.76rem', color: '#64748b' }}>Scheduled client video rooms and site visits</p>
              </div>
            </div>
            <button 
              onClick={() => onNavigateView('meetings')}
              style={{ background: 'transparent', border: 'none', color: '#7c3aed', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
            >
              Calendar &rarr;
            </button>
          </div>

          <div style={{ padding: '1rem 1.25rem', flex: 1, overflowY: 'auto', maxHeight: '340px' }}>
            {data.upcomingMeetings && data.upcomingMeetings.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {data.upcomingMeetings.map((meet, idx) => (
                  <div 
                    key={meet.meetingId || idx}
                    style={{
                      padding: '0.85rem 1rem',
                      borderRadius: '12px',
                      background: '#fcfaff',
                      border: '1px solid #ede9fe',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '0.75rem'
                    }}
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                        <span 
                          onClick={() => meet.clientId && onSelectClient({ id: meet.clientId, fullName: meet.clientName, phoneNumber: meet.phoneNumber })}
                          style={{ fontSize: '0.92rem', fontWeight: 800, color: '#091726', cursor: 'pointer', textDecoration: 'underline' }}
                        >
                          {meet.clientName}
                        </span>
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, background: '#ede9fe', color: '#7c3aed', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                          {meet.meetingType === 'GOOGLE_MEET' ? '📹 Video Room' : '📍 In-Person'}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.78rem', color: '#475569', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {meet.agenda || meet.title}
                      </p>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.2rem', display: 'inline-block' }}>
                        📅 {formatDate(meet.scheduledStartTime)} at {formatTime(meet.scheduledStartTime)}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                      {meet.meetingLink ? (
                        <a
                          href={meet.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            background: '#7c3aed',
                            color: '#ffffff',
                            border: 'none',
                            padding: '0.45rem 0.75rem',
                            borderRadius: '8px',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            boxShadow: '0 2px 5px rgba(124, 58, 237, 0.3)'
                          }}
                        >
                          <Video size={13} /> Join Room
                        </a>
                      ) : (
                        <button
                          onClick={() => onNavigateView('meetings')}
                          style={{
                            background: '#f3f4f6',
                            color: '#374151',
                            border: '1px solid #d1d5db',
                            padding: '0.45rem 0.65rem',
                            borderRadius: '8px',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            cursor: 'pointer'
                          }}
                        >
                          Details
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: '#64748b' }}>
                <Calendar size={36} color="#7c3aed" style={{ margin: '0 auto 0.6rem auto', display: 'block' }} />
                <h5 style={{ margin: '0 0 0.3rem', fontSize: '0.95rem', fontWeight: 800, color: '#091726' }}>No Consultations Today</h5>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Schedule video meetings directly from the client profile.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 4: MY SALES PIPELINE */}
      <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.4rem 1.6rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
          <div>
            <h4 style={{ margin: '0 0 0.2rem 0', fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary-navy)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={18} color="#059669" /> My Active Sales Pipeline
            </h4>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Live stage-by-stage client progression and projected GWP volume
            </p>
          </div>
          <button
            onClick={() => onNavigateView('pipeline')}
            style={{
              background: '#ecfdf5',
              color: '#059669',
              border: '1px solid #a7f3d0',
              padding: '0.45rem 0.85rem',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
          >
            Interactive Kanban Board &rarr;
          </button>
        </div>

        {/* Pipeline Stage Badges Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
          {data.pipelineBreakdown && data.pipelineBreakdown.map((stg) => (
            <div 
              key={stg.stage}
              onClick={() => onNavigateView('pipeline')}
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '0.85rem 1rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                borderTop: `3px solid ${stg.badgeColor || '#3b82f6'}`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.borderColor = stg.badgeColor || '#3b82f6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = '#e2e8f0';
              }}
            >
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '0.3rem' }}>
                {stg.label}
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#091726' }}>
                {stg.count}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700, marginTop: '0.2rem' }}>
                {formatCurrency(stg.totalPotentialValue)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 5: RECENT CLIENT ACTIVITY */}
      <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ padding: '1.1rem 1.4rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafbfc' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={16} color="#0284c7" />
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: '#0f2b48' }}>Recent Client Activity</h4>
              <p style={{ margin: 0, fontSize: '0.76rem', color: '#64748b' }}>Audit stream of calls logged, quote proposals dispatched, and stage advancements</p>
            </div>
          </div>
          <button 
            onClick={() => onNavigateView('calls')}
            style={{ background: 'transparent', border: 'none', color: '#0284c7', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
          >
            All Telephony Logs &rarr;
          </button>
        </div>

        <div style={{ padding: '1rem 1.4rem' }}>
          {data.recentActivities && data.recentActivities.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {data.recentActivities.map((act, idx) => (
                <div 
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.85rem',
                    paddingBottom: idx !== data.recentActivities.length - 1 ? '0.85rem' : 0,
                    borderBottom: idx !== data.recentActivities.length - 1 ? '1px solid #f1f5f9' : 'none'
                  }}
                >
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                    <PhoneCall size={14} color="#2563eb" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                      <span 
                        onClick={() => act.clientId && onSelectClient({ id: act.clientId, fullName: act.clientName })}
                        style={{ fontSize: '0.88rem', fontWeight: 800, color: '#091726', cursor: 'pointer', textDecoration: 'underline' }}
                      >
                        {act.clientName}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>
                        {formatDate(act.timestamp)} {formatTime(act.timestamp)}
                      </span>
                    </div>
                    <p style={{ margin: '3px 0 0 0', fontSize: '0.8rem', color: '#475569' }}>
                      {act.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#64748b' }}>
              <Sparkles size={32} color="#94a3b8" style={{ margin: '0 auto 0.5rem auto', display: 'block' }} />
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>No recent activity records logged yet.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
