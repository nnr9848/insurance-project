import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
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
  ChevronLeft,
  Sparkles,
  ArrowRight,
  Edit3,
  Tag,
  Power,
  PowerOff,
  Trash2,
  Shield,
  Search,
  Filter,
  History,
  Clock,
  AlertTriangle,
  ArrowUpDown,
  Copy,
  ChevronDown,
  ChevronUp,
  AtSign,
  Users,
  Database,
  RotateCw,
  X,
  Key,
  Plus
} from 'lucide-react';
import { portalService, crmService } from '../../services/api';
import { useBusinessProfile } from '../../context/BusinessProfileContext';
import { useToast } from '../../context/ToastContext';

export default function IntegrationsSettingsView() {
  const { businessProfile, refreshBusinessProfile } = useBusinessProfile();
  const toast = useToast();
  const navigate = useNavigate();
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
    twilioVerifyServiceSid: '',

    // Twilio WhatsApp Messaging Settings (Agent Broadcasts, Launches & Offers)
    twilioWhatsappEnabled: false,
    twilioWhatsappFromNumber: 'whatsapp:+14155238886',
    twilioWhatsappContentSid: ''
  });

  // Track if current sub-tab has unsaved modifications
  const [dirtyTabs, setDirtyTabs] = useState({});

  // Collapsible Sub-Sidebar (Icon Rail vs Expanded)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('crm_integrations_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('crm_integrations_sidebar_collapsed', String(next));
      } catch (err) {
        console.warn('Could not persist sidebar collapse state', err);
      }
      return next;
    });
  };

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

  // Delivery & OTP Logs State
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsTotal, setLogsTotal] = useState(0);
  const [logsPage, setLogsPage] = useState(0);
  const [logsChannel, setLogsChannel] = useState('');
  const [logsStatus, setLogsStatus] = useState('');
  const [logsSearch, setLogsSearch] = useState('');
  const [showPurgeModal, setShowPurgeModal] = useState(false);
  const [purgeOption, setPurgeOption] = useState('7_days'); // '7_days' | '30_days' | 'all'
  const [purgeConfirmText, setPurgeConfirmText] = useState('');
  const [isPurging, setIsPurging] = useState(false);
  const [selectedLogForDrawer, setSelectedLogForDrawer] = useState(null);

  const copyLogText = (text, label = 'diagnostic message') => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${label} to clipboard!`);
  };

  const fetchLogs = async (page = 0) => {
    setLogsLoading(true);
    try {
      const params = {
        page,
        size: 15
      };
      if (logsChannel) params.channel = logsChannel;
      if (logsStatus) params.status = logsStatus;
      if (logsSearch?.trim()) params.search = logsSearch.trim();

      const res = await portalService.getCommunicationLogs(params);
      if (res && res.content) {
        setLogs(res.content);
        setLogsTotal(res.totalElements || 0);
        setLogsPage(res.number || 0);
      } else if (Array.isArray(res)) {
        setLogs(res);
        setLogsTotal(res.length);
        setLogsPage(0);
      }
    } catch (err) {
      console.error('Failed to load delivery logs:', err);
      toast.error('Failed to retrieve delivery logs: ' + (err.response?.data?.message || err.message));
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'delivery-logs') {
      fetchLogs(0);
    }
  }, [activeSubTab, logsChannel, logsStatus]);

  const [mailboxList, setMailboxList] = useState([]);
  const [mailboxLoading, setMailboxLoading] = useState(false);
  const [mailboxSearch, setMailboxSearch] = useState('');
  const [copiedMailboxEmail, setCopiedMailboxEmail] = useState(null);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [syncingUserId, setSyncingUserId] = useState(null);

  // In-Context Mailbox Management Drawer State
  const [managingMailbox, setManagingMailbox] = useState(null);
  const [drawerSettings, setDrawerSettings] = useState(null);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [newAliasInput, setNewAliasInput] = useState('');
  const [aliasSaving, setAliasSaving] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState(null);

  // Rename & Deprovision State
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameHandleInput, setRenameHandleInput] = useState('');
  const [renameKeepOldAlias, setRenameKeepOldAlias] = useState(true);
  const [renameSaving, setRenameSaving] = useState(false);
  const [deprovisionConfirmOpen, setDeprovisionConfirmOpen] = useState(false);
  const [deprovisionLoading, setDeprovisionLoading] = useState(false);

  const openMailboxDrawer = async (mailbox) => {
    setManagingMailbox(mailbox);
    setDrawerSettings(null);
    setGeneratedPassword(null);
    setNewAliasInput('');
    setDrawerLoading(true);
    try {
      const settings = await crmService.getMailboxSettings(mailbox.id);
      setDrawerSettings(settings);
    } catch (err) {
      console.error('Failed to load mailbox settings:', err);
      toast.error('Failed to load mailbox settings: ' + (err.response?.data?.message || err.message));
    } finally {
      setDrawerLoading(false);
    }
  };

  const closeMailboxDrawer = () => {
    setManagingMailbox(null);
    setDrawerSettings(null);
    setGeneratedPassword(null);
    setNewAliasInput('');
    setIsRenaming(false);
    setRenameHandleInput('');
    setDeprovisionConfirmOpen(false);
  };

  const handleExecuteRename = async (e) => {
    if (e) e.preventDefault();
    if (!managingMailbox || !renameHandleInput.trim()) return;
    setRenameSaving(true);
    try {
      const res = await portalService.renameMailbox(
        managingMailbox.id, 
        renameHandleInput.trim(), 
        renameKeepOldAlias
      );
      setManagingMailbox(prev => ({ ...prev, domainMailboxEmail: res.domainEmail }));
      if (res.mailboxPassword) {
        setGeneratedPassword(res.mailboxPassword);
      }
      setIsRenaming(false);
      setRenameHandleInput('');
      const updated = await crmService.getMailboxSettings(managingMailbox.id);
      setDrawerSettings(updated);
      await fetchMailboxes();
      toast.success(res.message || 'Corporate email successfully renamed');
    } catch (err) {
      console.error('Failed to rename mailbox:', err);
      toast.error('Rename failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setRenameSaving(false);
    }
  };

  const handleExecuteDeprovision = async () => {
    if (!managingMailbox) return;
    setDeprovisionLoading(true);
    try {
      const res = await portalService.deprovisionMailbox(managingMailbox.id);
      toast.success(res.message || 'Mailbox deprovisioned successfully');
      closeMailboxDrawer();
      await fetchMailboxes();
    } catch (err) {
      console.error('Failed to deprovision mailbox:', err);
      toast.error('Deprovisioning failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setDeprovisionLoading(false);
      setDeprovisionConfirmOpen(false);
    }
  };

  const handleDrawerResetPassword = async () => {
    if (!managingMailbox) return;
    setResettingPassword(true);
    try {
      const res = await crmService.resetMailboxPassword(managingMailbox.id);
      setGeneratedPassword(res.newPassword);
      toast.success('Generated new secure password for ' + managingMailbox.domainMailboxEmail);
    } catch (err) {
      console.error('Password reset failed:', err);
      toast.error('Failed to reset password: ' + (err.response?.data?.message || err.message));
    } finally {
      setResettingPassword(false);
    }
  };

  const handleDrawerAddAlias = async (e) => {
    if (e) e.preventDefault();
    if (!managingMailbox || !newAliasInput.trim()) return;
    setAliasSaving(true);
    try {
      await crmService.addMailboxAlias(managingMailbox.id, newAliasInput.trim());
      setNewAliasInput('');
      const updated = await crmService.getMailboxSettings(managingMailbox.id);
      setDrawerSettings(updated);
      await fetchMailboxes();
      toast.success('Alias added successfully');
    } catch (err) {
      console.error('Failed to add alias:', err);
      toast.error('Failed to add alias: ' + (err.response?.data?.message || err.message));
    } finally {
      setAliasSaving(false);
    }
  };

  const handleDrawerRemoveAlias = async (aliasEmail) => {
    if (!managingMailbox) return;
    setAliasSaving(true);
    try {
      await crmService.removeMailboxAlias(managingMailbox.id, aliasEmail);
      const updated = await crmService.getMailboxSettings(managingMailbox.id);
      setDrawerSettings(updated);
      await fetchMailboxes();
      toast.success('Alias removed');
    } catch (err) {
      console.error('Failed to remove alias:', err);
      toast.error('Failed to remove alias: ' + (err.response?.data?.message || err.message));
    } finally {
      setAliasSaving(false);
    }
  };

  const handleDrawerSetPrimary = async (newPrimary) => {
    if (!managingMailbox) return;
    setAliasSaving(true);
    try {
      await crmService.setPrimaryMailboxEmail(managingMailbox.id, newPrimary);
      setManagingMailbox(prev => ({ ...prev, domainMailboxEmail: newPrimary }));
      const updated = await crmService.getMailboxSettings(managingMailbox.id);
      setDrawerSettings(updated);
      await fetchMailboxes();
      toast.success(`Primary email updated to ${newPrimary}`);
    } catch (err) {
      console.error('Failed to set primary email:', err);
      toast.error('Failed to update primary email: ' + (err.response?.data?.message || err.message));
    } finally {
      setAliasSaving(false);
    }
  };

  const fetchMailboxes = async () => {
    setMailboxLoading(true);
    try {
      const data = await portalService.getMailboxDirectory();
      setMailboxList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load mailbox directory:', err);
      toast.error('Failed to retrieve corporate mailboxes: ' + (err.response?.data?.message || err.message));
    } finally {
      setMailboxLoading(false);
    }
  };

  const handleSyncSingleMailbox = async (userId, employeeName) => {
    setSyncingUserId(userId);
    try {
      const res = await portalService.syncUserMailbox(userId);
      toast.success(res.message || `Mailbox synchronized for ${employeeName}`);
      await fetchMailboxes();
    } catch (err) {
      console.error('Failed to sync mailbox:', err);
      toast.error('Sync failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setSyncingUserId(null);
    }
  };

  const handleSyncAllQueuedMailboxes = async () => {
    setIsSyncingAll(true);
    try {
      const res = await portalService.syncAllQueuedMailboxes();
      if (res.synced > 0) {
        toast.success(`Successfully synchronized ${res.synced} mailbox(es) with Stalwart!`);
      } else if (res.total === 0) {
        toast.info('All mailboxes are already synchronized and active.');
      } else {
        toast.error(`Processed ${res.total} mailboxes: ${res.synced} active, ${res.failed} failed.`);
      }
      await fetchMailboxes();
    } catch (err) {
      console.error('Failed to batch sync mailboxes:', err);
      toast.error('Batch sync failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSyncingAll(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'mailboxes') {
      fetchMailboxes();
    }
  }, [activeSubTab]);

  const handleExecutePurge = async () => {
    if (purgeOption === 'all' && purgeConfirmText.trim() !== 'PURGE ALL') {
      toast.error('Please type PURGE ALL to confirm clearing all communication logs.');
      return;
    }

    setIsPurging(true);
    try {
      let days = 7;
      let purgeAll = false;
      if (purgeOption === '30_days') days = 30;
      if (purgeOption === 'all') {
        purgeAll = true;
        days = 0;
      }

      const res = await portalService.purgeCommunicationLogs(days, purgeAll);
      toast.success(res.message || 'Communication logs purged successfully.');
      setShowPurgeModal(false);
      setPurgeConfirmText('');
      fetchLogs(0);
    } catch (err) {
      console.error('Failed to purge communication logs:', err);
      toast.error('Purge failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsPurging(false);
    }
  };

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
        twilioVerifyServiceSid: businessProfile.twilioVerifyServiceSid || '',

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

  const [testTwilioChannel, setTestTwilioChannel] = useState('sms');

  const handleTestTwilio = async () => {
    const cleanPhone = (testTwilioPhone || '').trim();
    if (!cleanPhone) {
      toast.error('Please enter a valid 10-digit mobile number to receive the test OTP.');
      return;
    }
    if (!formData.twilioAccountSid?.trim() || !formData.twilioApiKeySid?.trim() || !formData.twilioApiKeySecret?.trim()) {
      toast.error('Please configure Twilio Account SID, API Key SID (SK...), and API Key Secret before testing.');
      return;
    }
    if (!formData.twilioVerifyServiceSid?.trim() && !formData.twilioFromNumber?.trim()) {
      toast.error('Please configure either a Twilio Verify Service SID (VA...) or From Number before testing.');
      return;
    }

    setIsTestingTwilio(true);
    try {
      await portalService.updateBusinessProfile(formData);
      await refreshBusinessProfile();

      const res = await portalService.testTwilioSms(cleanPhone, testTwilioChannel);
      if (res.success) {
        toast.success(res.message || `Success! Live test OTP dispatched via Twilio to ${cleanPhone}.`);
      } else {
        toast.error(res.message || 'Failed to dispatch Twilio test OTP. Verify credentials.');
      }
    } catch (err) {
      console.error('Twilio Test error:', err);
      toast.error(err.response?.data?.message || 'Failed to dispatch Twilio OTP. Check Account SID, API Key SID, and API Key Secret.');
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
      name: 'Corporate Mail Server',
      subtitle: 'Stalwart SMTP + Templates',
      icon: Mail,
      badge: 'Operational',
      badgeColor: '#1e40af',
      badgeBg: '#dbeafe',
      iconColor: '#2563eb',
      iconBg: '#eff6ff'
    },
    {
      id: 'mailboxes',
      name: 'Employee Mailboxes',
      subtitle: 'Corporate accounts & directory',
      icon: AtSign,
      badge: mailboxList.length > 0 ? `${mailboxList.length} accounts` : 'Directory',
      badgeColor: '#047857',
      badgeBg: '#ecfdf5',
      iconColor: '#059669',
      iconBg: '#ecfdf5'
    },
    {
      id: 'delivery-logs',
      name: 'Delivery & OTP Logs',
      subtitle: 'Audit trail, retries & live status',
      icon: History,
      badge: logsTotal > 0 ? `${logsTotal} events` : 'Audit Log',
      badgeColor: '#4f46e5',
      badgeBg: '#eef2ff',
      iconColor: '#6366f1',
      iconBg: '#eef2ff'
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
      {/* 2-COLUMN ENTERPRISE LAYOUT: COLLAPSIBLE SUB-SIDEBAR RAIL + ACTIVE PANEL */}
      {/* ========================================================================= */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isSidebarCollapsed ? '68px minmax(0, 1fr)' : '280px minmax(0, 1fr)',
        gap: '1.25rem',
        alignItems: 'flex-start',
        transition: 'grid-template-columns 0.22s cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
        
        {/* ======================================================================= */}
        {/* SUB-SIDEBAR NAVIGATION RAIL */}
        {/* ======================================================================= */}
        <aside style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: isSidebarCollapsed ? '0.6rem 0.4rem' : '0.75rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.4rem',
          position: 'sticky',
          top: '80px',
          transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden'
        }}>
          {/* Header & Toggle */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: isSidebarCollapsed ? 'center' : 'space-between',
            padding: isSidebarCollapsed ? '0.25rem 0 0.5rem' : '0.4rem 0.5rem 0.4rem 0.75rem',
            borderBottom: isSidebarCollapsed ? '1px solid #f1f5f9' : 'none',
            marginBottom: isSidebarCollapsed ? '0.25rem' : '0'
          }}>
            {!isSidebarCollapsed && (
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Communication Channels
              </span>
            )}
            <button
              type="button"
              onClick={toggleSidebarCollapse}
              title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse to compact rail'}
              aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse to compact rail'}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                background: '#f8fafc',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                flexShrink: 0
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#e2e8f0';
                e.currentTarget.style.color = '#0f172a';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#f8fafc';
                e.currentTarget.style.color = '#64748b';
              }}
            >
              {isSidebarCollapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
            </button>
          </div>

          {navItems.map((item) => {
            const isCurrent = activeSubTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSubTab(item.id)}
                title={isSidebarCollapsed ? `${item.name} (${item.badge})` : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: isSidebarCollapsed ? 'center' : 'space-between',
                  padding: isSidebarCollapsed ? '10px 0' : '10px 12px',
                  borderRadius: '12px',
                  border: isCurrent ? '1px solid #bfdbfe' : '1px solid transparent',
                  background: isCurrent ? 'linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%)' : 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  if (!isCurrent) e.currentTarget.style.background = '#f8fafc';
                }}
                onMouseLeave={(e) => {
                  if (!isCurrent) e.currentTarget.style.background = 'transparent';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: item.iconBg,
                    color: item.iconColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    position: 'relative'
                  }}>
                    <Icon size={18} />
                    {/* Collapsed dot indicators */}
                    {isSidebarCollapsed && dirtyTabs[item.id] && (
                      <span 
                        title="Unsaved modifications"
                        style={{
                          position: 'absolute',
                          top: '-2px',
                          right: '-2px',
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: '#f59e0b',
                          border: '2px solid #ffffff'
                        }} 
                      />
                    )}
                    {isSidebarCollapsed && (
                      <span
                        style={{
                          position: 'absolute',
                          bottom: '-2px',
                          right: '-2px',
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: item.badgeColor,
                          border: '2px solid #ffffff'
                        }}
                      />
                    )}
                  </div>
                  
                  {!isSidebarCollapsed && (
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
                  )}
                </div>

                {!isSidebarCollapsed && (
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
                )}
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
              border: formData.twilioSmsEnabled ? '1px solid #86efac' : '1px solid #e2e8f0',
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
                        <span style={{ fontSize: '0.72rem', background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                          ● Active (Live SMS Dispatch)
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.72rem', background: '#f1f5f9', color: '#64748b', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                          ○ Inactive (Dev Mock Mode)
                        </span>
                      )}
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0' }}>
                      Sends 6-digit cryptographic OTPs via Twilio SMS for Instant Quotes, Policy Renewals, Policy Porting, and Customer OTP Login.
                    </p>
                  </div>
                </div>

                <label style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  userSelect: 'none',
                  background: formData.twilioSmsEnabled ? '#f0fdf4' : '#f8fafc',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: formData.twilioSmsEnabled ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                  transition: 'all 0.15s ease'
                }}>
                  <input
                    type="checkbox"
                    name="twilioSmsEnabled"
                    checked={formData.twilioSmsEnabled}
                    onChange={handleChange}
                    style={{ width: '18px', height: '18px', accentColor: '#16a34a', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: formData.twilioSmsEnabled ? '#15803d' : '#475569' }}>
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
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>
                      Twilio Verify Service SID (VA...)
                    </label>
                    <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700, background: '#ecfdf5', padding: '1px 6px', borderRadius: '4px' }}>
                      Recommended for India (+91) OTPs
                    </span>
                  </div>
                  <input
                    type="text"
                    name="twilioVerifyServiceSid"
                    value={formData.twilioVerifyServiceSid}
                    onChange={handleChange}
                    placeholder="VAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.88rem',
                      fontFamily: 'monospace'
                    }}
                  />
                  <p style={{ margin: '4px 0 0', fontSize: '0.74rem', color: '#64748b' }}>
                    Created under Twilio Console &gt; Verify &gt; Services. Direct high-delivery route without DLT blocks.
                  </p>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>
                      Twilio From Number / Sender ID
                    </label>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      Required for Programmable SMS
                    </span>
                  </div>
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
                  <p style={{ margin: '4px 0 0', fontSize: '0.74rem', color: '#64748b' }}>
                    Twilio phone number used for general transactional SMS and fallback messaging.
                  </p>
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
                  {/* Channel Selector: SMS or WhatsApp */}
                  <div style={{ display: 'flex', background: '#ffffff', borderRadius: '8px', border: '1px solid #fda4af', padding: '2px' }}>
                    <button
                      type="button"
                      onClick={() => setTestTwilioChannel('sms')}
                      style={{
                        padding: '6px 10px',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        background: testTwilioChannel === 'sms' ? '#e11d48' : 'transparent',
                        color: testTwilioChannel === 'sms' ? '#ffffff' : '#64748b'
                      }}
                    >
                      SMS
                    </button>
                    <button
                      type="button"
                      onClick={() => setTestTwilioChannel('whatsapp')}
                      style={{
                        padding: '6px 10px',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        background: testTwilioChannel === 'whatsapp' ? '#25d366' : 'transparent',
                        color: testTwilioChannel === 'whatsapp' ? '#ffffff' : '#64748b'
                      }}
                    >
                      WhatsApp
                    </button>
                  </div>

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
                      background: '#2563eb',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '9px 18px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: isTestingTwilio ? 'not-allowed' : 'pointer',
                      boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)',
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
              border: formData.twilioWhatsappEnabled ? '1px solid #86efac' : '1px solid #e2e8f0',
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

          {/* ===================================================================== */}
          {/* TAB 4: EMPLOYEE MAILBOX DIRECTORY */}
          {/* ===================================================================== */}
          {activeSubTab === 'mailboxes' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Header card with Actions */}
              <div style={{
                background: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                padding: '1.25rem 1.5rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
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
                      <AtSign size={22} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f2b48', margin: '0 0 2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        Corporate Employee Mailboxes Directory
                      </h3>
                      <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
                        Centrally audited corporate domain accounts (<code>@aadhirakshainsurance.com</code>) active on Stalwart Mail Server.
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={fetchMailboxes}
                      disabled={mailboxLoading}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 14px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        color: '#475569',
                        cursor: mailboxLoading ? 'not-allowed' : 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <RefreshCw size={14} className={mailboxLoading ? 'animate-spin' : ''} />
                      Refresh
                    </button>

                    <button
                      type="button"
                      onClick={() => window.open('https://mail.aadhirakshainsurance.com', '_blank', 'noopener,noreferrer')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 14px',
                        background: '#eff6ff',
                        border: '1px solid #bfdbfe',
                        borderRadius: '8px',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        color: '#1d4ed8',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <ExternalLink size={14} />
                      Open Webmail
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate('/admin?tab=users')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 14px',
                        background: '#059669',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        color: '#ffffff',
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(5, 150, 105, 0.25)',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <Users size={14} />
                      Manage Team Mailboxes
                    </button>
                  </div>
                </div>

                {/* KPI Overview Cards */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '12px',
                  paddingTop: '0.5rem'
                }}>
                  <div style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '12px 14px'
                  }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', display: 'block', marginBottom: '4px' }}>
                      Total Mailboxes
                    </span>
                    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f2b48' }}>
                      {mailboxList.length}
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 600 }}>
                      Provisioned on VPS
                    </span>
                  </div>

                  <div style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '12px 14px'
                  }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', display: 'block', marginBottom: '4px' }}>
                      Active Status
                    </span>
                    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#16a34a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle2 size={18} />
                      {mailboxList.filter(m => m.mailboxStatus === 'ACTIVE').length} Active
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      Ready for Webmail/IMAP
                    </span>
                  </div>

                  <div style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '12px 14px'
                  }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', display: 'block', marginBottom: '4px' }}>
                      Default Storage Quota
                    </span>
                    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0284c7' }}>
                      5 GB
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      5,120 MB per corporate inbox
                    </span>
                  </div>

                  <div style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '12px 14px'
                  }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', display: 'block', marginBottom: '4px' }}>
                      Corporate Domain
                    </span>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f2b48', wordBreak: 'break-all' }}>
                      aadhirakshainsurance.com
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      Stalwart v0.16 Engine
                    </span>
                  </div>
                </div>

                {/* Self-Healing / Queued Mailboxes Alert Banner */}
                {(() => {
                  const queuedCount = mailboxList.filter(m => m.mailboxStatus === 'QUEUED' || m.mailboxStatus === 'UNSYNCHRONIZED').length;
                  if (queuedCount === 0) return null;
                  return (
                    <div style={{
                      background: '#fffbeb',
                      border: '1px solid #fde68a',
                      borderRadius: '12px',
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '12px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: '#fef3c7',
                          color: '#b45309',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <AlertTriangle size={18} />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#92400e' }}>
                            {queuedCount} Mailbox{queuedCount > 1 ? 'es' : ''} Awaiting Server Provisioning
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#b45309' }}>
                            These accounts are registered in CRM. Self-healing scheduler auto-provisions them every 5 mins, or you can sync all now.
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleSyncAllQueuedMailboxes}
                        disabled={isSyncingAll}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: '#b45309',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '7px 14px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: isSyncingAll ? 'not-allowed' : 'pointer',
                          opacity: isSyncingAll ? 0.7 : 1,
                          boxShadow: '0 2px 4px rgba(180, 83, 9, 0.2)'
                        }}
                      >
                        <RotateCw size={13} className={isSyncingAll ? 'animate-spin' : ''} />
                        <span>{isSyncingAll ? 'Syncing with Stalwart...' : `Sync All ${queuedCount} Mailboxes`}</span>
                      </button>
                    </div>
                  );
                })()}

                {/* Filter Toolbar */}
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'center',
                  paddingTop: '0.5rem',
                  borderTop: '1px solid #f1f5f9'
                }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                      type="text"
                      placeholder="Search by employee name, corporate email, personal email, or role..."
                      value={mailboxSearch}
                      onChange={(e) => setMailboxSearch(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px 8px 36px',
                        fontSize: '0.82rem',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        background: '#ffffff',
                        color: '#1e293b',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Mailbox Table Card */}
              <div style={{
                background: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                overflow: 'hidden'
              }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontWeight: 600 }}>
                        <th style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>Employee</th>
                        <th style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>Corporate Domain Email</th>
                        <th style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>Personal Contact</th>
                        <th style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>Quota</th>
                        <th style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>Status</th>
                        <th style={{ padding: '10px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mailboxLoading ? (
                        <tr>
                          <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                            <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 8px auto', display: 'block', color: '#059669' }} />
                            <span>Loading corporate mailboxes...</span>
                          </td>
                        </tr>
                      ) : mailboxList.filter((m) => {
                        if (!mailboxSearch.trim()) return true;
                        const q = mailboxSearch.toLowerCase();
                        return (
                          (m.fullName && m.fullName.toLowerCase().includes(q)) ||
                          (m.domainMailboxEmail && m.domainMailboxEmail.toLowerCase().includes(q)) ||
                          (m.personalEmail && m.personalEmail.toLowerCase().includes(q)) ||
                          (m.designation && m.designation.toLowerCase().includes(q)) ||
                          (m.employeeCode && m.employeeCode.toLowerCase().includes(q))
                        );
                      }).length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                            <AtSign size={32} style={{ margin: '0 auto 8px auto', display: 'block', opacity: 0.5 }} />
                            <span>No corporate employee mailboxes found matching your search.</span>
                          </td>
                        </tr>
                      ) : (
                        mailboxList.filter((m) => {
                          if (!mailboxSearch.trim()) return true;
                          const q = mailboxSearch.toLowerCase();
                          return (
                            (m.fullName && m.fullName.toLowerCase().includes(q)) ||
                            (m.domainMailboxEmail && m.domainMailboxEmail.toLowerCase().includes(q)) ||
                            (m.personalEmail && m.personalEmail.toLowerCase().includes(q)) ||
                            (m.designation && m.designation.toLowerCase().includes(q)) ||
                            (m.employeeCode && m.employeeCode.toLowerCase().includes(q))
                          );
                        }).map((mb) => {
                          const initials = mb.fullName
                            ? mb.fullName.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()
                            : 'EM';

                          const isCopied = copiedMailboxEmail === mb.domainMailboxEmail;

                          return (
                            <tr
                              key={mb.id}
                              style={{
                                borderBottom: '1px solid #f1f5f9',
                                transition: 'background 0.15s ease'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                              {/* Employee column */}
                              <td style={{ padding: '12px 14px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <div style={{
                                    width: '34px',
                                    height: '34px',
                                    borderRadius: '50%',
                                    background: '#ecfdf5',
                                    color: '#047857',
                                    border: '1px solid #a7f3d0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.8rem',
                                    fontWeight: 800,
                                    flexShrink: 0
                                  }}>
                                    {initials}
                                  </div>
                                  <div>
                                    <div style={{ fontWeight: 700, color: '#0f2b48', fontSize: '0.85rem' }}>
                                      {mb.fullName || 'Unnamed Employee'}
                                    </div>
                                    <div style={{ fontSize: '0.74rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                      <span>{mb.designation || 'Staff'}</span>
                                      {mb.employeeCode && (
                                        <>
                                          <span>•</span>
                                          <code>{mb.employeeCode}</code>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* Corporate Email Address */}
                              <td style={{ padding: '12px 14px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                                  <div style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    background: '#f0fdf4',
                                    color: '#166534',
                                    border: '1px solid #bbf7d0',
                                    padding: '3px 8px',
                                    borderRadius: '6px',
                                    fontSize: '0.78rem',
                                    fontWeight: 700
                                  }}>
                                    <AtSign size={13} color="#16a34a" />
                                    <span>{mb.domainMailboxEmail}</span>
                                    <button
                                      type="button"
                                      title="Copy corporate email"
                                      onClick={() => {
                                        navigator.clipboard.writeText(mb.domainMailboxEmail);
                                        setCopiedMailboxEmail(mb.domainMailboxEmail);
                                        setTimeout(() => setCopiedMailboxEmail(null), 2000);
                                      }}
                                      style={{
                                        background: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: '2px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        color: '#166534'
                                      }}
                                    >
                                      {isCopied ? <Check size={12} color="#16a34a" /> : <Copy size={12} />}
                                    </button>
                                  </div>

                                  {/* Aliases if any */}
                                  {mb.aliases && mb.aliases.length > 0 && (
                                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                      {mb.aliases.map((alias, idx) => (
                                        <span
                                          key={idx}
                                          style={{
                                            fontSize: '0.68rem',
                                            color: '#64748b',
                                            background: '#f1f5f9',
                                            padding: '1px 5px',
                                            borderRadius: '4px',
                                            border: '1px solid #e2e8f0'
                                          }}
                                        >
                                          alias: {alias}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </td>

                              {/* Personal Contact */}
                              <td style={{ padding: '12px 14px', color: '#475569', fontSize: '0.78rem' }}>
                                <div>{mb.personalEmail || 'No personal email'}</div>
                                {mb.phoneNumber && <div style={{ color: '#64748b', fontSize: '0.72rem' }}>{mb.phoneNumber}</div>}
                              </td>

                              {/* Quota */}
                              <td style={{ padding: '12px 14px', whiteSpace: 'nowrap', fontSize: '0.78rem', color: '#475569' }}>
                                <span style={{ fontWeight: 600 }}>{Math.round((mb.mailboxQuotaMb || 5120) / 1024)} GB</span>
                                <span style={{ color: '#94a3b8', fontSize: '0.72rem', display: 'block' }}>({mb.mailboxQuotaMb || 5120} MB)</span>
                              </td>

                              {/* Status */}
                              <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                  <span 
                                    title={mb.mailboxStatus === 'ACTIVE' 
                                      ? 'Mailbox operational on Stalwart mail server' 
                                      : 'Account registered in CRM; awaiting server provisioning sync'}
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      padding: '2px 8px',
                                      borderRadius: '6px',
                                      fontSize: '0.74rem',
                                      fontWeight: 700,
                                      background: mb.mailboxStatus === 'ACTIVE' ? '#dcfce7' : '#fef3c7',
                                      color: mb.mailboxStatus === 'ACTIVE' ? '#15803d' : '#b45309'
                                    }}
                                  >
                                    {mb.mailboxStatus === 'ACTIVE' ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                                    {mb.mailboxStatus || 'ACTIVE'}
                                  </span>

                                  {/* Row-level quick sync button if queued */}
                                  {(mb.mailboxStatus === 'QUEUED' || mb.mailboxStatus === 'UNSYNCHRONIZED') && (
                                    <button
                                      type="button"
                                      onClick={() => handleSyncSingleMailbox(mb.id, mb.fullName)}
                                      disabled={syncingUserId === mb.id}
                                      title="Sync this mailbox with mail server now"
                                      style={{
                                        width: '24px',
                                        height: '24px',
                                        borderRadius: '6px',
                                        border: '1px solid #fde68a',
                                        background: '#fffbeb',
                                        color: '#b45309',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: syncingUserId === mb.id ? 'not-allowed' : 'pointer',
                                        padding: 0
                                      }}
                                    >
                                      <RotateCw size={12} className={syncingUserId === mb.id ? 'animate-spin' : ''} />
                                    </button>
                                  )}
                                </div>
                              </td>

                              {/* Actions */}
                              <td style={{ padding: '12px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                  <button
                                    type="button"
                                    onClick={() => window.open(mb.webmailUrl || 'https://mail.aadhirakshainsurance.com', '_blank', 'noopener,noreferrer')}
                                    title="Open Webmail client"
                                    style={{
                                      padding: '4px 8px',
                                      borderRadius: '6px',
                                      border: '1px solid #cbd5e1',
                                      background: '#ffffff',
                                      color: '#2563eb',
                                      fontSize: '0.74rem',
                                      fontWeight: 600,
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px'
                                    }}
                                  >
                                    <ExternalLink size={12} />
                                    Webmail
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => openMailboxDrawer(mb)}
                                    title="Manage credentials, aliases & server settings"
                                    style={{
                                      padding: '4px 8px',
                                      borderRadius: '6px',
                                      border: '1px solid #cbd5e1',
                                      background: '#f8fafc',
                                      color: '#334155',
                                      fontSize: '0.74rem',
                                      fontWeight: 600,
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px'
                                    }}
                                  >
                                    <Edit3 size={12} />
                                    Manage
                                  </button>
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

            </div>
          )}

          {/* SUB-TAB 5: DELIVERY & OTP LOGS */}
          {activeSubTab === 'delivery-logs' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Header card with Filters and Actions */}
              <div style={{
                background: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                padding: '1.25rem 1.5rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <History size={20} color="#4f46e5" />
                      Communication & OTP Delivery Logs
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.84rem', color: '#64748b' }}>
                      Real-time delivery diagnostics across Corporate Email (SMTP), Twilio SMS, WhatsApp, and Twilio Verify channels.
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => fetchLogs(logsPage)}
                      disabled={logsLoading}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 14px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        color: '#475569',
                        cursor: logsLoading ? 'not-allowed' : 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <RefreshCw size={14} className={logsLoading ? 'animate-spin' : ''} />
                      Refresh
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowPurgeModal(true);
                        setPurgeOption('7_days');
                        setPurgeConfirmText('');
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 14px',
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        borderRadius: '8px',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        color: '#b91c1c',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <Trash2 size={14} />
                      Purge Logs
                    </button>
                  </div>
                </div>

                {/* Filter Toolbar */}
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid #f1f5f9'
                }}>
                  {/* Search Input */}
                  <div style={{ position: 'relative', flex: '1 1 240px', minWidth: '200px' }}>
                    <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                      type="text"
                      placeholder="Search recipient phone or email..."
                      value={logsSearch}
                      onChange={(e) => setLogsSearch(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') fetchLogs(0);
                      }}
                      style={{
                        width: '100%',
                        padding: '8px 12px 8px 36px',
                        fontSize: '0.82rem',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        background: '#ffffff',
                        color: '#1e293b',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  {/* Channel Filter */}
                  <select
                    value={logsChannel}
                    onChange={(e) => setLogsChannel(e.target.value)}
                    style={{
                      padding: '8px 12px',
                      fontSize: '0.82rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      color: '#334155',
                      fontWeight: 500,
                      cursor: 'pointer'
                    }}
                  >
                    <option value="">All Channels</option>
                    <option value="SMTP_EMAIL">Corporate Email (SMTP)</option>
                    <option value="TWILIO_VERIFY_SMS">Twilio Verify SMS</option>
                    <option value="TWILIO_SMS">Twilio Programmable SMS</option>
                    <option value="TWILIO_WHATSAPP">Twilio WhatsApp</option>
                  </select>

                  {/* Status Filter */}
                  <select
                    value={logsStatus}
                    onChange={(e) => setLogsStatus(e.target.value)}
                    style={{
                      padding: '8px 12px',
                      fontSize: '0.82rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      color: '#334155',
                      fontWeight: 500,
                      cursor: 'pointer'
                    }}
                  >
                    <option value="">All Statuses</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="BLOCKED_BY_PROVIDER">Blocked By Provider</option>
                    <option value="FAILED">Failed</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => fetchLogs(0)}
                    style={{
                      padding: '8px 14px',
                      background: '#3b82f6',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Apply Filter
                  </button>
                </div>
              </div>

              {/* Logs Table Card */}
              <div style={{
                background: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                overflow: 'hidden'
              }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontWeight: 600 }}>
                        <th style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>Timestamp</th>
                        <th style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>Channel</th>
                        <th style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>Recipient</th>
                        <th style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>Status</th>
                        <th style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>Code</th>
                        <th style={{ padding: '10px 14px' }}>Diagnostic Summary</th>
                        <th style={{ padding: '10px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logsLoading ? (
                        <tr>
                          <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                            <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 8px auto', display: 'block', color: '#3b82f6' }} />
                            <span>Loading communication logs...</span>
                          </td>
                        </tr>
                      ) : logs.length === 0 ? (
                        <tr>
                          <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                            <History size={32} style={{ margin: '0 auto 8px auto', display: 'block', opacity: 0.5 }} />
                            <span>No communication delivery logs found matching the filter criteria.</span>
                          </td>
                        </tr>
                      ) : (
                        logs.map((log) => {
                          const isSuccess = log.status === 'DELIVERED';
                          const isBlocked = log.status === 'BLOCKED_BY_PROVIDER';
                          
                          let statusBg = '#f1f5f9';
                          let statusColor = '#475569';
                          if (isSuccess) {
                            statusBg = '#dcfce7';
                            statusColor = '#15803d';
                          } else if (isBlocked) {
                            statusBg = '#fef3c7';
                            statusColor = '#b45309';
                          } else {
                            statusBg = '#fee2e2';
                            statusColor = '#b91c1c';
                          }

                          let channelBg = '#eff6ff';
                          let channelColor = '#1d4ed8';
                          if (log.channel?.includes('WHATSAPP')) {
                            channelBg = '#ecfdf5';
                            channelColor = '#047857';
                          } else if (log.channel?.includes('VERIFY')) {
                            channelBg = '#eef2ff';
                            channelColor = '#4338ca';
                          } else if (log.channel?.includes('EMAIL')) {
                            channelBg = '#f0fdf4';
                            channelColor = '#15803d';
                          }

                          const rawFailureReason = log.failureReason || log.errorMessage || 'Dispatch failed or restricted by provider';

                          return (
                            <tr
                              key={log.id}
                              onClick={() => setSelectedLogForDrawer(log)}
                              style={{
                                borderBottom: '1px solid #f1f5f9',
                                cursor: 'pointer',
                                transition: 'background 0.15s ease'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                              <td style={{ padding: '10px 14px', color: '#64748b', whiteSpace: 'nowrap', fontSize: '0.78rem' }}>
                                {log.createdAt ? new Date(log.createdAt).toLocaleString('en-IN', {
                                  day: '2-digit',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                }) : 'N/A'}
                              </td>
                              <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                                <span style={{
                                  display: 'inline-block',
                                  padding: '2px 7px',
                                  borderRadius: '6px',
                                  fontSize: '0.72rem',
                                  fontWeight: 600,
                                  background: channelBg,
                                  color: channelColor
                                }}>
                                  {log.channel}
                                </span>
                              </td>
                              <td style={{ padding: '10px 14px', fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap', fontSize: '0.78rem' }}>
                                {log.recipient || log.recipientPhone || 'N/A'}
                              </td>
                              <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                                <span style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '2px 7px',
                                  borderRadius: '6px',
                                  fontSize: '0.72rem',
                                  fontWeight: 600,
                                  background: statusBg,
                                  color: statusColor
                                }}>
                                  {isSuccess && <CheckCircle2 size={11} />}
                                  {isBlocked && <AlertTriangle size={11} />}
                                  {!isSuccess && !isBlocked && <AlertCircle size={11} />}
                                  {log.status}
                                </span>
                              </td>
                              <td style={{ padding: '10px 14px', color: '#64748b', fontFamily: 'monospace', fontSize: '0.74rem', whiteSpace: 'nowrap' }}>
                                {log.providerCode ? `HTTP ${log.providerCode}` : (log.providerSid || 'N/A')}
                              </td>
                              <td style={{ padding: '10px 14px', color: isSuccess ? '#166534' : isBlocked ? '#b45309' : '#b91c1c', maxWidth: '320px' }}>
                                <div style={{
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  fontSize: '0.78rem'
                                }}>
                                  {isSuccess ? 'Verification OTP dispatched successfully' : rawFailureReason}
                                </div>
                              </td>
                              <td style={{ padding: '10px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedLogForDrawer(log);
                                  }}
                                  style={{
                                    padding: '3px 9px',
                                    borderRadius: '6px',
                                    border: '1px solid #cbd5e1',
                                    background: '#ffffff',
                                    color: '#2563eb',
                                    fontSize: '0.72rem',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                  }}
                                >
                                  Inspect
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination footer */}
                <div style={{
                  padding: '12px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: '#f8fafc',
                  borderTop: '1px solid #e2e8f0',
                  fontSize: '0.82rem',
                  color: '#64748b'
                }}>
                  <div>
                    Showing <strong>{logs.length}</strong> of <strong>{logsTotal}</strong> log entries
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      disabled={logsPage <= 0 || logsLoading}
                      onClick={() => fetchLogs(logsPage - 1)}
                      style={{
                        padding: '5px 12px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        background: '#ffffff',
                        fontSize: '0.8rem',
                        cursor: logsPage <= 0 ? 'not-allowed' : 'pointer',
                        color: logsPage <= 0 ? '#94a3b8' : '#334155'
                      }}
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      disabled={(logsPage + 1) * 15 >= logsTotal || logsLoading}
                      onClick={() => fetchLogs(logsPage + 1)}
                      style={{
                        padding: '5px 12px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        background: '#ffffff',
                        fontSize: '0.8rem',
                        cursor: (logsPage + 1) * 15 >= logsTotal ? 'not-allowed' : 'pointer',
                        color: (logsPage + 1) * 15 >= logsTotal ? '#94a3b8' : '#334155'
                      }}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>

            </div>
          )}

        </main>
      </div>

      {/* SAFE PURGE LOGS MODAL (Crisp UX standard: no frosted backdrop blur) */}
      {showPurgeModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'none',
          WebkitBackdropFilter: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            maxWidth: '520px',
            width: '100%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#fff1f2'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#ffe4e6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e11d48' }}>
                  <Trash2 size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#9f1239' }}>Purge Communication Logs</h3>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#be123c' }}>Audit compliance and storage hygiene control</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPurgeModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#9f1239',
                  fontSize: '1.2rem',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '1rem',
                fontSize: '0.82rem',
                color: '#475569',
                lineHeight: 1.5
              }}>
                <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Shield size={15} color="#3b82f6" />
                  Compliance Standard
                </div>
                Industry best practices recommend retaining recent delivery attempts for regulatory audit trails. Choose an archival retention window below:
              </div>

              {/* Options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '12px',
                  borderRadius: '10px',
                  border: `1.5px solid ${purgeOption === '7_days' ? '#3b82f6' : '#e2e8f0'}`,
                  background: purgeOption === '7_days' ? '#eff6ff' : '#ffffff',
                  cursor: 'pointer'
                }}>
                  <input
                    type="radio"
                    name="purgeOption"
                    value="7_days"
                    checked={purgeOption === '7_days'}
                    onChange={() => setPurgeOption('7_days')}
                    style={{ marginTop: '3px' }}
                  />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.86rem', color: '#1e293b' }}>
                      Prune logs older than 7 days (Recommended)
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      Retains the current week of verification diagnostics while clearing historical database records.
                    </div>
                  </div>
                </label>

                <label style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '12px',
                  borderRadius: '10px',
                  border: `1.5px solid ${purgeOption === '30_days' ? '#3b82f6' : '#e2e8f0'}`,
                  background: purgeOption === '30_days' ? '#eff6ff' : '#ffffff',
                  cursor: 'pointer'
                }}>
                  <input
                    type="radio"
                    name="purgeOption"
                    value="30_days"
                    checked={purgeOption === '30_days'}
                    onChange={() => setPurgeOption('30_days')}
                    style={{ marginTop: '3px' }}
                  />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.86rem', color: '#1e293b' }}>
                      Prune logs older than 30 days
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      Keeps 1 month of delivery logs for monthly reconciliation and client inquiries.
                    </div>
                  </div>
                </label>

                <label style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '12px',
                  borderRadius: '10px',
                  border: `1.5px solid ${purgeOption === 'all' ? '#ef4444' : '#e2e8f0'}`,
                  background: purgeOption === 'all' ? '#fef2f2' : '#ffffff',
                  cursor: 'pointer'
                }}>
                  <input
                    type="radio"
                    name="purgeOption"
                    value="all"
                    checked={purgeOption === 'all'}
                    onChange={() => setPurgeOption('all')}
                    style={{ marginTop: '3px' }}
                  />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.86rem', color: '#b91c1c' }}>
                      Purge All Logs (Danger Zone)
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      Instantly truncates all delivery history across all channels.
                    </div>
                  </div>
                </label>
              </div>

              {/* Guarded typing check if Purge All is selected */}
              {purgeOption === 'all' && (
                <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '8px', padding: '12px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#9f1239', marginBottom: '6px' }}>
                    Type <code style={{ background: '#ffe4e6', padding: '2px 4px', borderRadius: '4px' }}>PURGE ALL</code> to confirm:
                  </label>
                  <input
                    type="text"
                    placeholder="PURGE ALL"
                    value={purgeConfirmText}
                    onChange={(e) => setPurgeConfirmText(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      fontSize: '0.84rem',
                      borderRadius: '6px',
                      border: '1px solid #fda4af',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '1rem 1.5rem',
              background: '#f8fafc',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px'
            }}>
              <button
                type="button"
                onClick={() => setShowPurgeModal(false)}
                disabled={isPurging}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  color: '#475569',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecutePurge}
                disabled={isPurging || (purgeOption === 'all' && purgeConfirmText.trim() !== 'PURGE ALL')}
                style={{
                  padding: '8px 18px',
                  borderRadius: '8px',
                  border: 'none',
                  background: purgeOption === 'all' ? '#dc2626' : '#2563eb',
                  color: '#ffffff',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  cursor: isPurging || (purgeOption === 'all' && purgeConfirmText.trim() !== 'PURGE ALL') ? 'not-allowed' : 'pointer',
                  opacity: isPurging || (purgeOption === 'all' && purgeConfirmText.trim() !== 'PURGE ALL') ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {isPurging ? <RefreshCw size={14} className="animate-spin" /> : <Trash2 size={14} />}
                {purgeOption === 'all' ? 'Confirm Purge All' : 'Execute Retention Purge'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SLIDE-OVER INSPECTION DRAWER (Stripe / Datadog Standard) */}
      {selectedLogForDrawer && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'none',
          WebkitBackdropFilter: 'none',
          display: 'flex',
          justifyContent: 'flex-end',
          zIndex: 9999
        }}>
          <div style={{
            background: '#ffffff',
            width: '100%',
            maxWidth: '480px',
            height: '100%',
            boxShadow: '-4px 0 25px rgba(0, 0, 0, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            animation: 'slideInRight 0.2s ease-out'
          }}>
            {/* Drawer Header */}
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#f8fafc'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <History size={18} color="#4f46e5" />
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Delivery Event Diagnostic</h3>
                </div>
                <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
                  ID #{selectedLogForDrawer.id} • {selectedLogForDrawer.createdAt ? new Date(selectedLogForDrawer.createdAt).toLocaleString('en-IN') : 'N/A'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLogForDrawer(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.2rem',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '6px'
                }}
              >
                ✕
              </button>
            </div>

            {/* Drawer Body */}
            <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1 }}>
              {/* Status Banner */}
              <div style={{
                padding: '12px 14px',
                borderRadius: '10px',
                border: selectedLogForDrawer.status === 'DELIVERED' ? '1px solid #bbf7d0' : selectedLogForDrawer.status === 'BLOCKED_BY_PROVIDER' ? '1px solid #fde68a' : '1px solid #fecaca',
                background: selectedLogForDrawer.status === 'DELIVERED' ? '#f0fdf4' : selectedLogForDrawer.status === 'BLOCKED_BY_PROVIDER' ? '#fffbeb' : '#fef2f2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {selectedLogForDrawer.status === 'DELIVERED' ? <CheckCircle2 size={18} color="#16a34a" /> : <AlertTriangle size={18} color="#d97706" />}
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.86rem', color: selectedLogForDrawer.status === 'DELIVERED' ? '#15803d' : '#b45309' }}>
                      {selectedLogForDrawer.status}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                      {selectedLogForDrawer.purpose || 'TRANSACTIONAL_OTP'}
                    </div>
                  </div>
                </div>
                <span style={{
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#334155'
                }}>
                  {selectedLogForDrawer.providerCode ? `HTTP ${selectedLogForDrawer.providerCode}` : 'HTTP 200'}
                </span>
              </div>

              {/* Channel & Recipient Summary Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Channel</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1e293b', marginTop: '2px' }}>
                    {selectedLogForDrawer.channel}
                  </div>
                </div>
                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Recipient</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1e293b', marginTop: '2px' }}>
                    {selectedLogForDrawer.recipient || selectedLogForDrawer.recipientPhone}
                  </div>
                </div>
              </div>

              {/* Diagnostic Message Block */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#334155' }}>Diagnostic Analysis</span>
                  <button
                    type="button"
                    onClick={() => copyLogText(selectedLogForDrawer.failureReason || 'Dispatched successfully', 'diagnostic')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: 'none',
                      border: 'none',
                      color: '#2563eb',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <Copy size={12} />
                    Copy
                  </button>
                </div>
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '0.8rem',
                  lineHeight: 1.5,
                  color: selectedLogForDrawer.status === 'DELIVERED' ? '#166534' : '#b45309'
                }}>
                  {selectedLogForDrawer.failureReason || 'Verification request created and dispatched successfully to carrier gateway.'}
                </div>
              </div>

              {/* Raw Provider Payload Section */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#334155' }}>Raw Twilio Gateway Response</span>
                  {selectedLogForDrawer.payloadSummary && (
                    <button
                      type="button"
                      onClick={() => copyLogText(selectedLogForDrawer.payloadSummary, 'raw payload')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: 'none',
                        border: 'none',
                        color: '#2563eb',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      <Copy size={12} />
                      Copy JSON
                    </button>
                  )}
                </div>
                <div style={{
                  background: '#0f172a',
                  color: '#e2e8f0',
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '0.76rem',
                  fontFamily: 'monospace',
                  lineHeight: 1.45,
                  wordBreak: 'break-all',
                  maxHeight: '180px',
                  overflowY: 'auto'
                }}>
                  {selectedLogForDrawer.payloadSummary || 'No raw response body captured (Standard HTTP 200 OK)'}
                </div>
              </div>

              {/* Recommended Remediation Guidance */}
              {selectedLogForDrawer.status === 'BLOCKED_BY_PROVIDER' && (
                <div style={{
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: '10px',
                  padding: '12px',
                  fontSize: '0.78rem',
                  color: '#1e40af',
                  lineHeight: 1.45
                }}>
                  <div style={{ fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Shield size={14} color="#2563eb" />
                    How to Resolve in Twilio Console:
                  </div>
                  <ol style={{ margin: '4px 0 0 16px', padding: 0 }}>
                    <li>Log into <strong>Twilio Console &gt; Verify &gt; Services</strong>.</li>
                    <li>Select Service SID: <code style={{ background: '#dbeafe', padding: '1px 4px', borderRadius: '4px' }}>VAef8643...</code></li>
                    <li>Navigate to <strong>Fraud Guard</strong> and whitelist India (+91) or lower SMS protection threshold.</li>
                    <li>Or test using <strong>WhatsApp Channel</strong> which bypasses SMS carrier filtering.</li>
                  </ol>
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div style={{
              padding: '1rem 1.5rem',
              borderTop: '1px solid #e2e8f0',
              background: '#f8fafc',
              display: 'flex',
              justifyContent: 'flex-end'
            }}>
              <button
                type="button"
                onClick={() => setSelectedLogForDrawer(null)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  background: '#334155',
                  color: '#ffffff',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* IN-CONTEXT MAILBOX MANAGEMENT DRAWER (SLIDE-OVER PANEL) */}
      {/* ========================================================================= */}
      {managingMailbox && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'none',
          WebkitBackdropFilter: 'none',
          zIndex: 9999,
          display: 'flex',
          justifyContent: 'flex-end',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '520px',
            background: '#ffffff',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.18)',
            animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            
            {/* Header */}
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#f8fafc'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: '#ecfdf5',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <AtSign size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f2b48' }}>
                    {managingMailbox.fullName}
                  </h3>
                  <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                    Corporate Mailbox Manager • {managingMailbox.designation || 'Staff'}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={closeMailboxDrawer}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  background: '#ffffff',
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div style={{
              padding: '1.5rem',
              overflowY: 'auto',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem'
            }}>

              {/* Primary Address & Status Card */}
              <div style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '12px',
                padding: '14px'
              }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Primary Email Address
                </div>
                <div style={{ fontSize: '0.96rem', fontWeight: 800, color: '#14532d', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>{managingMailbox.domainMailboxEmail}</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(managingMailbox.domainMailboxEmail);
                      toast.success('Copied corporate email to clipboard');
                    }}
                    title="Copy Email"
                    style={{
                      background: '#dcfce7',
                      border: '1px solid #86efac',
                      borderRadius: '6px',
                      padding: '4px 8px',
                      color: '#15803d',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Copy size={12} />
                    Copy
                  </button>
                </div>
                <div style={{ marginTop: '8px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '12px',
                    background: '#dcfce7',
                    color: '#15803d'
                  }}>
                    ● Operational (Stalwart)
                  </span>
                  <span style={{ fontSize: '0.74rem', color: '#166534' }}>
                    Quota: {Math.round((managingMailbox.mailboxQuotaMb || 5120) / 1024)} GB (5,120 MB)
                  </span>
                </div>

                {/* Rename Primary Handle Action Box */}
                {!isRenaming ? (
                  <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.74rem', color: '#166534' }}>
                      Wrong handle or test email?
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsRenaming(true);
                        const currentHandle = managingMailbox.domainMailboxEmail.split('@')[0];
                        setRenameHandleInput(currentHandle);
                      }}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #86efac',
                        borderRadius: '6px',
                        padding: '3px 8px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: '#15803d',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Edit3 size={11} />
                      Rename / Change Handle
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleExecuteRename} style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #bbf7d0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#166534' }}>
                      Enter real / new email handle:
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ position: 'relative', flex: 1 }}>
                        <input
                          type="text"
                          placeholder="e.g. nagaraju.n"
                          value={renameHandleInput}
                          onChange={(e) => setRenameHandleInput(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '6px 10px',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            borderRadius: '6px',
                            border: '1px solid #86efac',
                            background: '#ffffff',
                            color: '#0f2b48',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                      <span style={{ fontSize: '0.74rem', color: '#166534', fontWeight: 700, whiteSpace: 'nowrap' }}>
                        @aadhirakshainsurance.com
                      </span>
                    </div>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: '#166534', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={renameKeepOldAlias}
                        onChange={(e) => setRenameKeepOldAlias(e.target.checked)}
                      />
                      <span>Keep previous email as an alias (preserves inbound mail)</span>
                    </label>

                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', marginTop: '2px' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setIsRenaming(false);
                          setRenameHandleInput('');
                        }}
                        style={{
                          padding: '4px 8px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          background: '#ffffff',
                          color: '#64748b',
                          fontSize: '0.72rem',
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={renameSaving || !renameHandleInput.trim()}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          border: 'none',
                          background: '#15803d',
                          color: '#ffffff',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          cursor: (renameSaving || !renameHandleInput.trim()) ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {renameSaving ? 'Updating...' : 'Save & Update on Server'}
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Password Generator / Reset Section */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.86rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Key size={16} color="#2563eb" />
                    Mailbox Access Credentials
                  </div>
                  <button
                    type="button"
                    onClick={handleDrawerResetPassword}
                    disabled={resettingPassword}
                    style={{
                      background: '#eff6ff',
                      color: '#2563eb',
                      border: '1px solid #bfdbfe',
                      borderRadius: '6px',
                      padding: '5px 10px',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      cursor: resettingPassword ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {resettingPassword ? 'Generating...' : 'Generate New Password'}
                  </button>
                </div>
                <p style={{ margin: 0, fontSize: '0.74rem', color: '#64748b', lineHeight: 1.4 }}>
                  Use this password to log in to Webmail, Outlook, Apple Mail, or Thunderbird.
                </p>

                {generatedPassword && (
                  <div style={{
                    background: '#fef3c7',
                    border: '1px solid #fde68a',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px'
                  }}>
                    <div style={{ minWidth: 0 }}>
                      <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#92400e', textTransform: 'uppercase', display: 'block' }}>
                        Temporary Generated Password:
                      </span>
                      <code style={{ fontSize: '0.92rem', fontWeight: 800, color: '#78350f', fontFamily: 'monospace' }}>
                        {generatedPassword}
                      </code>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedPassword);
                        toast.success('Password copied to clipboard!');
                      }}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        padding: '4px 8px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        color: '#78350f'
                      }}
                    >
                      Copy
                    </button>
                  </div>
                )}
              </div>

              {/* Alternate Aliases Manager */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                <div style={{ fontWeight: 800, fontSize: '0.86rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Tag size={16} color="#059669" />
                  Email Aliases & Alternate Handles
                </div>
                <p style={{ margin: 0, fontSize: '0.74rem', color: '#64748b' }}>
                  Emails sent to aliases are delivered to this mailbox with zero quota duplication.
                </p>

                {/* Add Alias Input */}
                <form onSubmit={handleDrawerAddAlias} style={{ display: 'flex', gap: '6px' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <input
                      type="text"
                      placeholder="e.g. nagaraju or support"
                      value={newAliasInput}
                      onChange={(e) => setNewAliasInput(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '6px 10px',
                        fontSize: '0.78rem',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={aliasSaving || !newAliasInput.trim()}
                    style={{
                      background: '#059669',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      cursor: (aliasSaving || !newAliasInput.trim()) ? 'not-allowed' : 'pointer',
                      opacity: (aliasSaving || !newAliasInput.trim()) ? 0.6 : 1,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Plus size={13} />
                    Add Alias
                  </button>
                </form>

                {/* Aliases List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                  {drawerSettings?.aliases && drawerSettings.aliases.length > 0 ? (
                    drawerSettings.aliases.map((alias, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '6px 10px',
                          borderRadius: '8px',
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          fontSize: '0.78rem'
                        }}
                      >
                        <span style={{ fontWeight: 600, color: '#334155' }}>{alias}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => handleDrawerSetPrimary(alias)}
                            disabled={aliasSaving}
                            style={{
                              background: '#eff6ff',
                              color: '#2563eb',
                              border: '1px solid #bfdbfe',
                              borderRadius: '4px',
                              padding: '2px 6px',
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            Set Primary
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDrawerRemoveAlias(alias)}
                            disabled={aliasSaving}
                            title="Remove alias"
                            style={{
                              background: '#fef2f2',
                              color: '#ef4444',
                              border: '1px solid #fecaca',
                              borderRadius: '4px',
                              padding: '2px 6px',
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ fontSize: '0.74rem', color: '#94a3b8', fontStyle: 'italic', padding: '4px 0' }}>
                      No alternate aliases configured yet.
                    </div>
                  )}
                </div>
              </div>

              {/* Client Connection Settings (IMAP / SMTP) */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ fontWeight: 800, fontSize: '0.84rem', color: '#0f172a' }}>
                  Desktop & Mobile Connection Setup
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.74rem' }}>
                  <div style={{ background: '#ffffff', padding: '8px 10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontWeight: 700, color: '#2563eb' }}>IMAP (Incoming)</div>
                    <div>Host: <code>mail.aadhirakshainsurance.com</code></div>
                    <div>Port: <code>993 (SSL/TLS)</code></div>
                  </div>
                  <div style={{ background: '#ffffff', padding: '8px 10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontWeight: 700, color: '#059669' }}>SMTP (Outgoing)</div>
                    <div>Host: <code>mail.aadhirakshainsurance.com</code></div>
                    <div>Port: <code>465 (SSL/TLS)</code></div>
                  </div>
                </div>
              </div>

              {/* Danger Zone: Deprovision / Delete Test Mailbox */}
              <div style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '12px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#991b1b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertTriangle size={15} color="#dc2626" />
                  Deprovision Mailbox (Free Quota & Cleanup)
                </div>
                <p style={{ margin: 0, fontSize: '0.74rem', color: '#7f1d1d', lineHeight: 1.4 }}>
                  If this is a test email or no longer needed, deprovisioning removes the mailbox from Stalwart and frees the 5GB quota. The employee’s CRM account and data remain safe.
                </p>

                {!deprovisionConfirmOpen ? (
                  <button
                    type="button"
                    onClick={() => setDeprovisionConfirmOpen(true)}
                    style={{
                      alignSelf: 'flex-start',
                      background: '#ffffff',
                      color: '#dc2626',
                      border: '1px solid #f87171',
                      borderRadius: '6px',
                      padding: '5px 12px',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      marginTop: '4px'
                    }}
                  >
                    <Trash2 size={13} />
                    Delete & Deprovision Mailbox...
                  </button>
                ) : (
                  <div style={{ background: '#ffffff', border: '1px solid #fca5a5', borderRadius: '8px', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                    <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#991b1b' }}>
                      Are you sure? This permanently deletes {managingMailbox.domainMailboxEmail} on the mail server.
                    </div>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() => setDeprovisionConfirmOpen(false)}
                        disabled={deprovisionLoading}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          background: '#ffffff',
                          color: '#64748b',
                          fontSize: '0.72rem',
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleExecuteDeprovision}
                        disabled={deprovisionLoading}
                        style={{
                          padding: '4px 12px',
                          borderRadius: '6px',
                          border: 'none',
                          background: '#dc2626',
                          color: '#ffffff',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          cursor: deprovisionLoading ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {deprovisionLoading ? 'Deleting...' : 'Confirm Deprovision'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Footer */}
            <div style={{
              padding: '1rem 1.5rem',
              borderTop: '1px solid #e2e8f0',
              background: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <button
                type="button"
                onClick={() => window.open(managingMailbox.webmailUrl || 'https://mail.aadhirakshainsurance.com', '_blank', 'noopener,noreferrer')}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#2563eb',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <ExternalLink size={14} />
                Open Webmail Client
              </button>

              <button
                type="button"
                onClick={closeMailboxDrawer}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  background: '#334155',
                  color: '#ffffff',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
