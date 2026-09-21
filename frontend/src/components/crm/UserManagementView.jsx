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
  UserX
} from 'lucide-react';
import { crmService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function UserManagementView() {
  const { 
    user: authUser, 
    isSuperAdmin, 
    isManager, 
    canCreateAdmins, 
    canCreateManagers 
  } = useAuth();
  
  const [users, setUsers] = useState([]);
  const [managers, setManagers] = useState([]);
  const [assignableRoles, setAssignableRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [activeActionMenuId, setActiveActionMenuId] = useState(null);

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
    password: ''
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

    const handleOutsideClick = (e) => {
      if (!e.target.closest('.user-action-menu-container')) {
        setActiveActionMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
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

      const payload = {
        ...createUserForm,
        department: finalDepartment,
        designation: finalDesignation,
        managerId: createUserForm.managerId ? Number(createUserForm.managerId) : null
      };
      const response = await crmService.createUser(payload);
      setShowCreateModal(false);
      setTempPasswordSuccess({
        email: response.user.email,
        fullName: response.user.fullName,
        temporaryPassword: response.temporaryPassword
      });
      loadData();
      setIsCustomCreateDept(false);
      setCustomCreateDeptText('');
      setIsCustomCreateDesig(false);
      setCustomCreateDesigText('');
      setCreateUserForm({
        employeeCode: '',
        fullName: '',
        email: '',
        phoneNumber: '',
        designation: 'Insurance Advisor',
        department: departments[0]?.name || 'Retail Sales (Health, Life & Motor)',
        role: 'ROLE_ADVISOR',
        managerId: '',
        password: ''
      });
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to create user. Email may already exist.');
    } finally {
      setSubmitting(false);
    }
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
    const text = `Aadhiraksha CRM Credentials:\nUsername/Email: ${tempPasswordSuccess.email}\nTemporary Password: ${tempPasswordSuccess.temporaryPassword}\nLogin Portal: https://aadhirakshainsurance.com/login`;
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
    // Defense-in-depth: If logged-in user is a Manager, strictly enforce subordinate-only display
    if (isManager && !isSuperAdmin) {
      if (u.managerId !== authUser?.id) {
        return false;
      }
    }

    const matchesSearch = 
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.employeeCode && u.employeeCode.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.designation && u.designation.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole = 
      roleFilter === 'ALL' ||
      u.roles.includes(roleFilter);

    return matchesSearch && matchesRole;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Top Header & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--crm-text-primary)', margin: 0 }}>
            {isSuperAdmin ? 'Organization Staff & Team Hierarchy' : 'My Team Members'}
          </h2>
          <p style={{ color: 'var(--crm-text-muted)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
            {isSuperAdmin 
              ? 'Manage Super Admins, Insurance Managers, Advisors, and global user provisioning.'
              : 'View and manage insurance advisors and employees assigned directly under your team hierarchy.'}
          </p>
        </div>

        {isSuperAdmin && (
          <button
            onClick={async () => {
              try {
                const freshRoles = await crmService.getAssignableRoles();
                if (freshRoles && freshRoles.length > 0) {
                  setAssignableRoles(freshRoles);
                }
              } catch (err) {
                console.warn('Using existing assignable roles catalog', err);
              }
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
            <UserPlus size={17} /> Add New Employee / Manager
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
            placeholder="Search by Employee Code, Name, Email, or Designation..."
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Filter size={16} color="#64748b" />
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Role Filter:</span>
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
      </div>

      {/* Users Table */}
      <div style={{
        background: 'var(--crm-surface-card)',
        borderRadius: '16px',
        border: '1px solid var(--crm-border-subtle)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)'
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
          <div style={{ overflowX: 'auto' }}>
            <table className="crm-table">
              <thead className="crm-table-head">
                <tr>
                  <th className="crm-table-th">Employee</th>
                  <th className="crm-table-th">Role</th>
                  <th className="crm-table-th">Reporting Manager</th>
                  <th className="crm-table-th">Assigned Clients</th>
                  <th className="crm-table-th">Status</th>
                  <th className="crm-table-th" style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => {
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
                          <div className="user-action-menu-container" style={{ display: 'inline-block', position: 'relative' }}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveActionMenuId(activeActionMenuId === u.id ? null : u.id);
                              }}
                              title="Actions"
                              className="crm-modal-close-btn"
                              style={{ padding: '6px' }}
                            >
                              <MoreVertical size={16} />
                            </button>

                            {activeActionMenuId === u.id && (
                              <div className="crm-popover-card" style={{ width: '200px', right: 0, top: 'calc(100% + 4px)' }}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveActionMenuId(null);
                                    openEditModal(u);
                                  }}
                                  className="crm-popover-btn"
                                >
                                  <Edit3 size={14} color="var(--accent-emerald)" /> Edit Profile & Role
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveActionMenuId(null);
                                    openResetModal(u);
                                  }}
                                  className="crm-popover-btn"
                                >
                                  <Key size={14} color="var(--accent-gold)" /> Reset Password
                                </button>

                                <div style={{ height: '1px', background: 'var(--crm-border-subtle)', margin: '4px 0' }} />

                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveActionMenuId(null);
                                    handleToggleUserStatus(u);
                                  }}
                                  className="crm-popover-btn danger"
                                >
                                  {u.isActive ? (
                                    <>
                                      <UserX size={14} /> Deactivate User
                                    </>
                                  ) : (
                                    <>
                                      <UserCheck size={14} color="var(--crm-success)" /> Activate User
                                    </>
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
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
      </div>

      {/* 1. Modal: Add New Employee / Manager */}
      {showCreateModal && (
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
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden'
          }}>
            <div style={{
              background: '#ffffff',
              padding: '1.25rem 1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid #e2e8f0'
            }}>
              <div>
                <h3 style={{ fontSize: '1.18rem', fontWeight: 700, margin: 0, color: '#0f2b48', letterSpacing: '-0.2px' }}>
                  Add New Employee / Manager
                </h3>
                <p style={{ margin: '3px 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                  Generate username and temporary login credentials
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{ 
                  background: '#f8fafc', 
                  border: '1px solid #e2e8f0', 
                  color: '#64748b', 
                  cursor: 'pointer',
                  borderRadius: '8px',
                  padding: '6px',
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

            <form onSubmit={handleCreateSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {errorMsg && (
                <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '8px 12px', borderRadius: '8px', fontSize: '0.85rem' }}>
                  {errorMsg}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={createUserForm.fullName}
                    onChange={(e) => setCreateUserForm({ ...createUserForm, fullName: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Employee Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. EMP105 (auto if blank)"
                    value={createUserForm.employeeCode}
                    onChange={(e) => setCreateUserForm({ ...createUserForm, employeeCode: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Official Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. advisor@aadhiraksha.com"
                    value={createUserForm.email}
                    onChange={(e) => setCreateUserForm({ ...createUserForm, email: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 9848012345"
                    value={createUserForm.phoneNumber}
                    onChange={(e) => setCreateUserForm({ ...createUserForm, phoneNumber: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    System Role *
                  </label>
                  <select
                    value={createUserForm.role}
                    onChange={(e) => setCreateUserForm({ ...createUserForm, role: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', background: '#ffffff' }}
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
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Assign to Manager
                  </label>
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
                    <option value="">Direct / None</option>
                    {managers.map(m => (
                      <option key={m.id} value={m.id}>{m.fullName} ({m.email})</option>
                    ))}
                  </select>
                </div>
              </div>

              {createUserForm.role === 'ROLE_SUPER_ADMIN' && (
                <div style={{
                  background: '#fef3c7',
                  border: '1px solid #fde68a',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  fontSize: '0.78rem',
                  color: '#92400e'
                }}>
                  <ShieldCheck size={16} color="#d97706" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <strong>Super Admin Access Notice:</strong> This user will have unrestricted global governance over all branch financials, pipelines, cashless hospitals, and team credentials.
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
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
                      placeholder="Type custom department name..."
                      value={customCreateDeptText}
                      onChange={(e) => setCustomCreateDeptText(e.target.value)}
                      style={{ width: '100%', marginTop: '6px', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #0284c7', fontSize: '0.85rem' }}
                    />
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
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
                      style={{ width: '100%', marginTop: '6px', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #0284c7', fontSize: '0.85rem' }}
                    />
                  )}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Custom Password (optional)
                </label>
                <input
                  type="text"
                  placeholder="Leave blank to auto-generate"
                  value={createUserForm.password}
                  onChange={(e) => setCreateUserForm({ ...createUserForm, password: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ flex: 2, padding: '10px', borderRadius: '8px', border: 'none', background: '#059669', color: '#ffffff', fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer' }}
                >
                  {submitting ? 'Generating...' : 'Create User & Generate Credentials'}
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

    </div>
  );
}
