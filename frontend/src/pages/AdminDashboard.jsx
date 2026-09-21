import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { 
  Users, 
  FileText, 
  Crosshair, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  TrendingUp, 
  Search, 
  Building2, 
  Phone, 
  Mail, 
  Filter,
  Plus,
  Upload,
  Trash2,
  Download,
  AlertCircle,
  X,
  Edit3,
  Save,
  MapPin,
  Calendar,
  Layers,
  PhoneCall,
  LayoutDashboard,
  ShieldCheck,
  Briefcase,
  UserCheck,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ArrowLeft,
  User,
  Lock,
  Sparkles,
  RefreshCw,
  Bell,
  LogOut,
  ExternalLink,
  MessageSquare,
  Menu,
  Globe,
  FileSpreadsheet,
  Award,
  ShieldAlert,
  FolderCheck,
  CheckSquare,
  Link2,
  Car,
  HeartPulse,
  Plane,
  Building
} from 'lucide-react';
import { portalService, crmService } from '../services/api';
import UserManagementView from '../components/crm/UserManagementView';
import ClientDataSheetView from '../components/crm/ClientDataSheetView';
import DailyCallAgendaView from '../components/crm/DailyCallAgendaView';
import SalesPipelineView from '../components/crm/SalesPipelineView';
import MeetingCalendarView from '../components/crm/MeetingCalendarView';
import Client360Drawer from '../components/crm/Client360Drawer';
import UserProfileModal from '../components/crm/UserProfileModal';

import WhatsAppIcon from '../components/common/WhatsAppIcon';
import ManagerDashboardOverview from '../components/crm/ManagerDashboardOverview';
import SuperAdminDashboardOverview from '../components/crm/SuperAdminDashboardOverview';
import AdvisorDashboardOverview from '../components/crm/AdvisorDashboardOverview';
import PolicyRenewalDeskView from '../components/crm/PolicyRenewalDeskView';
import AuditTrailView from '../components/crm/AuditTrailView';
import QuotationManagementView from '../components/crm/QuotationManagementView';
import DocumentLockerView from '../components/crm/DocumentLockerView';
import CallHistoryView from '../components/crm/CallHistoryView';
import ManagerApprovalsView from '../components/crm/ManagerApprovalsView';
import LeadInquiriesView from '../components/crm/LeadInquiriesView';
import PospApplicationsView from '../components/crm/PospApplicationsView';
import ClaimsIntimationView from '../components/crm/ClaimsIntimationView';
import NetworkHospitalsView from '../components/crm/NetworkHospitalsView';

