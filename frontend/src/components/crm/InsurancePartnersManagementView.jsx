import React, { useState, useEffect, useRef } from 'react';
import { 
  Building2, 
  ExternalLink, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  Globe, 
  Layers, 
  ArrowUpDown, 
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  RefreshCw,
  Image as ImageIcon,
  Upload,
  CheckCircle2,
  FolderOpen,
  GripVertical,
  RotateCcw
} from 'lucide-react';
import { portalService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { 
  PARTNER_ASSET_GALLERY, 
  PARTNER_LOGO_MAP, 
  DEFAULT_PARTNERS_FALLBACK 
} from '../../utils/partnerAssetCatalog';

export default function InsurancePartnersManagementView() {
  const toast = useToast();
  const fileInputRef = useRef(null);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [resetting, setResetting] = useState(false);

  // Edit / Create Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);
  const [activeLogoTab, setActiveLogoTab] = useState('gallery'); // 'gallery' | 'upload' | 'url'
  
  const [formData, setFormData] = useState({
    name: '',
    category: 'general',
    redirectUrl: '',
    logoUrl: '',
    logoKey: 'starHealthLogo',
    displayOrder: 1,
    isActive: true
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const data = await portalService.getAdminPartners();
      if (Array.isArray(data) && data.length > 0) {
        setPartners(data);
      } else {
        // Fallback to our 20 default partners so admin screen is never blank
        setPartners(DEFAULT_PARTNERS_FALLBACK);
      }
    } catch (err) {
      console.warn('Backend partners unseeded or offline, using default catalog:', err);
      setPartners(DEFAULT_PARTNERS_FALLBACK);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const handleOpenCreate = () => {
    setEditingPartner(null);
    setActiveLogoTab('gallery');
    setFormData({
      name: '',
      category: 'general',
      redirectUrl: '',
      logoUrl: '',
      logoKey: 'starHealthLogo',
      displayOrder: partners.length + 1,
      isActive: true
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (partner) => {
    setEditingPartner(partner);
    if (partner.logoUrl && !partner.logoUrl.startsWith('data:')) {
      setActiveLogoTab('url');
    } else if (partner.logoUrl && partner.logoUrl.startsWith('data:')) {
      setActiveLogoTab('upload');
    } else {
      setActiveLogoTab('gallery');
    }

    setFormData({
      name: partner.name || '',
      category: partner.category || 'general',
      redirectUrl: partner.redirectUrl || '',
      logoUrl: partner.logoUrl || '',
      logoKey: partner.logoKey || 'starHealthLogo',
      displayOrder: partner.displayOrder ?? 0,
      isActive: partner.isActive ?? true
    });
    setModalOpen(true);
  };

  const handleToggleStatus = async (partner) => {
    try {
      const updated = await portalService.togglePartnerStatus(partner.id);
      setPartners(prev => prev.map(p => p.id === partner.id ? updated : p));
      toast?.show(
        `${partner.name} is now ${updated.isActive ? 'Active on Homepage' : 'Hidden from Homepage'}`, 
        'success'
      );
    } catch (err) {
      // Local optimistic toggle for offline fallback
      setPartners(prev => prev.map(p => p.id === partner.id ? { ...p, isActive: !p.isActive } : p));
      toast?.show(`Toggled status for ${partner.name}`, 'info');
    }
  };

  const handleDeletePartner = async (partner) => {
    if (!window.confirm(`Are you sure you want to remove "${partner.name}"?`)) return;
    try {
      await portalService.deletePartner(partner.id);
      setPartners(prev => prev.filter(p => p.id !== partner.id));
      toast?.show(`Removed partner ${partner.name}`, 'info');
    } catch (err) {
      setPartners(prev => prev.filter(p => p.id !== partner.id));
      toast?.show(`Removed partner ${partner.name}`, 'info');
    }
  };

  // Factory Reset to Default Catalog & Clean Up Duplicates
  const handleResetToDefaults = async () => {
    const confirmed = window.confirm(
      'Reset all insurance partners to factory defaults?\n\n' +
      '• This will remove duplicate entries.\n' +
      '• Restore the standard 20 insurer list in original 1-to-20 priority order.\n' +
      '• Reset official redirection URLs.'
    );
    if (!confirmed) return;

    setResetting(true);
    try {
      const cleanList = await portalService.resetPartnersToDefault();
      if (Array.isArray(cleanList) && cleanList.length > 0) {
        setPartners(cleanList);
      } else {
        setPartners(DEFAULT_PARTNERS_FALLBACK);
      }
      toast?.show('Partner catalog successfully reset to 20 default insurers in clean order!', 'success');
    } catch (err) {
      console.warn('Backend reset failed, resetting local state to fallback catalog:', err);
      setPartners(DEFAULT_PARTNERS_FALLBACK);
      toast?.show('Catalog reset to 20 default partners (local state)', 'info');
    } finally {
      setResetting(false);
    }
  };

  // Native HTML5 Drag and Drop Handlers for Reordering
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = async (e, dropIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    // Clone and rearrange the partners array
    const updated = Array.from(partners);
    const [movedItem] = updated.splice(draggedIndex, 1);
    updated.splice(dropIndex, 0, movedItem);

    // Re-index displayOrder sequentially 1...N
    const reordered = updated.map((item, idx) => ({
      ...item,
      displayOrder: idx + 1
    }));

    // Optimistic UI update
    setPartners(reordered);
    setDraggedIndex(null);
    setDragOverIndex(null);

    toast?.show(`Reordered "${movedItem.name}" to position #${dropIndex + 1}`, 'success');

    // Persist new sequence in backend
    try {
      const orderedIds = reordered.map(p => p.id);
      await portalService.reorderPartners(orderedIds);
    } catch (err) {
      console.warn('Backend batch reorder sync error:', err);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Image Upload handler (converts user file to base64 data-URI)
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast?.show('Please select a valid image file (PNG, JPG, SVG, WebP).', 'error');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast?.show('Image size should be below 2MB for fast loading.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const base64Data = loadEvent.target.result;
      setFormData(prev => ({
        ...prev,
        logoUrl: base64Data,
        logoKey: '' // clear preset key when custom upload is selected
      }));
      toast?.show('Logo image uploaded successfully!', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.redirectUrl.trim()) {
      toast?.show('Partner Name and Redirect URL are required.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      if (editingPartner) {
        const updated = await portalService.updatePartner(editingPartner.id, formData);
        setPartners(prev => prev.map(p => p.id === editingPartner.id ? updated : p));
        toast?.show(`Updated ${updated.name} configuration successfully!`, 'success');
      } else {
        const created = await portalService.createPartner(formData);
        setPartners(prev => [...prev, created]);
        toast?.show(`Created ${created.name} partner successfully!`, 'success');
      }
      setModalOpen(false);
    } catch (err) {
      console.warn('API save error, saving locally in state:', err);
      if (editingPartner) {
        setPartners(prev => prev.map(p => p.id === editingPartner.id ? { ...p, ...formData } : p));
        toast?.show(`Updated ${formData.name}`, 'success');
      } else {
        const newPartner = { ...formData, id: Date.now() };
        setPartners(prev => [...prev, newPartner]);
        toast?.show(`Added ${formData.name}`, 'success');
      }
      setModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const resolvePartnerLogoSrc = (partner) => {
    if (partner.logoUrl) return partner.logoUrl;
    if (partner.logoKey && PARTNER_LOGO_MAP[partner.logoKey]) {
      return PARTNER_LOGO_MAP[partner.logoKey];
    }
    return PARTNER_LOGO_MAP.starHealthLogo;
  };

  const currentPreviewLogoSrc = formData.logoUrl 
    ? formData.logoUrl 
    : (formData.logoKey && PARTNER_LOGO_MAP[formData.logoKey] ? PARTNER_LOGO_MAP[formData.logoKey] : PARTNER_LOGO_MAP.starHealthLogo);

  const filtered = partners.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (p.redirectUrl && p.redirectUrl.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = categoryFilter === 'ALL' || p.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Top Action & Filter Bar */}
      <div style={{
        background: '#ffffff',
        borderRadius: '12px',
        padding: '1rem 1.25rem',
        border: '1px solid var(--crm-border-subtle, #e2e8f0)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        boxShadow: 'var(--shadow-sm)'
      }}>
        {/* Search & Category Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '280px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text"
              placeholder="Search partner by name or destination URL..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem 0.75rem 0.6rem 2.3rem',
                borderRadius: '8px',
                border: '1px solid var(--crm-border-subtle, #cbd5e1)',
                fontSize: '0.88rem',
                outline: 'none'
              }}
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{
              padding: '0.6rem 0.85rem',
              borderRadius: '8px',
              border: '1px solid var(--crm-border-subtle, #cbd5e1)',
              fontSize: '0.88rem',
              background: '#ffffff',
              color: 'var(--crm-text-primary, #1e293b)',
              fontWeight: 600,
              outline: 'none'
            }}
          >
            <option value="ALL">All Categories</option>
            <option value="health">Health Insurance</option>
            <option value="life">Life & Term Insurance</option>
            <option value="general">Motor & General</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <button
            onClick={fetchPartners}
            title="Refresh Partners"
            style={{
              padding: '0.6rem 0.8rem',
              borderRadius: '8px',
              border: '1px solid var(--crm-border-subtle, #cbd5e1)',
              background: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--crm-text-secondary, #475569)'
            }}
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>

          <button
            onClick={handleResetToDefaults}
            disabled={resetting}
            title="Restore default 20 partners and eliminate duplicate entries"
            style={{
              background: '#f8fafc',
              color: '#334155',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '0.6rem 0.95rem',
              fontSize: '0.85rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              cursor: resetting ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.borderColor = '#94a3b8'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
          >
            <RotateCcw size={15} color="#d97706" className={resetting ? 'animate-spin' : ''} />
            <span>{resetting ? 'Resetting...' : 'Reset to Defaults'}</span>
          </button>

          <button
            onClick={handleOpenCreate}
            style={{
              background: 'linear-gradient(135deg, var(--primary-navy, #0f2b48) 0%, var(--primary-navy-dark, #091a2c) 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '0.6rem 1.1rem',
              fontSize: '0.88rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(15, 43, 72, 0.2)'
            }}
          >
            <Plus size={16} />
            <span>Add Insurance Partner</span>
          </button>
        </div>
      </div>

      {/* Partners List Table */}
      <div style={{
        background: '#ffffff',
        borderRadius: '12px',
        border: '1px solid var(--crm-border-subtle, #e2e8f0)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)'
      }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: '3px solid #cbd5e1',
              borderTopColor: 'var(--accent-gold, #f59e0b)',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 1rem'
            }} />
            <p style={{ fontWeight: 600 }}>Loading insurance partner network...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            <Building2 size={36} color="#94a3b8" style={{ margin: '0 auto 0.75rem' }} />
            <h4 style={{ margin: '0 0 0.5rem', color: '#1e293b' }}>No Partners Found</h4>
            <p style={{ fontSize: '0.88rem' }}>No insurance partners match your filter criteria.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--crm-border-subtle, #e2e8f0)', color: '#475569', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <th style={{ padding: '0.85rem 1rem', width: '90px' }}>Reorder</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Partner Insurer</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Category</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Target Redirect URL</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((partner, index) => {
                  const logoSrc = resolvePartnerLogoSrc(partner);
                  const isBeingDragged = draggedIndex === index;
                  const isDropTarget = dragOverIndex === index && draggedIndex !== index;

                  return (
                    <tr 
                      key={partner.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDrop={(e) => handleDrop(e, index)}
                      onDragEnd={handleDragEnd}
                      style={{ 
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'all 0.15s ease',
                        cursor: 'grab',
                        background: isBeingDragged 
                          ? '#f1f5f9' 
                          : isDropTarget 
                            ? '#eff6ff' 
                            : 'transparent',
                        opacity: isBeingDragged ? 0.45 : 1,
                        outline: isDropTarget ? '2px dashed #3b82f6' : 'none'
                      }}
                      onMouseEnter={(e) => { if (!isBeingDragged && !isDropTarget) e.currentTarget.style.background = '#f8fafc'; }}
                      onMouseLeave={(e) => { if (!isBeingDragged && !isDropTarget) e.currentTarget.style.background = 'transparent'; }}
                    >
                      <td style={{ padding: '0.9rem 1rem', color: '#64748b' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span 
                            title="Drag to reorder sequence" 
                            style={{ 
                              color: '#94a3b8', 
                              cursor: 'grab', 
                              display: 'flex', 
                              alignItems: 'center',
                              padding: '2px'
                            }}
                          >
                            <GripVertical size={16} />
                          </span>
                          <span style={{ fontWeight: 800, fontSize: '0.86rem', color: '#0f2b48' }}>
                            #{partner.displayOrder ?? (index + 1)}
                          </span>
                        </div>
                      </td>

                      <td style={{ padding: '1rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '8px',
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            flexShrink: 0,
                            padding: '3px'
                          }}>
                            <img 
                              src={logoSrc} 
                              alt={partner.name} 
                              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
                            />
                          </div>
                          <div>
                            <div style={{ fontWeight: 800, color: 'var(--primary-navy, #0f2b48)', fontSize: '0.92rem' }}>
                              {partner.name}
                            </div>
                            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                              ID: {partner.id} {partner.logoKey ? `• Preset: ${partner.logoKey}` : (partner.logoUrl ? '• Custom Upload' : '')}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '1rem 1rem' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '999px',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          textTransform: 'capitalize',
                          background: partner.category === 'health' ? '#ecfdf5' : (partner.category === 'life' ? '#fdf2f8' : '#eff6ff'),
                          color: partner.category === 'health' ? '#059669' : (partner.category === 'life' ? '#db2777' : '#2563eb'),
                          border: `1px solid ${partner.category === 'health' ? '#a7f3d0' : (partner.category === 'life' ? '#fbcfe8' : '#bfdbfe')}`
                        }}>
                          {partner.category}
                        </span>
                      </td>

                      <td style={{ padding: '1rem 1rem', maxWidth: '280px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span style={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            color: '#334155',
                            fontSize: '0.84rem'
                          }}>
                            {partner.redirectUrl}
                          </span>
                          <a 
                            href={partner.redirectUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            title="Open live link"
                            style={{ color: '#0284c7', display: 'flex', alignItems: 'center' }}
                          >
                            <ExternalLink size={13} />
                          </a>
                        </div>
                      </td>

                      <td style={{ padding: '1rem 1rem' }}>
                        <button
                          onClick={() => handleToggleStatus(partner)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '0.25rem 0.65rem',
                            borderRadius: '999px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            border: 'none',
                            background: partner.isActive ? '#ecfdf5' : '#f1f5f9',
                            color: partner.isActive ? '#059669' : '#64748b'
                          }}
                        >
                          {partner.isActive ? (
                            <>
                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#059669' }} />
                              Active on Web
                            </>
                          ) : (
                            <>
                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#94a3b8' }} />
                              Hidden / Inactive
                            </>
                          )}
                        </button>
                      </td>

                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                          <button
                            onClick={() => handleOpenEdit(partner)}
                            title="Edit Configuration"
                            style={{
                              padding: '0.35rem 0.55rem',
                              borderRadius: '6px',
                              background: '#eff6ff',
                              color: '#2563eb',
                              border: '1px solid #bfdbfe',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            <Edit3 size={14} />
                          </button>

                          <button
                            onClick={() => handleDeletePartner(partner)}
                            title="Delete Partner"
                            style={{
                              padding: '0.35rem 0.55rem',
                              borderRadius: '6px',
                              background: '#fef2f2',
                              color: '#dc2626',
                              border: '1px solid #fecaca',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Partner Modal with Integrated Media Picker */}
      {modalOpen && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'none',
            WebkitBackdropFilter: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem'
          }}
          onClick={(e) => { if (e.target === e.currentTarget && !submitting) setModalOpen(false); }}
        >
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '560px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid var(--crm-border-subtle, #e2e8f0)',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div className="crm-modal-header" style={{
              background: '#ffffff',
              padding: '1.15rem 1.4rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid var(--crm-border-subtle, #e2e8f0)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'var(--crm-surface-hover, #f1f5f9)',
                  border: '1px solid var(--crm-border-subtle, #e2e8f0)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--crm-info, #0284c7)',
                  flexShrink: 0
                }}>
                  <Building2 size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--crm-text-primary, #0f2b48)', letterSpacing: '-0.2px' }}>
                    {editingPartner ? `Edit: ${editingPartner.name}` : 'Configure New Insurance Partner'}
                  </h3>
                  <div style={{ fontSize: '0.73rem', color: 'var(--crm-text-muted, #64748b)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{
                      fontWeight: 700,
                      color: editingPartner ? 'var(--crm-info, #0284c7)' : '#059669',
                      background: editingPartner ? 'var(--crm-info-bg, #eff6ff)' : '#ecfdf5',
                      padding: '0.1rem 0.45rem',
                      borderRadius: '999px',
                      fontSize: '0.66rem',
                      border: editingPartner ? '1px solid #bfdbfe' : '1px solid #a7f3d0'
                    }}>
                      {editingPartner ? 'Update Configuration' : 'New Direct Partner'}
                    </span>
                    <span>• Homepage Integration Catalog</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                disabled={submitting}
                className="crm-modal-close-btn"
                title="Close Modal"
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  color: '#64748b',
                  padding: '0.4rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form Scrollable Area */}
            <form onSubmit={handleSaveSubmit} style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              
              {/* Partner Name */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.35rem' }}>
                  Partner / Insurer Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Star Health Insurance"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Category & Order Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.35rem' }}>
                    Category <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.88rem',
                      outline: 'none',
                      background: '#ffffff'
                    }}
                  >
                    <option value="health">Health Insurance</option>
                    <option value="life">Life & Term Insurance</option>
                    <option value="general">Motor & General</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.35rem' }}>
                    Display Sequence Order
                  </label>
                  <input 
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value, 10) || 0 })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Redirect URL */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.35rem' }}>
                  Destination / Affiliate Redirect URL <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Globe size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input 
                    type="url"
                    required
                    placeholder="https://www.insurer.com/quote?agent=aadhiraksha"
                    value={formData.redirectUrl}
                    onChange={(e) => setFormData({ ...formData, redirectUrl: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.75rem 0.65rem 2.3rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                </div>
                <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.2rem', display: 'block' }}>
                  Visitors will be securely redirected to this URL after entering their inquiry.
                </span>
              </div>

              {/* MEDIA PICKER & UPLOADER SECTION */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ImageIcon size={16} color="var(--primary-navy, #0f2b48)" />
                    <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#1e293b' }}>
                      Partner Logo Selection
                    </span>
                  </div>

                  {/* Active Logo Thumbnail Preview */}
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '8px',
                    background: '#ffffff',
                    border: '1.5px solid var(--accent-gold, #f59e0b)',
                    padding: '3px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                  }}>
                    <img 
                      src={currentPreviewLogoSrc} 
                      alt="Logo preview" 
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
                    />
                  </div>
                </div>

                {/* Media Tab Bar */}
                <div style={{ display: 'flex', gap: '0.35rem', background: '#e2e8f0', padding: '3px', borderRadius: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setActiveLogoTab('gallery')}
                    style={{
                      flex: 1,
                      padding: '0.4rem 0.5rem',
                      borderRadius: '6px',
                      border: 'none',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      background: activeLogoTab === 'gallery' ? '#ffffff' : 'transparent',
                      color: activeLogoTab === 'gallery' ? '#0f2b48' : '#64748b',
                      boxShadow: activeLogoTab === 'gallery' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                    }}
                  >
                    Preset Gallery (20)
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveLogoTab('upload')}
                    style={{
                      flex: 1,
                      padding: '0.4rem 0.5rem',
                      borderRadius: '6px',
                      border: 'none',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      background: activeLogoTab === 'upload' ? '#ffffff' : 'transparent',
                      color: activeLogoTab === 'upload' ? '#0f2b48' : '#64748b',
                      boxShadow: activeLogoTab === 'upload' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                    }}
                  >
                    Upload File
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveLogoTab('url')}
                    style={{
                      flex: 1,
                      padding: '0.4rem 0.5rem',
                      borderRadius: '6px',
                      border: 'none',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      background: activeLogoTab === 'url' ? '#ffffff' : 'transparent',
                      color: activeLogoTab === 'url' ? '#0f2b48' : '#64748b',
                      boxShadow: activeLogoTab === 'url' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                    }}
                  >
                    Custom CDN URL
                  </button>
                </div>

                {/* Tab 1: Preset Gallery Picker */}
                {activeLogoTab === 'gallery' && (
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '0.4rem' }}>
                      Click on any official insurer logo to select:
                    </div>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(5, 1fr)',
                      gap: '0.4rem',
                      maxHeight: '150px',
                      overflowY: 'auto',
                      padding: '4px',
                      background: '#ffffff',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1'
                    }}>
                      {PARTNER_ASSET_GALLERY.map((item) => {
                        const isSelected = formData.logoKey === item.key && !formData.logoUrl;
                        return (
                          <div
                            key={item.key}
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                logoKey: item.key,
                                logoUrl: '' // clear custom URL
                              }));
                            }}
                            title={item.name}
                            style={{
                              aspectRatio: '1',
                              padding: '4px',
                              borderRadius: '6px',
                              border: isSelected ? '2px solid #059669' : '1px solid #e2e8f0',
                              background: isSelected ? '#ecfdf5' : '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              position: 'relative'
                            }}
                          >
                            <img src={item.src} alt={item.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                            {isSelected && (
                              <CheckCircle2 size={12} color="#059669" style={{ position: 'absolute', top: '2px', right: '2px' }} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Tab 2: File Upload / Dropzone */}
                {activeLogoTab === 'upload' && (
                  <div>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileUpload} 
                      accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml"
                      style={{ display: 'none' }}
                    />
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        border: '2px dashed #cbd5e1',
                        borderRadius: '8px',
                        padding: '1.25rem 1rem',
                        textAlign: 'center',
                        background: '#ffffff',
                        cursor: 'pointer',
                        transition: 'border-color 0.15s ease'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary-navy, #0f2b48)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; }}
                    >
                      <Upload size={22} color="#64748b" style={{ margin: '0 auto 0.4rem' }} />
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e293b' }}>
                        Click to browse or drop partner logo file
                      </div>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                        Supports PNG, JPG, WebP, SVG (Max 2MB)
                      </span>
                    </div>
                  </div>
                )}

                {/* Tab 3: Custom CDN Link */}
                {activeLogoTab === 'url' && (
                  <div>
                    <div style={{ position: 'relative' }}>
                      <Globe size={15} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                      <input 
                        type="url"
                        placeholder="https://cdn.example.com/insurer-logo.png"
                        value={formData.logoUrl}
                        onChange={(e) => setFormData(prev => ({ ...prev, logoUrl: e.target.value, logoKey: '' }))}
                        style={{
                          width: '100%',
                          padding: '0.55rem 0.75rem 0.55rem 2rem',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.85rem',
                          outline: 'none',
                          background: '#ffffff'
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Active Toggle Checkbox */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <input 
                  type="checkbox"
                  id="isActivePartner"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  style={{ width: '16px', height: '16px', accentColor: '#059669', cursor: 'pointer' }}
                />
                <label htmlFor="isActivePartner" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b', cursor: 'pointer' }}>
                  Active & Displayed on Public Homepage Grid
                </label>
              </div>

              {/* Submit / Cancel Footer */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={submitting}
                  style={{
                    padding: '0.65rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
                    color: '#475569',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: '0.65rem 1.25rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, var(--accent-gold, #f59e0b) 0%, var(--accent-gold-hover, #d97706) 100%)',
                    color: '#ffffff',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    boxShadow: '0 2px 6px rgba(245, 158, 11, 0.35)'
                  }}
                >
                  {submitting ? 'Saving Configuration...' : (editingPartner ? 'Save Changes' : 'Create Partner')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
