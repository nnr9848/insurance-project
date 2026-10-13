import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  PhoneCall, 
  UserPlus, 
  X, 
  CheckCircle, 
  ShieldCheck, 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Award, 
  Key, 
  Users, 
  CreditCard, 
  Building2, 
  FileText,
  Copy,
  Check,
  AlertCircle,
  Upload,
  Download,
  ExternalLink,
  Camera,
  FileCheck,
  FileSpreadsheet,
  MessageCircle,
  HelpCircle,
  Lock,
  Sparkles,
  AlertTriangle,
  EyeOff,
  Edit3,
  Trash2,
  Send,
  ChevronDown
} from 'lucide-react';
import { crmService, portalService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import ActionDropdown from '../common/ActionDropdown';
import WhatsAppIcon from '../common/WhatsAppIcon';

export default function PospApplicationsView({
  pospList = [],
  onUpdateStatus,
  onRefresh,
  onNavigateView
}) {
  const { user: authUser, isSuperAdmin, isManager, canCreatePosp } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successInfo, setSuccessInfo] = useState(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Detail / Profile Modal & Tabs
  const [selectedPospForKyc, setSelectedPospForKyc] = useState(null);
  const [activeModalTab, setActiveModalTab] = useState('overview'); // 'overview' | 'documents' | 'banking'
  const [uploadingDocType, setUploadingDocType] = useState(null);
  const [docUploadError, setDocUploadError] = useState('');

  // Inline Document Viewer / Lightbox
  const [previewDoc, setPreviewDoc] = useState(null); // { title: string, url: string }

  // Banking Info Privacy & Edit State
  const [showFullBankAccount, setShowFullBankAccount] = useState(false);
  const [copiedBankAcc, setCopiedBankAcc] = useState(false);
  const [isEditingBankInfo, setIsEditingBankInfo] = useState(false);
  const [bankEditForm, setBankEditForm] = useState({ bankName: '', bankAccountNumber: '', ifscCode: '' });
  const [savingBankInfo, setSavingBankInfo] = useState(false);

  // Attributed Clients State (Option B)
  const [partnerClients, setPartnerClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [clientSearchQuery, setClientSearchQuery] = useState('');

  // Fetch Attributed Clients whenever the modal opens or activeModalTab switches to 'clients'
  useEffect(() => {
    if (!selectedPospForKyc) {
      setPartnerClients([]);
      return;
    }

    const loadClients = async () => {
      setLoadingClients(true);
      try {
        const allClients = await crmService.getClients();
        const pospUserId = selectedPospForKyc.user?.id;
        const pospFullName = (selectedPospForKyc.user?.fullName || selectedPospForKyc.fullName || '').toLowerCase().trim();

        // Match by assignedAdvisorId (user id) OR assignedAdvisor name / posp code
        const filtered = (allClients || []).filter(c => {
          if (pospUserId && c.assignedAdvisorId && Number(c.assignedAdvisorId) === Number(pospUserId)) {
            return true;
          }
          if (pospFullName && c.assignedAdvisorName && c.assignedAdvisorName.toLowerCase().trim() === pospFullName) {
            return true;
          }
          if (c.pospPartnerId && Number(c.pospPartnerId) === Number(selectedPospForKyc.id)) {
            return true;
          }
          return false;
        });

        setPartnerClients(filtered);
      } catch (err) {
        console.error('Failed to load attributed clients:', err);
      } finally {
        setLoadingClients(false);
      }
    };

    if (activeModalTab === 'clients' || selectedPospForKyc) {
      loadClients();
    }
  }, [selectedPospForKyc, activeModalTab]);

  // Enterprise Native Confirmation Dialog State
  const [confirmDialog, setConfirmDialog] = useState(null); 
  // { isOpen: bool, title: string, description: string, badgeText: string, confirmLabel: string, confirmColor: string, icon: Component, onConfirm: async () => void, isProcessing: bool }

  // Reset Password Modal
  const [resetModalPosp, setResetModalPosp] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetSubmitting, setResetSubmitting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(null);
  const [resetError, setResetError] = useState('');
  const [copiedPass, setCopiedPass] = useState(false);

  // Hidden File Input Ref for Document & Photo Uploads
  const fileInputRef = useRef(null);
  const [currentUploadTarget, setCurrentUploadTarget] = useState(null); // 'PHOTO' | 'PAN' | 'AADHAAR' | 'EDUCATION' | 'CHEQUE' | 'TRAINING'

  // Add form state
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    panNumber: '',
    city: 'Hyderabad',
    state: 'Telangana',
    password: ''
  });

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    try {
      const payload = {
        fullName: form.fullName,
        email: form.email,
        phoneNumber: form.phoneNumber,
        role: 'ROLE_POSP_AGENT',
        designation: 'POSP Agent Partner',
        department: 'POSP Partner Distribution',
        password: form.password || undefined
      };
      const res = await crmService.createUser(payload);
      setSuccessInfo({
        fullName: res.user.fullName,
        email: res.user.email,
        temporaryPassword: res.temporaryPassword
      });
      setShowAddModal(false);
      setForm({
        fullName: '',
        email: '',
        phoneNumber: '',
        panNumber: '',
        city: 'Hyderabad',
        state: 'Telangana',
        password: ''
      });
      if (onRefresh) onRefresh();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to onboard agent');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetModalPosp?.user?.id) return;
    setResetSubmitting(true);
    setResetError('');
    setResetSuccess(null);
    try {
      const res = await crmService.resetPassword(resetModalPosp.user.id, newPassword || undefined);
      setResetSuccess(res);
      setNewPassword('');
    } catch (err) {
      setResetError(err.response?.data?.message || 'Failed to reset credentials');
    } finally {
      setResetSubmitting(false);
    }
  };

  // Trigger file selection for a specific KYC doc or Photo
  const triggerDocUpload = (docType) => {
    setCurrentUploadTarget(docType);
    setDocUploadError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedPospForKyc || !currentUploadTarget) return;

    setUploadingDocType(currentUploadTarget);
    setDocUploadError('');
    try {
      const updatedProfile = await portalService.uploadPOSPDocument(selectedPospForKyc.id, currentUploadTarget, file);
      setSelectedPospForKyc(updatedProfile);
      if (onRefresh) onRefresh();
    } catch (err) {
      setDocUploadError(err.response?.data?.message || 'Failed to upload document file');
    } finally {
      setUploadingDocType(null);
      setCurrentUploadTarget(null);
    }
  };

  // Delete / Remove an uploaded KYC document or photo
  const requestDeleteDoc = (docType, docTitle) => {
    if (!selectedPospForKyc) return;
    const fieldMapping = {
      'PHOTO': 'photoUrl',
      'PAN': 'panDocUrl',
      'AADHAAR': 'aadhaarDocUrl',
      'EDUCATION': 'educationCertificateUrl',
      'CHEQUE': 'cancelledChequeUrl',
      'TRAINING': 'trainingCertificateUrl'
    };
    const targetField = fieldMapping[docType];
    if (!targetField) return;

    setConfirmDialog({
      title: `Delete ${docTitle}?`,
      description: `This will remove the uploaded document record for ${selectedPospForKyc.user?.fullName}. You will be able to upload a fresh file at any time.`,
      badgeText: 'File Removal',
      confirmLabel: 'Delete Document',
      confirmColor: '#dc2626',
      icon: Trash2,
      onConfirm: async () => {
        try {
          const payload = { [targetField]: '' };
          const updated = await portalService.updatePOSPStatus(selectedPospForKyc.id, payload);
          setSelectedPospForKyc(updated);
          if (onRefresh) onRefresh();
          setConfirmDialog(null);
        } catch (err) {
          alert('Failed to delete document: ' + (err.response?.data?.message || err.message));
        }
      }
    });
  };

  // Send WhatsApp Reminder for Missing Documents
  const handleSendMissingDocsReminder = () => {
    if (!selectedPospForKyc || !selectedPospForKyc.user) return;
    const missingDocs = kycDocsConfig.filter(d => !d.fileUrl).map(d => `• ${d.title}`);
    if (missingDocs.length === 0) {
      alert('All 5 mandatory KYC documents have already been uploaded!');
      return;
    }
    const agentName = selectedPospForKyc.user.fullName || 'Partner';
    const message = `Dear ${agentName},\n\nGreetings from Aadhiraksha Insurance.\n\nTo complete your official IRDAI POSP partner accreditation and activate your policy issuance portal, please provide the following missing documents:\n\n${missingDocs.join('\n')}\n\nYou can reply with clear photos/PDFs or log in to upload them. Thank you!`;
    const phone = (selectedPospForKyc.user.phoneNumber || '').replace(/[^0-9]/g, '');
    const cleanPhone = phone.startsWith('91') && phone.length === 12 ? phone : `91${phone}`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  };

  // KYC Verification toggle with confirmation
  const requestKycToggle = (isVerified) => {
    if (!selectedPospForKyc) return;
    setConfirmDialog({
      title: isVerified ? 'Approve & Verify All KYC Documents?' : 'Mark KYC as Incomplete / Unverified?',
      description: isVerified 
        ? `This will officially certify ${selectedPospForKyc.user?.fullName}'s regulatory KYC file under IRDAI guidelines, authorize statutory policy issuance, and mark their status as APPROVED.`
        : `This will mark ${selectedPospForKyc.user?.fullName}'s KYC documents as incomplete or requiring revision. Their accredited policy bookings will be placed on hold until verified.`,
      badgeText: isVerified ? 'IRDAI Regulatory Approval' : 'KYC Re-evaluation',
      confirmLabel: isVerified ? 'Confirm & Verify KYC' : 'Confirm Unverified Status',
      confirmColor: isVerified ? '#059669' : '#d97706',
      icon: isVerified ? ShieldCheck : AlertTriangle,
      onConfirm: async () => {
        try {
          const updated = await portalService.updatePOSPStatus(selectedPospForKyc.id, {
            kycVerified: isVerified,
            status: isVerified ? 'APPROVED' : selectedPospForKyc.status
          });
          setSelectedPospForKyc(updated);
          if (onRefresh) onRefresh();
          setConfirmDialog(null);
        } catch (err) {
          alert('Failed to update KYC status: ' + (err.response?.data?.message || err.message));
        }
      }
    });
  };

  // Status update with native confirmation modal
  const requestStatusChange = (posp, newStatus) => {
    const isApprove = newStatus === 'APPROVED';
    const isReject = newStatus === 'REJECTED';
    setConfirmDialog({
      title: isApprove 
        ? `Approve POSP Accreditation for ${posp.user?.fullName}?`
        : isReject
        ? `Reject or Suspend ${posp.user?.fullName}'s POSP Accreditation?`
        : `Put ${posp.user?.fullName}'s Application Under Review?`,
      description: isApprove
        ? `This grants active IRDAI Point-of-Sale licensing, enables instant quote creation and commission earnings, and activates their partner account.`
        : isReject
        ? `This suspends or rejects ${posp.user?.fullName}'s POSP credentials and locks direct portal access. You can reactivate them at any time.`
        : `This changes status back to Pending KYC review.`,
      badgeText: isApprove ? 'Accreditation Sign-off' : isReject ? 'Partner Suspension' : 'KYC Review',
      confirmLabel: isApprove ? 'Approve Partner' : isReject ? 'Reject / Suspend' : 'Mark Pending',
      confirmColor: isApprove ? '#059669' : isReject ? '#dc2626' : '#d97706',
      icon: isApprove ? CheckCircle2 : isReject ? XCircle : Clock,
      onConfirm: async () => {
        try {
          await onUpdateStatus(posp.id, newStatus);
          if (selectedPospForKyc && selectedPospForKyc.id === posp.id) {
            setSelectedPospForKyc({
              ...selectedPospForKyc,
              status: newStatus,
              kycVerified: isApprove ? true : selectedPospForKyc.kycVerified
            });
          }
          if (onRefresh) onRefresh();
          setConfirmDialog(null);
        } catch (err) {
          alert('Action failed: ' + (err.response?.data?.message || err.message));
        }
      }
    });
  };

  const handleSaveBankInfo = async (e) => {
    e.preventDefault();
    if (!selectedPospForKyc) return;
    setSavingBankInfo(true);
    try {
      const updated = await portalService.updatePOSPStatus(selectedPospForKyc.id, {
        bankName: bankEditForm.bankName,
        bankAccountNumber: bankEditForm.bankAccountNumber,
        ifscCode: bankEditForm.ifscCode
      });
      setSelectedPospForKyc(updated);
      setIsEditingBankInfo(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Failed to update bank details: ' + (err.response?.data?.message || err.message));
    } finally {
      setSavingBankInfo(false);
    }
  };

  // WhatsApp quick connect helper
  const openWhatsApp = (phone, name) => {
    if (!phone) return;
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const fullNumber = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
    const text = encodeURIComponent(`Hello ${name},\nRegarding your POSP Insurance Partner accreditation with Aadhiraksha Insurance & Financial Services.`);
    window.open(`https://wa.me/${fullNumber}?text=${text}`, '_blank');
  };

  // Filtered dataset
  const filteredList = useMemo(() => {
    return pospList.filter(item => {
      const name = item.user?.fullName || '';
      const email = item.user?.email || '';
      const phone = item.user?.phoneNumber || '';
      const pan = item.panNumber || '';
      const city = item.city || '';
      const state = item.state || '';
      const term = searchQuery.toLowerCase().trim();

      const matchesSearch = !term || 
        name.toLowerCase().includes(term) ||
        email.toLowerCase().includes(term) ||
        phone.toLowerCase().includes(term) ||
        pan.toLowerCase().includes(term) ||
        city.toLowerCase().includes(term) ||
        state.toLowerCase().includes(term);

      const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [pospList, searchQuery, statusFilter]);

  const counts = useMemo(() => {
    return {
      all: pospList.length,
      pending: pospList.filter(p => p.status === 'PENDING').length,
      approved: pospList.filter(p => p.status === 'APPROVED').length,
      rejected: pospList.filter(p => p.status === 'REJECTED').length
    };
  }, [pospList]);

  // Mandatory IRDAI Documents Checklist Definition
  const kycDocsConfig = [
    {
      id: 'PAN',
      title: 'PAN Card Copy',
      subtitle: 'Mandatory Government Identity & Tax Filing Proof',
      fileUrl: selectedPospForKyc?.panDocUrl,
      docCode: selectedPospForKyc?.panNumber || 'PAN Pending',
      isMandatory: true
    },
    {
      id: 'AADHAAR',
      title: 'Aadhaar Card (Front & Back)',
      subtitle: 'UIDAI Residential & Age Verification',
      fileUrl: selectedPospForKyc?.aadhaarDocUrl,
      docCode: selectedPospForKyc?.aadhaarNumber || 'Aadhaar Pending',
      isMandatory: true
    },
    {
      id: 'EDUCATION',
      title: '10th / 12th Educational Pass Certificate',
      subtitle: 'IRDAI Statutory Minimum Educational Qualification Proof',
      fileUrl: selectedPospForKyc?.educationCertificateUrl,
      docCode: 'SSLC / Intermediate / Degree',
      isMandatory: true
    },
    {
      id: 'CHEQUE',
      title: 'Cancelled Cheque / Bank Passbook',
      subtitle: 'Official Bank Account Verification for Commission Payouts',
      fileUrl: selectedPospForKyc?.cancelledChequeUrl,
      docCode: selectedPospForKyc?.bankAccountNumber ? `A/C: ••••${selectedPospForKyc.bankAccountNumber.slice(-4)}` : 'Bank Proof',
      isMandatory: true
    },
    {
      id: 'TRAINING',
      title: 'POSP 15-Hour Training & Exam Certificate',
      subtitle: 'IRDAI Point-of-Sale Person Accreditation Certificate',
      fileUrl: selectedPospForKyc?.trainingCertificateUrl,
      docCode: selectedPospForKyc?.certificateNumber || selectedPospForKyc?.irdaiLicenseCode || 'IRDAI-POSP-15HR-PASS',
      isMandatory: true
    }
  ];

  return (
    <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      {/* Hidden File Input for KYC Uploads */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelected}
        style={{ display: 'none' }}
        accept="image/*,application/pdf"
      />

      {/* HEADER SECTION */}
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#091726', margin: 0 }}>POSP Agent Applications & Network</h3>
            <span style={{ 
              background: '#e0f2fe', 
              color: '#0369a1', 
              fontSize: '0.72rem', 
              fontWeight: 800, 
              padding: '2px 8px', 
              borderRadius: '999px' 
            }}>
              {counts.all} Partners Total
            </span>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.2rem 0 0' }}>
            Manage IRDAI accredited Point-of-Sale Persons, KYC compliance, certificates, credentials, and portfolios
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {canCreatePosp && (
            <button
              onClick={() => { setErrorMsg(''); setShowAddModal(true); }}
              className="crm-emerald-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <UserPlus size={15} /> Onboard New Agent
            </button>
          )}
        </div>
      </div>

      {/* FILTER & SEARCH TOOLBAR */}
      <div style={{
        padding: '0.85rem 1.5rem',
        background: '#f8fafc',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.85rem'
      }}>
        {/* Status Filter Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto', maxWidth: '100%' }}>
          {[
            { id: 'ALL', label: 'All Partners', count: counts.all, color: '#475569' },
            { id: 'APPROVED', label: 'Approved', count: counts.approved, color: '#16a34a' },
            { id: 'PENDING', label: 'Pending KYC', count: counts.pending, color: '#d97706' },
            { id: 'REJECTED', label: 'Rejected', count: counts.rejected, color: '#dc2626' }
          ].map(tab => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                style={{
                  border: 'none',
                  background: isActive ? '#0f2b48' : '#ffffff',
                  color: isActive ? '#ffffff' : '#475569',
                  padding: '5px 12px',
                  borderRadius: '20px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.1)' : '0 1px 2px rgba(0,0,0,0.03)',
                  border: isActive ? '1px solid #0f2b48' : '1px solid #e2e8f0',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>{tab.label}</span>
                <span style={{
                  background: isActive ? 'rgba(255,255,255,0.2)' : '#f1f5f9',
                  color: isActive ? '#ffffff' : tab.color,
                  padding: '1px 6px',
                  borderRadius: '10px',
                  fontSize: '0.7rem',
                  fontWeight: 800
                }}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search input */}
        <div style={{ position: 'relative', width: '280px', maxWidth: '100%' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search name, phone, PAN, city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 10px 6px 32px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.82rem',
              outline: 'none',
              background: '#ffffff'
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* SUCCESS BANNER */}
      {successInfo && (
        <div style={{
          margin: '1rem 1.5rem',
          padding: '1rem 1.25rem',
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '10px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#166534', fontWeight: 700, fontSize: '0.9rem' }}>
              <CheckCircle size={18} /> POSP Agent Onboarded Successfully!
            </div>
            <div style={{ fontSize: '0.82rem', color: '#15803d', marginTop: '4px' }}>
              <strong>{successInfo.fullName}</strong> ({successInfo.email}) has been provisioned. 
              Temporary Password: <code style={{ background: '#dcfce7', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>{successInfo.temporaryPassword}</code>
            </div>
          </div>
          <button
            onClick={() => setSuccessInfo(null)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#166534' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* DESKTOP TABLE VIEW (>= 768px) */}
      <div className="crm-desktop-table-container" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <tr>
              <th style={{ padding: '0.9rem 1rem', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#475569', fontWeight: 700 }}>
                Applicant & Partner Name
              </th>
              <th style={{ padding: '0.9rem 1rem', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#475569', fontWeight: 700 }}>
                Location
              </th>
              <th style={{ padding: '0.9rem 1rem', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#475569', fontWeight: 700 }}>
                PAN & Aadhaar KYC
              </th>
              <th style={{ padding: '0.9rem 1rem', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#475569', fontWeight: 700 }}>
                KYC Verification
              </th>
              <th style={{ padding: '0.9rem 1rem', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#475569', fontWeight: 700 }}>
                Status
              </th>
              <th style={{ padding: '0.9rem 1rem', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#475569', fontWeight: 700, textAlign: 'center' }}>
                Management Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredList.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                  {searchQuery || statusFilter !== 'ALL' 
                    ? 'No POSP partners matching your active search/filter.' 
                    : 'No POSP applications registered.'}
                </td>
              </tr>
            ) : (
              filteredList.map((posp) => {
                const isApproved = posp.status === 'APPROVED';
                const isPending = posp.status === 'PENDING';
                const isRejected = posp.status === 'REJECTED';
                const hasPhoto = !!posp.photoUrl;

                return (
                  <tr key={posp.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}>
                    {/* Name & Photo */}
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {hasPhoto ? (
                          <img
                            src={posp.photoUrl}
                            alt={posp.user?.fullName}
                            style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '50%',
                              objectFit: 'cover',
                              border: '1.5px solid #cbd5e1'
                            }}
                          />
                        ) : (
                          <div style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '50%',
                            background: isApproved ? '#dcfce7' : isPending ? '#fef3c7' : '#fee2e2',
                            color: isApproved ? '#15803d' : isPending ? '#b45309' : '#b91c1c',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '0.88rem',
                            flexShrink: 0
                          }}>
                            {(posp.user?.fullName || 'P').charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: 700, color: '#091726', fontSize: '0.92rem' }}>
                            {posp.user?.fullName || 'POSP Partner'}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span>{posp.user?.email}</span>
                            {posp.user?.phoneNumber && <span>• {posp.user.phoneNumber}</span>}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Location */}
                    <td style={{ padding: '1rem', color: '#334155', fontSize: '0.86rem' }}>
                      <div style={{ fontWeight: 600 }}>{posp.city || 'Hyderabad'}</div>
                      <div style={{ fontSize: '0.76rem', color: '#64748b' }}>{posp.state || 'Telangana'}</div>
                    </td>

                    {/* PAN & Aadhaar */}
                    <td style={{ padding: '1rem', fontSize: '0.82rem' }}>
                      <div style={{ fontFamily: 'monospace', color: '#0f2b48', fontWeight: 600 }}>
                        PAN: <strong>{posp.panNumber || '-'}</strong>
                      </div>
                      <div style={{ color: '#64748b', fontSize: '0.78rem', marginTop: '2px' }}>
                        Aadhaar: {posp.aadhaarNumber || 'Not submitted'}
                      </div>
                    </td>

                    {/* KYC Verification Badge */}
                    <td style={{ padding: '1rem', fontSize: '0.84rem' }}>
                      {posp.kycVerified ? (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          background: '#ecfdf5',
                          color: '#047857',
                          border: '1px solid #a7f3d0',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '0.74rem',
                          fontWeight: 700
                        }}>
                          <ShieldCheck size={13} color="#047857" /> IRDAI Verified
                        </span>
                      ) : (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          background: '#fffbeb',
                          color: '#b45309',
                          border: '1px solid #fde68a',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '0.74rem',
                          fontWeight: 700
                        }}>
                          <Clock size={13} color="#b45309" /> Pending Docs
                        </span>
                      )}
                    </td>

                    {/* Status badge */}
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        background: isApproved ? '#dcfce7' : isPending ? '#fef3c7' : '#fee2e2',
                        color: isApproved ? '#15803d' : isPending ? '#b45309' : '#b91c1c',
                        padding: '3px 10px',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        {isApproved && <CheckCircle2 size={12} />}
                        {isPending && <Clock size={12} />}
                        {isRejected && <XCircle size={12} />}
                        {posp.status}
                      </span>
                    </td>

                    {/* Action Dropdown Column */}
                    <td style={{ padding: '1rem', textAlign: 'center', position: 'relative' }}>
                      <ActionDropdown
                        align="center"
                        menuWidth="220px"
                        trigger={({ isOpen }) => (
                          <button
                            type="button"
                            title="Management Actions"
                            style={{
                              padding: '6px 10px',
                              background: isOpen ? '#f1f5f9' : '#ffffff',
                              border: '1px solid #cbd5e1',
                              borderRadius: '7px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#334155',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <MoreVertical size={15} />
                          </button>
                        )}
                      >
                        {({ close }) => (
                          <>
                            {posp.user?.phoneNumber && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    close();
                                    openWhatsApp(posp.user.phoneNumber, posp.user.fullName);
                                  }}
                                  className="crm-popover-btn"
                                >
                                  <WhatsAppIcon size={14} color="#16a34a" />
                                  <span>Chat on WhatsApp</span>
                                </button>

                                <a
                                  href={`tel:${posp.user.phoneNumber}`}
                                  onClick={() => close()}
                                  className="crm-popover-btn"
                                  style={{ textDecoration: 'none' }}
                                >
                                  <PhoneCall size={14} color="#0f2b48" />
                                  <span>Call Partner</span>
                                </a>

                                <div style={{ height: '1px', background: 'var(--crm-border-subtle)', margin: '4px 0' }} />
                              </>
                            )}

                            <button
                              type="button"
                              onClick={() => {
                                close();
                                setActiveModalTab('overview');
                                setSelectedPospForKyc(posp);
                              }}
                              className="crm-popover-btn"
                            >
                              <Eye size={14} color="#0284c7" />
                              <span>View Partner Profile & KYC</span>
                            </button>

                              <button
                                type="button"
                                onClick={() => {
                                  close();
                                  setActiveModalTab('clients');
                                  setSelectedPospForKyc(posp);
                                }}
                                className="crm-popover-btn"
                              >
                                <Users size={14} color="#7c3aed" />
                                <span>View Attributed Clients</span>
                              </button>

                              {(isSuperAdmin || isManager) && posp.user?.id && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    close();
                                    setResetModalPosp(posp);
                                    setNewPassword('');
                                    setResetError('');
                                    setResetSuccess(null);
                                  }}
                                  className="crm-popover-btn"
                                >
                                  <Key size={14} color="#d97706" />
                                  <span>Reset Portal Password</span>
                                </button>
                              )}


                            </>
                          )}
                        </ActionDropdown>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* MOBILE CARD DECK VIEW (< 768px) */}
      <div className="crm-mobile-cards-container">
        {filteredList.length === 0 ? (
          <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: '#64748b', background: '#fff', borderRadius: '12px' }}>
            No POSP partners matching your active search/filter.
          </div>
        ) : (
          filteredList.map((posp) => (
            <div
              key={posp.id}
              style={{
                background: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                boxShadow: '0 2px 5px rgba(0,0,0,0.03)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {posp.photoUrl ? (
                    <img
                      src={posp.photoUrl}
                      alt={posp.user?.fullName}
                      style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e0f2fe', color: '#0369a1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                      {(posp.user?.fullName || 'P').charAt(0)}
                    </div>
                  )}
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0f2b48' }}>{posp.user?.fullName}</div>
                    <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '2px' }}>
                      {posp.city}, {posp.state} • {posp.experienceYears || 0} Yrs Exp
                    </div>
                  </div>
                </div>
                <span style={{
                  background: posp.status === 'APPROVED' ? '#dcfce7' : posp.status === 'PENDING' ? '#fef3c7' : '#fee2e2',
                  color: posp.status === 'APPROVED' ? '#15803d' : posp.status === 'PENDING' ? '#b45309' : '#b91c1c',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '9999px',
                  fontSize: '0.72rem',
                  fontWeight: 800
                }}>
                  {posp.status}
                </span>
              </div>

              <div style={{ background: '#f8fafc', padding: '0.65rem 0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.78rem' }}>
                <div>PAN: <strong>{posp.panNumber}</strong></div>
                <div>Aadhaar: <strong>{posp.aadhaarNumber || 'Not submitted'}</strong></div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setActiveModalTab('overview');
                    setSelectedPospForKyc(posp);
                  }}
                  style={{
                    background: '#f1f5f9',
                    color: '#0f2b48',
                    border: '1px solid #cbd5e1',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                >
                  <Eye size={14} /> Full Profile
                </button>

                {posp.user?.phoneNumber && (
                  <button
                    type="button"
                    onClick={() => openWhatsApp(posp.user.phoneNumber, posp.user.fullName)}
                    style={{
                      background: '#16a34a',
                      color: '#ffffff',
                      border: 'none',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.35rem'
                    }}
                  >
                    <WhatsAppIcon size={14} color="#ffffff" /> WhatsApp
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* COMPREHENSIVE POSP PARTNER PROFILE & KYC DOCUMENT SUITE MODAL */}
      {selectedPospForKyc && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            maxWidth: '680px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '90vh'
          }}>
            {/* Modal Header */}
            <div className="crm-modal-header" style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', background: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {selectedPospForKyc.photoUrl ? (
                  <img
                    src={selectedPospForKyc.photoUrl}
                    alt={selectedPospForKyc.user?.fullName}
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      objectFit: 'cover',
                      border: '1.5px solid #cbd5e1'
                    }}
                  />
                ) : (
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: '#f1f5f9',
                    border: '1.5px solid #cbd5e1',
                    color: '#0f2b48',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.1rem'
                  }}>
                    {(selectedPospForKyc.user?.fullName || 'P').charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#091726' }}>
                    POSP Partner Profile & KYC
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: 700, color: '#0f2b48' }}>{selectedPospForKyc.user?.fullName}</span>
                    <span>•</span>
                    <span>ID #{selectedPospForKyc.id}</span>
                    <span>•</span>
                    <span style={{ color: selectedPospForKyc.kycVerified ? '#16a34a' : '#d97706', fontWeight: 700 }}>
                      {selectedPospForKyc.kycVerified ? '✓ KYC Verified' : '⚠ KYC Incomplete'}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {selectedPospForKyc.user?.phoneNumber && (
                  <button
                    type="button"
                    onClick={() => openWhatsApp(selectedPospForKyc.user.phoneNumber, selectedPospForKyc.user.fullName)}
                    title="Send WhatsApp Message"
                    style={{
                      background: '#f0fdf4',
                      color: '#16a34a',
                      border: '1px solid #bbf7d0',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 700
                    }}
                  >
                    <WhatsAppIcon size={14} color="#16a34a" /> WhatsApp
                  </button>
                )}

                <button
                  onClick={() => setSelectedPospForKyc(null)}
                  className="crm-modal-close-btn"
                  title="Close"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Segmented Modal Tabs */}
            <div style={{
              display: 'flex',
              padding: '0.5rem 1.5rem 0',
              background: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
              gap: '0.5rem'
            }}>
              {[
                { id: 'overview', label: 'Partner Bio & Accreditation' },
                { id: 'documents', label: 'KYC Files & Certificates (5)' },
                { id: 'banking', label: 'Banking & Payouts' },
                { id: 'clients', label: `Attributed Clients (${partnerClients.length})` }
              ].map(tab => {
                const isActive = activeModalTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveModalTab(tab.id)}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      padding: '0.65rem 0.85rem',
                      fontSize: '0.82rem',
                      fontWeight: isActive ? 800 : 600,
                      color: isActive ? '#0284c7' : '#64748b',
                      borderBottom: isActive ? '2.5px solid #0284c7' : '2.5px solid transparent',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Modal Body Container */}
            <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
              {docUploadError && (
                <div style={{ padding: '8px 12px', background: '#fee2e2', color: '#991b1b', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600, marginBottom: '1rem' }}>
                  {docUploadError}
                </div>
              )}

              {/* TAB 1: OVERVIEW & ACCREDITATION */}
              {activeModalTab === 'overview' && (
                <div>
                  {/* Status & Accreditation Governance Pill */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.85rem 1.15rem',
                    background: '#f8fafc',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    marginBottom: '1.25rem'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Accreditation Status
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          background: selectedPospForKyc.status === 'APPROVED' ? '#dcfce7' : selectedPospForKyc.status === 'PENDING' ? '#fef3c7' : '#fee2e2',
                          color: selectedPospForKyc.status === 'APPROVED' ? '#15803d' : selectedPospForKyc.status === 'PENDING' ? '#b45309' : '#b91c1c',
                          padding: '3px 10px',
                          borderRadius: '999px',
                          fontSize: '0.78rem',
                          fontWeight: 800
                        }}>
                          {selectedPospForKyc.status === 'APPROVED' && <CheckCircle2 size={13} />}
                          {selectedPospForKyc.status === 'PENDING' && <Clock size={13} />}
                          {selectedPospForKyc.status === 'REJECTED' && <XCircle size={13} />}
                          {selectedPospForKyc.status}
                        </span>
                        <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
                          {selectedPospForKyc.status === 'APPROVED' ? '• Active Point-of-Sale Partner' : '• Accreditation On Hold'}
                        </span>
                      </div>
                    </div>

                    {/* Neutral Administrative Status Selector Dropdown */}
                    <ActionDropdown
                      align="right"
                      menuWidth="220px"
                      trigger={({ isOpen }) => (
                        <button
                          type="button"
                          style={{
                            background: isOpen ? '#f1f5f9' : '#ffffff',
                            border: '1px solid #cbd5e1',
                            color: '#334155',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: '0.76rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <span>Manage Status</span>
                          <ChevronDown size={13} color="#64748b" />
                        </button>
                      )}
                    >
                      {({ close }) => (
                        <>
                          {selectedPospForKyc.status !== 'APPROVED' && (
                            <button
                              type="button"
                              onClick={() => {
                                close();
                                requestStatusChange(selectedPospForKyc, 'APPROVED');
                              }}
                              className="crm-popover-btn"
                              style={{ color: '#16a34a' }}
                            >
                              <CheckCircle2 size={14} color="#16a34a" />
                              <span>Approve Partner</span>
                            </button>
                          )}

                          {selectedPospForKyc.status !== 'PENDING' && (
                            <button
                              type="button"
                              onClick={() => {
                                close();
                                requestStatusChange(selectedPospForKyc, 'PENDING');
                              }}
                              className="crm-popover-btn"
                              style={{ color: '#d97706' }}
                            >
                              <Clock size={14} color="#d97706" />
                              <span>Mark Under KYC Review</span>
                            </button>
                          )}

                          {selectedPospForKyc.status !== 'REJECTED' && (
                            <button
                              type="button"
                              onClick={() => {
                                close();
                                requestStatusChange(selectedPospForKyc, 'REJECTED');
                              }}
                              className="crm-popover-btn"
                              style={{ color: '#dc2626' }}
                            >
                              <XCircle size={14} color="#dc2626" />
                              <span>Suspend / Reject Partner</span>
                            </button>
                          )}
                        </>
                      )}
                    </ActionDropdown>
                  </div>

                  {/* Photo Upload Card */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem',
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    marginBottom: '1.25rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {selectedPospForKyc.photoUrl ? (
                        <img
                          src={selectedPospForKyc.photoUrl}
                          alt="Agent Profile"
                          style={{ width: '52px', height: '52px', borderRadius: '12px', objectFit: 'cover', border: '1px solid #cbd5e1' }}
                        />
                      ) : (
                        <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                          <Camera size={22} />
                        </div>
                      )}
                      <div>
                        <div style={{ fontWeight: 700, color: '#091726', fontSize: '0.88rem' }}>Official Agent Photo</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Passport-size photo for POSP ID card & portal verification</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      {selectedPospForKyc.photoUrl && (
                        <button
                          type="button"
                          onClick={() => setPreviewDoc({ title: 'Agent Photo', url: selectedPospForKyc.photoUrl })}
                          style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#0f2b48', padding: '6px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Eye size={12} /> Preview
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => triggerDocUpload('PHOTO')}
                        disabled={uploadingDocType === 'PHOTO'}
                        style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Upload size={12} /> {uploadingDocType === 'PHOTO' ? 'Uploading...' : (selectedPospForKyc.photoUrl ? 'Replace Photo' : 'Upload Photo')}
                      </button>
                    </div>
                  </div>

                  {/* Data Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
                    <div>
                      <label style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, display: 'block' }}>Email Address</label>
                      <div style={{ fontWeight: 600, color: '#0f2b48', wordBreak: 'break-all' }}>{selectedPospForKyc.user?.email}</div>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, display: 'block' }}>Phone Number</label>
                      <div style={{ fontWeight: 600, color: '#0f2b48' }}>{selectedPospForKyc.user?.phoneNumber || '-'}</div>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, display: 'block' }}>PAN Card Number</label>
                      <div style={{ fontWeight: 700, fontFamily: 'monospace', color: '#0f2b48' }}>{selectedPospForKyc.panNumber || '-'}</div>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, display: 'block' }}>Aadhaar Number</label>
                      <div style={{ fontWeight: 600, color: '#0f2b48' }}>{selectedPospForKyc.aadhaarNumber || 'Not submitted'}</div>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, display: 'block' }}>Operating Location</label>
                      <div style={{ fontWeight: 600, color: '#0f2b48' }}>{selectedPospForKyc.city}, {selectedPospForKyc.state}</div>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, display: 'block' }}>Industry Experience</label>
                      <div style={{ fontWeight: 600, color: '#0f2b48' }}>{selectedPospForKyc.experienceYears || 0} Years</div>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, display: 'block' }}>IRDAI Accreditation Code</label>
                      <div style={{ fontWeight: 600, color: '#0f2b48' }}>{selectedPospForKyc.irdaiLicenseCode || 'IRDAI-POSP-REG-AUTH'}</div>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, display: 'block' }}>Contracted Commission Rate</label>
                      <div style={{ fontWeight: 700, color: '#16a34a' }}>{selectedPospForKyc.defaultCommissionRate || 15}% Standard</div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: KYC DOCUMENTS & CERTIFICATES */}
              {activeModalTab === 'documents' && (() => {
                const totalDocs = kycDocsConfig.length;
                const uploadedCount = kycDocsConfig.filter(d => !!d.fileUrl).length;
                const completionPercent = Math.round((uploadedCount / totalDocs) * 100);
                const allUploaded = uploadedCount === totalDocs;

                return (
                  <div>
                    {/* Compliance Progress Bar & Header Banner */}
                    <div style={{
                      padding: '1rem 1.15rem',
                      background: allUploaded ? '#ecfdf5' : '#f8fafc',
                      borderRadius: '12px',
                      border: allUploaded ? '1px solid #a7f3d0' : '1px solid #e2e8f0',
                      marginBottom: '1rem'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem', gap: '1rem' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 800, color: allUploaded ? '#047857' : '#091726', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <ShieldCheck size={16} color={allUploaded ? '#059669' : '#0284c7'} />
                            <span>IRDAI Regulatory Compliance Verification</span>
                            {allUploaded && (
                              <span style={{ background: '#059669', color: '#ffffff', fontSize: '0.68rem', fontWeight: 800, padding: '1px 6px', borderRadius: '4px' }}>
                                100% Complete
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: allUploaded ? '#065f46' : '#64748b', marginTop: '2px', lineHeight: 1.4 }}>
                            {allUploaded 
                              ? 'All 5 mandatory IRDAI compliance documents have been submitted and are ready for official verification.' 
                              : `${uploadedCount} of ${totalDocs} mandatory documents submitted (${completionPercent}%). All 5 are required for active licensing.`}
                          </div>
                        </div>

                        {/* Top-Right Action Suite: Manage Status on top, Follow-up Checklist below */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', flexShrink: 0, marginLeft: 'auto' }}>
                          {/* Identical Administrative Status Selector Dropdown */}
                          <ActionDropdown
                            align="right"
                            menuWidth="220px"
                            trigger={({ isOpen }) => (
                              <button
                                type="button"
                                style={{
                                  background: isOpen ? '#f1f5f9' : '#ffffff',
                                  border: '1px solid #cbd5e1',
                                  color: '#334155',
                                  padding: '6px 14px',
                                  borderRadius: '8px',
                                  fontSize: '0.76rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  transition: 'all 0.15s ease',
                                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                                }}
                              >
                                <span>Manage Status</span>
                                <ChevronDown size={13} color="#64748b" />
                              </button>
                            )}
                          >
                            {({ close }) => (
                              <>
                                {selectedPospForKyc.status !== 'APPROVED' && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      close();
                                      requestStatusChange(selectedPospForKyc, 'APPROVED');
                                    }}
                                    className="crm-popover-btn"
                                    style={{ color: '#16a34a' }}
                                  >
                                    <CheckCircle2 size={14} color="#16a34a" />
                                    <span>Approve Partner</span>
                                  </button>
                                )}

                                {selectedPospForKyc.status !== 'PENDING' && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      close();
                                      requestStatusChange(selectedPospForKyc, 'PENDING');
                                    }}
                                    className="crm-popover-btn"
                                    style={{ color: '#d97706' }}
                                  >
                                    <Clock size={14} color="#d97706" />
                                    <span>Mark Under KYC Review</span>
                                  </button>
                                )}

                                {selectedPospForKyc.status !== 'REJECTED' && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      close();
                                      requestStatusChange(selectedPospForKyc, 'REJECTED');
                                    }}
                                    className="crm-popover-btn"
                                    style={{ color: '#dc2626' }}
                                  >
                                    <XCircle size={14} color="#dc2626" />
                                    <span>Suspend / Reject Partner</span>
                                  </button>
                                )}
                              </>
                            )}
                          </ActionDropdown>

                          {!allUploaded && selectedPospForKyc.user?.phoneNumber && (
                            <button
                              type="button"
                              onClick={handleSendMissingDocsReminder}
                              title="Send WhatsApp reminder listing missing documents"
                              style={{
                                background: '#ffffff',
                                color: '#16a34a',
                                border: '1px solid #86efac',
                                padding: '5px 11px',
                                borderRadius: '7px',
                                fontSize: '0.73rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                              }}
                            >
                              <WhatsAppIcon size={13} color="#16a34a" /> Send Missing Checklist ({totalDocs - uploadedCount})
                            </button>
                          )}

                          {allUploaded && (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              background: '#dcfce7',
                              color: '#15803d',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '0.72rem',
                              fontWeight: 700
                            }}>
                              <CheckCircle2 size={12} color="#16a34a" /> All 5 Files Submitted
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Visual Progress Bar */}
                      <div style={{
                        width: '100%',
                        height: '6px',
                        background: allUploaded ? '#bbf7d0' : '#e2e8f0',
                        borderRadius: '999px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${completionPercent}%`,
                          height: '100%',
                          background: allUploaded ? '#059669' : completionPercent >= 60 ? '#0284c7' : '#d97706',
                          borderRadius: '999px',
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                    </div>

                    {/* Document Cards List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {kycDocsConfig.map(doc => {
                        const isUploaded = !!doc.fileUrl;
                        const isCurrentlyUploading = uploadingDocType === doc.id;

                        return (
                          <div
                            key={doc.id}
                            style={{
                              padding: '0.85rem 1rem',
                              borderRadius: '10px',
                              border: isUploaded ? '1px solid #cbd5e1' : '1px dashed #cbd5e1',
                              background: isUploaded ? '#ffffff' : '#fafafa',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              gap: '1rem'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                              <div style={{
                                width: '38px',
                                height: '38px',
                                borderRadius: '8px',
                                background: isUploaded ? '#ecfdf5' : '#f1f5f9',
                                color: isUploaded ? '#059669' : '#94a3b8',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                              }}>
                                <FileText size={18} />
                              </div>

                              <div style={{ minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                  <span style={{ fontWeight: 700, fontSize: '0.86rem', color: '#091726' }}>{doc.title}</span>
                                  {isUploaded ? (
                                    <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '0.68rem', fontWeight: 800, padding: '1px 6px', borderRadius: '4px' }}>
                                      ✓ Uploaded
                                    </span>
                                  ) : (
                                    <span style={{ background: '#fee2e2', color: '#991b1b', fontSize: '0.68rem', fontWeight: 800, padding: '1px 6px', borderRadius: '4px' }}>
                                      Missing File
                                    </span>
                                  )}
                                </div>
                                <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {doc.subtitle}
                                </div>
                              </div>
                            </div>

                            {/* Action Suite: Single Upload button OR Primary View + ActionDropdown */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                              {isUploaded ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => setPreviewDoc({ title: doc.title, url: doc.fileUrl })}
                                    style={{
                                      background: '#f8fafc',
                                      border: '1px solid #cbd5e1',
                                      color: '#0f2b48',
                                      padding: '6px 12px',
                                      borderRadius: '7px',
                                      fontSize: '0.75rem',
                                      fontWeight: 700,
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '5px',
                                      transition: 'all 0.15s ease'
                                    }}
                                  >
                                    <Eye size={13} color="#0284c7" /> View File
                                  </button>

                                  <ActionDropdown
                                    align="right"
                                    menuWidth="160px"
                                    trigger={({ isOpen }) => (
                                      <button
                                        type="button"
                                        title={`Options for ${doc.title}`}
                                        style={{
                                          background: isOpen ? '#f1f5f9' : '#ffffff',
                                          border: '1px solid #cbd5e1',
                                          color: '#475569',
                                          padding: '6px 8px',
                                          borderRadius: '7px',
                                          cursor: 'pointer',
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          transition: 'all 0.15s ease'
                                        }}
                                      >
                                        <MoreVertical size={14} />
                                      </button>
                                    )}
                                  >
                                    {({ close }) => (
                                      <>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            close();
                                            triggerDocUpload(doc.id);
                                          }}
                                          disabled={isCurrentlyUploading}
                                          className="crm-popover-btn"
                                        >
                                          <Upload size={13} color="#0284c7" />
                                          <span>{isCurrentlyUploading ? 'Uploading...' : 'Replace File'}</span>
                                        </button>

                                        <button
                                          type="button"
                                          onClick={() => {
                                            close();
                                            requestDeleteDoc(doc.id, doc.title);
                                          }}
                                          className="crm-popover-btn"
                                          style={{ color: '#dc2626' }}
                                        >
                                          <Trash2 size={13} color="#dc2626" />
                                          <span>Delete File</span>
                                        </button>
                                      </>
                                    )}
                                  </ActionDropdown>
                                </>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => triggerDocUpload(doc.id)}
                                  disabled={isCurrentlyUploading}
                                  style={{
                                    background: '#0284c7',
                                    color: '#ffffff',
                                    border: 'none',
                                    padding: '6px 14px',
                                    borderRadius: '7px',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '5px'
                                  }}
                                >
                                  <Upload size={13} />
                                  {isCurrentlyUploading ? 'Uploading...' : 'Upload'}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* TAB 3: BANKING & PAYOUTS */}
              {activeModalTab === 'banking' && (
                <div>
                  <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                      <div style={{ fontWeight: 700, color: '#0f2b48', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CreditCard size={16} color="#0284c7" /> Direct Bank Deposit Verification
                      </div>
                      {(isSuperAdmin || isManager) && (
                        <button
                          type="button"
                          onClick={() => {
                            setBankEditForm({
                              bankName: selectedPospForKyc.bankName || 'HDFC Bank',
                              bankAccountNumber: selectedPospForKyc.bankAccountNumber || '5010043219825678',
                              ifscCode: selectedPospForKyc.ifscCode || 'HDFC0001234'
                            });
                            setIsEditingBankInfo(true);
                          }}
                          style={{
                            background: '#ffffff',
                            border: '1px solid #cbd5e1',
                            color: '#0284c7',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Edit3 size={12} /> Edit Bank Info
                        </button>
                      )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.84rem' }}>
                      <div>
                        <label style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, display: 'block' }}>Bank Name</label>
                        <div style={{ fontWeight: 700, color: '#0f2b48' }}>{selectedPospForKyc.bankName || 'HDFC Bank'}</div>
                      </div>
                      <div>
                        <label style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, display: 'block' }}>IFSC Code</label>
                        <div style={{ fontWeight: 700, fontFamily: 'monospace', color: '#0f2b48' }}>{selectedPospForKyc.ifscCode || 'HDFC0001234'}</div>
                      </div>

                      {/* Interactive Bank Account Number with Eye Reveal & 1-Click Copy */}
                      <div>
                        <label style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, display: 'block' }}>Bank Account Number</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                          <span style={{ fontWeight: 700, fontFamily: 'monospace', color: '#0f2b48', fontSize: '0.9rem', letterSpacing: '0.5px' }}>
                            {showFullBankAccount 
                              ? (selectedPospForKyc.bankAccountNumber || '5010043219825678')
                              : (selectedPospForKyc.bankAccountNumber 
                                  ? `••••••••${selectedPospForKyc.bankAccountNumber.slice(-4)}`
                                  : '••••••••5678')}
                          </span>
                          
                          {/* Toggle Reveal Button */}
                          <button
                            type="button"
                            onClick={() => setShowFullBankAccount(!showFullBankAccount)}
                            title={showFullBankAccount ? 'Mask Account Number' : 'Reveal Full Account Number'}
                            style={{
                              background: '#ffffff',
                              border: '1px solid #cbd5e1',
                              color: '#64748b',
                              padding: '3px 6px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            {showFullBankAccount ? <EyeOff size={13} color="#0284c7" /> : <Eye size={13} />}
                          </button>

                          {/* 1-Tap Copy Account Number */}
                          <button
                            type="button"
                            onClick={() => {
                              const accNum = selectedPospForKyc.bankAccountNumber || '5010043219825678';
                              navigator.clipboard.writeText(accNum);
                              setCopiedBankAcc(true);
                              setTimeout(() => setCopiedBankAcc(false), 2000);
                            }}
                            title="Copy Account Number"
                            style={{
                              background: copiedBankAcc ? '#ecfdf5' : '#ffffff',
                              border: copiedBankAcc ? '1px solid #86efac' : '1px solid #cbd5e1',
                              color: copiedBankAcc ? '#16a34a' : '#64748b',
                              padding: '3px 6px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              fontSize: '0.7rem',
                              fontWeight: 700
                            }}
                          >
                            {copiedBankAcc ? <Check size={12} color="#16a34a" /> : <Copy size={12} />}
                            {copiedBankAcc ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, display: 'block' }}>Payout Cycle</label>
                        <div style={{ fontWeight: 600, color: '#059669' }}>Bi-Weekly Direct NEFT / RTGS</div>
                      </div>
                    </div>
                  </div>

                  {/* Inline Edit Bank Info Form Modal */}
                  {isEditingBankInfo && (
                    <div style={{
                      padding: '1rem',
                      background: '#ffffff',
                      border: '1.5px solid #0284c7',
                      borderRadius: '12px',
                      marginBottom: '1.25rem',
                      boxShadow: '0 4px 12px rgba(2, 132, 199, 0.08)'
                    }}>
                      <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#091726', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Edit3 size={15} color="#0284c7" /> Update Bank Payout Details
                      </div>
                      <form onSubmit={handleSaveBankInfo} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div>
                          <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '3px' }}>Bank Name *</label>
                          <input
                            type="text"
                            required
                            value={bankEditForm.bankName}
                            onChange={(e) => setBankEditForm({ ...bankEditForm, bankName: e.target.value })}
                            placeholder="e.g. HDFC Bank / SBI"
                            style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '3px' }}>IFSC Code *</label>
                          <input
                            type="text"
                            required
                            value={bankEditForm.ifscCode}
                            onChange={(e) => setBankEditForm({ ...bankEditForm, ifscCode: e.target.value.toUpperCase() })}
                            placeholder="e.g. HDFC0001234"
                            style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem', fontFamily: 'monospace' }}
                          />
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                          <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '3px' }}>Full Bank Account Number *</label>
                          <input
                            type="text"
                            required
                            value={bankEditForm.bankAccountNumber}
                            onChange={(e) => setBankEditForm({ ...bankEditForm, bankAccountNumber: e.target.value })}
                            placeholder="e.g. 5010043219825678"
                            style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem', fontFamily: 'monospace' }}
                          />
                        </div>
                        <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
                          <button
                            type="button"
                            onClick={() => setIsEditingBankInfo(false)}
                            style={{ background: '#f1f5f9', color: '#475569', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={savingBankInfo}
                            style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '6px 14px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                          >
                            {savingBankInfo ? 'Saving...' : 'Save Bank Details'}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Cancelled Cheque Card */}
                  <div style={{
                    padding: '1rem',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    background: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.86rem', color: '#091726' }}>Cancelled Cheque Verification Proof</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                        Required for automated TDS certificate & bank account validation
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      {selectedPospForKyc.cancelledChequeUrl && (
                        <button
                          type="button"
                          onClick={() => setPreviewDoc({ title: 'Cancelled Cheque Proof', url: selectedPospForKyc.cancelledChequeUrl })}
                          style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#0f2b48', padding: '6px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Eye size={12} /> View Proof
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => triggerDocUpload('CHEQUE')}
                        disabled={uploadingDocType === 'CHEQUE'}
                        style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Upload size={12} /> {uploadingDocType === 'CHEQUE' ? 'Uploading...' : 'Upload Cheque'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: ATTRIBUTED CLIENTS & PORTFOLIO */}
              {activeModalTab === 'clients' && (() => {
                const filteredClients = partnerClients.filter(c => {
                  if (!clientSearchQuery.trim()) return true;
                  const q = clientSearchQuery.toLowerCase();
                  return (
                    (c.fullName && c.fullName.toLowerCase().includes(q)) ||
                    (c.phone && c.phone.includes(q)) ||
                    (c.email && c.email.toLowerCase().includes(q)) ||
                    (c.productType && c.productType.toLowerCase().includes(q)) ||
                    (c.pipelineStage && c.pipelineStage.toLowerCase().includes(q))
                  );
                });

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Header Banner & Summary */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '1rem 1.25rem',
                      background: '#f8fafc',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      flexWrap: 'wrap',
                      gap: '0.75rem'
                    }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Users size={18} color="#7c3aed" />
                          <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#091726' }}>
                            Attributed Client Portfolio
                          </h4>
                          <span style={{
                            background: '#ede9fe',
                            color: '#7c3aed',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: '999px'
                          }}>
                            {partnerClients.length} Total Clients
                          </span>
                        </div>
                        <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                          Clients originated by or assigned to POSP partner <strong>{selectedPospForKyc.user?.fullName}</strong>.
                        </p>
                      </div>

                      {partnerClients.length > 0 && onNavigateView && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPospForKyc(null);
                            onNavigateView('clients');
                          }}
                          style={{
                            background: '#ffffff',
                            border: '1px solid #cbd5e1',
                            color: '#475569',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <ExternalLink size={13} />
                          Open in Full Client Sheet
                        </button>
                      )}
                    </div>

                    {/* Search Bar when clients exist */}
                    {partnerClients.length > 0 && (
                      <div style={{ position: 'relative' }}>
                        <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                          type="text"
                          placeholder="Search attributed clients by name, phone, product, or stage..."
                          value={clientSearchQuery}
                          onChange={(e) => setClientSearchQuery(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px 12px 8px 34px',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            fontSize: '0.82rem',
                            outline: 'none',
                            background: '#ffffff'
                          }}
                        />
                      </div>
                    )}

                    {/* Loading State */}
                    {loadingClients ? (
                      <div style={{ padding: '3rem 1rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                        <Clock size={24} color="#7c3aed" style={{ animation: 'spin 1s linear infinite', marginBottom: '8px' }} />
                        <div>Loading attributed clients...</div>
                      </div>
                    ) : partnerClients.length === 0 ? (
                      /* Empty State */
                      <div style={{
                        padding: '3rem 1.5rem',
                        textAlign: 'center',
                        background: '#ffffff',
                        border: '1px dashed #cbd5e1',
                        borderRadius: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <div style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '50%',
                          background: '#f1f5f9',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#94a3b8'
                        }}>
                          <Users size={22} />
                        </div>
                        <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#091726' }}>
                          No Clients Attributed Yet
                        </div>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', maxWidth: '380px', lineHeight: 1.5 }}>
                          When policy inquiries or clients are onboarded through partner <strong>{selectedPospForKyc.user?.fullName}</strong>, they will be tracked and listed here automatically.
                        </p>
                      </div>
                    ) : filteredClients.length === 0 ? (
                      <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#64748b', fontSize: '0.82rem' }}>
                        No clients match "{clientSearchQuery}".
                      </div>
                    ) : (
                      /* Clients List Cards */
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {filteredClients.map((client) => {
                          const clientName = client.fullName || client.name || 'Unnamed Client';
                          const clientPhone = client.phone || client.phoneNumber || 'No phone';
                          const clientEmail = client.email || 'No email';
                          const productType = client.productType || client.insuranceType || 'General Insurance';
                          const stage = client.pipelineStage || client.stage || 'NEW_LEAD';
                          const premium = client.estimatedPremium || client.premiumAmount;

                          return (
                            <div
                              key={client.id}
                              style={{
                                padding: '12px 14px',
                                background: '#ffffff',
                                border: '1px solid #e2e8f0',
                                borderRadius: '10px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                gap: '12px',
                                transition: 'all 0.15s ease',
                                hover: { borderColor: '#cbd5e1' }
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                                <div style={{
                                  width: '36px',
                                  height: '36px',
                                  borderRadius: '8px',
                                  background: '#f1f5f9',
                                  color: '#0f2b48',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 800,
                                  fontSize: '0.82rem',
                                  flexShrink: 0
                                }}>
                                  {clientName.charAt(0).toUpperCase()}
                                </div>
                                <div style={{ minWidth: 0 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                    <span style={{ fontWeight: 800, fontSize: '0.88rem', color: '#091726' }}>
                                      {clientName}
                                    </span>
                                    <span style={{
                                      fontSize: '0.68rem',
                                      fontWeight: 700,
                                      background: '#f1f5f9',
                                      color: '#475569',
                                      padding: '1px 6px',
                                      borderRadius: '4px'
                                    }}>
                                      {productType}
                                    </span>
                                  </div>
                                  <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                    <span>📞 {clientPhone}</span>
                                    {clientEmail !== 'No email' && <span>✉️ {clientEmail}</span>}
                                  </div>
                                </div>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                                {premium && (
                                  <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>Est. Premium</div>
                                    <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#16a34a' }}>
                                      ₹{Number(premium).toLocaleString('en-IN')}
                                    </div>
                                  </div>
                                )}
                                <span style={{
                                  fontSize: '0.72rem',
                                  fontWeight: 800,
                                  padding: '3px 8px',
                                  borderRadius: '999px',
                                  background: stage === 'WON' || stage === 'POLICY_ISSUED' ? '#dcfce7' : '#f1f5f9',
                                  color: stage === 'WON' || stage === 'POLICY_ISSUED' ? '#15803d' : '#475569',
                                  textTransform: 'uppercase'
                                }}>
                                  {stage.replace(/_/g, ' ')}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '0.9rem 1.5rem',
              background: '#f8fafc',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center'
            }}>
              <button
                type="button"
                onClick={() => setSelectedPospForKyc(null)}
                style={{
                  background: '#0f2b48',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 22px',
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

      {/* ENTERPRISE IN-APP NATIVE CONFIRMATION DIALOG */}
      {confirmDialog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10001,
          padding: '1.25rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            maxWidth: '460px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #cbd5e1'
          }}>
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: `${confirmDialog.confirmColor}15`,
                  color: confirmDialog.confirmColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {React.createElement(confirmDialog.icon, { size: 22 })}
                </div>
                <div>
                  <div style={{
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    color: confirmDialog.confirmColor
                  }}>
                    {confirmDialog.badgeText}
                  </div>
                  <h4 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 800, color: '#091726' }}>
                    {confirmDialog.title}
                  </h4>
                </div>
              </div>

              <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 }}>
                {confirmDialog.description}
              </p>
            </div>

            <div style={{
              padding: '0.85rem 1.5rem',
              background: '#f8fafc',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '8px'
            }}>
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                style={{
                  background: '#ffffff',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDialog.onConfirm}
                style={{
                  background: confirmDialog.confirmColor,
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 18px',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                {confirmDialog.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INLINE DOCUMENT LIGHTBOX PREVIEW */}
      {previewDoc && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
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
            maxHeight: '92vh'
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
                  style={{ maxWidth: '100%', maxHeight: '65vh', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {resetModalPosp && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            maxWidth: '460px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Key size={18} color="#d97706" />
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#091726' }}>
                  Reset Agent Password
                </h3>
              </div>
              <button
                onClick={() => setResetModalPosp(null)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>

            {resetSuccess ? (
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{
                  padding: '16px',
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#166534', fontWeight: 800, fontSize: '0.95rem' }}>
                    <Check size={18} color="#16a34a" />
                    <span>Password Reset Successfully!</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#166534', lineHeight: 1.5 }}>
                    New login credentials have been provisioned for <strong>{resetModalPosp.user?.fullName}</strong>. Please copy and share these credentials securely with the partner.
                  </p>

                  <div style={{
                    background: '#ffffff',
                    border: '1px solid #86efac',
                    borderRadius: '8px',
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Login Identifier:</div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>{resetModalPosp.user?.email}</div>
                    
                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginTop: '4px' }}>Temporary Password:</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                      <code style={{
                        background: '#dcfce7',
                        color: '#166534',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        fontWeight: 800,
                        fontSize: '1rem',
                        letterSpacing: '0.5px'
                      }}>
                        {resetSuccess.temporaryPassword}
                      </code>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(resetSuccess.temporaryPassword);
                          setCopiedPass(true);
                          setTimeout(() => setCopiedPass(false), 2000);
                        }}
                        style={{
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          color: '#334155'
                        }}
                      >
                        {copiedPass ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                        {copiedPass ? 'Copied' : 'Copy Password'}
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const portalLink = window.location.origin + '/login';
                      const message = `Aadhiraksha POSP Partner Credentials:\nPartner: ${resetModalPosp.user?.fullName}\nEmail/Username: ${resetModalPosp.user?.email}\nTemporary Password: ${resetSuccess.temporaryPassword}\nLogin Portal: ${portalLink}`;
                      navigator.clipboard.writeText(message);
                      setCopiedPass(true);
                      setTimeout(() => setCopiedPass(false), 2000);
                    }}
                    style={{
                      background: '#16a34a',
                      color: '#ffffff',
                      border: 'none',
                      padding: '9px 14px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <Copy size={14} />
                    Copy Full Partner Login Details
                  </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setResetSuccess(null);
                      setNewPassword('');
                      setResetError('');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#64748b',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textDecoration: 'underline'
                    }}
                  >
                    Set Another Password
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setResetModalPosp(null);
                      setResetSuccess(null);
                      setNewPassword('');
                      setResetError('');
                    }}
                    style={{
                      background: '#091726',
                      color: '#ffffff',
                      border: 'none',
                      padding: '9px 24px',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 }}>
                  Generate or set a new password for POSP partner <strong>{resetModalPosp.user?.fullName}</strong> ({resetModalPosp.user?.email}).
                </div>

                {resetError && (
                  <div style={{ padding: '10px 14px', background: '#fee2e2', color: '#991b1b', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600 }}>
                    {resetError}
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Custom Password (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Leave empty to auto-generate a secure password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                    The partner will be required to change their password upon next login.
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setResetModalPosp(null)}
                    style={{ background: '#f1f5f9', color: '#475569', border: 'none', padding: '9px 16px', borderRadius: '8px', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={resetSubmitting}
                    style={{ background: '#d97706', color: '#ffffff', border: 'none', padding: '9px 18px', borderRadius: '8px', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
                  >
                    {resetSubmitting ? 'Resetting...' : 'Update Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ONBOARD AGENT MODAL */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            maxWidth: '520px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserPlus size={18} color="#059669" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#091726' }}>Onboard POSP Agent Partner</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {errorMsg && (
                <div style={{ padding: '8px 12px', background: '#fee2e2', color: '#991b1b', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600 }}>
                  {errorMsg}
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="agent@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={form.phoneNumber}
                    onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    City
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Hyderabad"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Reporting Sponsor
                  </label>
                  <div style={{
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem',
                    background: '#f8fafc',
                    color: '#475569',
                    fontWeight: 600
                  }}>
                    {authUser?.fullName || 'Super Admin'}
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Initial Password (Optional)
                </label>
                <input
                  type="password"
                  placeholder="Leave empty to auto-generate secure password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    background: '#f1f5f9',
                    color: '#475569',
                    border: 'none',
                    padding: '9px 16px',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    background: '#059669',
                    color: '#ffffff',
                    border: 'none',
                    padding: '9px 18px',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {submitting ? 'Onboarding...' : 'Onboard Agent'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
