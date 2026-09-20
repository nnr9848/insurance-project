import React, { useState, useEffect, useRef } from 'react';
import { 
  Table, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  Phone, 
  MessageSquare, 
  Calendar, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ChevronDown, 
  Edit2, 
  Save, 
  X,
  Sparkles,
  ExternalLink,
  Shield,
  ArrowUpDown,
  FileSpreadsheet,
  Check,
  RefreshCw,
  UserCheck,
  UserPlus,
  Users,
  Edit3,
  HeartPulse,
  ShieldCheck,
  Car,
  Briefcase,
  Plane,
  Building2
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { crmService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function ClientDataSheetView({ onOpenClient360, onOpenCallModal, onOpenMeetingModal }) {
  const { isSuperAdmin, isManager, user } = useAuth();
  const toast = useToast();
  const canReassign = isSuperAdmin || isManager;

  const [leads, setLeads] = useState([]);
  const [advisors, setAdvisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [insuranceTypeFilter, setInsuranceTypeFilter] = useState('ALL');
  const [sortField, setSortField] = useState('updatedAt'); // 'deadline', 'updatedAt', 'premium', 'name'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' | 'desc'
  
  // Selection for bulk operations
  const [selectedLeadIds, setSelectedLeadIds] = useState([]);
  const [showBulkReassignModal, setShowBulkReassignModal] = useState(false);
  const [bulkTargetAdvisorId, setBulkTargetAdvisorId] = useState('');
  const [bulkReassignReason, setBulkReassignReason] = useState('');
  const [bulkReassigning, setBulkReassigning] = useState(false);

  // Single Quick Reassign Modal state
  const [quickReassignLead, setQuickReassignLead] = useState(null);
  const [quickTargetAdvisorId, setQuickTargetAdvisorId] = useState('');
  const [quickReassignReason, setQuickReassignReason] = useState('');
  const [quickReassigning, setQuickReassigning] = useState(false);

  const [editingRowId, setEditingRowId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [parsedBulkLeads, setParsedBulkLeads] = useState([]);
  const [bulkImporting, setBulkImporting] = useState(false);
  const fileInputRef = useRef(null);

  const [newLeadForm, setNewLeadForm] = useState({
    fullName: '',
    companyName: '',
    phoneNumber: '',
    whatsappNumber: '',
    email: '',
    city: 'Hyderabad',
    insuranceType: 'Health Insurance',
    existingInsurer: '',
    policyExpiryDate: '',
    sumInsured: '₹10 Lakhs',
    estimatedPremium: '',
    priority: 'HIGH',
    stage: 'NEW_LEAD',
    notes: ''
  });

  const getStageBadge = (stage) => {
    switch (stage) {
      case 'NEW_LEAD': return { label: 'New Lead', bg: '#e0f2fe', color: '#0284c7' };
      case 'CONTACTED': return { label: 'Contacted', bg: '#fef3c7', color: '#d97706' };
      case 'FOLLOWUP': return { label: 'Follow-up Due', bg: '#ffedd5', color: '#ea580c' };
      case 'INTERESTED': return { label: 'Interested', bg: '#dcfce7', color: '#16a34a' };
      case 'QUOTATION': return { label: 'Quotation', bg: '#e0e7ff', color: '#4f46e5' };
      case 'MEETING': return { label: 'Meeting Scheduled', bg: '#f3e8ff', color: '#9333ea' };
      case 'DOCUMENTS': return { label: 'Documents / KYC', bg: '#ccfbf1', color: '#0d9488' };
      case 'PAYMENT': return { label: 'Payment Pending', bg: '#fef9c3', color: '#ca8a04' };
      case 'POLICY_ISSUED': return { label: 'Policy Issued 🎉', bg: '#d1fae5', color: '#059669' };
      case 'LOST': return { label: 'Lost Lead', bg: '#fee2e2', color: '#dc2626' };
      default: return { label: stage || 'Active', bg: '#f1f5f9', color: '#475569' };
    }
  };

  const getProductBadge = (productName) => {
    if (!productName) return { label: 'General Insurance', shortLabel: 'General', bg: '#f1f5f9', color: '#475569', border: '#e2e8f0', icon: <Shield size={12} /> };
    const p = productName.toLowerCase();
    if (p.includes('health') || p.includes('medical')) {
      return { label: 'Health Insurance', shortLabel: 'Health', bg: '#ecfdf5', color: '#059669', border: '#a7f3d0', icon: <HeartPulse size={12} color="#059669" /> };
    }
    if (p.includes('life') || p.includes('term')) {
      return { label: 'Term Life', shortLabel: 'Life', bg: '#f0f9ff', color: '#0284c7', border: '#bae6fd', icon: <ShieldCheck size={12} color="#0284c7" /> };
    }
    if (p.includes('motor') || p.includes('vehicle') || p.includes('car') || p.includes('bike') || p.includes('two wheeler')) {
      return { label: 'Vehicle Insurance', shortLabel: 'Vehicle', bg: '#fffbeb', color: '#d97706', border: '#fde68a', icon: <Car size={12} color="#d97706" /> };
    }
    if (p.includes('sme') || p.includes('group') || p.includes('corporate') || p.includes('business')) {
      return { label: 'Corporate / SME', shortLabel: 'SME', bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe', icon: <Briefcase size={12} color="#2563eb" /> };
    }
    if (p.includes('travel')) {
      return { label: 'Travel Insurance', shortLabel: 'Travel', bg: '#ecfeff', color: '#0891b2', border: '#a5f3fc', icon: <Plane size={12} color="#0891b2" /> };
    }
    if (p.includes('loan') || p.includes('finance')) {
      return { label: 'Loans & Financing', shortLabel: 'Loans', bg: '#fff7ed', color: '#ea580c', border: '#fed7aa', icon: <Building2 size={12} color="#ea580c" /> };
    }
    return { label: productName, shortLabel: productName.replace(/insurance/i, '').trim(), bg: '#f1f5f9', color: '#475569', border: '#e2e8f0', icon: <Shield size={12} /> };
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'HIGH': return { label: '🔥 HIGH', color: '#dc2626' };
      case 'MEDIUM': return { label: '⚡ MED', color: '#d97706' };
      case 'LOW': return { label: 'LOW', color: '#64748b' };
      default: return { label: priority || 'MED', color: '#64748b' };
    }
  };

  const openWhatsApp = (phone, name, product) => {
    if (!phone) return;
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const text = encodeURIComponent(`Hello ${name || 'Client'}, regarding your ${product || 'insurance'} inquiry at Aadhiraksha InsurTech...`);
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  };

  useEffect(() => {
    loadLeads();
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

  const loadLeads = async () => {
    setLoading(true);
    try {
      const data = await crmService.getLeads();
      setLeads(data);
    } catch (err) {
      console.error('Failed to load CRM leads:', err);
      // Fallback demo dataset if backend leads are empty
      setLeads([
        {
          id: 1,
          clientCode: 'CL-801245',
          fullName: 'Ahmed Ali',
          companyName: 'Ali Logistics Pvt Ltd',
          phoneNumber: '+91 9849012345',
          whatsappNumber: '+91 9849012345',
          email: 'ahmed.ali@example.com',
          city: 'Hyderabad',
          insuranceType: 'Health Insurance',
          existingInsurer: 'Star Health',
          policyExpiryDate: '2026-10-15',
          sumInsured: '₹10 Lakhs',
          estimatedPremium: 18500,
          stage: 'FOLLOWUP',
          priority: 'HIGH',
          assignedAdvisorName: 'Rajesh Kumar',
          notes: 'Requested comparative quote for ₹10L Family Floater.'
        },
        {
          id: 2,
          clientCode: 'CL-801246',
          fullName: 'Venkatesh Rao',
          companyName: 'VR Software Solutions',
          phoneNumber: '+91 9988112233',
          whatsappNumber: '+91 9988112233',
          email: 'v.rao@example.com',
          city: 'Hyderabad',
          insuranceType: 'Term Life Insurance',
          existingInsurer: 'LIC',
          policyExpiryDate: '2026-11-20',
          sumInsured: '₹1 Crore',
          estimatedPremium: 14200,
          stage: 'QUOTATION',
          priority: 'HIGH',
          assignedAdvisorName: 'Rajesh Kumar',
          notes: 'Needs 30-year term quote with critical illness rider.'
        },
        {
          id: 3,
          clientCode: 'CL-801247',
          fullName: 'Dr. Sunita Deshmukh',
          companyName: 'Apollo Clinic ECIL',
          phoneNumber: '+91 9849556677',
          whatsappNumber: '+91 9849556677',
          email: 'dr.sunita@example.com',
          city: 'Hyderabad',
          insuranceType: 'Vehicle / Motor Insurance',
          existingInsurer: 'ICICI Lombard',
          policyExpiryDate: '2026-09-28',
          sumInsured: '₹8 Lakhs IDV',
          estimatedPremium: 9800,
          stage: 'MEETING',
          priority: 'MEDIUM',
          assignedAdvisorName: 'Priya Sharma',
          notes: 'Scheduled Google Meet to finalize Hyundai Creta zero-dep policy.'
        },
        {
          id: 4,
          clientCode: 'CL-801248',
          fullName: 'Kiran Patel',
          companyName: 'Patel Engineering Works',
          phoneNumber: '+91 9700114455',
          whatsappNumber: '+91 9700114455',
          email: 'kiran.patel@example.com',
          city: 'Secunderabad',
          insuranceType: 'Group / SME Insurance',
          existingInsurer: 'New India Assurance',
          policyExpiryDate: '2026-12-05',
          sumInsured: '₹50 Lakhs',
          estimatedPremium: 85000,
          stage: 'DOCUMENTS',
          priority: 'HIGH',
          assignedAdvisorName: 'Priya Sharma',
          notes: 'Employee health data collection in progress.'
        },
        {
          id: 5,
          clientCode: 'CL-801249',
          fullName: 'Rohan Sharma',
          companyName: 'Individual',
          phoneNumber: '+91 9123456789',
          whatsappNumber: '+91 9123456789',
          email: 'rohan.s@example.com',
          city: 'Hyderabad',
          insuranceType: 'Two Wheeler Insurance',
          existingInsurer: 'Bajaj Allianz',
          policyExpiryDate: '2026-09-20',
          sumInsured: '₹65,000 IDV',
          estimatedPremium: 1450,
          stage: 'POLICY_ISSUED',
          priority: 'LOW',
          assignedAdvisorName: 'Rajesh Kumar',
          notes: 'Policy issued and shared on WhatsApp.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const [isSavingInline, setIsSavingInline] = useState(false);

  const startInlineEdit = (lead) => {
    setEditingRowId(lead.id);
    setEditFormData({ ...lead });
  };

  const cancelInlineEdit = () => {
    setEditingRowId(null);
    setEditFormData({});
  };

  const saveInlineEdit = async (leadId) => {
    setIsSavingInline(true);
    try {
      await crmService.updateLead(leadId, editFormData);
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, ...editFormData } : l));
      setEditingRowId(null);
      toast.success(`Client record "${editFormData.fullName || 'Client'}" updated successfully!`);
    } catch (err) {
      toast.error('Failed to update client: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSavingInline(false);
    }
  };

  const openQuickReassign = (lead) => {
    setQuickReassignLead(lead);
    setQuickTargetAdvisorId(lead.assignedAdvisorId ? String(lead.assignedAdvisorId) : '');
    setQuickReassignReason('');
  };

  const handleQuickReassignSubmit = async (e) => {
    e.preventDefault();
    if (!quickTargetAdvisorId || !quickReassignLead) {
      toast.warning('Please select a target Insurance Advisor');
      return;
    }
    setQuickReassigning(true);
    try {
      const updatedLead = await crmService.reassignLead(
        quickReassignLead.id,
        Number(quickTargetAdvisorId),
        quickReassignReason || 'Reassigned from Client Data Sheet'
      );
      setLeads(prev => prev.map(l => l.id === quickReassignLead.id ? { ...l, ...updatedLead } : l));
      setQuickReassignLead(null);
      toast.success(`Advisor assigned successfully to "${quickReassignLead.fullName}"!`);
    } catch (err) {
      toast.error('Failed to assign advisor: ' + (err.response?.data?.message || err.message));
    } finally {
      setQuickReassigning(false);
    }
  };

  const toggleSelectLead = (leadId) => {
    setSelectedLeadIds(prev => 
      prev.includes(leadId) ? prev.filter(id => id !== leadId) : [...prev, leadId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedLeadIds.length === sortedLeads.length) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(sortedLeads.map(l => l.id));
    }
  };

  const handleBulkReassignSubmit = async (e) => {
    e.preventDefault();
    if (!bulkTargetAdvisorId || selectedLeadIds.length === 0) {
      toast.warning('Please select an advisor and at least one client.');
      return;
    }
    setBulkReassigning(true);
    try {
      const targetAdv = advisors.find(a => String(a.id) === String(bulkTargetAdvisorId));
      const targetAdvisorName = targetAdv ? targetAdv.fullName : 'Assigned Advisor';

      // Perform reassignment for all selected leads
      await Promise.all(
        selectedLeadIds.map(leadId => 
          crmService.reassignLead(
            leadId, 
            Number(bulkTargetAdvisorId), 
            bulkReassignReason || `Bulk reassigned to ${targetAdvisorName}`
          ).catch(err => {
            console.warn(`Reassignment failed for lead ${leadId}:`, err);
            return null;
          })
        )
      );

      // Refresh leads list
      await loadLeads();
      const count = selectedLeadIds.length;
      setSelectedLeadIds([]);
      setShowBulkReassignModal(false);
      setBulkTargetAdvisorId('');
      setBulkReassignReason('');
      toast.success(`Successfully assigned ${count} clients to ${targetAdvisorName}!`);
    } catch (err) {
      toast.error('Error during bulk reassignment: ' + (err.response?.data?.message || err.message));
    } finally {
      setBulkReassigning(false);
    }
  };

  const handleCreateLead = async (e) => {
    e.preventDefault();
    try {
      const created = await crmService.createLead(newLeadForm);
      setLeads(prev => [created, ...prev]);
      setShowAddLeadModal(false);
      const name = newLeadForm.fullName;
      setNewLeadForm({
        fullName: '',
        companyName: '',
        phoneNumber: '',
        whatsappNumber: '',
        email: '',
        city: 'Hyderabad',
        insuranceType: 'Health Insurance',
        existingInsurer: '',
        sumInsured: '₹10 Lakhs',
        estimatedPremium: '',
        priority: 'HIGH',
        stage: 'NEW_LEAD',
        notes: ''
      });
      toast.success(`Client record created for "${name}" (${created.clientCode})!`);
    } catch (err) {
      toast.error('Failed to create client: ' + (err.response?.data?.message || err.message));
    }
  };

  const exportToExcel = () => {
    const dataToExport = sortedLeads.map(l => ({
      'Client Code': l.clientCode,
      'Full Name': l.fullName,
      'Company Name': l.companyName || '',
      'Phone Number': l.phoneNumber,
      'WhatsApp Number': l.whatsappNumber || l.phoneNumber,
      'Email': l.email || '',
      'City': l.city || '',
      'Insurance Product': l.insuranceType,
      'Existing Insurer': l.existingInsurer || '',
      'Policy Expiry / Deadline': l.policyExpiryDate || '',
      'Sum Insured': l.sumInsured || '',
      'Estimated Premium (₹)': l.estimatedPremium || '',
      'Pipeline Stage': l.stage,
      'Priority': l.priority,
      'Assigned Advisor': l.assignedAdvisorName || '',
      'Notes': l.notes || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Clients");
    XLSX.writeFile(workbook, `Aadhiraksha_Client_Data_Sheet_${new Date().toISOString().slice(0,10)}.xlsx`);
    toast.info('Client Data Sheet exported to Excel successfully!');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const workbook = XLSX.read(bstr, { type: 'binary' });
        const wsname = workbook.SheetNames[0];
        const ws = workbook.Sheets[wsname];
        const rawData = XLSX.utils.sheet_to_json(ws);

        if (!rawData || rawData.length === 0) {
          toast.warning('No data found in uploaded sheet.');
          return;
        }

        // Map various column names
        const normalized = rawData.map(row => ({
          fullName: row['Full Name'] || row['Name'] || row['Client Name'] || row['fullName'] || '',
          companyName: row['Company Name'] || row['Company'] || row['companyName'] || '',
          phoneNumber: String(row['Phone Number'] || row['Phone'] || row['Mobile'] || row['phoneNumber'] || ''),
          whatsappNumber: String(row['WhatsApp Number'] || row['WhatsApp'] || row['whatsappNumber'] || row['Phone'] || ''),
          email: row['Email'] || row['email'] || '',
          city: row['City'] || row['city'] || 'Hyderabad',
          insuranceType: row['Insurance Product'] || row['Insurance Type'] || row['insuranceType'] || 'Health Insurance',
          existingInsurer: row['Existing Insurer'] || row['existingInsurer'] || '',
          policyExpiryDate: row['Policy Expiry / Deadline'] || row['Deadline'] || row['policyExpiryDate'] || '',
          sumInsured: row['Sum Insured'] || row['sumInsured'] || '₹10 Lakhs',
          estimatedPremium: row['Estimated Premium (₹)'] || row['Premium'] || row['estimatedPremium'] || null,
          priority: (row['Priority'] || row['priority'] || 'MEDIUM').toUpperCase(),
          stage: row['Pipeline Stage'] || row['Stage'] || row['stage'] || 'NEW_LEAD',
          notes: row['Notes'] || row['notes'] || ''
        })).filter(r => r.fullName && r.phoneNumber);

        if (normalized.length === 0) {
          toast.warning('Could not parse valid rows. Please ensure columns include "Full Name" and "Phone Number".');
          return;
        }

        setParsedBulkLeads(normalized);
        setShowBulkUploadModal(true);
      } catch (err) {
        toast.error('Failed to parse Excel file: ' + err.message);
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleConfirmBulkImport = async () => {
    setBulkImporting(true);
    try {
      const imported = await crmService.bulkImportLeads(parsedBulkLeads);
      setLeads(prev => [...imported, ...prev]);
      setShowBulkUploadModal(false);
      setParsedBulkLeads([]);
      toast.success(`Successfully imported ${imported.length} clients to your Data Sheet!`);
    } catch (err) {
      toast.error('Bulk import failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setBulkImporting(false);
    }
  };

  const filteredLeads = leads.filter(l => {
    const matchesSearch = 
      l.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.clientCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.phoneNumber.includes(searchQuery) ||
      (l.email && l.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (l.companyName && l.companyName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStage = stageFilter === 'ALL' || l.stage === stageFilter;
    const matchesPriority = priorityFilter === 'ALL' || l.priority === priorityFilter;
    const matchesType = insuranceTypeFilter === 'ALL' || l.insuranceType === insuranceTypeFilter;

    return matchesSearch && matchesStage && matchesPriority && matchesType;
  });

  const sortedLeads = [...filteredLeads].sort((a, b) => {
    if (sortField === 'deadline') {
      const dateA = a.policyExpiryDate ? new Date(a.policyExpiryDate).getTime() : (sortOrder === 'asc' ? 9999999999999 : 0);
      const dateB = b.policyExpiryDate ? new Date(b.policyExpiryDate).getTime() : (sortOrder === 'asc' ? 9999999999999 : 0);
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    }
    if (sortField === 'premium') {
      const premA = Number(a.estimatedPremium) || 0;
      const premB = Number(b.estimatedPremium) || 0;
      return sortOrder === 'asc' ? premA - premB : premB - premA;
    }
    if (sortField === 'name') {
      return sortOrder === 'asc' 
        ? a.fullName.localeCompare(b.fullName) 
        : b.fullName.localeCompare(a.fullName);
    }
    // Default: updatedAt / created
    const idA = a.id || 0;
    const idB = b.id || 0;
    return sortOrder === 'asc' ? idA - idB : idB - idA;
  });

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Search & Filter Bar */}
      <div 
        className="crm-sheet-toolbar"
        style={{
          background: 'var(--bg-card)',
          padding: '1rem 1.25rem',
          borderRadius: '16px',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        {/* Left: Search & Filter Dropdowns */}
        <div className="crm-sheet-search-filters" style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '280px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--bg-main)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '10px',
            padding: '8px 12px',
            flex: 1,
            minWidth: '200px'
          }}>
            <Search size={16} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search Client Name, Code, Phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontSize: '0.88rem',
                color: 'var(--text-main)'
              }}
            />
          </div>

          <div className="crm-sheet-filter-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '10px',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.84rem',
                fontWeight: 600,
                background: 'var(--bg-card)',
                color: 'var(--text-main)'
              }}
            >
              <option value="ALL">All Stages ({leads.length})</option>
              <option value="NEW_LEAD">New Lead</option>
              <option value="FOLLOWUP">Follow-up Due</option>
              <option value="QUOTATION">Quotation Shared</option>
              <option value="MEETING">Meeting Scheduled</option>
              <option value="DOCUMENTS">Documents Stage</option>
              <option value="POLICY_ISSUED">Policy Issued</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '10px',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.84rem',
                fontWeight: 600,
                background: 'var(--bg-card)',
                color: 'var(--text-main)'
              }}
            >
              <option value="ALL">All Priorities</option>
              <option value="HIGH">🔥 High Priority</option>
              <option value="MEDIUM">⚡ Medium</option>
              <option value="LOW">Standard</option>
            </select>
          </div>
        </div>

        {/* Right: Upload Excel, Export Excel, Bulk Reassign, Add Row */}
        <div className="crm-sheet-action-btns" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {canReassign && selectedLeadIds.length > 0 && (() => {
            const hasAssigned = leads.some(l => selectedLeadIds.includes(l.id) && l.assignedAdvisorId);
            const buttonLabel = hasAssigned ? `Assign / Reassign (${selectedLeadIds.length})` : `Assign Advisor (${selectedLeadIds.length})`;

            return (
              <button
                onClick={() => {
                  setBulkTargetAdvisorId('');
                  setBulkReassignReason('');
                  setShowBulkReassignModal(true);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#4338ca',
                  border: 'none',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  color: '#ffffff',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(67, 56, 202, 0.25)',
                  animation: 'pulse 2s infinite'
                }}
                title="Assign / Reassign selected clients to an advisor"
              >
                {hasAssigned ? <UserCheck size={15} /> : <UserPlus size={15} />} {buttonLabel}
              </button>
            );
          })()}

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept=".xlsx, .xls, .csv" 
            style={{ display: 'none' }} 
          />

          <button
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'var(--bg-main)',
              border: '1px solid var(--border-subtle)',
              padding: '8px 14px',
              borderRadius: '10px',
              fontSize: '0.84rem',
              fontWeight: 700,
              color: 'var(--text-main)',
              cursor: 'pointer'
            }}
            title="Import clients from .xlsx / .csv spreadsheet"
          >
            <Upload size={15} /> Upload Excel
          </button>

          <button
            onClick={exportToExcel}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'var(--bg-main)',
              border: '1px solid var(--border-subtle)',
              padding: '8px 14px',
              borderRadius: '10px',
              fontSize: '0.84rem',
              fontWeight: 700,
              color: 'var(--text-main)',
              cursor: 'pointer'
            }}
            title="Export sheet to Excel (.xlsx)"
          >
            <Download size={15} /> Export
          </button>

          <button
            onClick={() => setShowAddLeadModal(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'linear-gradient(135deg, var(--accent-gold), var(--accent-gold-hover))',
              border: 'none',
              padding: '9px 16px',
              borderRadius: '10px',
              fontSize: '0.86rem',
              fontWeight: 700,
              color: '#ffffff',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-gold)'
            }}
          >
            <Plus size={16} /> Add Client
          </button>
        </div>
      </div>

      {/* High-Density In-Portal Excel Data Sheet */}
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: '16px',
        border: '1px solid var(--border-subtle)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)'
      }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading Interactive Client Data Sheet...
          </div>
        ) : sortedLeads.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No client records found matching criteria.
          </div>
        ) : (
          <>
            {/* 1. DESKTOP VIEW: HIGH-DENSITY EXCEL DATA TABLE */}
            <div className="crm-desktop-table-container" style={{ overflowX: 'auto' }}>
              <table className="crm-table">
                <thead className="crm-table-head">
                  <tr>
                    {canReassign && (
                      <th className="crm-table-th" style={{ width: '40px', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={selectedLeadIds.length === sortedLeads.length && sortedLeads.length > 0}
                          onChange={toggleSelectAll}
                          style={{ cursor: 'pointer' }}
                          title="Select / Deselect all clients"
                        />
                      </th>
                    )}
                    <th className="crm-table-th" style={{ width: '130px' }}>Code</th>
                    <th 
                      className="crm-table-th" 
                      onClick={() => toggleSort('name')}
                      style={{ minWidth: '180px', cursor: 'pointer', userSelect: 'none' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span>Client & Organization</span>
                        <ArrowUpDown size={12} color={sortField === 'name' ? 'var(--accent-emerald)' : 'var(--text-muted)'} />
                      </div>
                    </th>
                    <th className="crm-table-th" style={{ minWidth: '150px' }}>Contact & Location</th>
                    <th className="crm-table-th" style={{ minWidth: '220px' }}>Product Portfolio & Specs</th>
                    <th 
                      className="crm-table-th" 
                      onClick={() => toggleSort('premium')}
                      style={{ minWidth: '150px', cursor: 'pointer', userSelect: 'none' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span>Coverage & Premium</span>
                        <ArrowUpDown size={12} color={sortField === 'premium' ? 'var(--accent-emerald)' : 'var(--text-muted)'} />
                      </div>
                    </th>
                    <th className="crm-table-th" style={{ minWidth: '140px' }}>Pipeline Stage</th>
                    <th className="crm-table-th" style={{ minWidth: '130px' }}>Advisor</th>
                    <th className="crm-table-th" style={{ textAlign: 'center', width: '145px' }}>Quick Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedLeads.map((lead, index) => {
                    const isEditing = editingRowId === lead.id;
                    const isSelected = selectedLeadIds.includes(lead.id);
                    const stageBadge = getStageBadge(lead.stage);
                    const priorityBadge = getPriorityBadge(lead.priority);

                    // Parse linked multi-product opportunities from notes if any
                    const linkedOpportunities = [];
                    if (lead.notes) {
                      const lines = lead.notes.split('\n');
                      lines.forEach(line => {
                        const match = line.match(/Ingested Opportunity:\s*([A-Z\s]+)/i);
                        if (match && match[1]) {
                          linkedOpportunities.push(match[1].trim());
                        }
                      });
                    }

                    return (
                      <tr 
                        key={lead.id} 
                        className="crm-table-row"
                        style={{ background: isSelected ? 'rgba(99, 102, 241, 0.05)' : undefined }}
                      >
                        {/* Multi-Select Checkbox for Admin/Manager */}
                        {canReassign && (
                          <td className="crm-table-td" style={{ textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectLead(lead.id)}
                              style={{ cursor: 'pointer' }}
                            />
                          </td>
                        )}

                        {/* Client Code */}
                        <td className="crm-table-td" style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                          <span 
                            onClick={() => onOpenClient360 && onOpenClient360(lead)}
                            style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                            title="Open Client 360 View"
                          >
                            {lead.clientCode}
                          </span>
                        </td>

                        {/* Client Name & Company */}
                        <td className="crm-table-td">
                          {isEditing ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <input
                                type="text"
                                placeholder="Full Name"
                                value={editFormData.fullName || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                                style={{ padding: '4px 6px', borderRadius: '4px', border: '1px solid var(--accent-emerald)', fontSize: '0.8rem', width: '100%' }}
                              />
                              <input
                                type="text"
                                placeholder="Company Name"
                                value={editFormData.companyName || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, companyName: e.target.value })}
                                style={{ padding: '4px 6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.74rem', width: '100%' }}
                              />
                            </div>
                          ) : (
                            <div>
                              <div 
                                onClick={() => onOpenClient360 && onOpenClient360(lead)}
                                style={{ fontWeight: 800, color: '#0f2b48', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                              >
                                {lead.fullName} <ExternalLink size={12} color="var(--accent-gold)" />
                              </div>
                              <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '1px' }}>
                                {lead.companyName || 'Retail Client'}
                              </div>
                            </div>
                          )}
                        </td>

                        {/* Contact & Location */}
                        <td className="crm-table-td">
                          {isEditing ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <input
                                type="text"
                                placeholder="Phone Number"
                                value={editFormData.phoneNumber || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, phoneNumber: e.target.value })}
                                style={{ padding: '4px 6px', borderRadius: '4px', border: '1px solid var(--accent-emerald)', fontSize: '0.8rem', width: '100%' }}
                              />
                              <input
                                type="text"
                                placeholder="City / Location"
                                value={editFormData.city || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                                style={{ padding: '4px 6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.74rem', width: '100%' }}
                              />
                            </div>
                          ) : (
                            <div>
                              <div style={{ fontWeight: 700, color: '#0f2b48', fontSize: '0.84rem' }}>{lead.phoneNumber}</div>
                              <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{lead.city || 'India'}</div>
                            </div>
                          )}
                        </td>

                        {/* Product Portfolio & Multi-Policy Chips */}
                        <td className="crm-table-td">
                          {isEditing ? (
                            <select
                              value={editFormData.insuranceType || ''}
                              onChange={(e) => setEditFormData({ ...editFormData, insuranceType: e.target.value })}
                              style={{ padding: '4px 6px', borderRadius: '4px', border: '1px solid var(--accent-emerald)', fontSize: '0.8rem', width: '100%' }}
                            >
                              <option value="Health Insurance">Health Insurance</option>
                              <option value="Term Life Insurance">Term Life Insurance</option>
                              <option value="Vehicle / Motor Insurance">Vehicle Insurance</option>
                              <option value="Group / SME Insurance">Group / SME</option>
                              <option value="Travel Insurance">Travel Insurance</option>
                              <option value="Loans & Financing">Loans</option>
                            </select>
                          ) : (() => {
                            const primaryBadge = getProductBadge(lead.insuranceType);
                            const maxVisibleOpps = 2;
                            const visibleOpps = linkedOpportunities.slice(0, maxVisibleOpps);
                            const remainingCount = linkedOpportunities.length - maxVisibleOpps;
                            const remainingOpps = linkedOpportunities.slice(maxVisibleOpps);

                            return (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                {/* Primary Product Tag */}
                                <div style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  background: primaryBadge.bg,
                                  color: primaryBadge.color,
                                  border: `1px solid ${primaryBadge.border}`,
                                  padding: '0.15rem 0.5rem',
                                  borderRadius: '6px',
                                  fontSize: '0.74rem',
                                  fontWeight: 800,
                                  width: 'fit-content'
                                }}>
                                  {primaryBadge.icon}
                                  <span>{primaryBadge.label}</span>
                                </div>

                                {/* Additional Ingested Opportunities with Max-2 + Overflow Capsule */}
                                {linkedOpportunities.length > 0 && (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                                    {visibleOpps.map((oppName, oppIdx) => {
                                      const oppBadge = getProductBadge(oppName);
                                      return (
                                        <div
                                          key={oppIdx}
                                          style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '3px',
                                            background: oppBadge.bg,
                                            color: oppBadge.color,
                                            border: `1px solid ${oppBadge.border}`,
                                            padding: '0.1rem 0.4rem',
                                            borderRadius: '5px',
                                            fontSize: '0.68rem',
                                            fontWeight: 700
                                          }}
                                          title={`Opportunity: ${oppBadge.label}`}
                                        >
                                          {oppBadge.icon}
                                          <span>+{oppBadge.shortLabel}</span>
                                        </div>
                                      );
                                    })}

                                    {/* Overflow Capsule */}
                                    {remainingCount > 0 && (
                                      <div
                                        onClick={() => onOpenClient360 && onOpenClient360(lead)}
                                        style={{
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: '2px',
                                          background: '#f1f5f9',
                                          color: '#475569',
                                          border: '1px solid #cbd5e1',
                                          padding: '0.1rem 0.4rem',
                                          borderRadius: '5px',
                                          fontSize: '0.68rem',
                                          fontWeight: 800,
                                          cursor: 'pointer'
                                        }}
                                        title={`+${remainingCount} more policies: ${remainingOpps.map(o => getProductBadge(o).label).join(', ')} (Click to view Client 360)`}
                                      >
                                        <span>+{remainingCount} More ▾</span>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </td>

                        {/* Coverage & Premium */}
                        <td className="crm-table-td">
                          {isEditing ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <input
                                type="text"
                                placeholder="Sum: ₹10 Lakhs"
                                value={editFormData.sumInsured || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, sumInsured: e.target.value })}
                                style={{ padding: '4px 6px', borderRadius: '4px', border: '1px solid var(--accent-emerald)', fontSize: '0.78rem', width: '100%' }}
                              />
                              <input
                                type="number"
                                placeholder="Premium: ₹15,000"
                                value={editFormData.estimatedPremium || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, estimatedPremium: e.target.value })}
                                style={{ padding: '4px 6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.74rem', width: '100%' }}
                              />
                            </div>
                          ) : (
                            <div>
                              <div style={{ fontWeight: 800, color: '#0f2b48', fontSize: '0.84rem' }}>
                                {lead.sumInsured || (lead.notes?.match(/₹[\d,]+(\s*Lakhs|\s*Crore|\s*Cr)?/)?.[0] ? `${lead.notes.match(/₹[\d,]+(\s*Lakhs|\s*Crore|\s*Cr)?/)[0]} (Desired)` : 'Quote Pending')}
                              </div>
                              <div style={{ fontSize: '0.74rem', color: lead.estimatedPremium ? '#059669' : '#64748b', fontWeight: lead.estimatedPremium ? 700 : 500 }}>
                                {lead.estimatedPremium ? `Est. ₹${Number(lead.estimatedPremium).toLocaleString()}` : (lead.policyExpiryDate ? `Exp: ${lead.policyExpiryDate}` : 'Pending Proposal')}
                              </div>
                            </div>
                          )}
                        </td>

                        {/* Pipeline Stage & Priority */}
                        <td className="crm-table-td">
                          {isEditing ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <select
                                value={editFormData.stage || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, stage: e.target.value })}
                                style={{ padding: '4px 6px', borderRadius: '4px', border: '1px solid var(--accent-emerald)', fontSize: '0.78rem', width: '100%' }}
                              >
                                <option value="NEW_LEAD">New Lead</option>
                                <option value="CONTACTED">Contacted</option>
                                <option value="FOLLOWUP">Follow-up Due</option>
                                <option value="INTERESTED">Interested</option>
                                <option value="QUOTATION">Quotation</option>
                                <option value="MEETING">Meeting</option>
                                <option value="DOCUMENTS">Documents</option>
                                <option value="PAYMENT">Payment</option>
                                <option value="POLICY_ISSUED">Policy Issued</option>
                                <option value="LOST">Lost</option>
                              </select>
                              <select
                                value={editFormData.priority || 'MEDIUM'}
                                onChange={(e) => setEditFormData({ ...editFormData, priority: e.target.value })}
                                style={{ padding: '4px 6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.74rem', width: '100%' }}
                              >
                                <option value="HIGH">🔥 High Priority</option>
                                <option value="MEDIUM">⚡ Medium Priority</option>
                                <option value="LOW">Standard Priority</option>
                              </select>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                              <span style={{
                                display: 'inline-block',
                                padding: '2px 8px',
                                borderRadius: '9999px',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                background: stageBadge.bg,
                                color: stageBadge.color,
                                width: 'fit-content'
                              }}>
                                {stageBadge.label}
                              </span>
                              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: priorityBadge.color }}>
                                {priorityBadge.label}
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Assigned Advisor */}
                        <td className="crm-table-td">
                          {isEditing && canReassign ? (
                            <select
                              value={editFormData.assignedAdvisorId || ''}
                              onChange={(e) => {
                                const selectedId = e.target.value;
                                const adv = advisors.find(a => String(a.id) === String(selectedId));
                                setEditFormData({
                                  ...editFormData,
                                  assignedAdvisorId: selectedId ? Number(selectedId) : null,
                                  assignedAdvisorName: adv ? adv.fullName : 'Unassigned'
                                });
                              }}
                              style={{ padding: '4px 6px', borderRadius: '4px', border: '1px solid var(--accent-emerald)', fontSize: '0.78rem', width: '100%' }}
                            >
                              <option value="">Unassigned</option>
                              {advisors.map(adv => (
                                <option key={adv.id} value={adv.id}>
                                  {adv.fullName}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                              <span style={{ color: lead.assignedAdvisorName ? '#0f2b48' : '#94a3b8', fontWeight: 700, fontSize: '0.8rem' }}>
                                {lead.assignedAdvisorName || 'Unassigned'}
                              </span>
                              {canReassign && (
                                <button
                                  onClick={() => openQuickReassign(lead)}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: lead.assignedAdvisorName ? '#4f46e5' : '#059669',
                                    cursor: 'pointer',
                                    padding: '2px',
                                    display: 'flex',
                                    alignItems: 'center'
                                  }}
                                  title={lead.assignedAdvisorName ? "Reassign to another Advisor" : "Assign to an Insurance Advisor"}
                                >
                                  {lead.assignedAdvisorName ? <UserCheck size={13} /> : <UserPlus size={13} />}
                                </button>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Quick Actions */}
                        <td className="crm-table-td" style={{ textAlign: 'center' }}>
                          {isEditing ? (
                            <div style={{ display: 'inline-flex', gap: '4px' }}>
                              <button
                                onClick={() => saveInlineEdit(lead.id)}
                                disabled={isSavingInline}
                                style={{
                                  background: 'var(--accent-emerald)',
                                  color: '#fff',
                                  border: 'none',
                                  padding: '5px 8px',
                                  borderRadius: '6px',
                                  cursor: isSavingInline ? 'not-allowed' : 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                                title="Save Changes"
                              >
                                {isSavingInline ? <RefreshCw size={13} className="spin" /> : <Save size={13} />}
                              </button>
                              <button
                                onClick={cancelInlineEdit}
                                disabled={isSavingInline}
                                style={{
                                  background: 'var(--border-subtle)',
                                  color: 'var(--text-main)',
                                  border: 'none',
                                  padding: '5px 8px',
                                  borderRadius: '6px',
                                  cursor: isSavingInline ? 'not-allowed' : 'pointer',
                                  display: 'flex',
                                  alignItems: 'center'
                                }}
                                title="Cancel Edit"
                              >
                                <X size={13} />
                              </button>
                            </div>
                          ) : (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
                              <button
                                onClick={() => onOpenCallModal && onOpenCallModal(lead)}
                                style={{
                                  background: '#ecfdf5',
                                  color: '#059669',
                                  border: '1px solid #a7f3d0',
                                  padding: '5px 6px',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center'
                                }}
                                title="Log Telephony Call"
                              >
                                <Phone size={13} />
                              </button>

                              <button
                                onClick={() => {
                                  const clean = (lead.whatsappNumber || lead.phoneNumber || '').replace(/[^0-9]/g, '');
                                  window.open(`https://wa.me/${clean}?text=Hello%20${encodeURIComponent(lead.fullName)},%20Aadhiraksha%20Insurance%20Advisory.`, '_blank');
                                }}
                                style={{
                                  background: '#f0fdf4',
                                  color: '#16a34a',
                                  border: '1px solid #bbf7d0',
                                  padding: '5px 6px',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center'
                                }}
                                title="1-Tap WhatsApp"
                              >
                                <MessageSquare size={13} />
                              </button>

                              <button
                                onClick={() => onOpenMeetingModal && onOpenMeetingModal(lead)}
                                style={{
                                  background: '#eff6ff',
                                  color: '#2563eb',
                                  border: '1px solid #bfdbfe',
                                  padding: '5px 6px',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center'
                                }}
                                title="Schedule Meeting"
                              >
                                <Calendar size={13} />
                              </button>

                              <button
                                onClick={() => startInlineEdit(lead)}
                                style={{
                                  background: '#f8fafc',
                                  color: '#64748b',
                                  border: '1px solid #e2e8f0',
                                  padding: '5px 6px',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center'
                                }}
                                title="Inline Edit"
                              >
                                <Edit3 size={13} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* 2. MOBILE VIEW: ULTRA-COMPACT TOUCH-FRIENDLY CLIENT CARDS */}
            <div className="crm-mobile-cards-container" style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {filteredLeads.map((lead) => {
                const isEditing = editingRowId === lead.id;
                const stageBadge = getStageBadge(lead.stage);
                const priorityBadge = getPriorityBadge(lead.priority);
                const primaryBadge = getProductBadge(lead.insuranceType);

                // Parse linked multi-product opportunities from notes
                const cardLinkedOpportunities = [];
                if (lead.notes) {
                  const lines = lead.notes.split('\n');
                  lines.forEach(line => {
                    const match = line.match(/Ingested Opportunity:\s*([A-Z\s]+)/i);
                    if (match && match[1]) {
                      cardLinkedOpportunities.push(match[1].trim());
                    }
                  });
                }

                const maxMobileVisibleOpps = 2;
                const visibleMobileOpps = cardLinkedOpportunities.slice(0, maxMobileVisibleOpps);
                const mobileRemainingCount = cardLinkedOpportunities.length - maxMobileVisibleOpps;

                if (isEditing) {
                  return (
                    <div
                      key={lead.id}
                      className="crm-card"
                      style={{
                        padding: '1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                        borderRadius: '12px',
                        border: '1.5px solid var(--accent-emerald)',
                        background: '#ffffff',
                        boxShadow: '0 4px 12px rgba(5, 150, 105, 0.1)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0f2b48' }}>
                          ✏️ Edit: {lead.fullName} <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--accent-emerald)' }}>({lead.clientCode})</span>
                        </div>
                        <button
                          onClick={cancelInlineEdit}
                          style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '2px' }}
                        >
                          <X size={16} />
                        </button>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        <div>
                          <label style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '2px' }}>Stage</label>
                          <select
                            value={editFormData.stage || ''}
                            onChange={(e) => setEditFormData({ ...editFormData, stage: e.target.value })}
                            style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.78rem', background: '#fff' }}
                          >
                            <option value="NEW_LEAD">New Lead</option>
                            <option value="CONTACTED">Contacted</option>
                            <option value="FOLLOWUP">Follow-up Due</option>
                            <option value="INTERESTED">Interested</option>
                            <option value="QUOTATION">Quotation</option>
                            <option value="MEETING">Meeting</option>
                            <option value="DOCUMENTS">Documents</option>
                            <option value="PAYMENT">Payment</option>
                            <option value="POLICY_ISSUED">Policy Issued</option>
                            <option value="LOST">Lost</option>
                          </select>
                        </div>

                        <div>
                          <label style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '2px' }}>Priority</label>
                          <select
                            value={editFormData.priority || 'MEDIUM'}
                            onChange={(e) => setEditFormData({ ...editFormData, priority: e.target.value })}
                            style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.78rem', background: '#fff' }}
                          >
                            <option value="HIGH">🔥 High</option>
                            <option value="MEDIUM">⚡ Medium</option>
                            <option value="LOW">Low</option>
                          </select>
                        </div>

                        <div>
                          <label style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '2px' }}>Product</label>
                          <select
                            value={editFormData.insuranceType || ''}
                            onChange={(e) => setEditFormData({ ...editFormData, insuranceType: e.target.value })}
                            style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.78rem', background: '#fff' }}
                          >
                            <option value="Health Insurance">Health</option>
                            <option value="Term Life Insurance">Term Life</option>
                            <option value="Vehicle / Motor Insurance">Vehicle</option>
                            <option value="Group / SME Insurance">Corporate / SME</option>
                            <option value="Travel Insurance">Travel</option>
                            <option value="Loans & Financing">Loans</option>
                          </select>
                        </div>

                        <div>
                          <label style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '2px' }}>Coverage / Sum</label>
                          <input
                            type="text"
                            value={editFormData.sumInsured || ''}
                            placeholder="₹10 Lakhs"
                            onChange={(e) => setEditFormData({ ...editFormData, sumInsured: e.target.value })}
                            style={{ width: '100%', padding: '5px 6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.78rem' }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '2px' }}>Est. Premium (₹)</label>
                          <input
                            type="number"
                            value={editFormData.estimatedPremium || ''}
                            placeholder="15000"
                            onChange={(e) => setEditFormData({ ...editFormData, estimatedPremium: e.target.value })}
                            style={{ width: '100%', padding: '5px 6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.78rem' }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '2px' }}>Assigned Advisor</label>
                          <select
                            value={editFormData.assignedAdvisorId || ''}
                            onChange={(e) => {
                              const selectedId = e.target.value;
                              const adv = advisors.find(a => String(a.id) === String(selectedId));
                              setEditFormData({
                                ...editFormData,
                                assignedAdvisorId: selectedId ? Number(selectedId) : null,
                                assignedAdvisorName: adv ? adv.fullName : 'Unassigned'
                              });
                            }}
                            disabled={!canReassign}
                            style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.78rem', background: canReassign ? '#fff' : '#f1f5f9' }}
                          >
                            <option value="">Unassigned</option>
                            {advisors.map(adv => (
                              <option key={adv.id} value={adv.id}>
                                {adv.fullName}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                        <button
                          onClick={() => saveInlineEdit(lead.id)}
                          disabled={isSavingInline}
                          style={{
                            flex: 1,
                            padding: '0.55rem',
                            borderRadius: '8px',
                            background: 'var(--accent-emerald)',
                            color: '#fff',
                            border: 'none',
                            fontWeight: 700,
                            fontSize: '0.82rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px',
                            cursor: isSavingInline ? 'not-allowed' : 'pointer'
                          }}
                        >
                          {isSavingInline ? <RefreshCw size={14} className="spin" /> : <Save size={14} />}
                          <span>Save Changes</span>
                        </button>
                        <button
                          onClick={cancelInlineEdit}
                          disabled={isSavingInline}
                          style={{
                            padding: '0.55rem 0.85rem',
                            borderRadius: '8px',
                            background: '#f1f5f9',
                            color: '#475569',
                            border: '1px solid #cbd5e1',
                            fontWeight: 700,
                            fontSize: '0.82rem',
                            cursor: isSavingInline ? 'not-allowed' : 'pointer'
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={lead.id}
                    className="crm-card"
                    style={{
                      padding: '0.75rem 0.85rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.45rem',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      background: '#ffffff',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.03)'
                    }}
                  >
                    {/* Top Row: Identity + Status Badges + Quick Action Circular Buttons */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <span 
                            onClick={() => onOpenClient360 && onOpenClient360(lead)}
                            style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0f2b48', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                          >
                            {lead.fullName} <ExternalLink size={11} color="var(--accent-gold)" />
                          </span>

                          <span style={{
                            padding: '1px 6px',
                            borderRadius: '999px',
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            background: stageBadge.bg,
                            color: stageBadge.color
                          }}>
                            {stageBadge.label}
                          </span>

                          <span style={{
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            color: priorityBadge.color
                          }}>
                            {priorityBadge.label}
                          </span>
                        </div>

                        <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '1px', display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                          <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--accent-emerald)' }}>{lead.clientCode}</span>
                          <span>•</span>
                          <span style={{ fontWeight: 600, color: '#334155' }}>{lead.companyName || 'Retail Client'}</span>
                          {lead.city && (
                            <>
                              <span>•</span>
                              <span>{lead.city}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* 1-Tap Action Pill Icons (Call, WhatsApp, Meeting, Edit) */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                        <button
                          onClick={() => onOpenCallModal && onOpenCallModal(lead)}
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            background: '#ecfdf5',
                            color: '#059669',
                            border: '1px solid #a7f3d0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                          }}
                          title={`Call ${lead.fullName}`}
                        >
                          <Phone size={13} />
                        </button>

                        <button
                          onClick={() => openWhatsApp(lead.phoneNumber, lead.fullName, lead.insuranceType)}
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            background: '#dcfce7',
                            color: '#15803d',
                            border: '1px solid #86efac',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                          }}
                          title="WhatsApp Client"
                        >
                          <MessageSquare size={13} />
                        </button>

                        <button
                          onClick={() => onOpenMeetingModal && onOpenMeetingModal(lead)}
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            background: '#eff6ff',
                            color: '#2563eb',
                            border: '1px solid #bfdbfe',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                          }}
                          title="Schedule Meeting"
                        >
                          <Calendar size={13} />
                        </button>

                        <button
                          onClick={() => startInlineEdit(lead)}
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            background: '#f8fafc',
                            color: '#0f2b48',
                            border: '1px solid #cbd5e1',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                          }}
                          title="Quick Edit Client Record"
                        >
                          <Edit3 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Bottom Consolidated Row: Portfolio Micro-Badges + Coverage + Advisor */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: '#f8fafc',
                      padding: '0.35rem 0.6rem',
                      borderRadius: '8px',
                      fontSize: '0.72rem',
                      gap: '0.4rem',
                      flexWrap: 'wrap'
                    }}>
                      {/* Products */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px', flexWrap: 'wrap' }}>
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                          background: primaryBadge.bg,
                          color: primaryBadge.color,
                          border: `1px solid ${primaryBadge.border}`,
                          padding: '0.05rem 0.35rem',
                          borderRadius: '4px',
                          fontSize: '0.68rem',
                          fontWeight: 800
                        }}>
                          {primaryBadge.icon}
                          <span>{primaryBadge.shortLabel}</span>
                        </div>

                        {visibleMobileOpps.map((oppName, oppIdx) => {
                          const oppBadge = getProductBadge(oppName);
                          return (
                            <div
                              key={oppIdx}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '2px',
                                background: oppBadge.bg,
                                color: oppBadge.color,
                                border: `1px solid ${oppBadge.border}`,
                                padding: '0.05rem 0.35rem',
                                borderRadius: '4px',
                                fontSize: '0.68rem',
                                fontWeight: 700
                              }}
                            >
                              {oppBadge.icon}
                              <span>+{oppBadge.shortLabel}</span>
                            </div>
                          );
                        })}

                        {mobileRemainingCount > 0 && (
                          <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748b', background: '#e2e8f0', padding: '0.05rem 0.3rem', borderRadius: '4px' }}>
                            +{mobileRemainingCount} More
                          </span>
                        )}
                      </div>

                      {/* Coverage & Advisor */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.7rem' }}>
                        <span style={{ fontWeight: 800, color: '#059669' }}>
                          {lead.sumInsured || '₹10L'}
                        </span>
                        <span>•</span>
                        <span style={{ fontWeight: 600, color: lead.assignedAdvisorName ? '#0f2b48' : '#94a3b8' }}>
                          👤 {lead.assignedAdvisorName ? lead.assignedAdvisorName.split(' ')[0] : 'Unassigned'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Modal: Add New Client Row */}
      {showAddLeadModal && (
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
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#0f2b48', letterSpacing: '-0.2px' }}>
                  Add New Client Lead
                </h3>
                <p style={{ margin: '3px 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                  Create a new record in the CRM data sheet
                </p>
              </div>
              <button
                onClick={() => setShowAddLeadModal(false)}
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

            <form onSubmit={handleCreateLead} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Client Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={newLeadForm.fullName}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, fullName: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Company / Organization
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. RK Tech Pvt Ltd"
                    value={newLeadForm.companyName}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, companyName: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 9848012345"
                    value={newLeadForm.phoneNumber}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, phoneNumber: e.target.value, whatsappNumber: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. ramesh@example.com"
                    value={newLeadForm.email}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, email: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Insurance Category *
                  </label>
                  <select
                    value={newLeadForm.insuranceType}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, insuranceType: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', background: '#ffffff' }}
                  >
                    <option value="Health Insurance">Health Insurance</option>
                    <option value="Term Life Insurance">Term Life Insurance</option>
                    <option value="Vehicle / Motor Insurance">Vehicle / Motor Insurance</option>
                    <option value="Group / SME Insurance">Group / SME Insurance</option>
                    <option value="Travel Insurance">Travel Insurance</option>
                    <option value="Loans & Financing">Loans & Financing</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Desired Sum Insured
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ₹10 Lakhs"
                    value={newLeadForm.sumInsured}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, sumInsured: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Priority
                  </label>
                  <select
                    value={newLeadForm.priority}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, priority: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', background: '#ffffff' }}
                  >
                    <option value="HIGH">🔥 High (Immediate Followup)</option>
                    <option value="MEDIUM">⚡ Medium</option>
                    <option value="LOW">Standard</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    City
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Hyderabad"
                    value={newLeadForm.city}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, city: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Notes & Client Requirements
                </label>
                <textarea
                  rows="2"
                  placeholder="e.g. Looking for family floater policy for self, spouse, 2 kids."
                  value={newLeadForm.notes}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, notes: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowAddLeadModal(false)}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ flex: 2, padding: '10px', borderRadius: '8px', border: 'none', background: '#059669', color: '#ffffff', fontWeight: 700, cursor: 'pointer' }}
                >
                  Save to Sheet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Bulk Excel Upload Preview & Confirm */}
      {showBulkUploadModal && (
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
            maxWidth: '780px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden'
          }}>
            {/* Header */}
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
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: '#ecfdf5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#059669'
                }}>
                  <FileSpreadsheet size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#0f2b48' }}>
                    Bulk Import Preview ({parsedBulkLeads.length} Clients)
                  </h3>
                  <p style={{ margin: '3px 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                    Review parsed rows from your Excel sheet before saving to CRM database
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setShowBulkUploadModal(false); setParsedBulkLeads([]); }}
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

            {/* Table Preview */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.5rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ padding: '8px 10px', fontWeight: 700, color: '#334155' }}>#</th>
                    <th style={{ padding: '8px 10px', fontWeight: 700, color: '#334155' }}>Client Name</th>
                    <th style={{ padding: '8px 10px', fontWeight: 700, color: '#334155' }}>Mobile</th>
                    <th style={{ padding: '8px 10px', fontWeight: 700, color: '#334155' }}>Insurance Product</th>
                    <th style={{ padding: '8px 10px', fontWeight: 700, color: '#334155' }}>Coverage / Prem</th>
                    <th style={{ padding: '8px 10px', fontWeight: 700, color: '#334155' }}>Deadline</th>
                    <th style={{ padding: '8px 10px', fontWeight: 700, color: '#334155' }}>Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedBulkLeads.slice(0, 15).map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '8px 10px', color: '#64748b' }}>{idx + 1}</td>
                      <td style={{ padding: '8px 10px', fontWeight: 600, color: '#0f2b48' }}>
                        {row.fullName}
                        {row.companyName && <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{row.companyName}</div>}
                      </td>
                      <td style={{ padding: '8px 10px', color: '#334155' }}>{row.phoneNumber}</td>
                      <td style={{ padding: '8px 10px', color: '#0f2b48', fontWeight: 600 }}>{row.insuranceType}</td>
                      <td style={{ padding: '8px 10px', color: '#059669', fontWeight: 600 }}>
                        {row.sumInsured} {row.estimatedPremium ? `(₹${row.estimatedPremium})` : ''}
                      </td>
                      <td style={{ padding: '8px 10px', color: '#64748b' }}>{row.policyExpiryDate || '-'}</td>
                      <td style={{ padding: '8px 10px' }}>
                        <span style={{
                          padding: '2px 6px',
                          borderRadius: '6px',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          background: row.priority === 'HIGH' ? '#fef2f2' : '#f8fafc',
                          color: row.priority === 'HIGH' ? '#dc2626' : '#64748b'
                        }}>
                          {row.priority}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {parsedBulkLeads.length > 15 && (
                <div style={{ textAlign: 'center', padding: '10px', color: '#64748b', fontSize: '0.78rem' }}>
                  ... and {parsedBulkLeads.length - 15} more rows ready to import.
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{
              padding: '1rem 1.5rem',
              background: '#f8fafc',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Database will remain the main source of truth.
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => { setShowBulkUploadModal(false); setParsedBulkLeads([]); }}
                  disabled={bulkImporting}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmBulkImport}
                  disabled={bulkImporting}
                  style={{
                    padding: '8px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #059669, #047857)',
                    color: '#ffffff',
                    fontWeight: 700,
                    cursor: bulkImporting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 4px rgba(5, 150, 105, 0.2)'
                  }}
                >
                  {bulkImporting ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" /> Importing...
                    </>
                  ) : (
                    <>
                      <Check size={16} /> Confirm Import ({parsedBulkLeads.length})
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Single Quick Reassign Lead */}
      {quickReassignLead && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
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
            maxWidth: '520px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: quickReassignLead.assignedAdvisorId ? '#e0e7ff' : '#dcfce7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: quickReassignLead.assignedAdvisorId ? '#4338ca' : '#15803d'
                }}>
                  {quickReassignLead.assignedAdvisorId ? <UserCheck size={20} /> : <UserPlus size={20} />}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#0f2b48' }}>
                    {quickReassignLead.assignedAdvisorId ? 'Reassign Insurance Advisor' : 'Assign Insurance Advisor'}
                  </h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                    {quickReassignLead.fullName} ({quickReassignLead.clientCode})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setQuickReassignLead(null)}
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

            <form onSubmit={handleQuickReassignSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Select Target Insurance Advisor *
                </label>
                <select
                  required
                  value={quickTargetAdvisorId}
                  onChange={(e) => setQuickTargetAdvisorId(e.target.value)}
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
                  <option value="">-- Choose Advisor --</option>
                  {advisors.map(adv => (
                    <option key={adv.id} value={adv.id}>
                      {adv.fullName} • {adv.branchCity || adv.employeeCode || 'Advisor'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Reassignment Reason / Governance Note
                </label>
                <textarea
                  rows="3"
                  placeholder="e.g. Territory realignment, advisor workload distribution, or specialized commercial quote handling..."
                  value={quickReassignReason}
                  onChange={(e) => setQuickReassignReason(e.target.value)}
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
                  onClick={() => setQuickReassignLead(null)}
                  disabled={quickReassigning}
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
                  disabled={quickReassigning}
                  style={{
                    flex: 2,
                    padding: '10px',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #4338ca, #3730a3)',
                    color: '#ffffff',
                    fontWeight: 700,
                    cursor: quickReassigning ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  {quickReassigning ? <RefreshCw size={14} className="animate-spin" /> : <Check size={16} />}
                  Confirm Reassignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Bulk Reassignment */}
      {showBulkReassignModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
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
            maxWidth: '520px',
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: '#e0e7ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#4338ca'
                }}>
                  <Users size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#0f2b48' }}>
                    Bulk Reassign Clients
                  </h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                    Reassigning {selectedLeadIds.length} selected client leads
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowBulkReassignModal(false)}
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

            <form onSubmit={handleBulkReassignSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Assign all {selectedLeadIds.length} leads to Advisor *
                </label>
                <select
                  required
                  value={bulkTargetAdvisorId}
                  onChange={(e) => setBulkTargetAdvisorId(e.target.value)}
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
                  Batch Reason / Instructions
                </label>
                <textarea
                  rows="3"
                  placeholder="e.g. Portfolio redistribution or new campaign allocation..."
                  value={bulkReassignReason}
                  onChange={(e) => setBulkReassignReason(e.target.value)}
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
                  onClick={() => setShowBulkReassignModal(false)}
                  disabled={bulkReassigning}
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
                  disabled={bulkReassigning}
                  style={{
                    flex: 2,
                    padding: '10px',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #4338ca, #3730a3)',
                    color: '#ffffff',
                    fontWeight: 700,
                    cursor: bulkReassigning ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  {bulkReassigning ? <RefreshCw size={14} className="animate-spin" /> : <Check size={16} />}
                  Reassign {selectedLeadIds.length} Clients
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
