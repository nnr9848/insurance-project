import React, { useState, useEffect } from 'react';
import { 
  Award, 
  TrendingUp, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Plus, 
  ShieldCheck, 
  User, 
  Phone, 
  Mail, 
  Building2, 
  RefreshCw,
  Search,
  ExternalLink,
  ChevronRight,
  Filter,
  CreditCard,
  Percent,
  AlertCircle
} from 'lucide-react';
import { pospService } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function PospPartnerPortalView({ user, initialTab = 'overview' }) {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    profile: null,
    totalGrossPremium: 0,
    totalEarnings: 0,
    totalPaid: 0,
    pendingPayout: 0,
    policiesSoldCount: 0,
    attributedClientsCount: 0,
    recentCommissions: []
  });
  const [commissions, setCommissions] = useState([]);
  const [clients, setClients] = useState([]);
  const [activeTab, setActiveTab] = useState(initialTab); // 'overview' | 'commissions' | 'clients' | 'calculator'

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  
  // Quick Policy Booking Modal
  const [showBookModal, setShowBookModal] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookForm, setBookForm] = useState({
    clientName: '',
    phoneNumber: '',
    email: '',
    insurerName: 'HDFC ERGO General Insurance',
    productType: 'MOTOR',
    grossPremium: '',
    commissionRatePercent: '15.00',
    policyNumber: ''
  });

  // Calculator State
  const [calcPremium, setCalcPremium] = useState(25000);
  const [calcRate, setCalcRate] = useState(15);

  const loadPortalData = async () => {
    setLoading(true);
    try {
      const [dashData, commList, clientList] = await Promise.all([
        pospService.getDashboard().catch(() => null),
        pospService.getCommissions().catch(() => []),
        pospService.getClients().catch(() => [])
      ]);

      if (dashData) {
        setData(dashData);
      }
      setCommissions(commList || []);
      setClients(clientList || []);
    } catch (err) {
      console.error('Failed to load POSP partner data', err);
      toast?.show('Failed to load partner ledger data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPortalData();
  }, []);

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    if (!bookForm.clientName || !bookForm.phoneNumber || !bookForm.grossPremium) {
      toast?.show('Please fill all required policy booking details', 'warning');
      return;
    }

    setBookingLoading(true);
    try {
      await pospService.bookPolicy({
        ...bookForm,
        grossPremium: parseFloat(bookForm.grossPremium),
        commissionRatePercent: parseFloat(bookForm.commissionRatePercent || 15)
      });
      toast?.show('Policy booked successfully! Commission recorded in ledger.', 'success');
      setShowBookModal(false);
      setBookForm({
        clientName: '',
        phoneNumber: '',
        email: '',
        insurerName: 'HDFC ERGO General Insurance',
        productType: 'MOTOR',
        grossPremium: '',
        commissionRatePercent: '15.00',
        policyNumber: ''
      });
      loadPortalData();
    } catch (err) {
      console.error('Booking failed', err);
      toast?.show('Failed to book policy. Please verify details.', 'error');
    } finally {
      setBookingLoading(false);
    }
  };

  const calculatedCommission = ((calcPremium * calcRate) / 100);
  const calculatedTds = calculatedCommission * 0.05;
  const calculatedNet = calculatedCommission - calculatedTds;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2.5rem' }}>
      
      {/* 1. POSP ACCREDITED PARTNER HERO IDENTITY CARD */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary-navy) 0%, #1e3a5f 100%)',
        borderRadius: '16px',
        padding: '1.75rem 2rem',
        color: '#ffffff',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1.5rem',
        boxShadow: '0 8px 24px rgba(15, 43, 72, 0.18)',
        border: '1.5px solid rgba(245, 158, 11, 0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.25) 0%, rgba(245, 158, 11, 0.1) 100%)',
            border: '2px solid var(--accent-gold)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-gold)'
          }}>
            <Award size={36} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, margin: 0, letterSpacing: '-0.3px', color: '#ffffff' }}>
                {user?.fullName || data.agentName || 'POSP Partner'}
              </h2>
              <span style={{
                background: 'rgba(16, 185, 129, 0.2)',
                color: '#34d399',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                padding: '0.2rem 0.6rem',
                borderRadius: '20px',
                fontSize: '0.72rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}>
                <CheckCircle2 size={12} /> IRDAI Certified POSP
              </span>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.8)', marginTop: '0.35rem', display: 'flex', flexWrap: 'wrap', gap: '1.25rem' }}>
              <span>Cert No: <strong style={{ color: 'var(--accent-gold)' }}>{data.profile?.certificateNumber || 'POSP-2026-AR-8891'}</strong></span>
              <span>IRDAI Lic: <strong style={{ color: '#ffffff' }}>{data.profile?.irdaiLicenseCode || 'IRDAI/IMF/POSP-4402'}</strong></span>
              <span>Training: <strong style={{ color: '#34d399' }}>{data.profile?.trainingCompleted ? 'Completed (15 Hrs)' : 'Certified'}</strong></span>
              <span>Default Payout: <strong style={{ color: 'var(--accent-gold)' }}>{data.profile?.defaultCommissionRate || 15}%</strong></span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => setShowBookModal(true)}
            style={{
              background: 'var(--accent-gold)',
              color: 'var(--primary-navy)',
              border: 'none',
              borderRadius: '10px',
              padding: '0.75rem 1.25rem',
              fontWeight: 800,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.35)',
              transition: 'transform 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <Plus size={18} strokeWidth={2.5} />
            <span>Book New Policy</span>
          </button>
          <button
            onClick={loadPortalData}
            title="Refresh Data"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '10px',
              padding: '0.75rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* 2. FINANCIAL REVENUE & PERFORMANCE METRICS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        
        {/* Metric 1: Total Earnings */}
        <div style={{
          background: 'var(--crm-bg-card)',
          borderRadius: '12px',
          padding: '1.25rem',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Commission</span>
            <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.12)', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.5rem' }}>
            ₹{Number(data.totalEarnings || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600, marginTop: '0.25rem' }}>
            Cumulative gross payout accrued
          </div>
        </div>

        {/* Metric 2: Net Paid Out */}
        <div style={{
          background: 'var(--crm-bg-card)',
          borderRadius: '12px',
          padding: '1.25rem',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Disbursed to Bank</span>
            <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'rgba(37, 99, 235, 0.12)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CreditCard size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#2563eb', marginTop: '0.5rem' }}>
            ₹{Number(data.totalPaid || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '0.25rem' }}>
            NEFT / IMPS settlements completed
          </div>
        </div>

        {/* Metric 3: Pending Payout */}
        <div style={{
          background: 'var(--crm-bg-card)',
          borderRadius: '12px',
          padding: '1.25rem',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pending Settlement</span>
            <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.12)', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#d97706', marginTop: '0.5rem' }}>
            ₹{Number(data.pendingPayout || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#d97706', fontWeight: 600, marginTop: '0.25rem' }}>
            Scheduled on next payout cycle
          </div>
        </div>

        {/* Metric 4: Total Gross Premium */}
        <div style={{
          background: 'var(--crm-bg-card)',
          borderRadius: '12px',
          padding: '1.25rem',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Gross Premium</span>
            <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'rgba(100, 116, 139, 0.12)', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.5rem' }}>
            ₹{Number(data.totalGrossPremium || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '0.25rem' }}>
            {data.policiesSoldCount || 0} policies issued across insurers
          </div>
        </div>

      </div>

      {/* 3. TAB NAVIGATION */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.25rem' }}>
        {[
          { id: 'overview', label: 'Overview & Ledger' },
          { id: 'clients', label: `My Client Book (${clients.length})` },
          { id: 'calculator', label: 'Commission Calculator' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.65rem 1.25rem',
              borderRadius: '8px 8px 0 0',
              border: 'none',
              background: activeTab === tab.id ? 'var(--crm-bg-card)' : 'transparent',
              borderBottom: activeTab === tab.id ? '3px solid var(--accent-gold)' : '3px solid transparent',
              color: activeTab === tab.id ? 'var(--primary-navy)' : 'var(--text-muted)',
              fontWeight: activeTab === tab.id ? 800 : 600,
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 4. TAB CONTENT PANELS */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Commission Ledger Table */}
          <div style={{
            background: 'var(--crm-bg-card)',
            borderRadius: '12px',
            border: '1px solid var(--border-subtle)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                  Commission Payout Ledger
                </h3>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Direct attribution of all policies booked under your POSP license.
                </p>
              </div>
              <button
                onClick={() => setShowBookModal(true)}
                style={{
                  background: 'var(--primary-navy)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.5rem 0.9rem',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <Plus size={14} /> Add Policy Record
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Policy / Insurer</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Client</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Product</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Gross Premium</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Comm %</th>
                    <th style={{ padding: '0.85rem 1rem' }}>TDS (5%)</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Net Payout</th>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {commissions.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <FileText size={36} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
                        <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>No policy commissions recorded yet</div>
                        <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Click "Book New Policy" above to log your first client conversion.</div>
                      </td>
                    </tr>
                  ) : (
                    commissions.map((comm) => (
                      <tr key={comm.id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.15s ease' }}>
                        <td style={{ padding: '0.9rem 1.25rem' }}>
                          <div style={{ fontWeight: 800, color: 'var(--primary-navy)' }}>{comm.policyNumber || 'POL-PENDING'}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{comm.insurerName}</div>
                        </td>
                        <td style={{ padding: '0.9rem 1rem' }}>
                          <div style={{ fontWeight: 700 }}>{comm.client?.fullName || 'Direct Client'}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{comm.client?.phoneNumber}</div>
                        </td>
                        <td style={{ padding: '0.9rem 1rem' }}>
                          <span style={{
                            padding: '0.2rem 0.55rem',
                            borderRadius: '4px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            background: comm.productType === 'HEALTH' ? '#eff6ff' : comm.productType === 'MOTOR' ? '#f0fdf4' : '#faf5ff',
                            color: comm.productType === 'HEALTH' ? '#2563eb' : comm.productType === 'MOTOR' ? '#16a34a' : '#9333ea'
                          }}>
                            {comm.productType}
                          </span>
                        </td>
                        <td style={{ padding: '0.9rem 1rem', fontWeight: 700 }}>
                          ₹{Number(comm.grossPremium).toLocaleString('en-IN')}
                        </td>
                        <td style={{ padding: '0.9rem 1rem', color: '#059669', fontWeight: 700 }}>
                          {comm.commissionRatePercent}%
                        </td>
                        <td style={{ padding: '0.9rem 1rem', color: 'var(--text-muted)' }}>
                          ₹{Number(comm.tdsDeducted || 0).toLocaleString('en-IN')}
                        </td>
                        <td style={{ padding: '0.9rem 1rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                          ₹{Number(comm.netPayout).toLocaleString('en-IN')}
                        </td>
                        <td style={{ padding: '0.9rem 1.25rem' }}>
                          <span style={{
                            padding: '0.25rem 0.65rem',
                            borderRadius: '20px',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            background: comm.payoutStatus === 'PAID' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                            color: comm.payoutStatus === 'PAID' ? '#059669' : '#d97706',
                            border: `1px solid ${comm.payoutStatus === 'PAID' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
                          }}>
                            {comm.payoutStatus === 'PAID' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                            {comm.payoutStatus}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* POSP Regulatory Guidelines Note */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '1.25rem',
            display: 'flex',
            gap: '1rem',
            alignItems: 'flex-start'
          }}>
            <ShieldCheck size={24} color="#0284c7" style={{ minWidth: '24px', marginTop: '2px' }} />
            <div style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.5 }}>
              <strong style={{ color: 'var(--primary-navy)' }}>IRDAI Point of Sales Person (POSP) Compliance Notice:</strong> As an accredited POSP agent of Aadhiraksha IMF Private Limited, you are authorized to solicit and market pre-underwritten insurance products across all partnered Life, General, and Health Insurance companies. All payouts are disbursed directly to your registered bank account after standard 5% Section 194H TDS deduction.
            </div>
          </div>

        </div>
      )}

      {/* 5. TAB: CLIENT BOOK */}
      {activeTab === 'clients' && (
        <div style={{
          background: 'var(--crm-bg-card)',
          borderRadius: '12px',
          border: '1px solid var(--border-subtle)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                Attributed Client Portfolio
              </h3>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Clients acquired and serviced under your POSP partnership.
              </p>
            </div>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Total: <strong>{clients.length} Clients</strong>
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Client Code & Name</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Contact</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Insurance Line</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Active Insurer</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Premium Booked</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Current Stage</th>
                </tr>
              </thead>
              <tbody>
                {clients.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      <User size={36} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
                      <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>No clients mapped to your account yet</div>
                      <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>When you book a policy, the client will automatically be listed here.</div>
                    </td>
                  </tr>
                ) : (
                  clients.map(client => (
                    <tr key={client.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '0.9rem 1.25rem' }}>
                        <div style={{ fontWeight: 800, color: 'var(--primary-navy)' }}>{client.fullName}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{client.clientCode}</div>
                      </td>
                      <td style={{ padding: '0.9rem 1rem' }}>
                        <div>{client.phoneNumber}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{client.email || '—'}</div>
                      </td>
                      <td style={{ padding: '0.9rem 1rem' }}>
                        <span style={{ fontWeight: 600 }}>{client.insuranceType || 'GENERAL'}</span>
                      </td>
                      <td style={{ padding: '0.9rem 1rem', color: 'var(--text-muted)' }}>
                        {client.existingInsurer || 'Direct'}
                      </td>
                      <td style={{ padding: '0.9rem 1rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                        ₹{Number(client.estimatedPremium || 0).toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '0.9rem 1.25rem' }}>
                        <span style={{
                          padding: '0.2rem 0.55rem',
                          borderRadius: '12px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          background: 'rgba(16, 185, 129, 0.12)',
                          color: '#059669'
                        }}>
                          {client.stage || 'POLICY_ISSUED'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. TAB: COMMISSION ESTIMATOR */}
      {activeTab === 'calculator' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem'
        }}>
          {/* Inputs */}
          <div style={{
            background: 'var(--crm-bg-card)',
            borderRadius: '12px',
            border: '1px solid var(--border-subtle)',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <h3 style={{ margin: '0 0 1.25rem', fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
              Quick Commission Estimator
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  Gross Premium (₹)
                </label>
                <input
                  type="number"
                  value={calcPremium}
                  onChange={(e) => setCalcPremium(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '1rem',
                    fontWeight: 700,
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  Commission Rate (%): {calcRate}%
                </label>
                <input
                  type="range"
                  min="5"
                  max="25"
                  step="0.5"
                  value={calcRate}
                  onChange={(e) => setCalcRate(Number(e.target.value))}
                  style={{ width: '100%' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  <span>5% (Term/Life)</span>
                  <span>15% (Motor/Health Standard)</span>
                  <span>25% (High Margin)</span>
                </div>
              </div>

              <div style={{
                background: '#f8fafc',
                borderRadius: '8px',
                padding: '1rem',
                border: '1px solid #e2e8f0',
                fontSize: '0.8rem',
                color: '#475569'
              }}>
                <strong>IRDAI IMF POSP Advantage:</strong> Unlike a single tied insurance agent who can only sell one company's policy, you earn standard top-tier commissions across all leading insurers: Star Health, HDFC ERGO, ICICI Lombard, Tata AIG, Care, and Bajaj Allianz.
              </div>
            </div>
          </div>

          {/* Breakdown Card */}
          <div style={{
            background: 'linear-gradient(135deg, var(--primary-navy) 0%, #1e3a5f 100%)',
            borderRadius: '12px',
            padding: '1.75rem',
            color: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 8px 24px rgba(15, 43, 72, 0.15)'
          }}>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--accent-gold)' }}>
                Payout Calculation Summary
              </div>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, marginTop: '0.5rem', color: '#ffffff' }}>
                ₹{calculatedNet.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.8)' }}>
                Estimated Net Cash Credit to Bank
              </div>

              <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.15)', paddingTop: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Gross Commission ({calcRate}%)</span>
                  <span style={{ fontWeight: 700 }}>₹{calculatedCommission.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>TDS Deducted (Sec 194H @ 5%)</span>
                  <span style={{ fontWeight: 700, color: '#f87171' }}>- ₹{calculatedTds.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', fontWeight: 800, borderTop: '1px solid rgba(255, 255, 255, 0.15)', paddingTop: '0.5rem' }}>
                  <span style={{ color: 'var(--accent-gold)' }}>Net Take-Home Pay</span>
                  <span style={{ color: 'var(--accent-gold)' }}>₹{calculatedNet.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setBookForm(prev => ({ ...prev, grossPremium: calcPremium, commissionRatePercent: calcRate }));
                setShowBookModal(true);
              }}
              style={{
                marginTop: '1.5rem',
                background: 'var(--accent-gold)',
                color: 'var(--primary-navy)',
                border: 'none',
                borderRadius: '8px',
                padding: '0.85rem',
                fontWeight: 800,
                fontSize: '0.9rem',
                cursor: 'pointer',
                textAlign: 'center'
              }}
            >
              Book Policy with This Calculation →
            </button>
          </div>
        </div>
      )}

      {/* 7. QUICK POLICY BOOKING MODAL */}
      {showBookModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'none',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            background: 'var(--crm-bg-card)',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '540px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: 'var(--shadow-xl)',
            border: '1px solid var(--border-subtle)',
            padding: '1.75rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                  Record Policy & Book Commission
                </h3>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Attributed under your POSP certification code.
                </p>
              </div>
              <button
                onClick={() => setShowBookModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: 'var(--text-muted)' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBookSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                  Client Full Name *
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  value={bookForm.clientName}
                  onChange={(e) => setBookForm({ ...bookForm, clientName: e.target.value })}
                  style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                    Phone Number *
                  </label>
                  <input
                    required
                    type="tel"
                    placeholder="10-digit Mobile"
                    value={bookForm.phoneNumber}
                    onChange={(e) => setBookForm({ ...bookForm, phoneNumber: e.target.value })}
                    style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="client@gmail.com"
                    value={bookForm.email}
                    onChange={(e) => setBookForm({ ...bookForm, email: e.target.value })}
                    style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                    Insurance Company *
                  </label>
                  <select
                    value={bookForm.insurerName}
                    onChange={(e) => setBookForm({ ...bookForm, insurerName: e.target.value })}
                    style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', boxSizing: 'border-box' }}
                  >
                    <option value="HDFC ERGO General Insurance">HDFC ERGO</option>
                    <option value="Star Health and Allied Insurance">Star Health</option>
                    <option value="ICICI Lombard General Insurance">ICICI Lombard</option>
                    <option value="Care Health Insurance">Care Health</option>
                    <option value="Tata AIG General Insurance">Tata AIG</option>
                    <option value="Bajaj Allianz General Insurance">Bajaj Allianz</option>
                    <option value="Niva Bupa Health Insurance">Niva Bupa</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                    Product Line *
                  </label>
                  <select
                    value={bookForm.productType}
                    onChange={(e) => setBookForm({ ...bookForm, productType: e.target.value })}
                    style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', boxSizing: 'border-box' }}
                  >
                    <option value="MOTOR">Motor (Car/Bike)</option>
                    <option value="HEALTH">Health Comprehensive</option>
                    <option value="LIFE">Term Life / Savings</option>
                    <option value="COMMERCIAL">Commercial / SME</option>
                    <option value="TRAVEL">Travel Insurance</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                    Gross Premium (₹) *
                  </label>
                  <input
                    required
                    type="number"
                    placeholder="e.g. 18500"
                    value={bookForm.grossPremium}
                    onChange={(e) => setBookForm({ ...bookForm, grossPremium: e.target.value })}
                    style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                    Commission Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={bookForm.commissionRatePercent}
                    onChange={(e) => setBookForm({ ...bookForm, commissionRatePercent: e.target.value })}
                    style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                  Policy Number / Cover Note No
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2311-2099-8812 (Optional)"
                  value={bookForm.policyNumber}
                  onChange={(e) => setBookForm({ ...bookForm, policyNumber: e.target.value })}
                  style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowBookModal(false)}
                  style={{
                    padding: '0.7rem 1.25rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    background: '#ffffff',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bookingLoading}
                  style={{
                    padding: '0.7rem 1.5rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'var(--primary-navy)',
                    color: '#ffffff',
                    cursor: 'pointer',
                    fontWeight: 800
                  }}
                >
                  {bookingLoading ? 'Recording...' : 'Book & Credit Ledger'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
