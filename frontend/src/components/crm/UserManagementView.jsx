import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Key, 
  Edit3, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Filter, 
  Copy, 
  Check, 
  AlertCircle,
  X,
  UserCheck,
  Building2,
  Phone,
  Mail,
  ChevronRight,
  MoreVertical,
  Lock,
  Shield,
  UserX,
  Inbox,
  AtSign,
  Settings,
  Smartphone,
  ExternalLink,
  Eye,
  EyeOff,
  Trash2,
  Send,
  Sparkles,
  User as UserIcon,
  Briefcase
} from 'lucide-react';
import { crmService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import ActionDropdown from '../common/ActionDropdown';
import ConfirmationModal from '../common/ConfirmationModal';
import { CrmTablePaginationBar, CrmTopMiniPager } from './common/CrmTablePaginationBar';

export default function UserManagementView({ initialSegment = 'STAFF' }) {
  const { 
    user: authUser, 
    isSuperAdmin, 
    isManager, 
    canCreateUsers,
    canCreateAdmins, 
    canCreateManagers,
    canCreatePosp
  } = useAuth();
  
  const [users, setUsers] = useState([]);
  const [managers, setManagers] = useState([]);
  const [assignableRoles, setAssignableRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [domainMailboxOnly, setDomainMailboxOnly] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(null);
  const [activeUserSegment, setActiveUserSegment] = useState(initialSegment); // 'STAFF' | 'CUSTOMERS'

  useEffect(() => {
    if (initialSegment) {
      setActiveUserSegment(initialSegment);
    }
  }, [initialSegment]);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(() => {
    const saved = localStorage.getItem('user_management_page_size');
    return saved ? parseInt(saved, 10) : 10;
  });

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1);
    try {
      localStorage.setItem('user_management_page_size', String(newSize));
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, roleFilter, activeUserSegment, domainMailboxOnly]);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [tempPasswordSuccess, setTempPasswordSuccess] = useState(null);
  const [copied, setCopied] = useState(false);

  // Selected User for action
  const [selectedUser, setSelectedUser] = useState(null);

  // Custom dropdown states for Create Form
  const [isCustomCreateDept, setIsCustomCreateDept] = useState(false);
  const [customCreateDeptText, setCustomCreateDeptText] = useState('');
  const [isCustomCreateDesig, setIsCustomCreateDesig] = useState(false);
  const [customCreateDesigText, setCustomCreateDesigText] = useState('');

  // Custom dropdown states for Edit Form
  const [isCustomEditDept, setIsCustomEditDept] = useState(false);
  const [customEditDeptText, setCustomEditDeptText] = useState('');
  const [isCustomEditDesig, setIsCustomEditDesig] = useState(false);
  const [customEditDesigText, setCustomEditDesigText] = useState('');

  // Form states
  const [createUserForm, setCreateUserForm] = useState({
    employeeCode: '',
    fullName: '',
    email: '',
    phoneNumber: '',
    designation: 'Insurance Advisor',
    department: 'Retail Sales (Health, Life & Motor)',
    role: 'ROLE_ADVISOR',
    managerId: '',
    password: '',
    createDomainMailbox: true,
    customMailboxUsername: ''
  });
  const [isMailboxUsernameCustomized, setIsMailboxUsernameCustomized] = useState(false);
  const [createPasswordMode, setCreatePasswordMode] = useState('AUTO'); // 'AUTO' | 'CUSTOM'
  const [showCreatePassword, setShowCreatePassword] = useState(false);

  // Mailbox Management Modals
  const [showMailboxModal, setShowMailboxModal] = useState(false);
  const [mailboxModalUser, setMailboxModalUser] = useState(null);
  const [mailboxSettings, setMailboxSettings] = useState(null);
  const [mailboxActionLoading, setMailboxActionLoading] = useState(false);
  const [mailboxSuccessInfo, setMailboxSuccessInfo] = useState(null);
  const [provisionUsername, setProvisionUsername] = useState('');
  const [provisionPasswordMode, setProvisionPasswordMode] = useState('AUTO'); // 'AUTO' | 'CUSTOM'
  const [provisionCustomPassword, setProvisionCustomPassword] = useState('');
  const [showProvisionPassword, setShowProvisionPassword] = useState(false);
  const [newAliasHandle, setNewAliasHandle] = useState('');
  const [aliasActionLoading, setAliasActionLoading] = useState(false);
  const [showAliasesAccordion, setShowAliasesAccordion] = useState(false);

  // Custom Confirmation Modal state (replacing native window.confirm)
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: 'Confirm',
    cancelLabel: 'Cancel',
    variant: 'warning', // 'warning' | 'danger' | 'primary'
    isLoading: false,
    onConfirm: () => {}
  });

  const [editUserForm, setEditUserForm] = useState({
    fullName: '',
    phoneNumber: '',
    designation: '',
    department: '',
    managerId: '',
    isActive: true
  });

  const [customPassword, setCustomPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleUserStatus = async (user) => {
    // 1. Prevent self-deactivation guardrail
    if (authUser && (authUser.id === user.id || authUser.email === user.email)) {
      alert("⚠️ Security Protection: You cannot deactivate your own account.");
      return;
    }

    // 2. Prevent deactivating the last remaining Super Admin
    if (user.isActive && (user.roles?.includes('ROLE_SUPER_ADMIN') || user.roles?.includes('ROLE_ADMIN'))) {
      const activeSuperAdmins = users.filter(u => 
        u.isActive && 
        u.id !== user.id && 
        (u.roles?.includes('ROLE_SUPER_ADMIN') || u.roles?.includes('ROLE_ADMIN'))
      );
      if (activeSuperAdmins.length === 0) {
        alert("⛔ System Protection: Cannot deactivate the last remaining Super Administrator in the organization.");
        return;
      }
    }

    try {
      await crmService.updateUser(user.id, {
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        designation: user.designation,
        department: user.department,
        managerId: user.managerId,
        isActive: !user.isActive
      });
      loadData();
    } catch (err) {
      alert('Failed to update user status: ' + (err.response?.data?.message || err.message));
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersData, managersData, rolesData, deptsData, desigsData] = await Promise.all([
        crmService.getUsers(),
        crmService.getManagers(),
        crmService.getAssignableRoles().catch(() => []),
        crmService.getDepartments().catch(() => []),
        crmService.getDesignations().catch(() => [])
      ]);
      setUsers(usersData || []);
      setManagers(managersData || []);
      setAssignableRoles(rolesData || []);
      setDepartments(deptsData || []);
      setDesignations(desigsData || []);
      
      // Auto-set default role if current form role not in assignable list
      if (rolesData && rolesData.length > 0) {
        setCreateUserForm(prev => ({
          ...prev,
          role: rolesData.some(r => r.code === prev.role) ? prev.role : rolesData[0].code
        }));
      }

      // Auto-set default department & designation
      if (deptsData && deptsData.length > 0) {
        setCreateUserForm(prev => ({
          ...prev,
          department: prev.department || deptsData[0].name
        }));
      }
    } catch (err) {
      console.error('Failed to load CRM users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    try {
      const finalDepartment = isCustomCreateDept ? customCreateDeptText : createUserForm.department;
      const finalDesignation = isCustomCreateDesig ? customCreateDesigText : createUserForm.designation;
      const finalPassword = createPasswordMode === 'CUSTOM' && createUserForm.password?.trim() ? createUserForm.password.trim() : null;

      const payload = {
        ...createUserForm,
        password: finalPassword,
        department: finalDepartment,
        designation: finalDesignation,
        managerId: createUserForm.managerId ? Number(createUserForm.managerId) : null
      };
      const response = await crmService.createUser(payload);
      setShowCreateModal(false);
      setTempPasswordSuccess({
        email: response.user.email,
        fullName: response.user.fullName,
        temporaryPassword: response.temporaryPassword,
        domainMailbox: response.domainMailbox || null,
        domainMailboxError: response.domainMailboxError || null
      });
      loadData();
      setIsCustomCreateDept(false);
      setCustomCreateDeptText('');
      setIsCustomCreateDesig(false);
      setCustomCreateDesigText('');
      setIsMailboxUsernameCustomized(false);
      setCreateUserForm({
        employeeCode: '',
        fullName: '',
        email: '',
        phoneNumber: '',
        designation: 'Insurance Advisor',
        department: departments[0]?.name || 'Retail Sales (Health, Life & Motor)',
        role: 'ROLE_ADVISOR',
        managerId: '',
        password: '',
        createDomainMailbox: true,
        customMailboxUsername: ''
      });
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to create user. Email may already exist.');
    } finally {
      setSubmitting(false);
    }
  };

  const openMailboxModal = async (user) => {
    setMailboxModalUser(user);
    setShowMailboxModal(true);
    setMailboxActionLoading(true);
    setMailboxSuccessInfo(null);
    // Pre-fill smart default username from existing email handle if present, else fullName
    let defaultAlias = '';
    if (user.domainMailboxEmail && user.domainMailboxEmail.includes('@')) {
      defaultAlias = user.domainMailboxEmail.split('@')[0];
    } else {
      defaultAlias = (user.fullName || '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s.]/g, '')
        .replace(/\s+/g, '.');
    }
    setProvisionUsername(defaultAlias);
    setProvisionPasswordMode('AUTO');
    setProvisionCustomPassword('');
    setShowProvisionPassword(false);
    try {
      const settings = await crmService.getMailboxSettings(user.id);
      setMailboxSettings(settings);
    } catch (err) {
      console.warn('Failed to fetch mailbox settings:', err);
    } finally {
      setMailboxActionLoading(false);
    }
  };

  const handleProvisionMailboxNow = async () => {
    if (!mailboxModalUser) return;
    setMailboxActionLoading(true);
    try {
      const payload = {
        customAlias: provisionUsername.trim() || undefined,
        initialPassword: provisionPasswordMode === 'CUSTOM' && provisionCustomPassword.trim() ? provisionCustomPassword.trim() : undefined
      };
      const res = await crmService.provisionMailbox(mailboxModalUser.id, payload);
      setMailboxSuccessInfo(res);
      setMailboxModalUser(prev => ({
        ...prev,
        hasDomainMailbox: true,
        domainMailboxEmail: res.domainEmail || prev?.domainMailboxEmail,
        mailboxStatus: res.status || 'ACTIVE'
      }));
      loadData();
      // Refresh settings
      const settings = await crmService.getMailboxSettings(mailboxModalUser.id);
      setMailboxSettings(settings);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to provision mailbox on mail server.');
    } finally {
      setMailboxActionLoading(false);
    }
  };

  const handleResetMailboxPasswordNow = () => {
    if (!mailboxModalUser) return;
    setConfirmDialog({
      isOpen: true,
      title: 'Generate New Mailbox Password',
      message: `Are you sure you want to generate a new secure password for ${mailboxModalUser.domainMailboxEmail}? The employee will need the new password to access Webmail, IMAP, and SMTP.`,
      confirmLabel: 'Generate Password',
      cancelLabel: 'Cancel',
      variant: 'warning',
      isLoading: false,
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isLoading: true }));
        setMailboxActionLoading(true);
        try {
          const res = await crmService.resetMailboxPassword(mailboxModalUser.id);
          setMailboxSuccessInfo(res);
          setConfirmDialog(prev => ({ ...prev, isOpen: false, isLoading: false }));
        } catch (err) {
          setConfirmDialog(prev => ({ ...prev, isOpen: false, isLoading: false }));
          alert(err.response?.data?.message || 'Failed to reset mailbox password.');
        } finally {
          setMailboxActionLoading(false);
        }
      }
    });
  };

  const handleAddAliasNow = async (e) => {
    if (e) e.preventDefault();
    if (!mailboxModalUser || !newAliasHandle.trim()) return;
    setAliasActionLoading(true);
    try {
      const res = await crmService.addMailboxAlias(mailboxModalUser.id, newAliasHandle.trim());
      setNewAliasHandle('');
      // Refresh local settings and user list
      const settings = await crmService.getMailboxSettings(mailboxModalUser.id);
      setMailboxSettings(settings);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add alias.');
    } finally {
      setAliasActionLoading(false);
    }
  };

  const handleRemoveAliasNow = (aliasEmail) => {
    if (!mailboxModalUser) return;
    setConfirmDialog({
      isOpen: true,
      title: 'Remove Alternate Email Alias',
      message: `Remove alias "${aliasEmail}" from ${mailboxModalUser.fullName}'s mailbox? Inbound emails sent to this handle will no longer be delivered.`,
      confirmLabel: 'Remove Alias',
      cancelLabel: 'Keep Alias',
      variant: 'danger',
      isLoading: false,
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isLoading: true }));
        setAliasActionLoading(true);
        try {
          await crmService.removeMailboxAlias(mailboxModalUser.id, aliasEmail);
          const settings = await crmService.getMailboxSettings(mailboxModalUser.id);
          setMailboxSettings(settings);
          loadData();
          setConfirmDialog(prev => ({ ...prev, isOpen: false, isLoading: false }));
        } catch (err) {
          setConfirmDialog(prev => ({ ...prev, isOpen: false, isLoading: false }));
          alert(err.response?.data?.message || 'Failed to remove alias.');
        } finally {
          setAliasActionLoading(false);
        }
      }
    });
  };

  const handleSetPrimaryEmailNow = (newPrimary) => {
    if (!mailboxModalUser) return;
    setConfirmDialog({
      isOpen: true,
      title: 'Set as Primary Email Address',
      message: `Make "${newPrimary}" the primary corporate email for ${mailboxModalUser.fullName}? The previous primary address (${mailboxModalUser.domainMailboxEmail}) will be retained as an alias so no existing emails or communications are lost.`,
      confirmLabel: 'Promote to Primary',
      cancelLabel: 'Cancel',
      variant: 'primary',
      isLoading: false,
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isLoading: true }));
        setAliasActionLoading(true);
        try {
          await crmService.setPrimaryMailboxEmail(mailboxModalUser.id, newPrimary);
          setMailboxModalUser(prev => ({
            ...prev,
            domainMailboxEmail: newPrimary
          }));
          const settings = await crmService.getMailboxSettings(mailboxModalUser.id);
          setMailboxSettings(settings);
          loadData();
          setConfirmDialog(prev => ({ ...prev, isOpen: false, isLoading: false }));
        } catch (err) {
          setConfirmDialog(prev => ({ ...prev, isOpen: false, isLoading: false }));
          alert(err.response?.data?.message || 'Failed to set primary email.');
        } finally {
          setAliasActionLoading(false);
        }
      }
    });
  };

  const handleDeprovisionMailboxNow = (targetUser = null) => {
    const userToDeprovision = targetUser || mailboxModalUser;
    if (!userToDeprovision) return;

    setConfirmDialog({
      isOpen: true,
      title: 'Deprovision Corporate Mailbox',
      message: `Permanently delete corporate mailbox "${userToDeprovision.domainMailboxEmail}" for ${userToDeprovision.fullName}?`,
      confirmLabel: 'Yes, Delete Mailbox',
      cancelLabel: 'Keep Mailbox',
      variant: 'danger',
      isLoading: false,
      entitySummary: {
        title: userToDeprovision.fullName,
        subtitle: userToDeprovision.domainMailboxEmail,
        badge: 'Stalwart Purge',
        details: 'The account will be deleted from Stalwart Mail Server and its handle freed up. All stored emails in this mailbox will be permanently removed.'
      },
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isLoading: true }));
        try {
          await crmService.deprovisionMailbox(userToDeprovision.id);
          setShowMailboxModal(false);
          setMailboxModalUser(null);
          loadData();
          setConfirmDialog(prev => ({ ...prev, isOpen: false, isLoading: false }));
        } catch (err) {
          setConfirmDialog(prev => ({ ...prev, isOpen: false, isLoading: false }));
          alert(err.response?.data?.message || 'Failed to deprovision mailbox.');
        }
      }
    });
  };

  const handleDeleteUserNow = (userToDelete) => {
    if (!userToDelete) return;

    if (authUser && (authUser.id === userToDelete.id || authUser.email === userToDelete.email)) {
      alert("⚠️ Security Protection: You cannot delete your own account.");
      return;
    }

    if (userToDelete.assignedClientsCount && userToDelete.assignedClientsCount > 0) {
      alert(`⚠️ Cannot Delete User: ${userToDelete.fullName} has ${userToDelete.assignedClientsCount} assigned client(s). Please reassign their clients to another advisor before deleting, or deactivate the account instead.`);
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: 'Permanently Delete User Account',
      message: `Are you sure you want to permanently delete ${userToDelete.fullName} (${userToDelete.email || userToDelete.phoneNumber})? This action is irreversible.`,
      confirmLabel: 'Permanently Delete User',
      cancelLabel: 'Cancel',
      variant: 'danger',
      isLoading: false,
      entitySummary: {
        title: userToDelete.fullName,
        subtitle: userToDelete.email || userToDelete.phoneNumber,
        badge: userToDelete.designation || 'Staff',
        details: userToDelete.hasDomainMailbox 
          ? `Their associated corporate mailbox (${userToDelete.domainMailboxEmail}) will also be automatically deprovisioned from Stalwart Mail Server.`
          : 'All user login access and employee profile links will be purged immediately.'
      },
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isLoading: true }));
        try {
          await crmService.deleteUser(userToDelete.id);
          loadData();
          setConfirmDialog(prev => ({ ...prev, isOpen: false, isLoading: false }));
        } catch (err) {
          setConfirmDialog(prev => ({ ...prev, isOpen: false, isLoading: false }));
          alert(err.response?.data?.message || 'Failed to delete user.');
        }
      }
    });
  };

  const handleResendWelcomeNow = (targetUser) => {
    if (!targetUser) return;
    if (!targetUser.email || !targetUser.email.includes('@')) {
      alert("⚠️ Cannot Send Email: User does not have a valid personal/contact email configured.");
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: 'Resend Welcome & Portal Credentials',
      message: `A fresh temporary password will be generated and dispatched directly to ${targetUser.fullName}'s contact email (${targetUser.email}).`,
      confirmLabel: 'Dispatch Welcome Email',
      cancelLabel: 'Cancel',
      variant: 'primary',
      isLoading: false,
      entitySummary: {
        title: targetUser.fullName,
        subtitle: targetUser.email,
        badge: targetUser.designation || 'Staff',
        details: targetUser.hasDomainMailbox 
          ? `Will include CRM login credentials + Corporate Webmail access details (${targetUser.domainMailboxEmail}) and mobile client setup.`
          : 'Will include CRM portal login URL and fresh temporary credentials.'
      },
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isLoading: true }));
        try {
          const res = await crmService.resendWelcomeEmail(targetUser.id);
          setConfirmDialog(prev => ({ ...prev, isOpen: false, isLoading: false }));
          setTempPasswordSuccess({
            email: res.email,
            fullName: targetUser.fullName,
            temporaryPassword: res.temporaryPassword,
            domainMailbox: targetUser.hasDomainMailbox ? {
              domainEmail: targetUser.domainMailboxEmail,
              status: 'Active',
              webmailUrl: 'https://mail.aadhirakshainsurance.com'
            } : null
          });
        } catch (err) {
          setConfirmDialog(prev => ({ ...prev, isOpen: false, isLoading: false }));
          alert(err.response?.data?.message || 'Failed to resend welcome email.');
        }
      }
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    // 1. Prevent self-deactivation guardrail via Edit modal
    if (!editUserForm.isActive && authUser && (authUser.id === selectedUser.id || authUser.email === selectedUser.email)) {
      alert("⚠️ Security Protection: You cannot deactivate your own account.");
      return;
    }

    // 2. Prevent deactivating the last remaining Super Admin via Edit modal
    if (!editUserForm.isActive && selectedUser.isActive && (selectedUser.roles?.includes('ROLE_SUPER_ADMIN') || selectedUser.roles?.includes('ROLE_ADMIN'))) {
      const activeSuperAdmins = users.filter(u => 
        u.isActive && 
        u.id !== selectedUser.id && 
        (u.roles?.includes('ROLE_SUPER_ADMIN') || u.roles?.includes('ROLE_ADMIN'))
      );
      if (activeSuperAdmins.length === 0) {
        alert("⛔ System Protection: Cannot deactivate the last remaining Super Administrator in the organization.");
        return;
      }
    }

    setSubmitting(true);
    try {
      const finalDepartment = isCustomEditDept ? customEditDeptText : editUserForm.department;
      const finalDesignation = isCustomEditDesig ? customEditDesigText : editUserForm.designation;

      const payload = {
        ...editUserForm,
        department: finalDepartment,
        designation: finalDesignation,
        managerId: editUserForm.managerId ? Number(editUserForm.managerId) : null
      };
      await crmService.updateUser(selectedUser.id, payload);
      setShowEditModal(false);
      loadData();
    } catch (err) {
      alert('Failed to update user profile: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    setSubmitting(true);
    try {
      const response = await crmService.resetPassword(selectedUser.id, customPassword);
      setShowResetModal(false);
      setCustomPassword('');
      setTempPasswordSuccess({
        email: response.email,
        fullName: selectedUser.fullName,
        temporaryPassword: response.temporaryPassword
      });
    } catch (err) {
      alert('Failed to reset password: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyCredentials = () => {
    if (!tempPasswordSuccess) return;
    let text = `Aadhiraksha CRM Credentials:
Username / Email: ${tempPasswordSuccess.email}
CRM Temporary Password: ${tempPasswordSuccess.temporaryPassword}
CRM Login Portal: https://aadhirakshainsurance.com/login`;

    if (tempPasswordSuccess.domainMailbox) {
      text += `\n\nCorporate Work Mailbox:
Email: ${tempPasswordSuccess.domainMailbox.domainEmail}
Mailbox Password: ${tempPasswordSuccess.domainMailbox.mailboxPassword || tempPasswordSuccess.temporaryPassword}
Webmail Access: ${tempPasswordSuccess.domainMailbox.webmailUrl || 'https://mail.aadhirakshainsurance.com'}
Incoming (IMAP): mail.aadhirakshainsurance.com:993 (SSL)
Outgoing (SMTP): mail.aadhirakshainsurance.com:465 (TLS)`;
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    
    // Check standard match for department
    const standardDeptNames = departments.map(d => d.name);
    const hasStandardDept = standardDeptNames.includes(user.department);

    // Check standard match for designation
    const standardDesigNames = designations.map(d => d.name);
    const hasStandardDesig = standardDesigNames.includes(user.designation);

    setIsCustomEditDept(!hasStandardDept && !!user.department);
    setCustomEditDeptText(!hasStandardDept ? (user.department || '') : '');

    setIsCustomEditDesig(!hasStandardDesig && !!user.designation);
    setCustomEditDesigText(!hasStandardDesig ? (user.designation || '') : '');

    setEditUserForm({
      fullName: user.fullName,
      phoneNumber: user.phoneNumber || '',
      designation: hasStandardDesig ? user.designation : (user.designation ? '__CUSTOM__' : (standardDesigNames[0] || 'Insurance Advisor')),
      department: hasStandardDept ? user.department : (user.department ? '__CUSTOM__' : (standardDeptNames[0] || 'Retail Sales (Health, Life & Motor)')),
      managerId: user.managerId ? String(user.managerId) : '',
      isActive: user.isActive
    });
    setShowEditModal(true);
  };

  const openResetModal = (user) => {
    setSelectedUser(user);
    setCustomPassword('');
    setShowResetModal(true);
  };

  const filteredUsers = users.filter((u) => {
    // Segment partitioning:
    const isCustomer = u.isCustomerUser || u.roles?.includes('ROLE_USER') || u.roles?.includes('ROLE_CUSTOMER');
    if (activeUserSegment === 'CUSTOMERS') {
      if (!isCustomer) return false;
    } else {
      // In 'STAFF' segment, show only organization employees & partners
      if (isCustomer) return false;
    }

    // Defense-in-depth: If logged-in user is a Manager, strictly enforce subordinate-only display
    if (isManager && !isSuperAdmin) {
      if (u.managerId !== authUser?.id) {
        return false;
      }
    }

    const matchesSearch = 
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.phoneNumber && u.phoneNumber.includes(searchQuery)) ||
      (u.clientCode && u.clientCode.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.employeeCode && u.employeeCode.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.designation && u.designation.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole = 
      roleFilter === 'ALL' ||
      u.roles.includes(roleFilter);

    const matchesDomainMailbox = !domainMailboxOnly || Boolean(u.hasDomainMailbox && u.domainMailboxEmail);

    return matchesSearch && matchesRole && matchesDomainMailbox;
  });

  const staffMembers = users.filter(u => !(u.isCustomerUser || u.roles?.includes('ROLE_USER') || u.roles?.includes('ROLE_CUSTOMER')));
  const staffCount = staffMembers.length;
  const staffDomainMailboxCount = staffMembers.filter(u => Boolean(u.hasDomainMailbox && u.domainMailboxEmail)).length;
  const customerCount = users.filter(u => (u.isCustomerUser || u.roles?.includes('ROLE_USER') || u.roles?.includes('ROLE_CUSTOMER'))).length;

  const totalPages = Math.ceil(filteredUsers.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + pageSize);

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      flex: 1,
      minHeight: 0,
      width: '100%',
      gap: '0.75rem'
    }}>
      
      {/* Top Header & Segmented Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', flexShrink: 0 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--crm-text-primary)', margin: 0 }}>
              {activeUserSegment === 'CUSTOMERS' ? 'Customers' : 'Team'}
            </h2>
            
            {/* Industry-Standard Segment Switcher */}
            <div style={{
              display: 'inline-flex',
              background: '#f1f5f9',
              padding: '3px',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              gap: '2px'
            }}>
              <button
                type="button"
                onClick={() => {
                  setActiveUserSegment('STAFF');
                  setRoleFilter('ALL');
                }}
                style={{
                  background: activeUserSegment === 'STAFF' ? '#ffffff' : 'transparent',
                  color: activeUserSegment === 'STAFF' ? 'var(--primary-navy)' : '#64748b',
                  boxShadow: activeUserSegment === 'STAFF' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  border: 'none',
                  padding: '5px 12px',
                  borderRadius: '7px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease'
                }}
              >
                <Users size={13} color={activeUserSegment === 'STAFF' ? 'var(--primary-navy)' : '#64748b'} />
                <span>Team ({staffCount})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveUserSegment('CUSTOMERS');
                  setRoleFilter('ALL');
                }}
                style={{
                  background: activeUserSegment === 'CUSTOMERS' ? '#ffffff' : 'transparent',
                  color: activeUserSegment === 'CUSTOMERS' ? '#059669' : '#64748b',
                  boxShadow: activeUserSegment === 'CUSTOMERS' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  border: 'none',
                  padding: '5px 12px',
                  borderRadius: '7px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease'
                }}
              >
                <Smartphone size={13} color={activeUserSegment === 'CUSTOMERS' ? '#059669' : '#64748b'} />
                <span>Customers ({customerCount})</span>
              </button>
            </div>
          </div>

          <p style={{ color: 'var(--crm-text-muted)', fontSize: '0.8rem', margin: '4px 0 0 0' }}>
            {activeUserSegment === 'CUSTOMERS'
              ? 'Real-time directory of verified retail customers, self-service mobile app logins, and linked CRM client profiles.'
              : (isSuperAdmin 
                ? 'Manage organizational staff, advisors, branch hierarchy, and global user provisioning.'
                : 'Advisors and employees allocated under your manager branch.')}
          </p>
        </div>

        {canCreateUsers && (
          <button
            onClick={async () => {
              try {
                const freshRoles = await crmService.getAssignableRoles();
                if (freshRoles && freshRoles.length > 0) {
                  setAssignableRoles(freshRoles);
                  // Auto-select first available role for non-superadmins
                  if (!isSuperAdmin) {
                    setCreateUserForm(prev => ({
                      ...prev,
                      role: freshRoles[0]?.code || 'ROLE_POSP_AGENT',
                      designation: freshRoles[0]?.code === 'ROLE_POSP_AGENT' ? 'POSP Agent Partner' : 'Insurance Advisor',
                      department: freshRoles[0]?.code === 'ROLE_POSP_AGENT' ? 'POSP Partner Distribution' : (departments[0]?.name || 'Retail Sales (Health, Life & Motor)')
                    }));
                  }
                }
              } catch (err) {
                console.warn('Using existing assignable roles catalog', err);
              }
              setIsMailboxUsernameCustomized(false);
              setShowCreateModal(true);
            }}
            className="crm-emerald-btn"
            style={{
              padding: '9px 18px',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.88rem'
            }}
          >
            <UserPlus size={17} /> {isSuperAdmin ? 'Add New Employee / Manager' : isManager ? 'Onboard Team Advisor / Agent' : 'Onboard POSP Agent'}
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div style={{
        background: 'var(--crm-surface-card)',
        padding: '1rem 1.25rem',
        borderRadius: '14px',
        border: '1px solid var(--crm-border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        boxShadow: 'var(--shadow-xs)'
      }}>
        <form 
          role="search"
          onSubmit={(e) => e.preventDefault()}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '260px', margin: 0 }}
        >
          <Search size={18} color="#94a3b8" />
          <input
            type="search"
            name="user-management-search-filter"
            id="user-management-search-filter"
            autoComplete="search"
            data-lpignore="true"
            data-form-type="other"
            placeholder={activeUserSegment === 'CUSTOMERS' ? "Search customers by Name, Mobile (+91...), Email, or Client Code..." : "Search by Employee Code, Name, Email, or Designation..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              border: 'none',
              outline: 'none',
              fontSize: '0.9rem',
              color: '#0f2b48'
            }}
          />
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {activeUserSegment === 'STAFF' && (
            <>
              {/* Corporate Mailbox Quick Filter */}
              <button
                type="button"
                onClick={() => setDomainMailboxOnly(prev => !prev)}
                title={domainMailboxOnly ? "Showing only employees with corporate mailboxes. Click to show all." : "Filter to employees with provisioned corporate mailboxes"}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: domainMailboxOnly ? '1px solid #059669' : '1px solid var(--crm-border-subtle)',
                  background: domainMailboxOnly ? '#ecfdf5' : 'var(--crm-surface-card)',
                  color: domainMailboxOnly ? '#047857' : 'var(--crm-text-secondary)',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <AtSign size={14} color={domainMailboxOnly ? '#059669' : '#64748b'} />
                <span>Domain Mailbox ({staffDomainMailboxCount})</span>
                {domainMailboxOnly && (
                  <span style={{
                    fontSize: '0.68rem',
                    background: '#059669',
                    color: '#ffffff',
                    padding: '1px 6px',
                    borderRadius: '9999px',
                    marginLeft: '2px'
                  }}>
                    Active Filter
                  </span>
                )}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Filter size={16} color="#64748b" />
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Role:</span>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--crm-border-subtle)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    background: 'var(--crm-surface-card)',
                    color: 'var(--crm-text-primary)'
                  }}
                >
                  <option value="ALL">All Roles ({filteredUsers.length})</option>
                  {isSuperAdmin && <option value="ROLE_SUPER_ADMIN">Super Admins</option>}
                  {isSuperAdmin && <option value="ROLE_MANAGER">Insurance Managers</option>}
                  <option value="ROLE_ADVISOR">Insurance Advisors</option>
                  <option value="ROLE_POSP_AGENT">POSP Agents</option>
                </select>
              </div>
            </>
          )}

          <CrmTopMiniPager
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredUsers.length}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* Users Table */}
      <div style={{
        background: 'var(--crm-surface-card)',
        borderRadius: '16px',
        border: '1px solid var(--crm-border-subtle)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0
      }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--crm-text-muted)' }}>
            Loading team & user hierarchy directory...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div style={{ padding: '3.5rem 1.5rem', textAlign: 'center' }}>
            <Users size={36} color="var(--crm-text-muted)" style={{ margin: '0 auto 10px', opacity: 0.6 }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--crm-text-primary)', margin: 0 }}>
              {isSuperAdmin ? 'No users match the search and filter criteria.' : 'No Team Members Assigned Yet'}
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--crm-text-muted)', margin: '6px 0 0 0' }}>
              {isSuperAdmin 
                ? 'Try adjusting your search query or role filter.'
                : 'You currently do not have any advisors or employees allocated under your manager branch. Please contact a Super Administrator to assign advisors to your team.'}
            </p>
          </div>
        ) : (
          <div className="crm-table-scroll-container" style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
            <table className="crm-table">
              <thead className="crm-table-head" style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                {activeUserSegment === 'CUSTOMERS' ? (
                  <tr>
                    <th className="crm-table-th">Customer / Mobile User</th>
                    <th className="crm-table-th">Login Method & Security</th>
                    <th className="crm-table-th">Linked CRM Client</th>
                    <th className="crm-table-th">Active Policies</th>
                    <th className="crm-table-th">Last Activity / Registered</th>
                    <th className="crm-table-th" style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                ) : (
                  <tr>
                    <th className="crm-table-th">Employee</th>
                    <th className="crm-table-th">Corporate Mailbox</th>
                    <th className="crm-table-th">Role</th>
                    <th className="crm-table-th">Reporting Manager</th>
                    <th className="crm-table-th">Assigned Clients</th>
                    <th className="crm-table-th">Status</th>
                    <th className="crm-table-th" style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                )}
              </thead>
              <tbody>
                {paginatedUsers.map((u) => {
                  if (activeUserSegment === 'CUSTOMERS') {
                    return (
                      <tr key={u.id} className="crm-table-row">
                        {/* 1. Customer / Mobile User */}
                        <td className="crm-table-td">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              background: '#ecfdf5',
                              border: '1px solid #a7f3d0',
                              color: '#059669',
                              fontWeight: 800,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.85rem',
                              flexShrink: 0
                            }}>
                              {u.fullName ? u.fullName[0].toUpperCase() : 'C'}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, color: 'var(--crm-text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span>{u.fullName}</span>
                                <span style={{
                                  fontSize: '0.68rem',
                                  fontWeight: 800,
                                  background: '#f0fdf4',
                                  color: '#16a34a',
                                  border: '1px solid #bbf7d0',
                                  padding: '1px 5px',
                                  borderRadius: '4px'
                                }}>
                                  Verified Mobile
                                </span>
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--crm-text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                                <span style={{ fontWeight: 600, color: '#0f2b48' }}>+91 {u.phoneNumber || 'N/A'}</span>
                                {u.email && !u.email.includes('@aadhiraksha.internal') && (
                                  <>
                                    <span>•</span>
                                    <span>{u.email}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 2. Login Method & Security */}
                        <td className="crm-table-td">
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              background: '#eff6ff',
                              color: '#1d4ed8',
                              border: '1px solid #bfdbfe',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              width: 'fit-content'
                            }}>
                              <Smartphone size={11} /> Twilio SMS OTP
                            </span>
                            <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
                              Passwordless Secure Session
                            </span>
                          </div>
                        </td>

                        {/* 3. Linked CRM Client */}
                        <td className="crm-table-td">
                          {u.clientCode ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <span style={{
                                background: '#f8fafc',
                                border: '1px solid #cbd5e1',
                                padding: '3px 7px',
                                borderRadius: '5px',
                                fontWeight: 800,
                                fontSize: '0.74rem',
                                color: '#0f2b48'
                              }}>
                                {u.clientCode}
                              </span>
                              <span style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 700 }}>
                                (Synced)
                              </span>
                            </div>
                          ) : (
                            <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontStyle: 'italic' }}>
                              Prospect / In-Progress
                            </span>
                          )}
                        </td>

                        {/* 4. Active Policies */}
                        <td className="crm-table-td">
                          <span style={{
                            background: u.linkedPoliciesCount > 0 ? '#f0fdf4' : '#f8fafc',
                            border: `1px solid ${u.linkedPoliciesCount > 0 ? '#bbf7d0' : '#e2e8f0'}`,
                            color: u.linkedPoliciesCount > 0 ? '#15803d' : '#64748b',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontWeight: 700,
                            fontSize: '0.76rem'
                          }}>
                            {u.linkedPoliciesCount || 0} {u.linkedPoliciesCount === 1 ? 'Policy' : 'Policies'}
                          </span>
                        </td>

                        {/* 5. Last Activity / Registered */}
                        <td className="crm-table-td" style={{ fontSize: '0.76rem', color: '#64748b' }}>
                          <div style={{ fontWeight: 600, color: '#334155' }}>
                            {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                          </div>
                          <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                            Joined {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'N/A'}
                          </div>
                        </td>

                        {/* 6. Actions */}
                        <td className="crm-table-td" style={{ textAlign: 'right', position: 'relative' }}>
                          <ActionDropdown
                            menuWidth="210px"
                            trigger={({ isOpen }) => (
                              <button
                                type="button"
                                title="Customer Actions"
                                className="crm-modal-close-btn"
                                style={{ padding: '6px', background: isOpen ? '#f1f5f9' : 'transparent' }}
                              >
                                <MoreVertical size={16} />
                              </button>
                            )}
                          >
                            {({ close }) => (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    close();
                                    const cleanPhone = (u.phoneNumber || '').replace(/[^0-9+]/g, '');
                                    if (cleanPhone) window.location.href = `tel:${cleanPhone}`;
                                  }}
                                  className="crm-popover-btn"
                                >
                                  <Phone size={14} color="#059669" /> Call Customer
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    close();
                                    const cleanPhone = (u.phoneNumber || '').replace(/[^0-9]/g, '');
                                    if (cleanPhone) {
                                      window.open(`https://wa.me/91${cleanPhone.slice(-10)}?text=${encodeURIComponent(`Dear ${u.fullName}, greetings from Aadhiraksha Insurance Advisory.`)}`, '_blank');
                                    }
                                  }}
                                  className="crm-popover-btn"
                                >
                                  <ExternalLink size={14} color="#16a34a" /> WhatsApp Message
                                </button>

                                <div style={{ height: '1px', background: 'var(--crm-border-subtle)', margin: '4px 0' }} />

                                <button
                                  type="button"
                                  onClick={() => {
                                    close();
                                    handleToggleUserStatus(u);
                                  }}
                                  className="crm-popover-btn danger"
                                >
                                  {u.isActive ? (
                                    <>
                                      <UserX size={14} /> Suspend Portal Access
                                    </>
                                  ) : (
                                    <>
                                      <UserCheck size={14} color="var(--crm-success)" /> Restore Portal Access
                                    </>
                                  )}
                                </button>
                              </>
                            )}
                          </ActionDropdown>
                        </td>
                      </tr>
                    );
                  }

                  const isSuper = u.roles.includes('ROLE_SUPER_ADMIN') || u.roles.includes('ROLE_ADMIN');
                  const isMgr = u.roles.includes('ROLE_MANAGER');
                  const isAdv = u.roles.includes('ROLE_ADVISOR');

                  const roleBadgeStyle = isSuper
                    ? { bg: '#fee2e2', color: '#b91c1c', label: 'Super Admin' }
                    : isMgr
                    ? { bg: '#e0f2fe', color: '#0369a1', label: 'Insurance Manager' }
                    : isAdv
                    ? { bg: '#ecfdf5', color: '#047857', label: 'Insurance Advisor' }
                    : { bg: '#fef3c7', color: '#b45309', label: 'POSP Agent' };

                  // Authorization check for 3-dot action menu:
                  // Strictly Super Admins can manage employee IAM profiles, credentials, and roles.
                  // Managers have clean read-only visibility into their assigned subordinates.
                  const canActOnUser = isSuperAdmin;

                  return (
                    <tr key={u.id} className="crm-table-row">
                      
                      {/* Employee Info */}
                      <td className="crm-table-td">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: 'var(--crm-surface-hover)',
                            border: '1px solid var(--crm-border-subtle)',
                            color: 'var(--crm-text-primary)',
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.85rem',
                            flexShrink: 0
                          }}>
                            {u.fullName ? u.fullName[0] : 'U'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--crm-text-primary)' }}>
                              {u.fullName} 
                              {u.employeeCode && (
                                <span style={{ marginLeft: '6px', fontSize: '0.72rem', background: 'var(--crm-surface-hover)', color: 'var(--crm-text-secondary)', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                                  {u.employeeCode}
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--crm-text-muted)' }}>
                              {u.email} • {u.phoneNumber || 'No phone'}
                            </div>
                            {u.designation && (
                              <div style={{ fontSize: '0.72rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>
                                {u.designation} ({u.department || 'Sales'})
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Corporate Mailbox Column */}
                      <td className="crm-table-td">
                        {u.hasDomainMailbox && u.domainMailboxEmail ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                            <div style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              background: u.mailboxStatus === 'UNSYNCHRONIZED' || u.mailboxStatus === 'QUEUED' ? '#fffbeb' : '#f0fdf4',
                              color: u.mailboxStatus === 'UNSYNCHRONIZED' || u.mailboxStatus === 'QUEUED' ? '#b45309' : '#166534',
                              border: u.mailboxStatus === 'UNSYNCHRONIZED' || u.mailboxStatus === 'QUEUED' ? '1px solid #fde68a' : '1px solid #bbf7d0',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: 700
                            }}>
                              <AtSign size={12} color={u.mailboxStatus === 'UNSYNCHRONIZED' || u.mailboxStatus === 'QUEUED' ? '#d97706' : '#16a34a'} />
                              <span>{u.domainMailboxEmail}</span>
                              <button
                                type="button"
                                title="Copy Corporate Email"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigator.clipboard.writeText(u.domainMailboxEmail);
                                  setCopiedEmail(u.domainMailboxEmail);
                                  setTimeout(() => setCopiedEmail(null), 2000);
                                }}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  cursor: 'pointer',
                                  padding: '2px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  color: u.mailboxStatus === 'UNSYNCHRONIZED' || u.mailboxStatus === 'QUEUED' ? '#b45309' : '#166534'
                                }}
                              >
                                {copiedEmail === u.domainMailboxEmail ? <Check size={11} color="#16a34a" /> : <Copy size={11} />}
                              </button>
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {(u.mailboxStatus === 'UNSYNCHRONIZED' || u.mailboxStatus === 'QUEUED') ? (
                                <span style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px',
                                  color: '#b45309',
                                  fontSize: '0.68rem',
                                  fontWeight: 700,
                                  background: '#fef3c7',
                                  padding: '1px 5px',
                                  borderRadius: '4px'
                                }}>
                                  ⚠️ Unsynced
                                </span>
                              ) : (
                                <span style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px',
                                  color: '#15803d',
                                  fontSize: '0.68rem',
                                  fontWeight: 700
                                }}>
                                  ● Active Mailbox
                                </span>
                              )}

                              {canActOnUser && (
                                <button
                                  type="button"
                                  onClick={() => openMailboxModal(u)}
                                  style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#059669',
                                    fontSize: '0.68rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    padding: '0 2px',
                                    textDecoration: 'underline',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '3px'
                                  }}
                                >
                                  <span>Settings</span>
                                </button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--crm-text-muted)', fontStyle: 'italic' }}>
                              Not Provisioned
                            </span>
                            {canActOnUser && (
                              <button
                                type="button"
                                onClick={() => openMailboxModal(u)}
                                style={{
                                  background: '#f1f5f9',
                                  border: '1px solid #cbd5e1',
                                  borderRadius: '4px',
                                  color: '#334155',
                                  fontSize: '0.68rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  padding: '2px 6px'
                                }}
                              >
                                + Provision
                              </button>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Role Badge */}
                      <td className="crm-table-td">
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          background: roleBadgeStyle.bg,
                          color: roleBadgeStyle.color,
                          padding: '4px 10px',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: 700
                        }}>
                          {roleBadgeStyle.label}
                        </span>
                      </td>

                      {/* Reporting Manager */}
                      <td className="crm-table-td" style={{ color: 'var(--crm-text-secondary)' }}>
                        {u.managerName ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                            <Building2 size={14} color="var(--accent-emerald)" />
                            {u.managerName}
                          </div>
                        ) : (
                          <span style={{ color: 'var(--crm-text-muted)', fontStyle: 'italic', fontSize: '0.8rem' }}>None (Direct)</span>
                        )}
                      </td>

                      {/* Assigned Clients */}
                      <td className="crm-table-td">
                        <span style={{
                          background: 'var(--crm-surface-muted)',
                          border: '1px solid var(--crm-border-subtle)',
                          padding: '4px 10px',
                          borderRadius: '8px',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          color: 'var(--crm-text-primary)'
                        }}>
                          {u.assignedClientsCount || 0} Clients
                        </span>
                      </td>

                      {/* Status */}
                      <td className="crm-table-td">
                        {u.isActive ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--crm-success)', fontWeight: 700, fontSize: '0.8rem' }}>
                            <CheckCircle2 size={14} /> Active
                          </span>
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--crm-danger)', fontWeight: 700, fontSize: '0.8rem' }}>
                            <XCircle size={14} /> Inactive
                          </span>
                        )}
                      </td>

                      {/* Actions (3-Dot Overflow Menu - Industry Standard UX) */}
                      <td className="crm-table-td" style={{ textAlign: 'right', position: 'relative' }}>
                        {canActOnUser ? (
                          <ActionDropdown
                            menuWidth="205px"
                            trigger={({ isOpen }) => (
                              <button
                                type="button"
                                title="Actions"
                                className="crm-modal-close-btn"
                                style={{ padding: '6px', background: isOpen ? '#f1f5f9' : 'transparent' }}
                              >
                                <MoreVertical size={16} />
                              </button>
                            )}
                          >
                            {({ close }) => (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    close();
                                    openEditModal(u);
                                  }}
                                  className="crm-popover-btn"
                                >
                                  <Edit3 size={14} color="var(--accent-emerald)" /> Edit Profile & Role
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    close();
                                    openResetModal(u);
                                  }}
                                  className="crm-popover-btn"
                                >
                                  <Key size={14} color="var(--accent-gold)" /> Reset Password
                                </button>

                                {isSuperAdmin && u.email && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      close();
                                      handleResendWelcomeNow(u);
                                    }}
                                    className="crm-popover-btn"
                                  >
                                    <Send size={14} color="#0284c7" /> Resend Welcome Email
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => {
                                    close();
                                    openMailboxModal(u);
                                  }}
                                  className="crm-popover-btn"
                                >
                                  <AtSign size={14} color="#059669" /> Manage Domain Mailbox
                                </button>

                                <div style={{ height: '1px', background: 'var(--crm-border-subtle)', margin: '4px 0' }} />

                                <button
                                  type="button"
                                  onClick={() => {
                                    close();
                                    handleToggleUserStatus(u);
                                  }}
                                  className="crm-popover-btn"
                                  style={{ color: u.isActive ? '#d97706' : 'var(--crm-success)' }}
                                >
                                  {u.isActive ? (
                                    <>
                                      <UserX size={14} color="#d97706" /> Deactivate User
                                    </>
                                  ) : (
                                    <>
                                      <UserCheck size={14} color="var(--crm-success)" /> Activate User
                                    </>
                                  )}
                                </button>

                                {isSuperAdmin && (
                                  <>
                                    <div style={{ height: '1px', background: 'var(--crm-border-subtle)', margin: '4px 0' }} />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        close();
                                        handleDeleteUserNow(u);
                                      }}
                                      className="crm-popover-btn danger"
                                    >
                                      <Trash2 size={14} color="#dc2626" /> Delete User
                                    </button>
                                  </>
                                )}
                              </>
                            )}
                          </ActionDropdown>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--crm-text-muted)', fontStyle: 'italic' }}>
                            Read-only
                          </span>
                        )}
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pinned Pagination Footer */}
        <CrmTablePaginationBar
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={filteredUsers.length}
          onPageChange={setCurrentPage}
          onPageSizeChange={handlePageSizeChange}
          itemName="staff members"
        />
      </div>

      {/* 1. Modal: Add New Employee / Manager (Enterprise Provisioning Overhaul) */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '680px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              background: '#ffffff',
              padding: '1.25rem 1.75rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid #e2e8f0',
              flexShrink: 0
            }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#0f2b48', letterSpacing: '-0.3px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <UserPlus size={20} color="var(--accent-emerald)" />
                  Add Team Member & Provision Access
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.84rem', color: '#64748b' }}>
                  Create employee profile, configure corporate mailbox, and dispatch welcome credentials.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                style={{ 
                  background: '#f8fafc', 
                  border: '1px solid #e2e8f0', 
                  color: '#64748b', 
                  cursor: 'pointer',
                  borderRadius: '10px',
                  padding: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#0f2b48'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#64748b'; }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body (Scrollable with comfortable padding) */}
            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
              <div style={{ padding: '1.5rem 1.75rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
                {errorMsg && (
                  <div style={{ 
                    background: '#fef2f2', 
                    border: '1px solid #fecaca', 
                    color: '#991b1b', 
                    padding: '10px 14px', 
                    borderRadius: '10px', 
                    fontSize: '0.86rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <AlertCircle size={16} color="#dc2626" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Section 1: Personal & Contact Information */}
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '14px',
                  padding: '16px'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    marginBottom: '14px', 
                    color: '#0f2b48', 
                    fontSize: '0.86rem', 
                    fontWeight: 800, 
                    letterSpacing: '0.4px',
                    textTransform: 'uppercase'
                  }}>
                    <UserIcon size={16} color="var(--crm-primary)" />
                    1. Identity & Contact Information
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                        Full Name <span style={{ color: '#e11d48' }}>*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Priya Sharma"
                        value={createUserForm.fullName}
                        onChange={(e) => {
                          const name = e.target.value;
                          setCreateUserForm(prev => {
                            // Smart auto-derive: only auto-generate handle if user hasn't explicitly customized it
                            const suggestedAlias = name.toLowerCase().trim().replace(/[^a-z0-9\s.]/g, '').replace(/\s+/g, '.');
                            return {
                              ...prev,
                              fullName: name,
                              customMailboxUsername: isMailboxUsernameCustomized ? prev.customMailboxUsername : suggestedAlias
                            };
                          });
                        }}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                        Employee Code
                      </label>
                      <input
                        type="text"
                        placeholder="Auto-assigned (e.g. ADV108)"
                        value={createUserForm.employeeCode}
                        onChange={(e) => setCreateUserForm({ ...createUserForm, employeeCode: e.target.value })}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', background: '#ffffff' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                        Personal / Contact Email <span style={{ color: '#e11d48' }}>*</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. priya.personal@gmail.com"
                        value={createUserForm.email}
                        onChange={(e) => setCreateUserForm({ ...createUserForm, email: e.target.value })}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                      />
                      <span style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '4px', display: 'block', lineHeight: 1.4 }}>
                        ✉️ Initial temporary credentials & portal link will be dispatched here.
                      </span>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                        Mobile Phone Number <span style={{ color: '#e11d48' }}>*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. +91 9848012345"
                        value={createUserForm.phoneNumber}
                        onChange={(e) => setCreateUserForm({ ...createUserForm, phoneNumber: e.target.value })}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                      />
                      <span style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '4px', display: 'block', lineHeight: 1.4 }}>
                        Used for urgent alerts & 2FA login verification.
                      </span>
                    </div>
                  </div>
                </div>

                {/* Section 2: Organization Hierarchy & Role Mapping */}
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '14px',
                  padding: '16px'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    marginBottom: '14px', 
                    color: '#0f2b48', 
                    fontSize: '0.86rem', 
                    fontWeight: 800, 
                    letterSpacing: '0.4px',
                    textTransform: 'uppercase'
                  }}>
                    <Briefcase size={16} color="#d97706" />
                    2. Role & Organizational Structure
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                        System Role <span style={{ color: '#e11d48' }}>*</span>
                      </label>
                      <select
                        value={createUserForm.role}
                        onChange={(e) => setCreateUserForm({ ...createUserForm, role: e.target.value })}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', background: '#ffffff', color: '#0f2b48', fontWeight: 600 }}
                      >
                        {assignableRoles.length > 0 ? (
                          assignableRoles
                            .filter(r => {
                              if (!canCreateAdmins && (r.code === 'ROLE_SUPER_ADMIN' || r.code === 'ROLE_ADMIN')) return false;
                              if (!canCreateManagers && r.code === 'ROLE_MANAGER') return false;
                              return true;
                            })
                            .map(r => (
                              <option key={r.code} value={r.code}>
                                {r.code === 'ROLE_SUPER_ADMIN' ? '👑 ' : r.code === 'ROLE_MANAGER' ? '👔 ' : r.code === 'ROLE_ADVISOR' ? '🎯 ' : r.code === 'ROLE_POSP_AGENT' ? '🤝 ' : '💼 '}
                                {r.label}
                              </option>
                            ))
                        ) : (
                          isManager ? (
                            <>
                              <option value="ROLE_ADVISOR">🎯 Insurance Advisor / Employee</option>
                              <option value="ROLE_POSP_AGENT">🤝 POSP Agent Partner</option>
                            </>
                          ) : (
                            <>
                              <option value="ROLE_ADVISOR">🎯 Insurance Advisor / Employee</option>
                              <option value="ROLE_MANAGER">👔 Branch Manager</option>
                              <option value="ROLE_SUPER_ADMIN">👑 Super Admin (Full Global Access)</option>
                              <option value="ROLE_POSP_AGENT">🤝 POSP Agent Partner</option>
                            </>
                          )
                        )}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                        Reporting Manager
                      </label>
                      {!isSuperAdmin ? (
                        <div style={{
                          padding: '9px 12px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.88rem',
                          background: '#f1f5f9',
                          color: '#0f2b48',
                          fontWeight: 600
                        }}>
                          {authUser?.fullName || 'You (Current User)'} (Auto-Assigned)
                        </div>
                      ) : (
                        <select
                          value={createUserForm.managerId}
                          onChange={(e) => setCreateUserForm({ ...createUserForm, managerId: e.target.value })}
                          disabled={createUserForm.role === 'ROLE_SUPER_ADMIN'}
                          style={{ 
                            width: '100%', 
                            padding: '9px 12px', 
                            borderRadius: '8px', 
                            border: '1px solid #cbd5e1', 
                            fontSize: '0.88rem', 
                            background: createUserForm.role === 'ROLE_SUPER_ADMIN' ? '#f1f5f9' : '#ffffff',
                            cursor: createUserForm.role === 'ROLE_SUPER_ADMIN' ? 'not-allowed' : 'pointer'
                          }}
                        >
                          <option value="">Direct / None (Top Level)</option>
                          {managers.map(m => (
                            <option key={m.id} value={m.id}>{m.fullName} ({m.email})</option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>

                  {createUserForm.role === 'ROLE_SUPER_ADMIN' && (
                    <div style={{
                      background: '#fffbeb',
                      border: '1px solid #fef3c7',
                      borderRadius: '10px',
                      padding: '10px 14px',
                      marginBottom: '12px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px',
                      fontSize: '0.78rem',
                      color: '#92400e'
                    }}>
                      <ShieldCheck size={16} color="#d97706" style={{ marginTop: '2px', flexShrink: 0 }} />
                      <div>
                        <strong>Super Administrator Role:</strong> Full unrestricted governance over all branch financials, user credentials, commissions, and live system policies.
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                        Department
                      </label>
                      <select
                        value={isCustomCreateDept ? '__CUSTOM__' : createUserForm.department}
                        onChange={(e) => {
                          if (e.target.value === '__CUSTOM__') {
                            setIsCustomCreateDept(true);
                          } else {
                            setIsCustomCreateDept(false);
                            setCreateUserForm({ ...createUserForm, department: e.target.value });
                          }
                        }}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', background: '#ffffff' }}
                      >
                        {departments.map(dept => (
                          <option key={dept.code || dept.name} value={dept.name}>
                            {dept.name}
                          </option>
                        ))}
                        <option value="__CUSTOM__">✏️ + Custom / Other Department...</option>
                      </select>

                      {isCustomCreateDept && (
                        <input
                          type="text"
                          required
                          placeholder="Type custom department..."
                          value={customCreateDeptText}
                          onChange={(e) => setCustomCreateDeptText(e.target.value)}
                          style={{ width: '100%', marginTop: '6px', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid var(--crm-primary)', fontSize: '0.85rem' }}
                        />
                      )}
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                        Designation
                      </label>
                      <select
                        value={isCustomCreateDesig ? '__CUSTOM__' : createUserForm.designation}
                        onChange={(e) => {
                          if (e.target.value === '__CUSTOM__') {
                            setIsCustomCreateDesig(true);
                          } else {
                            setIsCustomCreateDesig(false);
                            setCreateUserForm({ ...createUserForm, designation: e.target.value });
                          }
                        }}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', background: '#ffffff' }}
                      >
                        {designations.map(desig => (
                          <option key={desig.code || desig.name} value={desig.name}>
                            {desig.name}
                          </option>
                        ))}
                        <option value="__CUSTOM__">✏️ + Custom / Other Designation...</option>
                      </select>

                      {isCustomCreateDesig && (
                        <input
                          type="text"
                          required
                          placeholder="Type custom designation title..."
                          value={customCreateDesigText}
                          onChange={(e) => setCustomCreateDesigText(e.target.value)}
                          style={{ width: '100%', marginTop: '6px', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid var(--crm-primary)', fontSize: '0.85rem' }}
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Section 3: Access & Corporate Mailbox Provisioning */}
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '14px',
                  padding: '16px'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    marginBottom: '14px', 
                    color: '#0f2b48', 
                    fontSize: '0.86rem', 
                    fontWeight: 800, 
                    letterSpacing: '0.4px',
                    textTransform: 'uppercase'
                  }}>
                    <Lock size={16} color="var(--accent-emerald)" />
                    3. Credentials & Corporate Mailbox
                  </div>

                  {/* Mailbox Toggle Card */}
                  <div style={{
                    background: createUserForm.createDomainMailbox ? '#f0fdf4' : '#ffffff',
                    border: createUserForm.createDomainMailbox ? '1.5px solid #86efac' : '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '14px',
                    marginBottom: '14px',
                    transition: 'all 0.2s ease'
                  }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={createUserForm.createDomainMailbox}
                        onChange={(e) => setCreateUserForm({ ...createUserForm, createDomainMailbox: e.target.checked })}
                        style={{ width: '18px', height: '18px', accentColor: '#16a34a', cursor: 'pointer' }}
                      />
                      <div>
                        <span style={{ fontSize: '0.88rem', fontWeight: 800, color: createUserForm.createDomainMailbox ? '#166534' : '#334155' }}>
                          Provision Corporate Domain Email (@aadhirakshainsurance.com)
                        </span>
                        <span style={{ fontSize: '0.74rem', color: '#64748b', display: 'block', marginTop: '2px' }}>
                          Enables dedicated Hostinger VPS Stalwart mailbox with 5GB quota, IMAP/SMTP sync & Webmail portal.
                        </span>
                      </div>
                    </label>

                    {createUserForm.createDomainMailbox && (
                      <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px dashed #bbf7d0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                          <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#166534' }}>
                            Corporate Username / Handle:
                          </label>
                          {isMailboxUsernameCustomized && (
                            <button
                              type="button"
                              onClick={() => {
                                setIsMailboxUsernameCustomized(false);
                                const suggested = (createUserForm.fullName || '').toLowerCase().trim().replace(/[^a-z0-9\s.]/g, '').replace(/\s+/g, '.');
                                setCreateUserForm(prev => ({ ...prev, customMailboxUsername: suggested }));
                              }}
                              style={{
                                background: 'none',
                                border: 'none',
                                padding: 0,
                                fontSize: '0.74rem',
                                color: '#0284c7',
                                textDecoration: 'underline',
                                cursor: 'pointer',
                                fontWeight: 600
                              }}
                            >
                              ↺ Reset to Name Sync
                            </button>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', background: '#ffffff', border: '1px solid #86efac', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                          <input
                            type="text"
                            placeholder="e.g. priya.sharma"
                            value={createUserForm.customMailboxUsername}
                            onChange={(e) => {
                              setIsMailboxUsernameCustomized(true);
                              setCreateUserForm({ ...createUserForm, customMailboxUsername: e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, '') });
                            }}
                            style={{ flex: 1, padding: '9px 12px', border: 'none', outline: 'none', fontSize: '0.86rem', fontWeight: 600, color: '#0f2b48' }}
                          />
                          <span style={{ padding: '9px 14px', background: '#f0fdf4', color: '#15803d', fontSize: '0.82rem', fontWeight: 700, borderLeft: '1px solid #bbf7d0' }}>
                            @aadhirakshainsurance.com
                          </span>
                        </div>
                        {/* Instant Collision Warning */}
                        {(() => {
                          const currentHandle = createUserForm.customMailboxUsername?.trim().toLowerCase();
                          if (!currentHandle) return null;
                          const fullEmail = `${currentHandle}@aadhirakshainsurance.com`;
                          const isTaken = users.some(u => u.domainMailboxEmail && u.domainMailboxEmail.toLowerCase() === fullEmail);
                          return isTaken ? (
                            <div style={{ fontSize: '0.74rem', color: '#dc2626', marginTop: '5px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                              <AlertCircle size={13} color="#dc2626" />
                              Notice: '{fullEmail}' is already assigned to an existing team member.
                            </div>
                          ) : null;
                        })()}
                      </div>
                    )}
                  </div>

                  {/* Password Mode Selector */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Initial Password Option
                    </label>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setCreatePasswordMode('AUTO');
                          setCreateUserForm(prev => ({ ...prev, password: '' }));
                        }}
                        style={{
                          padding: '9px 12px',
                          borderRadius: '8px',
                          border: createPasswordMode === 'AUTO' ? '1.5px solid var(--accent-emerald)' : '1px solid #cbd5e1',
                          background: createPasswordMode === 'AUTO' ? '#ecfdf5' : '#ffffff',
                          color: createPasswordMode === 'AUTO' ? '#047857' : '#475569',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        <Sparkles size={14} color={createPasswordMode === 'AUTO' ? '#059669' : '#64748b'} />
                        Auto-Generate Secure Password
                      </button>

                      <button
                        type="button"
                        onClick={() => setCreatePasswordMode('CUSTOM')}
                        style={{
                          padding: '9px 12px',
                          borderRadius: '8px',
                          border: createPasswordMode === 'CUSTOM' ? '1.5px solid var(--accent-emerald)' : '1px solid #cbd5e1',
                          background: createPasswordMode === 'CUSTOM' ? '#ecfdf5' : '#ffffff',
                          color: createPasswordMode === 'CUSTOM' ? '#047857' : '#475569',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        <Key size={14} color={createPasswordMode === 'CUSTOM' ? '#059669' : '#64748b'} />
                        Specify Custom Password
                      </button>
                    </div>

                    {createPasswordMode === 'CUSTOM' ? (
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showCreatePassword ? "text" : "password"}
                          placeholder="Enter temporary password (min 8 characters)..."
                          value={createUserForm.password}
                          onChange={(e) => setCreateUserForm({ ...createUserForm, password: e.target.value })}
                          style={{ width: '100%', padding: '9px 40px 9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowCreatePassword(!showCreatePassword)}
                          style={{
                            position: 'absolute',
                            right: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#64748b'
                          }}
                        >
                          {showCreatePassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    ) : (
                      <div style={{ 
                        fontSize: '0.76rem', 
                        color: '#059669', 
                        background: '#ecfdf5', 
                        padding: '8px 12px', 
                        borderRadius: '8px', 
                        border: '1px solid #a7f3d0' 
                      }}>
                        ⚡ High-entropy 10-character password will be auto-generated and emailed to the user upon creation.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer (Sticky, Clear Hierarchy) */}
              <div style={{
                padding: '1.25rem 1.75rem',
                background: '#ffffff',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: '12px',
                flexShrink: 0
              }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
                    color: '#475569',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#f8fafc'; }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: '10px 22px',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'var(--accent-emerald)',
                    color: '#ffffff',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 2px 6px rgba(5, 150, 105, 0.25)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <ShieldCheck size={16} />
                  {submitting ? 'Provisioning Member...' : 'Create User & Dispatch Credentials'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Modal: Temporary Password Success Card */}
      {tempPasswordSuccess && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          zIndex: 11000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '480px',
            padding: '2rem',
            textAlign: 'center',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: '#ecfdf5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto'
            }}>
              <CheckCircle2 size={32} />
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f2b48', margin: 0 }}>
              Temporary Credentials Generated!
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '6px' }}>
              Please copy and securely share these login details with <strong>{tempPasswordSuccess.fullName}</strong>.
            </p>

            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '1rem',
              margin: '1.25rem 0',
              textAlign: 'left'
            }}>
              <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>USERNAME / EMAIL:</div>
              <div style={{ fontSize: '0.92rem', color: '#0f2b48', fontWeight: 700, marginBottom: '8px' }}>
                {tempPasswordSuccess.email}
              </div>

              <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>TEMPORARY PASSWORD:</div>
              <div style={{ fontSize: '1.1rem', color: '#059669', fontWeight: 800, letterSpacing: '1px', fontFamily: 'monospace' }}>
                {tempPasswordSuccess.temporaryPassword}
              </div>

              {tempPasswordSuccess.domainMailbox && (
                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px dashed #cbd5e1' }}>
                  <div style={{ fontSize: '0.78rem', color: '#166534', fontWeight: 700, marginBottom: '4px' }}>
                    OFFICIAL CORPORATE MAILBOX:
                  </div>
                  <div style={{ fontSize: '0.92rem', color: '#0f2b48', fontWeight: 800 }}>
                    {tempPasswordSuccess.domainMailbox.domainEmail}
                  </div>
                  {tempPasswordSuccess.domainMailbox.mailboxPassword && (
                    <div style={{ marginTop: '6px' }}>
                      <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>MAILBOX PASSWORD: </span>
                      <code style={{
                        background: '#ecfdf5',
                        border: '1px solid #a7f3d0',
                        color: '#065f46',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        fontFamily: 'monospace'
                      }}>
                        {tempPasswordSuccess.domainMailbox.mailboxPassword}
                      </code>
                    </div>
                  )}
                  <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '6px' }}>
                    Status: <strong style={{ color: '#059669' }}>{tempPasswordSuccess.domainMailbox.status || 'ACTIVE'}</strong> • Webmail: <a href={tempPasswordSuccess.domainMailbox.webmailUrl || 'https://mail.aadhirakshainsurance.com'} target="_blank" rel="noreferrer" style={{ color: '#0284c7', textDecoration: 'underline' }}>{tempPasswordSuccess.domainMailbox.webmailUrl || 'https://mail.aadhirakshainsurance.com'}</a>
                  </div>
                </div>
              )}

              {tempPasswordSuccess.domainMailboxError && (
                <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed #fecaca', background: '#fef2f2', padding: '8px', borderRadius: '8px', textAlign: 'left' }}>
                  <div style={{ fontSize: '0.76rem', color: '#dc2626', fontWeight: 700 }}>⚠️ Corporate Mailbox Notice:</div>
                  <div style={{ fontSize: '0.74rem', color: '#991b1b', marginTop: '2px' }}>
                    {tempPasswordSuccess.domainMailboxError}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>
                    You can manage or sync their mailbox anytime from the <strong>Manage Domain Mailbox</strong> option in the staff list.
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleCopyCredentials}
                style={{
                  flex: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  background: copied ? '#059669' : '#0f2b48',
                  color: '#ffffff',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {copied ? <><Check size={16} /> Copied to Clipboard!</> : <><Copy size={16} /> Copy Credentials</>}
              </button>

              <button
                onClick={() => setTempPasswordSuccess(null)}
                style={{
                  flex: 1,
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  padding: '12px',
                  borderRadius: '10px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Modal: Reset Password */}
      {showResetModal && selectedUser && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '440px',
            padding: '1.75rem'
          }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f2b48', margin: 0 }}>
              Reset Password for {selectedUser.fullName}
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
              Generate a new temporary password for <strong>{selectedUser.email}</strong>.
            </p>

            <form onSubmit={handleResetPasswordSubmit} style={{ marginTop: '1.25rem' }}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Custom Password (optional)
                </label>
                <input
                  type="text"
                  placeholder="Leave empty to auto-generate"
                  value={customPassword}
                  onChange={(e) => setCustomPassword(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
                <span style={{ fontSize: '0.72rem', color: '#0369a1', marginTop: '4px', display: 'block' }}>
                  ✉️ The updated password will also be automatically emailed to <strong>{selectedUser.email}</strong>.
                </span>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ flex: 2, padding: '10px', borderRadius: '8px', border: 'none', background: '#b45309', color: '#ffffff', fontWeight: 700, cursor: 'pointer' }}
                >
                  {submitting ? 'Resetting...' : 'Generate New Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Modal: Edit User & Reassign Manager */}
      {showEditModal && selectedUser && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '500px',
            padding: '1.75rem'
          }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f2b48', margin: 0 }}>
              Edit User & Manager Assignment
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
              Update profile details or reassign to a new reporting manager.
            </p>

            <form onSubmit={handleEditSubmit} style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editUserForm.fullName}
                  onChange={(e) => setEditUserForm({ ...editUserForm, fullName: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Reporting Manager
                </label>
                <select
                  value={editUserForm.managerId}
                  onChange={(e) => setEditUserForm({ ...editUserForm, managerId: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', background: '#ffffff' }}
                >
                  <option value="">Direct / None</option>
                  {managers.filter(m => m.id !== selectedUser.id).map(m => (
                    <option key={m.id} value={m.id}>{m.fullName} ({m.email})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Department
                  </label>
                  <select
                    value={isCustomEditDept ? '__CUSTOM__' : editUserForm.department}
                    onChange={(e) => {
                      if (e.target.value === '__CUSTOM__') {
                        setIsCustomEditDept(true);
                      } else {
                        setIsCustomEditDept(false);
                        setEditUserForm({ ...editUserForm, department: e.target.value });
                      }
                    }}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', background: '#ffffff' }}
                  >
                    {departments.map(dept => (
                      <option key={dept.code || dept.name} value={dept.name}>
                        {dept.name}
                      </option>
                    ))}
                    <option value="__CUSTOM__">✏️ + Custom / Other Department...</option>
                  </select>

                  {isCustomEditDept && (
                    <input
                      type="text"
                      required
                      placeholder="Type custom department name..."
                      value={customEditDeptText}
                      onChange={(e) => setCustomEditDeptText(e.target.value)}
                      style={{ width: '100%', marginTop: '6px', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #0284c7', fontSize: '0.85rem' }}
                    />
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Designation
                  </label>
                  <select
                    value={isCustomEditDesig ? '__CUSTOM__' : editUserForm.designation}
                    onChange={(e) => {
                      if (e.target.value === '__CUSTOM__') {
                        setIsCustomEditDesig(true);
                      } else {
                        setIsCustomEditDesig(false);
                        setEditUserForm({ ...editUserForm, designation: e.target.value });
                      }
                    }}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', background: '#ffffff' }}
                  >
                    {designations.map(desig => (
                      <option key={desig.code || desig.name} value={desig.name}>
                        {desig.name}
                      </option>
                    ))}
                    <option value="__CUSTOM__">✏️ + Custom / Other Designation...</option>
                  </select>

                  {isCustomEditDesig && (
                    <input
                      type="text"
                      required
                      placeholder="Type custom designation title..."
                      value={customEditDesigText}
                      onChange={(e) => setCustomEditDesigText(e.target.value)}
                      style={{ width: '100%', marginTop: '6px', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #0284c7', fontSize: '0.85rem' }}
                    />
                  )}
                </div>
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={editUserForm.isActive}
                    onChange={(e) => setEditUserForm({ ...editUserForm, isActive: e.target.checked })}
                    style={{ width: '16px', height: '16px', accentColor: '#059669' }}
                  />
                  User is Active (can login and receive leads)
                </label>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ flex: 2, padding: '10px', borderRadius: '8px', border: 'none', background: '#059669', color: '#ffffff', fontWeight: 700, cursor: 'pointer' }}
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Modal: Manage Corporate Domain Mailbox */}
      {showMailboxModal && mailboxModalUser && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '560px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden'
          }}>
            {/* Sticky Modal Header */}
            <div style={{
              background: '#ffffff',
              padding: '1.25rem 1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid #e2e8f0',
              flexShrink: 0
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: '#f0fdf4',
                  color: '#16a34a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <AtSign size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#0f2b48' }}>
                    Corporate Domain Mailbox
                  </h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                    {mailboxModalUser.fullName} ({mailboxModalUser.employeeCode || 'Employee'})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowMailboxModal(false)}
                style={{ 
                  background: '#f8fafc', 
                  border: '1px solid #e2e8f0', 
                  color: '#64748b', 
                  cursor: 'pointer',
                  borderRadius: '8px',
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Modal Content with clean scroll styling */}
            <div style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              overflowY: 'auto',
              flex: 1
            }}>
              {mailboxSuccessInfo && (
                <div style={{
                  background: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  fontSize: '0.84rem',
                  color: '#065f46'
                }}>
                  <div style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={16} color="#059669" />
                    Mailbox Action Completed Successfully!
                  </div>
                  <div style={{ marginTop: '6px' }}>
                    <strong>Email:</strong> {mailboxSuccessInfo.domainEmail}
                  </div>
                  {mailboxSuccessInfo.mailboxPassword && (
                    <div style={{ marginTop: '3px' }}>
                      <strong>New Password:</strong> <code style={{ background: '#ffffff', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>{mailboxSuccessInfo.mailboxPassword}</code>
                    </div>
                  )}
                  {mailboxSuccessInfo.newPassword && (
                    <div style={{ marginTop: '3px' }}>
                      <strong>New Password:</strong> <code style={{ background: '#ffffff', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>{mailboxSuccessInfo.newPassword}</code>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      const pwd = mailboxSuccessInfo.mailboxPassword || mailboxSuccessInfo.newPassword || '(as specified)';
                      const text = `Corporate Email Credentials:\nEmail: ${mailboxSuccessInfo.domainEmail}\nPassword: ${pwd}\nWebmail: https://mail.aadhirakshainsurance.com\nIncoming (IMAP): mail.aadhirakshainsurance.com:993 (SSL)\nOutgoing (SMTP): mail.aadhirakshainsurance.com:465 (SSL)`;
                      navigator.clipboard.writeText(text);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2500);
                    }}
                    style={{
                      marginTop: '8px',
                      background: copied ? '#047857' : '#059669',
                      color: '#ffffff',
                      border: 'none',
                      padding: '5px 12px',
                      borderRadius: '6px',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copied ? 'Credentials Copied to Clipboard!' : 'Copy All Credentials for Employee'}</span>
                  </button>
                </div>
              )}

              {/* Status Card */}
              {(() => {
                const isLiveSynced = mailboxModalUser.hasDomainMailbox && mailboxSettings?.isSynchronized === true;
                const isUnsynced = mailboxModalUser.hasDomainMailbox && mailboxSettings && mailboxSettings.isSynchronized === false;

                let badgeBg = '#fef2f2';
                let badgeColor = '#dc2626';
                let badgeBorder = '#fecaca';
                let badgeText = 'Not Provisioned Yet';
                let badgeIcon = <AlertCircle size={12} />;

                if (isLiveSynced) {
                  badgeBg = '#ecfdf5';
                  badgeColor = '#059669';
                  badgeBorder = '#a7f3d0';
                  badgeText = 'Verified Active on Stalwart';
                  badgeIcon = <CheckCircle2 size={12} />;
                } else if (isUnsynced) {
                  badgeBg = '#fefce8';
                  badgeColor = '#b45309';
                  badgeBorder = '#fef08a';
                  badgeText = 'Unsynchronized (Missing on Stalwart)';
                  badgeIcon = <AlertCircle size={12} />;
                }

                return (
                  <div style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '14px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>Mail Server Status:</span>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '3px 8px',
                        borderRadius: '999px',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        background: badgeBg,
                        color: badgeColor,
                        border: `1px solid ${badgeBorder}`
                      }}>
                        {badgeIcon}
                        {badgeText}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f2b48' }}>
                      {isLiveSynced ? (
                        mailboxModalUser.domainMailboxEmail
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ color: '#059669' }}>{provisionUsername || 'username'}</span>
                          <span style={{ color: '#64748b' }}>@aadhirakshainsurance.com</span>
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '4px' }}>
                      Storage Quota: 5 GB • Server: Hostinger VPS (mail.aadhirakshainsurance.com)
                    </div>
                    {isUnsynced && (
                      <div style={{ marginTop: '8px', padding: '8px 10px', background: '#fffbeb', borderRadius: '8px', border: '1px solid #fef3c7', fontSize: '0.74rem', color: '#92400e', lineHeight: 1.5 }}>
                        <strong>⚠ Attention:</strong> This mailbox is registered in the CRM database ({mailboxModalUser.domainMailboxEmail}) but has not yet been synchronized/created on Stalwart Mail Server. You can edit the username handle and password below before pushing to Stalwart.
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Customizable Provisioning / Synchronization Form (When Not Provisioned OR Unsynchronized) */}
              {(!mailboxModalUser.hasDomainMailbox || (mailboxSettings && mailboxSettings.isSynchronized === false)) && (
                <div style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  {/* 1. Custom Username / Alias */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#0f2b48', marginBottom: '5px' }}>
                      Corporate Email Address / Alias
                    </label>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      overflow: 'hidden'
                    }}>
                      <input
                        type="text"
                        value={provisionUsername}
                        onChange={(e) => setProvisionUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ''))}
                        placeholder="e.g. rajesh.kumar"
                        style={{
                          flex: 1,
                          border: 'none',
                          background: 'transparent',
                          padding: '8px 10px',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          color: '#0f2b48',
                          outline: 'none'
                        }}
                      />
                      <span style={{
                        padding: '8px 12px',
                        background: '#e2e8f0',
                        color: '#475569',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        borderLeft: '1px solid #cbd5e1',
                        userSelect: 'none'
                      }}>
                        @aadhirakshainsurance.com
                      </span>
                    </div>

                    {/* Suggested Aliases Pills */}
                    {(() => {
                      const parts = (mailboxModalUser.fullName || '').toLowerCase().trim().split(/\s+/).filter(Boolean);
                      const fName = parts[0] || 'user';
                      const lName = parts.length > 1 ? parts[parts.length - 1] : '';
                      const suggestions = [
                        lName ? `${fName}.${lName}` : fName,
                        fName,
                        lName ? `${fName[0]}${lName}` : `${fName}1`
                      ].filter(Boolean);
                      const uniqueSuggestions = Array.from(new Set(suggestions));

                      return (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>Suggestions:</span>
                          {uniqueSuggestions.map((sug) => (
                            <button
                              key={sug}
                              type="button"
                              onClick={() => setProvisionUsername(sug)}
                              style={{
                                border: provisionUsername === sug ? '1px solid #059669' : '1px solid #cbd5e1',
                                background: provisionUsername === sug ? '#ecfdf5' : '#f8fafc',
                                color: provisionUsername === sug ? '#059669' : '#334155',
                                padding: '1px 7px',
                                borderRadius: '4px',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              {sug}
                            </button>
                          ))}
                        </div>
                      );
                    })()}
                  </div>

                  {/* 2. Password Configuration Mode */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#0f2b48', marginBottom: '5px' }}>
                      Initial Password Option
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => setProvisionPasswordMode('AUTO')}
                        style={{
                          padding: '7px 10px',
                          borderRadius: '8px',
                          border: provisionPasswordMode === 'AUTO' ? '1.5px solid #059669' : '1px solid #cbd5e1',
                          background: provisionPasswordMode === 'AUTO' ? '#ecfdf5' : '#ffffff',
                          color: provisionPasswordMode === 'AUTO' ? '#047857' : '#64748b',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '5px'
                        }}
                      >
                        <Key size={13} /> Auto-Generate
                      </button>

                      <button
                        type="button"
                        onClick={() => setProvisionPasswordMode('CUSTOM')}
                        style={{
                          padding: '7px 10px',
                          borderRadius: '8px',
                          border: provisionPasswordMode === 'CUSTOM' ? '1.5px solid #059669' : '1px solid #cbd5e1',
                          background: provisionPasswordMode === 'CUSTOM' ? '#ecfdf5' : '#ffffff',
                          color: provisionPasswordMode === 'CUSTOM' ? '#047857' : '#64748b',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '5px'
                        }}
                      >
                        <Lock size={13} /> Custom Password
                      </button>
                    </div>

                    {provisionPasswordMode === 'CUSTOM' && (
                      <div style={{ marginTop: '8px' }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          background: '#f8fafc',
                          border: '1px solid #cbd5e1',
                          borderRadius: '8px',
                          padding: '0 8px'
                        }}>
                          <input
                            type={showProvisionPassword ? 'text' : 'password'}
                            value={provisionCustomPassword}
                            onChange={(e) => setProvisionCustomPassword(e.target.value)}
                            placeholder="Enter initial password (e.g. MyCompany#2026!)"
                            style={{
                              flex: 1,
                              border: 'none',
                              background: 'transparent',
                              padding: '8px 4px',
                              fontSize: '0.82rem',
                              outline: 'none',
                              color: '#0f2b48'
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => setShowProvisionPassword(prev => !prev)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              color: '#64748b',
                              display: 'flex',
                              alignItems: 'center',
                              padding: '4px'
                            }}
                          >
                            {showProvisionPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>

                        {/* Stalwart zxcvbn Live Password Strength Meter */}
                        {(() => {
                          const pwd = provisionCustomPassword || '';
                          let score = 0;
                          if (pwd.length >= 10) score++;
                          if (pwd.length >= 14) score++;
                          if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
                          if (/[0-9]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd)) score++;
                          if (pwd.length < 8) score = Math.min(score, 1);

                          const levels = [
                            { label: 'Very Weak', color: '#ef4444', percent: '20%', msg: 'Add uncommon words and symbols for Stalwart' },
                            { label: 'Weak', color: '#f97316', percent: '40%', msg: 'Too weak for Stalwart zxcvbn validator' },
                            { label: 'Fair', color: '#eab308', percent: '65%', msg: 'Almost there. Add an extra symbol or number' },
                            { label: 'Strong', color: '#059669', percent: '85%', msg: 'Stalwart Mail Server Compliant' },
                            { label: 'Enterprise Strong', color: '#047857', percent: '100%', msg: 'Maximum Security (Optimal Stalwart Entropy)' }
                          ];
                          const lvl = pwd ? levels[Math.min(score, 4)] : null;

                          return pwd ? (
                            <div style={{ marginTop: '6px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: 700, marginBottom: '3px' }}>
                                <span style={{ color: lvl.color }}>{lvl.label}</span>
                                <span style={{ color: '#64748b' }}>{pwd.length} chars</span>
                              </div>
                              <div style={{ height: '4px', background: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: lvl.percent, background: lvl.color, transition: 'all 0.2s ease' }} />
                              </div>
                              <div style={{ fontSize: '0.68rem', color: score < 3 ? '#dc2626' : '#059669', marginTop: '3px', fontWeight: 600 }}>
                                {score < 3 ? '⚠ ' : '✔ '}{lvl.msg}
                              </div>
                            </div>
                          ) : null;
                        })()}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Connection Specs */}
              {mailboxModalUser.hasDomainMailbox && mailboxSettings && (
                <div style={{
                  background: '#f1f5f9',
                  borderRadius: '10px',
                  padding: '12px',
                  fontSize: '0.78rem',
                  color: '#334155',
                  lineHeight: 1.6
                }}>
                  <div style={{ fontWeight: 700, color: '#0f2b48', marginBottom: '4px' }}>
                    📱 Client Setup (Outlook, iPhone, Android):
                  </div>
                  <div>• <strong>Incoming (IMAP):</strong> {mailboxSettings.imapServer} : {mailboxSettings.imapPort} (SSL)</div>
                  <div>• <strong>Outgoing (SMTP):</strong> {mailboxSettings.smtpServer} : {mailboxSettings.smtpPort} (TLS)</div>
                  <div>• <strong>Webmail Login:</strong> <a href={mailboxSettings.webmailUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#0284c7', fontWeight: 700 }}>{mailboxSettings.webmailUrl}</a></div>
                </div>
              )}

              {/* Email Aliases (Google Workspace / Microsoft 365 Standard Collapsible Section) */}
              {mailboxModalUser.hasDomainMailbox && (
                <div style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  overflow: 'hidden'
                }}>
                  {/* Collapsible Accordion Header */}
                  <button
                    type="button"
                    onClick={() => setShowAliasesAccordion(prev => !prev)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 14px',
                      background: showAliasesAccordion ? '#f8fafc' : '#ffffff',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f2b48', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>Alternate Email Aliases</span>
                        <span style={{
                          fontSize: '0.68rem',
                          background: mailboxSettings?.aliases?.length ? '#e0f2fe' : '#f1f5f9',
                          color: mailboxSettings?.aliases?.length ? '#0369a1' : '#64748b',
                          padding: '2px 7px',
                          borderRadius: '10px',
                          fontWeight: 700
                        }}>
                          {mailboxSettings?.aliases?.length || 0} Optional
                        </span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                        Secondary handles delivering to this mailbox (Optional)
                      </div>
                    </div>
                    <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 800 }}>
                      {showAliasesAccordion ? '▲' : '▼'}
                    </span>
                  </button>

                  {/* Expanded Accordion Body */}
                  {showAliasesAccordion && (
                    <div style={{ padding: '12px 14px', borderTop: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '10px', background: '#fafafa' }}>
                      {/* Existing Aliases List */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {mailboxSettings && mailboxSettings.aliases && mailboxSettings.aliases.length > 0 ? (
                          mailboxSettings.aliases.map((alias) => (
                            <div
                              key={alias}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                background: '#ffffff',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                padding: '6px 10px',
                                fontSize: '0.78rem'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{
                                  width: '6px',
                                  height: '6px',
                                  borderRadius: '50%',
                                  background: '#059669'
                                }} />
                                <strong style={{ color: '#0f2b48' }}>{alias}</strong>
                                <span style={{
                                  fontSize: '0.68rem',
                                  background: '#e0f2fe',
                                  color: '#0369a1',
                                  padding: '1px 6px',
                                  borderRadius: '4px',
                                  fontWeight: 700
                                }}>
                                  Alias
                                </span>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <button
                                  type="button"
                                  onClick={() => handleSetPrimaryEmailNow(alias)}
                                  disabled={aliasActionLoading}
                                  title="Make this the primary login email address (current primary becomes an alias)"
                                  style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#0284c7',
                                    fontSize: '0.7rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    textDecoration: 'underline'
                                  }}
                                >
                                  Make Primary
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleRemoveAliasNow(alias)}
                                  disabled={aliasActionLoading}
                                  title="Remove alias"
                                  style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#dc2626',
                                    fontSize: '0.78rem',
                                    fontWeight: 800,
                                    cursor: 'pointer',
                                    padding: '2px 4px'
                                  }}
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic', padding: '4px 0' }}>
                            No alternate aliases assigned yet.
                          </div>
                        )}
                      </div>

                      {/* Add New Alias Input */}
                      <form onSubmit={handleAddAliasNow} style={{ display: 'flex', gap: '6px', marginTop: '4px', margin: 0 }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: '8px',
                          flex: 1,
                          overflow: 'hidden'
                        }}>
                          <input
                            type="text"
                            value={newAliasHandle}
                            onChange={(e) => setNewAliasHandle(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ''))}
                            placeholder="new.alias"
                            disabled={aliasActionLoading}
                            style={{
                              flex: 1,
                              border: 'none',
                              background: 'transparent',
                              padding: '6px 8px',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              color: '#0f2b48',
                              outline: 'none'
                            }}
                          />
                          <span style={{
                            padding: '6px 10px',
                            background: '#f1f5f9',
                            color: '#475569',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            borderLeft: '1px solid #cbd5e1',
                            userSelect: 'none'
                          }}>
                            @aadhirakshainsurance.com
                          </span>
                        </div>

                        <button
                          type="submit"
                          disabled={aliasActionLoading || !newAliasHandle.trim()}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '8px',
                            border: 'none',
                            background: aliasActionLoading || !newAliasHandle.trim() ? '#94a3b8' : '#059669',
                            color: '#ffffff',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: aliasActionLoading || !newAliasHandle.trim() ? 'not-allowed' : 'pointer',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {aliasActionLoading ? 'Adding...' : '+ Add Alias'}
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(!mailboxModalUser.hasDomainMailbox || (mailboxSettings && mailboxSettings.isSynchronized === false)) ? (
                  <button
                    onClick={handleProvisionMailboxNow}
                    disabled={mailboxActionLoading || !provisionUsername.trim()}
                    style={{
                      padding: '11px',
                      borderRadius: '10px',
                      border: 'none',
                      background: mailboxActionLoading || !provisionUsername.trim() ? '#94a3b8' : '#059669',
                      color: '#ffffff',
                      fontWeight: 700,
                      cursor: mailboxActionLoading || !provisionUsername.trim() ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 2px 4px rgba(5, 150, 105, 0.2)'
                    }}
                  >
                    <AtSign size={16} />
                    {mailboxActionLoading 
                      ? 'Creating on Stalwart Mail Server...' 
                      : (mailboxSettings && mailboxSettings.isSynchronized === false 
                          ? '⚡ Push & Sync to Stalwart Mail Server' 
                          : 'Provision Domain Mailbox Now')}
                  </button>
                ) : (
                  <button
                    onClick={handleResetMailboxPasswordNow}
                    disabled={mailboxActionLoading}
                    style={{
                      padding: '10px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      color: '#0f2b48',
                      fontWeight: 700,
                      cursor: mailboxActionLoading ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <Key size={15} color="#d97706" />
                    {mailboxActionLoading ? 'Updating...' : 'Generate New Mailbox Password'}
                  </button>
                )}

                {mailboxModalUser.hasDomainMailbox && isSuperAdmin && (
                  <button
                    type="button"
                    onClick={() => handleDeprovisionMailboxNow(mailboxModalUser)}
                    disabled={mailboxActionLoading}
                    style={{
                      padding: '10px',
                      borderRadius: '10px',
                      border: '1px solid #fecaca',
                      background: '#fff1f2',
                      color: '#e11d48',
                      fontWeight: 700,
                      cursor: mailboxActionLoading ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <Trash2 size={15} color="#e11d48" />
                    Deprovision & Delete Mailbox
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setShowMailboxModal(false)}
                  style={{
                    padding: '9px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
                    fontWeight: 600,
                    color: '#64748b',
                    cursor: 'pointer'
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enterprise Confirmation Modal (replacing native window.confirm) */}
      <ConfirmationModal
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmLabel={confirmDialog.confirmLabel}
        cancelLabel={confirmDialog.cancelLabel}
        variant={confirmDialog.variant}
        isLoading={confirmDialog.isLoading}
      />

    </div>
  );
}
