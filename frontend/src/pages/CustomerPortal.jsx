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
  X
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

  const [activeTab, setActiveTab] = useState('policies'); // 'policies' | 'vault' | 'claims'

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
      toast?.show('Document uploaded securely to your digital vault!', 'success');
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
      case 'MEDICAL_RECORD': return { label: 'Medical Reports', bg: '#faf5ff', color: '#7e22ce' };
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

  return (
    <div style={{ background: '#f8fafc', minHeight: 'calc(100vh - 120px)', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '1140px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* 1. WELCOME HERO & DEDICATED ADVISOR CARD */}
        <div style={{
          background: 'linear-gradient(135deg, var(--primary-navy) 0%, #1e3a5f 100%)',
          borderRadius: '16px',
          padding: '2rem',
          color: '#ffffff',
          boxShadow: '0 10px 25px rgba(15, 43, 72, 0.15)',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1.5rem',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(245, 158, 11, 0.2)', color: 'var(--accent-gold)', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800, marginBottom: '0.75rem' }}>
              <ShieldCheck size={14} /> Verified Policyholder Portal
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>
              Welcome, {user?.fullName || data.user?.fullName || 'Customer'}
            </h1>
            <p style={{ margin: '0.4rem 0 0', fontSize: '0.88rem', color: 'rgba(255, 255, 255, 0.8)' }}>
              Manage your insurance policies, digital KYC document vault, renewals, and claims.
            </p>
          </div>

          {/* Assigned Advisor Mini Card */}
          {data.assignedAdvisor ? (
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '1rem 1.25rem',
              backdropFilter: 'none',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: 'var(--accent-gold)',
                color: 'var(--primary-navy)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.1rem'
              }}>
                {data.assignedAdvisor.name ? data.assignedAdvisor.name.charAt(0) : 'A'}
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--accent-gold)', fontWeight: 800 }}>
                  Your Dedicated Advisor
                </div>
                <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>
                  {data.assignedAdvisor.name}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.35rem' }}>
                  {data.assignedAdvisor.phoneNumber && (
                    <a
                      href={`https://wa.me/${formatWhatsAppNumber(data.assignedAdvisor.phoneNumber)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.25rem', textDecoration: 'none', fontSize: '0.75rem', fontWeight: 700 }}
                    >
                      <WhatsAppIcon size={13} /> WhatsApp
                    </a>
                  )}
                  {data.assignedAdvisor.phoneNumber && (
                    <a
                      href={`tel:${data.assignedAdvisor.phoneNumber}`}
                      style={{ color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.25rem', textDecoration: 'none', fontSize: '0.75rem', fontWeight: 600 }}
                    >
                      <Phone size={12} /> Call
                    </a>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '1rem 1.25rem',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              textAlign: 'right'
            }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', fontWeight: 800 }}>
                24/7 Policyholder Helpline
              </div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', marginTop: '0.2rem' }}>
                +91 98490 12345
              </div>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                claims@aadhiraksha.com
              </div>
            </div>
          )}
        </div>

        {/* 2. STATS ROW */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <div style={{ background: '#ffffff', borderRadius: '12px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-xs)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>Active Policies</span>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={18} />
              </div>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-navy)', marginTop: '0.4rem' }}>
              {data.policies?.length || 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>Cover notes & active plans</div>
          </div>

          <div style={{ background: '#ffffff', borderRadius: '12px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-xs)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>Stored Documents</span>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FolderCheck size={18} />
              </div>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#059669', marginTop: '0.4rem' }}>
              {data.documents?.length || 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>KYC, RC & policy PDFs</div>
          </div>

          <div style={{ background: '#ffffff', borderRadius: '12px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-xs)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>Tracked Claims</span>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldAlert size={18} />
              </div>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#d97706', marginTop: '0.4rem' }}>
              {data.claims?.length || 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>Cashless / reimbursement</div>
          </div>
        </div>

        {/* 3. SUB-TAB BAR */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {[
              { id: 'policies', label: `My Policies (${data.policies?.length || 0})` },
              { id: 'vault', label: `Document Vault (${data.documents?.length || 0})` },
              { id: 'claims', label: `Claims Tracker (${data.claims?.length || 0})` }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '0.75rem 1.25rem',
                  border: 'none',
                  borderRadius: '8px 8px 0 0',
                  background: activeTab === tab.id ? '#ffffff' : 'transparent',
                  borderBottom: activeTab === tab.id ? '3px solid var(--accent-gold)' : '3px solid transparent',
                  color: activeTab === tab.id ? 'var(--primary-navy)' : '#64748b',
                  fontWeight: activeTab === tab.id ? 800 : 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'vault' && (
            <button
              onClick={() => setShowUploadModal(true)}
              style={{
                background: 'var(--primary-navy)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '0.5rem 1rem',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <Upload size={14} /> Upload Document
            </button>
          )}
        </div>

        {/* 4. TAB CONTENT: POLICIES SHELF */}
        {activeTab === 'policies' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {data.policies?.length === 0 ? (
              <div style={{ background: '#ffffff', borderRadius: '12px', padding: '3.5rem 1.5rem', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                <ShieldCheck size={48} color="#94a3b8" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                  No active insurance policies linked yet
                </h3>
                <p style={{ margin: '0.35rem 0 1.25rem', fontSize: '0.85rem', color: '#64748b' }}>
                  If you recently purchased a policy through Aadhiraksha, our advisor will link it within 24 hours.
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
                  <a
                    href="/insurance/health"
                    style={{ background: 'var(--primary-navy)', color: '#ffffff', textDecoration: 'none', padding: '0.65rem 1.25rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem' }}
                  >
                    Compare Health Plans
                  </a>
                  <a
                    href="/insurance/motor"
                    style={{ background: '#f1f5f9', color: '#334155', textDecoration: 'none', padding: '0.65rem 1.25rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem' }}
                  >
                    Instant Motor Quote
                  </a>
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
                {data.policies.map(policy => (
                  <div key={policy.id} style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0284c7', background: '#e0f2fe', padding: '0.2rem 0.55rem', borderRadius: '6px' }}>
                          {policy.insuranceType || 'General Insurance'}
                        </span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#059669', background: 'rgba(16, 185, 129, 0.1)', padding: '0.2rem 0.55rem', borderRadius: '12px' }}>
                          Active Coverage
                        </span>
                      </div>

                      <h4 style={{ margin: '0.85rem 0 0.25rem', fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                        {policy.existingInsurer || 'General Insurance Plan'}
                      </h4>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        Ref Code: <strong style={{ color: 'var(--primary-navy)' }}>{policy.clientCode}</strong>
                      </div>

                      <div style={{ marginTop: '1.25rem', padding: '0.85rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>Sum Insured</div>
                          <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--primary-navy)' }}>{policy.sumInsured || '₹10 Lakhs'}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>Premium Paid</div>
                          <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#059669' }}>₹{Number(policy.estimatedPremium || 0).toLocaleString('en-IN')}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>Renewal Due</div>
                          <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#d97706' }}>{policy.policyExpiryDate || 'Oct 2026'}</div>
                        </div>
                      </div>
                    </div>

                    <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.5rem' }}>
                      <a
                        href="/renewal-port"
                        style={{
                          flex: 1,
                          textAlign: 'center',
                          background: 'var(--primary-navy)',
                          color: '#ffffff',
                          textDecoration: 'none',
                          padding: '0.65rem',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
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
                          padding: '0.65rem',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          fontWeight: 700
                        }}
                      >
                        Intimate Claim
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 5. TAB CONTENT: DIGITAL KYC & DOCUMENT VAULT */}
        {activeTab === 'vault' && (
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                  Digital KYC & Vehicle Document Locker
                </h3>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                  Aadhaar, PAN, previous policy schedules, and RC copies securely archived for instant claim verification.
                </p>
              </div>
              <button
                onClick={() => setShowUploadModal(true)}
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
                <Plus size={14} /> Add Document
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', color: '#64748b', borderBottom: '1px solid #e2e8f0', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Document Type</th>
                    <th style={{ padding: '0.85rem 1rem' }}>File Name</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Uploaded Date</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Verification Status</th>
                    <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.documents?.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ padding: '3.5rem 1rem', textAlign: 'center', color: '#64748b' }}>
                        <FolderCheck size={40} color="#94a3b8" style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
                        <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>No documents uploaded yet</div>
                        <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Upload your Aadhaar, PAN, or RC book for seamless claim settlements.</div>
                      </td>
                    </tr>
                  ) : (
                    data.documents.map(doc => {
                      const typeBadge = getDocTypeBadge(doc.documentType);
                      const verifyBadge = getVerificationBadge(doc.verificationStatus);
                      return (
                        <tr key={doc.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '0.9rem 1.25rem' }}>
                            <span style={{
                              padding: '0.25rem 0.6rem',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              background: typeBadge.bg,
                              color: typeBadge.color
                            }}>
                              {typeBadge.label}
                            </span>
                          </td>
                          <td style={{ padding: '0.9rem 1rem', fontWeight: 700, color: 'var(--primary-navy)' }}>
                            {doc.fileName}
                          </td>
                          <td style={{ padding: '0.9rem 1rem', color: '#64748b' }}>
                            {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString('en-IN') : 'Recent'}
                          </td>
                          <td style={{ padding: '0.9rem 1rem' }}>
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
                          <td style={{ padding: '0.9rem 1.25rem', textAlign: 'right' }}>
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
                              <Download size={13} /> View / Download
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

        {/* 6. TAB CONTENT: CLAIMS TRACKER */}
        {activeTab === 'claims' && (
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                  Active & Past Insurance Claims
                </h3>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                  Real-time intimation tracking with cashless network approvals.
                </p>
              </div>
              <a
                href="/claim-support"
                style={{
                  background: '#dc2626',
                  color: '#ffffff',
                  textDecoration: 'none',
                  borderRadius: '6px',
                  padding: '0.5rem 1rem',
                  fontSize: '0.8rem',
                  fontWeight: 700
                }}
              >
                + Intimate Emergency Claim
              </a>
            </div>

            {data.claims?.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
                <ShieldAlert size={40} color="#94a3b8" style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>No active claims on file</div>
                <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>If you need emergency hospital cashless or accident assistance, click Intimate Claim above.</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {data.claims.map(claim => (
                  <div key={claim.id} style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 800, color: 'var(--primary-navy)', fontSize: '0.95rem' }}>
                        {claim.claimType} Claim — {claim.policyNumber}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem' }}>
                        Facility: {claim.hospitalOrGarage || 'Hospital / Authorized Workshop'} • Date: {claim.incidentDate || 'Recent'}
                      </div>
                    </div>
                    <span style={{
                      padding: '0.3rem 0.75rem',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
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

      </div>

      {/* 7. SECURE DOCUMENT UPLOAD MODAL */}
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
                  Directly saved to your verified policyholder record.
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
                  Document Title / Display Name *
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
                  Document File URL / Cloud Link *
                </label>
                <input
                  required
                  type="url"
                  placeholder="https://storage.googleapis.com/... or Google Drive Link"
                  value={uploadForm.fileUrl}
                  onChange={(e) => setUploadForm({ ...uploadForm, fileUrl: e.target.value })}
                  style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                />
                <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginTop: '0.25rem' }}>
                  Encrypted storage compliant with IRDAI ISO/IEC 27001 data protection standards.
                </span>
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
                  {uploading ? 'Encrypting & Uploading...' : 'Save to Vault'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
