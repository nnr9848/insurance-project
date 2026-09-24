import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  Search, 
  Filter, 
  Plus, 
  Send, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Shield, 
  Sparkles, 
  RefreshCw, 
  Building2, 
  User, 
  Phone, 
  Mail, 
  ArrowRight,
  ExternalLink,
  SlidersHorizontal,
  ChevronDown,
  FileText,
  Layers,
  Award,
  Check,
  X,
  Eye,
  Edit3,
  Printer,
  Copy
} from 'lucide-react';
import { crmService } from '../../services/api';
import WhatsAppIcon from '../common/WhatsAppIcon';

const INSURERS = [
  'Star Health and Allied Insurance',
  'Care Health Insurance',
  'HDFC ERGO General Insurance',
  'ICICI Lombard General Insurance',
  'Bajaj Allianz General Insurance',
  'Niva Bupa Health Insurance',
  'Tata AIG General Insurance',
  'Reliance General Insurance',
  'Aditya Birla Health Insurance',
  'National Insurance Company'
];

export default function QuotationManagementView({ onOpenClient360 }) {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [insurerFilter, setInsurerFilter] = useState('ALL');
  const [selectedQuoteForCompare, setSelectedQuoteForCompare] = useState([]);

  // View & Edit Modal States
  const [viewingQuote, setViewingQuote] = useState(null);
  const [editingQuote, setEditingQuote] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Create Quote Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [clients, setClients] = useState([]);
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    clientId: '',
    insuranceType: 'HEALTH_INSURANCE',
    insurerName: INSURERS[0],
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
    notes: '',
    status: 'DRAFT'
  });
  const [submitting, setSubmitting] = useState(false);

  const selectedClientObj = clients.find(c => String(c.id) === String(formData.clientId));
  const searchedClients = clients.filter(c => {
    if (!clientSearchTerm.trim()) return false;
    const term = clientSearchTerm.toLowerCase();
    const cleanDigits = term.replace(/[^0-9]/g, '');
    const clientPhoneDigits = (c.phoneNumber || '').replace(/[^0-9]/g, '');

    return (
      (c.fullName && c.fullName.toLowerCase().includes(term)) ||
      (c.phoneNumber && c.phoneNumber.includes(term)) ||
      (cleanDigits && clientPhoneDigits.includes(cleanDigits)) ||
      (c.email && c.email.toLowerCase().includes(term)) ||
      (c.clientCode && c.clientCode.toLowerCase().includes(term)) ||
      (c.id && String(c.id).includes(term)) ||
      (c.companyName && c.companyName.toLowerCase().includes(term))
    );
  });

  useEffect(() => {
    fetchQuotations();
    fetchClients();
  }, []);

  const fetchQuotations = async () => {
    setLoading(true);
    try {
      const data = await crmService.getQuotations();
      setQuotations(data || []);
    } catch (err) {
      console.error('Failed to fetch quotations:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const res = await crmService.getClients();
      setClients(res || []);
    } catch (err) {
      console.error('Failed to fetch client list:', err);
    }
  };

  const handleCreateQuote = async (e) => {
    e.preventDefault();
    if (!formData.clientId || !formData.planName || !formData.basePremium) {
      alert('Please fill all mandatory fields: Client, Plan Name, and Base Premium.');
      return;
    }

    setSubmitting(true);
    try {
      await crmService.createQuotation({
        ...formData,
        clientId: Number(formData.clientId),
        basePremium: Number(formData.basePremium),
        ncbDiscountPercent: Number(formData.ncbDiscountPercent || 0)
      });
      setShowCreateModal(false);
      setFormData({
        clientId: '',
        insuranceType: 'HEALTH_INSURANCE',
        insurerName: INSURERS[0],
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
        notes: '',
        status: 'DRAFT'
      });
      fetchQuotations();
    } catch (err) {
      alert('Failed to create quotation: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendQuote = async (quote) => {
    try {
      const res = await crmService.sendQuoteDispatch(quote.id, {
        channel: 'WHATSAPP',
        recipientPhone: quote.clientPhone
      });
      if (res.whatsAppUrl) {
        window.open(res.whatsAppUrl, '_blank');
      }
      fetchQuotations();
    } catch (err) {
      alert('Failed to dispatch quote: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleStatusChange = async (quoteId, newStatus) => {
    try {
      await crmService.updateQuoteStatus(quoteId, newStatus);
      fetchQuotations();
    } catch (err) {
      alert('Failed to update status: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleOpenEdit = (quote) => {
    setEditingQuote(quote);
    setEditFormData({
      insuranceType: quote.insuranceType || 'HEALTH_INSURANCE',
      insurerName: quote.insurerName || INSURERS[0],
      planName: quote.planName || '',
      planVariant: quote.planVariant || 'Comprehensive',
      sumInsured: quote.sumInsured || '₹10,00,000',
      policyTenureYears: quote.policyTenureYears || 1,
      basePremium: quote.basePremium || '',
      ncbDiscountPercent: quote.ncbDiscountPercent || 0,
      roomRentLimit: quote.roomRentLimit || 'No Cap / Single Private Room',
      copayPercentage: quote.copayPercentage || '0%',
      restorationBenefit: quote.restorationBenefit || '100% Unlimited Recharge',
      prePostHospitalization: quote.prePostHospitalization || '60 Days Pre / 180 Days Post',
      maternityCovered: !!quote.maternityCovered,
      opdCovered: !!quote.opdCovered,
      notes: quote.notes || '',
      status: quote.status || 'DRAFT'
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editFormData.planName || !editFormData.basePremium) {
      alert('Plan Name and Base Premium are required.');
      return;
    }

    setEditSubmitting(true);
    try {
      await crmService.updateQuotation(editingQuote.id, {
        ...editFormData,
        clientId: editingQuote.clientId,
        basePremium: Number(editFormData.basePremium),
        ncbDiscountPercent: Number(editFormData.ncbDiscountPercent || 0)
      });
      setEditingQuote(null);
      fetchQuotations();
    } catch (err) {
      alert('Failed to update quotation: ' + (err.response?.data?.message || err.message));
    } finally {
      setEditSubmitting(false);
    }
  };

  const toggleCompare = (quote) => {
    if (selectedQuoteForCompare.some(q => q.id === quote.id)) {
      setSelectedQuoteForCompare(selectedQuoteForCompare.filter(q => q.id !== quote.id));
    } else {
      if (selectedQuoteForCompare.length >= 3) {
        alert('You can compare a maximum of 3 quotations side-by-side.');
        return;
      }
      setSelectedQuoteForCompare([...selectedQuoteForCompare, quote]);
    }
  };

  // Filtered quotes
  const filteredQuotes = quotations.filter(q => {
    const matchesSearch = 
      (q.quoteNumber?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (q.clientName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (q.insurerName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (q.planName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (q.sumInsured?.toLowerCase() || '').includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || q.status === statusFilter;
    const matchesInsurer = insurerFilter === 'ALL' || q.insurerName === insurerFilter;

    return matchesSearch && matchesStatus && matchesInsurer;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACCEPTED':
        return { label: 'Client Accepted', bg: '#dcfce7', text: '#15803d', icon: <CheckCircle2 size={13} /> };
      case 'SENT':
        return { label: 'Dispatched / Sent', bg: '#e0f2fe', text: '#0369a1', icon: <Send size={13} /> };
      case 'DRAFT':
        return { label: 'Draft Prepared', bg: '#f1f5f9', text: '#475569', icon: <FileText size={13} /> };
      case 'REJECTED':
        return { label: 'Client Rejected', bg: '#fee2e2', text: '#b91c1c', icon: <XCircle size={13} /> };
      case 'EXPIRED':
        return { label: 'Expired', bg: '#fef3c7', text: '#b45309', icon: <Clock size={13} /> };
      default:
        return { label: status, bg: '#f1f5f9', text: '#475569', icon: <FileText size={13} /> };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #091726 0%, #0f2b48 100%)',
        borderRadius: '16px',
        padding: '1.5rem',
        color: '#ffffff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        boxShadow: '0 4px 14px rgba(0,0,0,0.1)'
      }}>
        <div style={{ maxWidth: '650px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', padding: '4px 10px', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 800, marginBottom: '8px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            <FileSpreadsheet size={14} /> MULTI-INSURER QUOTATION ENGINE
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.02em', color: '#ffffff' }}>
            Quotation Management & Comparative Matrix
          </h2>
          <p style={{ fontSize: '0.84rem', color: '#cbd5e1', margin: 0, lineHeight: 1.5 }}>
            Prepare, compare, and dispatch multi-insurer quotation sheets directly to clients via WhatsApp and Email with automated GST calculation and benefit breakdown.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#f59e0b',
              color: '#091726',
              border: 'none',
              padding: '9px 16px',
              borderRadius: '8px',
              fontSize: '0.84rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(245, 158, 11, 0.35)'
            }}
          >
            <Plus size={16} /> New Quotation
          </button>
          
          <button
            onClick={fetchQuotations}
            disabled={loading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255,255,255,0.12)',
              color: '#ffffff',
              border: '1px solid rgba(255,255,255,0.2)',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '12px'
      }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
            <FileText size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Total Quotations</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f2b48' }}>{quotations.length}</div>
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}>
            <Send size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Dispatched to Clients</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f2b48' }}>
              {quotations.filter(q => q.status === 'SENT').length}
            </div>
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Accepted & Converted</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f2b48' }}>
              {quotations.filter(q => q.status === 'ACCEPTED').length}
            </div>
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
            <Sparkles size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Draft In Progress</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f2b48' }}>
              {quotations.filter(q => q.status === 'DRAFT').length}
            </div>
          </div>
        </div>
      </div>

      {/* Comparative Matrix Section (if 2 or more selected) */}
      {selectedQuoteForCompare.length >= 2 && (
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '2px solid #3b82f6',
          padding: '1.25rem',
          boxShadow: '0 4px 20px rgba(59, 130, 246, 0.12)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} color="#3b82f6" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f2b48', margin: 0 }}>
                Side-by-Side Insurer Comparison Matrix ({selectedQuoteForCompare.length} Options)
              </h3>
            </div>
            <button
              onClick={() => setSelectedQuoteForCompare([])}
              style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}
            >
              Clear Comparison
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#475569', width: '220px' }}>Policy Features</th>
                  {selectedQuoteForCompare.map(q => (
                    <th key={q.id} style={{ padding: '12px', textAlign: 'left', color: '#0f2b48', borderLeft: '1px solid #e2e8f0' }}>
                      <div style={{ fontWeight: 800, fontSize: '0.92rem' }}>{q.insurerName}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{q.planName} ({q.planVariant || 'Standard'})</div>
                      <div style={{ fontSize: '0.72rem', color: '#3b82f6', marginTop: '2px' }}>{q.quoteNumber}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 700, color: '#475569' }}>Sum Insured</td>
                  {selectedQuoteForCompare.map(q => (
                    <td key={q.id} style={{ padding: '10px 12px', fontWeight: 800, color: '#0f2b48', borderLeft: '1px solid #e2e8f0' }}>
                      {q.sumInsured}
                    </td>
                  ))}
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#fcfdfd' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 700, color: '#475569' }}>Annual Premium (incl. GST)</td>
                  {selectedQuoteForCompare.map(q => (
                    <td key={q.id} style={{ padding: '10px 12px', borderLeft: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#16a34a' }}>₹{q.totalPremium}</span>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', marginLeft: '4px' }}>(Base ₹{q.basePremium} + GST ₹{q.taxGst})</span>
                    </td>
                  ))}
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 700, color: '#475569' }}>Room Rent Limit</td>
                  {selectedQuoteForCompare.map(q => (
                    <td key={q.id} style={{ padding: '10px 12px', color: '#0f2b48', borderLeft: '1px solid #e2e8f0' }}>
                      {q.roomRentLimit || 'No Cap'}
                    </td>
                  ))}
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#fcfdfd' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 700, color: '#475569' }}>Restoration Benefit</td>
                  {selectedQuoteForCompare.map(q => (
                    <td key={q.id} style={{ padding: '10px 12px', color: '#0f2b48', borderLeft: '1px solid #e2e8f0' }}>
                      {q.restorationBenefit || 'Unlimited'}
                    </td>
                  ))}
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 700, color: '#475569' }}>Co-Payment</td>
                  {selectedQuoteForCompare.map(q => (
                    <td key={q.id} style={{ padding: '10px 12px', color: '#0f2b48', borderLeft: '1px solid #e2e8f0' }}>
                      {q.copayPercentage || '0%'}
                    </td>
                  ))}
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#fcfdfd' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 700, color: '#475569' }}>Maternity / OPD</td>
                  {selectedQuoteForCompare.map(q => (
                    <td key={q.id} style={{ padding: '10px 12px', borderLeft: '1px solid #e2e8f0' }}>
                      {q.maternityCovered ? <span style={{ color: '#16a34a', fontWeight: 700 }}>✓ Maternity</span> : <span style={{ color: '#94a3b8' }}>✗ Maternity</span>}
                      {' • '}
                      {q.opdCovered ? <span style={{ color: '#16a34a', fontWeight: 700 }}>✓ OPD</span> : <span style={{ color: '#94a3b8' }}>✗ OPD</span>}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td style={{ padding: '12px', fontWeight: 700, color: '#475569' }}>Quick Dispatch</td>
                  {selectedQuoteForCompare.map(q => (
                    <td key={q.id} style={{ padding: '12px', borderLeft: '1px solid #e2e8f0' }}>
                      <button
                        onClick={() => handleSendQuote(q)}
                        className="crm-btn-whatsapp-solid"
                      >
                        <WhatsAppIcon size={14} color="#ffffff" />
                        <span>Send Option via WhatsApp</span>
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Control & Search Bar */}
      <div style={{
        background: '#ffffff',
        borderRadius: '14px',
        padding: '1rem 1.25rem',
        border: '1px solid #e2e8f0',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 280px' }}>
          <form 
            role="search"
            onSubmit={(e) => e.preventDefault()}
            style={{ position: 'relative', width: '100%', margin: 0 }}
          >
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="search"
              name="quotations-search-filter"
              id="quotations-search-filter"
              autoComplete="search"
              data-lpignore="true"
              data-form-type="other"
              placeholder="Search by quote #, client, insurer, plan, or sum insured..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 34px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.84rem',
                outline: 'none'
              }}
            />
          </form>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '7px 10px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.82rem',
              color: '#334155',
              fontWeight: 600,
              outline: 'none',
              background: '#f8fafc'
            }}
          >
            <option value="ALL">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="SENT">Sent</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="REJECTED">Rejected</option>
          </select>

          {/* Insurer Filter */}
          <select
            value={insurerFilter}
            onChange={(e) => setInsurerFilter(e.target.value)}
            style={{
              padding: '7px 10px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.82rem',
              color: '#334155',
              fontWeight: 600,
              outline: 'none',
              background: '#f8fafc'
            }}
          >
            <option value="ALL">All Insurers</option>
            {INSURERS.map(ins => (
              <option key={ins} value={ins}>{ins}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Quotations Display Container (Responsive Desktop Table vs Mobile Native Card Deck) */}
      {loading ? (
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '3rem', textAlign: 'center', color: '#64748b' }}>
          <div style={{ width: '32px', height: '32px', border: '3px solid #cbd5e1', borderTopColor: '#f59e0b', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px auto' }} />
          <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Loading insurance quotations...</div>
        </div>
      ) : filteredQuotes.length === 0 ? (
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
          <FileSpreadsheet size={40} color="#cbd5e1" style={{ margin: '0 auto 10px auto' }} />
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#475569' }}>No quotations found</div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>Click "New Quotation" above to prepare a multi-insurer proposal.</div>
        </div>
      ) : (
        <>
          {/* 1. DESKTOP TABLE VIEW (≥ 768px) - Exact Unchanged UX */}
          <div className="crm-desktop-table-container" style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
          }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <tr>
                    <th style={{ padding: '12px 14px', width: '40px' }}>Compare</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>Quote # / Date</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>Client</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>Insurer & Plan</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>Sum Insured</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>Total Premium</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>Status</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQuotes.map((q) => {
                    const badge = getStatusBadge(q.status);
                    const isCompared = selectedQuoteForCompare.some(item => item.id === q.id);

                    return (
                      <tr key={q.id} style={{ borderBottom: '1px solid #f1f5f9', background: isCompared ? '#eff6ff' : '#ffffff', transition: 'background 0.15s ease' }}>
                        
                        {/* Checkbox for compare */}
                        <td style={{ padding: '12px 14px' }}>
                          <input
                            type="checkbox"
                            checked={isCompared}
                            onChange={() => toggleCompare(q)}
                            style={{ cursor: 'pointer' }}
                          />
                        </td>

                        {/* Quote Number & Date */}
                        <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                          <div style={{ fontWeight: 800, color: '#0f2b48', fontSize: '0.82rem' }}>{q.quoteNumber}</div>
                          <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
                            {q.createdAt ? new Date(q.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                          </div>
                          {q.inquiryId && (
                            <div style={{ marginTop: '4px' }}>
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                                fontSize: '0.66rem',
                                fontWeight: 800,
                                color: '#15803d',
                                background: '#ecfdf5',
                                border: '1px solid #bbf7d0',
                                padding: '1px 5px',
                                borderRadius: '4px'
                              }}>
                                <Tag size={9} /> Web Lead #{q.inquiryId}
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Client */}
                        <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ fontWeight: 700, color: '#0f2b48' }}>{q.clientName}</div>
                            {onOpenClient360 && (
                              <button
                                onClick={() => {
                                  const matchedClient = clients.find(c => String(c.id) === String(q.clientId));
                                  onOpenClient360(matchedClient || { id: q.clientId, fullName: q.clientName, phoneNumber: q.clientPhone });
                                }}
                                style={{ background: 'none', border: 'none', color: '#0284c7', cursor: 'pointer', padding: 0 }}
                                title="Open Client 360"
                              >
                                <ExternalLink size={12} />
                              </button>
                            )}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{q.clientPhone}</div>
                        </td>

                        {/* Insurer & Plan */}
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontWeight: 700, color: '#0f2b48' }}>{q.insurerName}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{q.planName} • {q.planVariant || 'Standard'}</div>
                        </td>

                        {/* Sum Insured */}
                        <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                          <span style={{ fontWeight: 800, color: '#0f2b48', background: '#f8fafc', padding: '3px 8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                            {q.sumInsured}
                          </span>
                        </td>

                        {/* Total Premium */}
                        <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                          <div style={{ fontWeight: 800, color: '#16a34a', fontSize: '0.92rem' }}>₹{q.totalPremium}</div>
                          <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Base ₹{q.basePremium} + GST ₹{q.taxGst}</div>
                        </td>

                        {/* Status */}
                        <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: badge.bg,
                            color: badge.text,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '0.72rem',
                            fontWeight: 700
                          }}>
                            {badge.icon} {badge.label}
                          </span>
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '12px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <button
                              onClick={() => setViewingQuote(q)}
                              title="View Quotation Summary Sheet"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                background: '#f0fdf4',
                                color: '#15803d',
                                border: '1px solid #bbf7d0',
                                padding: '5px 8px',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              <Eye size={13} color="#15803d" /> View
                            </button>

                            <button
                              onClick={() => handleOpenEdit(q)}
                              title="Edit / Revise Quotation"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                background: '#f8fafc',
                                color: '#0284c7',
                                border: '1px solid #cbd5e1',
                                padding: '5px 8px',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              <Edit3 size={13} color="#0284c7" /> Edit
                            </button>

                            <button
                              onClick={() => handleSendQuote(q)}
                              title="Dispatch via WhatsApp"
                              className="crm-btn-whatsapp-outline"
                            >
                              <WhatsAppIcon size={13} color="currentColor" />
                              <span>Dispatch</span>
                            </button>

                            {q.status !== 'ACCEPTED' && (
                              <button
                                onClick={() => handleStatusChange(q.id, 'ACCEPTED')}
                                title="Mark Accepted"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  background: '#f8fafc',
                                  color: '#0f2b48',
                                  border: '1px solid #e2e8f0',
                                  padding: '5px 8px',
                                  borderRadius: '6px',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  cursor: 'pointer'
                                }}
                              >
                                <Check size={12} color="#16a34a" /> Accept
                              </button>
                            )}
                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 2. MOBILE NATIVE CARD DECK VIEW (< 768px) - Matches Clients Page Standard */}
          <div className="crm-mobile-cards-container">
            {filteredQuotes.map((q) => {
              const badge = getStatusBadge(q.status);
              const isCompared = selectedQuoteForCompare.some(item => item.id === q.id);
              const matchedClient = clients.find(c => String(c.id) === String(q.clientId));

              return (
                <div
                  key={q.id}
                  className="crm-card"
                  style={{
                    padding: '0.75rem 0.85rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.45rem',
                    borderRadius: '12px',
                    border: isCompared ? '1.5px solid #3b82f6' : '1px solid #e2e8f0',
                    background: isCompared ? '#f8faff' : '#ffffff',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.03)'
                  }}
                >
                  {/* Top Row: Identity + Status Badges + Quick Actions */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.4rem' }}>
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      {/* Row 1.1: Client Name + Compare Checkbox + Status */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'nowrap', minWidth: 0 }}>
                        <input
                          type="checkbox"
                          checked={isCompared}
                          onChange={() => toggleCompare(q)}
                          style={{ cursor: 'pointer', flexShrink: 0 }}
                          title="Select to compare"
                        />

                        <span 
                          onClick={() => {
                            if (onOpenClient360) {
                              onOpenClient360(matchedClient || { id: q.clientId, fullName: q.clientName, phoneNumber: q.clientPhone });
                            }
                          }}
                          style={{
                            fontWeight: 800,
                            fontSize: '0.9rem',
                            color: '#0f2b48',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '2px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            flexShrink: 1,
                            minWidth: '50px'
                          }}
                          title={q.clientName}
                        >
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {q.clientName}
                          </span>
                          <ExternalLink size={10} color="var(--accent-gold)" style={{ flexShrink: 0 }} />
                        </span>

                        {/* Status Badge */}
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                          background: badge.bg,
                          color: badge.text,
                          padding: '1px 5px',
                          borderRadius: '999px',
                          fontSize: '0.62rem',
                          fontWeight: 700,
                          whiteSpace: 'nowrap',
                          flexShrink: 0
                        }}>
                          {badge.icon} {badge.label}
                        </span>
                      </div>

                      {/* Row 1.2: Quote # • Date • Insurer • Plan */}
                      <div style={{
                        fontSize: '0.7rem',
                        color: '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--accent-emerald)', flexShrink: 0 }}>
                          {q.quoteNumber}
                        </span>
                        <span style={{ flexShrink: 0 }}>•</span>
                        <strong style={{ color: '#0f2b48', flexShrink: 0 }}>{q.insurerName}</strong>
                        <span style={{ flexShrink: 0 }}>•</span>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {q.planName}
                        </span>
                      </div>
                    </div>

                    {/* 1-Tap Action Strip: View + WhatsApp + Edit */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                      {/* View */}
                      <button
                        onClick={() => setViewingQuote(q)}
                        title="View Quotation"
                        style={{
                          width: '30px',
                          height: '30px',
                          borderRadius: '8px',
                          background: '#f0fdf4',
                          color: '#15803d',
                          border: '1px solid #bbf7d0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer'
                        }}
                      >
                        <Eye size={13} />
                      </button>

                      {/* WhatsApp Dispatch */}
                      <button
                        onClick={() => handleSendQuote(q)}
                        title="Dispatch via WhatsApp"
                        style={{
                          width: '30px',
                          height: '30px',
                          borderRadius: '8px',
                          background: '#ecfdf5',
                          color: '#16a34a',
                          border: '1px solid #a7f3d0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer'
                        }}
                      >
                        <WhatsAppIcon size={14} color="#16a34a" />
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => handleOpenEdit(q)}
                        title="Edit Quotation"
                        style={{
                          width: '30px',
                          height: '30px',
                          borderRadius: '8px',
                          background: '#f8fafc',
                          color: '#0f2b48',
                          border: '1px solid #cbd5e1',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer'
                        }}
                      >
                        <Edit3 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Bottom Consolidated Row: Sum Insured • Total Premium (incl. GST) • Quick Accept */}
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
                    {/* Left: Sum Insured & Premium */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <span style={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        color: '#0f2b48',
                        padding: '1px 6px',
                        borderRadius: '4px',
                        fontWeight: 800,
                        fontSize: '0.68rem'
                      }}>
                        Cover: {q.sumInsured}
                      </span>

                      <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: '2px' }}>
                        <span style={{ color: '#64748b', fontSize: '0.66rem' }}>Premium:</span>
                        <strong style={{ color: '#16a34a', fontSize: '0.82rem', fontWeight: 800 }}>
                          ₹{q.totalPremium}
                        </strong>
                        <span style={{ color: '#94a3b8', fontSize: '0.62rem' }}>(incl. GST)</span>
                      </div>
                    </div>

                    {/* Right: Accept Button or Accepted state */}
                    {q.status !== 'ACCEPTED' ? (
                      <button
                        onClick={() => handleStatusChange(q.id, 'ACCEPTED')}
                        style={{
                          background: '#ecfdf5',
                          color: '#059669',
                          border: '1px solid #a7f3d0',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '5px',
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}
                        title="Mark Quotation as Accepted"
                      >
                        <Check size={10} color="#059669" />
                        <span>Accept</span>
                      </button>
                    ) : (
                      <span style={{ color: '#059669', fontWeight: 800, fontSize: '0.68rem', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                        <Check size={11} /> Accepted
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* CREATE QUOTATION MODAL */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'none',
          zIndex: 13000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '650px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '1.5rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f2b48', margin: 0 }}>Create Insurance Quotation</h3>
                <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '2px 0 0 0' }}>Multi-insurer proposal with automated 18% GST calculation</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateQuote} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {/* Select Client with Smart Search Autocomplete */}
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Target Client *
                </label>
                {selectedClientObj ? (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: '8px',
                    padding: '8px 12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.75rem' }}>
                        {selectedClientObj.fullName?.charAt(0) || 'C'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, color: '#0f2b48', fontSize: '0.86rem' }}>
                          {selectedClientObj.fullName} <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>({selectedClientObj.clientCode || `CL-${selectedClientObj.id}`})</span>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 600 }}>
                          {selectedClientObj.phoneNumber} • {selectedClientObj.insuranceType || 'Health Insurance'}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, clientId: '' });
                        setClientSearchTerm('');
                      }}
                      style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '3px 8px', fontSize: '0.72rem', color: '#64748b', cursor: 'pointer', fontWeight: 600 }}
                    >
                      Change Client
                    </button>
                  </div>
                ) : (
                  <div style={{ position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                      <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '10px' }} />
                      <input
                        type="text"
                        placeholder="Search by client name, mobile (+91), or CL code..."
                        value={clientSearchTerm}
                        onChange={(e) => setClientSearchTerm(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 12px 8px 32px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.84rem'
                        }}
                      />
                    </div>

                    {/* Filtered Dropdown Popover */}
                    {clientSearchTerm.trim() && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        zIndex: 10,
                        background: '#ffffff',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                        maxHeight: '180px',
                        overflowY: 'auto',
                        marginTop: '4px'
                      }}>
                        {searchedClients.length === 0 ? (
                          <div style={{ padding: '10px 12px', fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center' }}>
                            No matching clients found for "{clientSearchTerm}"
                          </div>
                        ) : (
                          searchedClients.map(c => (
                            <div
                              key={c.id}
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  clientId: String(c.id),
                                  sumInsured: c.sumInsured || formData.sumInsured
                                });
                                setClientSearchTerm('');
                              }}
                              style={{
                                padding: '8px 12px',
                                borderBottom: '1px solid #f1f5f9',
                                cursor: 'pointer',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                transition: 'background 0.1s'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                              onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
                            >
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <strong style={{ color: '#0f2b48', fontSize: '0.84rem' }}>{c.fullName}</strong>
                                  <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>
                                    ({c.clientCode || `CL-${c.id}`})
                                  </span>
                                </div>
                                {c.email && (
                                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '1px' }}>
                                    {c.email}
                                  </div>
                                )}
                              </div>
                              <span style={{ fontSize: '0.72rem', background: '#eff6ff', color: '#2563eb', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                                {c.phoneNumber}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Insurer & Plan */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Insurance Provider *
                  </label>
                  <select
                    value={formData.insurerName}
                    onChange={(e) => setFormData({ ...formData, insurerName: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  >
                    {INSURERS.map(ins => (
                      <option key={ins} value={ins}>{ins}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Plan Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Optima Secure / Care Supreme"
                    value={formData.planName}
                    onChange={(e) => setFormData({ ...formData, planName: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              {/* Sum Insured & Base Premium */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Sum Insured (Coverage) *
                  </label>
                  <select
                    value={formData.sumInsured}
                    onChange={(e) => setFormData({ ...formData, sumInsured: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
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
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Base Annual Premium (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="100"
                    placeholder="e.g. 14500"
                    value={formData.basePremium}
                    onChange={(e) => setFormData({ ...formData, basePremium: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              {/* Benefit breakdown */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Room Rent Limit
                  </label>
                  <input
                    type="text"
                    value={formData.roomRentLimit}
                    onChange={(e) => setFormData({ ...formData, roomRentLimit: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Restoration Benefit
                  </label>
                  <input
                    type="text"
                    value={formData.restorationBenefit}
                    onChange={(e) => setFormData({ ...formData, restorationBenefit: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              {/* Checkboxes */}
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.maternityCovered}
                    onChange={(e) => setFormData({ ...formData, maternityCovered: e.target.checked })}
                  />
                  Maternity Coverage Included
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.opdCovered}
                    onChange={(e) => setFormData({ ...formData, opdCovered: e.target.checked })}
                  />
                  OPD & Diagnostics Included
                </label>
              </div>

              {/* Notes */}
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Advisor Recommendation Notes
                </label>
                <textarea
                  rows="2"
                  placeholder="e.g. Best suited for high NCB bonus accumulation and comprehensive maternity care..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>

              {/* Modal Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#f59e0b', color: '#091726', fontWeight: 800, cursor: 'pointer' }}
                >
                  {submitting ? 'Generating...' : 'Save & Calculate Quote'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* VIEW QUOTATION DETAILS MODAL */}
      {viewingQuote && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'none',
          zIndex: 13000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            maxWidth: '680px',
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
                    {viewingQuote.quoteNumber}
                  </span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>
                    Version v{viewingQuote.versionNumber || 1}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '4px 0 0 0', color: 'var(--primary-navy, #0f2b48)' }}>
                  {viewingQuote.insurerName}
                </h3>
                <div style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '2px' }}>
                  {viewingQuote.planName} • {viewingQuote.planVariant || 'Comprehensive'}
                </div>
              </div>
              <button
                onClick={() => setViewingQuote(null)}
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
                  <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Client Details</div>
                  <div style={{ fontWeight: 800, color: '#0f2b48', fontSize: '0.92rem', marginTop: '2px' }}>{viewingQuote.clientName}</div>
                  <div style={{ fontSize: '0.78rem', color: '#475569' }}>{viewingQuote.clientPhone} • {viewingQuote.clientEmail || 'No Email'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Created By Advisor</div>
                  <div style={{ fontWeight: 800, color: '#0f2b48', fontSize: '0.92rem', marginTop: '2px' }}>{viewingQuote.createdByAdvisorName || 'Specialist Advisor'}</div>
                  <div style={{ fontSize: '0.78rem', color: '#475569' }}>Status: <strong style={{ color: viewingQuote.status === 'ACCEPTED' ? '#16a34a' : '#0284c7' }}>{viewingQuote.status}</strong></div>
                </div>
              </div>

              {/* Financial Pricing Card */}
              <div style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)', border: '1.5px solid #a7f3d0', borderRadius: '12px', padding: '14px 16px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Premium & Financial Calculation
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Sum Insured</div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f2b48', marginTop: '2px' }}>{viewingQuote.sumInsured}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Base Premium</div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#334155', marginTop: '2px' }}>₹{viewingQuote.basePremium}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>18% GST</div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#334155', marginTop: '2px' }}>₹{viewingQuote.taxGst}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 800 }}>Total Annual</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#16a34a', marginTop: '2px' }}>₹{viewingQuote.totalPremium}</div>
                  </div>
                </div>
              </div>

              {/* Policy Features & Benefits Matrix */}
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#334155', marginBottom: '8px' }}>
                  Coverage Benefits & Terms
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.82rem' }}>
                  <div style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                    <span style={{ color: '#64748b' }}>Room Rent Limit:</span> <strong style={{ color: '#0f2b48' }}>{viewingQuote.roomRentLimit || 'No Cap'}</strong>
                  </div>
                  <div style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                    <span style={{ color: '#64748b' }}>Restoration Benefit:</span> <strong style={{ color: '#0f2b48' }}>{viewingQuote.restorationBenefit || '100% Unlimited'}</strong>
                  </div>
                  <div style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                    <span style={{ color: '#64748b' }}>Co-Payment:</span> <strong style={{ color: '#0f2b48' }}>{viewingQuote.copayPercentage || '0%'}</strong>
                  </div>
                  <div style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                    <span style={{ color: '#64748b' }}>Pre/Post Hospitalization:</span> <strong style={{ color: '#0f2b48' }}>{viewingQuote.prePostHospitalization || '60/180 Days'}</strong>
                  </div>
                  <div style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                    <span style={{ color: '#64748b' }}>Maternity Coverage:</span> <strong style={{ color: viewingQuote.maternityCovered ? '#16a34a' : '#94a3b8' }}>{viewingQuote.maternityCovered ? '✓ Covered' : '✗ Not Included'}</strong>
                  </div>
                  <div style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                    <span style={{ color: '#64748b' }}>OPD / Diagnostics:</span> <strong style={{ color: viewingQuote.opdCovered ? '#16a34a' : '#94a3b8' }}>{viewingQuote.opdCovered ? '✓ Covered' : '✗ Not Included'}</strong>
                  </div>
                </div>
              </div>

              {/* Dedicated Linked Web Inquiry Heritage Card */}
              {viewingQuote.inquiryId && (
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
                        LINKED WEB INQUIRY #{viewingQuote.inquiryId}
                      </span>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#047857', textTransform: 'uppercase' }}>
                        {viewingQuote.inquiryCategorySlug?.replace(/-/g, ' ') || viewingQuote.insuranceType?.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#15803d', marginTop: '3px' }}>
                      Origin: Customer submitted quote form on web portal • Triage Status: <strong>{viewingQuote.inquiryStatus || 'QUALIFIED'}</strong>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const inq = await leadInquiryService.getInquiryById(viewingQuote.inquiryId);
                        if (inq) {
                          const logs = await crmService.getInquiryAuditLogs(inq.id);
                          alert(`Inquiry #${inq.id} Heritage & Audit Trail:\n\n• Applicant: ${inq.fullName}\n• Phone: ${inq.phoneNumber}\n• Category: ${inq.categorySlug}\n• Status: ${inq.status}\n\nActivity Logs (${logs ? logs.length : 0}):\n${logs && logs.length > 0 ? logs.map(l => `[${new Date(l.timestamp).toLocaleDateString('en-IN')}] ${l.action}: ${l.oldValue || 'None'} -> ${l.newValue || ''} (by ${l.performedByName || 'System'})`).join('\n') : 'No audit entries logged'}`);
                        }
                      } catch (err) {
                        alert(`Could not load Inquiry #${viewingQuote.inquiryId}: ${err.message}`);
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
                    <Eye size={12} color="#ffffff" /> View Inquiry & Logs
                  </button>
                </div>
              )}

              {/* Notes */}
              {viewingQuote.notes && (
                <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', padding: '10px 14px', borderRadius: '10px', fontSize: '0.82rem', color: '#92400e' }}>
                  <strong>Advisor Notes:</strong> {viewingQuote.notes}
                </div>
              )}

              {/* Footer Actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #e2e8f0' }}>
                <button
                  type="button"
                  onClick={() => {
                    const quote = viewingQuote;
                    setViewingQuote(null);
                    handleOpenEdit(quote);
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
                  <Edit3 size={14} /> Edit / Revise Quote
                </button>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => handleSendQuote(viewingQuote)}
                    className="crm-btn-whatsapp-solid"
                  >
                    <WhatsAppIcon size={14} color="#ffffff" />
                    <span>Dispatch WhatsApp</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewingQuote(null)}
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

      {/* EDIT / REVISE QUOTATION MODAL */}
      {editingQuote && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'none',
          zIndex: 13000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            maxWidth: '620px',
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
                  <span style={{ fontSize: '0.72rem', color: '#d97706', background: '#fef3c7', border: '1px solid #fde68a', padding: '2px 8px', borderRadius: '4px', fontWeight: 800 }}>
                    REVISE QUOTE • {editingQuote.quoteNumber} (v{editingQuote.versionNumber || 1})
                  </span>
                </div>
                <h3 style={{ fontSize: '1.18rem', fontWeight: 800, margin: '4px 0 0 0', color: 'var(--primary-navy, #0f2b48)' }}>
                  {editingQuote.clientName}
                </h3>
              </div>
              <button
                onClick={() => setEditingQuote(null)}
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

            {/* Form */}
            <form onSubmit={handleSaveEdit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Insurer Provider *
                  </label>
                  <select
                    value={editFormData.insurerName}
                    onChange={(e) => setEditFormData({ ...editFormData, insurerName: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                  >
                    {INSURERS.map(ins => (
                      <option key={ins} value={ins}>{ins}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Plan Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.planName}
                    onChange={(e) => setEditFormData({ ...editFormData, planName: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Sum Insured (Coverage) *
                  </label>
                  <select
                    value={editFormData.sumInsured}
                    onChange={(e) => setEditFormData({ ...editFormData, sumInsured: e.target.value })}
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
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Base Premium (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="100"
                    value={editFormData.basePremium}
                    onChange={(e) => setEditFormData({ ...editFormData, basePremium: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                  />
                  {editFormData.basePremium && (
                    <div style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 700, marginTop: '2px' }}>
                      Total with 18% GST: ₹{Math.round(Number(editFormData.basePremium) * 1.18)}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Room Rent Limit
                  </label>
                  <input
                    type="text"
                    value={editFormData.roomRentLimit}
                    onChange={(e) => setEditFormData({ ...editFormData, roomRentLimit: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Restoration Benefit
                  </label>
                  <input
                    type="text"
                    value={editFormData.restorationBenefit}
                    onChange={(e) => setEditFormData({ ...editFormData, restorationBenefit: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Quote Status
                  </label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                  >
                    <option value="DRAFT">DRAFT</option>
                    <option value="SENT">SENT</option>
                    <option value="ACCEPTED">ACCEPTED</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Co-Pay / Deductible
                  </label>
                  <input
                    type="text"
                    value={editFormData.copayPercentage}
                    onChange={(e) => setEditFormData({ ...editFormData, copayPercentage: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Advisor Notes & Benefit Highlights
                </label>
                <textarea
                  rows="2"
                  value={editFormData.notes}
                  onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setEditingQuote(null)}
                  disabled={editSubmitting}
                  style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: 'var(--primary-navy)', color: '#ffffff', fontWeight: 700, cursor: editSubmitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  {editSubmitting ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
                  Save Changes
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
