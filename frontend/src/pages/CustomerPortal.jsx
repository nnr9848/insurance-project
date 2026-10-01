import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  FileText, 
  Upload, 
  Download, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Phone, 
  Mail, 
  Calendar, 
  User, 
  Building2, 
  ShieldAlert, 
  RefreshCw, 
  ExternalLink,
  ChevronRight,
  Plus,
  HeartPulse,
  Car,
  FolderCheck,
  Check,
  X,
  CreditCard,
  FileCheck,
  Lock,
  Headphones,
  LifeBuoy,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { customerService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import WhatsAppIcon from '../components/common/WhatsAppIcon';
import { formatWhatsAppNumber } from '../utils/crmDeduplication';

export default function CustomerPortal() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    user: null,
    policies: [],
    documents: [],
    claims: [],
    assignedAdvisor: null
  });

  // Active view: 'policies' | 'vault' | 'claims' | 'profile'
  const [activeNav, setActiveNav] = useState('policies');

  // Document Upload Modal
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    documentType: 'AADHAAR',
    fileName: '',
    fileUrl: '',
    fileSizeBytes: 1200000,
    fileType: 'application/pdf'
  });

  const loadCustomerData = async () => {
    setLoading(true);
    try {
      const res = await customerService.getDashboard();
      setData(res || {
        user: null,
        policies: [],
        documents: [],
        claims: [],
        assignedAdvisor: null
      });
    } catch (err) {
      console.error('Failed to load customer portal data', err);
      toast?.show('Failed to sync customer account data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadCustomerData();
    }
  }, [isAuthenticated]);

  const handleDocumentSubmit = async (e) => {
    e.preventDefault();
    if (!uploadForm.fileName || !uploadForm.fileUrl) {
      toast?.show('Please enter file name and document link', 'warning');
      return;
    }

    setUploading(true);
    try {
      await customerService.uploadDocument(uploadForm);
      toast?.show('Document encrypted & saved to your vault!', 'success');
      setShowUploadModal(false);
      setUploadForm({
        documentType: 'AADHAAR',
        fileName: '',
        fileUrl: '',
        fileSizeBytes: 1200000,
        fileType: 'application/pdf'
      });
      loadCustomerData();
    } catch (err) {
      console.error('Upload error', err);
      toast?.show('Failed to save document. Please try again.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const getDocTypeBadge = (type) => {
    switch (type) {
      case 'AADHAAR': return { label: 'Aadhaar Card', bg: '#eff6ff', color: '#1d4ed8' };
      case 'PAN': return { label: 'PAN Card', bg: '#fef3c7', color: '#b45309' };
      case 'RC_BOOK': return { label: 'Vehicle RC', bg: '#f0fdf4', color: '#15803d' };
      case 'MEDICAL_RECORD': return { label: 'Medical History', bg: '#faf5ff', color: '#7e22ce' };
      case 'PREVIOUS_POLICY': return { label: 'Previous Policy', bg: '#fff7ed', color: '#c2410c' };
      default: return { label: type || 'Document', bg: '#f1f5f9', color: '#475569' };
    }
  };

  const getVerificationBadge = (status) => {
    switch (status) {
      case 'VERIFIED':
        return { label: 'Verified', bg: 'rgba(16, 185, 129, 0.12)', color: '#059669', icon: <CheckCircle2 size={13} /> };
      case 'REJECTED':
        return { label: 'Needs Resubmission', bg: 'rgba(239, 68, 68, 0.12)', color: '#dc2626', icon: <AlertCircle size={13} /> };
      default:
        return { label: 'Under Review', bg: 'rgba(245, 158, 11, 0.12)', color: '#d97706', icon: <Clock size={13} /> };
    }
  };

  const userName = user?.fullName || data.user?.fullName || 'Customer';
  const userInitials = userName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div style={{ background: '#f8fafc', minHeight: 'calc(100vh - 140px)', padding: '2rem 1rem 3rem' }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
        
        {/* TOP WELCOME BREADCRUMB STRIP */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#64748b' }}>
              <span>Home</span>
              <ChevronRight size={14} />
              <span>Customer Portal</span>
              <ChevronRight size={14} />
              <span style={{ color: 'var(--primary-navy)', fontWeight: 700 }}>
                {activeNav === 'policies' ? 'My Policies' : activeNav === 'vault' ? 'Digital Document Vault' : activeNav === 'claims' ? 'Claims Tracker' : 'Profile & Security'}
              </span>
            </div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary-navy)', margin: '0.35rem 0 0', letterSpacing: '-0.3px' }}>
              Welcome back, {userName.split(' ')[0]}
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={loadCustomerData}
              title="Refresh Account Data"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '0.5rem 0.85rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#475569',
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Sync</span>
            </button>
            <a
              href="/claim-support"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: '#dc2626',
                color: '#ffffff',
                textDecoration: 'none',
                borderRadius: '8px',
                padding: '0.5rem 1rem',
                fontSize: '0.8rem',
                fontWeight: 800,
                boxShadow: '0 2px 6px rgba(220, 38, 38, 0.25)'
              }}
            >
              <ShieldAlert size={15} /> Emergency Claim
            </a>
          </div>
        </div>

        {/* MAIN SPLIT WORKSPACE: CONSUMER SIDEBAR + CONTENT CANVAS */}
        <div style={{ display: 'grid', gridTemplateColumns: '280px minmax(0, 1fr)', gap: '1.75rem', alignItems: 'start' }} className="customer-portal-grid">
          
          {/* LEFT CONSUMER NAVIGATION HUB */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Identity Card */}
            <div style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '1.5rem',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, var(--primary-navy) 0%, #1e3a5f 100%)',
                  color: 'var(--accent-gold)',
                  fontWeight: 800,
                  fontSize: '1.2rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(15, 43, 72, 0.15)'
                }}>
                  {userInitials || 'U'}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontWeight: 800, color: 'var(--primary-navy)', fontSize: '1.05rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {userName}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {user?.email || data.user?.email || 'Customer'}
                  </div>
                </div>
              </div>

              <div style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: '8px',
                padding: '0.4rem 0.65rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#059669'
              }}>
                <ShieldCheck size={14} /> Verified Policyholder Account
              </div>
            </div>

            {/* Navigation Menu Pillars */}
            <div style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '0.75rem',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem'
            }}>
              {[
                { id: 'policies', label: 'My Policies', icon: <ShieldCheck size={18} />, count: data.policies?.length || 0, badgeColor: '#2563eb' },
                { id: 'vault', label: 'Document Vault', icon: <FolderCheck size={18} />, count: data.documents?.length || 0, badgeColor: '#059669' },
                { id: 'claims', label: 'Track Claims', icon: <ShieldAlert size={18} />, count: data.claims?.length || 0, badgeColor: '#d97706' },
                { id: 'profile', label: 'Profile & Security', icon: <User size={18} />, count: null }
              ].map(item => {
                const isActive = activeNav === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveNav(item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      borderRadius: '10px',
                      border: 'none',
                      background: isActive ? 'var(--primary-navy)' : 'transparent',
                      color: isActive ? '#ffffff' : '#334155',
                      fontWeight: isActive ? 800 : 600,
                      fontSize: '0.88rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ color: isActive ? 'var(--accent-gold)' : '#64748b' }}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </div>
                    {item.count !== null && (
                      <span style={{
                        padding: '0.15rem 0.5rem',
                        borderRadius: '999px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        background: isActive ? 'rgba(255,255,255,0.2)' : '#f1f5f9',
                        color: isActive ? '#ffffff' : '#475569'
                      }}>
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Dedicated In-House Advisor Support Card */}
            <div style={{
              background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
              borderRadius: '16px',
              border: '1px solid #bbf7d0',
              padding: '1.25rem',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#166534', fontWeight: 800, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <Headphones size={15} color="#059669" /> Personal Advisor
              </div>

              {data.assignedAdvisor ? (
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0f2b48' }}>
                    {data.assignedAdvisor.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600, marginTop: '2px' }}>
                    {data.assignedAdvisor.designation || 'Senior Insurance Advisor'}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
                    {data.assignedAdvisor.phoneNumber && (
                      <a
                        href={`https://wa.me/${formatWhatsAppNumber(data.assignedAdvisor.phoneNumber)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.4rem',
                          background: '#16a34a',
                          color: '#ffffff',
                          textDecoration: 'none',
                          padding: '0.55rem',
                          borderRadius: '8px',
                          fontSize: '0.78rem',
                          fontWeight: 700
                        }}
                      >
                        <WhatsAppIcon size={14} color="#ffffff" />
                        <span>Chat on WhatsApp</span>
                      </a>
                    )}
                    {data.assignedAdvisor.phoneNumber && (
                      <a
                        href={`tel:${data.assignedAdvisor.phoneNumber}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.4rem',
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          color: '#334155',
                          textDecoration: 'none',
                          padding: '0.55rem',
                          borderRadius: '8px',
                          fontSize: '0.78rem',
                          fontWeight: 700
                        }}
                      >
                        <Phone size={13} />
                        <span>Direct Call</span>
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f2b48' }}>
                    Aadhiraksha Concierge
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                    24/7 Dedicated Assistance
                  </div>
                  <div style={{ marginTop: '0.85rem' }}>
                    <a
                      href="tel:+919849012345"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem',
                        background: '#ffffff',
                        border: '1px solid #bbf7d0',
                        color: '#166534',
                        textDecoration: 'none',
                        padding: '0.55rem',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        fontWeight: 800
                      }}
                    >
                      <Phone size={13} /> +91 98490 12345
                    </a>
                  </div>
                </div>
              )}
            </div>

          </aside>

          {/* RIGHT DYNAMIC CONTENT CANVAS */}
          <main style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* KPI STATS ROW */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div 
                onClick={() => setActiveNav('policies')}
                style={{
                  background: '#ffffff',
                  borderRadius: '14px',
                  border: `1.5px solid ${activeNav === 'policies' ? 'var(--primary-navy)' : '#e2e8f0'}`,
                  padding: '1.25rem',
                  boxShadow: 'var(--shadow-xs)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b' }}>
                  <span style={{ fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase' }}>Active Coverage</span>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShieldCheck size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--primary-navy)', marginTop: '0.35rem' }}>
                  {data.policies?.length || 0}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>Cover notes & active plans</div>
              </div>

              <div 
                onClick={() => setActiveNav('vault')}
                style={{
                  background: '#ffffff',
                  borderRadius: '14px',
                  border: `1.5px solid ${activeNav === 'vault' ? '#059669' : '#e2e8f0'}`,
                  padding: '1.25rem',
                  boxShadow: 'var(--shadow-xs)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b' }}>
                  <span style={{ fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase' }}>Stored In Vault</span>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FolderCheck size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#059669', marginTop: '0.35rem' }}>
                  {data.documents?.length || 0}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>KYC, RC & policy PDFs</div>
              </div>

              <div 
                onClick={() => setActiveNav('claims')}
                style={{
                  background: '#ffffff',
                  borderRadius: '14px',
                  border: `1.5px solid ${activeNav === 'claims' ? '#d97706' : '#e2e8f0'}`,
                  padding: '1.25rem',
                  boxShadow: 'var(--shadow-xs)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b' }}>
                  <span style={{ fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase' }}>Active Claims</span>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShieldAlert size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#d97706', marginTop: '0.35rem' }}>
                  {data.claims?.length || 0}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>Fast-track cashless claims</div>
              </div>
            </div>

            {/* VIEW 1: MY POLICIES */}
            {activeNav === 'policies' && (
              <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-navy)', margin: 0 }}>
                      Insurance Policies & Cover Notes
                    </h2>
                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                      All current and past policies linked to your verified phone number.
                    </p>
                  </div>
                  <a
                    href="/insurance/health"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      background: 'var(--primary-navy)',
                      color: '#ffffff',
                      textDecoration: 'none',
                      padding: '0.5rem 0.9rem',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: 700
                    }}
                  >
                    <Plus size={14} /> Buy / Port Policy
                  </a>
                </div>

                {data.policies?.length === 0 ? (
                  <div style={{
                    background: '#f8fafc',
                    borderRadius: '14px',
                    border: '1.5px dashed #cbd5e1',
                    padding: '3.5rem 2rem',
                    textAlign: 'center',
                    color: '#64748b'
                  }}>
                    <div style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      background: '#eff6ff',
                      color: '#2563eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 1.25rem'
                    }}>
                      <ShieldCheck size={32} />
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                      No Insurance Policies Linked Yet
                    </h3>
                    <p style={{ margin: '0.4rem auto 1.5rem', fontSize: '0.85rem', color: '#64748b', maxWidth: '440px', lineHeight: 1.5 }}>
                      When you purchase or renew a policy through Aadhiraksha, it will automatically appear here with your policy schedule, coverage specs, and 1-click renewal.
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <a
                        href="/insurance/health"
                        style={{
                          background: 'var(--primary-navy)',
                          color: '#ffffff',
                          textDecoration: 'none',
                          padding: '0.65rem 1.25rem',
                          borderRadius: '8px',
                          fontWeight: 800,
                          fontSize: '0.85rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem'
                        }}
                      >
                        <HeartPulse size={15} /> Compare Health Insurance
                      </a>
                      <a
                        href="/insurance/motor"
                        style={{
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          color: '#334155',
                          textDecoration: 'none',
                          padding: '0.65rem 1.25rem',
                          borderRadius: '8px',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem'
                        }}
                      >
                        <Car size={15} /> Instant Motor Quote
                      </a>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                    {data.policies.map(policy => (
                      <div key={policy.id} style={{
                        background: '#ffffff',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        padding: '1.25rem',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0284c7', background: '#e0f2fe', padding: '0.2rem 0.55rem', borderRadius: '6px' }}>
                              {policy.insuranceType || 'General Insurance'}
                            </span>
                            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#059669', background: 'rgba(16, 185, 129, 0.12)', padding: '0.2rem 0.55rem', borderRadius: '12px' }}>
                              Active Plan
                            </span>
                          </div>

                          <h4 style={{ margin: '0.75rem 0 0.2rem', fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                            {policy.existingInsurer || 'General Insurance Plan'}
                          </h4>
                          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                            Policy Ref: <strong style={{ color: 'var(--primary-navy)' }}>{policy.clientCode}</strong>
                          </div>

                          <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
                            <div>
                              <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700 }}>Sum Insured</div>
                              <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--primary-navy)' }}>{policy.sumInsured || '₹10 Lakhs'}</div>
                            </div>
                            <div>
                              <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700 }}>Premium</div>
                              <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#059669' }}>₹{Number(policy.estimatedPremium || 0).toLocaleString('en-IN')}</div>
                            </div>
                            <div>
                              <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700 }}>Renewal</div>
                              <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#d97706' }}>{policy.policyExpiryDate || 'Active'}</div>
                            </div>
                          </div>
                        </div>

                        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                          <a
                            href="/renewal-port"
                            style={{
                              flex: 1,
                              textAlign: 'center',
                              background: 'var(--primary-navy)',
                              color: '#ffffff',
                              textDecoration: 'none',
                              padding: '0.6rem',
                              borderRadius: '8px',
                              fontSize: '0.78rem',
                              fontWeight: 700
                            }}
                          >
                            1-Click Renew
                          </a>
                          <a
                            href="/claim-support"
                            style={{
                              flex: 1,
                              textAlign: 'center',
                              background: '#f1f5f9',
                              color: '#334155',
                              textDecoration: 'none',
                              padding: '0.6rem',
                              borderRadius: '8px',
                              fontSize: '0.78rem',
                              fontWeight: 700
                            }}
                          >
                            Claim Help
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* VIEW 2: DIGITAL DOCUMENT VAULT */}
            {activeNav === 'vault' && (
              <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-navy)', margin: 0 }}>
                      Digital KYC & Document Locker
                    </h2>
                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                      Secure cloud vault for your Aadhaar, PAN, vehicle RC, and previous policy schedules.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowUploadModal(true)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      background: 'var(--primary-navy)',
                      color: '#ffffff',
                      border: 'none',
                      padding: '0.5rem 0.9rem',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    <Upload size={14} /> Upload to Vault
                  </button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', color: '#64748b', borderBottom: '1px solid #e2e8f0', fontSize: '0.74rem', textTransform: 'uppercase' }}>
                        <th style={{ padding: '0.85rem 1rem' }}>Category</th>
                        <th style={{ padding: '0.85rem 1rem' }}>File Name</th>
                        <th style={{ padding: '0.85rem 1rem' }}>Uploaded Date</th>
                        <th style={{ padding: '0.85rem 1rem' }}>Verification</th>
                        <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.documents?.length === 0 ? (
                        <tr>
                          <td colSpan="5" style={{ padding: '3.5rem 1rem', textAlign: 'center', color: '#64748b' }}>
                            <FolderCheck size={40} color="#94a3b8" style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
                            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--primary-navy)' }}>Your document vault is currently empty</div>
                            <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Upload your Aadhaar or PAN card once for instant paperless claim verification.</div>
                            <button
                              onClick={() => setShowUploadModal(true)}
                              style={{
                                marginTop: '1rem',
                                background: '#f1f5f9',
                                border: '1px solid #cbd5e1',
                                padding: '0.5rem 1rem',
                                borderRadius: '8px',
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              + Upload First Document
                            </button>
                          </td>
                        </tr>
                      ) : (
                        data.documents.map(doc => {
                          const typeBadge = getDocTypeBadge(doc.documentType);
                          const verifyBadge = getVerificationBadge(doc.verificationStatus);
                          return (
                            <tr key={doc.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                              <td style={{ padding: '0.85rem 1rem' }}>
                                <span style={{
                                  padding: '0.2rem 0.55rem',
                                  borderRadius: '4px',
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  background: typeBadge.bg,
                                  color: typeBadge.color
                                }}>
                                  {typeBadge.label}
                                </span>
                              </td>
                              <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--primary-navy)' }}>
                                {doc.fileName}
                              </td>
                              <td style={{ padding: '0.85rem 1rem', color: '#64748b' }}>
                                {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString('en-IN') : 'Recent'}
                              </td>
                              <td style={{ padding: '0.85rem 1rem' }}>
                                <span style={{
                                  padding: '0.25rem 0.65rem',
                                  borderRadius: '20px',
                                  fontSize: '0.72rem',
                                  fontWeight: 800,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.35rem',
                                  background: verifyBadge.bg,
                                  color: verifyBadge.color
                                }}>
                                  {verifyBadge.icon} {verifyBadge.label}
                                </span>
                              </td>
                              <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                                <a
                                  href={doc.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.3rem',
                                    color: '#0284c7',
                                    textDecoration: 'none',
                                    fontWeight: 700,
                                    fontSize: '0.8rem'
                                  }}
                                >
                                  <Download size={13} /> View File
                                </a>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* VIEW 3: TRACK CLAIMS */}
            {activeNav === 'claims' && (
              <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-navy)', margin: 0 }}>
                      Claims Status & Intimation History
                    </h2>
                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                      Track cashless approvals and reimbursement milestones in real-time.
                    </p>
                  </div>
                  <a
                    href="/claim-support"
                    style={{
                      background: '#dc2626',
                      color: '#ffffff',
                      textDecoration: 'none',
                      borderRadius: '8px',
                      padding: '0.5rem 1rem',
                      fontSize: '0.8rem',
                      fontWeight: 800
                    }}
                  >
                    + Intimate New Claim
                  </a>
                </div>

                {data.claims?.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#64748b' }}>
                    <ShieldAlert size={42} color="#94a3b8" style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
                    <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--primary-navy)' }}>No Active or Past Claims Recorded</div>
                    <p style={{ fontSize: '0.82rem', marginTop: '0.35rem', maxWidth: '420px', margin: '0.35rem auto 1.25rem' }}>
                      In case of emergency hospitalization or vehicle accident, our dedicated on-ground desk ensures pre-authorization in 30 minutes.
                    </p>
                    <a
                      href="/claim-support"
                      style={{
                        background: '#f1f5f9',
                        border: '1px solid #cbd5e1',
                        color: '#334155',
                        textDecoration: 'none',
                        padding: '0.55rem 1.25rem',
                        borderRadius: '8px',
                        fontSize: '0.82rem',
                        fontWeight: 700
                      }}
                    >
                      Emergency Claim Guide
                    </a>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {data.claims.map(claim => (
                      <div key={claim.id} style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 800, color: 'var(--primary-navy)', fontSize: '1rem' }}>
                            {claim.claimType} Claim — Policy #{claim.policyNumber}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>
                            Facility: {claim.hospitalOrGarage || 'Empanelled Network Partner'} • Intimated: {claim.incidentDate || 'Recent'}
                          </div>
                        </div>
                        <span style={{
                          padding: '0.35rem 0.85rem',
                          borderRadius: '20px',
                          fontSize: '0.76rem',
                          fontWeight: 800,
                          background: claim.status === 'SETTLED' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                          color: claim.status === 'SETTLED' ? '#059669' : '#d97706'
                        }}>
                          {claim.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* VIEW 4: PROFILE & SECURITY */}
            {activeNav === 'profile' && (
              <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.75rem', boxShadow: 'var(--shadow-sm)' }}>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-navy)', margin: '0 0 1.25rem 0' }}>
                  Account Security & Verified Contact
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                      Registered Full Name
                    </label>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--primary-navy)' }}>
                      {userName}
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                      Verified Mobile Number
                    </label>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--primary-navy)' }}>
                      {user?.phoneNumber || data.user?.phoneNumber || '—'}
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                      Registered Email
                    </label>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--primary-navy)' }}>
                      {user?.email || data.user?.email || '—'}
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                      Authentication Standard
                    </label>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#059669', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Lock size={14} /> Encrypted JWT Session
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '1.75rem', padding: '1rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#64748b', lineHeight: 1.5 }}>
                  <strong style={{ color: 'var(--primary-navy)' }}>Data Privacy Guarantee:</strong> In compliance with IRDAI regulations and ISO/IEC 27001 data protection standards, your insurance policy details, Aadhaar/PAN files, and health records are encrypted at rest with AES-256 and only accessed during active claim settlement and policy issuance.
                </div>
              </div>
            )}

          </main>
        </div>

      </div>

      {/* DOCUMENT UPLOAD MODAL */}
      {showUploadModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'none',
          zIndex: 1100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '500px',
            boxShadow: 'var(--shadow-xl)',
            border: '1px solid #e2e8f0',
            padding: '1.75rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                  Upload to Digital Vault
                </h3>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                  Archived securely for your instant claim settlements.
                </p>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDocumentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.3rem' }}>
                  Document Category *
                </label>
                <select
                  value={uploadForm.documentType}
                  onChange={(e) => setUploadForm({ ...uploadForm, documentType: e.target.value })}
                  style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                >
                  <option value="AADHAAR">Aadhaar Card (Front/Back)</option>
                  <option value="PAN">PAN Card</option>
                  <option value="RC_BOOK">Vehicle RC Copy</option>
                  <option value="PREVIOUS_POLICY">Previous Policy Schedule</option>
                  <option value="MEDICAL_RECORD">Medical History / Lab Reports</option>
                  <option value="OTHER">Other Verification Document</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.3rem' }}>
                  Document Display Title *
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Aadhaar_Card_Self.pdf"
                  value={uploadForm.fileName}
                  onChange={(e) => setUploadForm({ ...uploadForm, fileName: e.target.value })}
                  style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.3rem' }}>
                  File Document URL / Cloud Link *
                </label>
                <input
                  required
                  type="url"
                  placeholder="https://storage.googleapis.com/... or cloud link"
                  value={uploadForm.fileUrl}
                  onChange={(e) => setUploadForm({ ...uploadForm, fileUrl: e.target.value })}
                  style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  style={{ padding: '0.7rem 1.25rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', cursor: 'pointer', fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  style={{ padding: '0.7rem 1.5rem', borderRadius: '8px', border: 'none', background: 'var(--primary-navy)', color: '#ffffff', cursor: 'pointer', fontWeight: 800 }}
                >
                  {uploading ? 'Encrypting...' : 'Save to Vault'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
