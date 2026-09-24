import React, { useState, useEffect } from 'react';
import { 
  X, 
  Phone, 
  MessageSquare, 
  Calendar, 
  Mail, 
  Building2, 
  MapPin, 
  ShieldCheck, 
  FileText, 
  Clock, 
  CheckCircle2, 
  Upload, 
  Download, 
  ExternalLink,
  Tag,
  User,
  AlertCircle,
  UserCheck,
  UserPlus,
  Check,
  RefreshCw,
  Globe,
  HeartHandshake,
  DollarSign,
  Award,
  PhoneCall,
  Sparkles,
  Trash2,
  Layers,
  Activity,
  Copy,
  Send,
  Heart,
  Car,
  Shield,
  Landmark,
  Briefcase,
  Plane,
  Plus,
  Edit3,
  Eye
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { crmService, leadInquiryService, portalService } from '../../services/api';
import { normalizePhoneNumber, formatWhatsAppNumber, calculateCustomerTouchpoints } from '../../utils/crmDeduplication';
import WhatsAppIcon from '../common/WhatsAppIcon';
import ScheduleActivityModal from './ScheduleActivityModal';
import ClientLifecyclePipeline from './common/ClientLifecyclePipeline';
import WhatsAppComposeModal from './WhatsAppComposeModal';

export default function Client360Drawer({ client, onClose, onOpenCallModal, onOpenMeetingModal, onLeadUpdated }) {
  if (!client) return null;

  const { isSuperAdmin, isManager, user } = useAuth();
  const canReassign = isSuperAdmin || isManager;

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'calls' | 'quotes' | 'documents' | 'timeline'
  const [currentClient, setCurrentClient] = useState(client);
  const [advisors, setAdvisors] = useState([]);
  const [scheduleModalState, setScheduleModalState] = useState({ isOpen: false, initialType: 'MEETING' });
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  
  // Pipeline Stage Transition State
  const [isUpdatingStage, setIsUpdatingStage] = useState(false);

  // Quick Note Composer State
  const [quickNoteText, setQuickNoteText] = useState('');
  const [isPostingNote, setIsPostingNote] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  // Reassign Modal state
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [targetAdvisorId, setTargetAdvisorId] = useState(client.assignedAdvisorId ? String(client.assignedAdvisorId) : '');
  const [reassignReason, setReassignReason] = useState('');
  const [reassigning, setReassigning] = useState(false);

  // Live Audit Logs State
  const [auditLogs, setAuditLogs] = useState([]);
  const [loadingAudit, setLoadingAudit] = useState(false);

  // Live Quotations State
  const [clientQuotes, setClientQuotes] = useState([]);
  const [loadingQuotes, setLoadingQuotes] = useState(false);
  const [showCreateQuoteModal, setShowCreateQuoteModal] = useState(false);
  const [viewingQuoteDetails, setViewingQuoteDetails] = useState(null);
  const [editingQuoteId, setEditingQuoteId] = useState(null);
  const [creatingQuote, setCreatingQuote] = useState(false);
  const [quoteFormData, setQuoteFormData] = useState({
    insurerName: 'Star Health and Allied Insurance',
    planName: '',
    planVariant: 'Comprehensive',
    sumInsured: '₹10,00,000',
    policyTenureYears: 1,
    basePremium: '',
    ncbDiscountPercent: 0,
    roomRentLimit: 'No Cap / Single Private Room',
    copayPercentage: '0%',
    restorationBenefit: '100% Unlimited Recharge',
    prePostHospitalization: '60 Days Pre / 180 Days Post',
    maternityCovered: false,
    opdCovered: false,
    notes: ''
  });

  // Live Documents State
  const [clientDocs, setClientDocs] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);

  // Live Call Logs State
  const [clientCalls, setClientCalls] = useState([]);
  const [loadingCalls, setLoadingCalls] = useState(false);

  // Live Multi-Product Opportunities & Cross-Entity Inquiries (Unified FSC Graph)
  const [clientOpportunities, setClientOpportunities] = useState([]);
  const [linkedInquiries, setLinkedInquiries] = useState([]);
  const [loadingOpportunities, setLoadingOpportunities] = useState(false);
  const [updatingOppId, setUpdatingOppId] = useState(null);

  // Quick Add Product Opportunity Modal State
  const [showAddOpportunityModal, setShowAddOpportunityModal] = useState(false);
  const [isCreatingOpportunity, setIsCreatingOpportunity] = useState(false);
  const [portfolioCategoryFilter, setPortfolioCategoryFilter] = useState('ALL');
  const [newOpportunityData, setNewOpportunityData] = useState({
    categorySlug: 'HEALTH',
    productName: 'Health Insurance',
    coverageAmount: '₹10,00,000',
    estimatedPremium: '',
    stage: 'NEW_LEAD',
    priority: 'MEDIUM',
    notes: ''
  });

  const handleCreateOpportunity = async (e) => {
    e.preventDefault();
    if (!currentClient?.id) return;
    setIsCreatingOpportunity(true);
    try {
      const payload = {
        categorySlug: newOpportunityData.categorySlug,
        productName: newOpportunityData.productName || `${newOpportunityData.categorySlug} Insurance`,
        coverageAmount: newOpportunityData.coverageAmount || 'As Requested',
        estimatedPremium: newOpportunityData.estimatedPremium ? Number(newOpportunityData.estimatedPremium) : null,
        stage: newOpportunityData.stage || 'NEW_LEAD',
        priority: newOpportunityData.priority || 'MEDIUM',
        notes: newOpportunityData.notes || '',
        assignedAdvisorId: currentClient.assignedAdvisorId || null
      };

      await crmService.createOpportunity(currentClient.id, payload);
      toast.success(`New ${newOpportunityData.categorySlug} opportunity linked to client!`);
      setShowAddOpportunityModal(false);
      setNewOpportunityData({
        categorySlug: 'HEALTH',
        productName: 'Health Insurance',
        coverageAmount: '₹10,00,000',
        estimatedPremium: '',
        stage: 'NEW_LEAD',
        priority: 'MEDIUM',
        notes: ''
      });

      // Reload opportunities, audit logs, and trigger parent refresh
      await loadClientOpportunitiesAndInquiries(currentClient);
      loadClientAuditLogs(currentClient.id);
      if (onLeadUpdated) onLeadUpdated();
    } catch (err) {
      console.error('Failed to create opportunity:', err);
      toast.error(err.response?.data?.message || 'Failed to add opportunity');
    } finally {
      setIsCreatingOpportunity(false);
    }
  };

  useEffect(() => {
    setCurrentClient(client);
    setTargetAdvisorId(client.assignedAdvisorId ? String(client.assignedAdvisorId) : '');
    if (client?.id) {
      loadFullClientDetails(client.id);
      loadClientAuditLogs(client.id);
      loadClientQuotes(client.id);
      loadClientDocs(client.id);
      loadClientCalls(client.id);
      loadClientOpportunitiesAndInquiries(client);
    }
  }, [client]);

  const loadClientOpportunitiesAndInquiries = async (targetClient) => {
    setLoadingOpportunities(true);
    try {
      const [opps, allQuotes] = await Promise.all([
        crmService.getClientOpportunities(targetClient.id).catch(() => []),
        portalService.getAdminQuotes().catch(() => [])
      ]);
      setClientOpportunities(opps || []);

      // Transitively match web quote inquiries across phone, email, or clientCode
      const touchpoints = calculateCustomerTouchpoints(targetClient, allQuotes, [targetClient]);
      setLinkedInquiries(touchpoints.matchedQuotes || []);
    } catch (err) {
      console.warn('Could not load client opportunities/inquiries:', err);
    } finally {
      setLoadingOpportunities(false);
    }
  };

  const loadFullClientDetails = async (clientId) => {
    try {
      const fullClient = await crmService.getClientById(clientId);
      if (fullClient && fullClient.id) {
        setCurrentClient(prev => ({ ...prev, ...fullClient }));
        if (fullClient.assignedAdvisorId) {
          setTargetAdvisorId(String(fullClient.assignedAdvisorId));
        }
      }
    } catch (err) {
      console.warn('Could not fetch full client details, using basic props:', err);
    }
  };

  const loadClientCalls = async (clientId) => {
    setLoadingCalls(true);
    try {
      const data = await crmService.getClientCallLogs(clientId);
      setClientCalls(data || []);
    } catch (err) {
      console.error('Failed to load client call logs:', err);
    } finally {
      setLoadingCalls(false);
    }
  };

  const loadClientDocs = async (clientId) => {
    setLoadingDocs(true);
    try {
      const data = await crmService.getClientDocuments(clientId);
      setClientDocs(data || []);
    } catch (err) {
      console.error('Failed to load client documents:', err);
    } finally {
      setLoadingDocs(false);
    }
  };

  const loadClientQuotes = async (clientId) => {
    setLoadingQuotes(true);
    try {
      const data = await crmService.getClientQuotations(clientId);
      setClientQuotes(data || []);
    } catch (err) {
      console.error('Failed to load client quotations:', err);
    } finally {
      setLoadingQuotes(false);
    }
  };

  const loadClientAuditLogs = async (clientId) => {
    setLoadingAudit(true);
    try {
      const logs = await crmService.getClientAuditLogs(clientId);
      setAuditLogs(logs || []);
    } catch (err) {
      console.error('Failed to load client audit logs:', err);
    } finally {
      setLoadingAudit(false);
    }
  };

  useEffect(() => {
    if (canReassign) {
      loadAdvisors();
    }
  }, [canReassign]);

  const loadAdvisors = async () => {
    try {
      const data = await crmService.getAdvisors();
      setAdvisors(data || []);
    } catch (err) {
      console.error('Failed to load advisors:', err);
    }
  };

  const handleReassignSubmit = async (e) => {
    e.preventDefault();
    if (!targetAdvisorId) {
      alert('Please select an Advisor');
      return;
    }
    setReassigning(true);
    try {
      const updated = await crmService.reassignLead(
        currentClient.id,
        Number(targetAdvisorId),
        reassignReason || 'Reassigned from Client 360 Drawer'
      );
      
      setCurrentClient(prev => ({ ...prev, ...updated }));
      setShowReassignModal(false);
      if (onLeadUpdated) onLeadUpdated(updated);
      loadClientAuditLogs(currentClient.id);
    } catch (err) {
      alert('Failed to reassign client: ' + (err.response?.data?.message || err.message));
    } finally {
      setReassigning(false);
    }
  };

  const openWhatsApp = () => {
    setShowWhatsAppModal(true);
  };

  const handleWhatsAppSent = async ({ templateLabel, messageText }) => {
    try {
      const dateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
      const newNoteEntry = `[${dateStr}] 🟢 WhatsApp message sent by ${user?.name || user?.fullName || 'Advisor'} (${templateLabel})`;
      const currentNotes = currentClient.notes ? currentClient.notes.trim() : '';
      const updatedNotes = currentNotes ? `${currentNotes}\n${newNoteEntry}` : newNoteEntry;

      const updated = await crmService.updateLead(currentClient.id, {
        ...currentClient,
        notes: updatedNotes
      });

      setCurrentClient(prev => ({ ...prev, ...updated, notes: updatedNotes }));
      if (onLeadUpdated) onLeadUpdated({ ...currentClient, ...updated, notes: updatedNotes });
      loadClientAuditLogs(currentClient.id);
    } catch (err) {
      console.warn('Could not auto-log WhatsApp outreach note:', err);
    }
  };

  const handleCopyText = (text, fieldKey) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleStageTransition = async (newStage) => {
    if (!currentClient?.id || currentClient.stage === newStage || isUpdatingStage) return;
    setIsUpdatingStage(true);
    try {
      const updated = await crmService.updateLead(currentClient.id, {
        ...currentClient,
        stage: newStage
      });
      setCurrentClient(prev => ({ ...prev, ...updated, stage: newStage }));
      if (onLeadUpdated) onLeadUpdated({ ...currentClient, ...updated, stage: newStage });
      
      // Refresh audit logs to show the new stage transition in the timeline
      loadClientAuditLogs(currentClient.id);
    } catch (err) {
      console.error('Failed to transition stage:', err);
      alert('Failed to update stage: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsUpdatingStage(false);
    }
  };

  const handlePostQuickNote = async (e) => {
    e?.preventDefault();
    if (!quickNoteText.trim() || !currentClient?.id || isPostingNote) return;
    setIsPostingNote(true);
    try {
      const dateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
      const newNoteEntry = `[${dateStr}] 📝 ${user?.name || user?.fullName || 'Advisor'}: ${quickNoteText.trim()}`;
      const currentNotes = currentClient.notes ? currentClient.notes.trim() : '';
      const updatedNotes = currentNotes ? `${currentNotes}\n${newNoteEntry}` : newNoteEntry;

      const updated = await crmService.updateLead(currentClient.id, {
        ...currentClient,
        notes: updatedNotes
      });

      setCurrentClient(prev => ({ ...prev, ...updated, notes: updatedNotes }));
      setQuickNoteText('');
      if (onLeadUpdated) onLeadUpdated({ ...currentClient, ...updated, notes: updatedNotes });
      loadClientAuditLogs(currentClient.id);
    } catch (err) {
      console.error('Failed to post quick note:', err);
      alert('Failed to post note: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsPostingNote(false);
    }
  };

  const handleInquiryStageTransition = async (item, targetStageKey, noteEntry, shortReason) => {
    // 1. If this item has a persisted database opportunity ID, update it directly via standard REST API
    if (item.opportunityId) {
      try {
        await crmService.updateOpportunityStage(item.opportunityId, targetStageKey, shortReason);
        await loadClientOpportunities(currentClient.id);
      } catch (err) {
        console.error('Failed to update opportunity stage in DB:', err);
      }
    }

    if (item.isPrimary) {
      const currentNotes = currentClient.notes ? currentClient.notes.trim() : '';
      const updatedNotes = currentNotes ? `${currentNotes}\n${noteEntry}` : noteEntry;
      const updated = await crmService.updateLead(currentClient.id, {
        ...currentClient,
        stage: targetStageKey,
        notes: updatedNotes
      });
      setCurrentClient(prev => ({ ...prev, ...updated, stage: targetStageKey, notes: updatedNotes }));
      if (onLeadUpdated) onLeadUpdated({ ...currentClient, ...updated, stage: targetStageKey, notes: updatedNotes });
      loadClientAuditLogs(currentClient.id);
      return;
    }

    // If inquiryId is linked to incoming web lead inquiry, sync status cleanly
    if (item.inquiryId) {
      try {
        await leadInquiryService.updateInquiryStatus(item.inquiryId, targetStageKey);
      } catch (err) {
        console.warn('Could not sync inquiry status directly:', err);
      }
    }

    // Append standard audit note entry to client timeline
    const currentNotes = currentClient.notes ? currentClient.notes.trim() : '';
    const updatedNotes = currentNotes ? `${currentNotes}\n${noteEntry}` : noteEntry;
    const updated = await crmService.updateLead(currentClient.id, {
      ...currentClient,
      notes: updatedNotes
    });

    setCurrentClient(prev => ({ ...prev, ...updated, notes: updatedNotes }));
    if (onLeadUpdated) onLeadUpdated({ ...currentClient, ...updated, notes: updatedNotes });
    loadClientAuditLogs(currentClient.id);
  };

  const INSURER_PROVIDERS_BY_CATEGORY = {
    HEALTH_INSURANCE: [
      'Star Health and Allied Insurance',
      'Care Health Insurance',
      'HDFC ERGO General Insurance',
      'Niva Bupa Health Insurance',
      'ICICI Lombard General Insurance',
      'Bajaj Allianz General Insurance',
      'Aditya Birla Health Insurance',
      'Tata AIG General Insurance',
      'National Insurance Company'
    ],
    TERM_LIFE_INSURANCE: [
      'HDFC Life Insurance',
      'ICICI Prudential Life Insurance',
      'Max Life Insurance',
      'Tata AIA Life Insurance',
      'SBI Life Insurance',
      'Bajaj Allianz Life Insurance',
      'Kotak Mahindra Life Insurance'
    ],
    MOTOR_VEHICLE_INSURANCE: [
      'ICICI Lombard General Insurance',
      'HDFC ERGO General Insurance',
      'Tata AIG General Insurance',
      'Bajaj Allianz General Insurance',
      'Go Digit General Insurance',
      'Acko General Insurance',
      'Reliance General Insurance',
      'National Insurance Company'
    ],
    GENERAL_INSURANCE: [
      'HDFC ERGO General Insurance',
      'ICICI Lombard General Insurance',
      'Bajaj Allianz General Insurance',
      'Tata AIG General Insurance',
      'National Insurance Company',
      'Reliance General Insurance'
    ]
  };

  const getOpportunityOptions = () => {
    let primaryCat = 'HEALTH';
    if (/life|term/i.test(currentClient.insuranceType || '')) primaryCat = 'LIFE';
    else if (/vehicle|motor|car|bike/i.test(currentClient.insuranceType || '')) primaryCat = 'VEHICLE';

    let primaryInsType = currentClient.insuranceType ? currentClient.insuranceType.toUpperCase().replace(/\s+/g, '_') : 'HEALTH_INSURANCE';
    if (!INSURER_PROVIDERS_BY_CATEGORY[primaryInsType]) {
      primaryInsType = primaryCat === 'LIFE' ? 'TERM_LIFE_INSURANCE' : primaryCat === 'VEHICLE' ? 'MOTOR_VEHICLE_INSURANCE' : 'HEALTH_INSURANCE';
    }

    const options = [
      {
        id: 'PRIMARY',
        label: `${currentClient.insuranceType || 'Health Insurance'} (Primary Policy • ${currentClient.sumInsured || '₹10L'})`,
        category: primaryCat,
        insuranceType: primaryInsType,
        coverage: currentClient.sumInsured || '₹10,00,000',
        inquiryId: null
      }
    ];

    if (clientOpportunities && clientOpportunities.length > 0) {
      clientOpportunities.forEach((opp) => {
        if (!opp.isPrimary) {
          let insType = 'HEALTH_INSURANCE';
          if (opp.categorySlug === 'LIFE') insType = 'TERM_LIFE_INSURANCE';
          else if (opp.categorySlug === 'VEHICLE') insType = 'MOTOR_VEHICLE_INSURANCE';
          else if (opp.categorySlug === 'BUSINESS' || opp.categorySlug === 'TRAVEL' || opp.categorySlug === 'LOANS' || opp.categorySlug === 'GENERAL') insType = 'GENERAL_INSURANCE';

          options.push({
            id: `OPP_${opp.id}`,
            label: `${opp.productName || opp.categorySlug} (${opp.inquiryId ? `Inquiry #${opp.inquiryId}` : 'Opportunity'}) • ${opp.coverageAmount || 'Custom Coverage'}`,
            category: opp.categorySlug,
            insuranceType: insType,
            coverage: opp.coverageAmount || '₹10,00,000',
            inquiryId: opp.inquiryId,
            specs: opp.specs
          });
        }
      });
    }

    return options;
  };

  const openQuoteModalForOpportunity = (opp) => {
    let insType = 'HEALTH_INSURANCE';
    let cat = opp?.category || 'HEALTH';
    if (cat === 'LIFE') insType = 'TERM_LIFE_INSURANCE';
    else if (cat === 'VEHICLE') insType = 'MOTOR_VEHICLE_INSURANCE';
    else if (cat === 'BUSINESS' || cat === 'TRAVEL' || cat === 'LOANS' || cat === 'GENERAL') insType = 'GENERAL_INSURANCE';
    else {
      insType = currentClient.insuranceType ? currentClient.insuranceType.toUpperCase().replace(/\s+/g, '_') : 'HEALTH_INSURANCE';
      if (!INSURER_PROVIDERS_BY_CATEGORY[insType]) insType = 'HEALTH_INSURANCE';
    }

    const providers = INSURER_PROVIDERS_BY_CATEGORY[insType] || INSURER_PROVIDERS_BY_CATEGORY.HEALTH_INSURANCE;
    const coverage = opp?.coverage || currentClient.sumInsured || '₹10,00,000';
    const oppId = opp?.inquiryId ? `INQ_${opp.inquiryId}` : (opp?.id || 'PRIMARY');

    setQuoteFormData({
      opportunityRef: oppId,
      insuranceType: insType,
      insurerName: providers[0],
      planName: '',
      planVariant: 'Comprehensive',
      sumInsured: coverage,
      policyTenureYears: 1,
      basePremium: '',
      ncbDiscountPercent: 0,
      roomRentLimit: insType === 'HEALTH_INSURANCE' ? 'No Cap / Single Private Room' : 'N/A',
      copayPercentage: '0%',
      restorationBenefit: insType === 'HEALTH_INSURANCE' ? '100% Unlimited Recharge' : 'N/A',
      prePostHospitalization: insType === 'HEALTH_INSURANCE' ? '60 Days Pre / 180 Days Post' : 'N/A',
      maternityCovered: false,
      opdCovered: false,
      notes: opp?.inquiryId ? `Quotation for Linked Inquiry #${opp.inquiryId} (${opp.category})` : ''
    });
    setShowCreateQuoteModal(true);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          // guard against drag-dismiss
        }
      }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.65)',
        zIndex: 12000,
        display: 'flex',
        justifyContent: 'flex-end',
        animation: 'fadeIn 0.2s ease-out',
        cursor: 'pointer'
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        className="crm-client360-drawer-body"
      >
        
        {/* Drawer Header - Clean Crisp Enterprise UX */}
        <div className="crm-client360-drawer-header">
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Row 1: Client Code, Portfolio Count, Phone 1-Tap Copy */}
            <div className="crm-client360-badge-strip">
              {currentClient.clientCode ? (
                <span style={{
                  fontSize: '0.74rem',
                  fontFamily: 'monospace',
                  background: '#f1f5f9',
                  color: 'var(--primary-navy)',
                  border: '1px solid var(--border-subtle)',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  fontWeight: 700,
                  letterSpacing: '0.5px'
                }}>
                  {currentClient.clientCode}
                </span>
              ) : (
                <span style={{
                  fontSize: '0.74rem',
                  fontFamily: 'monospace',
                  background: '#f1f5f9',
                  color: 'var(--text-muted)',
                  border: '1px solid var(--border-subtle)',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  fontWeight: 700
                }}>
                  CL-{currentClient.id || 'LEAD'}
                </span>
              )}

              {/* Multi-Product Portfolio Count Indicator */}
              <span style={{
                fontSize: '0.72rem',
                background: '#eff6ff',
                color: '#2563eb',
                border: '1px solid #bfdbfe',
                padding: '2px 8px',
                borderRadius: '6px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Layers size={11} />
                <span>{1 + (Array.isArray(clientOpportunities) ? clientOpportunities.filter(o => !o?.isPrimary).length : 0) + (Array.isArray(linkedInquiries) ? linkedInquiries.length : 0)} Enquiries</span>
              </span>

              {currentClient.phoneNumber && (
                <button
                  type="button"
                  onClick={() => handleCopyText(currentClient.phoneNumber, 'phone')}
                  style={{
                    background: copiedField === 'phone' ? '#ecfdf5' : '#f8fafc',
                    color: copiedField === 'phone' ? '#059669' : '#64748b',
                    border: `1px solid ${copiedField === 'phone' ? '#a7f3d0' : '#e2e8f0'}`,
                    padding: '2px 7px',
                    borderRadius: '6px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  title="Copy Phone Number"
                >
                  {copiedField === 'phone' ? <Check size={11} /> : <Copy size={11} />}
                  <span>{copiedField === 'phone' ? 'Copied' : currentClient.phoneNumber}</span>
                </button>
              )}
            </div>

            <h2 className="crm-client360-drawer-title">
              {currentClient.fullName || 'Client Profile'}
            </h2>
            
            {/* Row 2: Location, Company & Advisor Assignment with 1-Click Reassign */}
            <div className="crm-client360-meta-strip">
              <span>
                {currentClient.companyName && currentClient.companyName !== 'Retail Client' 
                  ? `${currentClient.companyName} • ` 
                  : ''}
                {currentClient.city ? `${currentClient.city}, ${currentClient.state || 'India'}` : 'Direct Retail Client'}
              </span>

              <span className="crm-meta-dot">•</span>

              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Advisor:</span>
                <strong style={{ color: currentClient.assignedAdvisorId ? '#0f2b48' : '#dc2626' }}>
                  {currentClient.assignedAdvisorName || 'Unassigned'}
                </strong>
                {currentClient.managerName && (
                  <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>({currentClient.managerName})</span>
                )}
              </div>

              {canReassign && (
                <button
                  type="button"
                  onClick={() => setShowReassignModal(true)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px',
                    background: '#e0e7ff',
                    border: '1px solid #c7d2fe',
                    color: '#4338ca',
                    padding: '1px 7px',
                    borderRadius: '5px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                  title="Reassign to another Advisor"
                >
                  <UserCheck size={11} />
                  <span>Reassign</span>
                </button>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            title="Close Client 360 (Esc)"
            className="crm-client360-close-btn"
          >
            <X size={18} />
          </button>
        </div>

        {/* 1. Compact Quick-Dial Action Strip + Quick Add Product */}
        <div className="crm-drawer-quick-reach-bar" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="crm-drawer-reach-btn"
            onClick={() => setShowAddOpportunityModal(true)}
            style={{
              background: '#ecfdf5',
              color: '#059669',
              border: '1.5px solid #a7f3d0',
              fontWeight: 800
            }}
            title="Add new product opportunity / policy deal to this client"
          >
            <Plus size={14} />
            <span>+ Add Product</span>
          </button>

          <button
            type="button"
            className="crm-drawer-reach-btn call"
            onClick={() => onOpenCallModal ? onOpenCallModal({ clientId: client.id, clientName: client.fullName, clientPhone: client.phoneNumber, insuranceType: client.insuranceType }) : setScheduleModalState({ isOpen: true, initialType: 'CALL' })}
            title="Start outbound call and log disposition"
          >
            <Phone size={14} />
            <span>Call & Log</span>
          </button>

          <button
            type="button"
            className="crm-drawer-reach-btn wa"
            onClick={openWhatsApp}
            title="Open WhatsApp Web Chat"
          >
            <WhatsAppIcon size={15} color="currentColor" />
            <span>WhatsApp</span>
          </button>

          <button
            type="button"
            className="crm-drawer-reach-btn meet"
            onClick={() => setScheduleModalState({ isOpen: true, initialType: 'MEETING' })}
            title="Schedule Consultation or Google Meet"
          >
            <Calendar size={14} />
            <span>Schedule</span>
          </button>

          {currentClient.email && (
            <button
              type="button"
              className="crm-drawer-reach-btn copy"
              onClick={() => handleCopyText(currentClient.email, 'email')}
              title={`Copy email address: ${currentClient.email}`}
            >
              {copiedField === 'email' ? <Check size={13} color="#059669" /> : <Mail size={13} />}
              <span>{copiedField === 'email' ? 'Copied' : 'Email'}</span>
            </button>
          )}
        </div>

        {/* 3. Drawer Tabs with Modern Count Badges */}
        <div className="crm-client360-tabs-nav">
          {[
            { id: 'overview', label: 'Overview', count: null },
            { id: 'calls', label: 'Calls', count: clientCalls.length },
            { id: 'quotes', label: 'Quotations', count: clientQuotes.length },
            { id: 'documents', label: 'Documents', count: clientDocs.length },
            { id: 'timeline', label: 'Timeline & Audit', count: auditLogs.length }
          ].map(tab => {
            const isTabActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '11px 12px',
                  border: 'none',
                  background: 'none',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  color: isTabActive ? 'var(--primary-navy)' : '#64748b',
                  borderBottom: isTabActive ? '2px solid var(--primary-navy)' : '2px solid transparent',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>{tab.label}</span>
                {tab.count !== null && (
                  <span style={{
                    padding: '1px 6px',
                    borderRadius: '999px',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    background: isTabActive ? '#e0e7ff' : '#f1f5f9',
                    color: isTabActive ? '#4338ca' : '#64748b'
                  }}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Drawer Scrollable Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem', background: '#f8fafc' }}>
          
          {/* TAB 1: OVERVIEW & CLIENT 360 INFORMATION */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              
              {/* 0. 1-Tap Quick Activity Note Composer */}
              <div style={{ background: '#ffffff', borderRadius: '14px', padding: '1rem 1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: '#0f2b48', marginBottom: '8px' }}>
                  <Sparkles size={14} color="#7c3aed" /> 1-Tap Telecaller Note Composer
                </div>
                <form onSubmit={handlePostQuickNote} style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="Log latest interaction note, customer objection, or next step..."
                    value={quickNoteText}
                    onChange={(e) => setQuickNoteText(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.82rem',
                      outline: 'none',
                      background: '#f8fafc'
                    }}
                  />
                  <button
                    type="submit"
                    disabled={!quickNoteText.trim() || isPostingNote}
                    style={{
                      background: 'var(--primary-navy)',
                      color: '#ffffff',
                      border: 'none',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: !quickNoteText.trim() || isPostingNote ? 'not-allowed' : 'pointer',
                      opacity: !quickNoteText.trim() || isPostingNote ? 0.6 : 1,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    {isPostingNote ? <RefreshCw size={13} className="animate-spin" /> : <Send size={13} />}
                    <span>Post</span>
                  </button>
                </form>
              </div>

              {/* 5. Unified Multi-Product Opportunities & Coverage Portfolio */}
              {(() => {
                // Construct standard unified portfolio:
                // 1. Master Primary Policy
                const primaryPolicy = {
                  isPrimary: true,
                  category: (/life|term/i.test(currentClient.insuranceType || '') ? 'LIFE' : /vehicle|motor|car|bike/i.test(currentClient.insuranceType || '') ? 'VEHICLE' : 'HEALTH'),
                  productName: currentClient.insuranceType || 'Health Insurance',
                  coverage: currentClient.sumInsured || '₹10,00,000',
                  stage: currentClient.stage || 'NEW_LEAD',
                  inquiryId: null,
                  notes: currentClient.existingInsurer ? `Existing Insurer: ${currentClient.existingInsurer}` : 'Primary Policyholder Profile',
                  raw: `[${currentClient.insuranceType || 'Health Insurance'}] Coverage: ${currentClient.sumInsured || '₹10 Lakhs'}`,
                  oppRef: { category: (/life|term/i.test(currentClient.insuranceType || '') ? 'LIFE' : /vehicle|motor|car|bike/i.test(currentClient.insuranceType || '') ? 'VEHICLE' : 'HEALTH'), coverage: currentClient.sumInsured || '₹10,00,000', id: 'PRIMARY' }
                };

                // 2. Database Opportunities
                const dbOpps = (clientOpportunities || []).filter(o => !o.isPrimary).map(opp => ({
                  opportunityId: opp.id,
                  isPrimary: false,
                  category: opp.categorySlug || 'HEALTH',
                  productName: opp.productName || `${opp.categorySlug} Insurance`,
                  coverage: opp.coverageAmount || 'As Requested',
                  stage: opp.stage || 'NEW_LEAD',
                  priority: opp.priority || 'MEDIUM',
                  inquiryId: opp.inquiryId,
                  specsObj: opp.specs ? (typeof opp.specs === 'string' ? (() => { try { return JSON.parse(opp.specs); } catch(e) { return null; } })() : opp.specs) : null,
                  notes: opp.notes,
                  date: opp.createdAt ? new Date(opp.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : null,
                  raw: `[${opp.productName}] ${opp.coverageAmount || ''}`,
                  oppRef: { category: opp.categorySlug, coverage: opp.coverageAmount, id: opp.id }
                }));

                // 3. Web Quote Inquiries from QuoteInquiry repository (excluding any already in DB opportunities)
                const inqItems = (linkedInquiries || []).map(q => {
                  let cat = 'HEALTH';
                  if (/life|term/i.test(q.categorySlug || '')) cat = 'LIFE';
                  else if (/vehicle|motor|car|bike/i.test(q.categorySlug || '')) cat = 'VEHICLE';
                  else if (/loan/i.test(q.categorySlug || '')) cat = 'LOANS';
                  else if (/business|sme|group/i.test(q.categorySlug || '')) cat = 'BUSINESS';
                  else if (/travel/i.test(q.categorySlug || '')) cat = 'TRAVEL';

                  let specsObj = null;
                  let coverage = 'As Requested';
                  if (q.planDetails) {
                    try {
                      specsObj = JSON.parse(q.planDetails);
                      coverage = specsObj.coverage || specsObj.coverageAmount || specsObj.sumInsured || 'As Requested';
                    } catch (e) {
                      // plain string specs
                    }
                  }

                  // Map Inquiry Desk status to CRM Pipeline Lifecycle stage
                  let oppStage = 'NEW_LEAD';
                  if (q.status === 'CONTACTED') {
                    oppStage = 'CONTACTED';
                  } else if (q.status === 'CONVERTED' || q.status === 'QUALIFIED') {
                    oppStage = 'NEW_LEAD';
                  } else if (q.status === 'ARCHIVED') {
                    oppStage = 'LOST';
                  }

                  return {
                    isPrimary: false,
                    inquiryId: q.id,
                    category: cat,
                    productName: `${cat} Insurance`,
                    coverage: coverage,
                    stage: oppStage,
                    priority: 'MEDIUM',
                    specsObj: specsObj,
                    specs: q.planDetails,
                    date: q.createdAt ? new Date(q.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : null,
                    raw: `[Inquiry #${q.id}] ${cat} Insurance • ${coverage}`,
                    oppRef: { category: cat, coverage: coverage, inquiryId: q.id }
                  };
                });

                // Deduplicate items: Keep primary, DB opps, and any web inquiries not already mapped by inquiryId
                const seenInquiryIds = new Set(dbOpps.map(o => o.inquiryId).filter(Boolean));
                const uniqueWebInquiries = inqItems.filter(inq => !seenInquiryIds.has(inq.inquiryId));

                const allPortfolioItems = [primaryPolicy, ...dbOpps, ...uniqueWebInquiries];

                // Compute dynamic category counts
                const catCounts = { ALL: allPortfolioItems.length };
                allPortfolioItems.forEach(item => {
                  const cat = item.category || 'HEALTH';
                  catCounts[cat] = (catCounts[cat] || 0) + 1;
                });

                // Filter items based on active category sub-pill
                const filteredPortfolioItems = portfolioCategoryFilter === 'ALL'
                  ? allPortfolioItems
                  : allPortfolioItems.filter(item => (item.category || 'HEALTH') === portfolioCategoryFilter);

                const categoryLabels = {
                  HEALTH: { label: 'Health', icon: '❤️' },
                  LIFE: { label: 'Life', icon: '🛡️' },
                  VEHICLE: { label: 'Vehicle', icon: '🚗' },
                  LOANS: { label: 'Loans', icon: '🏛️' },
                  BUSINESS: { label: 'Business', icon: '💼' },
                  TRAVEL: { label: 'Travel', icon: '✈️' }
                };

                return (
                  <div style={{ background: '#ffffff', borderRadius: '14px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', color: '#0f2b48', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
                        <Layers size={16} color="#0284c7" /> Product Portfolio ({allPortfolioItems.length})
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowAddOpportunityModal(true)}
                        style={{
                          background: '#f0f9ff',
                          color: '#0284c7',
                          border: '1px solid #bae6fd',
                          padding: '5px 11px',
                          borderRadius: '8px',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          whiteSpace: 'nowrap',
                          transition: 'all 0.15s ease',
                          boxShadow: '0 1px 2px rgba(2, 132, 199, 0.06)'
                        }}
                        onMouseEnter={(e) => { 
                          e.currentTarget.style.background = '#e0f2fe'; 
                          e.currentTarget.style.borderColor = '#7dd3fc';
                        }}
                        onMouseLeave={(e) => { 
                          e.currentTarget.style.background = '#f0f9ff'; 
                          e.currentTarget.style.borderColor = '#bae6fd';
                        }}
                      >
                        <Plus size={13} strokeWidth={2.5} />
                        <span>Add Product</span>
                      </button>
                    </div>

                    {/* Sub-Pills Category Filter Strip */}
                    {allPortfolioItems.length > 1 && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        overflowX: 'auto',
                        paddingBottom: '8px',
                        marginBottom: '10px',
                        borderBottom: '1px solid #f1f5f9'
                      }}>
                        <button
                          type="button"
                          onClick={() => setPortfolioCategoryFilter('ALL')}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            border: portfolioCategoryFilter === 'ALL' ? '1.5px solid var(--primary-navy)' : '1px solid #e2e8f0',
                            background: portfolioCategoryFilter === 'ALL' ? 'var(--primary-navy)' : '#f8fafc',
                            color: portfolioCategoryFilter === 'ALL' ? '#ffffff' : '#64748b',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            whiteSpace: 'nowrap',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <span>All</span>
                          <span style={{
                            background: portfolioCategoryFilter === 'ALL' ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
                            color: portfolioCategoryFilter === 'ALL' ? '#ffffff' : '#475569',
                            fontSize: '0.68rem',
                            padding: '1px 5px',
                            borderRadius: '10px'
                          }}>
                            {catCounts.ALL}
                          </span>
                        </button>

                        {Object.keys(catCounts).filter(c => c !== 'ALL').map(cat => {
                          const isSelected = portfolioCategoryFilter === cat;
                          const meta = categoryLabels[cat] || { label: cat, icon: '📦' };
                          return (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => setPortfolioCategoryFilter(cat)}
                              style={{
                                padding: '4px 10px',
                                borderRadius: '20px',
                                fontSize: '0.74rem',
                                fontWeight: 700,
                                border: isSelected ? '1.5px solid #0284c7' : '1px solid #e2e8f0',
                                background: isSelected ? '#eff6ff' : '#f8fafc',
                                color: isSelected ? '#0369a1' : '#64748b',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                whiteSpace: 'nowrap',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              <span>{meta.icon} {meta.label}</span>
                              <span style={{
                                background: isSelected ? '#bfdbfe' : '#e2e8f0',
                                color: isSelected ? '#1e40af' : '#475569',
                                fontSize: '0.68rem',
                                padding: '1px 5px',
                                borderRadius: '10px'
                              }}>
                                {catCounts[cat]}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {filteredPortfolioItems.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '1.5rem', color: '#94a3b8', fontSize: '0.82rem' }}>
                          No products found in this category.
                        </div>
                      ) : (
                        filteredPortfolioItems.map((item, idx) => {
                        let badgeBg = '#ecfdf5';
                        let badgeColor = '#059669';
                        let badgeBorder = '#a7f3d0';
                        let icon = <Heart size={12} />;

                        if (item.category === 'LIFE') {
                          badgeBg = '#eff6ff'; badgeColor = '#2563eb'; badgeBorder = '#bfdbfe'; icon = <Shield size={12} />;
                        } else if (item.category === 'VEHICLE') {
                          badgeBg = '#eff6ff'; badgeColor = '#3b82f6'; badgeBorder = '#bfdbfe'; icon = <Car size={12} />;
                        } else if (item.category === 'LOANS') {
                          badgeBg = '#fffbeb'; badgeColor = '#d97706'; badgeBorder = '#fde68a'; icon = <Landmark size={12} />;
                        } else if (item.category === 'BUSINESS') {
                          badgeBg = '#f8fafc'; badgeColor = '#475569'; badgeBorder = '#cbd5e1'; icon = <Briefcase size={12} />;
                        } else if (item.category === 'TRAVEL') {
                          badgeBg = '#fdf4ff'; badgeColor = '#86198f'; badgeBorder = '#f5d0fe'; icon = <Plane size={12} />;
                        }

                        return (
                          <div 
                            key={idx}
                            className="crm-opportunity-card"
                            style={{
                              border: item.isPrimary ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                              background: item.isPrimary ? '#f8faff' : '#ffffff',
                              borderRadius: '12px',
                              padding: '0.75rem 0.85rem',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.45rem'
                            }}
                          >
                            {/* Row 1: Category Badge + Primary Tag + Inq # + Cover Badge + Generate Quote */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap', minWidth: 0 }}>
                                <span 
                                  className="crm-opportunity-badge"
                                  style={{ background: badgeBg, color: badgeColor, border: `1px solid ${badgeBorder}`, padding: '2px 6px', fontSize: '0.68rem' }}
                                >
                                  {icon} {item.category} {item.isPrimary ? 'POLICY' : 'OPPORTUNITY'}
                                </span>
                                
                                {item.isPrimary && (
                                  <span style={{
                                    fontSize: '0.62rem',
                                    background: '#dcfce7',
                                    color: '#15803d',
                                    border: '1px solid #bbf7d0',
                                    padding: '1px 5px',
                                    borderRadius: '4px',
                                    fontWeight: 800
                                  }}>
                                    ★ PRIMARY
                                  </span>
                                )}

                                {item.inquiryId && (
                                  <span style={{ fontSize: '0.66rem', color: '#64748b', fontWeight: 700, fontFamily: 'monospace' }}>
                                    #{item.inquiryId}
                                  </span>
                                )}

                                {item.coverage && (
                                  <span style={{
                                    background: '#ecfdf5',
                                    color: '#059669',
                                    border: '1px solid #a7f3d0',
                                    padding: '1px 6px',
                                    borderRadius: '4px',
                                    fontSize: '0.68rem',
                                    fontWeight: 800
                                  }}>
                                    Cover: {item.coverage}
                                  </span>
                                )}
                              </div>

                              <button
                                type="button"
                                onClick={() => openQuoteModalForOpportunity(item.oppRef || { category: item.category, coverage: item.coverage, id: 'PRIMARY' })}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px',
                                  background: 'var(--primary-navy)',
                                  color: '#ffffff',
                                  border: 'none',
                                  padding: '3px 8px',
                                  borderRadius: '6px',
                                  fontSize: '0.7rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  flexShrink: 0
                                }}
                              >
                                <Plus size={11} />
                                <span>Quote</span>
                              </button>
                            </div>

                            {/* Row 2: Clean Specs Tags (deduplicated, concise) */}
                            {item.specsObj ? (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                {Object.entries(item.specsObj)
                                  .filter(([k]) => !['coverageAmount', 'coverage', 'category', 'stage'].includes(k.toLowerCase()))
                                  .map(([k, v]) => (
                                    <span
                                      key={k}
                                      style={{
                                        background: '#f8fafc',
                                        color: '#334155',
                                        border: '1px solid #e2e8f0',
                                        padding: '1px 6px',
                                        borderRadius: '4px',
                                        fontSize: '0.68rem',
                                        fontWeight: 600
                                      }}
                                    >
                                      <strong style={{ color: '#0f2b48' }}>{k.replace(/([A-Z])/g, ' $1').trim()}: </strong>
                                      <span>{String(v)}</span>
                                    </span>
                                  ))}
                              </div>
                            ) : item.specs ? (
                              <div style={{ fontSize: '0.72rem', color: '#475569' }}>
                                <strong style={{ color: '#0f2b48' }}>Specs:</strong> {item.specs}
                              </div>
                            ) : item.notes ? (
                              <div style={{ fontSize: '0.72rem', color: '#64748b', fontStyle: 'italic' }}>
                                {item.notes}
                              </div>
                            ) : null}

                            {/* Row 3: Compact Stage Stepper Pill Strip */}
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '6px',
                              background: '#f8fafc',
                              padding: '4px 8px',
                              borderRadius: '7px',
                              border: '1px solid #f1f5f9',
                              marginTop: '2px'
                            }}>
                              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span>Stage:</span>
                              </div>

                              <ClientLifecyclePipeline
                                compact={true}
                                client={currentClient}
                                stage={item.isPrimary ? (currentClient.stage || 'NEW_LEAD') : (item.stage || 'NEW_LEAD')}
                                titleLabel={item.isPrimary ? `Primary ${item.productName}` : `Enquiry #${item.inquiryId || idx} ${item.productName}`}
                                onStageChange={(targetStageKey, noteEntry, shortReason) => {
                                  return handleInquiryStageTransition(item, targetStageKey, noteEntry, shortReason);
                                }}
                              />
                            </div>
                          </div>
                        );
                      }))}
                    </div>
                  </div>
                );
              })()}

            </div>
          )}

          {/* TAB: CALL HISTORY LOGS */}
          {activeTab === 'calls' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f2b48', textTransform: 'uppercase' }}>
                  Call Logs & Dispositions ({clientCalls.length})
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => onOpenCallModal && onOpenCallModal(currentClient)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: '#091726',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '4px 10px',
                      fontSize: '0.74rem',
                      cursor: 'pointer',
                      fontWeight: 700
                    }}
                  >
                    <Phone size={12} /> Log New Call
                  </button>
                  <button
                    onClick={() => loadClientCalls(currentClient.id)}
                    disabled={loadingCalls}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      padding: '4px 8px',
                      fontSize: '0.74rem',
                      color: '#475569',
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    <RefreshCw size={12} className={loadingCalls ? 'animate-spin' : ''} /> Refresh
                  </button>
                </div>
              </div>

              {loadingCalls ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                  <div style={{ width: '24px', height: '24px', border: '2px solid #cbd5e1', borderTopColor: '#f59e0b', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 8px auto' }} />
                  <span style={{ fontSize: '0.8rem' }}>Loading call interactions...</span>
                </div>
              ) : clientCalls.length === 0 ? (
                <div style={{ background: '#ffffff', borderRadius: '12px', padding: '1.5rem', textAlign: 'center', border: '1px solid #e2e8f0', color: '#94a3b8' }}>
                  <PhoneCall size={32} color="#cbd5e1" style={{ margin: '0 auto 8px auto' }} />
                  <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#475569' }}>No calls logged for this client yet</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>Click "Log New Call" above to record an advisor interaction.</div>
                </div>
              ) : (
                clientCalls.map(c => {
                  const isPositive = c.callResult === 'INTERESTED' || c.callResult === 'QUOTE_REQUESTED' || c.callResult === 'CONVERTED';
                  const isNotAnswered = c.callResult === 'NOT_ANSWERED' || c.callResult === 'WRONG_NUMBER';

                  let badgeColor = isPositive ? '#15803d' : isNotAnswered ? '#dc2626' : '#0284c7';
                  let badgeBg = isPositive ? '#dcfce7' : isNotAnswered ? '#fee2e2' : '#e0f2fe';

                  return (
                    <div
                      key={c.id}
                      style={{
                        background: '#ffffff',
                        borderRadius: '12px',
                        padding: '1rem',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          color: badgeColor,
                          background: badgeBg,
                          padding: '2px 8px',
                          borderRadius: '6px'
                        }}>
                          {c.callResult.replace('_', ' ')}
                        </span>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                          {c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                        </div>
                      </div>

                      <div style={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.4, margin: '2px 0' }}>
                        {c.callNotes || 'No notes provided.'}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.74rem', color: '#64748b', background: '#f8fafc', padding: '6px 8px', borderRadius: '6px' }}>
                        <div>Duration: <strong>{c.callDurationSeconds ? `${Math.floor(c.callDurationSeconds / 60)}m ${c.callDurationSeconds % 60}s` : '0s'}</strong></div>
                        <div>Advisor: <strong>{c.advisorName}</strong></div>
                        {c.nextFollowUpDate && (
                          <div style={{ color: '#0284c7' }}>
                            Next: <strong>{new Date(c.nextFollowUpDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</strong>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB: QUOTATIONS & PROPOSALS */}
          {activeTab === 'quotes' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f2b48', textTransform: 'uppercase' }}>
                  Client Quotations ({clientQuotes.length})
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => openQuoteModalForOpportunity(null)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      background: 'var(--primary-navy)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '4px 10px',
                      fontSize: '0.74rem',
                      cursor: 'pointer',
                      fontWeight: 700
                    }}
                  >
                    <Plus size={13} /> New Quote
                  </button>
                  <button
                    onClick={() => loadClientQuotes(currentClient.id)}
                    disabled={loadingQuotes}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      padding: '3px 8px',
                      fontSize: '0.74rem',
                      color: '#475569',
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    <RefreshCw size={12} className={loadingQuotes ? 'animate-spin' : ''} /> Refresh
                  </button>
                </div>
              </div>

              {loadingQuotes ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                  <div style={{ width: '24px', height: '24px', border: '2px solid #cbd5e1', borderTopColor: '#f59e0b', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 8px auto' }} />
                  <span style={{ fontSize: '0.8rem' }}>Loading quotation history...</span>
                </div>
              ) : clientQuotes.length === 0 ? (
                <div style={{ background: '#ffffff', borderRadius: '12px', padding: '1.5rem', textAlign: 'center', border: '1px solid #e2e8f0', color: '#94a3b8' }}>
                  <FileText size={32} color="#cbd5e1" style={{ margin: '0 auto 8px auto' }} />
                  <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#475569' }}>No quotations generated yet</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>Generate a new quote from the Quotation Desk in CRM.</div>
                </div>
              ) : (
                clientQuotes.map(q => (
                  <div
                    key={q.id}
                    style={{
                      background: '#ffffff',
                      borderRadius: '12px',
                      padding: '1rem',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#0284c7', background: '#e0f2fe', padding: '2px 6px', borderRadius: '4px' }}>
                            {q.quoteNumber}
                          </span>
                          {q.insuranceType && (
                            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#059669', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '1px 6px', borderRadius: '4px' }}>
                              {q.insuranceType.replace(/_/g, ' ')}
                            </span>
                          )}
                          {q.inquiryId && (
                            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#15803d', background: '#dcfce7', border: '1px solid #86efac', padding: '1px 6px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                              <Tag size={10} /> Web Lead #{q.inquiryId}
                            </span>
                          )}
                        </div>
                        <div style={{ fontWeight: 800, color: '#0f2b48', fontSize: '0.92rem', marginTop: '4px' }}>
                          {q.insurerName}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                          {q.planName} • {q.planVariant || 'Standard'}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#16a34a' }}>
                          ₹{q.totalPremium}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>incl. 18% GST</div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', background: '#f8fafc', padding: '8px 10px', borderRadius: '8px', fontSize: '0.75rem', border: '1px solid #f1f5f9' }}>
                      <div><span style={{ color: '#64748b' }}>Sum Insured:</span> <strong>{q.sumInsured}</strong></div>
                      <div><span style={{ color: '#64748b' }}>Room Rent:</span> <strong>{q.roomRentLimit}</strong></div>
                      <div><span style={{ color: '#64748b' }}>Restoration:</span> <strong>{q.restorationBenefit}</strong></div>
                      <div><span style={{ color: '#64748b' }}>Status:</span> <strong style={{ color: q.status === 'ACCEPTED' ? '#16a34a' : '#0284c7' }}>{q.status}</strong></div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
                      <button
                        onClick={() => setViewingQuoteDetails(q)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          background: '#f0fdf4',
                          color: '#15803d',
                          border: '1px solid #bbf7d0',
                          padding: '5px 9px',
                          borderRadius: '6px',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        <Eye size={13} color="#15803d" /> View Quote
                      </button>

                      <button
                        onClick={() => {
                          setEditingQuoteId(q.id);
                          setQuoteFormData({
                            opportunityRef: 'PRIMARY',
                            insuranceType: q.insuranceType || 'HEALTH_INSURANCE',
                            insurerName: q.insurerName || 'Star Health and Allied Insurance',
                            planName: q.planName || '',
                            planVariant: q.planVariant || 'Comprehensive',
                            sumInsured: q.sumInsured || currentClient.sumInsured || '₹10,00,000',
                            policyTenureYears: q.policyTenureYears || 1,
                            basePremium: q.basePremium || '',
                            ncbDiscountPercent: q.ncbDiscountPercent || 0,
                            roomRentLimit: q.roomRentLimit || 'No Cap / Single Private Room',
                            copayPercentage: q.copayPercentage || '0%',
                            restorationBenefit: q.restorationBenefit || '100% Unlimited Recharge',
                            prePostHospitalization: q.prePostHospitalization || '60 Days Pre / 180 Days Post',
                            maternityCovered: !!q.maternityCovered,
                            opdCovered: !!q.opdCovered,
                            notes: q.notes || ''
                          });
                          setShowCreateQuoteModal(true);
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          background: '#f8fafc',
                          color: '#0284c7',
                          border: '1px solid #cbd5e1',
                          padding: '5px 9px',
                          borderRadius: '6px',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        <Edit3 size={13} color="#0284c7" /> Edit Quote
                      </button>

                      <button
                        onClick={async () => {
                          const res = await crmService.sendQuoteDispatch(q.id, { channel: 'WHATSAPP', recipientPhone: currentClient.phoneNumber });
                          if (res.whatsAppUrl) window.open(res.whatsAppUrl, '_blank');
                          loadClientQuotes(currentClient.id);
                        }}
                        className="crm-btn-whatsapp-outline"
                      >
                        <WhatsAppIcon size={14} color="currentColor" />
                        <span>WhatsApp Quote</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: ACTIVITY TIMELINE & AUDIT TRAIL */}
          {activeTab === 'timeline' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f2b48', textTransform: 'uppercase' }}>
                  Live Audit Trail & Change History ({auditLogs.length})
                </div>
                <button
                  onClick={() => loadClientAuditLogs(currentClient.id)}
                  disabled={loadingAudit}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: '3px 8px',
                    fontSize: '0.74rem',
                    color: '#475569',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  <RefreshCw size={12} className={loadingAudit ? 'animate-spin' : ''} /> Refresh
                </button>
              </div>

              {loadingAudit ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                  <div style={{ width: '24px', height: '24px', border: '2px solid #cbd5e1', borderTopColor: '#f59e0b', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 8px auto' }} />
                  <span style={{ fontSize: '0.8rem' }}>Loading verified audit records...</span>
                </div>
              ) : auditLogs.length === 0 ? (
                <div style={{ background: '#ffffff', borderRadius: '12px', padding: '1.5rem', textAlign: 'center', border: '1px solid #e2e8f0', color: '#94a3b8' }}>
                  <ShieldCheck size={32} color="#cbd5e1" style={{ margin: '0 auto 8px auto' }} />
                  <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#475569' }}>No audit history recorded yet</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>Any status transitions, reassignments, or field edits will appear here.</div>
                </div>
              ) : (
                <div style={{ position: 'relative', paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {/* Connected Vertical Timeline Spine */}
                  <div style={{
                    position: 'absolute',
                    left: '11px',
                    top: '12px',
                    bottom: '12px',
                    width: '2px',
                    background: '#e2e8f0',
                    zIndex: 0
                  }} />

                  {auditLogs.map((log, index) => {
                    const isCreate = log.action === 'CREATE';
                    const isLinkOpp = log.action === 'LINK_OPPORTUNITY';
                    const isReassign = log.action === 'REASSIGN';
                    const isQuoteInquiry = log.entityName === 'QUOTE_INQUIRY';
                    const isStageChange = log.action === 'STATUS_CHANGE' || log.fieldName === 'stage';
                    const isCallLog = log.action === 'CALL_LOG';
                    const isMeeting = log.action === 'MEETING_SCHEDULED';

                    let nodeBg = '#0284c7';
                    let nodeBorder = '#bae6fd';
                    let title = log.action.replace('_', ' ');
                    let icon = <Clock size={12} color="#ffffff" />;
                    let categoryColor = '#0f2b48';

                    if (isQuoteInquiry) {
                      nodeBg = log.newValue === 'QUALIFIED' ? '#059669' : log.newValue === 'CONTACTED' ? '#2563eb' : log.newValue === 'ARCHIVED' ? '#dc2626' : '#0284c7';
                      nodeBorder = '#bfdbfe';
                      title = log.action === 'STATUS_CHANGE' ? `Inbound Inquiry Status: ${log.newValue || ''}` : 'Inbound Inquiry Activity';
                      icon = <Activity size={12} color="#ffffff" />;
                    } else if (isCreate) {
                      nodeBg = '#10b981';
                      nodeBorder = '#a7f3d0';
                      title = 'Master Client Account Created';
                      icon = <CheckCircle2 size={12} color="#ffffff" />;
                    } else if (isLinkOpp) {
                      nodeBg = '#0284c7';
                      nodeBorder = '#bae6fd';
                      title = 'Linked Product Opportunity';
                      icon = <Layers size={12} color="#ffffff" />;
                    } else if (isReassign) {
                      nodeBg = '#8b5cf6';
                      nodeBorder = '#ddd6fe';
                      title = 'Advisor Reassignment';
                      icon = <UserCheck size={12} color="#ffffff" />;
                    } else if (isStageChange) {
                      nodeBg = '#f59e0b';
                      nodeBorder = '#fde68a';
                      title = 'Pipeline Stage Transition';
                      icon = <CheckCircle2 size={12} color="#ffffff" />;
                    } else if (isCallLog) {
                      nodeBg = '#0ea5e9';
                      nodeBorder = '#bae6fd';
                      title = 'Telephony Call Logged';
                      icon = <Phone size={12} color="#ffffff" />;
                    } else if (isMeeting) {
                      nodeBg = '#d946ef';
                      nodeBorder = '#f5d0fe';
                      title = 'Client Consultation Scheduled';
                      icon = <Calendar size={12} color="#ffffff" />;
                    }

                    const formattedDate = log.timestamp 
                      ? new Date(log.timestamp).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true
                        })
                      : 'Recent';

                    return (
                      <div
                        key={log.id || index}
                        style={{
                          position: 'relative',
                          zIndex: 1,
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '12px'
                        }}
                      >
                        {/* Timeline Node Bullet */}
                        <div style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: nodeBg,
                          border: `3px solid #ffffff`,
                          boxShadow: `0 0 0 2px ${nodeBorder}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          marginTop: '2px'
                        }}>
                          {icon}
                        </div>

                        {/* Event Content Box */}
                        <div style={{
                          flex: 1,
                          background: '#ffffff',
                          borderRadius: '12px',
                          padding: '0.85rem 1rem',
                          border: '1px solid #e2e8f0',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                            <div style={{ fontWeight: 800, color: '#0f2b48', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <span>{title}</span>
                            </div>

                            {log.performedByName && (
                              <span style={{
                                fontSize: '0.7rem',
                                background: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                padding: '2px 7px',
                                borderRadius: '999px',
                                color: '#475569',
                                fontWeight: 700,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px'
                              }}>
                                <User size={10} /> {log.performedByName}
                              </span>
                            )}
                          </div>

                          <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px', marginBottom: '6px', fontWeight: 600 }}>
                            {formattedDate}
                          </div>

                          {/* Friendly Description / Value Display */}
                          {(() => {
                            const rawText = log.description || log.newValue;
                            if (!rawText) return null;

                            // Smart Sanitizer: convert any legacy ISO timestamps into human-readable 12-hr dates
                            let cleanDesc = rawText.replace(
                              /(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})/g,
                              (_, date, hr, min) => {
                                try {
                                  const d = new Date(`${date}T${hr}:${min}:00`);
                                  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) + ' at ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                } catch {
                                  return `${date} ${hr}:${min}`;
                                }
                              }
                            );
                            cleanDesc = cleanDesc.replace(/Scheduled meeting: [^at]+ at /i, 'Scheduled for ');

                            return (
                              <div style={{
                                fontSize: '0.8rem',
                                color: '#334155',
                                lineHeight: 1.45,
                                background: isLinkOpp ? '#f0f9ff' : (isMeeting ? '#fdf4ff' : '#f8fafc'),
                                border: `1px solid ${isLinkOpp ? '#bae6fd' : (isMeeting ? '#f5d0fe' : '#f1f5f9')}`,
                                padding: '0.45rem 0.65rem',
                                borderRadius: '8px',
                                marginTop: '4px'
                              }}>
                                {cleanDesc}
                              </div>
                            );
                          })()}

                          {/* Value Diff (Only if both oldValue AND newValue exist) */}
                          {log.oldValue && log.newValue && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', background: '#f8fafc', padding: '6px 8px', borderRadius: '6px', border: '1px solid #f1f5f9', flexWrap: 'wrap', marginTop: '6px' }}>
                              <span style={{ color: '#dc2626', textDecoration: 'line-through', background: '#fef2f2', padding: '1px 5px', borderRadius: '4px' }}>
                                {log.oldValue}
                              </span>
                              <span style={{ color: '#94a3b8' }}>→</span>
                              <span style={{ color: '#16a34a', fontWeight: 700, background: '#f0fdf4', padding: '1px 5px', borderRadius: '4px' }}>
                                {log.newValue}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB: DOCUMENT LOCKER & KYC */}
          {activeTab === 'documents' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {/* WhatsApp Checklist & Request Bar */}
              <div style={{
                background: '#f0fdf4',
                borderRadius: '12px',
                padding: '12px 14px',
                border: '1px solid #bbf7d0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                <div>
                  <div style={{ fontWeight: 800, color: '#15803d', fontSize: '0.82rem' }}>Request Client Documents</div>
                  <div style={{ fontSize: '0.72rem', color: '#166534' }}>Send itemized KYC checklist (Aadhaar, PAN, Policy) via WhatsApp</div>
                </div>
                <button
                  onClick={async () => {
                    const res = await crmService.requestDocumentsChecklist(currentClient.id, ['AADHAAR', 'PAN', 'PREVIOUS_POLICY', 'MEDICAL_RECORD']);
                    if (res.whatsAppUrl) window.open(res.whatsAppUrl, '_blank');
                  }}
                  className="crm-btn-whatsapp-solid"
                >
                  <WhatsAppIcon size={14} color="#ffffff" />
                  <span>Send WhatsApp Request</span>
                </button>
              </div>

              {/* Upload trigger */}
              <label style={{
                border: '2px dashed #cbd5e1',
                borderRadius: '12px',
                padding: '1.25rem',
                textAlign: 'center',
                background: '#ffffff',
                cursor: 'pointer',
                display: 'block'
              }}>
                <input 
                  type="file" 
                  style={{ display: 'none' }} 
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      await crmService.uploadDocument({
                        clientId: currentClient.id,
                        documentType: 'OTHER',
                        fileName: file.name,
                        fileUrl: `https://storage.googleapis.com/aadhiraksha-kyc/${Date.now()}-${file.name}`,
                        fileSizeBytes: file.size,
                        fileType: file.type || 'application/pdf'
                      });
                      loadClientDocs(currentClient.id);
                    } catch (err) {
                      alert('Failed to upload file: ' + (err.response?.data?.message || err.message));
                    }
                  }}
                />
                <Upload size={22} color="#059669" style={{ margin: '0 auto 4px auto' }} />
                <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f2b48' }}>
                  Click to Browse & Upload KYC File
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  Aadhaar, PAN Card, Previous Policy, Medical Records (PDF, JPG up to 15MB)
                </div>
              </label>

              {/* Documents List */}
              {loadingDocs ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                  <div style={{ width: '24px', height: '24px', border: '2px solid #cbd5e1', borderTopColor: '#f59e0b', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 8px auto' }} />
                  <span style={{ fontSize: '0.8rem' }}>Loading attached documents...</span>
                </div>
              ) : clientDocs.length === 0 ? (
                <div style={{ background: '#ffffff', borderRadius: '12px', padding: '1.5rem', textAlign: 'center', border: '1px solid #e2e8f0', color: '#94a3b8' }}>
                  <ShieldCheck size={32} color="#cbd5e1" style={{ margin: '0 auto 8px auto' }} />
                  <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#475569' }}>No KYC documents attached yet</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>Upload proposal files or send WhatsApp document request above.</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {clientDocs.map((doc) => {
                    const isVerified = doc.verificationStatus === 'VERIFIED';
                    return (
                      <div
                        key={doc.id}
                        style={{
                          background: '#ffffff',
                          borderRadius: '10px',
                          padding: '10px 14px',
                          border: '1px solid #e2e8f0',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <FileText size={20} color={isVerified ? '#16a34a' : '#2563eb'} />
                          <div>
                            <div style={{ fontWeight: 700, color: '#0f2b48', fontSize: '0.85rem' }}>{doc.fileName}</div>
                            <div style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span>{doc.documentType.replace('_', ' ')}</span>
                              <span>•</span>
                              <span style={{ color: isVerified ? '#15803d' : '#b45309', fontWeight: 700 }}>
                                {doc.verificationStatus.replace('_', ' ')}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {!isVerified && (
                            <button
                              onClick={async () => {
                                await crmService.verifyDocument(doc.id, { status: 'VERIFIED', notes: 'Verified in Client 360' });
                                loadClientDocs(currentClient.id);
                              }}
                              style={{ background: '#dcfce7', border: '1px solid #bbf7d0', color: '#15803d', padding: '4px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}
                              title="Mark Verified"
                            >
                              Verify ✓
                            </button>
                          )}
                          <button
                            onClick={() => window.open(doc.fileUrl, '_blank')}
                            style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
                            title="Preview / Download"
                          >
                            <Download size={14} color="#334155" />
                          </button>
                          <button
                            onClick={async () => {
                              if (window.confirm('Delete this document?')) {
                                await crmService.deleteDocument(doc.id);
                                loadClientDocs(currentClient.id);
                              }
                            }}
                            style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
                            title="Delete"
                          >
                            <Trash2 size={14} color="#dc2626" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>

      </div>

      {/* Modal: Reassign Advisor */}
      {showReassignModal && (
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              e.stopPropagation();
              setShowReassignModal(false);
            }
          }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              e.stopPropagation();
            }
          }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'none',
            zIndex: 13000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            cursor: 'pointer'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '500px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              cursor: 'default'
            }}
          >
            <div style={{
              background: '#ffffff',
              padding: '1.25rem 1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid #e2e8f0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: currentClient.assignedAdvisorId ? '#e0e7ff' : '#dcfce7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: currentClient.assignedAdvisorId ? '#4338ca' : '#15803d'
                }}>
                  {currentClient.assignedAdvisorId ? <UserCheck size={20} /> : <UserPlus size={20} />}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#0f2b48' }}>
                    {currentClient.assignedAdvisorId ? 'Reassign Lead Advisor' : 'Assign Insurance Advisor'}
                  </h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                    {currentClient.fullName} ({currentClient.clientCode})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowReassignModal(false)}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  color: '#64748b',
                  cursor: 'pointer',
                  borderRadius: '8px',
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleReassignSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Target Insurance Advisor *
                </label>
                <select
                  required
                  value={targetAdvisorId}
                  onChange={(e) => setTargetAdvisorId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    background: '#ffffff',
                    fontWeight: 600,
                    color: '#0f2b48'
                  }}
                >
                  <option value="">-- Choose Target Advisor --</option>
                  {advisors.map(adv => (
                    <option key={adv.id} value={adv.id}>
                      {adv.fullName} • {adv.branchCity || adv.employeeCode || 'Advisor'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Reassignment Reason / Transfer Notes
                </label>
                <textarea
                  rows="3"
                  placeholder="e.g. Assigned to specialist advisor for corporate health quote..."
                  value={reassignReason}
                  onChange={(e) => setReassignReason(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowReassignModal(false)}
                  disabled={reassigning}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reassigning}
                  style={{
                    flex: 2,
                    padding: '10px',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #4338ca, #3730a3)',
                    color: '#ffffff',
                    fontWeight: 700,
                    cursor: reassigning ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  {reassigning ? <RefreshCw size={14} className="animate-spin" /> : <Check size={16} />}
                  Confirm Reassign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: In-Context Create Insurance Quotation */}
      {showCreateQuoteModal && (
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              e.stopPropagation();
              setShowCreateQuoteModal(false);
            }
          }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              e.stopPropagation();
            }
          }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'none',
            zIndex: 13000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            cursor: 'pointer'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '580px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              cursor: 'default'
            }}
          >
            <div style={{
              background: '#ffffff',
              padding: '1.25rem 1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid #e2e8f0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: '#e0f2fe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0284c7'
                }}>
                  <FileText size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#0f2b48' }}>
                    Generate Insurance Quotation
                  </h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                    For {currentClient.fullName} ({currentClient.clientCode || `CL-${currentClient.id}`})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateQuoteModal(false)}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  color: '#64748b',
                  cursor: 'pointer',
                  borderRadius: '8px',
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!quoteFormData.planName || !quoteFormData.basePremium) {
                  alert('Please provide Plan Name and Base Premium.');
                  return;
                }
                setCreatingQuote(true);
                try {
                  if (editingQuoteId) {
                    await crmService.updateQuotation(editingQuoteId, {
                      ...quoteFormData,
                      clientId: currentClient.id,
                      insuranceType: quoteFormData.insuranceType || (currentClient.insuranceType ? currentClient.insuranceType.toUpperCase().replace(/\s+/g, '_') : 'HEALTH_INSURANCE'),
                      basePremium: Number(quoteFormData.basePremium),
                      ncbDiscountPercent: Number(quoteFormData.ncbDiscountPercent || 0)
                    });
                  } else {
                    await crmService.createQuotation({
                      ...quoteFormData,
                      clientId: currentClient.id,
                      insuranceType: quoteFormData.insuranceType || (currentClient.insuranceType ? currentClient.insuranceType.toUpperCase().replace(/\s+/g, '_') : 'HEALTH_INSURANCE'),
                      basePremium: Number(quoteFormData.basePremium),
                      ncbDiscountPercent: Number(quoteFormData.ncbDiscountPercent || 0)
                    });
                  }
                  setShowCreateQuoteModal(false);
                  setEditingQuoteId(null);
                  loadClientQuotes(currentClient.id);
                  loadClientAuditLogs(currentClient.id);
                  setQuoteFormData({
                    opportunityRef: 'PRIMARY',
                    insuranceType: 'HEALTH_INSURANCE',
                    insurerName: 'Star Health and Allied Insurance',
                    planName: '',
                    planVariant: 'Comprehensive',
                    sumInsured: currentClient.sumInsured || '₹10,00,000',
                    policyTenureYears: 1,
                    basePremium: '',
                    ncbDiscountPercent: 0,
                    roomRentLimit: 'No Cap / Single Private Room',
                    copayPercentage: '0%',
                    restorationBenefit: '100% Unlimited Recharge',
                    prePostHospitalization: '60 Days Pre / 180 Days Post',
                    maternityCovered: false,
                    opdCovered: false,
                    notes: ''
                  });
                } catch (err) {
                  alert('Failed to save quote: ' + (err.response?.data?.message || err.message));
                } finally {
                  setCreatingQuote(false);
                }
              }}
              style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              {/* Opportunity / Policy Line Selector */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Target Opportunity / Product Line *
                </label>
                <select
                  value={quoteFormData.opportunityRef || 'PRIMARY'}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    const opts = getOpportunityOptions();
                    const match = opts.find(o => o.id === selectedId) || opts[0];
                    const providers = INSURER_PROVIDERS_BY_CATEGORY[match.insuranceType] || INSURER_PROVIDERS_BY_CATEGORY.HEALTH_INSURANCE;
                    setQuoteFormData({
                      ...quoteFormData,
                      opportunityRef: match.id,
                      insuranceType: match.insuranceType,
                      sumInsured: match.coverage || '₹10,00,000',
                      insurerName: providers[0],
                      roomRentLimit: match.insuranceType === 'HEALTH_INSURANCE' ? 'No Cap / Single Private Room' : 'N/A',
                      restorationBenefit: match.insuranceType === 'HEALTH_INSURANCE' ? '100% Unlimited Recharge' : 'N/A',
                      prePostHospitalization: match.insuranceType === 'HEALTH_INSURANCE' ? '60 Days Pre / 180 Days Post' : 'N/A',
                      notes: match.inquiryId ? `Quotation specifically tailored for Inquiry #${match.inquiryId} (${match.category})` : ''
                    });
                  }}
                  style={{
                    width: '100%',
                    padding: '9px 10px',
                    borderRadius: '8px',
                    border: '1.5px solid #0284c7',
                    background: '#f0f9ff',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    color: '#0369a1'
                  }}
                >
                  {getOpportunityOptions().map(opt => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '3px' }}>
                  💡 Select which client opportunity or policy inquiry this quotation is tailored for.
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Insurance Provider *
                  </label>
                  <select
                    value={quoteFormData.insurerName}
                    onChange={(e) => setQuoteFormData({ ...quoteFormData, insurerName: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                  >
                    {(INSURER_PROVIDERS_BY_CATEGORY[quoteFormData.insuranceType] || INSURER_PROVIDERS_BY_CATEGORY.HEALTH_INSURANCE).map(ins => (
                      <option key={ins} value={ins}>{ins}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Plan Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Optima Secure / Care Supreme"
                    value={quoteFormData.planName}
                    onChange={(e) => setQuoteFormData({ ...quoteFormData, planName: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Sum Insured (Coverage) *
                  </label>
                  <select
                    value={quoteFormData.sumInsured}
                    onChange={(e) => setQuoteFormData({ ...quoteFormData, sumInsured: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                  >
                    <option value="₹5,00,000">₹5,00,000 (5 Lakhs)</option>
                    <option value="₹10,00,000">₹10,00,000 (10 Lakhs)</option>
                    <option value="₹15,00,000">₹15,00,000 (15 Lakhs)</option>
                    <option value="₹25,00,000">₹25,00,000 (25 Lakhs)</option>
                    <option value="₹50,00,000">₹50,00,000 (50 Lakhs)</option>
                    <option value="₹1,00,00,000">₹1,00,00,000 (1 Crore)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Base Annual Premium (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 14500"
                    value={quoteFormData.basePremium}
                    onChange={(e) => setQuoteFormData({ ...quoteFormData, basePremium: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                  />
                  {quoteFormData.basePremium && (
                    <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700, marginTop: '3px' }}>
                      Total with 18% GST: ₹{Math.round(Number(quoteFormData.basePremium) * 1.18).toLocaleString('en-IN')}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    {quoteFormData.insuranceType === 'HEALTH_INSURANCE' ? 'Room Rent Limit' : 'Policy Tenure / Term'}
                  </label>
                  <input
                    type="text"
                    value={quoteFormData.roomRentLimit}
                    onChange={(e) => setQuoteFormData({ ...quoteFormData, roomRentLimit: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    {quoteFormData.insuranceType === 'HEALTH_INSURANCE' ? 'Restoration Benefit' : 'Key Feature / Add-on'}
                  </label>
                  <input
                    type="text"
                    value={quoteFormData.restorationBenefit}
                    onChange={(e) => setQuoteFormData({ ...quoteFormData, restorationBenefit: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Advisor Notes & Benefit Highlights
                </label>
                <textarea
                  rows="2"
                  placeholder="e.g. Best suited for high NCB bonus accumulation and maternity cover..."
                  value={quoteFormData.notes}
                  onChange={(e) => setQuoteFormData({ ...quoteFormData, notes: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateQuoteModal(false)}
                  disabled={creatingQuote}
                  style={{
                    flex: 1,
                    padding: '9px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingQuote}
                  style={{
                    flex: 2,
                    padding: '9px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'var(--primary-navy)',
                    color: '#ffffff',
                    fontWeight: 700,
                    cursor: creatingQuote ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  {creatingQuote ? <RefreshCw size={14} className="animate-spin" /> : <Check size={15} />}
                  Save & Calculate Quote
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW QUOTATION DETAILS MODAL */}
      {viewingQuoteDetails && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'none',
          zIndex: 14000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            maxWidth: '650px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
          }}>
            {/* Header */}
            <div className="crm-modal-header" style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#ffffff',
              borderRadius: '16px 16px 0 0'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#d97706', background: '#fef3c7', border: '1px solid #fde68a', padding: '2px 8px', borderRadius: '4px' }}>
                    {viewingQuoteDetails.quoteNumber}
                  </span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>
                    Version v{viewingQuoteDetails.versionNumber || 1}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '4px 0 0 0', color: 'var(--primary-navy, #0f2b48)' }}>
                  {viewingQuoteDetails.insurerName}
                </h3>
                <div style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '2px' }}>
                  {viewingQuoteDetails.planName} • {viewingQuoteDetails.planVariant || 'Comprehensive'}
                </div>
              </div>
              <button
                onClick={() => setViewingQuoteDetails(null)}
                aria-label="Close Modal"
                className="crm-modal-close-btn"
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  color: '#64748b',
                  padding: '0.45rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Client & Advisor Snapshot */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: '#f8fafc', padding: '12px 14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Client</div>
                  <div style={{ fontWeight: 800, color: '#0f2b48', fontSize: '0.92rem', marginTop: '2px' }}>{currentClient.fullName}</div>
                  <div style={{ fontSize: '0.78rem', color: '#475569' }}>{currentClient.phoneNumber}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Status & Version</div>
                  <div style={{ fontWeight: 800, color: viewingQuoteDetails.status === 'ACCEPTED' ? '#16a34a' : '#0284c7', fontSize: '0.92rem', marginTop: '2px' }}>
                    {viewingQuoteDetails.status}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#475569' }}>
                    Type: {viewingQuoteDetails.insuranceType?.replace(/_/g, ' ') || 'HEALTH INSURANCE'}
                  </div>
                </div>
              </div>

              {/* Financial Breakdown */}
              <div style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)', border: '1.5px solid #a7f3d0', borderRadius: '12px', padding: '14px 16px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Financial Premium Breakdown
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Sum Insured</div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f2b48', marginTop: '2px' }}>{viewingQuoteDetails.sumInsured}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Base Premium</div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#334155', marginTop: '2px' }}>₹{viewingQuoteDetails.basePremium}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>18% GST</div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#334155', marginTop: '2px' }}>₹{viewingQuoteDetails.taxGst}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 800 }}>Total Annual</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#16a34a', marginTop: '2px' }}>₹{viewingQuoteDetails.totalPremium}</div>
                  </div>
                </div>
              </div>

              {/* Benefit Matrix */}
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#334155', marginBottom: '8px' }}>
                  Policy Benefits & Coverage Terms
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.82rem' }}>
                  <div style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                    <span style={{ color: '#64748b' }}>Room Rent:</span> <strong style={{ color: '#0f2b48' }}>{viewingQuoteDetails.roomRentLimit || 'No Cap'}</strong>
                  </div>
                  <div style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                    <span style={{ color: '#64748b' }}>Restoration:</span> <strong style={{ color: '#0f2b48' }}>{viewingQuoteDetails.restorationBenefit || 'Unlimited'}</strong>
                  </div>
                  <div style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                    <span style={{ color: '#64748b' }}>Co-Payment:</span> <strong style={{ color: '#0f2b48' }}>{viewingQuoteDetails.copayPercentage || '0%'}</strong>
                  </div>
                  <div style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                    <span style={{ color: '#64748b' }}>Pre/Post Hosp:</span> <strong style={{ color: '#0f2b48' }}>{viewingQuoteDetails.prePostHospitalization || '60/180 Days'}</strong>
                  </div>
                  <div style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                    <span style={{ color: '#64748b' }}>Maternity:</span> <strong style={{ color: viewingQuoteDetails.maternityCovered ? '#16a34a' : '#94a3b8' }}>{viewingQuoteDetails.maternityCovered ? '✓ Covered' : '✗ Excluded'}</strong>
                  </div>
                  <div style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                    <span style={{ color: '#64748b' }}>OPD / Diagnostics:</span> <strong style={{ color: viewingQuoteDetails.opdCovered ? '#16a34a' : '#94a3b8' }}>{viewingQuoteDetails.opdCovered ? '✓ Covered' : '✗ Excluded'}</strong>
                  </div>
                </div>
              </div>

              {/* Dedicated Linked Web Inquiry Heritage Card */}
              {viewingQuoteDetails.inquiryId && (
                <div style={{
                  background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
                  border: '1.5px solid #86efac',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#166534', background: '#dcfce7', padding: '2px 7px', borderRadius: '4px' }}>
                        LINKED WEB INQUIRY #{viewingQuoteDetails.inquiryId}
                      </span>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#047857', textTransform: 'uppercase' }}>
                        {viewingQuoteDetails.inquiryCategorySlug?.replace(/-/g, ' ') || viewingQuoteDetails.insuranceType?.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#15803d', marginTop: '3px' }}>
                      Origin: Customer submitted quote form on web portal • Triage Status: <strong>{viewingQuoteDetails.inquiryStatus || 'QUALIFIED'}</strong>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const inq = await leadInquiryService.getInquiryById(viewingQuoteDetails.inquiryId);
                        if (inq) {
                          const logs = await crmService.getInquiryAuditLogs(inq.id);
                          alert(`Inquiry #${inq.id} Heritage & Audit Trail:\n\n• Applicant: ${inq.fullName}\n• Phone: ${inq.phoneNumber}\n• Category: ${inq.categorySlug}\n• Status: ${inq.status}\n\nActivity Logs (${logs ? logs.length : 0}):\n${logs && logs.length > 0 ? logs.map(l => `[${new Date(l.timestamp).toLocaleDateString('en-IN')}] ${l.action}: ${l.oldValue || 'None'} -> ${l.newValue || ''} (by ${l.performedByName || 'System'})`).join('\n') : 'No audit entries logged'}`);
                        }
                      } catch (err) {
                        alert(`Could not load Inquiry #${viewingQuoteDetails.inquiryId}: ${err.message}`);
                      }
                    }}
                    style={{
                      padding: '6px 12px',
                      background: '#15803d',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      flexShrink: 0
                    }}
                  >
                    <Eye size={12} color="#ffffff" /> View Enquiry & Logs
                  </button>
                </div>
              )}

              {/* Notes */}
              {viewingQuoteDetails.notes && (
                <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', padding: '10px 14px', borderRadius: '10px', fontSize: '0.82rem', color: '#92400e' }}>
                  <strong>Advisor Notes:</strong> {viewingQuoteDetails.notes}
                </div>
              )}

              {/* Modal Footer Actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #e2e8f0' }}>
                <button
                  type="button"
                  onClick={() => {
                    const q = viewingQuoteDetails;
                    setViewingQuoteDetails(null);
                    setEditingQuoteId(q.id);
                    setQuoteFormData({
                      opportunityRef: 'PRIMARY',
                      insuranceType: q.insuranceType || 'HEALTH_INSURANCE',
                      insurerName: q.insurerName || 'Star Health and Allied Insurance',
                      planName: q.planName || '',
                      planVariant: q.planVariant || 'Comprehensive',
                      sumInsured: q.sumInsured || currentClient.sumInsured || '₹10,00,000',
                      policyTenureYears: q.policyTenureYears || 1,
                      basePremium: q.basePremium || '',
                      ncbDiscountPercent: q.ncbDiscountPercent || 0,
                      roomRentLimit: q.roomRentLimit || 'No Cap / Single Private Room',
                      copayPercentage: q.copayPercentage || '0%',
                      restorationBenefit: q.restorationBenefit || '100% Unlimited Recharge',
                      prePostHospitalization: q.prePostHospitalization || '60 Days Pre / 180 Days Post',
                      maternityCovered: !!q.maternityCovered,
                      opdCovered: !!q.opdCovered,
                      notes: q.notes || ''
                    });
                    setShowCreateQuoteModal(true);
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: '1px solid #0284c7',
                    background: '#f0f9ff',
                    color: '#0369a1',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <Edit3 size={14} /> Edit Quote
                </button>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={async () => {
                      const res = await crmService.sendQuoteDispatch(viewingQuoteDetails.id, { channel: 'WHATSAPP', recipientPhone: currentClient.phoneNumber });
                      if (res.whatsAppUrl) window.open(res.whatsAppUrl, '_blank');
                      loadClientQuotes(currentClient.id);
                    }}
                    className="crm-btn-whatsapp-solid"
                  >
                    <WhatsAppIcon size={14} color="#ffffff" />
                    <span>WhatsApp Quote</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewingQuoteDetails(null)}
                    style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Close
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Consolidated Schedule Activity Modal */}
      {scheduleModalState.isOpen && (
        <ScheduleActivityModal
          isOpen={scheduleModalState.isOpen}
          onClose={() => setScheduleModalState({ isOpen: false, initialType: 'MEETING' })}
          initialClient={currentClient}
          initialType={scheduleModalState.initialType}
          onSuccess={() => {
            loadClientCalls(currentClient.id);
            if (onLeadUpdated) onLeadUpdated();
          }}
        />
      )}

      {/* Add Product Opportunity Modal */}
      {showAddOpportunityModal && (
        <div
          className="crm-modal-backdrop"
          onClick={() => !isCreatingOpportunity && setShowAddOpportunityModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'none',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
        >
          <div
            className="crm-modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '540px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '90vh',
              overflow: 'hidden'
            }}
          >
            {/* Modal Header */}
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Plus size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f2b48' }}>
                    Add Product Opportunity
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '1px' }}>
                    Link new policy or financial deal to <strong>{currentClient?.fullName}</strong> ({currentClient?.clientCode})
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => !isCreatingOpportunity && setShowAddOpportunityModal(false)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleCreateOpportunity} style={{ padding: '1.25rem 1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {/* Category */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Product Category *
                  </label>
                  <select
                    value={newOpportunityData.categorySlug}
                    onChange={(e) => {
                      const cat = e.target.value;
                      let defaultName = `${cat} Insurance`;
                      if (cat === 'LOANS') defaultName = 'Personal / Business Loan';
                      setNewOpportunityData({
                        ...newOpportunityData,
                        categorySlug: cat,
                        productName: defaultName
                      });
                    }}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem', background: '#ffffff', fontWeight: 600 }}
                  >
                    <option value="HEALTH">❤️ Health Insurance</option>
                    <option value="LIFE">🛡️ Term Life Insurance</option>
                    <option value="VEHICLE">🚗 Vehicle / Motor Insurance</option>
                    <option value="BUSINESS">💼 Corporate / SME Insurance</option>
                    <option value="TRAVEL">✈️ Travel Insurance</option>
                    <option value="LOANS">🏛️ Loans & Financing</option>
                  </select>
                </div>

                {/* Plan / Deal Name */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Product / Plan Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Star Smart Health Pro"
                    value={newOpportunityData.productName}
                    onChange={(e) => setNewOpportunityData({ ...newOpportunityData, productName: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {/* Coverage Amount */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Coverage / Sum Insured
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ₹15 Lakhs or ₹1 Crore"
                    value={newOpportunityData.coverageAmount}
                    onChange={(e) => setNewOpportunityData({ ...newOpportunityData, coverageAmount: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                  />
                </div>

                {/* Estimated Premium */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Est. Premium (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 25000"
                    value={newOpportunityData.estimatedPremium}
                    onChange={(e) => setNewOpportunityData({ ...newOpportunityData, estimatedPremium: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {/* Initial Stage */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Pipeline Stage
                  </label>
                  <select
                    value={newOpportunityData.stage}
                    onChange={(e) => setNewOpportunityData({ ...newOpportunityData, stage: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem', background: '#ffffff' }}
                  >
                    <option value="NEW_LEAD">✨ New Lead</option>
                    <option value="CONTACTED">📞 Contacted</option>
                    <option value="FOLLOWUP">⏳ Follow-up Due</option>
                    <option value="QUOTATION">📋 Quotation Sent</option>
                    <option value="DOCUMENTS">📑 Documents Review</option>
                    <option value="PAYMENT">💳 Payment Pending</option>
                    <option value="POLICY_ISSUED">🎉 Policy Issued</option>
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Priority
                  </label>
                  <select
                    value={newOpportunityData.priority}
                    onChange={(e) => setNewOpportunityData({ ...newOpportunityData, priority: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem', background: '#ffffff' }}
                  >
                    <option value="HIGH">🔥 High Priority</option>
                    <option value="MEDIUM">⚡ Medium Priority</option>
                    <option value="LOW">Low Priority</option>
                  </select>
                </div>
              </div>

              {/* Remarks / Context */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Deal Context & Requirements
                </label>
                <textarea
                  rows={3}
                  placeholder="Client preferences, policy add-ons, or cross-sell background..."
                  value={newOpportunityData.notes}
                  onChange={(e) => setNewOpportunityData({ ...newOpportunityData, notes: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem', resize: 'vertical' }}
                />
              </div>

              {/* Modal Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0' }}>
                <button
                  type="button"
                  onClick={() => setShowAddOpportunityModal(false)}
                  disabled={isCreatingOpportunity}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
                    color: '#475569',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: isCreatingOpportunity ? 'not-allowed' : 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingOpportunity}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'var(--accent-emerald)',
                    color: '#ffffff',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: isCreatingOpportunity ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {isCreatingOpportunity ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Saving Deal...</span>
                    </>
                  ) : (
                    <>
                      <Plus size={14} />
                      <span>Create Opportunity</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WhatsApp Message Compose & Template Modal */}
      {showWhatsAppModal && (
        <WhatsAppComposeModal
          isOpen={showWhatsAppModal}
          onClose={() => setShowWhatsAppModal(false)}
          client={currentClient}
          advisorName={user?.name || user?.fullName || 'Advisor'}
          onMessageSent={handleWhatsAppSent}
        />
      )}

    </div>
  );
}
