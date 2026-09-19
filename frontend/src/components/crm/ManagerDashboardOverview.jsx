import React from 'react';
import { 
  Users, 
  PhoneCall, 
  Calendar, 
  TrendingUp, 
  Award, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  FileText, 
  ChevronRight, 
  ArrowUpRight, 
  Target,
  Layers,
  Sparkles,
  RefreshCw,
  Zap
} from 'lucide-react';

export default function ManagerDashboardOverview({
  user,
  analytics,
  loading,
  onRefresh,
  onNavigateView,
  onSelectClient
}) {
  const isManager = user?.roles?.some(r => r === 'ROLE_MANAGER') || user?.role === 'ROLE_MANAGER';

  if (loading && !analytics) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '360px', gap: '1rem' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--border-subtle)', borderTopColor: 'var(--primary-navy)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>Loading team analytics & performance matrix...</span>
      </div>
    );
  }

  const data = analytics || {
    managerName: user?.fullName || 'Branch Manager',
    branch: 'Hyderabad Regional HQ',
    department: 'Retail Insurance Sales',
    teamSize: 0,
    totalLeads: 0,
    callsToday: 0,
    followupsDueToday: 0,
    overdueFollowups: 0,
    meetingsToday: 0,
    quotationsCount: 0,
    policiesSold: 0,
    conversionRate: 0.0,
    totalPremiumGenerated: 0,
    targetPremium: 500000,
    targetAchievementPercentage: 0.0,
    teamPerformance: [],
    pipelineBreakdown: []
  };

  const formatCurrency = (val) => {
    const num = Number(val || 0);
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num);
  };

  return (
    <div className="crm-manager-cockpit" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      {/* 1. Header Banner */}
      <div 
        style={{ 
          background: 'linear-gradient(135deg, var(--primary-navy) 0%, #1e3a5f 100%)', 
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
              <Zap size={12} /> {isManager ? 'Branch Management Cockpit' : 'Executive Overview'}
            </span>
            <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>•</span>
            <span style={{ color: '#cbd5e1', fontSize: '0.82rem', fontWeight: 600 }}>{data.branch}</span>
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
            {data.managerName} — Team Performance & Operations
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.84rem', margin: '4px 0 0 0', fontWeight: 500 }}>
            Overseeing <strong>{data.teamSize} Insurance Advisors</strong> across {data.department}. Real-time conversion & SLA tracking.
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
            <RefreshCw size={14} /> Refresh Metrics
          </button>
          <button
            onClick={() => onNavigateView('clients')}
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
            <FileText size={15} /> Lead Allocation Desk &rarr;
          </button>
        </div>
      </div>

      {/* 2. Analytical KPI Metric Cards */}
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', 
          gap: '1.1rem' 
        }}
      >
        {/* Card 1: Total Leads */}
        <div 
          onClick={() => onNavigateView('clients')}
          className="crm-metric-box"
          style={{
            background: 'var(--bg-card)',
            padding: '1.25rem',
            borderRadius: '14px',
            border: '1px solid var(--border-subtle)',
            cursor: 'pointer',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Team Leads</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}>
              <Users size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-navy)', marginTop: '0.4rem' }}>
            {data.totalLeads}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#0284c7', fontWeight: 700, marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            <span>Active in Pipeline</span> <ChevronRight size={12} />
          </div>
        </div>

        {/* Card 2: Calls Today */}
        <div 
          onClick={() => onNavigateView('agenda')}
          className="crm-metric-box"
          style={{
            background: 'var(--bg-card)',
            padding: '1.25rem',
            borderRadius: '14px',
            border: '1px solid var(--border-subtle)',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Calls Made Today</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#ffedd5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ea580c' }}>
              <PhoneCall size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-navy)', marginTop: '0.4rem' }}>
            {data.callsToday}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#ea580c', fontWeight: 700, marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            <span>Team Daily Output</span> <ChevronRight size={12} />
          </div>
        </div>

        {/* Card 3: Follow-ups Due Today */}
        <div 
          onClick={() => onNavigateView('agenda')}
          className="crm-metric-box"
          style={{
            background: 'var(--bg-card)',
            padding: '1.25rem',
            borderRadius: '14px',
            border: '1px solid var(--border-subtle)',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Follow-ups Due</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
              <Clock size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-navy)', marginTop: '0.4rem' }}>
            {data.followupsDueToday}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#d97706', fontWeight: 700, marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            <span>Scheduled Today</span> <ChevronRight size={12} />
          </div>
        </div>

        {/* Card 4: Overdue SLA (Urgent!) */}
        <div 
          onClick={() => onNavigateView('agenda')}
          className="crm-metric-box"
          style={{
            background: data.overdueFollowups > 0 ? '#fef2f2' : 'var(--bg-card)',
            padding: '1.25rem',
            borderRadius: '14px',
            border: data.overdueFollowups > 0 ? '1px solid #fecaca' : '1px solid var(--border-subtle)',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: data.overdueFollowups > 0 ? '#dc2626' : 'var(--text-muted)' }}>
              Overdue SLA
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: data.overdueFollowups > 0 ? '#fee2e2' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626' }}>
              <AlertTriangle size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: data.overdueFollowups > 0 ? '#dc2626' : 'var(--primary-navy)', marginTop: '0.4rem' }}>
            {data.overdueFollowups}
          </div>
          <div style={{ fontSize: '0.74rem', color: data.overdueFollowups > 0 ? '#dc2626' : '#64748b', fontWeight: 700, marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            <span>{data.overdueFollowups > 0 ? 'Requires Immediate Action' : 'Zero SLA Breaches'}</span> <ChevronRight size={12} />
          </div>
        </div>

        {/* Card 5: Meetings Today */}
        <div 
          onClick={() => onNavigateView('meetings')}
          className="crm-metric-box"
          style={{
            background: 'var(--bg-card)',
            padding: '1.25rem',
            borderRadius: '14px',
            border: '1px solid var(--border-subtle)',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Meetings Today</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c3aed' }}>
              <Calendar size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-navy)', marginTop: '0.4rem' }}>
            {data.meetingsToday}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#7c3aed', fontWeight: 700, marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            <span>Google Meet / In-Person</span> <ChevronRight size={12} />
          </div>
        </div>

        {/* Card 6: Quotations Sent */}
        <div 
          onClick={() => onNavigateView('pipeline')}
          className="crm-metric-box"
          style={{
            background: 'var(--bg-card)',
            padding: '1.25rem',
            borderRadius: '14px',
            border: '1px solid var(--border-subtle)',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Quotations Sent</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#fce7f3', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#db2777' }}>
              <FileText size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-navy)', marginTop: '0.4rem' }}>
            {data.quotationsCount}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#db2777', fontWeight: 700, marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            <span>Proposals Delivered</span> <ChevronRight size={12} />
          </div>
        </div>

        {/* Card 7: Policies Sold */}
        <div 
          onClick={() => onNavigateView('pipeline')}
          className="crm-metric-box"
          style={{
            background: 'var(--bg-card)',
            padding: '1.25rem',
            borderRadius: '14px',
            border: '1px solid var(--border-subtle)',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Policies Sold</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#16a34a', marginTop: '0.4rem' }}>
            {data.policiesSold}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#16a34a', fontWeight: 700, marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            <span>Closed Deals 🎉</span> <ChevronRight size={12} />
          </div>
        </div>

        {/* Card 8: Conversion Rate */}
        <div 
          onClick={() => onNavigateView('pipeline')}
          className="crm-metric-box"
          style={{
            background: 'var(--bg-card)',
            padding: '1.25rem',
            borderRadius: '14px',
            border: '1px solid var(--border-subtle)',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Team Conversion Rate</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5' }}>
              <TrendingUp size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#4f46e5', marginTop: '0.4rem' }}>
            {data.conversionRate}%
          </div>
          <div style={{ fontSize: '0.74rem', color: '#4f46e5', fontWeight: 700, marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            <span>Lead to Policy Ratio</span> <ChevronRight size={12} />
          </div>
        </div>
      </div>

      {/* 3. Mid-Section: Advisor Performance Matrix & Sales Pipeline */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1.1fr)', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Left: Employee / Advisor Performance Matrix */}
        <div 
          style={{ 
            background: 'var(--bg-card)', 
            borderRadius: '16px', 
            border: '1px solid var(--border-subtle)', 
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
            overflow: 'hidden'
          }}
        >
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary-navy)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Award size={18} color="var(--accent-gold)" /> Advisor Performance Matrix
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '3px 0 0 0' }}>
                Live daily activity, conversion rates, and SLA compliance per team member.
              </p>
            </div>
            <button
              onClick={() => onNavigateView('users')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary-navy)',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.2rem'
              }}
            >
              Manage Team &rarr;
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--bg-main)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.04em' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Advisor</th>
                  <th style={{ padding: '0.75rem 0.75rem', textAlign: 'center' }}>Leads</th>
                  <th style={{ padding: '0.75rem 0.75rem', textAlign: 'center' }}>Calls Today</th>
                  <th style={{ padding: '0.75rem 0.75rem', textAlign: 'center' }}>Due Today</th>
                  <th style={{ padding: '0.75rem 0.75rem', textAlign: 'center' }}>Overdue SLA</th>
                  <th style={{ padding: '0.75rem 0.75rem', textAlign: 'center' }}>Sold</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Conversion</th>
                </tr>
              </thead>
              <tbody>
                {data.teamPerformance && data.teamPerformance.length > 0 ? (
                  data.teamPerformance.map((adv, idx) => (
                    <tr 
                      key={adv.advisorId || idx}
                      style={{ 
                        borderBottom: '1px solid var(--border-subtle)',
                        transition: 'background 0.15s ease',
                      }}
                      className="crm-table-row"
                    >
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <div style={{ 
                            width: '32px', 
                            height: '32px', 
                            borderRadius: '50%', 
                            background: idx === 0 ? 'linear-gradient(135deg, #fbbf24, #d97706)' : 'var(--bg-main)', 
                            color: idx === 0 ? '#fff' : 'var(--primary-navy)',
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.8rem',
                            border: '1px solid var(--border-subtle)'
                          }}>
                            {adv.advisorName ? adv.advisorName.charAt(0).toUpperCase() : 'A'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--primary-navy)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <span>{adv.advisorName}</span>
                              {idx === 0 && <span title="Top Performer" style={{ fontSize: '0.85rem' }}>🏆</span>}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                              {adv.employeeCode} • {adv.designation}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center', fontWeight: 700, color: 'var(--primary-navy)' }}>
                        {adv.totalLeads}
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>
                        <span style={{ 
                          background: adv.callsToday > 0 ? '#ffedd5' : '#f1f5f9', 
                          color: adv.callsToday > 0 ? '#ea580c' : '#64748b', 
                          padding: '0.2rem 0.5rem', 
                          borderRadius: '6px', 
                          fontWeight: 700,
                          fontSize: '0.75rem' 
                        }}>
                          {adv.callsToday}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center', fontWeight: 600, color: '#d97706' }}>
                        {adv.followupsDueToday}
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>
                        {adv.overdueFollowups > 0 ? (
                          <span style={{ 
                            background: '#fee2e2', 
                            color: '#dc2626', 
                            padding: '0.2rem 0.55rem', 
                            borderRadius: '6px', 
                            fontWeight: 800,
                            fontSize: '0.75rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.2rem'
                          }}>
                            <AlertTriangle size={11} /> {adv.overdueFollowups}
                          </span>
                        ) : (
                          <span style={{ color: '#16a34a', fontSize: '0.75rem', fontWeight: 700 }}>0</span>
                        )}
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center', fontWeight: 800, color: '#16a34a' }}>
                        {adv.policiesSold}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                        <span style={{ 
                          fontWeight: 800, 
                          color: adv.conversionRate >= 15 ? '#16a34a' : (adv.conversionRate >= 8 ? 'var(--primary-navy)' : '#ea580c'),
                          fontSize: '0.85rem'
                        }}>
                          {adv.conversionRate}%
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No advisors currently assigned under this manager.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Pipeline Distribution & Monthly Goal */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Target Box */}
          <div 
            style={{ 
              background: 'var(--bg-card)', 
              borderRadius: '16px', 
              padding: '1.4rem', 
              border: '1px solid var(--border-subtle)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--primary-navy)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Target size={16} color="#d97706" /> Monthly Branch Premium Goal
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#d97706', background: '#fef3c7', padding: '0.15rem 0.5rem', borderRadius: '12px' }}>
                {data.targetAchievementPercentage}% Achieved
              </span>
            </div>

            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary-navy)', marginBottom: '0.35rem' }}>
              {formatCurrency(data.totalPremiumGenerated)} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>/ {formatCurrency(data.targetPremium)}</span>
            </div>

            {/* Progress Bar */}
            <div style={{ width: '100%', height: '8px', background: 'var(--bg-main)', borderRadius: '4px', overflow: 'hidden', margin: '0.6rem 0' }}>
              <div 
                style={{ 
                  width: `${Math.min(data.targetAchievementPercentage, 100)}%`, 
                  height: '100%', 
                  background: 'linear-gradient(90deg, #d97706, #16a34a)',
                  borderRadius: '4px',
                  transition: 'width 0.5s ease'
                }} 
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              <span>₹0</span>
              <span>Target: {formatCurrency(data.targetPremium)}</span>
            </div>
          </div>

          {/* Pipeline Stage Breakdown */}
          <div 
            style={{ 
              background: 'var(--bg-card)', 
              borderRadius: '16px', 
              padding: '1.4rem', 
              border: '1px solid var(--border-subtle)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--primary-navy)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Layers size={16} color="#0284c7" /> Pipeline Stage Breakdown
              </div>
              <button
                onClick={() => onNavigateView('pipeline')}
                style={{ background: 'none', border: 'none', color: '#0284c7', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
              >
                Kanban View &rarr;
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {data.pipelineBreakdown && data.pipelineBreakdown.map((item, idx) => (
                <div 
                  key={item.stage || idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.5rem 0.75rem',
                    background: 'var(--bg-main)',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{item.label}</span>
                  <span style={{ fontWeight: 800, color: item.count > 0 ? 'var(--primary-navy)' : 'var(--text-muted)' }}>
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
