import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, 
  Shield, 
  Lock, 
  Plus, 
  Copy, 
  Edit3, 
  Trash2, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Layers, 
  Key, 
  X, 
  RefreshCw,
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  Check
} from 'lucide-react';
import { crmService } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function RolesAndPermissionsView() {
  const toast = useToast();

  const [roles, setRoles] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState(null);

  // Responsive layout state: detect mobile/tablet (< 1024px)
  const [isCompact, setIsCompact] = useState(() => 
    typeof window !== 'undefined' ? window.innerWidth < 1024 : false
  );
  // 'list' or 'detail' view on compact screens
  const [compactScreen, setCompactScreen] = useState('list');

  // Track expanded accordion modules for mobile inspection
  const [expandedModules, setExpandedModules] = useState(() => new Set());

  // Modal / Drawer state for creating / editing / cloning
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState('create'); // 'create' | 'edit' | 'clone'
  const [roleForm, setRoleForm] = useState({
    id: null,
    name: '',
    displayName: '',
    description: '',
    permissionCodes: new Set()
  });
  const [saving, setSaving] = useState(false);

  // Delete modal state
  const [roleToDelete, setRoleToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Window resize observer
  useEffect(() => {
    const handleResize = () => {
      const compact = window.innerWidth < 1024;
      setIsCompact(compact);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch initial roles & permissions
  const loadData = async () => {
    setLoading(true);
    try {
      const [rolesData, catalogData] = await Promise.all([
        crmService.getRbacRoles(),
        crmService.getPermissionsCatalog()
      ]);
      setRoles(rolesData || []);
      setCatalog(catalogData || []);
      
      // Auto-expand all modules initially
      if (catalogData && catalogData.length > 0) {
        setExpandedModules(new Set(catalogData.map(g => g.module)));
      }

      if (!selectedRole && rolesData && rolesData.length > 0) {
        setSelectedRole(rolesData[0]);
      } else if (selectedRole) {
        const refreshed = rolesData.find(r => r.id === selectedRole.id);
        if (refreshed) setSelectedRole(refreshed);
      }
    } catch (err) {
      console.error('Failed to load roles and permissions', err);
      toast.error('Failed to load RBAC roles and permissions catalog');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered roles list
  const filteredRoles = useMemo(() => {
    if (!searchQuery.trim()) return roles;
    const q = searchQuery.toLowerCase();
    return roles.filter(r => 
      (r.displayName && r.displayName.toLowerCase().includes(q)) ||
      (r.name && r.name.toLowerCase().includes(q)) ||
      (r.description && r.description.toLowerCase().includes(q))
    );
  }, [roles, searchQuery]);

  // Handle selecting a role
  const handleSelectRole = (role) => {
    setSelectedRole(role);
    if (isCompact) {
      setCompactScreen('detail');
    }
  };

  // Toggle module expansion in mobile accordion
  const toggleModuleAccordion = (moduleKey) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      if (next.has(moduleKey)) {
        next.delete(moduleKey);
      } else {
        next.add(moduleKey);
      }
      return next;
    });
  };

  // Open Editor for Creating New Role
  const handleOpenCreate = () => {
    setEditorMode('create');
    setRoleForm({
      id: null,
      name: '',
      displayName: '',
      description: '',
      permissionCodes: new Set(['leads:read', 'clients:read', 'quotes:read'])
    });
    setIsEditorOpen(true);
  };

  // Open Editor for Editing Existing Role
  const handleOpenEdit = (role) => {
    setEditorMode('edit');
    setRoleForm({
      id: role.id,
      name: role.name,
      displayName: role.displayName,
      description: role.description || '',
      permissionCodes: new Set(role.permissionCodes || [])
    });
    setIsEditorOpen(true);
  };

  // Open Editor for Cloning an existing Role
  const handleOpenClone = (role) => {
    setEditorMode('clone');
    setRoleForm({
      id: null,
      name: `${role.name.replace('ROLE_', '')}_COPY`,
      displayName: `${role.displayName} (Copy)`,
      description: `Custom cloned profile based on ${role.displayName}`,
      permissionCodes: new Set(role.permissionCodes || [])
    });
    setIsEditorOpen(true);
  };

  // Toggle individual permission in form
  const handleTogglePermission = (code) => {
    setRoleForm(prev => {
      const nextSet = new Set(prev.permissionCodes);
      if (nextSet.has(code)) {
        nextSet.delete(code);
      } else {
        nextSet.add(code);
      }
      return { ...prev, permissionCodes: nextSet };
    });
  };

  // Toggle entire module in form
  const handleToggleModule = (modulePermissions) => {
    setRoleForm(prev => {
      const nextSet = new Set(prev.permissionCodes);
      const allCodes = modulePermissions.map(p => p.code);
      const allSelected = allCodes.every(c => nextSet.has(c));

      if (allSelected) {
        allCodes.forEach(c => nextSet.delete(c));
      } else {
        allCodes.forEach(c => nextSet.add(c));
      }
      return { ...prev, permissionCodes: nextSet };
    });
  };

  // Save Role handler
  const handleSaveRole = async (e) => {
    e.preventDefault();
    if (!roleForm.displayName.trim()) {
      toast.error('Role display name is required');
      return;
    }
    if (roleForm.permissionCodes.size === 0) {
      toast.error('Please select at least one permission for this role');
      return;
    }

    setSaving(true);
    try {
      if (editorMode === 'edit') {
        const payload = {
          displayName: roleForm.displayName.trim(),
          description: roleForm.description ? roleForm.description.trim() : '',
          permissionCodes: Array.from(roleForm.permissionCodes)
        };
        const updated = await crmService.updateRbacRole(roleForm.id, payload);
        toast.success(`Role '${updated.displayName}' updated successfully!`);
        setIsEditorOpen(false);
        loadData();
      } else {
        const rawKey = roleForm.name.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '_');
        const formattedKey = rawKey.startsWith('ROLE_') ? rawKey : `ROLE_${rawKey}`;
        const payload = {
          name: formattedKey,
          displayName: roleForm.displayName.trim(),
          description: roleForm.description ? roleForm.description.trim() : '',
          permissionCodes: Array.from(roleForm.permissionCodes)
        };
        const created = await crmService.createRbacRole(payload);
        toast.success(`Custom role '${created.displayName}' created successfully!`);
        setIsEditorOpen(false);
        loadData();
        setSelectedRole(created);
        if (isCompact) {
          setCompactScreen('detail');
        }
      }
    } catch (err) {
      console.error('Failed to save role', err);
      const errMsg = err.response?.data?.message || 'Failed to save role. Please check unique key and inputs.';
      toast.error(errMsg);
    } finally {
      setSaving(false);
    }
  };

  // Delete Role handler
  const handleDeleteRole = async () => {
    if (!roleToDelete) return;
    setDeleting(true);
    try {
      await crmService.deleteRbacRole(roleToDelete.id);
      toast.success(`Role '${roleToDelete.displayName}' deleted successfully`);
      setRoleToDelete(null);
      loadData();
      if (selectedRole?.id === roleToDelete.id) {
        setSelectedRole(roles.find(r => r.id !== roleToDelete.id) || null);
        if (isCompact) {
          setCompactScreen('list');
        }
      }
    } catch (err) {
      console.error('Failed to delete role', err);
      const msg = err.response?.data?.message || 'Failed to delete role';
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
      {/* Top Native Header Bar */}
      <div 
        style={{
          background: 'var(--color-bg-surface, #ffffff)',
          borderRadius: '14px',
          border: '1px solid var(--color-border, #e2e8f0)',
          padding: isCompact ? '0.875rem 1rem' : '1.25rem 1.75rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: '1 1 auto' }}>
          <div 
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 3px 8px rgba(79, 70, 229, 0.22)',
              flexShrink: 0
            }}
          >
            <ShieldCheck size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
              <h1 style={{ margin: 0, fontSize: isCompact ? '1.05rem' : '1.25rem', fontWeight: 700, color: 'var(--color-text-primary, #0f172a)' }}>
                Roles & Access Control
              </h1>
              <span 
                style={{
                  fontSize: '0.675rem',
                  fontWeight: 600,
                  padding: '2px 7px',
                  borderRadius: '12px',
                  background: '#e0e7ff',
                  color: '#4338ca'
                }}
              >
                Zero-Trust
              </span>
            </div>
            <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.75rem', color: 'var(--color-text-muted, #64748b)' }}>
              Configure granular module authorizations and custom staff profiles.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0, marginLeft: 'auto' }}>
          <button
            onClick={loadData}
            title="Refresh Roles"
            className="native-touch-target"
            style={{
              padding: '0.45rem 0.75rem',
              borderRadius: '8px',
              border: '1px solid var(--color-border, #cbd5e1)',
              background: 'var(--color-bg-surface, #ffffff)',
              color: 'var(--color-text-secondary, #475569)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.8rem',
              fontWeight: 500
            }}
          >
            <RefreshCw size={13} />
            <span>Sync</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="native-touch-target"
            style={{
              padding: '0.45rem 0.95rem',
              borderRadius: '8px',
              border: 'none',
              background: 'var(--color-primary, #2563eb)',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)'
            }}
          >
            <Plus size={14} />
            <span>+ New Role</span>
          </button>
        </div>
      </div>

      {/* Main Native Master-Detail Container */}
      <div className="crm-master-detail-container">
        {/* Master Column: Role Directory (Visible on desktop or when compact screen is 'list') */}
        {(!isCompact || compactScreen === 'list') && (
          <div className="crm-master-list-pane">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-text-primary, #0f172a)' }}>
                Configured Roles ({roles.length})
              </h3>
            </div>

            {/* Search Filter */}
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'var(--color-bg-canvas, #f8fafc)',
                border: '1px solid var(--color-border, #e2e8f0)',
                borderRadius: '10px',
                padding: '0.5rem 0.75rem'
              }}
            >
              <Search size={15} style={{ color: 'var(--color-text-muted, #94a3b8)' }} />
              <input 
                type="text"
                placeholder="Search roles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  width: '100%',
                  fontSize: '0.825rem',
                  color: 'var(--color-text-primary, #0f172a)'
                }}
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8' }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Unified Compact Grouped List */}
            <div 
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                borderRadius: '12px',
                border: '1px solid var(--color-border, #e2e8f0)',
                background: 'var(--color-bg-surface, #ffffff)',
                overflow: 'hidden',
                maxHeight: isCompact ? 'none' : '650px', 
                overflowY: 'auto' 
              }}
            >
              {loading ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                  Loading system roles...
                </div>
              ) : filteredRoles.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                  No roles match your search.
                </div>
              ) : (
                filteredRoles.map((role, idx) => {
                  const isSelected = selectedRole?.id === role.id;
                  const isLast = idx === filteredRoles.length - 1;

                  return (
                    <div
                      key={role.id}
                      onClick={() => handleSelectRole(role)}
                      className="native-touch-target"
                      style={{
                        padding: '0.75rem 1rem',
                        borderBottom: isLast ? 'none' : '1px solid #f1f5f9',
                        background: isSelected && !isCompact ? 'rgba(37, 99, 235, 0.06)' : 'transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.75rem',
                        width: '100%',
                        boxSizing: 'border-box',
                        transition: 'background 0.15s ease'
                      }}
                    >
                      {/* Left: Indicator Dot + Two-Line Text Block */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0, flex: 1 }}>
                        <div 
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: role.isSystem ? '#3b82f6' : '#10b981',
                            flexShrink: 0
                          }} 
                        />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
                          {/* Line 1: Role Title */}
                          <span 
                            style={{ 
                              fontWeight: isSelected ? 700 : 600, 
                              fontSize: '0.875rem', 
                              color: isSelected ? '#1d4ed8' : 'var(--color-text-primary, #0f172a)'
                            }}
                          >
                            {role.displayName}
                          </span>

                          {/* Line 2: Subtle Metadata Subtitle */}
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {role.assignedUsersCount} {role.assignedUsersCount === 1 ? 'user' : 'users'} • {role.permissionCodes?.length || 0} permissions
                          </span>
                        </div>
                      </div>

                      {/* Right: Badge + Navigational Chevron */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                        {role.isSystem ? (
                          <span 
                            style={{
                              fontSize: '0.675rem',
                              fontWeight: 600,
                              padding: '2px 7px',
                              borderRadius: '8px',
                              background: '#f1f5f9',
                              color: '#475569',
                              border: '1px solid #cbd5e1'
                            }}
                          >
                            System
                          </span>
                        ) : (
                          <span 
                            style={{
                              fontSize: '0.675rem',
                              fontWeight: 600,
                              padding: '2px 7px',
                              borderRadius: '8px',
                              background: '#ecfdf5',
                              color: '#059669',
                              border: '1px solid #a7f3d0'
                            }}
                          >
                            Custom
                          </span>
                        )}

                        <ChevronRight size={16} color={isSelected ? '#2563eb' : '#94a3b8'} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Detail Column: Role Permissions Matrix Inspector */}
        {(!isCompact || compactScreen === 'detail') && (
          <div className="crm-detail-pane">
            {selectedRole ? (
              <>
                {/* Mobile Back Button Bar on Compact Screens */}
                {isCompact && (
                  <button
                    onClick={() => setCompactScreen('list')}
                    className="native-touch-target"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '0.4rem 0.75rem',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: 'var(--color-primary, #2563eb)',
                      cursor: 'pointer',
                      alignSelf: 'flex-start'
                    }}
                  >
                    <ArrowLeft size={15} />
                    <span>Back to Roles List</span>
                  </button>
                )}

                {/* Role Header & Actions */}
                <div 
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    borderBottom: '1px solid var(--color-border, #e2e8f0)',
                    paddingBottom: '1.25rem'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                      <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-text-primary, #0f172a)' }}>
                        {selectedRole.displayName}
                      </h2>
                      {selectedRole.isSystem ? (
                        <span 
                          style={{
                            fontSize: '0.725rem',
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: '10px',
                            background: '#f1f5f9',
                            color: '#475569',
                            border: '1px solid #cbd5e1',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px'
                          }}
                        >
                          <Lock size={11} /> System Archetype
                        </span>
                      ) : (
                        <span 
                          style={{
                            fontSize: '0.725rem',
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: '10px',
                            background: '#ecfdf5',
                            color: '#059669',
                            border: '1px solid #a7f3d0'
                          }}
                        >
                          Dynamic Custom Role
                        </span>
                      )}
                    </div>
                    <p style={{ margin: '0.3rem 0 0 0', fontSize: '0.825rem', color: '#64748b' }}>
                      {selectedRole.description || 'No description provided for this role.'}
                    </p>
                    <div style={{ marginTop: '0.4rem', display: 'flex', gap: '0.75rem', fontSize: '0.775rem', color: '#475569', flexWrap: 'wrap' }}>
                      <span>Key: <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>{selectedRole.name}</code></span>
                      <span>•</span>
                      <span>Active Users: <strong>{selectedRole.assignedUsersCount}</strong></span>
                    </div>
                  </div>

                  {/* Actions Buttons */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => handleOpenClone(selectedRole)}
                      className="native-touch-target"
                      title="Clone role"
                      style={{
                        padding: '0.4rem 0.75rem',
                        borderRadius: '8px',
                        border: '1px solid var(--color-border, #cbd5e1)',
                        background: 'var(--color-bg-surface, #ffffff)',
                        color: 'var(--color-text-secondary, #334155)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        fontSize: '0.775rem',
                        fontWeight: 600
                      }}
                    >
                      <Copy size={13} /> Clone
                    </button>

                    {!selectedRole.isSystem && (
                      <>
                        <button
                          onClick={() => handleOpenEdit(selectedRole)}
                          className="native-touch-target"
                          title="Edit Role"
                          style={{
                            padding: '0.4rem 0.75rem',
                            borderRadius: '8px',
                            border: '1px solid var(--color-border, #cbd5e1)',
                            background: 'var(--color-bg-surface, #ffffff)',
                            color: 'var(--color-primary, #2563eb)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            fontSize: '0.775rem',
                            fontWeight: 600
                          }}
                        >
                          <Edit3 size={13} /> Edit
                        </button>

                        <button
                          onClick={() => setRoleToDelete(selectedRole)}
                          className="native-touch-target"
                          title="Delete Role"
                          style={{
                            padding: '0.4rem 0.75rem',
                            borderRadius: '8px',
                            border: '1px solid #fee2e2',
                            background: '#fff5f5',
                            color: '#dc2626',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            fontSize: '0.775rem',
                            fontWeight: 600
                          }}
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Granular Permissions Breakdown grouped by Module */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-primary, #0f172a)' }}>
                      Permission Matrix ({selectedRole.permissionCodes?.length || 0} active grants)
                    </h3>
                    {selectedRole.name === 'ROLE_SUPER_ADMIN' && (
                      <span style={{ fontSize: '0.725rem', color: '#059669', fontWeight: 600 }}>
                        ⚡ Unrestricted Root Access
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {catalog.map(group => {
                      const groupSelectedCount = group.permissions.filter(p => 
                        selectedRole.permissionCodes?.includes(p.code)
                      ).length;
                      const isExpanded = expandedModules.has(group.module);

                      return (
                        <div 
                          key={group.module}
                          style={{
                            border: '1px solid var(--color-border, #e2e8f0)',
                            borderRadius: '12px',
                            background: groupSelectedCount > 0 ? 'var(--color-bg-surface, #ffffff)' : '#fafafa',
                            overflow: 'hidden'
                          }}
                        >
                          {/* Module Accordion Header */}
                          <div 
                            onClick={() => toggleModuleAccordion(group.module)}
                            className="native-touch-target"
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '0.75rem 1rem',
                              cursor: 'pointer',
                              background: 'transparent',
                              width: '100%',
                              boxSizing: 'border-box'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <Layers size={15} style={{ color: groupSelectedCount > 0 ? 'var(--color-primary, #2563eb)' : '#94a3b8' }} />
                              <span style={{ fontWeight: 600, fontSize: '0.825rem', color: 'var(--color-text-primary, #0f172a)' }}>
                                {group.moduleName}
                              </span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                              <span 
                                style={{ 
                                  fontSize: '0.7rem', 
                                  fontWeight: 600,
                                  color: groupSelectedCount === group.permissions.length ? '#16a34a' : groupSelectedCount > 0 ? '#ca8a04' : '#94a3b8',
                                  background: groupSelectedCount > 0 ? '#f0fdf4' : '#f1f5f9',
                                  padding: '2px 7px',
                                  borderRadius: '8px'
                                }}
                              >
                                {groupSelectedCount} of {group.permissions.length} granted
                              </span>
                              {isExpanded ? <ChevronDown size={15} color="#64748b" /> : <ChevronRight size={15} color="#64748b" />}
                            </div>
                          </div>

                          {/* Expanded Permissions Grid */}
                          {isExpanded && (
                            <div 
                              style={{ 
                                padding: '0 1rem 1rem 1rem',
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', 
                                gap: '0.5rem',
                                borderTop: '1px solid #f1f5f9',
                                paddingTop: '0.75rem'
                              }}
                            >
                              {group.permissions.map(perm => {
                                const isGranted = selectedRole.permissionCodes?.includes(perm.code);
                                return (
                                  <div
                                    key={perm.id}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'flex-start',
                                      gap: '0.5rem',
                                      padding: '0.5rem 0.65rem',
                                      borderRadius: '8px',
                                      background: isGranted ? 'rgba(34, 197, 94, 0.08)' : 'transparent',
                                      border: isGranted ? '1px solid rgba(34, 197, 94, 0.3)' : '1px dashed #e2e8f0'
                                    }}
                                  >
                                    {isGranted ? (
                                      <CheckCircle2 size={14} style={{ color: '#16a34a', flexShrink: 0, marginTop: '2px' }} />
                                    ) : (
                                      <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '1.5px solid #cbd5e1', flexShrink: 0, marginTop: '2px' }} />
                                    )}
                                    <div>
                                      <div style={{ fontSize: '0.775rem', fontWeight: 600, color: isGranted ? '#1e293b' : '#94a3b8' }}>
                                        {perm.label}
                                      </div>
                                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                                        {perm.description}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                Select a role to inspect its permissions.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Role Editor Modal / Native Bottom-Sheet */}
      {isEditorOpen && (
        <div className="native-modal-backdrop">
          <div className="native-modal-dialog">
            {/* Sheet Drag Handle on mobile */}
            {isCompact && <div className="native-sheet-drag-handle" />}

            {/* Modal Header */}
            <div 
              style={{
                padding: '1.15rem 1.25rem',
                borderBottom: '1px solid var(--color-border, #e2e8f0)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div 
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: '#eff6ff',
                    color: '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Shield size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
                    {editorMode === 'create' && 'Create Dynamic Role'}
                    {editorMode === 'edit' && `Edit: ${roleForm.displayName}`}
                    {editorMode === 'clone' && 'Clone Existing Role'}
                  </h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: '#64748b' }}>
                    Define identifiers and toggle capability access.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="native-touch-target"
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSaveRole} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ padding: '1.25rem', overflowY: 'auto', maxHeight: 'calc(90vh - 140px)', display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                
                {/* Basic Meta Fields */}
                <div style={{ display: 'grid', gridTemplateColumns: isCompact ? '1fr' : '1fr 1fr', gap: '0.875rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                      Display Name <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. Senior Claims Specialist"
                      value={roleForm.displayName}
                      onChange={(e) => setRoleForm(prev => ({ ...prev, displayName: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '0.6rem 0.8rem',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.85rem',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                      Role System Key <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input 
                      type="text"
                      required
                      disabled={editorMode === 'edit'}
                      placeholder="e.g. CLAIMS_SPECIALIST"
                      value={roleForm.name}
                      onChange={(e) => setRoleForm(prev => ({ ...prev, name: e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '_') }))}
                      style={{
                        width: '100%',
                        padding: '0.6rem 0.8rem',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.85rem',
                        outline: 'none',
                        background: editorMode === 'edit' ? '#f1f5f9' : '#ffffff',
                        cursor: editorMode === 'edit' ? 'not-allowed' : 'text',
                        boxSizing: 'border-box',
                        fontFamily: 'monospace'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                    Role Description
                  </label>
                  <textarea 
                    rows={2}
                    placeholder="Briefly describe what responsibilities this role possesses..."
                    value={roleForm.description}
                    onChange={(e) => setRoleForm(prev => ({ ...prev, description: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.8rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                      resize: 'vertical'
                    }}
                  />
                </div>

                {/* Permissions Matrix Checklist */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.625rem' }}>
                    <label style={{ fontSize: '0.825rem', fontWeight: 700, color: '#0f172a' }}>
                      Granted Permissions ({roleForm.permissionCodes.size} selected)
                    </label>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {catalog.map(group => {
                      const allSelected = group.permissions.every(p => roleForm.permissionCodes.has(p.code));
                      const someSelected = group.permissions.some(p => roleForm.permissionCodes.has(p.code));

                      return (
                        <div 
                          key={group.module}
                          style={{
                            border: '1px solid #e2e8f0',
                            borderRadius: '10px',
                            padding: '0.75rem 0.875rem',
                            background: someSelected ? '#fafafa' : '#ffffff'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                            <span style={{ fontWeight: 600, fontSize: '0.825rem', color: '#1e293b' }}>
                              {group.moduleName}
                            </span>

                            <button
                              type="button"
                              onClick={() => handleToggleModule(group.permissions)}
                              style={{
                                border: 'none',
                                background: 'transparent',
                                color: '#2563eb',
                                fontSize: '0.725rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                padding: '2px 4px'
                              }}
                            >
                              {allSelected ? 'Deselect All' : 'Select All'}
                            </button>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '0.4rem' }}>
                            {group.permissions.map(perm => {
                              const checked = roleForm.permissionCodes.has(perm.code);
                              return (
                                <label
                                  key={perm.id}
                                  className="native-touch-target"
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.45rem',
                                    fontSize: '0.775rem',
                                    padding: '0.35rem 0.5rem',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    background: checked ? '#eff6ff' : 'transparent',
                                    userSelect: 'none',
                                    width: '100%',
                                    boxSizing: 'border-box'
                                  }}
                                >
                                  <input 
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => handleTogglePermission(perm.code)}
                                    style={{ cursor: 'pointer' }}
                                  />
                                  <span style={{ fontWeight: checked ? 600 : 400, color: checked ? '#1d4ed8' : '#334155' }}>
                                    {perm.label}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Modal / Sheet Sticky Footer */}
              <div 
                style={{
                  padding: '0.875rem 1.25rem',
                  borderTop: '1px solid var(--color-border, #e2e8f0)',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.625rem',
                  background: 'var(--color-bg-canvas, #f8fafc)'
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  disabled={saving}
                  className="native-touch-target"
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#475569',
                    fontSize: '0.825rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="native-touch-target"
                  style={{
                    padding: '0.5rem 1.25rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'var(--color-primary, #2563eb)',
                    color: '#ffffff',
                    fontSize: '0.825rem',
                    fontWeight: 600,
                    cursor: saving ? 'not-allowed' : 'pointer'
                  }}
                >
                  {saving ? 'Saving...' : editorMode === 'edit' ? 'Update Role' : 'Create Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal / Bottom-Sheet */}
      {roleToDelete && (
        <div className="native-modal-backdrop">
          <div 
            className="native-modal-dialog"
            style={{ maxWidth: '460px', padding: '1.25rem' }}
          >
            {isCompact && <div className="native-sheet-drag-handle" style={{ marginBottom: '0.75rem' }} />}

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: '#dc2626' }}>
              <AlertCircle size={24} />
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
                Delete Custom Role?
              </h3>
            </div>

            <p style={{ margin: '0.75rem 0', fontSize: '0.825rem', color: '#475569', lineHeight: 1.5 }}>
              Are you sure you want to permanently delete <strong>{roleToDelete.displayName}</strong> (<code>{roleToDelete.name}</code>)?
            </p>

            {roleToDelete.assignedUsersCount > 0 ? (
              <div 
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '8px',
                  padding: '0.65rem 0.75rem',
                  fontSize: '0.775rem',
                  color: '#991b1b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                <span>
                  <strong>Blocked:</strong> There are <strong>{roleToDelete.assignedUsersCount}</strong> active user(s) currently assigned. Please reassign their roles first.
                </span>
              </div>
            ) : (
              <div 
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '0.65rem 0.75rem',
                  fontSize: '0.775rem',
                  color: '#64748b'
                }}
              >
                This action cannot be undone. Users will no longer inherit this role.
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.625rem', marginTop: '1rem' }}>
              <button
                type="button"
                onClick={() => setRoleToDelete(null)}
                disabled={deleting}
                className="native-touch-target"
                style={{
                  padding: '0.5rem 0.875rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#475569',
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteRole}
                disabled={deleting || roleToDelete.assignedUsersCount > 0}
                className="native-touch-target"
                style={{
                  padding: '0.5rem 1.15rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: roleToDelete.assignedUsersCount > 0 ? '#fca5a5' : '#dc2626',
                  color: '#ffffff',
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  cursor: roleToDelete.assignedUsersCount > 0 || deleting ? 'not-allowed' : 'pointer'
                }}
              >
                {deleting ? 'Deleting...' : 'Delete Role'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
