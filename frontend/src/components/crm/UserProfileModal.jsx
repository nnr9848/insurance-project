import React, { useState, useEffect } from 'react';
import { 
  User, 
  Lock, 
  Shield, 
  X, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  KeyRound, 
  Mail, 
  Phone, 
  Building2, 
  BadgeCheck,
  Eye,
  EyeOff,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authService, crmService } from '../../services/api';

export default function UserProfileModal({ isOpen, onClose, defaultTab = 'profile' }) {
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState(defaultTab); // 'profile' | 'security'
  
  // Profile form state
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [email, setEmail] = useState(user?.email || '');
  
  // Password change state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null); // { type: 'success' | 'error', text: '' }

  // Sync state on modal open
  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab || 'profile');
      setFullName(user?.fullName || '');
      setPhoneNumber(user?.phoneNumber || '');
      setEmail(user?.email || '');
      setNewPassword('');
      setConfirmPassword('');
      setStatusMessage(null);
    }
  }, [isOpen, defaultTab, user]);

  if (!isOpen) return null;

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!newPassword || newPassword.length < 6) {
      setStatusMessage({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatusMessage({ type: 'error', text: 'New password and confirm password do not match.' });
      return;
    }

    setIsSaving(true);
    try {
      if (user?.id) {
        await crmService.resetPassword(user.id, newPassword);
      }
      setStatusMessage({ type: 'success', text: 'Password updated successfully!' });
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('Failed to change password:', err);
      setStatusMessage({ 
        type: 'error', 
        text: err.response?.data?.message || 'Failed to update password. Please try again.' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  const primaryRole = user?.role || (Array.isArray(user?.roles) ? user.roles[0] : 'ROLE_SUPER_ADMIN') || 'ROLE_SUPER_ADMIN';
  const roleLabel = primaryRole.replace('ROLE_', '').replace(/_/g, ' ');

  return (
    <div className="crm-modal-overlay">
      <div className="crm-modal-card">
        {/* Crisp Light Modal Header */}
        <div className="crm-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="crm-modal-avatar">
              {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h3 className="crm-modal-title">
                Account & Security Settings
              </h3>
              <div className="crm-modal-subtitle">
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.2rem',
                  fontWeight: 700,
                  color: 'var(--crm-info)',
                  background: 'var(--crm-info-bg)',
                  padding: '0.1rem 0.45rem',
                  borderRadius: '999px',
                  fontSize: '0.65rem'
                }}>
                  <ShieldCheck size={11} /> {roleLabel}
                </span>
                <span>• ID: {user?.id ? `#EMP-${user.id}` : 'Active'}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            title="Close Settings"
            className="crm-modal-close-btn"
          >
            <X size={18} />
          </button>
        </div>

        {/* Apple/Linear-Style Segmented Tab Pill Bar */}
        <div className="crm-segmented-control">
          <button
            onClick={() => { setActiveTab('profile'); setStatusMessage(null); }}
            className={`crm-segmented-btn ${activeTab === 'profile' ? 'active' : ''}`}
          >
            <User size={15} color={activeTab === 'profile' ? 'var(--accent-gold)' : 'currentColor'} />
            <span>My Profile</span>
          </button>

          <button
            onClick={() => { setActiveTab('security'); setStatusMessage(null); }}
            className={`crm-segmented-btn ${activeTab === 'security' ? 'active' : ''}`}
          >
            <KeyRound size={15} color={activeTab === 'security' ? 'var(--accent-emerald)' : 'currentColor'} />
            <span>Security & Password</span>
          </button>

          <button
            onClick={() => { setActiveTab('preferences'); setStatusMessage(null); }}
            className={`crm-segmented-btn ${activeTab === 'preferences' ? 'active' : ''}`}
          >
            <ShieldCheck size={15} color={activeTab === 'preferences' ? '#7c3aed' : 'currentColor'} />
            <span>Sandbox & Data Engine</span>
          </button>
        </div>

        {/* Status Toast Alert */}
        {statusMessage && (
          <div style={{
            margin: '0.75rem 1.25rem 0',
            padding: '0.65rem 0.85rem',
            borderRadius: '10px',
            fontSize: '0.8rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: statusMessage.type === 'success' ? 'var(--crm-success-bg)' : 'var(--crm-danger-bg)',
            color: statusMessage.type === 'success' ? 'var(--accent-emerald-dark)' : 'var(--crm-danger)',
            border: `1px solid ${statusMessage.type === 'success' ? 'var(--crm-success-border)' : 'var(--crm-danger-border)'}`
          }}>
            {statusMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="crm-modal-body">
          
          {/* TAB 1: PROFILE INFO */}
          {activeTab === 'profile' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {/* User Overview Pill Box */}
              <div style={{
                background: 'var(--crm-surface-muted)',
                padding: '0.85rem 1rem',
                borderRadius: '12px',
                border: '1px solid var(--crm-border-subtle)',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.75rem',
                fontSize: '0.8rem'
              }}>
                <div>
                  <span style={{ color: 'var(--crm-text-muted)', fontSize: '0.72rem', fontWeight: 600 }}>Role Level</span>
                  <div style={{ fontWeight: 800, color: 'var(--crm-text-primary)', marginTop: '2px' }}>{roleLabel}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--crm-text-muted)', fontSize: '0.72rem', fontWeight: 600 }}>Account Status</span>
                  <div style={{ fontWeight: 800, color: 'var(--accent-emerald)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-emerald)' }} />
                    Active & Verified
                  </div>
                </div>
              </div>

              {/* Full Name */}
              <div className="crm-form-group">
                <label className="crm-form-label">
                  Full Name
                </label>
                <div className="crm-input-box">
                  <User size={16} color="var(--crm-text-muted)" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your name"
                    className="crm-input-field"
                  />
                </div>
              </div>

              {/* Email (Read Only) */}
              <div className="crm-form-group">
                <label className="crm-form-label">
                  Official Email Address
                </label>
                <div className="crm-input-box">
                  <Mail size={16} color="var(--crm-text-muted)" />
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="crm-input-field"
                  />
                </div>
                <span className="crm-input-helper">
                  Primary authentication login identifier.
                </span>
              </div>

              {/* Phone Number */}
              <div className="crm-form-group">
                <label className="crm-form-label">
                  Contact Phone Number
                </label>
                <div className="crm-input-box">
                  <Phone size={16} color="var(--crm-text-muted)" />
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+91 9876543210"
                    className="crm-input-field"
                  />
                </div>
              </div>

              {/* Save Profile Button */}
              <button
                type="button"
                disabled={isSaving}
                onClick={async () => {
                  setIsSaving(true);
                  setStatusMessage(null);
                  try {
                    if (user?.id) {
                      await crmService.updateUser(user.id, {
                        fullName,
                        phoneNumber,
                        isActive: true
                      });
                    }
                    setStatusMessage({ type: 'success', text: 'Profile details saved successfully!' });
                  } catch (err) {
                    console.error('Failed to update profile:', err);
                    setStatusMessage({ 
                      type: 'error', 
                      text: err.response?.data?.message || 'Failed to save profile changes.' 
                    });
                  } finally {
                    setIsSaving(false);
                  }
                }}
                className="crm-primary-btn"
                style={{ marginTop: '0.25rem' }}
              >
                <Save size={15} />
                {isSaving ? 'Saving Profile...' : 'Save Profile Changes'}
              </button>
            </div>
          )}

          {/* TAB 2: SECURITY & PASSWORD CHANGE */}
          {activeTab === 'security' && (
            <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              <div style={{
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                padding: '0.75rem 0.9rem',
                borderRadius: '12px',
                fontSize: '0.78rem',
                color: '#1e40af',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <Lock size={16} />
                <span>Keep your account secure by using a strong password with at least 6 characters.</span>
              </div>

              {/* New Password */}
              <div className="crm-form-group">
                <label className="crm-form-label">
                  New Password
                </label>
                <div className="crm-input-box">
                  <Lock size={16} color="var(--crm-text-muted)" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="crm-input-field"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    style={{ background: 'none', border: 'none', color: 'var(--crm-text-muted)', cursor: 'pointer', padding: 0 }}
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="crm-form-group">
                <label className="crm-form-label">
                  Confirm New Password
                </label>
                <div className="crm-input-box">
                  <KeyRound size={16} color="var(--crm-text-muted)" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-type new password"
                    className="crm-input-field"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="crm-emerald-btn"
                style={{ marginTop: '0.5rem' }}
              >
                <Save size={15} />
                {isSaving ? 'Updating Password...' : 'Update Password'}
              </button>
            </form>
          )}

          {/* TAB 3: SANDBOX & DATA ENGINE */}
          {activeTab === 'preferences' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              <div style={{
                background: '#faf5ff',
                border: '1px solid #e9d5ff',
                borderRadius: '10px',
                padding: '0.85rem 1rem',
                fontSize: '0.82rem',
                color: '#6b21a8',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem'
              }}>
                <ShieldCheck size={20} color="#7c3aed" />
                <div>
                  <div style={{ fontWeight: 800 }}>Sandbox & Enterprise Data Engine</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>
                    Reset, purge transactional test leads, or reseed realistic demo data across all CRM modules on-demand.
                  </div>
                </div>
              </div>

              {/* Action 1: Reseed Fresh Demo Data */}
              <div style={{
                background: '#ffffff',
                border: '1px solid var(--crm-border-subtle)',
                borderRadius: '12px',
                padding: '1.1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1rem',
                flexWrap: 'wrap'
              }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--crm-text-primary)' }}>
                    Reseed Fresh Demo Dataset
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--crm-text-muted)', marginTop: '2px' }}>
                    Populates CRM leads, quotes, KYC docs, approvals, and scheduled calls.
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isSaving}
                  onClick={async () => {
                    if (!window.confirm('Are you sure you want to reseed fresh demo data?')) return;
                    setIsSaving(true);
                    setStatusMessage(null);
                    try {
                      const res = await crmService.seedDemoData();
                      setStatusMessage({ type: 'success', text: res.message || 'Demo dataset reseeded afresh!' });
                      setTimeout(() => window.location.reload(), 1200);
                    } catch (err) {
                      setStatusMessage({ type: 'error', text: 'Failed to reseed data: ' + (err.response?.data?.message || err.message) });
                    } finally {
                      setIsSaving(false);
                    }
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #059669, #047857)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.55rem 1rem',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    boxShadow: '0 2px 6px rgba(5,150,105,0.25)'
                  }}
                >
                  <Save size={15} /> {isSaving ? 'Reseeding...' : 'Reseed Fresh Demo Data'}
                </button>
              </div>

              {/* Action 2: Purge All Demo Data Cleanly */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #fee2e2',
                borderRadius: '12px',
                padding: '1.1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1rem',
                flexWrap: 'wrap'
              }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#991b1b' }}>
                    Purge All Demo CRM Data
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                    Wipes all transactional leads, inquiries, proposals, and call logs with zero orphan records.
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isSaving}
                  onClick={async () => {
                    if (!window.confirm('DANGER: This will delete all demo leads, inquiries, and proposals! Continue?')) return;
                    setIsSaving(true);
                    setStatusMessage(null);
                    try {
                      const res = await crmService.purgeDemoData();
                      setStatusMessage({ type: 'success', text: res.message || 'All demo data purged cleanly.' });
                      setTimeout(() => window.location.reload(), 1200);
                    } catch (err) {
                      setStatusMessage({ type: 'error', text: 'Failed to purge data: ' + (err.response?.data?.message || err.message) });
                    } finally {
                      setIsSaving(false);
                    }
                  }}
                  style={{
                    background: '#ef4444',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.55rem 1rem',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <AlertCircle size={15} /> {isSaving ? 'Purging...' : 'Purge All Demo Data'}
                </button>
              </div>

            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="crm-modal-footer">
          <button
            onClick={onClose}
            className="crm-secondary-btn"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
