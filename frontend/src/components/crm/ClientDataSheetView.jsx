import React, { useState, useEffect } from 'react';
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
  ArrowUpDown
} from 'lucide-react';
import { crmService } from '../../services/api';

export default function ClientDataSheetView({ onOpenClient360, onOpenCallModal, onOpenMeetingModal }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [insuranceTypeFilter, setInsuranceTypeFilter] = useState('ALL');
  const [editingRowId, setEditingRowId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [newLeadForm, setNewLeadForm] = useState({
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

  useEffect(() => {
    loadLeads();
  }, []);

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

  const startInlineEdit = (lead) => {
    setEditingRowId(lead.id);
    setEditFormData({ ...lead });
  };

  const cancelInlineEdit = () => {
    setEditingRowId(null);
    setEditFormData({});
  };

  const saveInlineEdit = async (leadId) => {
    try {
      await crmService.updateLead(leadId, editFormData);
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, ...editFormData } : l));
      setEditingRowId(null);
    } catch (err) {
      alert('Failed to update lead: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleCreateLead = async (e) => {
    e.preventDefault();
    try {
      const created = await crmService.createLead(newLeadForm);
      setLeads(prev => [created, ...prev]);
      setShowAddLeadModal(false);
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
    } catch (err) {
      alert('Failed to create lead: ' + (err.response?.data?.message || err.message));
    }
  };

  const exportToCsv = () => {
    const headers = ['Client Code', 'Full Name', 'Company', 'Phone', 'Email', 'City', 'Insurance Type', 'Sum Insured', 'Premium', 'Stage', 'Priority', 'Assigned Advisor', 'Notes'];
    const rows = filteredLeads.map(l => [
      l.clientCode,
      `"${l.fullName}"`,
      `"${l.companyName || ''}"`,
      `"${l.phoneNumber}"`,
      `"${l.email || ''}"`,
      `"${l.city || ''}"`,
      `"${l.insuranceType}"`,
      `"${l.sumInsured || ''}"`,
      l.estimatedPremium || '',
      l.stage,
      l.priority,
      `"${l.assignedAdvisorName || ''}"`,
      `"${(l.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `aadhiraksha_client_sheet_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openWhatsApp = (phone, name, insuranceType) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const text = encodeURIComponent(`Hello ${name}, this is your Insurance Advisor from Aadhiraksha InsurTech regarding your ${insuranceType} inquiry. How can I assist you today?`);
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  };

  const getStageBadge = (stage) => {
    switch (stage) {
      case 'NEW_LEAD':
        return { bg: '#e0f2fe', color: '#0369a1', label: 'New Lead' };
      case 'CONTACTED':
        return { bg: '#fef3c7', color: '#b45309', label: 'Contacted' };
      case 'FOLLOWUP':
        return { bg: '#fed7aa', color: '#c2410c', label: 'Follow-up Due' };
      case 'INTERESTED':
        return { bg: '#dcfce7', color: '#15803d', label: 'Interested' };
      case 'QUOTATION':
        return { bg: '#e0e7ff', color: '#4338ca', label: 'Quotation Sent' };
      case 'MEETING':
        return { bg: '#f3e8ff', color: '#7e22ce', label: 'Meeting Scheduled' };
      case 'DOCUMENTS':
        return { bg: '#ccfbf1', color: '#0f766e', label: 'Docs In Progress' };
      case 'PAYMENT':
        return { bg: '#fef9c3', color: '#a16207', label: 'Payment Pending' };
      case 'POLICY_ISSUED':
      case 'CONVERTED':
        return { bg: '#d1fae5', color: '#065f46', label: 'Policy Issued 🎉' };
      case 'LOST':
      case 'NOT_INTERESTED':
        return { bg: '#fee2e2', color: '#b91c1c', label: 'Lost / Closed' };
      default:
        return { bg: '#f1f5f9', color: '#475569', label: stage };
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'HIGH':
        return { color: '#ef4444', label: '🔥 High' };
      case 'MEDIUM':
        return { color: '#f59e0b', label: '⚡ Medium' };
      default:
        return { color: '#64748b', label: 'Standard' };
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

        {/* Right: Add Row, Export Buttons */}
        <div className="crm-sheet-action-btns" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={exportToCsv}
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
        ) : filteredLeads.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No client records found matching criteria.
          </div>
        ) : (
          <>
            {/* 1. DESKTOP VIEW: HIGH-DENSITY EXCEL DATA TABLE */}
            <div className="crm-desktop-table-container" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: 'var(--primary-navy)', color: '#ffffff', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    <th style={{ padding: '12px 14px', width: '110px' }}>Code</th>
                    <th style={{ padding: '12px 14px', minWidth: '180px' }}>Client Name & Company</th>
                    <th style={{ padding: '12px 14px', minWidth: '140px' }}>Contact</th>
                    <th style={{ padding: '12px 14px', minWidth: '150px' }}>Insurance Product</th>
                    <th style={{ padding: '12px 14px', minWidth: '120px' }}>Sum Insured / Prem</th>
                    <th style={{ padding: '12px 14px', minWidth: '140px' }}>Pipeline Stage</th>
                    <th style={{ padding: '12px 14px', width: '90px' }}>Priority</th>
                    <th style={{ padding: '12px 14px', minWidth: '130px' }}>Advisor</th>
                    <th style={{ padding: '12px 14px', textAlign: 'center', width: '160px' }}>Quick Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map((lead, index) => {
                    const isEditing = editingRowId === lead.id;
                    const stageBadge = getStageBadge(lead.stage);
                    const priorityBadge = getPriorityBadge(lead.priority);

                    return (
                      <tr 
                        key={lead.id} 
                        style={{ 
                          borderBottom: '1px solid var(--border-subtle)', 
                          background: index % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-main)',
                          transition: 'background var(--transition-fast)'
                        }}
                      >
                        {/* Client Code */}
                        <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                          {lead.clientCode}
                        </td>

                        {/* Client Name & Company (Inline Editable) */}
                        <td style={{ padding: '10px 14px' }}>
                          {isEditing ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <input
                                type="text"
                                value={editFormData.fullName || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                                style={{ padding: '4px 6px', borderRadius: '4px', border: '1px solid var(--accent-emerald)', fontSize: '0.82rem', width: '100%' }}
                              />
                              <input
                                type="text"
                                placeholder="Company"
                                value={editFormData.companyName || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, companyName: e.target.value })}
                                style={{ padding: '4px 6px', borderRadius: '4px', border: '1px solid var(--border-subtle)', fontSize: '0.75rem', width: '100%' }}
                              />
                            </div>
                          ) : (
                            <div>
                              <div 
                                onClick={() => onOpenClient360 && onOpenClient360(lead)}
                                style={{ fontWeight: 700, color: 'var(--primary-navy)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                              >
                                {lead.fullName} <ExternalLink size={12} color="var(--accent-gold)" />
                              </div>
                              {lead.companyName && (
                                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{lead.companyName}</div>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Contact */}
                        <td style={{ padding: '10px 14px' }}>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editFormData.phoneNumber || ''}
                              onChange={(e) => setEditFormData({ ...editFormData, phoneNumber: e.target.value })}
                              style={{ padding: '4px 6px', borderRadius: '4px', border: '1px solid var(--accent-emerald)', fontSize: '0.82rem', width: '100%' }}
                            />
                          ) : (
                            <div>
                              <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{lead.phoneNumber}</div>
                              {lead.city && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{lead.city}</div>}
                            </div>
                          )}
                        </td>

                        {/* Insurance Product */}
                        <td style={{ padding: '10px 14px' }}>
                          {isEditing ? (
                            <select
                              value={editFormData.insuranceType || ''}
                              onChange={(e) => setEditFormData({ ...editFormData, insuranceType: e.target.value })}
                              style={{ padding: '4px 6px', borderRadius: '4px', border: '1px solid var(--accent-emerald)', fontSize: '0.82rem', width: '100%' }}
                            >
                              <option value="Health Insurance">Health Insurance</option>
                              <option value="Term Life Insurance">Term Life Insurance</option>
                              <option value="Vehicle / Motor Insurance">Vehicle Insurance</option>
                              <option value="Group / SME Insurance">Group / SME</option>
                              <option value="Travel Insurance">Travel Insurance</option>
                              <option value="Loans & Financing">Loans</option>
                            </select>
                          ) : (
                            <div>
                              <div style={{ fontWeight: 700, color: 'var(--primary-navy)' }}>{lead.insuranceType}</div>
                              {lead.existingInsurer && (
                                <div style={{ fontSize: '0.72rem', color: 'var(--accent-gold)' }}>Prev: {lead.existingInsurer}</div>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Sum Insured / Premium */}
                        <td style={{ padding: '10px 14px' }}>
                          {isEditing ? (
                            <input
                              type="text"
                              placeholder="₹10 Lakhs"
                              value={editFormData.sumInsured || ''}
                              onChange={(e) => setEditFormData({ ...editFormData, sumInsured: e.target.value })}
                              style={{ padding: '4px 6px', borderRadius: '4px', border: '1px solid var(--accent-emerald)', fontSize: '0.82rem', width: '100%' }}
                            />
                          ) : (
                            <div>
                              <div style={{ fontWeight: 700, color: 'var(--primary-navy)' }}>{lead.sumInsured || '-'}</div>
                              {lead.estimatedPremium && (
                                <div style={{ fontSize: '0.74rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>
                                  ₹{Number(lead.estimatedPremium).toLocaleString()}
                                </div>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Stage (Inline Dropdown) */}
                        <td style={{ padding: '10px 14px' }}>
                          {isEditing ? (
                            <select
                              value={editFormData.stage || ''}
                              onChange={(e) => setEditFormData({ ...editFormData, stage: e.target.value })}
                              style={{ padding: '4px 6px', borderRadius: '4px', border: '1px solid var(--accent-emerald)', fontSize: '0.8rem', width: '100%' }}
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
                          ) : (
                            <span style={{
                              display: 'inline-block',
                              padding: '3px 8px',
                              borderRadius: '9999px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              background: stageBadge.bg,
                              color: stageBadge.color
                            }}>
                              {stageBadge.label}
                            </span>
                          )}
                        </td>

                        {/* Priority */}
                        <td style={{ padding: '10px 14px' }}>
                          {isEditing ? (
                            <select
                              value={editFormData.priority || 'MEDIUM'}
                              onChange={(e) => setEditFormData({ ...editFormData, priority: e.target.value })}
                              style={{ padding: '4px 6px', borderRadius: '4px', border: '1px solid var(--accent-emerald)', fontSize: '0.8rem' }}
                            >
                              <option value="HIGH">HIGH</option>
                              <option value="MEDIUM">MEDIUM</option>
                              <option value="LOW">LOW</option>
                            </select>
                          ) : (
                            <span style={{ fontWeight: 700, fontSize: '0.78rem', color: priorityBadge.color }}>
                              {priorityBadge.label}
                            </span>
                          )}
                        </td>

                        {/* Assigned Advisor */}
                        <td style={{ padding: '10px 14px', color: 'var(--text-muted)', fontWeight: 600 }}>
                          {lead.assignedAdvisorName || 'Unassigned'}
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                          {isEditing ? (
                            <div style={{ display: 'inline-flex', gap: '4px' }}>
                              <button
                                onClick={() => saveInlineEdit(lead.id)}
                                style={{ background: 'var(--accent-emerald)', color: '#fff', border: 'none', padding: '5px 8px', borderRadius: '6px', cursor: 'pointer' }}
                                title="Save Changes"
                              >
                                <Save size={13} />
                              </button>
                              <button
                                onClick={cancelInlineEdit}
                                style={{ background: 'var(--bg-main)', color: 'var(--text-muted)', border: 'none', padding: '5px 8px', borderRadius: '6px', cursor: 'pointer' }}
                                title="Cancel"
                              >
                                <X size={13} />
                              </button>
                            </div>
                          ) : (
                            <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                              {/* 1. Log Call */}
                              <button
                                onClick={() => onOpenCallModal && onOpenCallModal(lead)}
                                style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', padding: '5px 7px', borderRadius: '6px', cursor: 'pointer' }}
                                title="Log Call Disposition & Schedule Followup"
                              >
                                <Phone size={13} />
                              </button>

                              {/* 2. WhatsApp Direct */}
                              <button
                                onClick={() => openWhatsApp(lead.phoneNumber, lead.fullName, lead.insuranceType)}
                                style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #86efac', padding: '5px 7px', borderRadius: '6px', cursor: 'pointer' }}
                                title="Chat on WhatsApp"
                              >
                                <MessageSquare size={13} />
                              </button>

                              {/* 3. Schedule Google Meet */}
                              <button
                                onClick={() => onOpenMeetingModal && onOpenMeetingModal(lead)}
                                style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', padding: '5px 7px', borderRadius: '6px', cursor: 'pointer' }}
                                title="Schedule Google Meet"
                              >
                                <Calendar size={13} />
                              </button>

                              {/* 4. Inline Edit */}
                              <button
                                onClick={() => startInlineEdit(lead)}
                                style={{ background: 'var(--bg-main)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)', padding: '5px 7px', borderRadius: '6px', cursor: 'pointer' }}
                                title="Edit Row"
                              >
                                <Edit2 size={13} />
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

            {/* 2. MOBILE VIEW: TOUCH-FRIENDLY CLIENT CARDS */}
            <div className="crm-mobile-cards-container">
              {filteredLeads.map((lead) => {
                const stageBadge = getStageBadge(lead.stage);
                const priorityBadge = getPriorityBadge(lead.priority);

                return (
                  <div
                    key={lead.id}
                    className="crm-card"
                    style={{
                      padding: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.65rem'
                    }}
                  >
                    {/* Header: Name, Code & Priority */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div 
                          onClick={() => onOpenClient360 && onOpenClient360(lead)}
                          style={{ fontWeight: 800, fontSize: '0.98rem', color: 'var(--primary-navy)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                        >
                          {lead.fullName} <ExternalLink size={13} color="var(--accent-gold)" />
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--accent-emerald)' }}>{lead.clientCode}</span>
                          {lead.companyName && ` • ${lead.companyName}`}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <span style={{
                          padding: '2px 7px',
                          borderRadius: '999px',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          background: stageBadge.bg,
                          color: stageBadge.color
                        }}>
                          {stageBadge.label}
                        </span>
                        <span style={{
                          padding: '2px 6px',
                          borderRadius: '999px',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          background: 'var(--bg-main)',
                          color: priorityBadge.color
                        }}>
                          {priorityBadge.label}
                        </span>
                      </div>
                    </div>

                    {/* Middle Info: Product & Sum Insured */}
                    <div style={{ background: 'var(--bg-main)', padding: '0.6rem 0.75rem', borderRadius: '10px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.78rem' }}>
                      <div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600 }}>Product</div>
                        <div style={{ fontWeight: 700, color: 'var(--primary-navy)' }}>{lead.insuranceType}</div>
                      </div>
                      <div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600 }}>Coverage / Prem</div>
                        <div style={{ fontWeight: 700, color: 'var(--accent-emerald)' }}>
                          {lead.sumInsured || '₹10L'} {lead.estimatedPremium ? `(₹${Number(lead.estimatedPremium).toLocaleString()})` : ''}
                        </div>
                      </div>
                    </div>

                    {/* Footer 1-Tap Action Rail */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem', paddingTop: '0.25rem' }}>
                      <button
                        onClick={() => onOpenCallModal && onOpenCallModal(lead)}
                        style={{
                          background: '#ecfdf5',
                          color: '#059669',
                          border: '1px solid #a7f3d0',
                          padding: '0.45rem 0.3rem',
                          borderRadius: '8px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '2px'
                        }}
                      >
                        <Phone size={14} />
                        <span>Call</span>
                      </button>

                      <button
                        onClick={() => openWhatsApp(lead.phoneNumber, lead.fullName, lead.insuranceType)}
                        style={{
                          background: '#dcfce7',
                          color: '#15803d',
                          border: '1px solid #86efac',
                          padding: '0.45rem 0.3rem',
                          borderRadius: '8px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '2px'
                        }}
                      >
                        <MessageSquare size={14} />
                        <span>WhatsApp</span>
                      </button>

                      <button
                        onClick={() => onOpenMeetingModal && onOpenMeetingModal(lead)}
                        style={{
                          background: '#eff6ff',
                          color: '#2563eb',
                          border: '1px solid #bfdbfe',
                          padding: '0.45rem 0.3rem',
                          borderRadius: '8px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '2px'
                        }}
                      >
                        <Calendar size={14} />
                        <span>Meet</span>
                      </button>

                      <button
                        onClick={() => onOpenClient360 && onOpenClient360(lead)}
                        style={{
                          background: 'var(--bg-main)',
                          color: 'var(--primary-navy)',
                          border: '1px solid var(--border-subtle)',
                          padding: '0.45rem 0.3rem',
                          borderRadius: '8px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '2px'
                        }}
                      >
                        <Shield size={14} />
                        <span>360 View</span>
                      </button>
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
          backdropFilter: 'blur(4px)',
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
              background: 'linear-gradient(135deg, #0f2b48 0%, #091726 100%)',
              color: '#ffffff',
              padding: '1.25rem 1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>Add New Client Lead</h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>
                  Create a new record in the CRM data sheet
                </p>
              </div>
              <button
                onClick={() => setShowAddLeadModal(false)}
                style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer' }}
              >
                <X size={20} />
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

    </div>
  );
}
