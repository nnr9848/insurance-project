import React, { useState } from 'react';
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  ExternalLink, 
  Plus, 
  Link2, 
  Phone, 
  Mail, 
  MapPin, 
  Heart, 
  Shield, 
  Car, 
  Landmark, 
  Briefcase, 
  Plane, 
  FileText, 
  Edit3, 
  Check, 
  X, 
  Loader2 
} from 'lucide-react';
import { portalService, crmService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import WhatsAppIcon from '../common/WhatsAppIcon';
import { 
  normalizePhoneNumber, 
  normalizeEmail, 
  findMatchingClient, 
  calculateCustomerTouchpoints 
} from '../../utils/crmDeduplication';

export default function LeadInquiriesView({
  quotes = [],
  leads = [],
  setQuotes,
  setLeads,
  onOpenClient360
}) {
  const toast = useToast();

  // Quotes filters, search & pagination
  const [quoteSearch, setQuoteSearch] = useState('');
  const [quoteCategoryFilter, setQuoteCategoryFilter] = useState('');
  const [quoteCurrentPage, setQuoteCurrentPage] = useState(1);
  const [quotePageSize, setQuotePageSize] = useState(10);

  // Quick-Edit state for Quote Inquiries / Leads
  const [editingQuoteId, setEditingQuoteId] = useState(null);
  const [editQuoteFormData, setEditQuoteFormData] = useState({});
  const [isSavingQuote, setIsSavingQuote] = useState(false);

  // Clean recursive "Specs: Specs: ..." prefix accumulation from legacy data
  const sanitizeSpecsString = (val) => {
    if (!val) return '';
    let s = String(val).trim();
    while (/^specs\s*:\s*/i.test(s)) {
      s = s.replace(/^specs\s*:\s*/i, '').trim();
    }
    return s;
  };

  // Helper to unpack planDetails JSON into human-friendly coverage, specs, and notes fields
  const unpackPlanDetails = (raw) => {
    if (!raw) return { coverageAmount: '', planSpecs: '', notes: '' };
    try {
      const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
      if (typeof data !== 'object' || data === null) {
        return { coverageAmount: '', planSpecs: sanitizeSpecsString(raw), notes: '' };
      }
      let coverage = data.coverage || data.coverageAmount || data.sumInsured || data.sumAssured || data.loanAmount || '';
      let notes = data.notes || data.remarks || data.comments || '';
      
      let directSpecs = data.specs || data.details || data.planSpecs || '';
      if (directSpecs) {
        return {
          coverageAmount: coverage,
          planSpecs: sanitizeSpecsString(directSpecs),
          notes: String(notes || '').trim()
        };
      }

      const otherEntries = Object.entries(data).filter(([k, v]) => 
        !['coverage', 'coverageAmount', 'sumInsured', 'sumAssured', 'loanAmount', 'coverage_amount', 'specs', 'details', 'planSpecs', 'notes', 'remarks', 'comments'].includes(k) && Boolean(v)
      );

      const specs = otherEntries.map(([k, v]) => {
        let label = k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim();
        return `${label}: ${v}`;
      }).join(', ');
      
      return {
        coverageAmount: coverage,
        planSpecs: sanitizeSpecsString(specs),
        notes: String(notes || '').trim()
      };
    } catch {
      return { coverageAmount: '', planSpecs: sanitizeSpecsString(raw), notes: '' };
    }
  };

  const packPlanDetails = (coverageAmount, planSpecs, notes) => {
    const obj = {};
    if (coverageAmount && coverageAmount.trim()) {
      obj.coverage = coverageAmount.trim();
    }
    if (planSpecs && planSpecs.trim()) {
      obj.specs = sanitizeSpecsString(planSpecs.trim());
    }
    if (notes && notes.trim()) {
      obj.notes = notes.trim();
    }
    return Object.keys(obj).length > 0 ? JSON.stringify(obj) : '';
  };

  const startEditQuote = (quote) => {
    const { coverageAmount, planSpecs, notes } = unpackPlanDetails(quote.planDetails);
    setEditingQuoteId(quote.id);
    setEditQuoteFormData({
      fullName: quote.fullName || '',
      phoneNumber: quote.phoneNumber || '',
      secondaryPhone: quote.secondaryPhone || '',
      email: quote.email || '',
      city: quote.city || '',
      categorySlug: quote.categorySlug || 'health-insurance',
      coverageAmount: coverageAmount || '',
      planSpecs: planSpecs || '',
      notes: notes || '',
      status: quote.status || 'NEW'
    });
  };

  const cancelEditQuote = () => {
    setEditingQuoteId(null);
    setEditQuoteFormData({});
  };

  const saveEditQuote = async (quoteId) => {
    if (!editQuoteFormData.fullName?.trim()) {
      toast.error('Full Name is required');
      return;
    }
    if (!editQuoteFormData.phoneNumber?.trim()) {
      toast.error('Primary Phone Number is required');
      return;
    }
    setIsSavingQuote(true);
    try {
      const payload = {
        fullName: editQuoteFormData.fullName.trim(),
        phoneNumber: editQuoteFormData.phoneNumber.trim(),
        secondaryPhone: editQuoteFormData.secondaryPhone ? editQuoteFormData.secondaryPhone.trim() : '',
        email: editQuoteFormData.email ? editQuoteFormData.email.trim() : '',
        city: editQuoteFormData.city ? editQuoteFormData.city.trim() : '',
        categorySlug: editQuoteFormData.categorySlug || 'health-insurance',
        planDetails: packPlanDetails(editQuoteFormData.coverageAmount, editQuoteFormData.planSpecs, editQuoteFormData.notes),
        status: editQuoteFormData.status || 'NEW'
      };

      const updated = await portalService.updateQuote(quoteId, payload);
      setQuotes(prev => prev.map(q => q.id === quoteId ? updated : q));
      toast.success(`Inquiry for "${updated.fullName}" updated successfully!`);
      setEditingQuoteId(null);
      setEditQuoteFormData({});
    } catch (err) {
      console.error('Error updating quote inquiry:', err);
      toast.error('Failed to update quote inquiry: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSavingQuote(false);
    }
  };

  // Filter quotes
  const filteredQuotes = quotes.filter((q) => {
    const matchesSearch = !quoteSearch || 
      (q.fullName && q.fullName.toLowerCase().includes(quoteSearch.toLowerCase())) ||
      (q.phoneNumber && q.phoneNumber.includes(quoteSearch)) ||
      (q.secondaryPhone && q.secondaryPhone.includes(quoteSearch)) ||
      (q.email && q.email.toLowerCase().includes(quoteSearch.toLowerCase())) ||
      (q.city && q.city.toLowerCase().includes(quoteSearch.toLowerCase()));
    
    const matchesCategory = !quoteCategoryFilter || 
      (q.categorySlug && q.categorySlug.toLowerCase() === quoteCategoryFilter.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  // Pagination Calculations
  const totalRecords = filteredQuotes.length;
  const totalPages = Math.ceil(totalRecords / quotePageSize) || 1;
  const validCurrentPage = Math.min(quoteCurrentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * quotePageSize;
  const endIndex = Math.min(startIndex + quotePageSize, totalRecords);
  const paginatedQuotes = filteredQuotes.slice(startIndex, endIndex);

  // Helper to format JSON planDetails into human-readable chips
  const renderPlanDetails = (planDetailsStr) => {
    if (!planDetailsStr) return <span style={{ color: '#94a3b8' }}>-</span>;
    try {
      const data = typeof planDetailsStr === 'string' ? JSON.parse(planDetailsStr) : planDetailsStr;
      if (typeof data !== 'object' || data === null) {
        return <span style={{ whiteSpace: 'nowrap' }}>{sanitizeSpecsString(planDetailsStr)}</span>;
      }

      return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', alignItems: 'center' }}>
          {Object.entries(data).map(([key, val]) => {
            if (!val) return null;
            const cleanedVal = sanitizeSpecsString(val);
            if (!cleanedVal) return null;

            let formattedKey = key
              .replace(/([A-Z])/g, ' $1')
              .replace(/^./, str => str.toUpperCase())
              .replace(/Amount|Slug|Details/gi, '')
              .trim();

            return (
              <span
                key={key}
                style={{
                  background: '#f8fafc',
                  color: '#334155',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  padding: '2px 6px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px'
                }}
              >
                <strong style={{ color: '#0f2b48' }}>{formattedKey}:</strong> {cleanedVal}
              </span>
            );
          })}
        </div>
      );
    } catch {
      return <span style={{ whiteSpace: 'nowrap' }}>{sanitizeSpecsString(planDetailsStr)}</span>;
    }
  };

  // Category Badge Visuals
  const getLeadCategoryBadge = (slug) => {
    const s = slug ? slug.toLowerCase() : '';
    if (s.includes('health')) {
      return { label: 'Health Insurance', icon: <Heart size={12} />, bg: '#ecfdf5', color: '#059669', border: '#a7f3d0' };
    }
    if (s.includes('life') || s.includes('term')) {
      return { label: 'Term Life Shield', icon: <Shield size={12} />, bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' };
    }
    if (s.includes('vehicle') || s.includes('motor') || s.includes('car') || s.includes('bike')) {
      return { label: 'Vehicle Insurance', icon: <Car size={12} />, bg: '#eff6ff', color: '#3b82f6', border: '#bfdbfe' };
    }
    if (s.includes('loan')) {
      return { label: 'Loans & Financing', icon: <Landmark size={12} />, bg: '#fffbeb', color: '#d97706', border: '#fde68a' };
    }
    if (s.includes('business') || s.includes('group') || s.includes('sme')) {
      return { label: 'Business & SME', icon: <Briefcase size={12} />, bg: '#f8fafc', color: '#475569', border: '#cbd5e1' };
    }
    if (s.includes('travel')) {
      return { label: 'Travel Insurance', icon: <Plane size={12} />, bg: '#fdf4ff', color: '#86198f', border: '#f5d0fe' };
    }
    return { label: slug ? slug.replace('-', ' ') : 'General', icon: <FileText size={12} />, bg: '#f1f5f9', color: '#334155', border: '#e2e8f0' };
  };

  return (
    <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
      {/* Quote Leads Toolbar & Search */}
      <div style={{ padding: '0.85rem 1.25rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '0.65rem', flex: 1, minWidth: '240px', alignItems: 'center' }}>
            <form 
              role="search" 
              onSubmit={(e) => e.preventDefault()} 
              style={{ position: 'relative', flex: 1, maxWidth: '360px', margin: 0 }}
            >
              <input
                type="search"
                name="quote-leads-search-input"
                id="quote-leads-search-input"
                autoComplete="search"
                data-lpignore="true"
                data-form-type="other"
                placeholder="Search name, phone, city..."
                className="form-input"
                value={quoteSearch}
                onChange={(e) => {
                  setQuoteSearch(e.target.value);
                  setQuoteCurrentPage(1);
                }}
                style={{ paddingLeft: '2.2rem', paddingRight: '0.75rem', height: '36px', fontSize: '0.84rem', width: '100%', borderRadius: '10px' }}
              />
              <Search size={15} color="#64748b" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            </form>

            <select
              className="form-select crm-desktop-filter-dropdowns"
              value={quoteCategoryFilter}
              onChange={(e) => {
                setQuoteCategoryFilter(e.target.value);
                setQuoteCurrentPage(1);
              }}
              style={{ height: '36px', fontSize: '0.84rem', width: '180px', borderRadius: '10px' }}
            >
              <option value="">All Categories</option>
              <option value="health-insurance">Health Insurance</option>
              <option value="motor-insurance">Vehicle Insurance</option>
              <option value="life-insurance">Term Life Shield</option>
              <option value="loans">Loans & Financing</option>
              <option value="business-insurance">Business & SME</option>
              <option value="travel-insurance">Travel Insurance</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', background: '#ffffff', border: '1px solid var(--border-subtle)', padding: '4px 10px', borderRadius: '20px' }}>
              {filteredQuotes.length} Inquiries
            </span>
          </div>
        </div>

        {/* Mobile Horizontal Quick-Filter Pill Rail */}
        <div className="crm-mobile-pill-filter-rail">
          {[
            { label: 'All', value: '' },
            { label: 'Health', value: 'health-insurance' },
            { label: 'Vehicle', value: 'motor-insurance' },
            { label: 'Life', value: 'life-insurance' },
            { label: 'Loans', value: 'loans' },
            { label: 'Business', value: 'business-insurance' },
            { label: 'Travel', value: 'travel-insurance' },
          ].map(chip => (
            <button
              key={chip.value}
              type="button"
              onClick={() => {
                setQuoteCategoryFilter(chip.value);
                setQuoteCurrentPage(1);
              }}
              className={`crm-mobile-pill-btn ${quoteCategoryFilter === chip.value ? 'active' : ''}`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* DESKTOP TABLE VIEW (>= 768px) */}
      <div className="crm-desktop-table-container" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <th style={{ padding: '0.85rem 1.25rem', fontWeight: 700, whiteSpace: 'nowrap' }}>Inquiry Date</th>
              <th style={{ padding: '0.85rem 1.25rem', fontWeight: 700 }}>Prospect & Account</th>
              <th style={{ padding: '0.85rem 1.25rem', fontWeight: 700 }}>Category</th>
              <th style={{ padding: '0.85rem 1.25rem', fontWeight: 700 }}>Contact & 1-Tap Reach</th>
              <th style={{ padding: '0.85rem 1.25rem', fontWeight: 700 }}>Plan Specs</th>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 700, textAlign: 'center' }}>Inquiry Status</th>
              <th style={{ padding: '0.85rem 1.25rem', fontWeight: 700, textAlign: 'center' }}>CRM Pipeline</th>
            </tr>
          </thead>
          <tbody>
            {paginatedQuotes.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '3.5rem', textAlign: 'center', color: '#64748b' }}>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: '#0f2b48', marginBottom: '0.25rem' }}>No quote inquiries match your filter</div>
                  <div style={{ fontSize: '0.85rem' }}>Try changing the search keyword or category filter above.</div>
                </td>
              </tr>
            ) : (
              paginatedQuotes.map((q) => {
                const {
                  totalInquiries,
                  otherInquiriesCount,
                  totalClientRecords,
                  matchingClient
                } = calculateCustomerTouchpoints(q, quotes, leads);

                const cleanPhone = normalizePhoneNumber(q.phoneNumber);
                const cleanSecPhone = normalizePhoneNumber(q.secondaryPhone);
                const cleanEmail = normalizeEmail(q.email);

                const totalProspectInquiries = totalInquiries;
                const catBadge = getLeadCategoryBadge(q.categorySlug);
                const isEditingThisQuote = editingQuoteId === q.id;

                if (isEditingThisQuote) {
                  return (
                    <tr key={q.id} style={{ background: '#ecfdf5', borderBottom: '1.5px solid var(--accent-emerald)' }}>
                      {/* 1. Date (read only) */}
                      <td style={{ padding: '0.65rem 0.85rem', whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: 700, color: '#0f2b48', fontSize: '0.78rem' }}>
                          {new Date(q.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                          ✏️ Editing
                        </div>
                      </td>

                      {/* 2. Full Name & City */}
                      <td style={{ padding: '0.65rem 0.85rem' }}>
                        <input
                          type="text"
                          name={`quote-edit-fullname-${q.id}`}
                          autoComplete="off"
                          data-lpignore="true"
                          data-form-type="other"
                          value={editQuoteFormData.fullName || ''}
                          placeholder="Full Name"
                          onChange={(e) => setEditQuoteFormData({ ...editQuoteFormData, fullName: e.target.value })}
                          style={{ width: '100%', padding: '4px 6px', borderRadius: '4px', border: '1px solid var(--accent-emerald)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '3px' }}
                        />
                        <input
                          type="text"
                          name={`quote-edit-city-${q.id}`}
                          autoComplete="off"
                          data-lpignore="true"
                          data-form-type="other"
                          value={editQuoteFormData.city || ''}
                          placeholder="City"
                          onChange={(e) => setEditQuoteFormData({ ...editQuoteFormData, city: e.target.value })}
                          style={{ width: '100%', padding: '3px 6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.72rem' }}
                        />
                      </td>

                      {/* 3. Category */}
                      <td style={{ padding: '0.65rem 0.85rem' }}>
                        <select
                          name={`quote-edit-category-${q.id}`}
                          value={editQuoteFormData.categorySlug || 'health-insurance'}
                          onChange={(e) => setEditQuoteFormData({ ...editQuoteFormData, categorySlug: e.target.value })}
                          style={{ width: '100%', padding: '4px 6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.76rem' }}
                        >
                          <option value="health-insurance">Health Insurance</option>
                          <option value="motor-insurance">Vehicle Insurance</option>
                          <option value="life-insurance">Term Life Shield</option>
                          <option value="loans">Loans & Financing</option>
                          <option value="business-insurance">Business & SME</option>
                          <option value="travel-insurance">Travel Insurance</option>
                        </select>
                      </td>

                      {/* 4. Contact: Primary Phone, Alt Phone, Email */}
                      <td style={{ padding: '0.65rem 0.85rem' }}>
                        <input
                          type="tel"
                          name={`quote-edit-primary-phone-${q.id}`}
                          autoComplete="off"
                          data-lpignore="true"
                          data-form-type="other"
                          value={editQuoteFormData.phoneNumber || ''}
                          placeholder="Primary Phone *"
                          onChange={(e) => setEditQuoteFormData({ ...editQuoteFormData, phoneNumber: e.target.value })}
                          style={{ width: '100%', padding: '4px 6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.78rem', marginBottom: '3px' }}
                        />
                        <input
                          type="tel"
                          name={`quote-edit-alt-phone-${q.id}`}
                          autoComplete="off"
                          data-lpignore="true"
                          data-form-type="other"
                          value={editQuoteFormData.secondaryPhone || ''}
                          placeholder="Alt Phone"
                          onChange={(e) => setEditQuoteFormData({ ...editQuoteFormData, secondaryPhone: e.target.value })}
                          style={{ width: '100%', padding: '3px 6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.72rem', marginBottom: '3px' }}
                        />
                        <input
                          type="email"
                          name={`quote-edit-email-${q.id}`}
                          autoComplete="off"
                          data-lpignore="true"
                          data-form-type="other"
                          value={editQuoteFormData.email || ''}
                          placeholder="Email Address"
                          onChange={(e) => setEditQuoteFormData({ ...editQuoteFormData, email: e.target.value })}
                          style={{ width: '100%', padding: '3px 6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.72rem' }}
                        />
                      </td>

                      {/* 5. Plan Specs (Structured: Coverage + Specs) */}
                      <td style={{ padding: '0.65rem 0.85rem' }}>
                        <input
                          type="text"
                          name={`quote-edit-coverage-${q.id}`}
                          autoComplete="off"
                          data-lpignore="true"
                          data-form-type="other"
                          value={editQuoteFormData.coverageAmount || ''}
                          placeholder="Coverage (e.g. ₹25 Lakhs)"
                          onChange={(e) => setEditQuoteFormData({ ...editQuoteFormData, coverageAmount: e.target.value })}
                          style={{ width: '100%', padding: '4px 6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.74rem', marginBottom: '3px', fontWeight: 600 }}
                        />
                        <input
                          type="text"
                          name={`quote-edit-specs-${q.id}`}
                          autoComplete="off"
                          data-lpignore="true"
                          data-form-type="other"
                          value={editQuoteFormData.planSpecs || ''}
                          placeholder="Specs (e.g. Family Floater)"
                          onChange={(e) => setEditQuoteFormData({ ...editQuoteFormData, planSpecs: e.target.value })}
                          style={{ width: '100%', padding: '3px 6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.72rem', marginBottom: '3px' }}
                        />
                        <input
                          type="text"
                          name={`quote-edit-notes-${q.id}`}
                          autoComplete="off"
                          data-lpignore="true"
                          data-form-type="other"
                          value={editQuoteFormData.notes || ''}
                          placeholder="📝 Notes / Client Remarks"
                          onChange={(e) => setEditQuoteFormData({ ...editQuoteFormData, notes: e.target.value })}
                          style={{ width: '100%', padding: '3px 6px', borderRadius: '4px', border: '1px solid #fde68a', background: '#fffbeb', fontSize: '0.72rem' }}
                        />
                      </td>

                      {/* 6. Status Dropdown */}
                      <td style={{ padding: '0.65rem 0.85rem', textAlign: 'center' }}>
                        <select
                          name={`quote-edit-status-${q.id}`}
                          value={editQuoteFormData.status || 'NEW'}
                          onChange={(e) => setEditQuoteFormData({ ...editQuoteFormData, status: e.target.value })}
                          style={{ padding: '3px 6px', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 700 }}
                        >
                          <option value="NEW">🟢 NEW</option>
                          <option value="CONTACTED">⚡ CONTACTED</option>
                          <option value="CONVERTED">✅ CONVERTED</option>
                          <option value="ARCHIVED">❌ ARCHIVED</option>
                        </select>
                      </td>

                      {/* 7. Action: Save / Cancel */}
                      <td style={{ padding: '0.65rem 0.85rem', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <button
                            onClick={() => saveEditQuote(q.id)}
                            disabled={isSavingQuote}
                            style={{
                              background: 'var(--accent-emerald)',
                              color: '#fff',
                              border: 'none',
                              padding: '0.35rem 0.65rem',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: 800,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px'
                            }}
                          >
                            {isSavingQuote ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                            <span>Save</span>
                          </button>
                          <button
                            onClick={cancelEditQuote}
                            disabled={isSavingQuote}
                            style={{
                              background: '#f1f5f9',
                              color: '#475569',
                              border: '1px solid #cbd5e1',
                              padding: '0.35rem 0.5rem',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              cursor: 'pointer'
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={q.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }} className="crm-table-row">
                    {/* 1. Date */}
                    <td style={{ padding: '0.85rem 1.25rem', whiteSpace: 'nowrap' }}>
                      <div style={{ fontWeight: 700, color: '#0f2b48', fontSize: '0.82rem' }}>
                        {new Date(q.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                        {new Date(q.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                      </div>
                    </td>

                    {/* 2. Prospect & Account */}
                    <td style={{ padding: '0.85rem 1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: 800, color: '#0f2b48', fontSize: '0.88rem' }}>
                          {q.fullName || 'Web Prospect'}
                        </span>
                        {matchingClient && (
                          <button
                            onClick={() => onOpenClient360(matchingClient)}
                            style={{
                              background: 'none',
                              border: 'none',
                              padding: 0,
                              cursor: 'pointer',
                              color: '#0284c7',
                              display: 'inline-flex',
                              alignItems: 'center'
                            }}
                            title={`Open Client 360 for ${matchingClient.fullName}`}
                          >
                            <ExternalLink size={12} />
                          </button>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                        {matchingClient ? (
                          <span
                            onClick={() => onOpenClient360(matchingClient)}
                            style={{
                              fontFamily: 'monospace',
                              fontWeight: 700,
                              color: '#059669',
                              background: '#ecfdf5',
                              border: '1px solid #a7f3d0',
                              padding: '1px 5px',
                              borderRadius: '4px',
                              fontSize: '0.7rem',
                              cursor: 'pointer'
                            }}
                            title="Linked Client Record in Master CRM"
                          >
                            {matchingClient.clientCode}
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>
                            New Web Prospect
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 3. Category & Multi-Inquiry Flag */}
                    <td style={{ padding: '0.85rem 1.25rem' }}>
                      <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '3px', alignItems: 'flex-start' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: catBadge.bg,
                            color: catBadge.color,
                            border: `1px solid ${catBadge.border}`,
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {catBadge.icon}
                          {catBadge.label}
                        </span>

                        {totalProspectInquiries > 1 && (
                          <span
                            style={{
                              background: '#fffbeb',
                              color: '#b45309',
                              border: '1px solid #fde68a',
                              padding: '1px 6px',
                              borderRadius: '4px',
                              fontSize: '0.66rem',
                              fontWeight: 800,
                              whiteSpace: 'nowrap'
                            }}
                            title={`This client has submitted ${totalProspectInquiries} inquiries across different categories`}
                          >
                            🔥 +{totalProspectInquiries - 1} Other Inquiries
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 4. Consolidated Contact & 1-Tap Reach */}
                    <td style={{ padding: '0.85rem 1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                        <div>
                          <div style={{ fontWeight: 700, color: '#0f2b48', fontSize: '0.84rem' }}>
                            {q.phoneNumber || 'Not provided'}
                          </div>
                          {q.secondaryPhone && q.secondaryPhone !== q.phoneNumber && (
                            <div style={{ fontSize: '0.72rem', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '2px' }}>
                              <span>Alt:</span> {q.secondaryPhone}
                            </div>
                          )}
                          {q.email && (
                            <div style={{ fontSize: '0.73rem', color: '#0284c7', marginTop: '1px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <Mail size={11} color="#0284c7" /> {q.email}
                            </div>
                          )}
                          <div style={{ fontSize: '0.73rem', color: '#64748b', marginTop: '1px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <MapPin size={11} color="#94a3b8" /> {q.city || 'India'}
                          </div>
                        </div>

                        {/* 1-Tap Icon Strip */}
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          {/* Call */}
                          <a
                            href={`tel:${q.phoneNumber}`}
                            title={`Call ${q.fullName || q.phoneNumber}`}
                            style={{
                              background: '#ecfdf5',
                              color: '#059669',
                              border: '1px solid #a7f3d0',
                              width: '26px',
                              height: '26px',
                              borderRadius: '6px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              textDecoration: 'none'
                            }}
                          >
                            <Phone size={12} />
                          </a>

                          {/* WhatsApp */}
                          {cleanPhone ? (
                            <a
                              href={`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(`Hello ${q.fullName || 'Sir/Madam'}, greeting from Aadhiraksha Insurance. Regarding your ${q.categorySlug ? q.categorySlug.replace('-', ' ') : 'insurance'} inquiry...`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Open WhatsApp Chat"
                              style={{
                                background: '#f0fdf4',
                                color: '#16a34a',
                                border: '1px solid #bbf7d0',
                                width: '26px',
                                height: '26px',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                textDecoration: 'none'
                              }}
                            >
                              <WhatsAppIcon size={13} color="#16a34a" />
                            </a>
                          ) : null}

                          {/* Email */}
                          <a
                            href={`mailto:${q.email || ''}?subject=Insurance%20Proposal%20-%20Aadhiraksha&body=Dear%20${encodeURIComponent(q.fullName || 'Client')},%0D%0A%0D%0AThank%20you%20for%20your%20inquiry%20regarding%20${encodeURIComponent(q.categorySlug || 'insurance')}.`}
                            title={q.email ? `Email ${q.email}` : 'Compose Email'}
                            style={{
                              background: '#f0f9ff',
                              color: '#0284c7',
                              border: '1px solid #bae6fd',
                              width: '26px',
                              height: '26px',
                              borderRadius: '6px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              textDecoration: 'none'
                            }}
                          >
                            <Mail size={12} />
                          </a>
                        </div>
                      </div>
                    </td>

                    {/* 5. Plan Details & Specs */}
                    <td style={{ padding: '0.85rem 1.25rem' }}>
                      {renderPlanDetails(q.planDetails)}
                    </td>

                    {/* 6. Inquiry Status */}
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                      <select
                        value={q.status || 'NEW'}
                        onChange={async (e) => {
                          const nextStatus = e.target.value;
                          try {
                            await portalService.updateQuoteStatus(q.id, nextStatus);
                            setQuotes(prev => prev.map(item => item.id === q.id ? { ...item, status: nextStatus } : item));
                            toast.success(`Inquiry #${q.id} status updated to ${nextStatus}`);
                          } catch (err) {
                            console.error('Error updating status', err);
                            toast.error('Failed to update status');
                          }
                        }}
                        style={{
                          background: q.status === 'NEW' ? '#ecfdf5' : q.status === 'CONTACTED' ? '#eff6ff' : q.status === 'CONVERTED' ? '#f0fdf4' : '#f8fafc',
                          color: q.status === 'NEW' ? '#059669' : q.status === 'CONTACTED' ? '#2563eb' : q.status === 'CONVERTED' ? '#16a34a' : '#64748b',
                          border: `1px solid ${q.status === 'NEW' ? '#a7f3d0' : q.status === 'CONTACTED' ? '#bfdbfe' : q.status === 'CONVERTED' ? '#bbf7d0' : '#e2e8f0'}`,
                          padding: '0.25rem 0.5rem',
                          borderRadius: '6px',
                          fontSize: '0.74rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          outline: 'none'
                        }}
                      >
                        <option value="NEW">🟢 NEW</option>
                        <option value="CONTACTED">⚡ CONTACTED</option>
                        <option value="CONVERTED">✅ CONVERTED</option>
                        <option value="ARCHIVED">❌ ARCHIVED</option>
                      </select>
                    </td>

                    {/* 7. Action: CRM Link / Ingest + Quick Edit */}
                    <td style={{ padding: '0.85rem 1.25rem', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        {q.status === 'CONVERTED' && matchingClient ? (
                          <button
                            onClick={() => onOpenClient360(matchingClient)}
                            style={{
                              background: '#f8fafc',
                              color: '#0284c7',
                              border: '1px solid #cbd5e1',
                              padding: '0.35rem 0.65rem',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: 800,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                            title="View Master Client 360"
                          >
                            <ExternalLink size={12} color="#0284c7" />
                            <span>In CRM ({matchingClient.clientCode})</span>
                          </button>
                        ) : (
                          <button
                            onClick={async () => {
                              try {
                                const { coverageAmount, planSpecs, notes: inquiryNote } = unpackPlanDetails(q.planDetails);
                                let formattedNotes = `Inquiry #${q.id} (${q.categorySlug || 'Insurance'})`;
                                if (coverageAmount) formattedNotes += ` | Coverage: ${coverageAmount}`;
                                if (planSpecs) formattedNotes += ` | Specs: ${planSpecs}`;
                                if (inquiryNote) formattedNotes += ` | 📝 Note: ${inquiryNote}`;

                                const createdOrUpdated = await crmService.createLead({
                                  fullName: q.fullName || 'Web Prospect',
                                  phoneNumber: q.phoneNumber,
                                  whatsappNumber: q.secondaryPhone || '',
                                  email: q.email || '',
                                  city: q.city || '',
                                  categorySlug: q.categorySlug || 'general',
                                  insuranceType: q.categorySlug ? q.categorySlug.replace('-', ' ').toUpperCase() : 'GENERAL',
                                  notes: formattedNotes
                                });
                                await portalService.updateQuoteStatus(q.id, 'CONVERTED');
                                setQuotes(prev => prev.map(item => item.id === q.id ? { ...item, status: 'CONVERTED' } : item));
                                
                                // Update or prepend client
                                setLeads(prev => {
                                  const exists = prev.some(l => l.id === createdOrUpdated.id);
                                  return exists ? prev.map(l => l.id === createdOrUpdated.id ? createdOrUpdated : l) : [createdOrUpdated, ...prev];
                                });

                                if (matchingClient) {
                                  toast.success(
                                    `Inquiry linked as a new opportunity to "${matchingClient.fullName}" (${matchingClient.clientCode})!`,
                                    {
                                      label: 'View Client 360',
                                      onClick: () => onOpenClient360(createdOrUpdated)
                                    }
                                  );
                                } else {
                                  toast.success(
                                    `New master client created for "${q.fullName || q.phoneNumber}" (${createdOrUpdated.clientCode})!`,
                                    {
                                      label: 'View Client 360',
                                      onClick: () => onOpenClient360(createdOrUpdated)
                                    }
                                  );
                                }
                              } catch (err) {
                                console.error('Error converting lead', err);
                                toast.error('Failed to convert inquiry: ' + (err.response?.data?.message || err.message));
                              }
                            }}
                            style={{
                              background: matchingClient ? '#0284c7' : 'var(--accent-emerald)',
                              color: '#ffffff',
                              border: 'none',
                              padding: '0.35rem 0.65rem',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: 800,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                            }}
                          >
                            {matchingClient ? <Link2 size={12} /> : <Plus size={12} />}
                            <span>{matchingClient ? `Link to ${matchingClient.clientCode}` : '+ Push to CRM'}</span>
                          </button>
                        )}

                        {/* Quick Edit Row Trigger */}
                        <button
                          onClick={() => startEditQuote(q)}
                          style={{
                            background: '#f8fafc',
                            color: '#64748b',
                            border: '1px solid #cbd5e1',
                            padding: '0.35rem 0.45rem',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          title="Quick Edit Prospect Info & Specs"
                        >
                          <Edit3 size={12} />
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

      {/* MOBILE CARD DECK VIEW (< 768px) */}
      <div className="crm-mobile-cards-container" style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        {paginatedQuotes.length === 0 ? (
          <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: '#64748b', background: '#fff', borderRadius: '12px' }}>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: '#0f2b48', marginBottom: '0.25rem' }}>No quote inquiries match your filter</div>
            <div style={{ fontSize: '0.82rem' }}>Try adjusting your search query.</div>
          </div>
        ) : (
          paginatedQuotes.map((q) => {
            const {
              totalInquiries,
              otherInquiriesCount,
              totalClientRecords,
              matchingClient
            } = calculateCustomerTouchpoints(q, quotes, leads);

            const cleanPhone = normalizePhoneNumber(q.phoneNumber);
            const cleanSecPhone = normalizePhoneNumber(q.secondaryPhone);
            const cleanEmail = normalizeEmail(q.email);

            const totalProspectInquiries = totalInquiries;
            const catBadge = getLeadCategoryBadge(q.categorySlug);
            const isEditingThisQuote = editingQuoteId === q.id;

            if (isEditingThisQuote) {
              return (
                <div
                  key={q.id}
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
                      ✏️ Edit Quote Inquiry <span style={{ fontSize: '0.75rem', color: '#64748b' }}>(#{q.id})</span>
                    </div>
                    <button
                      onClick={cancelEditQuote}
                      style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '2px' }}
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <div>
                      <label style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '2px' }}>Full Name *</label>
                      <input
                        type="text"
                        name={`m-quote-edit-fullname-${q.id}`}
                        autoComplete="off"
                        data-lpignore="true"
                        data-form-type="other"
                        value={editQuoteFormData.fullName || ''}
                        placeholder="Full Name"
                        onChange={(e) => setEditQuoteFormData({ ...editQuoteFormData, fullName: e.target.value })}
                        style={{ width: '100%', padding: '5px 6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.78rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '2px' }}>Phone Number *</label>
                      <input
                        type="tel"
                        name={`m-quote-edit-primary-phone-${q.id}`}
                        autoComplete="off"
                        data-lpignore="true"
                        data-form-type="other"
                        value={editQuoteFormData.phoneNumber || ''}
                        placeholder="10-digit Phone"
                        onChange={(e) => setEditQuoteFormData({ ...editQuoteFormData, phoneNumber: e.target.value })}
                        style={{ width: '100%', padding: '5px 6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.78rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '2px' }}>Alt Phone</label>
                      <input
                        type="tel"
                        name={`m-quote-edit-alt-phone-${q.id}`}
                        autoComplete="off"
                        data-lpignore="true"
                        data-form-type="other"
                        value={editQuoteFormData.secondaryPhone || ''}
                        placeholder="Alternate Phone"
                        onChange={(e) => setEditQuoteFormData({ ...editQuoteFormData, secondaryPhone: e.target.value })}
                        style={{ width: '100%', padding: '5px 6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.78rem' }}
                      />
                    </div>

                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '2px' }}>Email Address</label>
                      <input
                        type="email"
                        name={`m-quote-edit-email-${q.id}`}
                        autoComplete="off"
                        data-lpignore="true"
                        data-form-type="other"
                        value={editQuoteFormData.email || ''}
                        placeholder="prospect@mail.com"
                        onChange={(e) => setEditQuoteFormData({ ...editQuoteFormData, email: e.target.value })}
                        style={{ width: '100%', padding: '5px 6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.78rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '2px' }}>City / Location</label>
                      <input
                        type="text"
                        name={`m-quote-edit-city-${q.id}`}
                        autoComplete="off"
                        data-lpignore="true"
                        data-form-type="other"
                        value={editQuoteFormData.city || ''}
                        placeholder="City"
                        onChange={(e) => setEditQuoteFormData({ ...editQuoteFormData, city: e.target.value })}
                        style={{ width: '100%', padding: '5px 6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.78rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '2px' }}>Category</label>
                      <select
                        value={editQuoteFormData.categorySlug || 'health-insurance'}
                        onChange={(e) => setEditQuoteFormData({ ...editQuoteFormData, categorySlug: e.target.value })}
                        style={{ width: '100%', padding: '5px 6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.78rem' }}
                      >
                        <option value="health-insurance">Health Insurance</option>
                        <option value="motor-insurance">Vehicle Insurance</option>
                        <option value="life-insurance">Term Life Shield</option>
                        <option value="loans">Loans & Financing</option>
                        <option value="business-insurance">Business & SME</option>
                        <option value="travel-insurance">Travel Insurance</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '2px' }}>Status</label>
                      <select
                        value={editQuoteFormData.status || 'NEW'}
                        onChange={(e) => setEditQuoteFormData({ ...editQuoteFormData, status: e.target.value })}
                        style={{ width: '100%', padding: '5px 6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.78rem' }}
                      >
                        <option value="NEW">🟢 NEW</option>
                        <option value="CONTACTED">⚡ CONTACTED</option>
                        <option value="CONVERTED">✅ CONVERTED</option>
                        <option value="ARCHIVED">❌ ARCHIVED</option>
                      </select>
                    </div>

                    <div style={{ gridColumn: 'span 2', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      <div>
                        <label style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '2px' }}>Coverage / Sum Required</label>
                        <input
                          type="text"
                          name={`m-quote-edit-coverage-${q.id}`}
                          autoComplete="off"
                          data-lpignore="true"
                          data-form-type="other"
                          value={editQuoteFormData.coverageAmount || ''}
                          placeholder="e.g. ₹25 Lakhs"
                          onChange={(e) => setEditQuoteFormData({ ...editQuoteFormData, coverageAmount: e.target.value })}
                          style={{ width: '100%', padding: '5px 6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.78rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '2px' }}>Plan Specs</label>
                        <input
                          type="text"
                          name={`m-quote-edit-specs-${q.id}`}
                          autoComplete="off"
                          data-lpignore="true"
                          data-form-type="other"
                          value={editQuoteFormData.planSpecs || ''}
                          placeholder="e.g. Family Floater"
                          onChange={(e) => setEditQuoteFormData({ ...editQuoteFormData, planSpecs: e.target.value })}
                          style={{ width: '100%', padding: '5px 6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.78rem' }}
                        />
                      </div>
                    </div>

                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={{ fontSize: '0.68rem', fontWeight: 700, color: '#b45309', display: 'block', marginBottom: '2px' }}>📝 Notes / Client Remarks</label>
                      <input
                        type="text"
                        name={`m-quote-edit-notes-${q.id}`}
                        autoComplete="off"
                        data-lpignore="true"
                        data-form-type="other"
                        value={editQuoteFormData.notes || ''}
                        placeholder="e.g. Diabetic client, requested quote with zero room rent cap"
                        onChange={(e) => setEditQuoteFormData({ ...editQuoteFormData, notes: e.target.value })}
                        style={{ width: '100%', padding: '5px 6px', borderRadius: '6px', border: '1px solid #fde68a', background: '#fffbeb', fontSize: '0.78rem' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.25rem' }}>
                    <button
                      onClick={cancelEditQuote}
                      disabled={isSavingQuote}
                      style={{
                        padding: '0.35rem 0.65rem',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        background: '#f8fafc',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: '#64748b',
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => saveEditQuote(q.id)}
                      disabled={isSavingQuote}
                      style={{
                        padding: '0.35rem 0.85rem',
                        borderRadius: '6px',
                        border: 'none',
                        background: 'var(--accent-emerald)',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        color: '#ffffff',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      {isSavingQuote ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                      <span>Save Changes</span>
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={q.id}
                className="crm-card"
                style={{
                  padding: '0.75rem 0.85rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  background: '#ffffff',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                }}
              >
                {/* Row 1: Identity & Action Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Row 1.1: Name & Edit Button */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span style={{ fontWeight: 800, color: '#0f2b48', fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {q.fullName || 'Web Prospect'}
                      </span>
                      {matchingClient && (
                        <button
                          onClick={() => onOpenClient360(matchingClient)}
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: 0,
                            cursor: 'pointer',
                            color: '#0284c7',
                            display: 'inline-flex',
                            alignItems: 'center',
                            flexShrink: 0
                          }}
                          title={`Open Client 360 for ${matchingClient.fullName}`}
                        >
                          <ExternalLink size={11} />
                        </button>
                      )}
                      <button
                        onClick={() => startEditQuote(q)}
                        style={{
                          background: '#f8fafc',
                          border: '1px solid #cbd5e1',
                          padding: '1px 4px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#64748b',
                          marginLeft: '2px',
                          flexShrink: 0
                        }}
                        title="Quick Edit"
                      >
                        <Edit3 size={10} />
                      </button>

                      <div style={{ marginLeft: 'auto', flexShrink: 0 }}>
                        <select
                          value={q.status || 'NEW'}
                          onChange={async (e) => {
                            const nextStatus = e.target.value;
                            try {
                              await portalService.updateQuoteStatus(q.id, nextStatus);
                              setQuotes(prev => prev.map(item => item.id === q.id ? { ...item, status: nextStatus } : item));
                              toast.success(`Inquiry #${q.id} status updated to ${nextStatus}`);
                            } catch (err) {
                              console.error('Error updating status', err);
                              toast.error('Failed to update status');
                            }
                          }}
                          style={{
                            background: q.status === 'NEW' ? '#ecfdf5' : q.status === 'CONTACTED' ? '#eff6ff' : q.status === 'CONVERTED' ? '#f0fdf4' : '#f8fafc',
                            color: q.status === 'NEW' ? '#059669' : q.status === 'CONTACTED' ? '#2563eb' : q.status === 'CONVERTED' ? '#16a34a' : '#64748b',
                            border: `1px solid ${q.status === 'NEW' ? '#a7f3d0' : q.status === 'CONTACTED' ? '#bfdbfe' : q.status === 'CONVERTED' ? '#bbf7d0' : '#e2e8f0'}`,
                            padding: '1px 5px',
                            borderRadius: '6px',
                            fontSize: '0.66rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            flexShrink: 0,
                            outline: 'none'
                          }}
                        >
                          <option value="NEW">🟢 NEW</option>
                          <option value="CONTACTED">⚡ CONTACTED</option>
                          <option value="CONVERTED">✅ CONVERTED</option>
                          <option value="ARCHIVED">❌ ARCHIVED</option>
                        </select>
                      </div>
                    </div>

                    {/* Row 1.2: Code / Web Prospect • Date • City */}
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
                      {matchingClient ? (
                        <span
                          onClick={() => onOpenClient360(matchingClient)}
                          style={{
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            color: '#059669',
                            background: '#ecfdf5',
                            border: '1px solid #a7f3d0',
                            padding: '0px 4px',
                            borderRadius: '4px',
                            fontSize: '0.65rem',
                            cursor: 'pointer',
                            flexShrink: 0
                          }}
                          title="Client Identifier Code"
                        >
                          {matchingClient.clientCode}
                        </span>
                      ) : (
                        <span style={{ fontWeight: 600, color: '#94a3b8', flexShrink: 0 }}>
                          New Web Prospect
                        </span>
                      )}
                      <span style={{ flexShrink: 0 }}>•</span>
                      <span style={{ flexShrink: 0 }}>
                        {new Date(q.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </span>
                      {q.city && (
                        <>
                          <span style={{ flexShrink: 0 }}>•</span>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {q.city}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Row 1.3: Visible Phone, Alt Phone & Email */}
                    <div style={{
                      fontSize: '0.72rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      flexWrap: 'wrap',
                      marginTop: '1px'
                    }}>
                      <span style={{ fontWeight: 700, color: '#0f2b48' }}>
                        {q.phoneNumber || 'No phone'}
                      </span>
                      {q.secondaryPhone && q.secondaryPhone !== q.phoneNumber && (
                        <span style={{ color: '#16a34a', display: 'inline-flex', alignItems: 'center', gap: '2px', fontWeight: 600 }}>
                          <span>Alt:</span> {q.secondaryPhone}
                        </span>
                      )}
                      {q.email && (
                        <span style={{ color: '#0284c7', display: 'inline-flex', alignItems: 'center', gap: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px' }} title={q.email}>
                          <Mail size={10} color="#0284c7" />
                          {q.email}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 1-Tap Action Strip (Call, WhatsApp, Email) */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                    {/* Call */}
                    <a
                      href={`tel:${q.phoneNumber}`}
                      title={`Call ${q.fullName || q.phoneNumber}`}
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        background: '#ecfdf5',
                        color: '#059669',
                        border: '1px solid #a7f3d0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textDecoration: 'none'
                      }}
                    >
                      <Phone size={13} />
                    </a>

                    {/* WhatsApp */}
                    {cleanPhone ? (
                      <a
                        href={`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(`Hello ${q.fullName || 'Sir/Madam'}, greeting from Aadhiraksha Insurance. Regarding your ${q.categorySlug ? q.categorySlug.replace('-', ' ') : 'insurance'} inquiry...`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Open WhatsApp Chat"
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '6px',
                          background: '#f0fdf4',
                          color: '#16a34a',
                          border: '1px solid #bbf7d0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          textDecoration: 'none'
                        }}
                      >
                        <WhatsAppIcon size={14} color="#16a34a" />
                      </a>
                    ) : null}

                    {/* Email */}
                    <a
                      href={`mailto:${q.email || ''}?subject=Insurance%20Proposal%20-%20Aadhiraksha&body=Dear%20${encodeURIComponent(q.fullName || 'Client')},%0D%0A%0D%0AThank%20you%20for%20your%20inquiry%20regarding%20${encodeURIComponent(q.categorySlug || 'insurance')}.`}
                      title={q.email ? `Email ${q.email}` : 'Compose Email'}
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        background: '#f0f9ff',
                        color: '#0284c7',
                        border: '1px solid #bae6fd',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textDecoration: 'none'
                      }}
                    >
                      <Mail size={13} />
                    </a>
                  </div>
                </div>

                {/* Row 2: Category & Specs + CRM Ingestion */}
                <div style={{
                  borderTop: '1px dashed #e2e8f0',
                  paddingTop: '0.45rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.4rem'
                }}>
                  {/* Left: Category Badge + Extra inquiries chip */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                        background: catBadge.bg,
                        color: catBadge.color,
                        border: `1px solid ${catBadge.border}`,
                        padding: '2px 6px',
                        borderRadius: '10px',
                        fontSize: '0.68rem',
                        fontWeight: 700
                      }}
                    >
                      {catBadge.icon}
                      {catBadge.label}
                    </span>

                    {totalProspectInquiries > 1 && (
                      <span
                        style={{
                          background: '#fffbeb',
                          color: '#b45309',
                          border: '1px solid #fde68a',
                          padding: '1px 5px',
                          borderRadius: '4px',
                          fontSize: '0.66rem',
                          fontWeight: 800,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        🔥 +{totalProspectInquiries - 1} More
                      </span>
                    )}
                  </div>

                  {/* Right: Plan Specs Preview + CRM Action Button */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    {q.planDetails && (
                      <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                        {renderPlanDetails(q.planDetails)}
                      </div>
                    )}

                    {q.status === 'CONVERTED' && matchingClient ? (
                      <button
                        onClick={() => onOpenClient360(matchingClient)}
                        style={{
                          background: '#ffffff',
                          color: '#0284c7',
                          border: '1px solid #cbd5e1',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '6px',
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}
                        title="View Master Client 360"
                      >
                        <ExternalLink size={10} color="#0284c7" />
                        <span>In CRM ({matchingClient.clientCode})</span>
                      </button>
                    ) : (
                      <button
                        onClick={async () => {
                          try {
                            const { coverageAmount, planSpecs, notes: inquiryNote } = unpackPlanDetails(q.planDetails);
                            let formattedNotes = `Inquiry #${q.id} (${q.categorySlug || 'Insurance'})`;
                            if (coverageAmount) formattedNotes += ` | Coverage: ${coverageAmount}`;
                            if (planSpecs) formattedNotes += ` | Specs: ${planSpecs}`;
                            if (inquiryNote) formattedNotes += ` | 📝 Note: ${inquiryNote}`;

                            const createdOrUpdated = await crmService.createLead({
                              fullName: q.fullName || 'Web Prospect',
                              phoneNumber: q.phoneNumber,
                              whatsappNumber: q.secondaryPhone || '',
                              email: q.email || '',
                              city: q.city || '',
                              categorySlug: q.categorySlug || 'general',
                              insuranceType: q.categorySlug ? q.categorySlug.replace('-', ' ').toUpperCase() : 'GENERAL',
                              notes: formattedNotes
                            });
                            await portalService.updateQuoteStatus(q.id, 'CONVERTED');
                            setQuotes(prev => prev.map(item => item.id === q.id ? { ...item, status: 'CONVERTED' } : item));
                            
                            setLeads(prev => {
                              const exists = prev.some(l => l.id === createdOrUpdated.id);
                              return exists ? prev.map(l => l.id === createdOrUpdated.id ? createdOrUpdated : l) : [createdOrUpdated, ...prev];
                            });

                            if (matchingClient) {
                              toast.success(
                                `Inquiry linked as a new opportunity to "${matchingClient.fullName}" (${matchingClient.clientCode})!`,
                                {
                                  label: 'View Client 360',
                                  onClick: () => onOpenClient360(createdOrUpdated)
                                }
                              );
                            } else {
                              toast.success(
                                `New master client created for "${q.fullName || q.phoneNumber}" (${createdOrUpdated.clientCode})!`,
                                {
                                  label: 'View Client 360',
                                  onClick: () => onOpenClient360(createdOrUpdated)
                                }
                              );
                            }
                          } catch (err) {
                            console.error('Error converting lead', err);
                            toast.error('Failed to convert inquiry: ' + (err.response?.data?.message || err.message));
                          }
                        }}
                        style={{
                          background: matchingClient ? '#0284c7' : 'var(--accent-emerald)',
                          color: '#ffffff',
                          border: 'none',
                          padding: '0.22rem 0.55rem',
                          borderRadius: '6px',
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                        }}
                      >
                        {matchingClient ? <Link2 size={10} /> : <Plus size={10} />}
                        <span>{matchingClient ? `Link to ${matchingClient.clientCode}` : '+ Push to CRM'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* RESPONSIVE ENTERPRISE PAGINATION TOOLBAR */}
      <div style={{
        padding: '0.85rem 1.5rem',
        background: '#f8fafc',
        borderTop: '1px solid #e2e8f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.75rem',
        fontSize: '0.82rem',
        color: '#64748b'
      }}>
        {/* Left: Range Summary + Page Size Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <span>
            Showing <strong style={{ color: '#0f2b48' }}>{totalRecords === 0 ? 0 : startIndex + 1}</strong> - <strong style={{ color: '#0f2b48' }}>{endIndex}</strong> of <strong style={{ color: '#0f2b48' }}>{totalRecords}</strong> inquiries
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <label htmlFor="quotePageSizeSelect" style={{ fontSize: '0.76rem' }}>Per page:</label>
            <select
              id="quotePageSizeSelect"
              value={quotePageSize}
              onChange={(e) => {
                setQuotePageSize(Number(e.target.value));
                setQuoteCurrentPage(1);
              }}
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                padding: '0.2rem 0.4rem',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#0f2b48',
                cursor: 'pointer'
              }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        {/* Right: Page Navigation Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <button
            onClick={() => setQuoteCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={validCurrentPage <= 1}
            style={{
              padding: '0.35rem 0.65rem',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              background: validCurrentPage <= 1 ? '#f1f5f9' : '#ffffff',
              color: validCurrentPage <= 1 ? '#94a3b8' : '#0f2b48',
              cursor: validCurrentPage <= 1 ? 'not-allowed' : 'pointer',
              fontWeight: 700,
              fontSize: '0.78rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.2rem'
            }}
          >
            <ChevronLeft size={14} /> Previous
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', margin: '0 0.25rem' }}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setQuoteCurrentPage(pageNum)}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  border: `1px solid ${pageNum === validCurrentPage ? '#0f2b48' : '#e2e8f0'}`,
                  background: pageNum === validCurrentPage ? '#0f2b48' : '#ffffff',
                  color: pageNum === validCurrentPage ? '#ffffff' : '#475569',
                  fontWeight: 800,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {pageNum}
              </button>
            ))}
          </div>

          <button
            onClick={() => setQuoteCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={validCurrentPage >= totalPages}
            style={{
              padding: '0.35rem 0.65rem',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              background: validCurrentPage >= totalPages ? '#f1f5f9' : '#ffffff',
              color: validCurrentPage >= totalPages ? '#94a3b8' : '#0f2b48',
              cursor: validCurrentPage >= totalPages ? 'not-allowed' : 'pointer',
              fontWeight: 700,
              fontSize: '0.78rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.2rem'
            }}
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