export default function AdminDashboard() {
  const { 
    user, 
    isAuthenticated, 
    loading: authLoading, 
    logout,
    isSuperAdmin,
    isManager,
    isAdvisor,
    canManageUsers,
    canAccessCRM
  } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active Workspace Navigation View (URL Query Param Synchronized)
  // 'dashboard' | 'leads' | 'clients' | 'pipeline' | 'agenda' | 'calls' | 'meetings' | 'calendar' | 'proposals' | 'renewals' | 'documents' | 'users' | 'approvals' | 'audit' | 'posp' | 'hospitals' | 'claims'
  const rawTab = searchParams.get('tab') || 'dashboard';
  const currentTabFromUrl = rawTab === 'calendar' ? 'meetings' : rawTab;
  const [activeView, setActiveView] = useState(currentTabFromUrl);

  // Sync state when URL query param changes (e.g. Browser Back / Forward buttons)
  useEffect(() => {
    const raw = searchParams.get('tab') || 'dashboard';
    const tab = raw === 'calendar' ? 'meetings' : raw;
    if (tab !== activeView) {
      setActiveView(tab);
    }
  }, [searchParams]);

  // Handler to navigate between views with browser history push
  const handleNavigateView = (viewId, replace = false) => {
    setActiveView(viewId);
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (viewId === 'dashboard') {
        next.delete('tab');
      } else {
        next.set('tab', viewId);
      }
      return next;
    }, { replace });
    setIsMobileOpen(false);
  };

  // History-aware back navigation helper (steps back to previous internal tab, or falls back to dashboard)
  const handleGoBack = () => {
    if (window.history.state && typeof window.history.state.idx === 'number' && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      handleNavigateView('dashboard');
    }
  };

  // Collapsible Sidebar States (with local storage persistence)
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('crm_sidebar_collapsed') === 'true';
  });
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);

  // Auto-track screen resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setIsMobileOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Resolve user role display label
  const userRoleKey = user?.role || (Array.isArray(user?.roles) ? user.roles[0] : 'ROLE_SUPER_ADMIN') || 'ROLE_SUPER_ADMIN';
  const formatRoleName = (role) => {
    switch (role) {
      case 'ROLE_SUPER_ADMIN': return '👑 Super Admin';
      case 'ROLE_ADMIN': return '👑 Administrator';
      case 'ROLE_MANAGER': return '👔 Branch Manager';
      case 'ROLE_ADVISOR': return '🎯 Insurance Advisor';
      case 'ROLE_POSP_AGENT': return '🤝 POSP Partner';
      case 'ROLE_STAFF': return '💼 Support Staff';
      default: return '👤 User';
    }
  };

  // View metadata for in-page header and breadcrumb navigation
  const getViewMeta = (viewId) => {
    switch (viewId) {
      case 'clients':
        return {
          title: 'Client Data Sheet',
          category: 'CRM Workspace',
          subtitle: 'Interactive spreadsheet for fast lead filtering, client updates, and multi-advisor assignment.',
          icon: <FileSpreadsheet size={18} color="#0284c7" />
        };
      case 'agenda':
        return {
          title: 'Daily Work Agenda',
          category: 'CRM Workspace',
          subtitle: 'Unified daily schedule: scheduled Google Meets, client callbacks, and overdue task recovery.',
          icon: <PhoneCall size={18} color="#ea580c" />
        };
      case 'calls':
        return {
          title: 'Call History & Telephony Archive',
          category: 'CRM Workspace',
          subtitle: 'Audit logs of all client calls, outcomes, talk time duration, and advisor discussions.',
          icon: <PhoneCall size={18} color="#2563eb" />
        };
      case 'pipeline':
        return {
          title: 'Sales Pipeline',
          category: 'CRM Workspace',
          subtitle: 'Visual Kanban stage-progression from initial inquiry to policy issuance.',
          icon: <TrendingUp size={18} color="#059669" />
        };
      case 'meetings':
        return {
          title: 'Meeting Calendar',
          category: 'CRM Workspace',
          subtitle: 'Synchronized schedule of advisory video consultations and in-person meetings.',
          icon: <Calendar size={18} color="#7c3aed" />
        };
      case 'renewals':
        return {
          title: 'Policy Renewal Desk',
          category: 'CRM Workspace',
          subtitle: 'Automated milestone tracking, NCB protection, and 1-tap WhatsApp renewal dispatch.',
          icon: <ShieldCheck size={18} color="#16a34a" />
        };
      case 'proposals':
        return {
          title: 'Quotes & Proposals Desk',
          category: 'CRM Workspace',
          subtitle: 'Multi-insurer comparative proposals, automated GST, benefit breakdown, and WhatsApp quote dispatch.',
          icon: <FileSpreadsheet size={18} color="#0284c7" />
        };
      case 'documents':
        return {
          title: 'Digital KYC & Document Locker',
          category: 'CRM Workspace',
          subtitle: 'Centralized repository of Aadhaar, PAN, previous policies, RC books, and medical reports with verification workflows.',
          icon: <FolderCheck size={18} color="#059669" />
        };
      case 'approvals':
        return {
          title: 'Executive Approvals & Exceptions Desk',
          category: 'Operations & Management',
          subtitle: 'Review & authorize quotation discounts, high sum-insured underwriting exceptions, lead reassignments, and policy cancellations.',
          icon: <CheckSquare size={18} color="#d97706" />
        };
      case 'audit':
        return {
          title: 'Enterprise Audit Trail & Compliance',
          category: 'Operations & Management',
          subtitle: 'Zero-tamper record of all field modifications, stage transitions, and advisor activities.',
          icon: <ShieldCheck size={18} color="#f59e0b" />
        };
      case 'users':
        return {
          title: 'User & Team Management',
          category: 'Operations & Management',
          subtitle: 'Manage branch managers, insurance advisors, staff permissions, and hierarchy teams.',
          icon: <Users size={18} color="#059669" />
        };
      case 'leads':
        return {
          title: 'Leads & Inquiries',
          category: 'CRM Workspace',
          subtitle: 'Real-time prospective customer insurance and loan inquiries from the web portal.',
          icon: <Briefcase size={18} color="#16a34a" />
        };
      case 'posp':
        return {
          title: 'POSP Partner Network',
          category: 'Operations & Management',
          subtitle: 'POSP agent registrations, KYC verification, certifications, and approvals.',
          icon: <Award size={18} color="#d97706" />
        };
      case 'claims':
        return {
          title: 'Claims Assistance Desk',
          category: 'Operations & Management',
          subtitle: 'End-to-end claim settlement tracking, hospital paperwork, and customer support.',
          icon: <ShieldAlert size={18} color="#dc2626" />
        };
      case 'hospitals':
        return {
          title: 'Cashless Hospital Network',
          category: 'Operations & Management',
          subtitle: 'Comprehensive directory of verified cashless hospital admission desks and contacts.',
          icon: <Building2 size={18} color="#0891b2" />
        };
      default:
        return {
          title: 'Dashboard Overview',
          category: 'Portal',
          subtitle: 'High-level business analytics and operational performance summary.',
          icon: <LayoutDashboard size={18} color="#0f2b48" />
        };
    }
  };

  // Dataset states
  const [quotes, setQuotes] = useState([]);
  const [pospList, setPospList] = useState([]);
  const [claims, setClaims] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [leads, setLeads] = useState([]);
  const [dueFollowUps, setDueFollowUps] = useState([]);
  const [managerAnalytics, setManagerAnalytics] = useState(null);
  const [superAdminAnalytics, setSuperAdminAnalytics] = useState(null);
  const [advisorAnalytics, setAdvisorAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Global Interactive Drawers / Modals
  const [selectedClient360, setSelectedClient360] = useState(null);
  const [preselectedMeetingClient, setPreselectedMeetingClient] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileModalTab, setProfileModalTab] = useState('profile');

  // Top Header User Profile Dropdown Menu
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  // Click outside & Escape key listeners to dismiss profile menu
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowUserMenu(false);
      }
    };
    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showUserMenu]);



  // Persist sidebar state
  const toggleSidebar = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('crm_sidebar_collapsed', String(next));
      return next;
    });
  };

  const handleMenuToggle = () => {
    if (window.innerWidth < 768) {
      setIsMobileOpen(prev => !prev);
    } else {
      toggleSidebar();
    }
  };

  // Keyboard shortcut Cmd/Ctrl + B
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadData();
  }, [isAuthenticated, authLoading]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [qData, pData, cData, hData, lData, fData, mData, sData, aData] = await Promise.all([
        portalService.getAdminQuotes().catch(() => []),
        portalService.getAdminPOSP().catch(() => []),
        portalService.getAdminClaims().catch(() => []),
        portalService.searchHospitals('', '').catch(() => []),
        crmService.getClients().catch(() => []),
        crmService.getDueTodayFollowUps().catch(() => []),
        (isSuperAdmin || isManager) ? crmService.getManagerSummary().catch(() => null) : Promise.resolve(null),
        isSuperAdmin ? crmService.getSuperAdminSummary().catch(() => null) : Promise.resolve(null),
        crmService.getAdvisorSummary().catch(() => null)
      ]);
      setQuotes(qData || []);
      setPospList(pData || []);
      setClaims(cData || []);
      setHospitals(hData || []);
      setLeads(lData || []);
      setDueFollowUps(fData || []);
      setManagerAnalytics(mData);
      setSuperAdminAnalytics(sData);
      setAdvisorAnalytics(aData);
    } catch (err) {
      console.error('Error fetching admin/crm datasets', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePOSP = async (id, status) => {
    try {
      await portalService.updatePOSPStatus(id, status);
      loadData();
    } catch (err) {
      alert('Failed to update POSP status');
    }
  };



  // Navigation Items
  const navItemsCRM = [
    { id: 'dashboard', label: 'CRM Dashboard', icon: <LayoutDashboard size={19} />, count: null },
    { id: 'leads', label: 'Leads', icon: <Briefcase size={19} />, count: quotes.length, badgeColor: '#16a34a' },
    { id: 'clients', label: 'Client Data Sheet', icon: <FileText size={19} />, count: leads.length, badgeColor: '#0284c7' },
    { id: 'pipeline', label: 'Sales Pipeline', icon: <TrendingUp size={19} />, count: null },
    { id: 'agenda', label: 'Daily Work Agenda', icon: <PhoneCall size={19} />, count: dueFollowUps.length, badgeColor: '#ea580c' },
    { id: 'calls', label: 'Call History Log', icon: <PhoneCall size={19} />, count: null },
    { id: 'meetings', label: 'Meeting Calendar', icon: <Calendar size={19} />, count: null },
    { id: 'proposals', label: 'Quotes & Proposals', icon: <FileSpreadsheet size={19} />, count: null },
    { id: 'renewals', label: 'Policy Renewal Desk', icon: <ShieldCheck size={19} />, count: null },
    { id: 'documents', label: 'Document Locker', icon: <FolderCheck size={19} />, count: null },
  ];

  const navItemsAdmin = [
    ...(canManageUsers ? [{ id: 'users', label: 'User & Team Hierarchy', icon: <Users size={19} />, count: null }] : []),
    ...((isSuperAdmin || isManager) ? [
      { id: 'approvals', label: 'Manager Approvals Desk', icon: <CheckSquare size={19} />, count: null },
      { id: 'audit', label: 'Audit Trail & Compliance', icon: <ShieldCheck size={19} />, count: null }
    ] : []),
    { id: 'posp', label: 'POSP Agent Network', icon: <UserCheck size={19} />, count: pospList.filter(p => p.status === 'PENDING').length, badgeColor: '#d97706' },
    { id: 'hospitals', label: 'Cashless Hospitals', icon: <Building2 size={19} />, count: hospitals.length, badgeColor: '#059669' },
    { id: 'claims', label: 'Claims Desk', icon: <Crosshair size={19} />, count: claims.length, badgeColor: '#2563eb' },
  ];

  const showMiniRail = !isMobile && isCollapsed;
  const currentSidebarWidth = isMobile ? '280px' : (showMiniRail ? '68px' : '260px');

  if (authLoading) {
    return (
      <div style={{
        display: 'flex',
        height: '100vh',
        width: '100vw',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-main)',
        color: 'var(--text-main)',
        fontFamily: 'var(--font-sans)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: '3px solid #cbd5e1',
            borderTopColor: 'var(--accent-gold, #f59e0b)',
            animation: 'spin 0.8s linear infinite'
          }} />
          <span style={{ fontSize: '0.92rem', color: '#64748b', fontWeight: 600, letterSpacing: '0.2px' }}>
            Restoring CRM session...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)', color: 'var(--text-main)', fontFamily: 'var(--font-sans)' }}>
      
      {/* MOBILE BACKDROP OVERLAY */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            zIndex: 9990,
            backdropFilter: 'none'
          }}
        />
      )}

      {/* 1. COLLAPSIBLE LEFT CRM SIDEBAR (Sticky on Desktop, Drawer on Mobile) */}
      <aside 
        className={`crm-workspace-aside ${isMobileOpen ? 'mobile-open' : ''}`}
        style={{
          width: currentSidebarWidth,
          minWidth: currentSidebarWidth,
          background: 'var(--crm-bg-sidebar)',
          color: 'var(--crm-sidebar-text-active)',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: 'var(--shadow-lg)',
          transition: 'width 0.22s cubic-bezier(0.4, 0, 0.2, 1), transform 0.22s ease',
          overflow: 'hidden'
        }}
      >
        {/* Sidebar Brand Header */}
        <div style={{
          padding: showMiniRail ? '1.25rem 0.75rem' : '1.25rem 1.25rem',
          borderBottom: '1px solid var(--crm-sidebar-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: showMiniRail ? 'center' : 'space-between',
          height: '68px',
          boxSizing: 'border-box',
          background: '#ffffff'
        }}>
          {!showMiniRail ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
              <div style={{
                width: '38px',
                height: '38px',
                minWidth: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, var(--primary-navy) 0%, var(--primary-navy-dark) 100%)',
                border: '1.5px solid rgba(245, 158, 11, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-gold)',
                fontWeight: 800,
                fontSize: '1.05rem',
                boxShadow: '0 2px 8px rgba(15, 43, 72, 0.15)'
              }}>
                AR
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontWeight: 800, fontSize: '1.02rem', letterSpacing: '-0.3px', color: 'var(--primary-navy)', whiteSpace: 'nowrap' }}>
                  Aadhiraksha
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--crm-text-secondary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem', whiteSpace: 'nowrap' }}>
                  <Sparkles size={12} color="var(--accent-gold)" /> Enterprise CRM
                </div>
              </div>
            </div>
          ) : (
            <div 
              onClick={toggleSidebar}
              title="Expand Sidebar (Cmd/Ctrl + B)"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, var(--primary-navy) 0%, var(--primary-navy-dark) 100%)',
                border: '1.5px solid rgba(245, 158, 11, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-gold)',
                fontWeight: 800,
                fontSize: '1.05rem',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(15, 43, 72, 0.15)'
              }}
            >
              AR
            </div>
          )}

          {/* If mobile, show Close (X) button; If desktop expanded, show Collapse (<) button */}
          {isMobile ? (
            <button
              onClick={() => setIsMobileOpen(false)}
              title="Close Drawer"
              style={{
                background: '#f1f5f9',
                border: '1px solid var(--border-subtle)',
                color: 'var(--crm-text-secondary)',
                borderRadius: '8px',
                padding: '0.4rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#e2e8f0'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
            >
              <X size={18} />
            </button>
          ) : (
            !showMiniRail && (
              <button
                onClick={toggleSidebar}
                title="Collapse Sidebar (Cmd/Ctrl + B)"
                style={{
                  background: '#f8fafc',
                  border: '1px solid var(--crm-sidebar-border)',
                  color: 'var(--crm-text-secondary)',
                  borderRadius: '7px',
                  padding: '0.35rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.color = 'var(--primary-navy)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = 'var(--crm-text-secondary)'; }}
              >
                <ChevronLeft size={16} />
              </button>
            )
          )}
        </div>

        {/* Navigation Section */}
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: showMiniRail ? '0.75rem 0.4rem' : '1rem 0.75rem' }}>
          
          {/* CRM WORKSPACE GROUP */}
          {!showMiniRail ? (
            <div style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              color: '#334155',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              padding: '0.6rem 0.75rem 0.4rem',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span>CRM Workspace</span>
            </div>
          ) : (
            <div style={{ height: '1px', background: 'var(--crm-sidebar-border)', margin: '0.5rem 0.4rem' }} />
          )}

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '1rem' }}>
            {navItemsCRM.map((item) => {
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigateView(item.id)}
                  title={showMiniRail ? `${item.label} ${item.count ? `(${item.count})` : ''}` : undefined}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: showMiniRail ? 'center' : 'space-between',
                    padding: showMiniRail ? '0.7rem 0' : '0.65rem 0.75rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: isActive ? 'var(--crm-bg-sidebar-active)' : 'transparent',
                    color: isActive ? 'var(--crm-sidebar-text-active)' : 'var(--crm-sidebar-text)',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '0.86rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    textAlign: 'left',
                    boxShadow: isActive ? '0 2px 6px rgba(0,0,0,0.05)' : 'none',
                    borderLeft: isActive && !showMiniRail ? '3px solid var(--accent-gold)' : '3px solid transparent',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'var(--crm-bg-sidebar-hover)';
                      e.currentTarget.style.color = 'var(--crm-sidebar-text-active)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'var(--crm-sidebar-text)';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <span style={{ color: isActive ? 'var(--accent-gold)' : 'var(--crm-sidebar-text)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {item.icon}
                    </span>
                    {!showMiniRail && <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>}
                  </div>
                  
                  {!showMiniRail && item.count !== null && item.count > 0 && (
                    <span style={{
                      background: item.badgeColor || '#0284c7',
                      color: '#fff',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      padding: '0.1rem 0.45rem',
                      borderRadius: '999px'
                    }}>
                      {item.count}
                    </span>
                  )}

                  {/* Dot indicator when collapsed */}
                  {showMiniRail && item.count !== null && item.count > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '6px',
                      right: '8px',
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      background: item.badgeColor || '#ea580c'
                    }} />
                  )}
                </button>
              );
            })}
          </nav>

          {/* ADMIN & OPERATIONS GROUP */}
          {!showMiniRail ? (
            <div style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              color: '#334155',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              padding: '0.75rem 0.75rem 0.4rem',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span>Operations & Admin</span>
            </div>
          ) : (
            <div style={{ height: '1px', background: 'var(--crm-sidebar-border)', margin: '0.5rem 0.4rem' }} />
          )}

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {navItemsAdmin.map((item) => {
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigateView(item.id)}
                  title={showMiniRail ? `${item.label} ${item.count ? `(${item.count})` : ''}` : undefined}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: showMiniRail ? 'center' : 'space-between',
                    padding: showMiniRail ? '0.7rem 0' : '0.65rem 0.75rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: isActive ? 'var(--crm-bg-sidebar-active)' : 'transparent',
                    color: isActive ? 'var(--crm-sidebar-text-active)' : 'var(--crm-sidebar-text)',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '0.86rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    textAlign: 'left',
                    boxShadow: isActive ? '0 2px 6px rgba(0,0,0,0.05)' : 'none',
                    borderLeft: isActive && !showMiniRail ? '3px solid var(--accent-gold)' : '3px solid transparent',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'var(--crm-bg-sidebar-hover)';
                      e.currentTarget.style.color = 'var(--crm-sidebar-text-active)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'var(--crm-sidebar-text)';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <span style={{ color: isActive ? 'var(--accent-gold)' : 'var(--crm-sidebar-text)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {item.icon}
                    </span>
                    {!showMiniRail && <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>}
                  </div>
                  
                  {!showMiniRail && item.count !== null && item.count > 0 && (
                    <span style={{
                      background: item.badgeColor || '#d97706',
                      color: '#fff',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      padding: '0.1rem 0.45rem',
                      borderRadius: '999px'
                    }}>
                      {item.count}
                    </span>
                  )}

                  {/* Dot indicator when collapsed */}
                  {showMiniRail && item.count !== null && item.count > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '6px',
                      right: '8px',
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      background: item.badgeColor || '#d97706'
                    }} />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer User Card */}
        <div style={{
          padding: showMiniRail ? '0.75rem 0.4rem' : '0.85rem 1rem',
          borderTop: '1px solid var(--crm-sidebar-border)',
          background: 'var(--crm-bg-sidebar-footer)',
          boxSizing: 'border-box'
        }}>
          {!showMiniRail ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div 
                  onClick={() => setShowProfileModal(true)}
                  title="Open Account & Profile Settings"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', overflow: 'hidden', cursor: 'pointer', flex: 1, padding: '0.2rem', borderRadius: '8px', transition: 'background 0.15s ease' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#e2e8f0'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ width: '34px', height: '34px', minWidth: '34px', borderRadius: '50%', background: 'linear-gradient(135deg, #0f2b48, #1e3a5f)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontWeight: 800, fontSize: '0.82rem', border: '1.5px solid #cbd5e1' }}>
                    {user?.fullName ? user.fullName.charAt(0) : 'A'}
                  </div>
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f2b48', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                      {user?.fullName || 'Aadhiraksha User'}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#0284c7', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '1px' }}>
                      <span style={{ fontWeight: 600 }}>{formatRoleName(userRoleKey)}</span>
                      <span style={{ color: '#64748b', fontSize: '0.65rem' }}>⚙️</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={logout}
                  title="Sign Out"
                  style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '0.35rem', borderRadius: '6px' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
                >
                  <LogOut size={16} />
                </button>
              </div>

              {/* Back to Public Web Portal Link */}
              <Link
                to="/"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  color: '#475569',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  padding: '0.4rem 0.55rem',
                  borderRadius: '6px',
                  background: '#ffffff',
                  border: '1px solid var(--crm-sidebar-border)',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent-gold)'; e.currentTarget.style.borderColor = 'var(--accent-gold)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#475569'; e.currentTarget.style.borderColor = 'var(--crm-sidebar-border)'; }}
              >
                <Globe size={13} />
                <span>Back to Customer Portal</span>
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <div 
                onClick={() => setShowProfileModal(true)}
                title={`Open Account Settings: ${user?.fullName || 'Super Admin'}`}
                style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg, #0f2b48, #1e3a5f)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontWeight: 700, fontSize: '0.82rem', border: '1.5px solid #cbd5e1', cursor: 'pointer' }}
              >
                {user?.fullName ? user.fullName.charAt(0) : 'A'}
              </div>
              <button
                onClick={logout}
                title="Sign Out"
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '0.35rem' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* 2. MAIN APP SHELL WORKSPACE (Natural Document Window Scrolling) */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        
        {/* TOP CRM APP BAR (Sticky to Viewport Top) */}
        <header 
          className="crm-top-appbar"
          style={{
            height: '64px',
            minHeight: '64px',
            background: 'var(--crm-header-bg)',
            borderBottom: '1px solid var(--crm-header-border)',
            padding: '0 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 50,
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          {/* Left: Sidebar Toggle + Portal Brand Title + Live Sync Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0, overflow: 'hidden' }}>
            <button
              onClick={handleMenuToggle}
              title={isCollapsed ? "Expand Sidebar (Cmd/Ctrl + B)" : "Collapse Sidebar (Cmd/Ctrl + B)"}
              style={{
                background: 'var(--bg-main)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '0.45rem 0.55rem',
                color: 'var(--text-main)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background var(--transition-fast)',
                flexShrink: 0
              }}
            >
              <Menu size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
              <span style={{ 
                fontSize: '0.92rem', 
                fontWeight: 800, 
                color: 'var(--primary-navy)', 
                letterSpacing: '-0.01em',
                whiteSpace: 'nowrap'
              }}>
                Aadhiraksha CRM Portal
              </span>

              <span className="crm-livesync-badge" style={{ background: 'var(--accent-emerald-light)', color: 'var(--accent-emerald-dark)', fontSize: '0.68rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '999px', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', flexShrink: 0 }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-emerald)' }}></span>
                Live Sync
              </span>
            </div>
          </div>

          {/* Right Header Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexShrink: 0 }}>
            
            {/* Quick Action Buttons */}
            <button
              onClick={() => handleNavigateView('agenda')}
              className="crm-action-btn"
              title={`Calls Due (${dueFollowUps.length})`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                padding: '0.45rem 0.75rem',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: 'var(--text-main)',
                cursor: 'pointer'
              }}
            >
              <PhoneCall size={14} color="#ea580c" />
              <span className="crm-action-btn-text">Calls Due ({dueFollowUps.length})</span>
            </button>

            <button
              onClick={() => handleNavigateView('meetings')}
              className="crm-action-btn"
              title="Meeting Calendar"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                padding: '0.45rem 0.75rem',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: 'var(--text-main)',
                cursor: 'pointer'
              }}
            >
              <Calendar size={14} color="#7c3aed" />
              <span className="crm-action-btn-text">Calendar</span>
            </button>

            {/* Refresh Button */}
            <button
              onClick={loadData}
              title="Refresh Portal Data"
              style={{
                background: 'var(--bg-main)',
                border: '1px solid var(--border-subtle)',
                padding: '0.45rem',
                borderRadius: '8px',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <RefreshCw size={15} />
            </button>

            {/* Header User Profile Avatar & Dropdown Menu */}
            <div style={{ position: 'relative' }} ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(prev => !prev)}
                title="Account & Profile Settings"
                className={`crm-header-user-btn ${showUserMenu ? 'active' : ''}`}
              >
                {/* Avatar with active presence dot */}
                <div style={{ position: 'relative' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--primary-navy), var(--primary-navy-light))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '0.8rem',
                    boxShadow: 'var(--shadow-xs)'
                  }}>
                    {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'A'}
                  </div>
                  <span style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#10b981',
                    border: '1.5px solid #ffffff'
                  }} />
                </div>

                <div className="crm-header-user-text" style={{ textAlign: 'left', lineHeight: 1.2 }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--crm-text-primary)' }}>
                    {user?.fullName ? user.fullName.split(' ')[0] : 'Admin'}
                  </div>
                  <div style={{ fontSize: '0.66rem', fontWeight: 700, color: 'var(--accent-gold)' }}>
                    👑 {formatRoleName(userRoleKey)}
                  </div>
                </div>

                <ChevronDown size={14} color="var(--crm-text-muted)" style={{ transition: 'transform var(--transition-fast)', transform: showUserMenu ? 'rotate(180deg)' : 'none' }} />
              </button>

              {/* Popover Dropdown Card */}
              {showUserMenu && (
                <div className="crm-popover-card">
                  {/* User Identity Header */}
                  <div className="crm-popover-identity">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--primary-navy), var(--primary-navy-light))',
                        color: '#fff',
                        fontWeight: 800,
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'A'}
                      </div>
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--crm-text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                          {user?.fullName || 'Aadhiraksha User'}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--crm-text-muted)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                          {user?.email || user?.username || 'user@aadhiraksha.com'}
                        </div>
                      </div>
                    </div>
                    <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '0.15rem 0.5rem',
                        borderRadius: '999px',
                        background: 'var(--crm-info-bg)',
                        color: 'var(--crm-info)'
                      }}>
                        <ShieldCheck size={11} /> {formatRoleName(userRoleKey)}
                      </span>
                    </div>
                  </div>

                  {/* Dropdown Items */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        setProfileModalTab('profile');
                        setShowProfileModal(true);
                      }}
                      className="crm-popover-btn"
                    >
                      <User size={15} color="var(--primary-navy)" />
                      <span>My Profile Details</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        setProfileModalTab('security');
                        setShowProfileModal(true);
                      }}
                      className="crm-popover-btn"
                    >
                      <Lock size={15} color="var(--accent-gold)" />
                      <span>Security & Password</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        setProfileModalTab('preferences');
                        setShowProfileModal(true);
                      }}
                      className="crm-popover-btn"
                    >
                      <Sparkles size={15} color="#7c3aed" />
                      <span>CRM Preferences</span>
                    </button>

                    <div style={{ height: '1px', background: 'var(--crm-border-subtle)', margin: '0.35rem 0' }} />

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                      }}
                      className="crm-popover-btn danger"
                    >
                      <LogOut size={15} color="var(--crm-danger)" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* WORKSPACE VIEW CONTENT AREA (Full-Page Document Stream) */}
        <div className="crm-workspace-main-content" style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>

          {/* SLIM IN-PAGE NAVIGATION & BREADCRUMB BAR (Shown on all sub-views) */}
          {activeView !== 'dashboard' && (() => {
            const meta = getViewMeta(activeView);
            return (
              <div 
                className="crm-page-nav-bar"
                style={{
                  marginBottom: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                  flexWrap: 'wrap'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {/* High-Contrast Distinct Back Button */}
                  <button
                    onClick={handleGoBack}
                    title="Go back to previous screen"
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      padding: '0.35rem 0.65rem',
                      color: 'var(--text-main)',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      boxShadow: 'var(--shadow-xs, 0 1px 2px rgba(0,0,0,0.05))',
                      transition: 'all var(--transition-fast)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--accent-gold)';
                      e.currentTarget.style.color = 'var(--accent-gold)';
                      e.currentTarget.style.background = 'var(--bg-main)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-subtle)';
                      e.currentTarget.style.color = 'var(--text-main)';
                      e.currentTarget.style.background = 'var(--bg-card)';
                    }}
                  >
                    <ArrowLeft size={14} />
                    <span>Back</span>
                  </button>

                  <div className="crm-breadcrumb-sep" style={{ width: '1px', height: '18px', background: 'var(--border-subtle)' }} />

                  {/* Micro Breadcrumb Trail */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    <span
                      onClick={() => handleNavigateView('dashboard')}
                      style={{ cursor: 'pointer', color: 'var(--text-muted)' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-gold)'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                    >
                      Overview
                    </span>
                    <ChevronRight size={12} className="crm-breadcrumb-sep" color="var(--text-muted)" />
                    <span className="crm-breadcrumb-category">{meta.category}</span>
                    <ChevronRight size={12} color="var(--text-muted)" />
                    <span style={{ color: 'var(--primary-navy)', fontWeight: 800 }}>{meta.title}</span>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* VIEW: CRM DASHBOARD OVERVIEW */}
          {activeView === 'dashboard' && (
            isSuperAdmin ? (
              <SuperAdminDashboardOverview 
                user={user}
                analytics={superAdminAnalytics}
                loading={loading}
                onRefresh={loadData}
                onNavigateView={handleNavigateView}
              />
            ) : isManager ? (
              <ManagerDashboardOverview 
                user={user}
                analytics={managerAnalytics}
                loading={loading}
                onRefresh={loadData}
                onNavigateView={handleNavigateView}
                onSelectClient={(client) => setSelectedClient360(client)}
              />
            ) : (
              <AdvisorDashboardOverview 
                user={user}
                analytics={advisorAnalytics}
                loading={loading}
                onRefresh={loadData}
                onNavigateView={handleNavigateView}
                onSelectClient={(client) => setSelectedClient360(client)}
              />
            )
          )}

          {/* VIEW: CLIENT DATA SHEET (EXCEL GRID) */}
          {activeView === 'clients' && (
            <ClientDataSheetView 
              onOpenClient360={(lead) => setSelectedClient360(lead)}
              onOpenCallModal={() => handleNavigateView('agenda')}
              onOpenMeetingModal={(lead) => {
                setPreselectedMeetingClient(lead);
                handleNavigateView('meetings');
              }}
            />
          )}

          {/* VIEW: DAILY CALL AGENDA */}
          {activeView === 'agenda' && (
            <DailyCallAgendaView 
              onOpenClient360={(lead) => setSelectedClient360(lead)}
              onOpenMeetingModal={(lead) => {
                setPreselectedMeetingClient(lead);
                handleNavigateView('meetings');
              }}
            />
          )}

          {/* VIEW: CALL HISTORY ARCHIVE */}
          {activeView === 'calls' && (
            <CallHistoryView 
              onOpenClient360={(client) => setSelectedClient360(client)}
            />
          )}

          {/* VIEW: SALES PIPELINE KANBAN */}
          {activeView === 'pipeline' && (
            <SalesPipelineView 
              onOpenClient360={(lead) => setSelectedClient360(lead)}
              onOpenCallModal={() => handleNavigateView('agenda')}
              onOpenMeetingModal={(lead) => {
                setPreselectedMeetingClient(lead);
                handleNavigateView('meetings');
              }}
            />
          )}

          {/* VIEW: MEETING CALENDAR */}
          {activeView === 'meetings' && (
            <MeetingCalendarView 
              preselectedClient={preselectedMeetingClient}
              onCloseModal={() => setPreselectedMeetingClient(null)}
              onOpenClient360={(client) => setSelectedClient360(client)}
              onOpenCallModal={() => handleNavigateView('agenda')}
            />
          )}

          {/* VIEW: POLICY RENEWAL DESK */}
          {activeView === 'renewals' && (
            <PolicyRenewalDeskView 
              onOpenClient360={(client) => setSelectedClient360(client)}
              onOpenMeetingModal={(client) => {
                setPreselectedMeetingClient(client);
                handleNavigateView('meetings');
              }}
            />
          )}

          {/* VIEW: QUOTATION MANAGEMENT / PROPOSALS */}
          {activeView === 'proposals' && (
            <QuotationManagementView 
              onOpenClient360={(client) => setSelectedClient360(client)}
            />
          )}

          {/* VIEW: DIGITAL KYC & DOCUMENT LOCKER */}
          {activeView === 'documents' && (
            <DocumentLockerView 
              onOpenClient360={(client) => setSelectedClient360(client)}
            />
          )}

          {/* VIEW: USER MANAGEMENT */}
          {activeView === 'users' && (
            <UserManagementView />
          )}

          {/* VIEW: AUDIT TRAIL & COMPLIANCE */}
          {activeView === 'audit' && (
            <AuditTrailView 
              onOpenClient360={(client) => setSelectedClient360(client)}
            />
          )}

          {/* VIEW: EXECUTIVE APPROVALS & EXCEPTION DESK */}
          {activeView === 'approvals' && (
            <ManagerApprovalsView 
              onOpenClient360={(client) => setSelectedClient360(client)}
            />
          )}

          {/* VIEW: LEADS & INQUIRIES */}
          {activeView === 'leads' && (
            <LeadInquiriesView
              quotes={quotes}
              leads={leads}
              setQuotes={setQuotes}
              setLeads={setLeads}
              onOpenClient360={(client) => setSelectedClient360(client)}
            />
          )}

          {/* VIEW: POSP AGENTS */}
          {activeView === 'posp' && (
            <PospApplicationsView 
              pospList={pospList} 
              onUpdateStatus={handleUpdatePOSP} 
            />
          )}

          {/* VIEW: CLAIMS */}
          {activeView === 'claims' && (
            <ClaimsIntimationView 
              claims={claims} 
            />
          )}

          {/* VIEW: CASHLESS HOSPITALS */}
          {activeView === 'hospitals' && (
            <NetworkHospitalsView 
              hospitals={hospitals} 
              setHospitals={setHospitals} 
            />
          )}

          {/* 3. MINIMALIST ENTERPRISE CRM FOOTER (Scrolls naturally at bottom, non-sticky) */}
          <footer className="crm-minimal-footer">
            <div className="crm-footer-left">
              <span>&copy; {new Date().getFullYear()} Aadhiraksha Insurance & Financial Services</span>
              <span className="crm-footer-divider">•</span>
              <span className="crm-footer-version">CRM Engine v2.4</span>
            </div>

            <div className="crm-footer-center">
              <span className="crm-footer-status-dot"></span>
              <span>All Systems Operational (IRDAI ISO/IEC 27001)</span>
            </div>

            <div className="crm-footer-right">
              <span>Engineered by </span>
              <a 
                href="https://www.prabhatech.com/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="crm-footer-partner-link"
              >
                PrabhaTech
              </a>
            </div>
          </footer>
        </div>
      </main>

      {/* 3. SLIDE-OVER CLIENT 360 DRAWER */}
      {selectedClient360 && (
        <Client360Drawer 
          client={selectedClient360}
          onClose={() => setSelectedClient360(null)}
          onOpenCallModal={() => {
            setSelectedClient360(null);
            setActiveView('agenda');
          }}
          onOpenMeetingModal={(client) => {
            setSelectedClient360(null);
            setPreselectedMeetingClient(client);
            setActiveView('meetings');
          }}
        />
      )}

      {/* Global Self-Service Account & Profile Settings Modal */}
      <UserProfileModal 
        isOpen={showProfileModal} 
        onClose={() => setShowProfileModal(false)} 
        defaultTab={profileModalTab}
      />

    </div>
  );
}
