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
    // Google Firebase Phone Auth Settings
    firebaseEnabled: true,
    firebaseProjectId: 'aadhiraksha-insurance',
    firebaseApiKey: '',
    firebaseAuthDomain: '',
    firebaseAppId: '',
    firebaseStorageBucket: '',
    firebaseMessagingSenderId: '',

    // Twilio Programmable Messaging Settings (SMS OTPs & WhatsApp Broadcasts)
    twilioSmsEnabled: false,
    twilioAccountSid: '',
    twilioApiKeySid: '',
    twilioApiKeySecret: '',
    twilioFromNumber: '',

    // Twilio WhatsApp Messaging Settings (Agent Broadcasts, Launches & Offers)
    twilioWhatsappEnabled: false,
    twilioWhatsappFromNumber: 'whatsapp:+14155238886',
    twilioWhatsappContentSid: ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showFirebaseKey, setShowFirebaseKey] = useState(false);
  const [showTwilioSecret, setShowTwilioSecret] = useState(false);
  const [testPhone, setTestPhone] = useState('');
  const [isTestingWhatsApp, setIsTestingWhatsApp] = useState(false);
  const [testTwilioPhone, setTestTwilioPhone] = useState('');
  const [isTestingTwilio, setIsTestingTwilio] = useState(false);

  useEffect(() => {
    if (businessProfile) {
      setFormData(prev => ({
        ...prev,
        // Firebase Phone Auth
        firebaseEnabled: businessProfile.firebaseEnabled ?? true,
        firebaseProjectId: businessProfile.firebaseProjectId || 'aadhiraksha-insurance',
        firebaseApiKey: businessProfile.firebaseApiKey || '',
        firebaseAuthDomain: businessProfile.firebaseAuthDomain || '',
        firebaseAppId: businessProfile.firebaseAppId || '',
        firebaseStorageBucket: businessProfile.firebaseStorageBucket || '',
        firebaseMessagingSenderId: businessProfile.firebaseMessagingSenderId || '',

        // Twilio SMS Settings
        twilioSmsEnabled: businessProfile.twilioSmsEnabled ?? false,
        twilioAccountSid: businessProfile.twilioAccountSid || '',
        twilioApiKeySid: businessProfile.twilioApiKeySid || '',
        twilioApiKeySecret: businessProfile.twilioApiKeySecret || '',
        twilioFromNumber: businessProfile.twilioFromNumber || '',

        // Twilio WhatsApp Settings
        twilioWhatsappEnabled: businessProfile.twilioWhatsappEnabled ?? false,
        twilioWhatsappFromNumber: businessProfile.twilioWhatsappFromNumber || 'whatsapp:+14155238886',
        twilioWhatsappContentSid: businessProfile.twilioWhatsappContentSid || ''
      }));

      if (businessProfile.whatsappNumber || businessProfile.primaryPhone) {
        setTestPhone(prev => prev ? prev : (businessProfile.whatsappNumber || businessProfile.primaryPhone));
        setTestTwilioPhone(prev => prev ? prev : (businessProfile.whatsappNumber || businessProfile.primaryPhone));
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

  const handleTestTwilio = async () => {
    const cleanPhone = (testTwilioPhone || '').trim();
    if (!cleanPhone) {
      toast.error('Please enter a valid 10-digit mobile number to receive the test SMS.');
      return;
    }
    if (!formData.twilioAccountSid?.trim() || !formData.twilioApiKeySid?.trim() || !formData.twilioApiKeySecret?.trim() || !formData.twilioFromNumber?.trim()) {
      toast.error('Please configure Twilio Account SID, API Key SID (SK...), API Key Secret, and From Number before testing.');
      return;
    }

    setIsTestingTwilio(true);
    try {
      await portalService.updateBusinessProfile(formData);
      await refreshBusinessProfile();

      const res = await portalService.testTwilioSms(cleanPhone);
      if (res.success) {
        toast.success(`Success! Live test SMS dispatched via Twilio to ${cleanPhone}. Check your phone SMS!`);
      } else {
        toast.error(res.message || 'Failed to dispatch Twilio test SMS. Verify credentials.');
      }
    } catch (err) {
      console.error('Twilio Test error:', err);
      toast.error(err.response?.data?.message || 'Failed to dispatch Twilio SMS. Check Account SID, API Key SID, and API Key Secret.');
    } finally {
      setIsTestingTwilio(false);
    }
  };

  const handleTestWhatsApp = async () => {
    const cleanPhone = (testPhone || '').trim();
    if (!cleanPhone) {
      toast.error('Please enter a valid 10-digit mobile number to receive the test WhatsApp message.');
      return;
    }
    if (!formData.twilioAccountSid?.trim() || !formData.twilioApiKeySid?.trim() || !formData.twilioApiKeySecret?.trim() || !formData.twilioWhatsappFromNumber?.trim()) {
      toast.error('Please configure Twilio Account SID, API Key SID, API Key Secret, and WhatsApp Sender before testing.');
      return;
    }

    setIsTestingWhatsApp(true);
    try {
      await portalService.updateBusinessProfile(formData);
      await refreshBusinessProfile();

      const res = await portalService.testTwilioWhatsApp(cleanPhone);
      if (res.success) {
        toast.success(`Success! Live test WhatsApp message dispatched via Twilio to ${cleanPhone}. Check your WhatsApp!`);
      } else {
        toast.error(res.message || 'Failed to dispatch Twilio WhatsApp message.');
      }
    } catch (err) {
      console.error('Twilio WhatsApp Test error:', err);
      toast.error(err.response?.data?.message || 'Failed to dispatch WhatsApp message. Ensure recipient has joined Twilio Sandbox if testing in sandbox.');
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
      toast.success('Twilio SMS, Twilio WhatsApp & Firebase Auth settings saved successfully!');
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
        {/* INTEGRATION 2: TWILIO PROGRAMMABLE SMS (MOBILE OTP ENGINE) */}
        {/* ========================================================================= */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: formData.twilioSmsEnabled ? '2px solid #ef4444' : '1px solid #e2e8f0',
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
                background: '#fef2f2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ef4444'
              }}>
                <Zap size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f2b48', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>Twilio SMS Messaging (Public Form Mobile OTP Verification)</span>
                  {formData.twilioSmsEnabled ? (
                    <span style={{ fontSize: '0.72rem', background: '#fee2e2', color: '#b91c1c', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                      ● Active (Real SMS Dispatch)
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.72rem', background: '#f1f5f9', color: '#64748b', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                      ○ Inactive (Dev Mock Mode: Master OTP 123456)
                    </span>
                  )}
                </h3>
                <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '2px 0 0' }}>
                  Sends 6-digit cryptographic OTPs via Twilio SMS for Instant Quotes, Policy Renewals, Policy Porting, and POSP leads.
                </p>
              </div>
            </div>

            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none' }}>
              <input
                type="checkbox"
                name="twilioSmsEnabled"
                checked={formData.twilioSmsEnabled}
                onChange={handleChange}
                style={{ width: '18px', height: '18px', accentColor: '#ef4444', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>
                Enable Twilio SMS OTPs
              </span>
            </label>
          </div>

          {/* Form Fields Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Twilio Account SID
              </label>
              <input
                type="text"
                name="twilioAccountSid"
                value={formData.twilioAccountSid}
                onChange={handleChange}
                placeholder="ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
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
                Twilio API Key SID
              </label>
              <input
                type="text"
                name="twilioApiKeySid"
                value={formData.twilioApiKeySid}
                onChange={handleChange}
                placeholder="SKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>
                  Twilio API Key Secret
                </label>
                <button
                  type="button"
                  onClick={() => setShowTwilioSecret(!showTwilioSecret)}
                  style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}
                >
                  {showTwilioSecret ? <EyeOff size={13} /> : <Eye size={13} />}
                  <span>{showTwilioSecret ? 'Hide' : 'Reveal'}</span>
                </button>
              </div>
              <input
                type={showTwilioSecret ? 'text' : 'password'}
                name="twilioApiKeySecret"
                value={formData.twilioApiKeySecret}
                onChange={handleChange}
                placeholder="API Key Secret"
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
                Twilio From Number / Sender ID
              </label>
              <input
                type="text"
                name="twilioFromNumber"
                value={formData.twilioFromNumber}
                onChange={handleChange}
                placeholder="+1XXXXXXXXXX or AADHIRAKSHA"
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

          {/* Test Dispatch Panel */}
          <div style={{
            background: '#fff1f2',
            borderRadius: '12px',
            border: '1px solid #fecdd3',
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#9f1239', margin: '0 0 2px' }}>
                ⚡ Test Twilio SMS Delivery
              </h4>
              <p style={{ fontSize: '0.78rem', color: '#be123c', margin: 0 }}>
                Sends a live test SMS to verify your Account SID and Sender ID before enabling live OTPs for users.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span style={{ position: 'absolute', left: '10px', fontSize: '0.85rem', fontWeight: 700, color: '#9f1239' }}>
                  🇮🇳 +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  value={testTwilioPhone.replace(/\D/g, '').slice(-10)}
                  onChange={(e) => setTestTwilioPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="10-digit mobile"
                  style={{
                    padding: '8px 12px 8px 58px',
                    borderRadius: '8px',
                    border: '1px solid #fda4af',
                    background: '#ffffff',
                    fontSize: '0.88rem',
                    width: '180px'
                  }}
                />
              </div>

              <button
                type="button"
                onClick={handleTestTwilio}
                disabled={isTestingTwilio}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#e11d48',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: isTestingTwilio ? 'not-allowed' : 'pointer',
                  boxShadow: '0 2px 6px rgba(225, 29, 72, 0.25)',
                  transition: 'all 0.15s ease'
                }}
              >
                {isTestingTwilio ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Dispatching...</span>
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    <span>Send Test SMS</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ========================================================================= */}
        {/* INTEGRATION 3: TWILIO WHATSAPP MESSAGING & PROMOTIONAL BROADCASTS */}
        {/* ========================================================================= */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: formData.twilioWhatsappEnabled ? '2px solid #059669' : '1px solid #e2e8f0',
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
                  <span>Twilio WhatsApp API (Offers & Agent Broadcasts)</span>
                  {formData.twilioWhatsappEnabled ? (
                    <span style={{ fontSize: '0.72rem', background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                      ● Active (Twilio WhatsApp)
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.72rem', background: '#f1f5f9', color: '#64748b', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                      ○ Inactive (Mock Logging Mode)
                    </span>
                  )}
                </h3>
                <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '2px 0 0' }}>
                  Dispatches new policy launch announcements, commission boosters, and promo alerts to POSP agents and chosen groups using your Twilio account.
                </p>
              </div>
            </div>

            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none' }}>
              <input
                type="checkbox"
                name="twilioWhatsappEnabled"
                checked={formData.twilioWhatsappEnabled}
                onChange={handleChange}
                style={{ width: '18px', height: '18px', accentColor: '#059669', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: formData.twilioWhatsappEnabled ? '#059669' : '#475569' }}>
                Enable Twilio WhatsApp Broadcasts
              </span>
            </label>
          </div>

          {/* Configuration Note & Sender ID */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '1.25rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0369a1', fontWeight: 800, fontSize: '0.82rem', marginBottom: '6px' }}>
              <Info size={15} />
              <span>Unified Twilio Credentials</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#475569', margin: '0 0 1rem', lineHeight: 1.5 }}>
              This WhatsApp service automatically reuses your <strong>Twilio Account SID</strong>, <strong>API Key SID</strong>, and <strong>API Key Secret</strong> configured in the Twilio SMS card above. No separate third-party Meta tokens needed.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Twilio WhatsApp Sender Number (From)
                </label>
                <input
                  type="text"
                  name="twilioWhatsappFromNumber"
                  value={formData.twilioWhatsappFromNumber}
                  onChange={handleChange}
                  placeholder="whatsapp:+14155238886 (Sandbox) or whatsapp:+1XXXXXXXXXX"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    fontFamily: 'monospace'
                  }}
                />
                <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginTop: '4px' }}>
                  For free testing, use Twilio Sandbox: <code>whatsapp:+14155238886</code> (Send <em>join &lt;your-code&gt;</em> from your phone to this number to opt in).
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  WhatsApp Content Template SID (Optional / For Outbound)
                </label>
                <input
                  type="text"
                  name="twilioWhatsappContentSid"
                  value={formData.twilioWhatsappContentSid}
                  onChange={handleChange}
                  placeholder="HXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    fontFamily: 'monospace'
                  }}
                />
                <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginTop: '4px' }}>
                  Required by Meta when initiating WhatsApp outbound messages from custom phone numbers. Found in Twilio Content Editor.
                </span>
              </div>
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
                <span>1-Click Live Twilio WhatsApp Test</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#047857', margin: '2px 0 0' }}>
                Sends a live announcement test directly via Twilio WhatsApp API.
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
                    <span>Send Test WhatsApp</span>
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
