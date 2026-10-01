import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  MessageSquare, 
  Smartphone, 
  KeyRound, 
  Save, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Send, 
  Zap, 
  Lock,
  ExternalLink,
  ShieldAlert,
  Info
} from 'lucide-react';
import { portalService } from '../../services/api';
import { useBusinessProfile } from '../../context/BusinessProfileContext';
import { useToast } from '../../context/ToastContext';

export default function IntegrationsSettingsView() {
  const { businessProfile, refreshBusinessProfile } = useBusinessProfile();
  const toast = useToast();

  const [formData, setFormData] = useState({
    // Meta WhatsApp Cloud API Settings
    whatsappEnabled: false,
    whatsappApiUrl: 'https://graph.facebook.com/v19.0',
    whatsappPhoneNumberId: '',
    whatsappAccessToken: '',
    whatsappBusinessAccountId: '',
    notifyLeadsOnWhatsapp: true,
    notifyClaimsOnWhatsapp: true,
    notifyDocsOnWhatsapp: true,

    // Google Firebase Phone Auth Settings
    firebaseEnabled: true,
    firebaseProjectId: 'aadhiraksha-insurance',
    firebaseApiKey: '',
    firebaseAuthDomain: '',
    firebaseAppId: '',
    firebaseStorageBucket: '',
    firebaseMessagingSenderId: ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showWhatsappToken, setShowWhatsappToken] = useState(false);
  const [showFirebaseKey, setShowFirebaseKey] = useState(false);
  const [testPhone, setTestPhone] = useState('');
  const [isTestingWhatsApp, setIsTestingWhatsApp] = useState(false);

  useEffect(() => {
    if (businessProfile) {
      setFormData(prev => ({
        ...prev,
        // Meta WhatsApp
        whatsappEnabled: businessProfile.whatsappEnabled ?? false,
        whatsappApiUrl: businessProfile.whatsappApiUrl || 'https://graph.facebook.com/v19.0',
        whatsappPhoneNumberId: businessProfile.whatsappPhoneNumberId || '',
        whatsappAccessToken: businessProfile.whatsappAccessToken || '',
        whatsappBusinessAccountId: businessProfile.whatsappBusinessAccountId || '',
        notifyLeadsOnWhatsapp: businessProfile.notifyLeadsOnWhatsapp ?? true,
        notifyClaimsOnWhatsapp: businessProfile.notifyClaimsOnWhatsapp ?? true,
        notifyDocsOnWhatsapp: businessProfile.notifyDocsOnWhatsapp ?? true,

        // Firebase Phone Auth
        firebaseEnabled: businessProfile.firebaseEnabled ?? true,
        firebaseProjectId: businessProfile.firebaseProjectId || 'aadhiraksha-insurance',
        firebaseApiKey: businessProfile.firebaseApiKey || '',
        firebaseAuthDomain: businessProfile.firebaseAuthDomain || '',
        firebaseAppId: businessProfile.firebaseAppId || '',
        firebaseStorageBucket: businessProfile.firebaseStorageBucket || '',
        firebaseMessagingSenderId: businessProfile.firebaseMessagingSenderId || ''
      }));

      if (businessProfile.whatsappNumber || businessProfile.primaryPhone) {
        setTestPhone(businessProfile.whatsappNumber || businessProfile.primaryPhone);
      }
    }
  }, [businessProfile]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleTestWhatsApp = async () => {
    const cleanPhone = (testPhone || '').trim();
    if (!cleanPhone) {
      toast.error('Please enter a valid 10-digit mobile number to receive the test WhatsApp message.');
      return;
    }
    if (!formData.whatsappPhoneNumberId?.trim() || !formData.whatsappAccessToken?.trim()) {
      toast.error('Please configure both Meta Phone Number ID and Access Token before testing.');
      return;
    }

    setIsTestingWhatsApp(true);
    try {
      // First save current form data to database so test endpoint uses current credentials
      await portalService.updateBusinessProfile(formData);
      await refreshBusinessProfile();

      const res = await portalService.testWhatsAppMessage(cleanPhone);
      if (res.success) {
        toast.success(`Success! Live test WhatsApp message dispatched to ${cleanPhone}. Check your WhatsApp!`);
      } else {
        toast.error(res.message || 'Failed to dispatch test message. Verify Meta credentials.');
      }
    } catch (err) {
      console.error('WhatsApp Test error:', err);
      toast.error(err.response?.data?.message || 'Failed to dispatch test message. Check Meta Phone ID & Token.');
    } finally {
      setIsTestingWhatsApp(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await portalService.updateBusinessProfile(formData);
      await refreshBusinessProfile();
      toast.success('Integrations, Firebase Auth & Meta WhatsApp settings saved successfully!');
    } catch (err) {
      console.error('Failed to update integrations settings:', err);
      toast.error('Failed to save settings: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Top Header Banner */}
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        padding: '1.5rem',
        boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#2563eb'
          }}>
            <Cpu size={26} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f2b48', margin: '0 0 2px' }}>
              Integrations & Cloud Communications
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
              Centrally configure Google Firebase Phone Auth (SMS OTP) and Meta WhatsApp Cloud API credentials with zero-downtime hot reloading.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={async () => {
            setIsLoading(true);
            await refreshBusinessProfile();
            setIsLoading(false);
            toast.success('Integration settings refreshed from server.');
          }}
          disabled={isLoading || isSaving}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            padding: '8px 14px',
            fontSize: '0.82rem',
            fontWeight: 700,
            color: '#334155',
            cursor: 'pointer'
          }}
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* ========================================================================= */}
        {/* INTEGRATION 1: GOOGLE FIREBASE PHONE AUTHENTICATION (SMS OTP) */}
        {/* ========================================================================= */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: formData.firebaseEnabled ? '2px solid #3b82f6' : '1px solid #e2e8f0',
          padding: '1.5rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
          transition: 'all 0.2s ease'
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: '#eff6ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563eb'
              }}>
                <Smartphone size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f2b48', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>Google Firebase Phone Authentication (SMS OTP)</span>
                  {formData.firebaseEnabled ? (
                    <span style={{ fontSize: '0.72rem', background: '#dbeafe', color: '#1d4ed8', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                      ● Active (10,000 Free OTPs/mo)
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.72rem', background: '#f1f5f9', color: '#64748b', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                      ○ Disabled (Password Mode Only)
                    </span>
                  )}
                </h3>
                <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '2px 0 0' }}>
                  Powers passwordless 1-tap mobile OTP registration and login for customers and POSP partners.
                </p>
              </div>
            </div>

            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none' }}>
              <input
                type="checkbox"
                name="firebaseEnabled"
                checked={formData.firebaseEnabled}
                onChange={handleChange}
                style={{ width: '18px', height: '18px', accentColor: '#2563eb', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: formData.firebaseEnabled ? '#2563eb' : '#475569' }}>
                Enable Mobile Phone OTP Login
              </span>
            </label>
          </div>

          {/* Policy Information Box */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '10px 14px',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#334155' }}>
              <Info size={16} color="#0284c7" />
              <span>
                <strong>Session Policy:</strong> Policyholders stay logged in for <strong>30 Days</strong> (lowering OTP verification costs by 90%+). Staff sessions expire in <strong>24 Hours</strong>.
              </span>
            </div>
            <a 
              href="https://console.firebase.google.com/" 
              target="_blank" 
              rel="noreferrer" 
              style={{ fontSize: '0.78rem', color: '#2563eb', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              Open Firebase Console <ExternalLink size={12} />
            </a>
          </div>

          {/* Form Fields */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Firebase Project ID
              </label>
              <input
                type="text"
                name="firebaseProjectId"
                value={formData.firebaseProjectId}
                onChange={handleChange}
                placeholder="aadhiraksha-insurance"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem',
                  fontFamily: 'monospace'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Auth Domain
              </label>
              <input
                type="text"
                name="firebaseAuthDomain"
                value={formData.firebaseAuthDomain}
                onChange={handleChange}
                placeholder="aadhiraksha-insurance.firebaseapp.com"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem',
                  fontFamily: 'monospace'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Web API Key (apiKey)
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type={showFirebaseKey ? 'text' : 'password'}
                  name="firebaseApiKey"
                  value={formData.firebaseApiKey}
                  onChange={handleChange}
                  placeholder="AIzaSy..."
                  style={{
                    width: '100%',
                    padding: '8px 40px 8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    fontFamily: 'monospace'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowFirebaseKey(!showFirebaseKey)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#64748b'
                  }}
                  title={showFirebaseKey ? 'Hide Key' : 'Show Key'}
                >
                  {showFirebaseKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Web App ID (appId)
              </label>
              <input
                type="text"
                name="firebaseAppId"
                value={formData.firebaseAppId}
                onChange={handleChange}
                placeholder="1:123456789012:web:abcdef..."
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem',
                  fontFamily: 'monospace'
                }}
              />
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* INTEGRATION 2: META WHATSAPP CLOUD API & NOTIFICATIONS */}
        {/* ========================================================================= */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: formData.whatsappEnabled ? '2px solid #10b981' : '1px solid #e2e8f0',
          padding: '1.5rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
          transition: 'all 0.2s ease'
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: '#ecfdf5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#059669'
              }}>
                <MessageSquare size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f2b48', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>Meta WhatsApp Cloud API (Transactional Messages)</span>
                  {formData.whatsappEnabled ? (
                    <span style={{ fontSize: '0.72rem', background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                      ● Active (1,000 Free Convs/mo)
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.72rem', background: '#f1f5f9', color: '#64748b', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                      ○ Inactive (Mock Logging Mode)
                    </span>
                  )}
                </h3>
                <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '2px 0 0' }}>
                  Dispatches official transactional insurance updates, claim numbers, and quote follow-ups with 98%+ open rates.
                </p>
              </div>
            </div>

            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none' }}>
              <input
                type="checkbox"
                name="whatsappEnabled"
                checked={formData.whatsappEnabled}
                onChange={handleChange}
                style={{ width: '18px', height: '18px', accentColor: '#059669', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: formData.whatsappEnabled ? '#059669' : '#475569' }}>
                Enable Live WhatsApp Sending
              </span>
            </label>
          </div>

          {/* Credentials Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Meta Phone Number ID
              </label>
              <input
                type="text"
                name="whatsappPhoneNumberId"
                value={formData.whatsappPhoneNumberId}
                onChange={handleChange}
                placeholder="e.g. 105938472910482"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem',
                  fontFamily: 'monospace'
                }}
              />
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                Found in Meta for Developers &rarr; WhatsApp &rarr; API Setup
              </span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                WhatsApp Business Account ID (WABA)
              </label>
              <input
                type="text"
                name="whatsappBusinessAccountId"
                value={formData.whatsappBusinessAccountId}
                onChange={handleChange}
                placeholder="e.g. 192837465019283"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem',
                  fontFamily: 'monospace'
                }}
              />
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                Found in Meta Business Manager Settings &rarr; WhatsApp Accounts
              </span>
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Permanent Graph API Access Token (System User Bearer Token)
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type={showWhatsappToken ? 'text' : 'password'}
                  name="whatsappAccessToken"
                  value={formData.whatsappAccessToken}
                  onChange={handleChange}
                  placeholder="EAAG..."
                  style={{
                    width: '100%',
                    padding: '8px 40px 8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    fontFamily: 'monospace'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowWhatsappToken(!showWhatsappToken)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#64748b'
                  }}
                  title={showWhatsappToken ? 'Hide Token' : 'Show Token'}
                >
                  {showWhatsappToken ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                Meta Business Settings &rarr; System Users &rarr; Generate Token with <code>whatsapp_business_messaging</code> permission.
              </span>
            </div>
          </div>

          {/* Automated Event Trigger Toggles */}
          <div style={{
            background: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '1rem',
            marginBottom: '1.25rem'
          }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              ⚡ Notification Event Matrix
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.75rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#334155', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="notifyLeadsOnWhatsapp"
                  checked={formData.notifyLeadsOnWhatsapp}
                  onChange={handleChange}
                  style={{ accentColor: '#059669', width: '16px', height: '16px' }}
                />
                <span>Quote Inquiries (Instant Welcome & Advisor Connect)</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#334155', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="notifyClaimsOnWhatsapp"
                  checked={formData.notifyClaimsOnWhatsapp}
                  onChange={handleChange}
                  style={{ accentColor: '#059669', width: '16px', height: '16px' }}
                />
                <span>Claim Submissions (Intimation Number & Cashless Desk)</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#334155', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="notifyDocsOnWhatsapp"
                  checked={formData.notifyDocsOnWhatsapp}
                  onChange={handleChange}
                  style={{ accentColor: '#059669', width: '16px', height: '16px' }}
                />
                <span>Document Vault Updates (Approval & Re-upload Notices)</span>
              </label>
            </div>
          </div>

          {/* 1-Click Live Connection Test Tool */}
          <div style={{
            background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
            border: '1px solid #a7f3d0',
            borderRadius: '12px',
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#065f46', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Zap size={16} color="#059669" />
                <span>1-Click Live WhatsApp Delivery Test</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#047857', margin: '2px 0 0' }}>
                Send a real test WhatsApp message immediately to verify your credentials against Meta's Graph API.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span style={{ position: 'absolute', left: '10px', fontSize: '0.85rem', fontWeight: 700, color: '#065f46' }}>
                  🇮🇳 +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  value={testPhone.replace(/\D/g, '').slice(-10)}
                  onChange={(e) => setTestPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="10-digit mobile"
                  style={{
                    padding: '8px 12px 8px 58px',
                    borderRadius: '8px',
                    border: '1px solid #6ee7b7',
                    background: '#ffffff',
                    fontSize: '0.88rem',
                    width: '180px'
                  }}
                />
              </div>

              <button
                type="button"
                onClick={handleTestWhatsApp}
                disabled={isTestingWhatsApp}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#059669',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: isTestingWhatsApp ? 'not-allowed' : 'pointer',
                  boxShadow: '0 2px 6px rgba(5, 150, 105, 0.25)',
                  transition: 'all 0.15s ease'
                }}
              >
                {isTestingWhatsApp ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Dispatching...</span>
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    <span>Send Test Message</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Global Save Button */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: '12px',
          background: '#ffffff',
          borderRadius: '14px',
          padding: '1rem 1.5rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
        }}>
          <button
            type="submit"
            disabled={isSaving}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              padding: '10px 24px',
              fontSize: '0.9rem',
              fontWeight: 800,
              cursor: isSaving ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
              transition: 'all 0.15s ease'
            }}
          >
            {isSaving ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                <span>Saving Integrations...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Save Integrations & Cloud Settings</span>
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
}
