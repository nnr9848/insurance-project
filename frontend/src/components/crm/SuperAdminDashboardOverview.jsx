import React, { useState } from 'react';
import { crmService } from '../../services/api';
import { 
  Building2, 
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
  Zap,
  Globe,
  PieChart,
  BarChart3,
  ShieldCheck,
  Briefcase
} from 'lucide-react';

export default function SuperAdminDashboardOverview({
  user,
  analytics,
  loading,
  onRefresh,
  onNavigateView
}) {
  if (loading && !analytics) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '360px', gap: '1rem' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--border-subtle)', borderTopColor: 'var(--primary-navy)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>Loading company-wide executive analytics...</span>
      </div>
    );
  }

  const data = analytics || {
    totalManagers: 0,
    totalEmployees: 0,
    totalLeads: 0,
    activeCustomers: 0,
    callsToday: 0,
    meetingsToday: 0,
    overdueFollowups: 0,
    quotationsGenerated: 0,
    policiesSold: 0,
    overallConversionRate: 0.0,
    totalGwpGenerated: 0,
    managerPerformance: [],
    topAdvisorPerformers: [],
    leadSourcePerformance: [],
    productPerformance: [],
    monthlyConversionTrend: []
  };

  const formatCurrency = (val) => {
    const num = Number(val || 0);
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num);
  };

  return (
    <div className="crm-superadmin-cockpit" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      {/* 1. Executive Master Header Banner */}
      <div 
        style={{ 
          background: 'linear-gradient(135deg, #091726 0%, #172554 100%)', 
          borderRadius: '16px', 
          padding: '1.6rem 1.85rem', 
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem',
          boxShadow: '0 10px 25px -5px rgba(9, 23, 38, 0.25)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
            <span style={{ 
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.3), rgba(217, 119, 6, 0.3))', 
              color: '#fbbf24', 
              border: '1px solid rgba(251, 191, 36, 0.45)', 
              fontSize: '0.72rem', 
              fontWeight: 800, 
              padding: '0.2rem 0.65rem', 
              borderRadius: '20px', 
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}>
              <ShieldCheck size={13} /> Enterprise Super Admin Cockpit
            </span>
            <span style={{ color: '#64748b', fontSize: '0.8rem' }}>•</span>
            <span style={{ color: '#93c5fd', fontSize: '0.82rem', fontWeight: 600 }}>All Branches & Regional Networks</span>
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
            Company-Wide Performance & Revenue Telemetry
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.84rem', margin: '4px 0 0 0', fontWeight: 500 }}>
            Unified real-time dashboard tracking <strong>{data.totalManagers} Branch Managers</strong>, <strong>{data.totalEmployees} Insurance Advisors</strong>, and <strong>{data.totalLeads} Total Inquiries</strong>.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button
            onClick={onRefresh}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              padding: '0.55rem 0.95rem',
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
            <RefreshCw size={14} /> Refresh Live Telemetry
          </button>
          <button
            onClick={() => onNavigateView('users')}
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
            <Users size={15} /> User & Team Hierarchy &rarr;
          </button>
        </div>
      </div>

      {/* 2. Primary 9 KPI Executive Metric Cards */}
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem' 
        }}
      >
        {/* Metric 1: Managers */}
        <div 
          onClick={() => onNavigateView('users')}
          className="crm-metric-box"
          style={{ background: 'var(--bg-card)', padding: '1.2rem', borderRadius: '14px', border: '1px solid var(--border-subtle)', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)' }}>Branch Managers</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
              <Building2 size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-navy)', marginTop: '0.4rem' }}>
            {data.totalManagers}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#2563eb', fontWeight: 700, marginTop: '0.2rem' }}>
            Regional Hubs &rarr;
          </div>
        </div>

        {/* Metric 2: Employees / Advisors */}
        <div 
          onClick={() => onNavigateView('users')}
          className="crm-metric-box"
          style={{ background: 'var(--bg-card)', padding: '1.2rem', borderRadius: '14px', border: '1px solid var(--border-subtle)', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)' }}>Active Advisors</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
              <Users size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-navy)', marginTop: '0.4rem' }}>
            {data.totalEmployees}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700, marginTop: '0.2rem' }}>
            Total Sales Team &rarr;
          </div>
        </div>

        {/* Metric 3: Total Leads */}
        <div 
          onClick={() => onNavigateView('clients')}
          className="crm-metric-box"
          style={{ background: 'var(--bg-card)', padding: '1.2rem', borderRadius: '14px', border: '1px solid var(--border-subtle)', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)' }}>Total Inquiries</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}>
              <FileText size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-navy)', marginTop: '0.4rem' }}>
            {data.totalLeads}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 700, marginTop: '0.2rem' }}>
            Client Data Grid &rarr;
          </div>
        </div>

        {/* Metric 4: Active Customers */}
        <div 
          onClick={() => onNavigateView('clients')}
          className="crm-metric-box"
          style={{ background: 'var(--bg-card)', padding: '1.2rem', borderRadius: '14px', border: '1px solid var(--border-subtle)', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)' }}>Active Policyholders</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#16a34a', marginTop: '0.4rem' }}>
            {data.activeCustomers}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 700, marginTop: '0.2rem' }}>
            Retained Clients &rarr;
          </div>
        </div>

        {/* Metric 5: Calls Today */}
        <div 
          onClick={() => onNavigateView('agenda')}
          className="crm-metric-box"
          style={{ background: 'var(--bg-card)', padding: '1.2rem', borderRadius: '14px', border: '1px solid var(--border-subtle)', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)' }}>Calls Made Today</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#ffedd5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ea580c' }}>
              <PhoneCall size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-navy)', marginTop: '0.4rem' }}>
            {data.callsToday}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#ea580c', fontWeight: 700, marginTop: '0.2rem' }}>
            Org Daily Activity &rarr;
          </div>
        </div>

        {/* Metric 6: Meetings Today */}
        <div 
          onClick={() => onNavigateView('meetings')}
          className="crm-metric-box"
          style={{ background: 'var(--bg-card)', padding: '1.2rem', borderRadius: '14px', border: '1px solid var(--border-subtle)', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)' }}>Meetings Today</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c3aed' }}>
              <Calendar size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-navy)', marginTop: '0.4rem' }}>
            {data.meetingsToday}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#7c3aed', fontWeight: 700, marginTop: '0.2rem' }}>
            Video Meets &rarr;
          </div>
        </div>

        {/* Metric 7: Overdue SLA */}
        <div 
          onClick={() => onNavigateView('agenda')}
          className="crm-metric-box"
          style={{ 
            background: data.overdueFollowups > 0 ? '#fef2f2' : 'var(--bg-card)', 
            padding: '1.2rem', 
            borderRadius: '14px', 
            border: data.overdueFollowups > 0 ? '1px solid #fecaca' : '1px solid var(--border-subtle)', 
            cursor: 'pointer' 
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: data.overdueFollowups > 0 ? '#dc2626' : 'var(--text-muted)' }}>
              Overdue SLA
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: data.overdueFollowups > 0 ? '#fee2e2' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626' }}>
              <AlertTriangle size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: data.overdueFollowups > 0 ? '#dc2626' : 'var(--primary-navy)', marginTop: '0.4rem' }}>
            {data.overdueFollowups}
          </div>
          <div style={{ fontSize: '0.72rem', color: data.overdueFollowups > 0 ? '#dc2626' : '#64748b', fontWeight: 700, marginTop: '0.2rem' }}>
            {data.overdueFollowups > 0 ? 'Escalated Breaches' : 'Clean Compliance'} &rarr;
          </div>
        </div>

        {/* Metric 8: Quotations Generated */}
        <div 
          onClick={() => onNavigateView('pipeline')}
          className="crm-metric-box"
          style={{ background: 'var(--bg-card)', padding: '1.2rem', borderRadius: '14px', border: '1px solid var(--border-subtle)', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)' }}>Quotes Generated</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#fce7f3', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#db2777' }}>
              <FileText size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-navy)', marginTop: '0.4rem' }}>
            {data.quotationsGenerated}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#db2777', fontWeight: 700, marginTop: '0.2rem' }}>
            Proposals Sent &rarr;
          </div>
        </div>

        {/* Metric 9: Policies Sold & GWP */}
        <div 
          onClick={() => onNavigateView('pipeline')}
          className="crm-metric-box"
          style={{ background: 'var(--bg-card)', padding: '1.2rem', borderRadius: '14px', border: '1px solid var(--border-subtle)', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)' }}>Policies Sold & GWP</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
              <Award size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#d97706', marginTop: '0.4rem' }}>
            {data.policiesSold} <span style={{ fontSize: '0.9rem', color: 'var(--primary-navy)' }}>({data.overallConversionRate}%)</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 800, marginTop: '0.2rem' }}>
            {formatCurrency(data.totalGwpGenerated)} GWP
          </div>
        </div>
      </div>

      {/* 3. Deep Analytical Section: Manager Performance Leaderboard */}
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
              <Building2 size={18} color="#2563eb" /> Branch & Manager Performance Leaderboard
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '3px 0 0 0' }}>
              Comparative output across branch offices, team sizes, conversion rates, and gross written premiums.
            </p>
          </div>
          <button
            onClick={() => onNavigateView('users')}
            style={{ background: 'none', border: 'none', color: 'var(--primary-navy)', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
          >
            Manage Branches &rarr;
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--bg-main)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.04em' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Manager & Branch</th>
                <th style={{ padding: '0.75rem 0.75rem', textAlign: 'center' }}>Team Size</th>
                <th style={{ padding: '0.75rem 0.75rem', textAlign: 'center' }}>Leads</th>
                <th style={{ padding: '0.75rem 0.75rem', textAlign: 'center' }}>Calls Today</th>
                <th style={{ padding: '0.75rem 0.75rem', textAlign: 'center' }}>Overdue SLA</th>
                <th style={{ padding: '0.75rem 0.75rem', textAlign: 'center' }}>Sold</th>
                <th style={{ padding: '0.75rem 0.75rem', textAlign: 'center' }}>Conversion %</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Total Premium</th>
              </tr>
            </thead>
            <tbody>
              {data.managerPerformance && data.managerPerformance.length > 0 ? (
                data.managerPerformance.map((mgr, idx) => (
                  <tr key={mgr.managerId || idx} style={{ borderBottom: '1px solid var(--border-subtle)' }} className="crm-table-row">
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
                          {mgr.managerName ? mgr.managerName.charAt(0).toUpperCase() : 'M'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--primary-navy)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <span>{mgr.managerName}</span>
                            {idx === 0 && <span title="Top Branch">🏆</span>}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            {mgr.branch} • {mgr.department}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center', fontWeight: 700, color: 'var(--primary-navy)' }}>
                      {mgr.teamSize} Advisors
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center', fontWeight: 600 }}>
                      {mgr.totalLeads}
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>
                      <span style={{ background: '#ffedd5', color: '#ea580c', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: 700, fontSize: '0.75rem' }}>
                        {mgr.callsToday}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>
                      {mgr.overdueFollowups > 0 ? (
                        <span style={{ background: '#fee2e2', color: '#dc2626', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: 800, fontSize: '0.75rem' }}>
                          ⚠️ {mgr.overdueFollowups}
                        </span>
                      ) : (
                        <span style={{ color: '#16a34a', fontSize: '0.75rem', fontWeight: 700 }}>0</span>
                      )}
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center', fontWeight: 800, color: '#16a34a' }}>
                      {mgr.policiesSold}
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center', fontWeight: 800, color: 'var(--primary-navy)' }}>
                      {mgr.conversionRate}%
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: 800, color: '#16a34a' }}>
                      {formatCurrency(mgr.totalPremiumVolume)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No branch managers currently configured.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Multi-Dimensional Performance Grid (Lead Sources + Product Categories + Monthly Trend) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        
        {/* Panel 1: Lead Source Performance */}
        <div style={{ background: 'var(--bg-card)', borderRadius: '16px', padding: '1.4rem', border: '1px solid var(--border-subtle)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--primary-navy)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Globe size={16} color="#0284c7" /> Lead Source Performance
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>By Acquisition Channel</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {data.leadSourcePerformance && data.leadSourcePerformance.map((src, idx) => (
              <div key={src.sourceKey || idx} style={{ background: 'var(--bg-main)', padding: '0.75rem 0.9rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-main)' }}>{src.sourceLabel}</span>
                  <span style={{ fontWeight: 800, fontSize: '0.8rem', color: '#16a34a' }}>{src.conversionRate}% Conv</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  <span>{src.leadCount} Inquiries ({src.percentageShare}%)</span>
                  <span style={{ fontWeight: 700, color: 'var(--primary-navy)' }}>{formatCurrency(src.totalPremium)}</span>
                </div>
                <div style={{ width: '100%', height: '5px', background: '#e2e8f0', borderRadius: '3px', marginTop: '0.4rem', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(src.percentageShare * 2, 100)}%`, height: '100%', background: '#0284c7', borderRadius: '3px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Panel 2: Insurance Product Performance */}
        <div style={{ background: 'var(--bg-card)', borderRadius: '16px', padding: '1.4rem', border: '1px solid var(--border-subtle)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--primary-navy)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <PieChart size={16} color="#7c3aed" /> Insurance Product Verticals
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Volume & Conversion</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {data.productPerformance && data.productPerformance.map((prod, idx) => (
              <div key={prod.productCategory || idx} style={{ background: 'var(--bg-main)', padding: '0.75rem 0.9rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-main)' }}>{prod.productCategory}</span>
                  <span style={{ fontWeight: 800, fontSize: '0.8rem', color: '#7c3aed' }}>{prod.policiesSold} Sold</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  <span>{prod.leadCount} Inquiries ({prod.percentageShare}%)</span>
                  <span style={{ fontWeight: 700, color: 'var(--primary-navy)' }}>{formatCurrency(prod.totalPremium)}</span>
                </div>
                <div style={{ width: '100%', height: '5px', background: '#e2e8f0', borderRadius: '3px', marginTop: '0.4rem', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(prod.percentageShare * 2, 100)}%`, height: '100%', background: '#7c3aed', borderRadius: '3px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Panel 3: Monthly Conversion Trend */}
        <div style={{ background: 'var(--bg-card)', borderRadius: '16px', padding: '1.4rem', border: '1px solid var(--border-subtle)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--primary-navy)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <BarChart3 size={16} color="#d97706" /> 6-Month Rolling Revenue Trend
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>GWP Growth</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {data.monthlyConversionTrend && data.monthlyConversionTrend.map((trend, idx) => (
              <div key={trend.month || idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.55rem 0.75rem', background: 'var(--bg-main)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--primary-navy)' }}>{trend.month}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{trend.newLeads} Leads • {trend.policiesSold} Sold ({trend.conversionRate}%)</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#16a34a' }}>{formatCurrency(trend.grossWrittenPremium)}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>GWP Volume</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 5. Enterprise Sandbox & Realistic Demo Data Control Center */}
      <div style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        borderRadius: '16px',
        padding: '1.5rem 1.75rem',
        border: '1.5px solid #e2e8f0',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.25rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', maxWidth: '650px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#16a34a',
            flexShrink: 0
          }}>
            <Sparkles size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f2b48' }}>
                Enterprise Sandbox & Realistic Demo Dataset Engine
              </h3>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, background: '#dbeafe', color: '#1d4ed8', padding: '2px 8px', borderRadius: '12px' }}>
                SUPER ADMIN
              </span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
              Seed high-fidelity client pipelines across Health, Term Life, Motor, and Corporate SME with quotations, KYC documents, call history, and manager approvals. Purge sample records anytime with 1-click.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            onClick={async () => {
              if (window.confirm('Are you sure you want to load realistic demo data? This will safely populate leads, comparative quotations, KYC documents, and manager approvals.')) {
                try {
                  const res = await crmService.seedDemoData();
                  alert(res.message || 'Realistic demo data loaded successfully!');
                  if (onRefresh) onRefresh();
                } catch (err) {
                  alert('Error seeding demo data: ' + (err.response?.data?.message || err.message));
                }
              }
            }}
            style={{
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '0.65rem 1.15rem',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.84rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 10px rgba(5, 150, 105, 0.25)',
              transition: 'all 0.15s ease'
            }}
          >
            <Sparkles size={15} /> Load Realistic Demo Dataset
          </button>

          <button
            onClick={async () => {
              if (window.confirm('CAUTION: Are you sure you want to PURGE ALL DEMO DATA? This will remove all sample leads, quotations, approvals, call logs, and documents while preserving your administrative accounts.')) {
                try {
                  const res = await crmService.purgeDemoData();
                  alert(res.message || 'All sample data purged cleanly!');
                  if (onRefresh) onRefresh();
                } catch (err) {
                  alert('Error purging demo data: ' + (err.response?.data?.message || err.message));
                }
              }
            }}
            style={{
              background: '#fee2e2',
              color: '#dc2626',
              border: '1px solid #fecaca',
              padding: '0.65rem 1.15rem',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.84rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
          >
            <AlertTriangle size={15} /> Clear All Demo Data
          </button>
        </div>
      </div>

    </div>
  );
}
