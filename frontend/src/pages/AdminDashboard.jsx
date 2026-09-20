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

// Official WhatsApp Brand SVG Component (Proportionate Vector Geometry)
const WhatsAppIcon = ({ size = 18, color = 'currentColor', style = {} }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.63C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 6.46 17.5 2 12.04 2ZM12.04 20.15C10.56 20.15 9.11 19.76 7.85 19.01L7.55 18.83L4.44 19.65L5.27 16.61L5.07 16.3C4.24 14.98 3.81 13.47 3.81 11.91C3.81 7.37 7.5 3.68 12.04 3.68C16.58 3.68 20.27 7.37 20.27 11.91C20.27 16.45 16.58 20.15 12.04 20.15ZM16.53 14.41C16.28 14.28 15.06 13.68 14.83 13.6C14.6 13.51 14.44 13.47 14.27 13.72C14.11 13.97 13.63 14.54 13.49 14.71C13.34 14.87 13.2 14.89 12.95 14.77C12.7 14.64 11.9 14.38 10.95 13.53C10.21 12.87 9.71 12.06 9.57 11.81C9.42 11.56 9.55 11.43 9.68 11.3C9.79 11.19 9.92 11.01 10.05 10.87C10.17 10.72 10.21 10.62 10.3 10.45C10.38 10.29 10.34 10.14 10.28 10.02C10.22 9.89 9.73 8.69 9.52 8.2C9.33 7.71 9.12 7.78 8.97 7.77C8.83 7.76 8.66 7.76 8.5 7.76C8.33 7.76 8.06 7.82 7.83 8.07C7.6 8.32 6.95 8.93 6.95 10.16C6.95 11.39 7.85 12.57 7.97 12.74C8.1 12.9 9.73 15.42 12.23 16.5C12.82 16.76 13.28 16.91 13.64 17.03C14.24 17.22 14.79 17.19 15.22 17.13C15.7 17.06 16.7 16.52 16.91 15.94C17.12 15.37 17.12 14.87 17.06 14.77C16.99 14.66 16.78 14.54 16.53 14.41Z"
      fill={color}
    />
  </svg>
);
import ManagerDashboardOverview from '../components/crm/ManagerDashboardOverview';
import SuperAdminDashboardOverview from '../components/crm/SuperAdminDashboardOverview';
import AdvisorDashboardOverview from '../components/crm/AdvisorDashboardOverview';
import PolicyRenewalDeskView from '../components/crm/PolicyRenewalDeskView';
import AuditTrailView from '../components/crm/AuditTrailView';
import QuotationManagementView from '../components/crm/QuotationManagementView';
import DocumentLockerView from '../components/crm/DocumentLockerView';
import CallHistoryView from '../components/crm/CallHistoryView';
import ManagerApprovalsView from '../components/crm/ManagerApprovalsView';

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
  // 'dashboard' | 'leads' | 'clients' | 'pipeline' | 'agenda' | 'calls' | 'meetings' | 'proposals' | 'renewals' | 'documents' | 'users' | 'approvals' | 'audit' | 'posp' | 'hospitals' | 'claims'
  const currentTabFromUrl = searchParams.get('tab') || 'dashboard';
  const [activeView, setActiveView] = useState(currentTabFromUrl);

  // Sync state when URL query param changes (e.g. Browser Back / Forward buttons)
  useEffect(() => {
    const tab = searchParams.get('tab') || 'dashboard';
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
          title: 'Daily Call Agenda',
          category: 'CRM Workspace',
          subtitle: 'Scheduled client follow-up calls, overdue pipeline reminders, and call logging.',
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

  // Hospital filters & search
  const [hospSearch, setHospSearch] = useState('');
  const [hospCityFilter, setHospCityFilter] = useState('');

  // Quotes filters, search & pagination
  const [quoteSearch, setQuoteSearch] = useState('');
  const [quoteCategoryFilter, setQuoteCategoryFilter] = useState('');
  const [quoteCurrentPage, setQuoteCurrentPage] = useState(1);
  const [quotePageSize, setQuotePageSize] = useState(10);

  // Modals state
  const [showAddHospitalModal, setShowAddHospitalModal] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Single Hospital Form State
  const [newHospital, setNewHospital] = useState({
    hospitalName: '',
    state: 'Karnataka',
    city: '',
    address: '',
    pincode: '',
    contactNumber: '',
    specialties: 'Multi-Specialty, Cardiology, Orthopedics, Emergency 24/7',
    cashlessAvailable: true,
    latitude: null,
    longitude: null
  });

  // Bulk Upload State
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkParsedData, setBulkParsedData] = useState([]);
  const [bulkError, setBulkError] = useState('');

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
        crmService.getLeads().catch(() => []),
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

  // Hospital Handlers
  const handleCreateHospital = async (e) => {
    e.preventDefault();
    if (!newHospital.hospitalName || !newHospital.city || !newHospital.address) {
      alert('Please fill in required hospital fields (Name, City, Address).');
      return;
    }
    setIsSubmitting(true);
    try {
      await portalService.createHospital(newHospital);
      setShowAddHospitalModal(false);
      setNewHospital({
        hospitalName: '',
        state: 'Karnataka',
        city: '',
        address: '',
        pincode: '',
        contactNumber: '',
        specialties: 'Multi-Specialty, Cardiology, Orthopedics, Emergency 24/7',
        cashlessAvailable: true,
        latitude: null,
        longitude: null
      });
      loadData();
      alert('Hospital added successfully to cashless network!');
    } catch (err) {
      console.error('Error creating hospital', err);
      alert('Failed to add hospital: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleHospitalStatus = async (id, name, currentActive) => {
    const actionLabel = currentActive ? 'soft-deactivate' : 'restore';
    if (!window.confirm(`Are you sure you want to ${actionLabel} "${name}" in the network directory? (Zero hard-deletes policy)`)) {
      return;
    }
    try {
      const updated = await portalService.toggleHospitalStatus(id);
      setHospitals(prev => prev.map(h => h.id === id ? updated : h));
    } catch (err) {
      console.error('Error toggling hospital status', err);
      alert('Failed to toggle hospital status: ' + (err.response?.data?.message || err.message));
    }
  };

  // Bulk File Parsing
  const handleBulkFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBulkFile(file);
    setBulkError('');

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result;
        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed)) {
            setBulkParsedData(parsed);
          } else {
            setBulkError('JSON file must contain an array of hospital objects.');
          }
        } else {
          // CSV Parser
          const lines = text.split(/\r\n|\n/).filter(line => line.trim() !== '');
          if (lines.length < 2) {
            setBulkError('CSV file must have a header row and at least 1 data row.');
            return;
          }
          const records = [];
          for (let i = 1; i < lines.length; i++) {
            const row = lines[i].split(',').map(cell => cell.trim().replace(/^["']|["']$/g, ''));
            if (row.length >= 3 && row[0]) {
              records.push({
                hospitalName: row[0] || 'Hospital',
                state: row[1] || 'Karnataka',
                city: row[2] || 'Bangalore',
                address: row[3] || row[0],
                pincode: row[4] || '560001',
                contactNumber: row[5] || '+91 8367415156',
                specialties: row[6] || 'General & Multi-Specialty',
                cashlessAvailable: row[7] ? row[7].toLowerCase() === 'true' || row[7] === '1' || row[7].toLowerCase() === 'yes' : true
              });
            }
          }
          if (records.length === 0) {
            setBulkError('Could not find valid hospital rows in CSV.');
          } else {
            setBulkParsedData(records);
          }
        }
      } catch (err) {
        setBulkError('Failed to parse file: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleSaveBulkHospitals = async () => {
    if (bulkParsedData.length === 0) {
      alert('No parsed hospital records to upload.');
      return;
    }
    setIsSubmitting(true);
    try {
      await portalService.createHospitalsBulk(bulkParsedData);
      setShowBulkUploadModal(false);
      setBulkFile(null);
      setBulkParsedData([]);
      loadData();
      alert(`Successfully imported ${bulkParsedData.length} network hospitals!`);
    } catch (err) {
      console.error('Error importing bulk hospitals', err);
      alert('Bulk import failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadSampleCSV = () => {
    const sample = `hospitalName,state,city,address,pincode,contactNumber,specialties,cashlessAvailable
Apollo Hospitals,Karnataka,Bangalore,"154/11 Bannerghatta Road, Opp IIM",560076,+91 80 2630 4050,"Cardiology, Oncology, Orthopedics, Emergency 24/7",true
Manipal Hospital,Karnataka,Bangalore,"98 HAL Airport Road, Kodihalli",560017,+91 80 2502 4444,"Multi-Specialty, Neuro, Organ Transplant, 24/7 Trauma",true
Fortis Hospital,Maharashtra,Mumbai,"Mulund Goregaon Link Road, Mulund West",400078,+91 22 4365 4365,"Cardiac Care, Emergency, Critical Care",true`;
    const blob = new Blob([sample], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'aadhiraksha_network_hospitals_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filtered hospitals
  const filteredHospitals = hospitals.filter(h => {
    const matchesSearch = !hospSearch || 
      h.hospitalName.toLowerCase().includes(hospSearch.toLowerCase()) ||
      (h.specialties && h.specialties.toLowerCase().includes(hospSearch.toLowerCase())) ||
      (h.address && h.address.toLowerCase().includes(hospSearch.toLowerCase()));
    const matchesCity = !hospCityFilter || h.city.toLowerCase() === hospCityFilter.toLowerCase();
    return matchesSearch && matchesCity;
  });

  const uniqueCities = Array.from(new Set(hospitals.map(h => h.city))).filter(Boolean).sort();

  // Navigation Items
  const navItemsCRM = [
    { id: 'dashboard', label: 'CRM Dashboard', icon: <LayoutDashboard size={19} />, count: null },
    { id: 'leads', label: 'Leads', icon: <Briefcase size={19} />, count: quotes.length, badgeColor: '#16a34a' },
    { id: 'clients', label: 'Client Data Sheet', icon: <FileText size={19} />, count: leads.length, badgeColor: '#0284c7' },
    { id: 'pipeline', label: 'Sales Pipeline', icon: <TrendingUp size={19} />, count: null },
    { id: 'agenda', label: 'Daily Call Agenda', icon: <PhoneCall size={19} />, count: dueFollowUps.length, badgeColor: '#ea580c' },
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
              onClick={() => setActiveView('meetings')}
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
        <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>

          {/* SLIM IN-PAGE NAVIGATION & BREADCRUMB BAR (Shown on all sub-views) */}
          {activeView !== 'dashboard' && (() => {
            const meta = getViewMeta(activeView);
            return (
              <div 
                className="crm-page-nav-bar"
                style={{
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                  flexWrap: 'wrap'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                  {/* High-Contrast Distinct Back Button */}
                  <button
                    onClick={handleGoBack}
                    title="Go back to previous screen"
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      padding: '0.35rem 0.75rem',
                      color: 'var(--text-main)',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
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

                  <div style={{ width: '1px', height: '18px', background: 'var(--border-subtle)' }} />

                  {/* Micro Breadcrumb Trail */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    <span
                      onClick={() => handleNavigateView('dashboard')}
                      style={{ cursor: 'pointer', color: 'var(--text-muted)' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-gold)'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                    >
                      Overview
                    </span>
                    <ChevronRight size={12} color="var(--text-muted)" />
                    <span>{meta.category}</span>
                    <ChevronRight size={12} color="var(--text-muted)" />
                    <span style={{ color: 'var(--primary-navy)', fontWeight: 700 }}>{meta.title}</span>
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
          {activeView === 'leads' && (() => {
            const filteredQuotes = quotes.filter((q) => {
              const matchesSearch = !quoteSearch || 
                (q.fullName && q.fullName.toLowerCase().includes(quoteSearch.toLowerCase())) ||
                (q.phoneNumber && q.phoneNumber.includes(quoteSearch)) ||
                (q.city && q.city.toLowerCase().includes(quoteSearch.toLowerCase()));
              
              const matchesCategory = !quoteCategoryFilter || 
                (q.categorySlug && q.categorySlug.toLowerCase() === quoteCategoryFilter.toLowerCase());

              return matchesSearch && matchesCategory;
            });

            // Precompute phone counts for multi-inquiry badge recognition
            const phoneCounts = {};
            quotes.forEach((q) => {
              const clean = (q.phoneNumber || '').replace(/[^0-9]/g, '').slice(-10);
              if (clean) {
                phoneCounts[clean] = (phoneCounts[clean] || 0) + 1;
              }
            });

            // Pagination Calculations
            const totalRecords = filteredQuotes.length;
            const totalPages = Math.ceil(totalRecords / quotePageSize) || 1;
            const validCurrentPage = Math.min(quoteCurrentPage, totalPages);
            const startIndex = (validCurrentPage - 1) * quotePageSize;
            const endIndex = Math.min(startIndex + quotePageSize, totalRecords);
            const paginatedQuotes = filteredQuotes.slice(startIndex, endIndex);

            // Helper to format JSON planDetails into human-readable chips (no wrapping, clean labels)
            const renderPlanDetails = (planDetailsStr) => {
              if (!planDetailsStr) return <span style={{ color: '#94a3b8' }}>-</span>;
              try {
                const data = typeof planDetailsStr === 'string' ? JSON.parse(planDetailsStr) : planDetailsStr;
                if (typeof data !== 'object' || data === null) {
                  return <span style={{ whiteSpace: 'nowrap' }}>{String(planDetailsStr)}</span>;
                }

                return (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', alignItems: 'center' }}>
                    {Object.entries(data).map(([key, val]) => {
                      if (!val) return null;
                      // Streamline key name nicely
                      let formattedKey = key
                        .replace(/([A-Z])/g, ' $1')
                        .replace(/^./, str => str.toUpperCase())
                        .replace(/Amount|Slug|Details/gi, '')
                        .trim();

                      return (
                        <span
                          key={key}
                          style={{
                            background: '#f8fafc',
                            color: '#334155',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                            padding: '0.2rem 0.5rem',
                            fontSize: '0.74rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          <strong style={{ color: '#0f2b48' }}>{formattedKey}:</strong>
                          <span style={{ fontWeight: 600 }}>{String(val)}</span>
                        </span>
                      );
                    })}
                  </div>
                );
              } catch (err) {
                return <span style={{ fontSize: '0.8rem', color: '#475569', whiteSpace: 'nowrap' }}>{planDetailsStr}</span>;
              }
            };

            // Category badge helper with icons & curated styles
            const getLeadCategoryBadge = (slug) => {
              const lower = (slug || '').toLowerCase();
              if (lower.includes('health')) {
                return { label: 'Health Insurance', icon: <HeartPulse size={12} />, bg: '#ecfdf5', color: '#065f46', border: '#a7f3d0' };
              }
              if (lower.includes('motor') || lower.includes('vehicle')) {
                return { label: 'Vehicle Insurance', icon: <Car size={12} />, bg: '#eff6ff', color: '#1e40af', border: '#bfdbfe' };
              }
              if (lower.includes('life') || lower.includes('term')) {
                return { label: 'Term Life Shield', icon: <ShieldCheck size={12} />, bg: '#f5f3ff', color: '#5b21b6', border: '#ddd6fe' };
              }
              if (lower.includes('loan') || lower.includes('mortgage')) {
                return { label: 'Loans & Financing', icon: <Building size={12} />, bg: '#fffbeb', color: '#92400e', border: '#fde68a' };
              }
              if (lower.includes('business') || lower.includes('sme')) {
                return { label: 'Business & SME', icon: <Briefcase size={12} />, bg: '#f0fdf4', color: '#166534', border: '#bbf7d0' };
              }
              if (lower.includes('travel')) {
                return { label: 'Travel Insurance', icon: <Plane size={12} />, bg: '#fdf4ff', color: '#86198f', border: '#f5d0fe' };
              }
              return { label: slug ? slug.replace('-', ' ') : 'General', icon: <FileText size={12} />, bg: '#f1f5f9', color: '#334155', border: '#e2e8f0' };
            };

            return (
              <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
                {/* Quote Leads Toolbar & Search */}
                <div style={{ padding: '1.25rem 1.5rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ position: 'relative', width: '280px' }}>
                      <input
                        type="text"
                        placeholder="Search by name, phone, city..."
                        className="form-input"
                        value={quoteSearch}
                        onChange={(e) => {
                          setQuoteSearch(e.target.value);
                          setQuoteCurrentPage(1);
                        }}
                        style={{ paddingLeft: '2.2rem', paddingRight: '0.75rem', height: '38px', fontSize: '0.85rem' }}
                      />
                      <Search size={15} color="#64748b" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                    </div>

                    <select
                      className="form-select"
                      value={quoteCategoryFilter}
                      onChange={(e) => {
                        setQuoteCategoryFilter(e.target.value);
                        setQuoteCurrentPage(1);
                      }}
                      style={{ height: '38px', fontSize: '0.85rem', width: '190px' }}
                    >
                      <option value="">All Categories</option>
                      <option value="health-insurance">🛡️ Health Insurance</option>
                      <option value="motor-insurance">🚗 Motor Insurance</option>
                      <option value="term-life-insurance">☂️ Term Life Shield</option>
                      <option value="business-insurance">💼 Business & SME</option>
                      <option value="travel-insurance">✈️ Travel Insurance</option>
                      <option value="loans-mortgages">🏦 Loans & Mortgages</option>
                    </select>
                  </div>

                  <span style={{ background: '#eff6ff', color: '#1d4ed8', fontSize: '0.82rem', fontWeight: 800, padding: '0.35rem 0.85rem', borderRadius: '999px', border: '1px solid #bfdbfe' }}>
                    {filteredQuotes.length} Inquiries Received
                  </span>
                </div>

                {/* DESKTOP TABLE VIEW (>= 768px) */}
                <div className="crm-desktop-table-container" style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', minWidth: '1060px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                    <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      <tr>
                        <th style={{ padding: '0.9rem 1.25rem', width: '120px' }}>Inquiry Date</th>
                        <th style={{ padding: '0.9rem 1rem', width: '180px' }}>Category</th>
                        <th style={{ padding: '0.9rem 1.25rem', minWidth: '200px' }}>Prospect & Account</th>
                        <th style={{ padding: '0.9rem 1.25rem', minWidth: '220px' }}>Contact & 1-Tap Reach</th>
                        <th style={{ padding: '0.9rem 1.25rem', minWidth: '180px' }}>Plan Specs</th>
                        <th style={{ padding: '0.9rem 1rem', width: '130px', textAlign: 'center' }}>Inquiry Status</th>
                        <th style={{ padding: '0.9rem 1.25rem', width: '160px', textAlign: 'center' }}>CRM Pipeline</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedQuotes.length === 0 ? (
                        <tr>
                          <td colSpan={7} style={{ padding: '3.5rem', textAlign: 'center', color: '#64748b' }}>
                            <div style={{ fontWeight: 700, fontSize: '1rem', color: '#0f2b48', marginBottom: '0.25rem' }}>No quote inquiries match your filter</div>
                            <div style={{ fontSize: '0.85rem' }}>Try changing the search keyword or category filter above.</div>
                          </td>
                        </tr>
                      ) : (
                        paginatedQuotes.map((q) => {
                          const cleanPhone = (q.phoneNumber || '').replace(/[^0-9]/g, '').slice(-10);
                          const matchingClient = leads.find(l => l.phoneNumber && l.phoneNumber.replace(/[^0-9]/g, '').endsWith(cleanPhone));
                          const totalProspectInquiries = phoneCounts[cleanPhone] || 1;
                          const catBadge = getLeadCategoryBadge(q.categorySlug);

                          return (
                            <tr key={q.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s ease' }} onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}>
                              {/* 1. Date & Time */}
                              <td style={{ padding: '0.85rem 1.25rem', whiteSpace: 'nowrap' }}>
                                <div style={{ fontWeight: 700, color: '#0f2b48', fontSize: '0.82rem' }}>
                                  {new Date(q.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </div>
                                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
                                  {new Date(q.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </td>

                              {/* 2. Category with Icon Badge & Multi-Inquiry Count */}
                              <td style={{ padding: '0.85rem 1rem', verticalAlign: 'middle' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'flex-start' }}>
                                  <div style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    background: catBadge.bg,
                                    color: catBadge.color,
                                    border: `1px solid ${catBadge.border}`,
                                    padding: '0.28rem 0.65rem',
                                    borderRadius: '6px',
                                    fontSize: '0.76rem',
                                    fontWeight: 800,
                                    whiteSpace: 'nowrap'
                                  }}>
                                    {catBadge.icon}
                                    <span>{catBadge.label}</span>
                                  </div>

                                  {totalProspectInquiries > 1 && (
                                    <span
                                      title={`Same prospect has submitted ${totalProspectInquiries} total inquiries across different verticals`}
                                      style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '3px',
                                        background: '#fef3c7',
                                        color: '#b45309',
                                        border: '1px solid #fde68a',
                                        padding: '0.12rem 0.45rem',
                                        borderRadius: '4px',
                                        fontSize: '0.68rem',
                                        fontWeight: 800,
                                        whiteSpace: 'nowrap'
                                      }}
                                    >
                                      🔥 {totalProspectInquiries} Inquiries
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* 3. Prospect Identity & Account (Name on Line 1, [Code Badge] on Line 2, Client Type on Line 3) */}
                              <td style={{ padding: '0.85rem 1.25rem', verticalAlign: 'middle' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                  <div 
                                    onClick={() => matchingClient && setSelectedClient360(matchingClient)}
                                    style={{ 
                                      fontWeight: 800, 
                                      color: '#0f2b48', 
                                      fontSize: '0.86rem',
                                      cursor: matchingClient ? 'pointer' : 'default',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px'
                                    }}
                                    title={matchingClient ? "View Client 360 Profile" : undefined}
                                  >
                                    <span>{q.fullName || 'Anonymous Prospect'}</span>
                                    {matchingClient && <ExternalLink size={11} color="var(--accent-gold)" />}
                                  </div>

                                  {matchingClient ? (
                                    <div>
                                      <span
                                        onClick={() => setSelectedClient360(matchingClient)}
                                        title="Client Identifier Code"
                                        style={{
                                          fontFamily: 'monospace',
                                          fontWeight: 700,
                                          color: '#059669',
                                          background: '#ecfdf5',
                                          border: '1px solid #a7f3d0',
                                          padding: '1px 5px',
                                          borderRadius: '4px',
                                          fontSize: '0.68rem',
                                          cursor: 'pointer',
                                          display: 'inline-block'
                                        }}
                                      >
                                        {matchingClient.clientCode}
                                      </span>
                                    </div>
                                  ) : (
                                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                                      New Web Prospect
                                    </div>
                                  )}
                                </div>
                              </td>

                              {/* 4. Consolidated Contact & 1-Tap Reach */}
                              <td style={{ padding: '0.85rem 1.25rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                                  <div>
                                    <div style={{ fontWeight: 700, color: '#0f2b48', fontSize: '0.84rem' }}>
                                      {q.phoneNumber || 'Not provided'}
                                    </div>
                                    <div style={{ fontSize: '0.73rem', color: '#64748b', marginTop: '1px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                      <MapPin size={11} color="#94a3b8" /> {q.city || 'India'}
                                    </div>
                                  </div>

                                  {/* 1-Tap Icon Strip */}
                                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                    {/* Call */}
                                    <a
                                      href={`tel:${q.phoneNumber}`}
                                      title={`Call ${q.fullName || q.phoneNumber}`}
                                      style={{
                                        background: '#ecfdf5',
                                        color: '#059669',
                                        border: '1px solid #a7f3d0',
                                        width: '26px',
                                        height: '26px',
                                        borderRadius: '6px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        textDecoration: 'none'
                                      }}
                                    >
                                      <Phone size={12} />
                                    </a>

                                    {/* WhatsApp */}
                                    {cleanPhone ? (
                                      <a
                                        href={`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(`Hello ${q.fullName || 'Sir/Madam'}, greeting from Aadhiraksha Insurance. Regarding your ${q.categorySlug ? q.categorySlug.replace('-', ' ') : 'insurance'} inquiry...`)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        title="Open WhatsApp Chat"
                                        style={{
                                          background: '#f0fdf4',
                                          color: '#16a34a',
                                          border: '1px solid #bbf7d0',
                                          width: '26px',
                                          height: '26px',
                                          borderRadius: '6px',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          textDecoration: 'none'
                                        }}
                                      >
                                        <WhatsAppIcon size={13} color="#16a34a" />
                                      </a>
                                    ) : null}

                                    {/* Email */}
                                    <a
                                      href={`mailto:${q.email || ''}?subject=Insurance%20Proposal%20-%20Aadhiraksha&body=Dear%20${encodeURIComponent(q.fullName || 'Client')},%0D%0A%0D%0AThank%20you%20for%20your%20inquiry%20regarding%20${encodeURIComponent(q.categorySlug || 'insurance')}.`}
                                      title={q.email ? `Email ${q.email}` : 'Compose Email'}
                                      style={{
                                        background: '#f0f9ff',
                                        color: '#0284c7',
                                        border: '1px solid #bae6fd',
                                        width: '26px',
                                        height: '26px',
                                        borderRadius: '6px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        textDecoration: 'none'
                                      }}
                                    >
                                      <Mail size={12} />
                                    </a>
                                  </div>
                                </div>
                              </td>

                              {/* 5. Plan Details & Specs */}
                              <td style={{ padding: '0.85rem 1.25rem' }}>
                                {renderPlanDetails(q.planDetails)}
                              </td>

                              {/* 6. Inquiry Status */}
                              <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                                <select
                                  value={q.status || 'NEW'}
                                  onChange={async (e) => {
                                    const nextStatus = e.target.value;
                                    try {
                                      await portalService.updateQuoteStatus(q.id, nextStatus);
                                      setQuotes(prev => prev.map(item => item.id === q.id ? { ...item, status: nextStatus } : item));
                                    } catch (err) {
                                      console.error('Error updating inquiry status', err);
                                      toast.error('Failed to update inquiry status');
                                    }
                                  }}
                                  style={{
                                    background: q.status === 'CONVERTED' ? '#dcfce7' : q.status === 'CONTACTED' ? '#fef3c7' : '#eff6ff',
                                    color: q.status === 'CONVERTED' ? '#15803d' : q.status === 'CONTACTED' ? '#b45309' : '#1d4ed8',
                                    border: `1px solid ${q.status === 'CONVERTED' ? '#bbf7d0' : q.status === 'CONTACTED' ? '#fde68a' : '#bfdbfe'}`,
                                    padding: '0.25rem 0.55rem',
                                    borderRadius: '6px',
                                    fontSize: '0.74rem',
                                    fontWeight: 800,
                                    cursor: 'pointer'
                                  }}
                                >
                                  <option value="NEW">🟢 NEW</option>
                                  <option value="CONTACTED">⚡ CONTACTED</option>
                                  <option value="CONVERTED">✅ CONVERTED</option>
                                  <option value="ARCHIVED">❌ ARCHIVED</option>
                                </select>
                              </td>

                              {/* 7. CRM Pipeline Action Button */}
                              <td style={{ padding: '0.85rem 1.25rem', textAlign: 'center' }}>
                                {q.status === 'CONVERTED' && matchingClient ? (
                                  <button
                                    onClick={() => setSelectedClient360(matchingClient)}
                                    style={{
                                      background: '#f8fafc',
                                      color: '#0284c7',
                                      border: '1px solid #cbd5e1',
                                      padding: '0.35rem 0.65rem',
                                      borderRadius: '6px',
                                      fontSize: '0.75rem',
                                      fontWeight: 800,
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px'
                                    }}
                                    title="View Master Client 360"
                                  >
                                    <ExternalLink size={12} color="#0284c7" />
                                    <span>In CRM ({matchingClient.clientCode})</span>
                                  </button>
                                ) : (
                                  <button
                                    onClick={async () => {
                                      try {
                                        const createdOrUpdated = await crmService.createLead({
                                          fullName: q.fullName || 'Web Prospect',
                                          phoneNumber: q.phoneNumber,
                                          email: q.email || '',
                                          city: q.city || '',
                                          categorySlug: q.categorySlug || 'general',
                                          insuranceType: q.categorySlug ? q.categorySlug.replace('-', ' ').toUpperCase() : 'GENERAL',
                                          notes: `Ingested Inquiry #${q.id}. Specs: ${q.planDetails || ''}`
                                        });
                                        await portalService.updateQuoteStatus(q.id, 'CONVERTED');
                                        setQuotes(prev => prev.map(item => item.id === q.id ? { ...item, status: 'CONVERTED' } : item));
                                        
                                        // Update or prepend client
                                        setLeads(prev => {
                                          const exists = prev.some(l => l.id === createdOrUpdated.id);
                                          return exists ? prev.map(l => l.id === createdOrUpdated.id ? createdOrUpdated : l) : [createdOrUpdated, ...prev];
                                        });

                                        if (matchingClient) {
                                          toast.success(
                                            `Inquiry linked as a new opportunity to "${matchingClient.fullName}" (${matchingClient.clientCode})!`,
                                            {
                                              label: 'View Client 360',
                                              onClick: () => setSelectedClient360(createdOrUpdated)
                                            }
                                          );
                                        } else {
                                          toast.success(
                                            `New master client created for "${q.fullName || q.phoneNumber}" (${createdOrUpdated.clientCode})!`,
                                            {
                                              label: 'View Client 360',
                                              onClick: () => setSelectedClient360(createdOrUpdated)
                                            }
                                          );
                                        }
                                      } catch (err) {
                                        console.error('Error converting lead', err);
                                        toast.error('Failed to convert inquiry: ' + (err.response?.data?.message || err.message));
                                      }
                                    }}
                                    style={{
                                      background: matchingClient ? '#0284c7' : 'var(--accent-emerald)',
                                      color: '#ffffff',
                                      border: 'none',
                                      padding: '0.35rem 0.65rem',
                                      borderRadius: '6px',
                                      fontSize: '0.75rem',
                                      fontWeight: 800,
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                    }}
                                  >
                                    {matchingClient ? <Link2 size={12} /> : <Plus size={12} />}
                                    <span>{matchingClient ? `Link to ${matchingClient.clientCode}` : '+ Push to CRM'}</span>
                                  </button>
                                )}
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
                  {paginatedQuotes.length === 0 ? (
                    <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: '#64748b', background: '#fff', borderRadius: '12px' }}>
                      <div style={{ fontWeight: 700, fontSize: '1rem', color: '#0f2b48', marginBottom: '0.25rem' }}>No quote inquiries match your filter</div>
                      <div style={{ fontSize: '0.82rem' }}>Try adjusting your search query.</div>
                    </div>
                  ) : (
                    paginatedQuotes.map((q) => {
                      const cleanPhone = (q.phoneNumber || '').replace(/[^0-9]/g, '').slice(-10);
                      const matchingClient = leads.find(l => l.phoneNumber && l.phoneNumber.replace(/[^0-9]/g, '').endsWith(cleanPhone));
                      const totalProspectInquiries = phoneCounts[cleanPhone] || 1;
                      const catBadge = getLeadCategoryBadge(q.categorySlug);

                      return (
                        <div
                          key={q.id}
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
                          {/* Card Header: Customer Identity + Category Suite */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                            <div>
                              <div 
                                onClick={() => matchingClient && setSelectedClient360(matchingClient)}
                                style={{ 
                                  fontWeight: 800, 
                                  fontSize: '1rem', 
                                  color: '#0f2b48',
                                  cursor: matchingClient ? 'pointer' : 'default',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                <span>{q.fullName || 'Anonymous Prospect'}</span>
                                {matchingClient && <ExternalLink size={12} color="var(--accent-gold)" />}
                              </div>

                              {matchingClient ? (
                                <div style={{ marginTop: '2px' }}>
                                  <span
                                    onClick={() => setSelectedClient360(matchingClient)}
                                    style={{
                                      fontFamily: 'monospace',
                                      fontWeight: 700,
                                      color: '#059669',
                                      background: '#ecfdf5',
                                      border: '1px solid #a7f3d0',
                                      padding: '1px 5px',
                                      borderRadius: '4px',
                                      fontSize: '0.68rem',
                                      cursor: 'pointer',
                                      display: 'inline-block'
                                    }}
                                  >
                                    {matchingClient.clientCode}
                                  </span>
                                </div>
                              ) : (
                                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '1px' }}>
                                  New Web Prospect
                                </div>
                              )}

                              <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
                                {new Date(q.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} • {q.city || 'India'}
                              </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
                              <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                background: catBadge.bg,
                                color: catBadge.color,
                                border: `1px solid ${catBadge.border}`,
                                padding: '0.2rem 0.55rem',
                                borderRadius: '6px',
                                fontSize: '0.74rem',
                                fontWeight: 800,
                                whiteSpace: 'nowrap'
                              }}>
                                {catBadge.icon}
                                <span>{catBadge.label}</span>
                              </div>

                              {totalProspectInquiries > 1 && (
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '2px',
                                    background: '#fef3c7',
                                    color: '#b45309',
                                    border: '1px solid #fde68a',
                                    padding: '0.1rem 0.4rem',
                                    borderRadius: '4px',
                                    fontSize: '0.68rem',
                                    fontWeight: 800,
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  🔥 {totalProspectInquiries} Inquiries
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Plan Details Container */}
                          <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                              Customer Specifications
                            </div>
                            {renderPlanDetails(q.planDetails)}
                          </div>

                          {/* Action Buttons Suite (Balanced 3-Button Touch Strip) */}
                          <div style={{ display: 'grid', gridTemplateColumns: cleanPhone ? '1fr 1fr 1fr' : '1fr 1fr', gap: '0.4rem', marginTop: '0.25rem' }}>
                            <a
                              href={`tel:${q.phoneNumber}`}
                              style={{
                                background: '#ecfdf5',
                                color: '#059669',
                                border: '1px solid #a7f3d0',
                                padding: '8px 10px',
                                borderRadius: '8px',
                                fontWeight: 700,
                                fontSize: '0.8rem',
                                textDecoration: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.35rem'
                              }}
                            >
                              <Phone size={13} /> Call
                            </a>

                            {cleanPhone ? (
                              <a
                                href={`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(`Hello ${q.fullName || 'Sir/Madam'}, greeting from Aadhiraksha Insurance. Regarding your ${q.categorySlug ? q.categorySlug.replace('-', ' ') : 'insurance'} inquiry...`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  background: '#f0fdf4',
                                  color: '#16a34a',
                                  border: '1px solid #bbf7d0',
                                  padding: '8px 10px',
                                  borderRadius: '8px',
                                  fontWeight: 700,
                                  fontSize: '0.8rem',
                                  textDecoration: 'none',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '0.35rem'
                                }}
                              >
                                <WhatsAppIcon size={14} color="#16a34a" /> WhatsApp
                              </a>
                            ) : null}

                            <a
                              href={`mailto:${q.email || ''}?subject=Insurance%20Proposal%20-%20Aadhiraksha&body=Dear%20${encodeURIComponent(q.fullName || 'Client')},%0D%0A%0D%0AThank%20you%20for%20your%20inquiry%20regarding%20${encodeURIComponent(q.categorySlug || 'insurance')}.`}
                              style={{
                                background: '#f0f9ff',
                                color: '#0284c7',
                                border: '1px solid #bae6fd',
                                padding: '8px 10px',
                                borderRadius: '8px',
                                fontWeight: 700,
                                fontSize: '0.8rem',
                                textDecoration: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.35rem'
                              }}
                            >
                              <Mail size={13} /> Email
                            </a>
                          </div>

                          {/* 1-Tap Convert / View CRM */}
                          <div style={{ marginTop: '0.1rem' }}>
                            {q.status === 'CONVERTED' && matchingClient ? (
                              <button
                                onClick={() => setSelectedClient360(matchingClient)}
                                style={{
                                  width: '100%',
                                  background: '#f8fafc',
                                  color: '#0284c7',
                                  border: '1px solid #cbd5e1',
                                  padding: '8px 12px',
                                  borderRadius: '8px',
                                  fontWeight: 800,
                                  fontSize: '0.8rem',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '0.35rem'
                                }}
                              >
                                <ExternalLink size={14} color="#0284c7" /> View Client 360 ({matchingClient.clientCode})
                              </button>
                            ) : (
                              <button
                                onClick={async () => {
                                  try {
                                    const createdOrUpdated = await crmService.createLead({
                                      fullName: q.fullName || 'Web Prospect',
                                      phoneNumber: q.phoneNumber,
                                      email: q.email || '',
                                      city: q.city || '',
                                      categorySlug: q.categorySlug || 'general',
                                      insuranceType: q.categorySlug ? q.categorySlug.replace('-', ' ').toUpperCase() : 'GENERAL',
                                      notes: `Ingested Inquiry #${q.id}. Specs: ${q.planDetails || ''}`
                                    });
                                    await portalService.updateQuoteStatus(q.id, 'CONVERTED');
                                    setQuotes(prev => prev.map(item => item.id === q.id ? { ...item, status: 'CONVERTED' } : item));
                                    
                                    // Update or prepend client
                                    setLeads(prev => {
                                      const exists = prev.some(l => l.id === createdOrUpdated.id);
                                      return exists ? prev.map(l => l.id === createdOrUpdated.id ? createdOrUpdated : l) : [createdOrUpdated, ...prev];
                                    });

                                    if (matchingClient) {
                                      toast.success(
                                        `Inquiry linked as a new opportunity to "${matchingClient.fullName}" (${matchingClient.clientCode})!`,
                                        {
                                          label: 'View Client 360',
                                          onClick: () => setSelectedClient360(createdOrUpdated)
                                        }
                                      );
                                    } else {
                                      toast.success(
                                        `New master client created for "${q.fullName || q.phoneNumber}" (${createdOrUpdated.clientCode})!`,
                                        {
                                          label: 'View Client 360',
                                          onClick: () => setSelectedClient360(createdOrUpdated)
                                        }
                                      );
                                    }
                                  } catch (err) {
                                    console.error('Error converting lead', err);
                                    toast.error('Failed to convert inquiry: ' + (err.response?.data?.message || err.message));
                                  }
                                }}
                                style={{
                                  width: '100%',
                                  background: matchingClient ? '#0284c7' : 'var(--accent-emerald)',
                                  color: '#ffffff',
                                  border: 'none',
                                  padding: '9px 12px',
                                  borderRadius: '8px',
                                  fontWeight: 800,
                                  fontSize: '0.82rem',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '0.35rem',
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.06)'
                                }}
                              >
                                {matchingClient ? <Link2 size={13} /> : <Plus size={13} />}
                                <span>{matchingClient ? `Link to ${matchingClient.clientCode}` : '+ Push to CRM'}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* RESPONSIVE ENTERPRISE PAGINATION TOOLBAR */}
                <div style={{
                  padding: '0.85rem 1.5rem',
                  background: '#f8fafc',
                  borderTop: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                  fontSize: '0.82rem',
                  color: '#64748b'
                }}>
                  {/* Left: Range Summary + Page Size Dropdown */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <span>
                      Showing <strong style={{ color: '#0f2b48' }}>{totalRecords === 0 ? 0 : startIndex + 1}</strong> - <strong style={{ color: '#0f2b48' }}>{endIndex}</strong> of <strong style={{ color: '#0f2b48' }}>{totalRecords}</strong> inquiries
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <label htmlFor="quotePageSizeSelect" style={{ fontSize: '0.76rem' }}>Per page:</label>
                      <select
                        id="quotePageSizeSelect"
                        value={quotePageSize}
                        onChange={(e) => {
                          setQuotePageSize(Number(e.target.value));
                          setQuoteCurrentPage(1);
                        }}
                        style={{
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          padding: '0.2rem 0.4rem',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          color: '#0f2b48',
                          cursor: 'pointer'
                        }}
                      >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                    </div>
                  </div>

                  {/* Right: Page Navigation Buttons */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <button
                      onClick={() => setQuoteCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={validCurrentPage <= 1}
                      style={{
                        padding: '0.35rem 0.65rem',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        background: validCurrentPage <= 1 ? '#f1f5f9' : '#ffffff',
                        color: validCurrentPage <= 1 ? '#94a3b8' : '#0f2b48',
                        cursor: validCurrentPage <= 1 ? 'not-allowed' : 'pointer',
                        fontWeight: 700,
                        fontSize: '0.78rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.2rem'
                      }}
                    >
                      <ChevronLeft size={14} /> Previous
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', margin: '0 0.25rem' }}>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                        <button
                          key={pageNum}
                          onClick={() => setQuoteCurrentPage(pageNum)}
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '6px',
                            border: `1px solid ${pageNum === validCurrentPage ? '#0f2b48' : '#e2e8f0'}`,
                            background: pageNum === validCurrentPage ? '#0f2b48' : '#ffffff',
                            color: pageNum === validCurrentPage ? '#ffffff' : '#475569',
                            fontWeight: 800,
                            fontSize: '0.78rem',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {pageNum}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setQuoteCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={validCurrentPage >= totalPages}
                      style={{
                        padding: '0.35rem 0.65rem',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        background: validCurrentPage >= totalPages ? '#f1f5f9' : '#ffffff',
                        color: validCurrentPage >= totalPages ? '#94a3b8' : '#0f2b48',
                        cursor: validCurrentPage >= totalPages ? 'not-allowed' : 'pointer',
                        fontWeight: 700,
                        fontSize: '0.78rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.2rem'
                      }}
                    >
                      Next <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* VIEW: POSP AGENTS */}
          {activeView === 'posp' && (
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#091726', margin: '0 0 0.2rem' }}>POSP Agent Applications</h3>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>Review agent KYC, certificates, and IRDAI compliance</p>
                </div>
                <span style={{ background: '#fef3c7', color: '#b45309', fontSize: '0.78rem', fontWeight: 700, padding: '0.25rem 0.65rem', borderRadius: '999px' }}>
                  {pospList.filter(p => p.status === 'PENDING').length} Pending Approval
                </span>
              </div>

              {/* DESKTOP TABLE VIEW (>= 768px) */}
              <div className="crm-desktop-table-container" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <tr>
                      <th style={{ padding: '1rem' }}>Applied Date</th>
                      <th style={{ padding: '1rem' }}>Agent Name</th>
                      <th style={{ padding: '1rem' }}>PAN / Aadhaar</th>
                      <th style={{ padding: '1rem' }}>Location</th>
                      <th style={{ padding: '1rem' }}>Experience</th>
                      <th style={{ padding: '1rem' }}>Status</th>
                      <th style={{ padding: '1rem' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pospList.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                          No POSP applications found.
                        </td>
                      </tr>
                    ) : (
                      pospList.map((posp) => (
                        <tr key={posp.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '1rem', color: '#64748b' }}>
                            {new Date(posp.appliedAt).toLocaleDateString()}
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <div style={{ fontWeight: 700, color: '#091726' }}>{posp.user?.fullName}</div>
                            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{posp.user?.email} • {posp.user?.phoneNumber}</div>
                          </td>
                          <td style={{ padding: '1rem', fontSize: '0.82rem' }}>
                            <div>PAN: <strong>{posp.panNumber}</strong></div>
                            <div>Aadhaar: <strong>{posp.aadhaarNumber || '-'}</strong></div>
                          </td>
                          <td style={{ padding: '1rem' }}>{posp.city}, {posp.state}</td>
                          <td style={{ padding: '1rem' }}>{posp.experienceYears} Years</td>
                          <td style={{ padding: '1rem' }}>
                            <span style={{
                              background: posp.status === 'APPROVED' ? '#dcfce7' : posp.status === 'PENDING' ? '#fef3c7' : '#fee2e2',
                              color: posp.status === 'APPROVED' ? '#15803d' : posp.status === 'PENDING' ? '#b45309' : '#b91c1c',
                              padding: '0.2rem 0.6rem',
                              borderRadius: '9999px',
                              fontSize: '0.75rem',
                              fontWeight: 700
                            }}>
                              {posp.status}
                            </span>
                          </td>
                          <td style={{ padding: '1rem' }}>
                            {posp.status === 'PENDING' ? (
                              <div style={{ display: 'flex', gap: '0.4rem' }}>
                                <button
                                  onClick={() => handleUpdatePOSP(posp.id, 'APPROVED')}
                                  style={{ background: '#10b981', color: '#fff', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleUpdatePOSP(posp.id, 'REJECTED')}
                                  style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                                >
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Processed</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* MOBILE CARD DECK VIEW (< 768px) */}
              <div className="crm-mobile-cards-container">
                {pospList.length === 0 ? (
                  <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: '#64748b', background: '#fff', borderRadius: '12px' }}>
                    No POSP applications found.
                  </div>
                ) : (
                  pospList.map((posp) => (
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
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0f2b48' }}>{posp.user?.fullName}</div>
                          <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '2px' }}>
                            {posp.city}, {posp.state} • {posp.experienceYears} Yrs Exp
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
                        <div>Aadhaar: <strong>{posp.aadhaarNumber || '-'}</strong></div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: posp.status === 'PENDING' ? '1fr 1fr auto' : '1fr', gap: '0.5rem' }}>
                        {posp.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleUpdatePOSP(posp.id, 'APPROVED')}
                              style={{ background: '#059669', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '8px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
                            >
                              Approve Partner
                            </button>
                            <button
                              onClick={() => handleUpdatePOSP(posp.id, 'REJECTED')}
                              style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '8px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
                            >
                              Reject
                            </button>
                          </>
                        )}
                        <a
                          href={`tel:${posp.user?.phoneNumber}`}
                          style={{
                            background: '#0f2b48',
                            color: '#ffffff',
                            border: 'none',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.35rem'
                          }}
                        >
                          <PhoneCall size={14} /> Call Agent
                        </a>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* VIEW: CLAIMS */}
          {activeView === 'claims' && (
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#091726', margin: '0 0 0.2rem' }}>Insurance Claims Intimation</h3>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>Emergency cashless & reimbursement claim tickets</p>
                </div>
                <span style={{ background: '#eff6ff', color: '#1e40af', fontSize: '0.78rem', fontWeight: 700, padding: '0.25rem 0.65rem', borderRadius: '999px' }}>
                  {claims.length} Claims Lodged
                </span>
              </div>

              {/* DESKTOP TABLE VIEW (>= 768px) */}
              <div className="crm-desktop-table-container" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <tr>
                      <th style={{ padding: '1rem' }}>Intimation Date</th>
                      <th style={{ padding: '1rem' }}>Policy No</th>
                      <th style={{ padding: '1rem' }}>Claim Type</th>
                      <th style={{ padding: '1rem' }}>Claimant</th>
                      <th style={{ padding: '1rem' }}>Hospital / Garage</th>
                      <th style={{ padding: '1rem' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {claims.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                          No claims submitted yet.
                        </td>
                      </tr>
                    ) : (
                      claims.map((claim) => (
                        <tr key={claim.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '1rem', color: '#64748b' }}>
                            {new Date(claim.createdAt).toLocaleDateString()}
                          </td>
                          <td style={{ padding: '1rem', fontWeight: 700, color: '#091726' }}>
                            {claim.policyNumber}
                          </td>
                          <td style={{ padding: '1rem' }}>{claim.claimType}</td>
                          <td style={{ padding: '1rem' }}>
                            <div style={{ fontWeight: 600 }}>{claim.claimantName}</div>
                            <a href={`tel:${claim.contactPhone}`} style={{ fontSize: '0.78rem', color: '#d97706' }}>
                              {claim.contactPhone}
                            </a>
                          </td>
                          <td style={{ padding: '1rem' }}>{claim.hospitalOrGarage || '-'}</td>
                          <td style={{ padding: '1rem' }}>
                            <span style={{ background: '#dbeafe', color: '#1e40af', padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700 }}>
                              {claim.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* MOBILE CARD DECK VIEW (< 768px) */}
              <div className="crm-mobile-cards-container">
                {claims.length === 0 ? (
                  <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: '#64748b', background: '#fff', borderRadius: '12px' }}>
                    No claims submitted yet.
                  </div>
                ) : (
                  claims.map((claim) => (
                    <div
                      key={claim.id}
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
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0f2b48' }}>{claim.claimantName}</div>
                          <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '2px' }}>
                            Policy: <strong>{claim.policyNumber}</strong>
                          </div>
                        </div>
                        <span style={{ background: '#dbeafe', color: '#1e40af', padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 800 }}>
                          {claim.status}
                        </span>
                      </div>

                      <div style={{ background: '#f8fafc', padding: '0.65rem 0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.78rem' }}>
                        <div>Type: <strong>{claim.claimType}</strong></div>
                        <div>Hospital / Garage: <strong>{claim.hospitalOrGarage || 'General Intimation'}</strong></div>
                      </div>

                      <a
                        href={`tel:${claim.contactPhone}`}
                        style={{
                          background: '#0f2b48',
                          color: '#ffffff',
                          border: 'none',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.35rem'
                        }}
                      >
                        <PhoneCall size={14} /> Call Claimant ({claim.contactPhone})
                      </a>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* VIEW: CASHLESS HOSPITALS */}
          {activeView === 'hospitals' && (
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              {/* Hospital Management Toolbar */}
              <div style={{ padding: '1.25rem 1.5rem', background: '#f0fdf4', borderBottom: '1px solid #bbf7d0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <div style={{ position: 'relative', width: '240px' }}>
                    <input
                      type="text"
                      placeholder="Search hospital name..."
                      className="form-input"
                      value={hospSearch}
                      onChange={(e) => setHospSearch(e.target.value)}
                      style={{ paddingLeft: '2.2rem', paddingRight: '0.75rem', height: '38px', fontSize: '0.85rem' }}
                    />
                    <Search size={15} color="#64748b" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                  </div>

                  <select
                    className="form-select"
                    value={hospCityFilter}
                    onChange={(e) => setHospCityFilter(e.target.value)}
                    style={{ height: '38px', fontSize: '0.85rem', width: '160px' }}
                  >
                    <option value="">All Cities</option>
                    {uniqueCities.map((city, idx) => (
                      <option key={idx} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <button
                    onClick={() => setShowAddHospitalModal(true)}
                    style={{
                      background: '#059669',
                      color: '#fff',
                      border: 'none',
                      padding: '0.55rem 1rem',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(5, 150, 105, 0.25)'
                    }}
                  >
                    <Plus size={16} /> Add Single Hospital
                  </button>

                  <button
                    onClick={() => setShowBulkUploadModal(true)}
                    style={{
                      background: '#0f2b48',
                      color: '#fff',
                      border: 'none',
                      padding: '0.55rem 1rem',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      cursor: 'pointer'
                    }}
                  >
                    <Upload size={16} /> Bulk Upload (CSV/JSON)
                  </button>
                </div>
              </div>

              {/* Hospitals Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <tr>
                      <th style={{ padding: '1rem' }}>Hospital Name & Status</th>
                      <th style={{ padding: '1rem' }}>State & City</th>
                      <th style={{ padding: '1rem' }}>Complete Address</th>
                      <th style={{ padding: '1rem' }}>Contact Number</th>
                      <th style={{ padding: '1rem' }}>Specialties</th>
                      <th style={{ padding: '1rem', textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHospitals.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                          <Building2 size={36} color="#94a3b8" style={{ margin: '0 auto 0.5rem' }} />
                          <div>No hospitals match your search criteria.</div>
                          <button
                            onClick={() => { setHospSearch(''); setHospCityFilter(''); }}
                            style={{ marginTop: '0.5rem', background: 'none', border: 'none', color: '#059669', fontWeight: 700, cursor: 'pointer' }}
                          >
                            Reset filters
                          </button>
                        </td>
                      </tr>
                    ) : (
                      filteredHospitals.map((hosp) => (
                        <tr key={hosp.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '1rem' }}>
                            <div style={{ fontWeight: 700, color: '#091726' }}>{hosp.hospitalName}</div>
                            {hosp.cashlessAvailable ? (
                              <span style={{
                                background: '#dcfce7',
                                color: '#15803d',
                                padding: '0.15rem 0.5rem',
                                borderRadius: '9999px',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.2rem',
                                marginTop: '0.2rem'
                              }}>
                                <CheckCircle2 size={11} /> Cashless Empanelled
                              </span>
                            ) : (
                              <span style={{
                                background: '#fee2e2',
                                color: '#b91c1c',
                                padding: '0.15rem 0.5rem',
                                borderRadius: '9999px',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                marginTop: '0.2rem'
                              }}>
                                Reimbursement Only
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <span style={{ fontWeight: 600 }}>{hosp.city}</span>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{hosp.state}</div>
                          </td>
                          <td style={{ padding: '1rem', fontSize: '0.82rem', color: '#475569', maxWidth: '240px' }}>
                            {hosp.address} {hosp.pincode && ` - ${hosp.pincode}`}
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <a href={`tel:${hosp.contactNumber}`} style={{ color: '#091726', fontWeight: 600, fontSize: '0.85rem' }}>
                              {hosp.contactNumber || '-'}
                            </a>
                          </td>
                          <td style={{ padding: '1rem', fontSize: '0.78rem', color: '#64748b', maxWidth: '200px' }}>
                            {hosp.specialties || '-'}
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'center' }}>
                            <button
                              onClick={() => handleToggleHospitalStatus(hosp.id, hosp.hospitalName, hosp.isActive !== false)}
                              title={hosp.isActive !== false ? "Soft-deactivate hospital" : "Restore hospital"}
                              style={{
                                background: hosp.isActive !== false ? '#fee2e2' : '#ecfdf5',
                                color: hosp.isActive !== false ? '#dc2626' : '#059669',
                                border: 'none',
                                padding: '0.4rem 0.65rem',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                fontSize: '0.75rem',
                                fontWeight: 700
                              }}
                            >
                              {hosp.isActive !== false ? 'Deactivate' : 'Restore'}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
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

      {/* MODAL 1: Add Single Hospital */}
      {showAddHospitalModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1050,
          padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '560px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '2rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building2 size={22} color="#059669" />
                <h2 style={{ fontSize: '1.25rem', color: '#091726' }}>Add Empanelled Hospital</h2>
              </div>
              <button 
                onClick={() => setShowAddHospitalModal(false)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateHospital}>
              <div className="form-group">
                <label className="form-label">Hospital Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apollo Speciality Hospital"
                  className="form-input"
                  value={newHospital.hospitalName}
                  onChange={(e) => setNewHospital({ ...newHospital, hospitalName: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">State *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Karnataka"
                    className="form-input"
                    value={newHospital.state}
                    onChange={(e) => setNewHospital({ ...newHospital, state: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">City / District *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bangalore"
                    className="form-input"
                    value={newHospital.city}
                    onChange={(e) => setNewHospital({ ...newHospital, city: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Complete Street Address *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. 154/11 Bannerghatta Road, Opp IIM"
                  className="form-input"
                  value={newHospital.address}
                  onChange={(e) => setNewHospital({ ...newHospital, address: e.target.value })}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Pincode</label>
                  <input
                    type="text"
                    placeholder="e.g. 560076"
                    className="form-input"
                    value={newHospital.pincode}
                    onChange={(e) => setNewHospital({ ...newHospital, pincode: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Contact / Emergency Phone</label>
                  <input
                    type="text"
                    placeholder="e.g. +91 80 2630 4050"
                    className="form-input"
                    value={newHospital.contactNumber}
                    onChange={(e) => setNewHospital({ ...newHospital, contactNumber: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Specialties / Departments</label>
                <input
                  type="text"
                  placeholder="e.g. Cardiology, Oncology, Orthopedics, 24/7 Trauma"
                  className="form-input"
                  value={newHospital.specialties}
                  onChange={(e) => setNewHospital({ ...newHospital, specialties: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', background: '#f0fdf4', padding: '0.75rem 1rem', borderRadius: '8px' }}>
                <input
                  type="checkbox"
                  id="cashlessCheck"
                  checked={newHospital.cashlessAvailable}
                  onChange={(e) => setNewHospital({ ...newHospital, cashlessAvailable: e.target.checked })}
                  style={{ width: '18px', height: '18px', accentColor: '#059669' }}
                />
                <label htmlFor="cashlessCheck" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#065f46', cursor: 'pointer' }}>
                  Enable Instant Cashless Claim Facility for this hospital
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setShowAddHospitalModal(false)}
                  style={{ padding: '0.6rem 1.25rem', background: '#f1f5f9', border: 'none', borderRadius: '8px', fontWeight: 600, color: '#64748b', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ padding: '0.6rem 1.25rem', background: '#059669', border: 'none', borderRadius: '8px', fontWeight: 700, color: '#fff', cursor: 'pointer' }}
                >
                  {isSubmitting ? 'Saving Hospital...' : 'Add to Directory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Bulk CSV / JSON Upload */}
      {showBulkUploadModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1050,
          padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '620px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '2rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Upload size={22} color="#0f2b48" />
                <h2 style={{ fontSize: '1.25rem', color: '#091726' }}>Bulk Upload Network Hospitals</h2>
              </div>
              <button 
                onClick={() => { setShowBulkUploadModal(false); setBulkParsedData([]); setBulkFile(null); setBulkError(''); }}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: '1.25rem', background: '#eff6ff', padding: '1rem', borderRadius: '10px', border: '1px solid #bfdbfe' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e40af' }}>Download Ready CSV Template</div>
                  <div style={{ fontSize: '0.78rem', color: '#3b82f6', marginTop: '0.2rem' }}>
                    Columns: hospitalName, state, city, address, pincode, contactNumber, specialties, cashlessAvailable
                  </div>
                </div>
                <button
                  type="button"
                  onClick={downloadSampleCSV}
                  style={{
                    background: '#2563eb',
                    color: '#fff',
                    border: 'none',
                    padding: '0.4rem 0.8rem',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    cursor: 'pointer'
                  }}
                >
                  <Download size={13} /> Sample CSV
                </button>
              </div>
            </div>

            {/* File Upload Box */}
            <div style={{
              border: '2px dashed #cbd5e1',
              borderRadius: '12px',
              padding: '2rem 1.5rem',
              textAlign: 'center',
              background: '#f8fafc',
              cursor: 'pointer',
              marginBottom: '1.5rem'
            }}>
              <Upload size={32} color="#64748b" style={{ margin: '0 auto 0.75rem' }} />
              <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#091726' }}>
                Select a CSV or JSON file from your computer
              </div>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.35rem 0 1rem' }}>
                Supports hundreds of empanelled hospital centers in one click.
              </p>
              <input
                type="file"
                accept=".csv, .json"
                onChange={handleBulkFileChange}
                style={{ fontSize: '0.85rem' }}
              />
            </div>

            {bulkError && (
              <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={16} />
                <span>{bulkError}</span>
              </div>
            )}

            {bulkParsedData.length > 0 && (
              <div style={{ marginBottom: '1.5rem', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '1rem', borderRadius: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#15803d', fontWeight: 700, fontSize: '0.9rem' }}>
                  <CheckCircle2 size={16} /> Validated {bulkParsedData.length} Hospitals Ready For Import
                </div>
                <div style={{ fontSize: '0.78rem', color: '#166534', marginTop: '0.25rem' }}>
                  First record preview: <strong>{bulkParsedData[0]?.hospitalName}</strong> ({bulkParsedData[0]?.city}, {bulkParsedData[0]?.state})
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => { setShowBulkUploadModal(false); setBulkParsedData([]); setBulkFile(null); setBulkError(''); }}
                style={{ padding: '0.6rem 1.25rem', background: '#f1f5f9', border: 'none', borderRadius: '8px', fontWeight: 600, color: '#64748b', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting || bulkParsedData.length === 0}
                onClick={handleSaveBulkHospitals}
                style={{
                  padding: '0.6rem 1.25rem',
                  background: bulkParsedData.length > 0 ? '#0f2b48' : '#cbd5e1',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 700,
                  color: '#fff',
                  cursor: bulkParsedData.length > 0 ? 'pointer' : 'not-allowed'
                }}
              >
                {isSubmitting ? 'Uploading Data...' : `Import ${bulkParsedData.length} Records`}
              </button>
            </div>
          </div>
        </div>
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
