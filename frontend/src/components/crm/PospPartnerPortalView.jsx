import React, { useState, useEffect, useRef } from 'react';
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
  AlertCircle,
  Eye,
  EyeOff,
  Upload,
  Download,
  Check,
  Copy,
  Camera,
  FileCheck,
  Printer,
  Shield,
  Trash2,
  X,
  Edit3,
  ChevronDown,
  Trophy
} from 'lucide-react';
import api, { pospService } from '../../services/api';
import ActionDropdown from '../common/ActionDropdown';
import { useToast } from '../../context/ToastContext';
import { getStageBadge, STAGE_OPTIONS } from '../../utils/crmStageConstants';
import InsurerLogoBadge from '../common/InsurerLogoBadge';
import SalesContestsManagerView from './SalesContestsManagerView';

export default function PospPartnerPortalView({ user, initialTab = 'overview', onTabChange, onOpenClient360 }) {
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
  const [activeTab, setActiveTab] = useState(initialTab); // 'overview' | 'clients' | 'kyc' | 'calculator'

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const handleSelectTab = (tabId) => {
    setActiveTab(tabId);
    if (onTabChange) {
      onTabChange(tabId);
    }
  };
  
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

  // Self-Service Client & Lead Registration Modal
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [addingClientLoading, setAddingClientLoading] = useState(false);
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [newClientForm, setNewClientForm] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    insuranceType: 'HEALTH',
    existingInsurer: 'Star Health Insurance',
    estimatedPremium: '',
    stage: 'PROPOSAL_SHARED',
    notes: ''
  });

  const [stageUpdatingId, setStageUpdatingId] = useState(null);

  const handleUpdateClientStage = async (clientId, newStage) => {
    setStageUpdatingId(clientId);
    try {
      await pospService.updateClientStage(clientId, newStage);
      // Optimistically update local clients list
      setClients(prev => prev.map(c => c.id === clientId ? { ...c, stage: newStage } : c));
      toast?.show('Client stage updated successfully!', 'success');
    } catch (err) {
      console.error('Failed to update client stage', err);
      toast?.show(err.response?.data?.message || 'Failed to update client stage. Permission denied or client not found.', 'error');
    } finally {
      setStageUpdatingId(null);
    }
  };

  // Calculator State
  const [calcPremium, setCalcPremium] = useState(25000);
  const [calcRate, setCalcRate] = useState(15);

  // KYC, Banking & ID Card Self-Service State
  const fileInputRef = useRef(null);
  const [currentUploadTarget, setCurrentUploadTarget] = useState(null); // 'PHOTO' | 'PAN' | 'AADHAAR' | 'EDUCATION' | 'CHEQUE' | 'TRAINING'
  const [uploadingDocType, setUploadingDocType] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null); // { title: string, url: string }
  const [showIdCardModal, setShowIdCardModal] = useState(false);
  
  // Banking Edit State
  const [isEditingBank, setIsEditingBank] = useState(false);
  const [savingBank, setSavingBank] = useState(false);
  const [showFullAccount, setShowFullAccount] = useState(false);
  const [copiedBankAcc, setCopiedBankAcc] = useState(false);
  const [bankForm, setBankForm] = useState({
    bankName: '',
    bankAccountNumber: '',
    ifscCode: ''
  });

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
        if (dashData.profile) {
          setBankForm({
            bankName: dashData.profile.bankName || '',
            bankAccountNumber: dashData.profile.bankAccountNumber || '',
            ifscCode: dashData.profile.ifscCode || ''
          });
        }
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

  const triggerDocUpload = (docType) => {
    setCurrentUploadTarget(docType);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !currentUploadTarget) return;

    setUploadingDocType(currentUploadTarget);
    try {
      const res = await pospService.uploadDocument(currentUploadTarget, file);
      toast?.show(`${currentUploadTarget} uploaded successfully!`, 'success');
      loadPortalData();
    } catch (err) {
      toast?.show(err.response?.data?.message || 'Failed to upload document', 'error');
    } finally {
      setUploadingDocType(null);
      setCurrentUploadTarget(null);
    }
  };

  const handleSaveBankInfo = async (e) => {
    e.preventDefault();
    setSavingBank(true);
    try {
      await pospService.updateProfile({
        bankName: bankForm.bankName,
        bankAccountNumber: bankForm.bankAccountNumber,
        ifscCode: bankForm.ifscCode
      });
      toast?.show('Banking details updated successfully for direct payouts!', 'success');
      setIsEditingBank(false);
      loadPortalData();
    } catch (err) {
      toast?.show(err.response?.data?.message || 'Failed to update bank details', 'error');
    } finally {
      setSavingBank(false);
    }
  };

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

  const handleAddClientSubmit = async (e) => {
    e.preventDefault();
    if (!newClientForm.phoneNumber) {
      toast?.show('Phone number is required to register client', 'warning');
      return;
    }

    setAddingClientLoading(true);
    try {
      const isExistingPhone = clients.some(c => {
        const cleanOld = (c.phoneNumber || '').replace(/[^0-9]/g, '');
        const cleanNew = (newClientForm.phoneNumber || '').replace(/[^0-9]/g, '');
        return cleanOld.endsWith(cleanNew.slice(-10)) || cleanNew.endsWith(cleanOld.slice(-10));
      });

      await pospService.addClient({
        ...newClientForm,
        estimatedPremium: newClientForm.estimatedPremium ? parseFloat(newClientForm.estimatedPremium) : 0
      });

      if (isExistingPhone) {
        toast?.show('Existing client found! Added new product opportunity to their Client 360° portfolio.', 'info');
      } else {
        toast?.show('Client added to your portfolio successfully!', 'success');
      }

      setShowAddClientModal(false);
      setNewClientForm({
        fullName: '',
        phoneNumber: '',
        email: '',
        insuranceType: 'HEALTH',
        existingInsurer: 'Star Health Insurance',
        estimatedPremium: '',
        stage: 'PROPOSAL_SHARED',
        notes: ''
      });
      loadPortalData();
    } catch (err) {
      console.error('Failed to add client', err);
      toast?.show(err.response?.data?.message || 'Failed to add client. Please try again.', 'error');
    } finally {
      setAddingClientLoading(false);
    }
  };

  const calculatedCommission = ((calcPremium * calcRate) / 100);
  const calculatedTds = calculatedCommission * 0.05;
  const calculatedNet = calculatedCommission - calculatedTds;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2.5rem' }}>
      
      {/* 1. OVERVIEW & LEDGER EXECUTIVE DASHBOARD */}
      {activeTab === 'overview' && (
        <>
          {/* POSP ACCREDITED PARTNER HERO IDENTITY CARD */}
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
                background: data.profile?.photoUrl ? '#ffffff' : 'linear-gradient(135deg, rgba(245, 158, 11, 0.25) 0%, rgba(245, 158, 11, 0.1) 100%)',
                border: '2px solid var(--accent-gold)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-gold)',
                overflow: 'hidden',
                flexShrink: 0
              }}>
                {data.profile?.photoUrl ? (
                  <img
                    src={data.profile.photoUrl}
                    alt={user?.fullName || 'Agent'}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <Award size={36} />
                )}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                  <h2 style={{ fontSize: '1.45rem', fontWeight: 800, margin: 0, letterSpacing: '-0.3px', color: '#ffffff' }}>
                    {user?.fullName || data.agentName || 'POSP Partner'}
                  </h2>
                  <span style={{
                    background: data.profile?.kycVerified ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                    color: data.profile?.kycVerified ? '#34d399' : '#fcd34d',
                    border: data.profile?.kycVerified ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(245, 158, 11, 0.4)',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '20px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}>
                    {data.profile?.kycVerified ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                    {data.profile?.kycVerified ? 'IRDAI Certified POSP' : 'KYC Verification Pending'}
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
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => setShowIdCardModal(true)}
                style={{
                  background: 'rgba(255, 255, 255, 0.12)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  borderRadius: '10px',
                  padding: '0.75rem 1.15rem',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'background 0.15s ease'
                }}
              >
                <ShieldCheck size={17} color="var(--accent-gold)" />
                <span>Digital ID Card</span>
              </button>

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

          {/* FINANCIAL REVENUE & PERFORMANCE METRICS */}
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
                          {comm.insurerName && (
                            <div style={{ marginTop: '3px' }}>
                              <InsurerLogoBadge name={comm.insurerName} size="xs" showName={true} />
                            </div>
                          )}
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
      </>
      )}

      {/* 2. TAB: SALES CONTESTS & INCENTIVE SPRINTS */}
      {activeTab === 'contests' && (
        <SalesContestsManagerView isAgentView={true} />
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
          {/* TOP HEADER ROW: TITLE & PRIMARY ACTION GROUP */}
          <div style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            background: 'var(--crm-bg-card)'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-navy)', letterSpacing: '-0.2px' }}>
                  Attributed Client Portfolio
                </h3>
                <span style={{
                  background: 'rgba(2, 132, 199, 0.1)',
                  color: '#0284c7',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  padding: '0.15rem 0.55rem',
                  borderRadius: '20px'
                }}>
                  {clients.length} {clients.length === 1 ? 'Client' : 'Clients'}
                </span>
              </div>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Clients acquired directly or attributed by the platform under your POSP accreditation.
              </p>
            </div>
            
            {/* ACTION BUTTON (TOP RIGHT) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <button
                onClick={() => setShowAddClientModal(true)}
                style={{
                  background: 'var(--primary-navy)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '9px',
                  padding: '0.6rem 1.25rem',
                  fontSize: '0.84rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  boxShadow: '0 3px 10px rgba(15, 43, 72, 0.18)',
                  transition: 'transform 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <Plus size={16} strokeWidth={2.5} />
                <span>Add Client Lead</span>
              </button>
            </div>
          </div>

          {/* DEDICATED TOOLBAR / SEARCH BAR ROW */}
          <div style={{
            padding: '0.9rem 1.5rem',
            background: '#f8fafc',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.85rem'
          }}>
            <div style={{ position: 'relative', flex: '1', maxWidth: '420px', minWidth: '260px' }}>
              <Search 
                size={16} 
                color="var(--text-muted)" 
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} 
              />
              <input 
                type="text"
                placeholder="Search by client name, mobile, or code..."
                value={clientSearchTerm}
                onChange={(e) => setClientSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 1rem 0.6rem 2.35rem',
                  borderRadius: '9px',
                  border: '1px solid var(--border-subtle)',
                  background: '#ffffff',
                  fontSize: '0.86rem',
                  color: 'var(--primary-navy)',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent-gold)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.15)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>

            {clientSearchTerm && (
              <button
                onClick={() => setClientSearchTerm('')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem'
                }}
              >
                Clear filter
              </button>
            )}
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
                {clients.filter(c => {
                  if (!clientSearchTerm) return true;
                  const term = clientSearchTerm.toLowerCase();
                  return (c.fullName || '').toLowerCase().includes(term) ||
                         (c.phoneNumber || '').includes(term) ||
                         (c.clientCode || '').toLowerCase().includes(term);
                }).length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      <User size={36} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
                      <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                        {clientSearchTerm ? 'No clients match your search' : 'No clients in your portfolio yet'}
                      </div>
                      <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                        Click <strong>"+ Add Client Lead"</strong> to introduce your first customer.
                      </div>
                    </td>
                  </tr>
                ) : (
                  clients.filter(c => {
                    if (!clientSearchTerm) return true;
                    const term = clientSearchTerm.toLowerCase();
                    return (c.fullName || '').toLowerCase().includes(term) ||
                           (c.phoneNumber || '').includes(term) ||
                           (c.clientCode || '').toLowerCase().includes(term);
                  }).map(client => (
                    <tr key={client.id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.15s ease' }}>
                      <td style={{ padding: '0.9rem 1.25rem' }}>
                        <div 
                          onClick={() => onOpenClient360 && onOpenClient360(client)}
                          title="Click to view full Client 360° Profile"
                          style={{ 
                            fontWeight: 800, 
                            color: onOpenClient360 ? '#0284c7' : 'var(--primary-navy)',
                            cursor: onOpenClient360 ? 'pointer' : 'default',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            textDecoration: 'none'
                          }}
                          onMouseEnter={(e) => { if (onOpenClient360) e.currentTarget.style.textDecoration = 'underline'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.textDecoration = 'none'; }}
                        >
                          <span>{client.fullName}</span>
                          {onOpenClient360 && <ExternalLink size={12} color="#0284c7" />}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{client.clientCode}</div>
                      </td>
                      <td style={{ padding: '0.9rem 1rem' }}>
                        <div>{client.phoneNumber}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{client.email || '—'}</div>
                      </td>
                      <td style={{ padding: '0.9rem 1rem' }}>
                        <span style={{ fontWeight: 600 }}>{client.insuranceType || 'GENERAL'}</span>
                      </td>
                      <td style={{ padding: '0.9rem 1rem' }}>
                        {client.existingInsurer ? (
                          <InsurerLogoBadge 
                            name={client.existingInsurer} 
                            size="sm" 
                            showName={true} 
                          />
                        ) : (
                          <span style={{ 
                            color: '#94a3b8', 
                            fontSize: '0.78rem', 
                            fontStyle: 'italic',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <Building2 size={13} /> Direct
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '0.9rem 1rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                        ₹{Number(client.estimatedPremium || 0).toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '0.9rem 1.25rem' }}>
                        {(() => {
                          const badge = getStageBadge(client.stage);
                          const isUpdating = stageUpdatingId === client.id;
                          return (
                            <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                              <select
                                value={badge.key || client.stage || 'NEW_LEAD'}
                                onChange={(e) => handleUpdateClientStage(client.id, e.target.value)}
                                disabled={isUpdating}
                                title="Click to transition deal stage"
                                style={{
                                  appearance: 'none',
                                  WebkitAppearance: 'none',
                                  padding: '0.28rem 1.55rem 0.28rem 0.65rem',
                                  borderRadius: '20px',
                                  fontSize: '0.74rem',
                                  fontWeight: 700,
                                  background: badge.bg,
                                  color: badge.color,
                                  border: `1px solid ${badge.border || 'transparent'}`,
                                  cursor: isUpdating ? 'wait' : 'pointer',
                                  outline: 'none',
                                  transition: 'all 0.15s ease',
                                  opacity: isUpdating ? 0.6 : 1
                                }}
                              >
                                {STAGE_OPTIONS.map(opt => (
                                  <option key={opt.value} value={opt.value} style={{ background: '#ffffff', color: '#1e293b' }}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown 
                                size={12} 
                                style={{ 
                                  position: 'absolute', 
                                  right: '7px', 
                                  pointerEvents: 'none', 
                                  color: badge.color,
                                  opacity: 0.85
                                }} 
                              />
                            </div>
                          );
                        })()}
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

      {/* 5. TAB: MY KYC, BANKING & DIGITAL ID */}
      {activeTab === 'kyc' && (() => {
        const profile = data.profile || {};
        const kycDocs = [
          {
            id: 'PHOTO',
            title: 'Official Passport Photo',
            desc: 'Passport-size photograph for official POSP identity card & verification',
            url: profile.photoUrl,
            required: true,
            isImage: true
          },
          {
            id: 'PAN',
            title: 'PAN Card (Mandatory for TDS)',
            desc: 'Permanent Account Number for statutory TDS compliance under Sec 194H',
            url: profile.panDocUrl,
            required: true
          },
          {
            id: 'AADHAAR',
            title: 'Aadhaar Card (Front / Back)',
            desc: 'Official proof of identity & residential address',
            url: profile.aadhaarDocUrl,
            required: true
          },
          {
            id: 'EDUCATION',
            title: '10th / 12th Educational Certificate',
            desc: 'IRDAI minimum educational qualification compliance proof',
            url: profile.educationCertificateUrl,
            required: true
          },
          {
            id: 'CHEQUE',
            title: 'Cancelled Cheque / Bank Passbook',
            desc: 'Verification for direct commission payout deposits',
            url: profile.cancelledChequeUrl,
            required: true
          },
          {
            id: 'TRAINING',
            title: '15-Hour POSP Training Certificate',
            desc: 'IRDAI certified training & examination certificate',
            url: profile.trainingCertificateUrl,
            required: true
          }
        ];

        const uploadedCount = kycDocs.filter(d => !!d.url).length;
        const totalCount = kycDocs.length;
        const isAllUploaded = uploadedCount === totalCount;

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Top Status Banner */}
            <div style={{
              background: isAllUploaded ? '#f0fdf4' : '#fffbeb',
              border: isAllUploaded ? '1px solid #bbf7d0' : '1px solid #fef3c7',
              borderRadius: '12px',
              padding: '1.25rem 1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={20} color={isAllUploaded ? '#16a34a' : '#d97706'} />
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: isAllUploaded ? '#166534' : '#92400e' }}>
                    IRDAI Statutory Compliance & KYC Portfolio
                  </h3>
                  <span style={{
                    background: profile.kycVerified ? '#dcfce7' : '#fef3c7',
                    color: profile.kycVerified ? '#15803d' : '#b45309',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '999px'
                  }}>
                    {profile.kycVerified ? '✓ All Verified by Principal Broker' : `${uploadedCount}/${totalCount} Files Uploaded`}
                  </span>
                </div>
                <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: isAllUploaded ? '#166534' : '#b45309' }}>
                  {profile.kycVerified
                    ? 'Your documents have been verified under IRDAI guidelines. Your accreditation and digital ID card are fully active.'
                    : 'Upload clear color scans or photos of all 6 compliance files. Once uploaded, your broker compliance team will verify and activate your certificate.'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowIdCardModal(true)}
                style={{
                  background: 'var(--primary-navy)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '9px 16px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <ShieldCheck size={15} color="var(--accent-gold)" />
                View & Print Digital ID Card
              </button>
            </div>

            {/* KYC Documents Grid */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                  Statutory IRDAI KYC Documents
                </h4>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Supported formats: PDF, JPG, PNG (Max 15MB)
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
                {kycDocs.map((doc) => {
                  const isUploaded = !!doc.url;
                  const isCurrentUploading = uploadingDocType === doc.id;

                  return (
                    <div
                      key={doc.id}
                      style={{
                        background: 'var(--crm-bg-card)',
                        border: isUploaded ? '1px solid #bbf7d0' : '1px dashed #cbd5e1',
                        borderRadius: '12px',
                        padding: '1.15rem',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '12px',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              background: isUploaded ? '#dcfce7' : '#f1f5f9',
                              color: isUploaded ? '#16a34a' : '#64748b',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              {doc.isImage ? <Camera size={16} /> : <FileText size={16} />}
                            </div>
                            <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-main)' }}>
                              {doc.title}
                            </div>
                          </div>

                          <span style={{
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: isUploaded ? '#dcfce7' : '#fee2e2',
                            color: isUploaded ? '#15803d' : '#991b1b'
                          }}>
                            {isUploaded ? 'UPLOADED' : 'REQUIRED'}
                          </span>
                        </div>

                        <p style={{ margin: '6px 0 0', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                          {doc.desc}
                        </p>
                      </div>

                      {/* Action buttons */}
                      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                        {isUploaded ? (
                          <>
                            <button
                              type="button"
                              onClick={() => setPreviewDoc({ title: doc.title, url: doc.url })}
                              style={{
                                background: '#f8fafc',
                                border: '1px solid #cbd5e1',
                                color: '#0f2b48',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px'
                              }}
                            >
                              <Eye size={13} color="#0284c7" />
                              View File
                            </button>

                            <button
                              type="button"
                              onClick={() => triggerDocUpload(doc.id)}
                              disabled={isCurrentUploading}
                              style={{
                                background: '#ffffff',
                                border: '1px solid #cbd5e1',
                                color: '#475569',
                                padding: '6px 10px',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <Upload size={12} />
                              {isCurrentUploading ? 'Uploading...' : 'Replace'}
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => triggerDocUpload(doc.id)}
                            disabled={isCurrentUploading}
                            style={{
                              background: '#0284c7',
                              color: '#ffffff',
                              border: 'none',
                              padding: '7px 14px',
                              borderRadius: '6px',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px'
                            }}
                          >
                            <Upload size={13} />
                            {isCurrentUploading ? 'Uploading...' : 'Upload Document'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Direct Payout Banking Information Card */}
            <div style={{
              background: 'var(--crm-bg-card)',
              borderRadius: '12px',
              border: '1px solid var(--border-subtle)',
              padding: '1.5rem',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '8px',
                    background: '#ede9fe',
                    color: '#7c3aed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <CreditCard size={18} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                      Commission Payout Bank Details
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>
                      Official bank account for NEFT / IMPS direct commission disbursements
                    </p>
                  </div>
                </div>

                {!isEditingBank ? (
                  <button
                    type="button"
                    onClick={() => setIsEditingBank(true)}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      color: '#0f2b48',
                      padding: '7px 14px',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <Edit3 size={13} />
                    Edit Bank Info
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditingBank(false)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#64748b',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Cancel Editing
                  </button>
                )}
              </div>

              {isEditingBank ? (
                <form onSubmit={handleSaveBankInfo} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Bank Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. HDFC Bank, ICICI Bank"
                      value={bankForm.bankName}
                      onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                      required
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Account Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 50100234567890"
                      value={bankForm.bankAccountNumber}
                      onChange={(e) => setBankForm({ ...bankForm, bankAccountNumber: e.target.value })}
                      required
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      IFSC Code
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. HDFC0001234"
                      value={bankForm.ifscCode}
                      onChange={(e) => setBankForm({ ...bankForm, ifscCode: e.target.value.toUpperCase() })}
                      required
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                    <button
                      type="submit"
                      disabled={savingBank}
                      style={{
                        background: '#059669',
                        color: '#ffffff',
                        border: 'none',
                        padding: '9px 20px',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        cursor: 'pointer'
                      }}
                    >
                      {savingBank ? 'Saving Details...' : 'Save Bank Details'}
                    </button>
                  </div>
                </form>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', background: '#f8fafc', padding: '1rem 1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>Bank Name</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#091726', marginTop: '2px' }}>
                      {profile.bankName || 'Not configured'}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>Account Number</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                      <code style={{ fontSize: '0.9rem', fontWeight: 800, color: '#091726', background: '#ffffff', padding: '2px 6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                        {profile.bankAccountNumber 
                          ? (showFullAccount ? profile.bankAccountNumber : `••••••••${profile.bankAccountNumber.slice(-4)}`) 
                          : 'Not submitted'}
                      </code>
                      {profile.bankAccountNumber && (
                        <>
                          <button
                            type="button"
                            onClick={() => setShowFullAccount(!showFullAccount)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: '#64748b' }}
                            title={showFullAccount ? 'Mask Account' : 'Reveal Account'}
                          >
                            {showFullAccount ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(profile.bankAccountNumber);
                              setCopiedBankAcc(true);
                              setTimeout(() => setCopiedBankAcc(false), 2000);
                            }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: '#64748b' }}
                            title="Copy Account Number"
                          >
                            {copiedBankAcc ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>IFSC Code</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#091726', marginTop: '2px' }}>
                      {profile.ifscCode || 'Not submitted'}
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        );
      })()}

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

      {/* MODAL: ADD CLIENT LEAD */}
      {showAddClientModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'none',
          WebkitBackdropFilter: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: 'var(--crm-bg-card)',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '540px',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-xl)',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                  Add Client to Portfolio
                </h3>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Register a new client or prospect under your POSP accreditation.
                </p>
              </div>
              <button
                onClick={() => setShowAddClientModal(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddClientSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  value={newClientForm.fullName}
                  onChange={(e) => setNewClientForm({ ...newClientForm, fullName: e.target.value })}
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
                    value={newClientForm.phoneNumber}
                    onChange={(e) => setNewClientForm({ ...newClientForm, phoneNumber: e.target.value })}
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
                    value={newClientForm.email}
                    onChange={(e) => setNewClientForm({ ...newClientForm, email: e.target.value })}
                    style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                    Insurance Line
                  </label>
                  <select
                    value={newClientForm.insuranceType}
                    onChange={(e) => setNewClientForm({ ...newClientForm, insuranceType: e.target.value })}
                    style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', boxSizing: 'border-box' }}
                  >
                    <option value="HEALTH">Health Comprehensive</option>
                    <option value="MOTOR">Motor (Car/Bike)</option>
                    <option value="LIFE">Term Life / Savings</option>
                    <option value="COMMERCIAL">Commercial / SME</option>
                    <option value="TRAVEL">Travel Insurance</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                    Preferred Insurer
                  </label>
                  <select
                    value={newClientForm.existingInsurer}
                    onChange={(e) => setNewClientForm({ ...newClientForm, existingInsurer: e.target.value })}
                    style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', boxSizing: 'border-box' }}
                  >
                    <option value="Star Health Insurance">Star Health Insurance</option>
                    <option value="HDFC ERGO General Insurance">HDFC ERGO General Insurance</option>
                    <option value="ICICI Lombard General Insurance">ICICI Lombard</option>
                    <option value="Care Health Insurance">Care Health Insurance</option>
                    <option value="Tata AIG General Insurance">Tata AIG</option>
                    <option value="Bajaj Allianz General Insurance">Bajaj Allianz</option>
                    <option value="Niva Bupa Health Insurance">Niva Bupa</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                    Estimated Premium (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 15000"
                    value={newClientForm.estimatedPremium}
                    onChange={(e) => setNewClientForm({ ...newClientForm, estimatedPremium: e.target.value })}
                    style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                    Deal Stage
                  </label>
                  <select
                    value={newClientForm.stage}
                    onChange={(e) => setNewClientForm({ ...newClientForm, stage: e.target.value })}
                    style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', boxSizing: 'border-box' }}
                  >
                    {STAGE_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                  Client Notes / Relationship Context
                </label>
                <textarea
                  rows="2"
                  placeholder="e.g. Referred by Krishna; interested in ₹10L floater policy..."
                  value={newClientForm.notes}
                  onChange={(e) => setNewClientForm({ ...newClientForm, notes: e.target.value })}
                  style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', boxSizing: 'border-box', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowAddClientModal(false)}
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
                  disabled={addingClientLoading}
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
                  {addingClientLoading ? 'Saving...' : 'Add Client to Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HIDDEN FILE INPUT FOR SELF-SERVICE KYC UPLOADS */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelected}
        style={{ display: 'none' }}
        accept=".pdf,.jpg,.jpeg,.png"
      />

      {/* DOCUMENT PREVIEW LIGHTBOX */}
      {previewDoc && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '1.5rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            maxWidth: '780px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '90vh'
          }}>
            <div style={{
              padding: '1rem 1.25rem',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#0f2b48',
              color: '#ffffff'
            }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{previewDoc.title}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <a
                  href={previewDoc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  style={{
                    color: '#ffffff',
                    background: 'rgba(255,255,255,0.15)',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Download size={13} /> Download
                </a>
                <button
                  onClick={() => setPreviewDoc(null)}
                  style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer' }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div style={{ padding: '1rem', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'auto', flex: 1, minHeight: '300px' }}>
              {previewDoc.url.toLowerCase().endsWith('.pdf') ? (
                <iframe
                  src={previewDoc.url}
                  title={previewDoc.title}
                  style={{ width: '100%', height: '550px', border: 'none', borderRadius: '8px' }}
                />
              ) : (
                <img
                  src={previewDoc.url}
                  alt={previewDoc.title}
                  style={{ maxWidth: '100%', maxHeight: '65vh', objectFit: 'contain', borderRadius: '8px' }}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* OFFICIAL IRDAI DIGITAL POSP ID CARD MODAL */}
      {showIdCardModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            maxWidth: '440px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
            border: '1px solid #cbd5e1'
          }}>
            {/* Printable ID Card Body */}
            <div id="posp-printable-id-card" style={{
              background: 'linear-gradient(180deg, #091726 0%, #0f2b48 100%)',
              color: '#ffffff',
              padding: '1.75rem 1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              position: 'relative'
            }}>
              {/* Header with Broker Logo & IRDAI Badge */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--accent-gold)', fontWeight: 800 }}>
                    IRDAI ACCREDITED BROKER
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.3px', marginTop: '2px' }}>
                    Aadhiraksha Insurance
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                    Broker Reg No: IRDAI/DB-942/2026
                  </div>
                </div>

                <div style={{
                  background: 'rgba(16, 185, 129, 0.2)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  color: '#34d399',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <ShieldCheck size={12} />
                  <span>ACTIVE POSP</span>
                </div>
              </div>

              {/* Partner Photo & Credentials */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255, 255, 255, 0.05)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <div style={{
                  width: '76px',
                  height: '76px',
                  borderRadius: '10px',
                  background: '#ffffff',
                  border: '2px solid var(--accent-gold)',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {data.profile?.photoUrl ? (
                    <img
                      src={data.profile.photoUrl}
                      alt={user?.fullName || 'Partner'}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <Award size={40} color="#0f2b48" />
                  )}
                </div>

                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.2px' }}>
                    {user?.fullName || data.agentName || 'POSP Partner'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', fontWeight: 700, marginTop: '2px' }}>
                    Point-of-Sale Person (Life, General & Health)
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#cbd5e1', marginTop: '4px' }}>
                    📞 {user?.phoneNumber || data.agentPhone || '9966520001'}
                  </div>
                </div>
              </div>

              {/* Statutory License Numbers Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
                background: 'rgba(0, 0, 0, 0.25)',
                padding: '10px 12px',
                borderRadius: '8px',
                fontSize: '0.72rem'
              }}>
                <div>
                  <div style={{ color: '#94a3b8', fontWeight: 600 }}>Certificate No</div>
                  <div style={{ fontWeight: 800, color: 'var(--accent-gold)', marginTop: '1px' }}>
                    {data.profile?.certificateNumber || 'POSP-2026-AR-8891'}
                  </div>
                </div>
                <div>
                  <div style={{ color: '#94a3b8', fontWeight: 600 }}>IRDAI Lic Code</div>
                  <div style={{ fontWeight: 800, color: '#ffffff', marginTop: '1px' }}>
                    {data.profile?.irdaiLicenseCode || 'IRDAI/IMF/POSP-4402'}
                  </div>
                </div>
                <div>
                  <div style={{ color: '#94a3b8', fontWeight: 600 }}>PAN Number</div>
                  <div style={{ fontWeight: 800, color: '#ffffff', marginTop: '1px' }}>
                    {data.profile?.panNumber || 'ABCDE1234A'}
                  </div>
                </div>
                <div>
                  <div style={{ color: '#94a3b8', fontWeight: 600 }}>Authorized Region</div>
                  <div style={{ fontWeight: 800, color: '#34d399', marginTop: '1px' }}>
                    Pan-India (IRDAI)
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '0.65rem', color: '#94a3b8', textAlign: 'center', lineHeight: 1.3 }}>
                This Point-of-Sale Person is certified under the IRDAI (POSP Guidelines) to solicit pre-underwritten insurance products on behalf of Aadhiraksha Insurance Brokers.
              </div>
            </div>

            {/* Modal Controls */}
            <div style={{
              padding: '1rem 1.25rem',
              background: '#f8fafc',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <button
                type="button"
                onClick={() => window.print()}
                style={{
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#0f2b48',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Printer size={14} />
                Print ID Card
              </button>

              <button
                type="button"
                onClick={() => setShowIdCardModal(false)}
                style={{
                  background: 'var(--primary-navy)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 20px',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
