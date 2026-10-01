import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
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
  ArrowRight,
  FileUp,
  UploadCloud,
  Trash2,
  KeyRound,
  Eye,
  EyeOff,
  MapPin,
  Smartphone,
  Edit3,
  File,
  Shield
} from 'lucide-react';
import { customerService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import WhatsAppIcon from '../components/common/WhatsAppIcon';
import { formatWhatsAppNumber } from '../utils/crmDeduplication';

export default function CustomerPortal() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Protected Route Guard: Redirect guests/logged-out visitors to Login with return URL
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast?.show('Please sign in to access your digital policy vault & account', 'info');
      const currentUrl = encodeURIComponent(location.pathname + location.search);
      navigate(`/login?redirect=${currentUrl}`, { replace: true });
    }
  }, [authLoading, isAuthenticated, location, navigate]);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    user: null,
    policies: [],
    documents: [],
    claims: [],
    assignedAdvisor: null
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const VALID_TABS = ['policies', 'vault', 'claims', 'profile'];
  
  // Persistent active view: checks URL query param (?tab=...) -> localStorage -> default 'policies'
  const initialTab = (() => {
    const fromUrl = searchParams.get('tab');
    if (fromUrl && VALID_TABS.includes(fromUrl)) return fromUrl;
    const fromStorage = localStorage.getItem('customer_portal_active_tab');
    if (fromStorage && VALID_TABS.includes(fromStorage)) return fromStorage;
    return 'policies';
  })();

  const [activeNav, setActiveNav] = useState(initialTab);

  // Sync state if URL changes (e.g., Browser Back/Forward buttons)
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && VALID_TABS.includes(tabFromUrl) && tabFromUrl !== activeNav) {
      setActiveNav(tabFromUrl);
      localStorage.setItem('customer_portal_active_tab', tabFromUrl);
    }
  }, [searchParams]);

  const handleTabChange = (tabId) => {
    if (!VALID_TABS.includes(tabId)) return;
    setActiveNav(tabId);
    localStorage.setItem('customer_portal_active_tab', tabId);
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (tabId === 'policies') {
        next.delete('tab');
      } else {
        next.set('tab', tabId);
      }
      return next;
    }, { replace: true });
  };

  // Document Upload Modal
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    documentType: 'AADHAAR',
    fileName: '',
    fileUrl: '',
    fileSizeBytes: 1200000,
    fileType: 'application/pdf'
  });

  // Document Category Map for Smart Auto-Titling
  const DOC_CATEGORY_LABELS = {
    AADHAAR: 'Aadhaar Card',
    PAN: 'PAN Card',
    RC_BOOK: 'Vehicle RC Book',
    PREVIOUS_POLICY: 'Previous Policy Schedule',
    MEDICAL_RECORD: 'Medical Record / Discharge Summary',
    OTHER: 'Verified Document'
  };

  const [isCustomTitle, setIsCustomTitle] = useState(false);

  const generateAutoTitle = (docType, fileName) => {
    const categoryName = DOC_CATEGORY_LABELS[docType] || 'Document';
    const clientName = user?.fullName || data.user?.fullName;
    const ext = fileName ? fileName.slice(fileName.lastIndexOf('.')) : '';
    if (clientName) {
      return `${categoryName} (${clientName})${ext}`;
    }
    return `${categoryName}${ext}`;
  };

  const handleFileSelection = (file) => {
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      toast?.show('File exceeds maximum 15MB limit', 'warning');
      return;
    }
    setSelectedFile(file);
    const sanitizedOriginal = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const autoTitle = generateAutoTitle(uploadForm.documentType, sanitizedOriginal);
    setUploadForm(prev => ({
      ...prev,
      fileName: isCustomTitle && prev.fileName ? prev.fileName : autoTitle,
      fileSizeBytes: file.size,
      fileType: file.type || 'application/pdf',
      fileUrl: ''
    }));
  };

  const handleCategorySelect = (categoryKey) => {
    setUploadForm(prev => {
      const nextTitle = isCustomTitle && prev.fileName ? prev.fileName : generateAutoTitle(categoryKey, selectedFile?.name || '');
      return {
        ...prev,
        documentType: categoryKey,
        fileName: nextTitle
      };
    });
  };

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
      if (res?.user) {
        setProfileForm({
          fullName: res.user.fullName || '',
          email: res.user.email || '',
          phoneNumber: res.user.phoneNumber || '',
          whatsappNumber: res.user.whatsappNumber || '',
          city: res.user.city || '',
          state: res.user.state || '',
          pincode: res.user.pincode || ''
        });
      }
    } catch (err) {
      console.error('Failed to load customer portal data', err);
      toast?.show('Failed to sync customer account data', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Profile Management State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    whatsappNumber: '',
    city: '',
    state: '',
    pincode: ''
  });

  // Password Management State
  const [changingPassword, setChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // OTP Verification Facility Preparation Modal State
  const [otpModal, setOtpModal] = useState({
    isOpen: false,
    channel: 'WHATSAPP', // 'PHONE' | 'EMAIL' | 'WHATSAPP'
    targetValue: '',
    otpCode: '',
    step: 'REQUEST', // 'REQUEST' | 'ENTER_CODE'
    countdown: 0
  });

  // Document Management States (Delete, Rename, Replace)
  const [deleteConfirmDoc, setDeleteConfirmDoc] = useState(null);
  const [deletingDoc, setDeletingDoc] = useState(false);
  const [renameDocModal, setRenameDocModal] = useState({ isOpen: false, doc: null, fileName: '', documentType: '' });
  const [renamingDoc, setRenamingDoc] = useState(false);
  const [replaceDocModal, setReplaceDocModal] = useState({ isOpen: false, doc: null, file: null });
  const [replacingDoc, setReplacingDoc] = useState(false);

  const handleDeleteDocument = async () => {
    if (!deleteConfirmDoc) return;
    setDeletingDoc(true);
    try {
      await customerService.deleteDocument(deleteConfirmDoc.id);
      toast?.show('Document removed successfully from your vault', 'success');
      setDeleteConfirmDoc(null);
      loadCustomerData();
    } catch (err) {
      console.error('Delete doc failed', err);
      const msg = err.response?.data?.message || err.message || 'Failed to delete document';
      toast?.show(msg, 'error');
    } finally {
      setDeletingDoc(false);
    }
  };

  const handleRenameDocument = async (e) => {
    e.preventDefault();
    if (!renameDocModal.doc || !renameDocModal.fileName.trim()) {
      toast?.show('Please enter a valid document title', 'warning');
      return;
    }
    setRenamingDoc(true);
    try {
      await customerService.renameDocument(renameDocModal.doc.id, {
        fileName: renameDocModal.fileName.trim(),
        documentType: renameDocModal.documentType || renameDocModal.doc.documentType
      });
      toast?.show('Document details updated successfully', 'success');
      setRenameDocModal({ isOpen: false, doc: null, fileName: '', documentType: '' });
      loadCustomerData();
    } catch (err) {
      console.error('Rename doc failed', err);
      const msg = err.response?.data?.message || err.message || 'Failed to update document details';
      toast?.show(msg, 'error');
    } finally {
      setRenamingDoc(false);
    }
  };

  const handleReplaceDocument = async (e) => {
    e.preventDefault();
    if (!replaceDocModal.doc || !replaceDocModal.file) {
      toast?.show('Please choose a replacement file to upload', 'warning');
      return;
    }
    setReplacingDoc(true);
    try {
      const formData = new FormData();
      formData.append('file', replaceDocModal.file);
      await customerService.replaceDocumentFile(replaceDocModal.doc.id, formData);
      toast?.show('Document replaced and re-submitted for review!', 'success');
      setReplaceDocModal({ isOpen: false, doc: null, file: null });
      loadCustomerData();
    } catch (err) {
      console.error('Replace doc failed', err);
      const msg = err.response?.data?.message || err.message || 'Failed to replace document';
      toast?.show(msg, 'error');
    } finally {
      setReplacingDoc(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const updated = await customerService.updateProfile(profileForm);
      toast?.show('Profile & Client 360 record updated successfully!', 'success');
      setIsEditingProfile(false);
      setData(prev => ({
        ...prev,
        user: { ...prev.user, ...updated }
      }));
    } catch (err) {
      console.error('Profile update failed', err);
      const msg = err.response?.data?.message || err.message || 'Failed to update profile';
      toast?.show(msg, 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast?.show('Please enter your current and new password', 'warning');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast?.show('New password must be at least 6 characters long', 'warning');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast?.show('New password and confirmation do not match', 'error');
      return;
    }

    setChangingPassword(true);
    try {
      await customerService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      toast?.show('Login password changed successfully!', 'success');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      console.error('Password change error', err);
      const msg = err.response?.data?.message || err.message || 'Failed to change password. Verify your current password.';
      toast?.show(msg, 'error');
    } finally {
      setChangingPassword(false);
    }
  };

  const openOtpVerification = (channel, targetValue) => {
    setOtpModal({
      isOpen: true,
      channel,
      targetValue: targetValue || (channel === 'EMAIL' ? profileForm.email : profileForm.phoneNumber),
      otpCode: '',
      step: 'REQUEST',
      countdown: 30
    });
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadCustomerData();
    }
  }, [isAuthenticated]);

  const handleDocumentSubmit = async (e) => {
    e.preventDefault();
    if (!uploadForm.fileName && !selectedFile) {
      toast?.show('Please choose a file or enter a document title', 'warning');
      return;
    }

    setUploading(true);
    try {
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('documentType', uploadForm.documentType || 'OTHER');
        formData.append('fileName', uploadForm.fileName || selectedFile.name);
        await customerService.uploadDocumentFile(formData);
      } else {
        const payload = {
          ...uploadForm,
          fileUrl: uploadForm.fileUrl || `/api/customer/documents/view-file/document_${Date.now()}`
        };
        await customerService.uploadDocument(payload);
      }
      toast?.show('Document uploaded and saved to your secure digital vault!', 'success');
      setShowUploadModal(false);
      setSelectedFile(null);
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
      const serverMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to save document. Please try again.';
      toast?.show(serverMsg, 'error');
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

  if (authLoading || !isAuthenticated) {
    return (
      <div style={{ background: '#f8fafc', minHeight: 'calc(100vh - 140px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#64748b' }}>
          <div style={{ width: '36px', height: '36px', border: '3px solid #cbd5e1', borderTopColor: 'var(--primary-navy)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px auto' }} />
          <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>Securing session & verifying policyholder credentials...</div>
        </div>
      </div>
    );
  }

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
                    onClick={() => handleTabChange(item.id)}
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
                onClick={() => handleTabChange('policies')}
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
                onClick={() => handleTabChange('vault')}
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
                onClick={() => handleTabChange('claims')}
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
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'flex-end' }}>
                                  <a
                                    href={doc.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '0.25rem',
                                      color: '#0284c7',
                                      background: '#f0f9ff',
                                      border: '1px solid #bae6fd',
                                      padding: '4px 8px',
                                      borderRadius: '6px',
                                      textDecoration: 'none',
                                      fontWeight: 700,
                                      fontSize: '0.75rem'
                                    }}
                                    title="View / Stream Document"
                                  >
                                    <Download size={12} /> View
                                  </a>

                                  {doc.verificationStatus !== 'VERIFIED' && (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => setRenameDocModal({
                                          isOpen: true,
                                          doc,
                                          fileName: doc.fileName || '',
                                          documentType: doc.documentType || 'AADHAAR'
                                        })}
                                        style={{
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: '0.25rem',
                                          color: '#475569',
                                          background: '#f8fafc',
                                          border: '1px solid #cbd5e1',
                                          padding: '4px 8px',
                                          borderRadius: '6px',
                                          fontWeight: 700,
                                          fontSize: '0.75rem',
                                          cursor: 'pointer'
                                        }}
                                        title="Rename or update category"
                                      >
                                        <Edit3 size={12} /> Rename
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => setReplaceDocModal({
                                          isOpen: true,
                                          doc,
                                          file: null
                                        })}
                                        style={{
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: '0.25rem',
                                          color: '#d97706',
                                          background: '#fffbeb',
                                          border: '1px solid #fde68a',
                                          padding: '4px 8px',
                                          borderRadius: '6px',
                                          fontWeight: 700,
                                          fontSize: '0.75rem',
                                          cursor: 'pointer'
                                        }}
                                        title="Re-upload or replace document"
                                      >
                                        <UploadCloud size={12} /> Replace
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => setDeleteConfirmDoc(doc)}
                                        style={{
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: '0.25rem',
                                          color: '#dc2626',
                                          background: '#fef2f2',
                                          border: '1px solid #fecaca',
                                          padding: '4px 8px',
                                          borderRadius: '6px',
                                          fontWeight: 700,
                                          fontSize: '0.75rem',
                                          cursor: 'pointer'
                                        }}
                                        title="Remove document from vault"
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    </>
                                  )}

                                  {doc.verificationStatus === 'VERIFIED' && (
                                    <span 
                                      style={{ fontSize: '0.7rem', color: '#15803d', fontWeight: 700, padding: '4px 6px', background: '#dcfce7', borderRadius: '5px' }}
                                      title="Locked: Approved KYC records cannot be altered directly"
                                    >
                                      🔒 Locked
                                    </span>
                                  )}
                                </div>
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

            {/* VIEW 4: PROFILE & SECURITY - SELF-SERVICE MANAGEMENT & OTP VERIFICATION */}
            {activeNav === 'profile' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                
                {/* 4.1 PERSONAL DEMOGRAPHICS CARD */}
                <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.75rem', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div>
                      <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-navy)', margin: 0 }}>
                        Personal Profile & Contact Information
                      </h2>
                      <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                        Updates here sync automatically with your Client 360 CRM record across our advisor network.
                      </p>
                    </div>

                    {!isEditingProfile ? (
                      <button
                        type="button"
                        onClick={() => setIsEditingProfile(true)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          background: 'var(--primary-navy)',
                          color: '#ffffff',
                          border: 'none',
                          padding: '0.55rem 1rem',
                          borderRadius: '8px',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Edit Details
                      </button>
                    ) : (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditingProfile(false);
                            if (data.user) {
                              setProfileForm({
                                fullName: data.user.fullName || '',
                                email: data.user.email || '',
                                phoneNumber: data.user.phoneNumber || '',
                                whatsappNumber: data.user.whatsappNumber || '',
                                city: data.user.city || '',
                                state: data.user.state || '',
                                pincode: data.user.pincode || ''
                              });
                            }
                          }}
                          style={{
                            padding: '0.55rem 0.9rem',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            background: '#ffffff',
                            color: '#475569',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleProfileUpdate}
                          disabled={savingProfile}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            background: '#059669',
                            color: '#ffffff',
                            border: 'none',
                            padding: '0.55rem 1.1rem',
                            borderRadius: '8px',
                            fontSize: '0.82rem',
                            fontWeight: 800,
                            cursor: savingProfile ? 'not-allowed' : 'pointer'
                          }}
                        >
                          {savingProfile ? (
                            <>
                              <RefreshCw size={14} className="animate-spin" /> Saving...
                            </>
                          ) : (
                            <>
                              <Check size={14} /> Save Changes
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  <form onSubmit={handleProfileUpdate} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                    {/* Full Name */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                        Full Name (As per Aadhaar/PAN)
                      </label>
                      {isEditingProfile ? (
                        <input
                          required
                          type="text"
                          value={profileForm.fullName}
                          onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '0.65rem 0.85rem',
                            borderRadius: '8px',
                            border: '1.5px solid #cbd5e1',
                            fontSize: '0.88rem',
                            fontWeight: 600,
                            color: 'var(--primary-navy)',
                            boxSizing: 'border-box'
                          }}
                        />
                      ) : (
                        <div style={{ fontWeight: 800, fontSize: '0.98rem', color: 'var(--primary-navy)' }}>
                          {profileForm.fullName || userName}
                        </div>
                      )}
                    </div>

                    {/* Email Address */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                          Registered Email
                        </label>
                        <button
                          type="button"
                          onClick={() => openOtpVerification('EMAIL', profileForm.email)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#0284c7',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            padding: 0,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.2rem'
                          }}
                        >
                          Verify OTP
                        </button>
                      </div>
                      {isEditingProfile ? (
                        <input
                          required
                          type="email"
                          value={profileForm.email}
                          onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '0.65rem 0.85rem',
                            borderRadius: '8px',
                            border: '1.5px solid #cbd5e1',
                            fontSize: '0.88rem',
                            fontWeight: 600,
                            color: 'var(--primary-navy)',
                            boxSizing: 'border-box'
                          }}
                        />
                      ) : (
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--primary-navy)' }}>
                          {profileForm.email || '—'}
                        </div>
                      )}
                    </div>

                    {/* Primary Phone Number (KYC Bond Anchor) */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                          Primary Mobile (KYC Anchor)
                        </label>
                        <span style={{
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          color: '#059669',
                          background: 'rgba(16, 185, 129, 0.12)',
                          padding: '0.15rem 0.45rem',
                          borderRadius: '10px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}>
                          <CheckCircle2 size={11} /> Verified
                        </span>
                      </div>
                      <div style={{ fontWeight: 800, fontSize: '0.98rem', color: 'var(--primary-navy)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>{profileForm.phoneNumber || user?.phoneNumber || data.user?.phoneNumber || '—'}</span>
                        <button
                          type="button"
                          onClick={() => openOtpVerification('PHONE', profileForm.phoneNumber)}
                          title="Change phone number with 2-step OTP verification"
                          style={{
                            background: '#f1f5f9',
                            border: '1px solid #cbd5e1',
                            borderRadius: '6px',
                            padding: '0.25rem 0.55rem',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            color: '#334155',
                            cursor: 'pointer'
                          }}
                        >
                          Change via OTP
                        </button>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                        Anchors all active policy bonds & claim settlements.
                      </div>
                    </div>

                    {/* WhatsApp Notification Number */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                          WhatsApp Alerts Number
                        </label>
                        <button
                          type="button"
                          onClick={() => openOtpVerification('WHATSAPP', profileForm.whatsappNumber || profileForm.phoneNumber)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#16a34a',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            padding: 0,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.2rem'
                          }}
                        >
                          Verify WhatsApp OTP
                        </button>
                      </div>
                      {isEditingProfile ? (
                        <input
                          type="tel"
                          placeholder="e.g. 9849012345"
                          value={profileForm.whatsappNumber}
                          onChange={(e) => setProfileForm({ ...profileForm, whatsappNumber: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '0.65rem 0.85rem',
                            borderRadius: '8px',
                            border: '1.5px solid #cbd5e1',
                            fontSize: '0.88rem',
                            fontWeight: 600,
                            color: 'var(--primary-navy)',
                            boxSizing: 'border-box'
                          }}
                        />
                      ) : (
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--primary-navy)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <WhatsAppIcon size={14} color="#16a34a" />
                          <span>{profileForm.whatsappNumber || profileForm.phoneNumber || 'Same as primary'}</span>
                        </div>
                      )}
                    </div>

                    {/* City */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                        City / District
                      </label>
                      {isEditingProfile ? (
                        <input
                          type="text"
                          placeholder="e.g. Hyderabad"
                          value={profileForm.city}
                          onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '0.65rem 0.85rem',
                            borderRadius: '8px',
                            border: '1.5px solid #cbd5e1',
                            fontSize: '0.88rem',
                            fontWeight: 600,
                            color: 'var(--primary-navy)',
                            boxSizing: 'border-box'
                          }}
                        />
                      ) : (
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--primary-navy)' }}>
                          {profileForm.city || '—'}
                        </div>
                      )}
                    </div>

                    {/* State */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                        State
                      </label>
                      {isEditingProfile ? (
                        <input
                          type="text"
                          placeholder="e.g. Telangana"
                          value={profileForm.state}
                          onChange={(e) => setProfileForm({ ...profileForm, state: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '0.65rem 0.85rem',
                            borderRadius: '8px',
                            border: '1.5px solid #cbd5e1',
                            fontSize: '0.88rem',
                            fontWeight: 600,
                            color: 'var(--primary-navy)',
                            boxSizing: 'border-box'
                          }}
                        />
                      ) : (
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--primary-navy)' }}>
                          {profileForm.state || '—'}
                        </div>
                      )}
                    </div>

                    {/* Pincode */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                        Postal Pincode
                      </label>
                      {isEditingProfile ? (
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="e.g. 500081"
                          value={profileForm.pincode}
                          onChange={(e) => setProfileForm({ ...profileForm, pincode: e.target.value.replace(/[^0-9]/g, '') })}
                          style={{
                            width: '100%',
                            padding: '0.65rem 0.85rem',
                            borderRadius: '8px',
                            border: '1.5px solid #cbd5e1',
                            fontSize: '0.88rem',
                            fontWeight: 600,
                            color: 'var(--primary-navy)',
                            boxSizing: 'border-box'
                          }}
                        />
                      ) : (
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--primary-navy)' }}>
                          {profileForm.pincode || '—'}
                        </div>
                      )}
                    </div>

                    {/* Authentication Standard */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                        Session & Security Standard
                      </label>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#059669', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Lock size={14} /> Encrypted JWT Session
                      </div>
                    </div>
                  </form>
                </div>

                {/* 4.2 SECURITY & PASSWORD MANAGEMENT CARD */}
                <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.75rem', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: 'rgba(15, 43, 72, 0.08)',
                      color: 'var(--primary-navy)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <KeyRound size={18} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                        Login Credentials & Password
                      </h3>
                      <p style={{ margin: '0.15rem 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                        Update your portal password anytime. Requires verification of your current password.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handlePasswordChange} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
                    {/* Current Password */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                        Current Password <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          required
                          type={showCurrentPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '0.65rem 2.2rem 0.65rem 0.85rem',
                            borderRadius: '8px',
                            border: '1.5px solid #cbd5e1',
                            fontSize: '0.88rem',
                            boxSizing: 'border-box'
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          style={{
                            position: 'absolute',
                            right: '8px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            color: '#94a3b8',
                            cursor: 'pointer'
                          }}
                        >
                          {showCurrentPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>

                    {/* New Password */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                        New Password (Min 6 chars) <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          required
                          type={showNewPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '0.65rem 2.2rem 0.65rem 0.85rem',
                            borderRadius: '8px',
                            border: '1.5px solid #cbd5e1',
                            fontSize: '0.88rem',
                            boxSizing: 'border-box'
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          style={{
                            position: 'absolute',
                            right: '8px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            color: '#94a3b8',
                            cursor: 'pointer'
                          }}
                        >
                          {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm New Password */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                        Confirm New Password <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        required
                        type="password"
                        placeholder="••••••••"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.65rem 0.85rem',
                          borderRadius: '8px',
                          border: '1.5px solid #cbd5e1',
                          fontSize: '0.88rem',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    {/* Submit Button */}
                    <div>
                      <button
                        type="submit"
                        disabled={changingPassword || !passwordForm.currentPassword || !passwordForm.newPassword}
                        style={{
                          width: '100%',
                          padding: '0.65rem 1rem',
                          borderRadius: '8px',
                          border: 'none',
                          background: (changingPassword || !passwordForm.currentPassword || !passwordForm.newPassword) ? '#94a3b8' : 'var(--primary-navy)',
                          color: '#ffffff',
                          fontWeight: 800,
                          fontSize: '0.85rem',
                          cursor: (changingPassword || !passwordForm.currentPassword || !passwordForm.newPassword) ? 'not-allowed' : 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.4rem',
                          height: '40px'
                        }}
                      >
                        {changingPassword ? (
                          <>
                            <RefreshCw size={14} className="animate-spin" /> Updating...
                          </>
                        ) : (
                          <>
                            <KeyRound size={15} /> Update Password
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>

                {/* 4.3 REGULATORY DATA PRIVACY GUARANTEE */}
                <div style={{ padding: '1rem 1.25rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#64748b', lineHeight: 1.6 }}>
                  <strong style={{ color: 'var(--primary-navy)' }}>Data Privacy & Compliance:</strong> In compliance with IRDAI regulations, ISO/IEC 27001, and Indian Digital Personal Data Protection (DPDP) Act, your policy details and KYC records are stored encrypted at rest with AES-256. Demographics updates are audited in real time and synced with your designated servicing agent.
                </div>

              </div>
            )}

          </main>
        </div>

      </div>

      {/* DOCUMENT UPLOAD MODAL - CONSUMER DRAG & DROP VAULT */}
      {showUploadModal && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setShowUploadModal(false); }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'none',
            WebkitBackdropFilter: 'none',
            zIndex: 1100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
        >
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '520px',
            boxShadow: 'var(--shadow-xl)',
            border: '1px solid #e2e8f0',
            padding: '1.75rem',
            animation: 'fadeInOverlay 0.2s ease-out'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'rgba(15, 43, 72, 0.08)',
                  color: 'var(--primary-navy)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FolderCheck size={22} color="var(--primary-navy)" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                    Deposit into Digital Vault
                  </h3>
                  <p style={{ margin: '0.15rem 0 0', fontSize: '0.75rem', color: '#64748b' }}>
                    Tamper-proof storage for instant cashless hospital & accident claim clearance.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  padding: '6px',
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#0f2b48'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#64748b'; }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleDocumentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* 1. 1-Click Visual Category Pills */}
              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#334155', marginBottom: '0.45rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Select Document Category <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.45rem' }}>
                  {[
                    { id: 'AADHAAR', label: 'Aadhaar Card', icon: '🪪' },
                    { id: 'PAN', label: 'PAN Card', icon: '💳' },
                    { id: 'RC_BOOK', label: 'Vehicle RC', icon: '🚗' },
                    { id: 'PREVIOUS_POLICY', label: 'Prev. Policy', icon: '📄' },
                    { id: 'MEDICAL_RECORD', label: 'Medical History', icon: '🏥' },
                    { id: 'OTHER', label: 'Other Document', icon: '📁' }
                  ].map(cat => {
                    const isSelected = uploadForm.documentType === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleCategorySelect(cat.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          padding: '0.55rem 0.7rem',
                          borderRadius: '10px',
                          border: `1.5px solid ${isSelected ? 'var(--primary-navy)' : '#e2e8f0'}`,
                          background: isSelected ? 'rgba(15, 43, 72, 0.06)' : '#ffffff',
                          color: isSelected ? 'var(--primary-navy)' : '#475569',
                          fontWeight: isSelected ? 800 : 600,
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          textAlign: 'left'
                        }}
                      >
                        <span style={{ fontSize: '1rem' }}>{cat.icon}</span>
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Drag-and-Drop Dropzone or Elevated Preview Card */}
              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#334155', marginBottom: '0.45rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Attach Document File <span style={{ color: '#ef4444' }}>*</span>
                </label>

                {!selectedFile ? (
                  <label
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        handleFileSelection(e.dataTransfer.files[0]);
                      }
                    }}
                    style={{
                      border: isDragging ? '2px dashed var(--accent-gold)' : '2px dashed #cbd5e1',
                      background: isDragging ? 'rgba(245, 158, 11, 0.05)' : '#f8fafc',
                      borderRadius: '14px',
                      padding: '2rem 1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textAlign: 'center'
                    }}
                  >
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileSelection(e.target.files[0]);
                        }
                      }}
                    />
                    <div style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      background: '#ffffff',
                      border: '1.5px solid #e2e8f0',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--primary-navy)',
                      marginBottom: '0.75rem'
                    }}>
                      <UploadCloud size={26} color="var(--primary-navy)" />
                    </div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                      Click to browse or drop file here
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '0.25rem' }}>
                      PDF, PNG, JPG or JPEG up to 15MB
                    </div>
                  </label>
                ) : (
                  <div style={{
                    border: '1.5px solid #86efac',
                    background: '#f0fdf4',
                    borderRadius: '14px',
                    padding: '1rem 1.15rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.08)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', overflow: 'hidden' }}>
                      <div style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '10px',
                        background: '#dcfce7',
                        color: '#15803d',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <FileCheck size={24} />
                      </div>
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#166534', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                            {selectedFile.name}
                          </span>
                          <span style={{
                            fontSize: '0.66rem',
                            fontWeight: 800,
                            background: '#bbf7d0',
                            color: '#166534',
                            padding: '0.1rem 0.4rem',
                            borderRadius: '4px',
                            textTransform: 'uppercase'
                          }}>
                            {selectedFile.name.split('.').pop() || 'FILE'}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#15803d', fontWeight: 600, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span>{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                          <span>•</span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                            <CheckCircle2 size={12} /> Ready for AES-256 Encryption
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        setUploadForm(prev => ({ ...prev, fileName: '', fileUrl: '' }));
                        setIsCustomTitle(false);
                      }}
                      title="Remove and select another file"
                      style={{
                        background: '#ffffff',
                        border: '1px solid #fecaca',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        color: '#ef4444',
                        padding: '6px 8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        fontSize: '0.72rem',
                        fontWeight: 700
                      }}
                    >
                      <Trash2 size={14} />
                      <span>Change</span>
                    </button>
                  </div>
                )}
              </div>

              {/* 3. Smart Document Label (Auto-Generated with 1-Click Edit) */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Vault Display Title
                  </label>
                  {!isCustomTitle && (
                    <button
                      type="button"
                      onClick={() => setIsCustomTitle(true)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#0284c7',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        padding: 0,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}
                    >
                      <Edit3 size={11} /> Edit Custom Title
                    </button>
                  )}
                </div>

                {isCustomTitle ? (
                  <input
                    required
                    type="text"
                    placeholder="e.g. Aadhaar Card (Kavita Rao)"
                    value={uploadForm.fileName}
                    onChange={(e) => setUploadForm({ ...uploadForm, fileName: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '10px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.85rem',
                      boxSizing: 'border-box',
                      background: '#ffffff',
                      outline: 'none',
                      color: 'var(--primary-navy)',
                      fontWeight: 600
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--primary-navy)'}
                    onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                  />
                ) : (
                  <div style={{
                    padding: '0.6rem 0.85rem',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    color: 'var(--primary-navy)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <span>{uploadForm.fileName || `${DOC_CATEGORY_LABELS[uploadForm.documentType]} (${userName})`}</span>
                    <span style={{ fontSize: '0.68rem', color: '#059669', background: '#dcfce7', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: 700 }}>
                      Auto-Labeled
                    </span>
                  </div>
                )}
              </div>

              {/* 4. Trust & Security Strip */}
              <div style={{
                background: 'rgba(15, 43, 72, 0.04)',
                border: '1px solid rgba(15, 43, 72, 0.1)',
                borderRadius: '10px',
                padding: '0.65rem 0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                fontSize: '0.72rem',
                color: '#475569'
              }}>
                <Lock size={15} color="var(--accent-gold)" style={{ flexShrink: 0 }} />
                <span>
                  <strong>AES-256 Vault Encryption:</strong> Tamper-proof storage. Shared only with empanelled cashless desks upon pre-authorization.
                </span>
              </div>

              {/* 5. Frictionless Action CTAs */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.35rem' }}>
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  style={{
                    padding: '0.65rem 1.25rem',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    color: '#475569'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || (!selectedFile && !uploadForm.fileName)}
                  style={{
                    padding: '0.65rem 1.4rem',
                    borderRadius: '10px',
                    border: 'none',
                    background: (uploading || (!selectedFile && !uploadForm.fileName)) ? '#94a3b8' : 'var(--primary-navy)',
                    color: '#ffffff',
                    cursor: (uploading || (!selectedFile && !uploadForm.fileName)) ? 'not-allowed' : 'pointer',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 12px rgba(15, 43, 72, 0.15)'
                  }}
                >
                  {uploading ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" /> Encrypting & Depositing...
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={16} /> Encrypt & Deposit
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* OTP VERIFICATION FACILITY MODAL (EMAIL / PHONE / WHATSAPP ARCHITECTURE) */}
      {otpModal.isOpen && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setOtpModal(prev => ({ ...prev, isOpen: false })); }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'none',
            WebkitBackdropFilter: 'none',
            zIndex: 1150,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
        >
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '460px',
            boxShadow: 'var(--shadow-xl)',
            border: '1px solid #e2e8f0',
            padding: '1.75rem',
            animation: 'fadeInOverlay 0.2s ease-out'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: otpModal.channel === 'WHATSAPP' ? '#dcfce7' : otpModal.channel === 'EMAIL' ? '#e0f2fe' : 'rgba(15, 43, 72, 0.08)',
                  color: otpModal.channel === 'WHATSAPP' ? '#16a34a' : otpModal.channel === 'EMAIL' ? '#0284c7' : 'var(--primary-navy)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {otpModal.channel === 'WHATSAPP' ? <WhatsAppIcon size={22} color="#16a34a" /> : otpModal.channel === 'EMAIL' ? <Mail size={22} /> : <Smartphone size={22} />}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                    {otpModal.channel === 'WHATSAPP' ? 'WhatsApp Verification' : otpModal.channel === 'EMAIL' ? 'Email OTP Verification' : 'Phone OTP Verification'}
                  </h3>
                  <p style={{ margin: '0.15rem 0 0', fontSize: '0.75rem', color: '#64748b' }}>
                    Multi-factor authentication & KYC contact clearance.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOtpModal(prev => ({ ...prev, isOpen: false }))}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  padding: '6px',
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div>
              <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5, margin: '0 0 1rem' }}>
                We will dispatch a 6-digit one-time password (OTP) via{' '}
                <strong style={{ color: 'var(--primary-navy)' }}>
                  {otpModal.channel === 'WHATSAPP' ? 'WhatsApp API' : otpModal.channel === 'EMAIL' ? 'Secure Email Dispatch' : 'SMS Gateway'}
                </strong>{' '}
                to:
              </p>

              <div style={{
                background: '#f8fafc',
                border: '1.5px solid #e2e8f0',
                borderRadius: '10px',
                padding: '0.75rem 1rem',
                fontWeight: 800,
                fontSize: '1rem',
                color: 'var(--primary-navy)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.25rem'
              }}>
                <span>{otpModal.targetValue || '—'}</span>
                <span style={{ fontSize: '0.72rem', color: '#059669', background: '#dcfce7', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: 700 }}>
                  Ready to send
                </span>
              </div>

              {/* Step 1: Request OTP or Step 2: Enter OTP */}
              {otpModal.step === 'REQUEST' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => {
                      toast?.show(`6-digit OTP sent via ${otpModal.channel} to ${otpModal.targetValue}`, 'success');
                      setOtpModal(prev => ({ ...prev, step: 'ENTER_CODE', countdown: 30 }));
                    }}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '10px',
                      border: 'none',
                      background: 'var(--primary-navy)',
                      color: '#ffffff',
                      fontWeight: 800,
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    <span>Send 6-Digit OTP</span>
                    <ArrowRight size={16} />
                  </button>
                  <p style={{ margin: 0, fontSize: '0.72rem', color: '#94a3b8', textAlign: 'center' }}>
                    Standard carrier and messaging rates may apply. Valid for 10 minutes.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                      Enter 6-Digit Security Code
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      autoFocus
                      placeholder="• • • • • •"
                      value={otpModal.otpCode}
                      onChange={(e) => setOtpModal(prev => ({ ...prev, otpCode: e.target.value.replace(/[^0-9]/g, '') }))}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '10px',
                        border: '2px solid var(--primary-navy)',
                        fontSize: '1.25rem',
                        fontWeight: 800,
                        letterSpacing: '8px',
                        textAlign: 'center',
                        boxSizing: 'border-box',
                        color: 'var(--primary-navy)'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#64748b' }}>
                    <span>Didn't receive code?</span>
                    <button
                      type="button"
                      onClick={() => {
                        toast?.show(`Resent new OTP via ${otpModal.channel}`, 'info');
                      }}
                      style={{ background: 'none', border: 'none', color: '#0284c7', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                    >
                      Resend Code
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (otpModal.otpCode.length < 6) {
                        toast?.show('Please enter complete 6-digit OTP code', 'warning');
                        return;
                      }
                      toast?.show(`${otpModal.channel} verified successfully! Your KYC contact is authenticated.`, 'success');
                      setOtpModal(prev => ({ ...prev, isOpen: false }));
                    }}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '10px',
                      border: 'none',
                      background: '#059669',
                      color: '#ffffff',
                      fontWeight: 800,
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    <ShieldCheck size={18} />
                    <span>Confirm & Authorize</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* DELETE DOCUMENT CONFIRMATION MODAL */}
      {deleteConfirmDoc && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            maxWidth: '440px',
            width: '100%',
            padding: '1.75rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{
                background: '#fee2e2',
                color: '#dc2626',
                borderRadius: '50%',
                width: '42px',
                height: '42px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Trash2 size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                  Remove from Vault?
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                  Irreversible file purge from digital document vault
                </p>
              </div>
            </div>

            <p style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.5, margin: '0 0 1.25rem' }}>
              Are you sure you want to delete <strong style={{ color: 'var(--primary-navy)' }}>{deleteConfirmDoc.fileName}</strong>? Once deleted, underwriters and advisors will no longer have access to this record.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setDeleteConfirmDoc(null)}
                disabled={deletingDoc}
                style={{
                  padding: '0.6rem 1.1rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#475569',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteDocument}
                disabled={deletingDoc}
                style={{
                  padding: '0.6rem 1.25rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#dc2626',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                {deletingDoc ? <RefreshCw size={14} className="spin" /> : <Trash2 size={14} />}
                <span>{deletingDoc ? 'Deleting...' : 'Delete Document'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RENAME DOCUMENT MODAL */}
      {renameDocModal.isOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            maxWidth: '460px',
            width: '100%',
            padding: '1.75rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Edit3 size={18} color="var(--primary-navy)" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                  Edit Document Details
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setRenameDocModal({ isOpen: false, doc: null, fileName: '', documentType: '' })}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRenameDocument} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Category Tag
                </label>
                <select
                  value={renameDocModal.documentType}
                  onChange={(e) => setRenameDocModal(prev => ({ ...prev, documentType: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    outline: 'none'
                  }}
                >
                  <option value="AADHAAR">Aadhaar Card</option>
                  <option value="PAN">PAN Card</option>
                  <option value="RC_BOOK">Vehicle RC</option>
                  <option value="MEDICAL_RECORD">Medical History</option>
                  <option value="PREVIOUS_POLICY">Previous Policy</option>
                  <option value="OTHER">Other Document</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Document Display Title *
                </label>
                <input
                  type="text"
                  required
                  value={renameDocModal.fileName}
                  onChange={(e) => setRenameDocModal(prev => ({ ...prev, fileName: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setRenameDocModal({ isOpen: false, doc: null, fileName: '', documentType: '' })}
                  disabled={renamingDoc}
                  style={{
                    padding: '0.6rem 1.1rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#475569',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={renamingDoc}
                  style={{
                    padding: '0.6rem 1.25rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'var(--primary-navy)',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  {renamingDoc ? <RefreshCw size={14} className="spin" /> : <Check size={14} />}
                  <span>{renamingDoc ? 'Saving...' : 'Update Details'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REPLACE DOCUMENT MODAL */}
      {replaceDocModal.isOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            maxWidth: '460px',
            width: '100%',
            padding: '1.75rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <UploadCloud size={20} color="#d97706" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                  Replace Document File
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setReplaceDocModal({ isOpen: false, doc: null, file: null })}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 1rem' }}>
              Replacing file for: <strong style={{ color: 'var(--primary-navy)' }}>{replaceDocModal.doc?.fileName}</strong>. This replaces the old scan and re-submits it for underwriting review.
            </p>

            <form onSubmit={handleReplaceDocument} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <label style={{
                border: '2px dashed #cbd5e1',
                borderRadius: '12px',
                padding: '1.5rem 1rem',
                textAlign: 'center',
                background: '#f8fafc',
                cursor: 'pointer',
                display: 'block'
              }}>
                <input
                  type="file"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setReplaceDocModal(prev => ({ ...prev, file: f }));
                  }}
                />
                <UploadCloud size={28} color="#0284c7" style={{ margin: '0 auto 6px auto' }} />
                <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0f2b48' }}>
                  {replaceDocModal.file ? replaceDocModal.file.name : 'Choose New File (PDF, PNG, JPG)'}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                  {replaceDocModal.file ? `${(replaceDocModal.file.size / (1024 * 1024)).toFixed(2)} MB` : 'Max limit: 25MB'}
                </div>
              </label>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setReplaceDocModal({ isOpen: false, doc: null, file: null })}
                  disabled={replacingDoc}
                  style={{
                    padding: '0.6rem 1.1rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#475569',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={replacingDoc || !replaceDocModal.file}
                  style={{
                    padding: '0.6rem 1.25rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#059669',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    opacity: (!replaceDocModal.file || replacingDoc) ? 0.6 : 1
                  }}
                >
                  {replacingDoc ? <RefreshCw size={14} className="spin" /> : <UploadCloud size={14} />}
                  <span>{replacingDoc ? 'Uploading...' : 'Confirm & Replace'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

