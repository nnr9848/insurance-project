import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  Info,
  Mail,
  FileText,
  Monitor,
  Smartphone as DeviceMobile,
  Check,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Edit3,
  Tag,
  Power,
  PowerOff
} from 'lucide-react';
import { portalService } from '../../services/api';
import { useBusinessProfile } from '../../context/BusinessProfileContext';
import { useToast } from '../../context/ToastContext';

export default function IntegrationsSettingsView() {
  const { businessProfile, refreshBusinessProfile } = useBusinessProfile();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  // Navigation tabs state: 'twilio-sms' | 'twilio-whatsapp' | 'email-smtp'
  const activeSubTab = searchParams.get('sub') || 'twilio-sms';

  const setSubTab = (tabId) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('sub', tabId);
      return next;
    });
  };

  const [formData, setFormData] = useState({
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

  // Track if current sub-tab has unsaved modifications
  const [dirtyTabs, setDirtyTabs] = useState({});

  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showFirebaseKey, setShowFirebaseKey] = useState(false);
  const [showTwilioSecret, setShowTwilioSecret] = useState(false);
  const [testPhone, setTestPhone] = useState('');
  const [isTestingWhatsApp, setIsTestingWhatsApp] = useState(false);
  const [testTwilioPhone, setTestTwilioPhone] = useState('');
  const [isTestingTwilio, setIsTestingTwilio] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [isTestingEmail, setIsTestingEmail] = useState(false);

  // Email Template Preview & Live Testing Console State
  const [emailTemplates, setEmailTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('smtp-diagnostic');
  const [templatePreviewHtml, setTemplatePreviewHtml] = useState('');
  const [previewDevice, setPreviewDevice] = useState('desktop'); // 'desktop' (600px) or 'mobile' (375px)
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isDispatchingTemplate, setIsDispatchingTemplate] = useState(false);

  useEffect(() => {
    if (businessProfile) {
      setFormData(prev => ({
        ...prev,
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

      // Reset dirty state on fresh load
      setDirtyTabs({});

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
    // Mark current active subtab as dirty
    setDirtyTabs(prev => ({ ...prev, [activeSubTab]: true }));
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
        toast.error(res.message || 'Failed to dispatch Twilio test WhatsApp. Verify sandbox opt-in.');
      }
    } catch (err) {
      console.error('Twilio WhatsApp Test error:', err);
      toast.error(err.response?.data?.message || 'Failed to dispatch WhatsApp message. Ensure recipient has joined Twilio Sandbox if testing in sandbox.');
    } finally {
      setIsTestingWhatsApp(false);
    }
  };

  // Fetch available templates on component mount
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const templates = await portalService.getEmailTemplates();
        if (Array.isArray(templates) && templates.length > 0) {
          setEmailTemplates(templates);
          setSelectedTemplateId(templates[0].id);
          fetchPreview(templates[0].id, templates[0].sampleData);
        }
      } catch (err) {
        console.error('Failed to load email templates catalogue:', err);
      }
    };
    fetchTemplates();
  }, []);

  const fetchPreview = async (templateId, variables) => {
    setIsLoadingPreview(true);
    try {
      const res = await portalService.previewEmailTemplate(templateId, variables);
      if (res.html) {
        setTemplatePreviewHtml(res.html);
      }
    } catch (err) {
      console.error('Failed to load template preview:', err);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const [isSavingTemplateConfig, setIsSavingTemplateConfig] = useState(false);
  const [editingSubjects, setEditingSubjects] = useState({});
  const [editingBodies, setEditingBodies] = useState({});
  const [activeTemplateTab, setActiveTemplateTab] = useState('preview'); // 'preview' | 'edit-body'

  const handleSubjectChange = (templateId, val) => {
    setEditingSubjects(prev => ({
      ...prev,
      [templateId]: val
    }));
  };

  const handleBodyChange = (templateId, val) => {
    setEditingBodies(prev => ({
      ...prev,
      [templateId]: val
    }));
  };

  const handleToggleTemplate = async (templateId) => {
    const tmpl = emailTemplates.find(t => t.id === templateId);
    if (!tmpl) return;
    const newStatus = tmpl.enabled === false ? true : false;
    
    // Optimistic UI update
    setEmailTemplates(prev => prev.map(t => t.id === templateId ? { ...t, enabled: newStatus } : t));

    try {
      const payload = {};
      emailTemplates.forEach(t => {
        payload[t.id] = {
          subject: editingSubjects[t.id] !== undefined ? editingSubjects[t.id] : t.subject,
          body: editingBodies[t.id] !== undefined ? editingBodies[t.id] : (t.body || t.defaultBody || ''),
          enabled: t.id === templateId ? newStatus : (t.enabled !== false)
        };
      });
      await portalService.updateEmailTemplateConfig(payload);
      toast.success(`Template ${newStatus ? 'activated' : 'deactivated'} successfully.`);
    } catch (err) {
      console.error('Failed to toggle template status:', err);
      toast.error('Failed to update template trigger status.');
      // Revert
      setEmailTemplates(prev => prev.map(t => t.id === templateId ? { ...t, enabled: !newStatus } : t));
    }
  };

  const handleSaveTemplateConfig = async (templateId) => {
    setIsSavingTemplateConfig(true);
    try {
      const currentSubject = editingSubjects[templateId] !== undefined 
        ? editingSubjects[templateId] 
        : (emailTemplates.find(t => t.id === templateId)?.subject || '');
      const currentBody = editingBodies[templateId] !== undefined 
        ? editingBodies[templateId] 
        : (emailTemplates.find(t => t.id === templateId)?.body || '');

      const payload = {};
      emailTemplates.forEach(t => {
        payload[t.id] = {
          subject: t.id === templateId ? currentSubject : (editingSubjects[t.id] !== undefined ? editingSubjects[t.id] : t.subject),
          body: t.id === templateId ? currentBody : (editingBodies[t.id] !== undefined ? editingBodies[t.id] : (t.body || t.defaultBody || '')),
          enabled: t.enabled !== false
        };
      });
      await portalService.updateEmailTemplateConfig(payload);
      setEmailTemplates(prev => prev.map(t => t.id === templateId ? { ...t, subject: currentSubject, body: currentBody } : t));
      toast.success('Email template subject and body configuration saved successfully.');
      // Refresh preview with new content
      const tmpl = emailTemplates.find(t => t.id === templateId);
      if (tmpl) {
        fetchPreview(templateId, tmpl.sampleData);
      }
    } catch (err) {
      console.error('Failed to save template configuration:', err);
      toast.error('Failed to save template configuration.');
    } finally {
      setIsSavingTemplateConfig(false);
    }
  };

  const handleResetTemplateBody = (templateId) => {
    const tmpl = emailTemplates.find(t => t.id === templateId);
    if (!tmpl) return;
    const defaultBody = tmpl.defaultBody || '';
    setEditingBodies(prev => ({
      ...prev,
      [templateId]: defaultBody
    }));
    toast.info('Template body reset to factory default. Click Save to persist.');
  };

  const handleSelectTemplate = (templateId) => {
    setSelectedTemplateId(templateId);
    const tmpl = emailTemplates.find(t => t.id === templateId);
    if (tmpl) {
      if (editingSubjects[tmpl.id] === undefined) {
        setEditingSubjects(prev => ({ ...prev, [tmpl.id]: tmpl.subject }));
      }
      if (editingBodies[tmpl.id] === undefined) {
        setEditingBodies(prev => ({ ...prev, [tmpl.id]: tmpl.body || tmpl.defaultBody || '' }));
      }
      fetchPreview(tmpl.id, tmpl.sampleData);
    }
  };

  const handleDispatchTemplateTest = async () => {
    const cleanEmail = (testEmail || '').trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      toast.error('Please enter a valid recipient email address.');
      return;
    }
    const currentTmpl = emailTemplates.find(t => t.id === selectedTemplateId);
    if (!currentTmpl) return;

    setIsDispatchingTemplate(true);
    try {
      const res = await portalService.dispatchTemplateTest(
        currentTmpl.id,
        cleanEmail,
        currentTmpl.subject,
        currentTmpl.sampleData
      );
      if (res.success) {
        toast.success(res.message || `Test email dispatched to ${cleanEmail}! Check inbox.`);
      } else {
        toast.error(res.message || 'Dispatch failed.');
      }
    } catch (err) {
      console.error('Template test dispatch error:', err);
      toast.error(err.response?.data?.message || 'Failed to dispatch email test.');
    } finally {
      setIsDispatchingTemplate(false);
    }
  };

  const handleTestEmail = async () => {
    const cleanEmail = (testEmail || '').trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      toast.error('Please enter a valid recipient email address (e.g. name@domain.com).');
      return;
    }

    setIsTestingEmail(true);
    try {
      const res = await portalService.testEmailDelivery(cleanEmail);
      if (res.success) {
        toast.success(res.message || `Test email successfully dispatched to ${cleanEmail}! Check inbox/spam.`);
      } else {
        toast.error(res.message || 'Failed to dispatch test email. Check server logs.');
      }
    } catch (err) {
      console.error('Email Test error:', err);
      toast.error(err.response?.data?.message || 'SMTP delivery failed. Check Stalwart mail server status.');
    } finally {
      setIsTestingEmail(false);
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      await portalService.updateBusinessProfile(formData);
      await refreshBusinessProfile();
      setDirtyTabs(prev => ({ ...prev, [activeSubTab]: false }));
      toast.success('Integration credentials and settings saved permanently to PostgreSQL!');
    } catch (err) {
      console.error('Failed to update integrations settings:', err);
      toast.error('Failed to save settings: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSaving(false);
    }
  };

  // Nav Items Configuration for Sub-Sidebar
  const navItems = [
    {
      id: 'twilio-sms',
      name: 'Twilio SMS OTPs',
      subtitle: 'Public forms & mobile login',
      icon: Zap,
      badge: formData.twilioSmsEnabled ? 'Active' : 'Inactive',
      badgeColor: formData.twilioSmsEnabled ? '#15803d' : '#64748b',
      badgeBg: formData.twilioSmsEnabled ? '#dcfce7' : '#f1f5f9',
      iconColor: '#ef4444',
      iconBg: '#fef2f2'
    },
    {
      id: 'twilio-whatsapp',
      name: 'Twilio WhatsApp',
      subtitle: 'Launches, alerts & campaigns',
      icon: MessageSquare,
      badge: formData.twilioWhatsappEnabled ? 'Active' : 'Inactive',
      badgeColor: formData.twilioWhatsappEnabled ? '#15803d' : '#64748b',
      badgeBg: formData.twilioWhatsappEnabled ? '#dcfce7' : '#f1f5f9',
      iconColor: '#059669',
      iconBg: '#ecfdf5'
    },
    {
      id: 'email-smtp',
      name: 'Corporate Mail & Templates',
      subtitle: 'Stalwart SMTP + Thymeleaf Studio',
      icon: Mail,
      badge: 'Operational',
      badgeColor: '#1e40af',
      badgeBg: '#dbeafe',
      iconColor: '#2563eb',
      iconBg: '#eff6ff'
    }
  ];

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Top Header Banner */}
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        padding: '1.25rem 1.5rem',
        boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
            border: '1px solid #bfdbfe',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#2563eb',
            boxShadow: '0 2px 6px rgba(37, 99, 235, 0.1)'
          }}>
            <Cpu size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f2b48', margin: 0 }}>
                Integrations & Cloud Communications
              </h2>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '12px' }}>
                Unified Gateways
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0' }}>
              Configure outbound messaging channels, email templates, and cryptographic API tokens with real-time test sandboxes.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
            <span>Refresh Settings</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2-COLUMN ENTERPRISE LAYOUT: SUB-SIDEBAR RAIL + ACTIVE PANEL */}
      {/* ========================================================================= */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '280px minmax(0, 1fr)',
        gap: '1.25rem',
        alignItems: 'flex-start'
      }}>
        
        {/* ======================================================================= */}
        {/* SUB-SIDEBAR NAVIGATION RAIL */}
        {/* ======================================================================= */}
        <aside style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '0.75rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.4rem',
          position: 'sticky',
          top: '80px'
        }}>
          <div style={{ padding: '0.5rem 0.75rem 0.25rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Communication Channels
            </span>
          </div>

          {navItems.map((item) => {
            const isCurrent = activeSubTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSubTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: '12px',
                  border: isCurrent ? '1px solid #bfdbfe' : '1px solid transparent',
                  background: isCurrent ? 'linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%)' : 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                  <div style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '9px',
                    background: item.iconBg,
                    color: item.iconColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Icon size={18} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '0.84rem', fontWeight: isCurrent ? 800 : 700, color: isCurrent ? '#1e3a8a' : '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span>{item.name}</span>
                      {dirtyTabs[item.id] && (
                        <span 
                          title="Unsaved modifications"
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: '#f59e0b',
                            display: 'inline-block',
                            flexShrink: 0
                          }} 
                        />
                      )}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.subtitle}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0, marginLeft: '6px' }}>
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: '10px',
                    background: item.badgeBg,
                    color: item.badgeColor
                  }}>
                    {item.badge}
                  </span>
                  {isCurrent && <ChevronRight size={14} color="#2563eb" />}
                </div>
              </button>
            );
          })}
        </aside>

        {/* ======================================================================= */}
        {/* ACTIVE INTEGRATION DETAIL PANEL */}
        {/* ======================================================================= */}
        <main style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* ===================================================================== */}
          {/* TAB 1: TWILIO PROGRAMMABLE SMS (MOBILE OTP ENGINE) */}
          {/* ===================================================================== */}
          {activeSubTab === 'twilio-sms' && (
            <div style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: formData.twilioSmsEnabled ? '2px solid #ef4444' : '1px solid #e2e8f0',
              padding: '1.5rem',
              boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem'
            }}>
              {/* Card Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    background: '#fef2f2',
                    border: '1px solid #fecdd3',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ef4444'
                  }}>
                    <Zap size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f2b48', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>Twilio Programmable SMS (Mobile OTP Engine)</span>
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
                    <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0' }}>
                      Sends 6-digit cryptographic OTPs via Twilio SMS for Instant Quotes, Policy Renewals, Policy Porting, and Customer OTP Login.
                    </p>
                  </div>
                </div>

                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none', background: '#f8fafc', padding: '6px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
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
                      padding: '9px 12px',
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
                      padding: '9px 12px',
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
                      padding: '9px 12px',
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
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.88rem',
                      fontFamily: 'monospace'
                    }}
                  />
                </div>
              </div>

              {/* Live Test Dispatch Box */}
              <div style={{
                background: '#fff1f2',
                borderRadius: '12px',
                border: '1px solid #fecdd3',
                padding: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#9f1239', margin: '0 0 2px' }}>
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
                        padding: '9px 12px 9px 58px',
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
                      padding: '9px 18px',
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

              {/* Panel Bottom Action */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: '0.8rem', color: dirtyTabs['twilio-sms'] ? '#d97706' : '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {dirtyTabs['twilio-sms'] ? (
                    <>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
                      <span>Unsaved modifications detected. Click save to commit to database.</span>
                    </>
                  ) : (
                    <span>All Twilio SMS settings are up-to-date with PostgreSQL.</span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: dirtyTabs['twilio-sms'] 
                      ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' 
                      : '#0f2b48',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '9px 22px',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    cursor: isSaving ? 'not-allowed' : 'pointer',
                    boxShadow: dirtyTabs['twilio-sms'] 
                      ? '0 2px 10px rgba(37, 99, 235, 0.3)' 
                      : '0 2px 6px rgba(15, 43, 72, 0.15)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {isSaving ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Saving to DB...</span>
                    </>
                  ) : (
                    <>
                      <Save size={14} />
                      <span>Save Twilio SMS Settings</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 2: TWILIO WHATSAPP MESSAGING & BROADCASTS */}
          {/* ===================================================================== */}
          {activeSubTab === 'twilio-whatsapp' && (
            <div style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: formData.twilioWhatsappEnabled ? '2px solid #059669' : '1px solid #e2e8f0',
              padding: '1.5rem',
              boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem'
            }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    background: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#059669'
                  }}>
                    <MessageSquare size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f2b48', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                    <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0' }}>
                      Dispatches new policy launch announcements, commission boosters, and promo alerts to POSP agents using your Twilio account.
                    </p>
                  </div>
                </div>

                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none', background: '#f8fafc', padding: '6px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <input
                    type="checkbox"
                    name="twilioWhatsappEnabled"
                    checked={formData.twilioWhatsappEnabled}
                    onChange={handleChange}
                    style={{ width: '18px', height: '18px', accentColor: '#059669', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: formData.twilioWhatsappEnabled ? '#059669' : '#475569' }}>
                    Enable Twilio WhatsApp Broadcasts
                  </span>
                </label>
              </div>

              {/* Note on Unified Credentials */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0369a1', fontWeight: 800, fontSize: '0.82rem', marginBottom: '6px' }}>
                  <Info size={15} />
                  <span>Unified Twilio Credentials</span>
                </div>
                <p style={{ fontSize: '0.78rem', color: '#475569', margin: '0 0 1rem', lineHeight: 1.5 }}>
                  This WhatsApp service automatically reuses your <strong>Twilio Account SID</strong>, <strong>API Key SID</strong>, and <strong>API Key Secret</strong> from the Twilio SMS tab. No separate third-party Meta tokens needed.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
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
                      For free testing, use Twilio Sandbox: <code>whatsapp:+14155238886</code> (Send <em>join &lt;your-code&gt;</em> to opt in).
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
                      Required by Meta when initiating WhatsApp outbound messages from custom numbers.
                    </span>
                  </div>
                </div>
              </div>

              {/* 1-Click Live WhatsApp Test Tool */}
              <div style={{
                background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
                border: '1px solid #a7f3d0',
                borderRadius: '12px',
                padding: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                <div>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#065f46', margin: '0 0 2px' }}>
                    💬 Test Twilio WhatsApp Messaging
                  </h4>
                  <p style={{ fontSize: '0.78rem', color: '#047857', margin: 0 }}>
                    Sends a live test WhatsApp message to verify your Sender configuration and ensure smooth template rendering.
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <span style={{ position: 'absolute', left: '10px', fontSize: '0.85rem', fontWeight: 700, color: '#059669' }}>
                      🇮🇳 +91
                    </span>
                    <input
                      type="tel"
                      maxLength={10}
                      value={testPhone.replace(/\D/g, '').slice(-10)}
                      onChange={(e) => setTestPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="10-digit mobile"
                      style={{
                        padding: '9px 12px 9px 58px',
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
                      padding: '9px 18px',
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

              {/* Panel Bottom Action */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9' }}>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#059669',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '9px 20px',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    cursor: isSaving ? 'not-allowed' : 'pointer'
                  }}
                >
                  <Save size={14} />
                  <span>Save WhatsApp Settings</span>
                </button>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 3: CORPORATE MAIL SERVER & TRANSACTIONAL TEMPLATES STUDIO */}
          {/* ===================================================================== */}
          {activeSubTab === 'email-smtp' && (
            <div style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '1.5rem',
              boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem'
            }}>
              {/* Card Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#2563eb'
                  }}>
                    <Mail size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f2b48', margin: '0 0 2px' }}>
                      Corporate Mail Server (Stalwart SMTP) & Templates Studio
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                      Active on <strong>mail.aadhirakshainsurance.com</strong> | SMTPS Port 465 (TLS/SSL) | DKIM, SPF & DMARC Verified
                    </p>
                  </div>
                </div>

                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  background: '#f0fdf4',
                  color: '#166534',
                  border: '1px solid #bbf7d0'
                }}>
                  <CheckCircle2 size={14} />
                  <span>Mail Server Operational</span>
                </div>
              </div>

              {/* Diagnostic Test Box */}
              <div style={{
                background: '#f8fafc',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                padding: '1rem 1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0f2b48', fontWeight: 700, fontSize: '0.88rem' }}>
                  <Zap size={16} color="#2563eb" />
                  <span>Real-Time Outbound Email Dispatch Diagnostics</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                  Dispatch a synchronous test HTML email to verify live SMTP handshake and deliverability across mail clients.
                </p>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', marginTop: '4px' }}>
                  <div style={{ flex: 1, minWidth: '240px' }}>
                    <input
                      type="email"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      placeholder="Enter recipient email (e.g. name@domain.com)"
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.85rem',
                        color: '#1e293b',
                        outline: 'none',
                        background: '#ffffff'
                      }}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleTestEmail}
                    disabled={isTestingEmail}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: '#2563eb',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '9px 18px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: isTestingEmail ? 'not-allowed' : 'pointer',
                      boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {isTestingEmail ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        <span>Delivering via SMTP...</span>
                      </>
                    ) : (
                      <>
                        <Send size={14} />
                        <span>Send Diagnostic Ping</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Dynamic Email Templates Studio */}
              <div style={{
                background: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #cbd5e1',
                overflow: 'hidden'
              }}>
                {/* Studio Header Bar */}
                <div style={{
                  background: '#0f172a',
                  color: '#ffffff',
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FileText size={18} color="#38bdf8" />
                    <div>
                      <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: '#ffffff' }}>
                        Transactional Email Templates Studio (Thymeleaf Engine)
                      </h4>
                      <p style={{ margin: '2px 0 0', fontSize: '0.74rem', color: '#94a3b8' }}>
                        Preview, test, and audit IRDAI-compliant transactional email layouts across device viewports.
                      </p>
                    </div>
                  </div>

                  {/* Viewport Switcher Controls */}
                  <div style={{
                    display: 'inline-flex',
                    background: '#1e293b',
                    padding: '3px',
                    borderRadius: '8px',
                    border: '1px solid #334155'
                  }}>
                    <button
                      type="button"
                      onClick={() => setPreviewDevice('desktop')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '5px 12px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer',
                        background: previewDevice === 'desktop' ? '#0284c7' : 'transparent',
                        color: previewDevice === 'desktop' ? '#ffffff' : '#94a3b8',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <Monitor size={13} />
                      <span>Desktop (600px)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewDevice('mobile')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '5px 12px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer',
                        background: previewDevice === 'mobile' ? '#0284c7' : 'transparent',
                        color: previewDevice === 'mobile' ? '#ffffff' : '#94a3b8',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <DeviceMobile size={13} />
                      <span>Mobile (375px)</span>
                    </button>
                  </div>
                </div>

                {/* Template Selector Pills */}
                <div style={{
                  background: '#f8fafc',
                  borderBottom: '1px solid #e2e8f0',
                  padding: '0.75rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  overflowX: 'auto'
                }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginRight: '6px', whiteSpace: 'nowrap' }}>
                    Select Template:
                  </span>
                  {emailTemplates.map(tmpl => {
                    const isSelected = tmpl.id === selectedTemplateId;
                    return (
                      <button
                        key={tmpl.id}
                        type="button"
                        onClick={() => handleSelectTemplate(tmpl.id)}
                        style={{
                          whiteSpace: 'nowrap',
                          padding: '6px 14px',
                          borderRadius: '20px',
                          fontSize: '0.78rem',
                          fontWeight: isSelected ? 800 : 600,
                          border: isSelected ? '1px solid #0284c7' : '1px solid #cbd5e1',
                          background: isSelected ? '#e0f2fe' : '#ffffff',
                          color: isSelected ? '#0369a1' : '#475569',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {tmpl.name}
                      </button>
                    );
                  })}
                </div>

                {/* Template Configuration & Action Bar */}
                {(() => {
                  const tmpl = emailTemplates.find(t => t.id === selectedTemplateId);
                  if (!tmpl) return null;
                  const currentSubject = editingSubjects[tmpl.id] !== undefined ? editingSubjects[tmpl.id] : tmpl.subject;
                  const isEnabled = tmpl.enabled !== false;
                  const isDirty = currentSubject !== tmpl.subject;

                  return (
                    <div style={{
                      padding: '1rem 1.25rem',
                      background: '#ffffff',
                      borderBottom: '1px solid #e2e8f0',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '12px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, background: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: '6px' }}>
                            {tmpl.category}
                          </span>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>
                            ID: <code style={{ color: '#0284c7' }}>{tmpl.id}</code>
                          </span>
                          <button
                            type="button"
                            onClick={() => handleToggleTemplate(tmpl.id)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '2px 10px',
                              borderRadius: '12px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              border: 'none',
                              cursor: 'pointer',
                              background: isEnabled ? '#dcfce7' : '#fee2e2',
                              color: isEnabled ? '#15803d' : '#b91c1c',
                              transition: 'all 0.15s ease'
                            }}
                            title={isEnabled ? 'Click to deactivate this automated trigger' : 'Click to activate this automated trigger'}
                          >
                            {isEnabled ? <Power size={11} /> : <PowerOff size={11} />}
                            {isEnabled ? 'Active Trigger' : 'Disabled'}
                          </button>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={handleDispatchTemplateTest}
                            disabled={isDispatchingTemplate || !testEmail}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              background: '#0284c7',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '7px 14px',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              cursor: (isDispatchingTemplate || !testEmail) ? 'not-allowed' : 'pointer',
                              opacity: !testEmail ? 0.6 : 1,
                              transition: 'all 0.15s ease'
                            }}
                            title={!testEmail ? 'Enter a recipient email in the test box above first' : 'Send this template live'}
                          >
                            {isDispatchingTemplate ? (
                              <>
                                <RefreshCw size={12} className="animate-spin" />
                                <span>Dispatching Sample...</span>
                              </>
                            ) : (
                              <>
                                <Send size={12} />
                                <span>Send Sample Live</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Subject Editor Line */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        background: '#f8fafc',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', fontSize: '0.78rem', fontWeight: 700, minWidth: '90px' }}>
                          <Edit3 size={13} color="#0284c7" />
                          <span>Subject Line:</span>
                        </div>
                        <input
                          type="text"
                          value={currentSubject}
                          onChange={(e) => handleSubjectChange(tmpl.id, e.target.value)}
                          placeholder="Email subject line..."
                          style={{
                            flex: 1,
                            border: '1px solid #cbd5e1',
                            borderRadius: '6px',
                            padding: '6px 10px',
                            fontSize: '0.82rem',
                            color: '#0f172a',
                            background: '#ffffff',
                            fontWeight: 600
                          }}
                        />
                        {(currentSubject !== tmpl.subject || (editingBodies[tmpl.id] !== undefined && editingBodies[tmpl.id] !== tmpl.body)) && (
                          <button
                            type="button"
                            onClick={() => handleSaveTemplateConfig(tmpl.id)}
                            disabled={isSavingTemplateConfig}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              background: '#059669',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '6px 14px',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              cursor: isSavingTemplateConfig ? 'not-allowed' : 'pointer'
                            }}
                          >
                            <Save size={12} />
                            <span>{isSavingTemplateConfig ? 'Saving...' : 'Save Changes'}</span>
                          </button>
                        )}
                      </div>

                      {/* Supported Dynamic Placeholder Tokens */}
                      {tmpl.sampleData && Object.keys(tmpl.sampleData).length > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Tag size={11} /> Placeholders:
                          </span>
                          {Object.keys(tmpl.sampleData).map(k => (
                            <button
                              key={k}
                              type="button"
                              onClick={() => {
                                const placeholder = `{{${k}}}`;
                                if (activeTemplateTab === 'edit-body') {
                                  const currBody = editingBodies[tmpl.id] !== undefined ? editingBodies[tmpl.id] : (tmpl.body || tmpl.defaultBody || '');
                                  handleBodyChange(tmpl.id, currBody + ' ' + placeholder);
                                } else {
                                  const nextSubject = (currentSubject || '') + ' ' + placeholder;
                                  handleSubjectChange(tmpl.id, nextSubject);
                                }
                              }}
                              style={{
                                border: '1px dashed #cbd5e1',
                                background: '#f8fafc',
                                borderRadius: '4px',
                                padding: '1px 6px',
                                fontSize: '0.7rem',
                                color: '#0369a1',
                                fontFamily: 'monospace',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                              }}
                              title={`Click to insert {{${k}}}`}
                            >
                              &#123;&#123;{k}&#125;&#125;
                            </button>
                          ))}
                        </div>
                      )}

                      {/* View & Edit Tabs */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: '4px',
                        borderTop: '1px solid #f1f5f9',
                        paddingTop: '8px'
                      }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => setActiveTemplateTab('preview')}
                            style={{
                              padding: '5px 12px',
                              borderRadius: '6px',
                              border: activeTemplateTab === 'preview' ? '1px solid #0284c7' : '1px solid #e2e8f0',
                              background: activeTemplateTab === 'preview' ? '#e0f2fe' : '#ffffff',
                              color: activeTemplateTab === 'preview' ? '#0369a1' : '#64748b',
                              fontSize: '0.76rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            Live Sandbox Preview
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveTemplateTab('edit-body')}
                            style={{
                              padding: '5px 12px',
                              borderRadius: '6px',
                              border: activeTemplateTab === 'edit-body' ? '1px solid #0284c7' : '1px solid #e2e8f0',
                              background: activeTemplateTab === 'edit-body' ? '#e0f2fe' : '#ffffff',
                              color: activeTemplateTab === 'edit-body' ? '#0369a1' : '#64748b',
                              fontSize: '0.76rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            Edit HTML Template Body
                          </button>
                        </div>

                        {activeTemplateTab === 'edit-body' && (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              type="button"
                              onClick={() => handleResetTemplateBody(tmpl.id)}
                              style={{
                                padding: '4px 10px',
                                borderRadius: '6px',
                                border: '1px solid #cbd5e1',
                                background: '#f8fafc',
                                color: '#475569',
                                fontSize: '0.74rem',
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                            >
                              Reset to Factory Default
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveTemplateConfig(tmpl.id)}
                              disabled={isSavingTemplateConfig}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                background: '#059669',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '4px 12px',
                                fontSize: '0.74rem',
                                fontWeight: 700,
                                cursor: isSavingTemplateConfig ? 'not-allowed' : 'pointer'
                              }}
                            >
                              <Save size={11} />
                              <span>{isSavingTemplateConfig ? 'Saving...' : 'Save Template'}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Main Content Area: Either Live Sandbox Viewport OR HTML Body Editor */}
                {activeTemplateTab === 'edit-body' ? (
                  <div style={{ padding: '1rem 1.25rem', background: '#0f172a' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.74rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                        Custom Body HTML (Rendered inside the global Aadhiraksha responsive layout wrapper)
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#38bdf8' }}>
                        Supports HTML tags (&lt;p&gt;, &lt;h2&gt;, &lt;table&gt;, &lt;a&gt;) and &#123;&#123;variable&#125;&#125; placeholders
                      </span>
                    </div>
                    {(() => {
                      const tmpl = emailTemplates.find(t => t.id === selectedTemplateId);
                      if (!tmpl) return null;
                      const currBody = editingBodies[tmpl.id] !== undefined 
                        ? editingBodies[tmpl.id] 
                        : (tmpl.body || tmpl.defaultBody || '');

                      return (
                        <textarea
                          rows={18}
                          value={currBody}
                          onChange={(e) => handleBodyChange(tmpl.id, e.target.value)}
                          placeholder="HTML template body..."
                          style={{
                            width: '100%',
                            fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                            fontSize: '0.82rem',
                            lineHeight: 1.5,
                            background: '#1e293b',
                            color: '#f8fafc',
                            border: '1px solid #334155',
                            borderRadius: '8px',
                            padding: '12px',
                            resize: 'vertical',
                            outline: 'none',
                            boxSizing: 'border-box'
                          }}
                        />
                      );
                    })()}
                  </div>
                ) : (
                  <div style={{
                    background: '#f1f5f9',
                    padding: '1.5rem',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                    minHeight: '440px',
                    overflow: 'auto'
                  }}>
                    {isLoadingPreview ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px', color: '#64748b', gap: '10px' }}>
                        <RefreshCw size={24} className="animate-spin" color="#0284c7" />
                        <span style={{ fontSize: '0.84rem', fontWeight: 600 }}>Compiling template on server engine...</span>
                      </div>
                    ) : (
                      <div style={{
                        width: previewDevice === 'mobile' ? '375px' : '640px',
                        maxWidth: '100%',
                        background: '#ffffff',
                        borderRadius: previewDevice === 'mobile' ? '28px' : '10px',
                        border: previewDevice === 'mobile' ? '8px solid #1e293b' : '1px solid #cbd5e1',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
                        overflow: 'hidden',
                        transition: 'width 0.25s ease-in-out'
                      }}>
                        {previewDevice === 'mobile' && (
                          <div style={{ background: '#1e293b', height: '18px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <div style={{ width: '40px', height: '4px', background: '#475569', borderRadius: '4px' }}></div>
                          </div>
                        )}
                        <iframe
                          title="Email Template Render Preview"
                          srcDoc={templatePreviewHtml}
                          style={{
                            width: '100%',
                            height: '520px',
                            border: 'none',
                            display: 'block'
                          }}
                          sandbox="allow-same-origin"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

        </main>
      </div>

    </div>
  );
}
