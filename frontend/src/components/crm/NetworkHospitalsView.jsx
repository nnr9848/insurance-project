import React, { useState } from 'react';
import { 
  Building2, 
  Search, 
  Plus, 
  Upload, 
  CheckCircle2, 
  Download, 
  AlertCircle, 
  X,
  Edit3,
  Trash2,
  Phone,
  MapPin,
  ExternalLink,
  MoreVertical,
  RefreshCw
} from 'lucide-react';
import ActionDropdown from '../common/ActionDropdown';
import { portalService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { getHospitalPhoto, getHospitalBrandMeta } from '../../utils/hospitalAssetCatalog';

export default function NetworkHospitalsView({
  hospitals = [],
  setHospitals,
  readOnly = false
}) {
  const toast = useToast();
  const [hospSearch, setHospSearch] = useState('');
  const [hospCityFilter, setHospCityFilter] = useState('');

  // Modals state
  const [showAddHospitalModal, setShowAddHospitalModal] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [editingHospital, setEditingHospital] = useState(null);

  // New Hospital Form
  const [newHospital, setNewHospital] = useState({
    hospitalName: '',
    state: '',
    city: '',
    address: '',
    pincode: '',
    contactNumber: '',
    secondaryPhone: '',
    photoUrl: '',
    specialties: '',
    cashlessAvailable: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Bulk Upload state
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkParsedData, setBulkParsedData] = useState([]);
  const [bulkError, setBulkError] = useState('');

  // Hospital Handlers
  const handleCreateHospital = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const created = await portalService.createHospital(newHospital);
      setHospitals((prev) => [created, ...prev]);
      setShowAddHospitalModal(false);
      setNewHospital({
        hospitalName: '',
        state: '',
        city: '',
        address: '',
        pincode: '',
        contactNumber: '',
        secondaryPhone: '',
        photoUrl: '',
        specialties: '',
        cashlessAvailable: true
      });
      toast.success('Hospital added to network directory successfully!');
    } catch (err) {
      console.error('Error adding hospital', err);
      toast.error('Failed to add hospital: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleHospitalStatus = async (id, name, currentlyActive) => {
    try {
      await portalService.deleteHospital(id);
      setHospitals((prev) =>
        prev.map((h) => (h.id === id ? { ...h, isActive: !currentlyActive } : h))
      );
      toast.success(
        currentlyActive
          ? `"${name}" deactivated.`
          : `"${name}" restored to network.`
      );
    } catch (err) {
      console.error('Error toggling hospital status', err);
      toast.error('Failed to update hospital status: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleUpdateHospital = async (e) => {
    e.preventDefault();
    if (!editingHospital) return;
    setIsSubmitting(true);
    try {
      const updated = await portalService.updateHospital(editingHospital.id, editingHospital);
      setHospitals((prev) =>
        prev.map((h) => (h.id === updated.id ? updated : h))
      );
      setEditingHospital(null);
      toast.success(`Hospital "${updated.hospitalName}" updated successfully!`);
    } catch (err) {
      console.error('Error updating hospital', err);
      toast.error('Failed to update hospital: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setBulkFile(file);
    setBulkError('');

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(text);
          if (!Array.isArray(parsed)) throw new Error('JSON file must contain an array of hospital objects.');
          setBulkParsedData(parsed);
        } else if (file.name.endsWith('.csv')) {
          const lines = text.split('\n').filter((l) => l.trim().length > 0);
          if (lines.length < 2) throw new Error('CSV must have a header row and at least 1 data row.');
          const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
          const records = [];
          for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map((v) => v.trim().replace(/^"|"$/g, ''));
            const obj = {};
            headers.forEach((h, idx) => {
              obj[h] = values[idx] || '';
            });
            if (obj.cashlessAvailable !== undefined) {
              obj.cashlessAvailable = String(obj.cashlessAvailable).toLowerCase() === 'true';
            }
            records.push(obj);
          }
          setBulkParsedData(records);
        }
      } catch (err) {
        setBulkError('Failed to parse file: ' + err.message);
        setBulkParsedData([]);
      }
    };
    reader.readAsText(file);
  };

  const handleSaveBulkHospitals = async () => {
    if (!bulkParsedData.length) return;
    setIsSubmitting(true);
    try {
      const saved = await portalService.bulkUploadHospitals(bulkParsedData);
      setHospitals((prev) => [...saved, ...prev]);
      setShowBulkUploadModal(false);
      setBulkParsedData([]);
      setBulkFile(null);
      toast.success(`Successfully uploaded ${saved.length} hospitals to directory!`);
    } catch (err) {
      console.error('Bulk upload error', err);
      toast.error('Bulk upload failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadSampleCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'hospitalName,state,city,address,pincode,contactNumber,specialties,cashlessAvailable\n' +
      'Apollo Speciality Hospital,Karnataka,Bangalore,154/11 Bannerghatta Road,560076,+91 80 2630 4050,"Cardiology, Oncology, Orthopedics",true\n' +
      'Manipal Hospital,Karnataka,Bangalore,98 HAL Old Airport Road,560017,+91 80 2502 4444,"Multispeciality, 24/7 Emergency, Neuro",true\n' +
      'Fortis Memorial Research Institute,Haryana,Gurgaon,Sector 44 Opp HUDA City Centre,122002,+91 124 4962200,"Organ Transplant, Cardiac, Trauma",true';
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'aadhiraksha_network_hospitals_sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredHospitals = hospitals.filter((h) => {
    const matchesSearch =
      !hospSearch ||
      h.hospitalName?.toLowerCase().includes(hospSearch.toLowerCase()) ||
      h.city?.toLowerCase().includes(hospSearch.toLowerCase()) ||
      h.specialties?.toLowerCase().includes(hospSearch.toLowerCase());
    const matchesCity = !hospCityFilter || h.city === hospCityFilter;
    return matchesSearch && matchesCity;
  });

  const hospitalCities = [...new Set(hospitals.map((h) => h.city).filter(Boolean))].sort();

  return (
    <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      {/* Hospital Management Toolbar */}
      <div style={{ padding: '1.25rem 1.5rem', background: '#f0fdf4', borderBottom: '1px solid #bbf7d0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <form
            role="search"
            onSubmit={(e) => e.preventDefault()}
            style={{ position: 'relative', width: '240px', margin: 0 }}
          >
            <input
              type="search"
              name="hospital-search-input"
              id="hospital-search-input"
              autoComplete="search"
              data-lpignore="true"
              data-form-type="other"
              placeholder="Search hospital name..."
              className="form-input"
              value={hospSearch}
              onChange={(e) => setHospSearch(e.target.value)}
              style={{ paddingLeft: '2.2rem', paddingRight: '0.75rem', height: '38px', fontSize: '0.85rem', width: '100%' }}
            />
            <Search size={15} color="#64748b" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
          </form>

          <select
            className="form-select"
            value={hospCityFilter}
            onChange={(e) => setHospCityFilter(e.target.value)}
            style={{ height: '38px', fontSize: '0.85rem', width: '160px' }}
          >
            <option value="">All Cities ({hospitalCities.length})</option>
            {hospitalCities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        {!readOnly && (
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowAddHospitalModal(true)}
              style={{
                background: '#059669',
                color: '#fff',
                border: 'none',
                padding: '0.55rem 1rem',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.85rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                cursor: 'pointer'
              }}
            >
              <Plus size={16} /> Add Single Hospital
            </button>
            <button
              onClick={() => setShowBulkUploadModal(true)}
              style={{
                background: '#0f2b48',
                color: '#fff',
                border: 'none',
                padding: '0.55rem 1rem',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.85rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                cursor: 'pointer'
              }}
            >
              <Upload size={16} /> Bulk Upload (CSV/JSON)
            </button>
          </div>
        )}
      </div>

      {/* Hospitals Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <tr>
              <th style={{ padding: '1rem' }}>Hospital Name & Status</th>
              <th style={{ padding: '1rem' }}>State & City</th>
              <th style={{ padding: '1rem' }}>Complete Address</th>
              <th style={{ padding: '1rem' }}>Phone Lines</th>
              <th style={{ padding: '1rem' }}>Specialties</th>
              {!readOnly && <th style={{ padding: '1rem', textAlign: 'center' }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filteredHospitals.length === 0 ? (
              <tr>
                <td colSpan={readOnly ? 5 : 6} style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                  <Building2 size={36} color="#94a3b8" style={{ margin: '0 auto 0.5rem' }} />
                  <div>No hospitals match your search criteria.</div>
                  <button
                    onClick={() => { setHospSearch(''); setHospCityFilter(''); }}
                    style={{ marginTop: '0.5rem', background: 'none', border: 'none', color: '#059669', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Reset filters
                  </button>
                </td>
              </tr>
            ) : (
              filteredHospitals.map((hosp) => {
                const photoUrl = getHospitalPhoto(hosp);
                const brandMeta = getHospitalBrandMeta(hosp);
                return (
                <tr key={hosp.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '1rem', verticalAlign: 'middle' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img
                        src={photoUrl}
                        alt={hosp.hospitalName}
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '8px',
                          objectFit: 'cover',
                          border: '1.5px solid #e2e8f0',
                          flexShrink: 0,
                          background: '#f8fafc'
                        }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=120&h=120&q=80';
                        }}
                      />
                      <div>
                        <div style={{ fontWeight: 700, color: '#091726', fontSize: '0.9rem', lineHeight: 1.3 }}>
                          {hosp.hospitalName}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                          {hosp.cashlessAvailable ? (
                            <span style={{
                              background: '#dcfce7',
                              color: '#15803d',
                              padding: '0.12rem 0.45rem',
                              borderRadius: '9999px',
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.2rem'
                            }}>
                              <CheckCircle2 size={11} /> Cashless
                            </span>
                          ) : (
                            <span style={{
                              background: '#fee2e2',
                              color: '#b91c1c',
                              padding: '0.12rem 0.45rem',
                              borderRadius: '9999px',
                              fontSize: '0.68rem',
                              fontWeight: 700
                            }}>
                              Reimbursement
                            </span>
                          )}
                          <span style={{
                            background: '#f1f5f9',
                            color: brandMeta.brandColor,
                            padding: '0.12rem 0.45rem',
                            borderRadius: '4px',
                            fontSize: '0.68rem',
                            fontWeight: 700
                          }}>
                            {brandMeta.badgeText}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem', verticalAlign: 'middle' }}>
                    <span style={{ fontWeight: 600 }}>{hosp.city}</span>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{hosp.state}</div>
                  </td>
                  <td style={{ padding: '1rem', verticalAlign: 'middle', fontSize: '0.82rem', color: '#475569', maxWidth: '240px' }}>
                    {hosp.address} {hosp.pincode && ` - ${hosp.pincode}`}
                  </td>
                  <td style={{ padding: '1rem', verticalAlign: 'middle' }}>
                    {/* Primary Phone (Public) */}
                    <div style={{ marginBottom: hosp.secondaryPhone ? '0.35rem' : '0' }}>
                      <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                        Primary / Helpdesk
                      </div>
                      <a href={`tel:${hosp.contactNumber}`} style={{ color: '#091726', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none' }}>
                        {hosp.contactNumber || '-'}
                      </a>
                    </div>

                    {/* Secondary / Emergency Phone (Dashboard Only) */}
                    {hosp.secondaryPhone && (
                      <div style={{
                        background: '#fef2f2',
                        border: '1px solid #fee2e2',
                        padding: '3px 6px',
                        borderRadius: '6px',
                        display: 'inline-block'
                      }}>
                        <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#dc2626', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <span>🚨</span> EMERGENCY 24/7
                        </div>
                        <a href={`tel:${hosp.secondaryPhone}`} style={{ color: '#b91c1c', fontWeight: 700, fontSize: '0.82rem', textDecoration: 'none' }}>
                          {hosp.secondaryPhone}
                        </a>
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '1rem', verticalAlign: 'middle', fontSize: '0.78rem', color: '#64748b', maxWidth: '180px' }}>
                    {hosp.specialties || '-'}
                  </td>
                  {!readOnly && (
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', verticalAlign: 'middle' }}>
                      <ActionDropdown
                        menuWidth="240px"
                        trigger={({ isOpen }) => (
                          <button
                            type="button"
                            title="Hospital Actions"
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              border: '1px solid #e2e8f0',
                              background: isOpen ? '#f1f5f9' : '#ffffff',
                              color: '#475569',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                            onMouseLeave={(e) => { if (!isOpen) { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.borderColor = '#e2e8f0'; } }}
                          >
                            <MoreVertical size={16} />
                          </button>
                        )}
                      >
                        {({ close }) => (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                close();
                                setEditingHospital({ ...hosp });
                              }}
                              className="crm-popover-btn"
                            >
                              <Edit3 size={14} color="#2563eb" /> Edit Hospital Details
                            </button>

                            {hosp.contactNumber && (
                              <a
                                href={`tel:${hosp.contactNumber}`}
                                onClick={() => close()}
                                className="crm-popover-btn"
                                style={{ textDecoration: 'none', color: 'inherit' }}
                              >
                                <Phone size={14} color="#059669" /> Call Primary Desk ({hosp.contactNumber})
                              </a>
                            )}

                            {hosp.secondaryPhone && (
                              <a
                                href={`tel:${hosp.secondaryPhone}`}
                                onClick={() => close()}
                                className="crm-popover-btn"
                                style={{ textDecoration: 'none', color: '#dc2626', fontWeight: 600 }}
                              >
                                <Phone size={14} color="#dc2626" /> Call Emergency Desk ({hosp.secondaryPhone})
                              </a>
                            )}

                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${hosp.hospitalName}, ${hosp.address}, ${hosp.city}`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => close()}
                              className="crm-popover-btn"
                              style={{ textDecoration: 'none', color: 'inherit' }}
                            >
                              <MapPin size={14} color="#0284c7" /> Open in Google Maps
                            </a>

                            <div style={{ height: '1px', background: 'var(--crm-border-subtle, #f1f5f9)', margin: '4px 0' }} />

                            <button
                              type="button"
                              onClick={() => {
                                close();
                                handleToggleHospitalStatus(hosp.id, hosp.hospitalName, hosp.isActive !== false);
                              }}
                              className={`crm-popover-btn ${hosp.isActive !== false ? 'danger' : ''}`}
                            >
                              <RefreshCw size={14} color={hosp.isActive !== false ? '#dc2626' : '#059669'} /> 
                              {hosp.isActive !== false ? 'Deactivate from Network' : 'Restore to Active Network'}
                            </button>
                          </>
                        )}
                      </ActionDropdown>
                    </td>
                  )}
                </tr>
              );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL 1: Add Single Hospital */}
      {showAddHospitalModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1050,
          padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '560px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '2rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building2 size={22} color="#059669" />
                <h2 style={{ fontSize: '1.25rem', color: '#091726' }}>Add Empanelled Hospital</h2>
              </div>
              <button 
                onClick={() => setShowAddHospitalModal(false)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateHospital}>
              <div className="form-group">
                <label className="form-label">Hospital Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apollo Speciality Hospital"
                  className="form-input"
                  value={newHospital.hospitalName}
                  onChange={(e) => setNewHospital({ ...newHospital, hospitalName: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">State *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Karnataka"
                    className="form-input"
                    value={newHospital.state}
                    onChange={(e) => setNewHospital({ ...newHospital, state: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">City / District *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bangalore"
                    className="form-input"
                    value={newHospital.city}
                    onChange={(e) => setNewHospital({ ...newHospital, city: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Complete Street Address *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. 154/11 Bannerghatta Road, Opp IIM"
                  className="form-input"
                  value={newHospital.address}
                  onChange={(e) => setNewHospital({ ...newHospital, address: e.target.value })}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Hospital Photo / Logo URL (Optional)</label>
                <input
                  type="url"
                  placeholder="e.g. https://images.unsplash.com/... (Leave empty for auto-brand logo)"
                  className="form-input"
                  value={newHospital.photoUrl || ''}
                  onChange={(e) => setNewHospital({ ...newHospital, photoUrl: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Pincode</label>
                  <input
                    type="text"
                    placeholder="e.g. 560076"
                    className="form-input"
                    value={newHospital.pincode}
                    onChange={(e) => setNewHospital({ ...newHospital, pincode: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Primary Contact / Helpdesk (Public)</label>
                  <input
                    type="text"
                    placeholder="e.g. +91 80 2630 4050"
                    className="form-input"
                    value={newHospital.contactNumber}
                    onChange={(e) => setNewHospital({ ...newHospital, contactNumber: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>🚨 Emergency / 24x7 TPA Desk</span>
                  <span style={{ fontSize: '0.7rem', color: '#dc2626', background: '#fef2f2', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                    Internal CRM Only
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. +91 80 2630 4099 (Confidential, hidden from general public)"
                  className="form-input"
                  value={newHospital.secondaryPhone || ''}
                  onChange={(e) => setNewHospital({ ...newHospital, secondaryPhone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Specialties / Departments</label>
                <input
                  type="text"
                  placeholder="e.g. Cardiology, Oncology, Orthopedics, 24/7 Trauma"
                  className="form-input"
                  value={newHospital.specialties}
                  onChange={(e) => setNewHospital({ ...newHospital, specialties: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', background: '#f0fdf4', padding: '0.75rem 1rem', borderRadius: '8px' }}>
                <input
                  type="checkbox"
                  id="cashlessCheck"
                  checked={newHospital.cashlessAvailable}
                  onChange={(e) => setNewHospital({ ...newHospital, cashlessAvailable: e.target.checked })}
                  style={{ width: '18px', height: '18px', accentColor: '#059669' }}
                />
                <label htmlFor="cashlessCheck" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#065f46', cursor: 'pointer' }}>
                  Enable Instant Cashless Claim Facility for this hospital
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setShowAddHospitalModal(false)}
                  style={{ padding: '0.6rem 1.25rem', background: '#f1f5f9', border: 'none', borderRadius: '8px', fontWeight: 600, color: '#64748b', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ padding: '0.6rem 1.25rem', background: '#059669', border: 'none', borderRadius: '8px', fontWeight: 700, color: '#fff', cursor: 'pointer' }}
                >
                  {isSubmitting ? 'Saving Hospital...' : 'Add to Directory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Bulk CSV / JSON Upload */}
      {showBulkUploadModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1050,
          padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '620px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '2rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Upload size={22} color="#0f2b48" />
                <h2 style={{ fontSize: '1.25rem', color: '#091726' }}>Bulk Upload Network Hospitals</h2>
              </div>
              <button 
                onClick={() => { setShowBulkUploadModal(false); setBulkParsedData([]); setBulkFile(null); setBulkError(''); }}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: '1.25rem', background: '#eff6ff', padding: '1rem', borderRadius: '10px', border: '1px solid #bfdbfe' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e40af' }}>Download Ready CSV Template</div>
                  <div style={{ fontSize: '0.78rem', color: '#3b82f6', marginTop: '0.2rem' }}>
                    Columns: hospitalName, state, city, address, pincode, contactNumber, specialties, cashlessAvailable
                  </div>
                </div>
                <button
                  type="button"
                  onClick={downloadSampleCSV}
                  style={{
                    background: '#2563eb',
                    color: '#fff',
                    border: 'none',
                    padding: '0.4rem 0.8rem',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    cursor: 'pointer'
                  }}
                >
                  <Download size={13} /> Sample CSV
                </button>
              </div>
            </div>

            {/* File Upload Box */}
            <div style={{
              border: '2px dashed #cbd5e1',
              borderRadius: '12px',
              padding: '2rem 1.5rem',
              textAlign: 'center',
              background: '#f8fafc',
              cursor: 'pointer',
              marginBottom: '1.5rem'
            }}>
              <Upload size={32} color="#64748b" style={{ margin: '0 auto 0.75rem' }} />
              <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#091726' }}>
                Select a CSV or JSON file from your computer
              </div>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.35rem 0 1rem' }}>
                Supports hundreds of empanelled hospital centers in one click.
              </p>
              <input
                type="file"
                accept=".csv, .json"
                onChange={handleBulkFileChange}
                style={{ fontSize: '0.85rem' }}
              />
            </div>

            {bulkError && (
              <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={16} />
                <span>{bulkError}</span>
              </div>
            )}

            {bulkParsedData.length > 0 && (
              <div style={{ marginBottom: '1.5rem', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '1rem', borderRadius: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#15803d', fontWeight: 700, fontSize: '0.9rem' }}>
                  <CheckCircle2 size={16} /> Validated {bulkParsedData.length} Hospitals Ready For Import
                </div>
                <div style={{ fontSize: '0.78rem', color: '#166534', marginTop: '0.25rem' }}>
                  First record preview: <strong>{bulkParsedData[0]?.hospitalName}</strong> ({bulkParsedData[0]?.city}, {bulkParsedData[0]?.state})
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => { setShowBulkUploadModal(false); setBulkParsedData([]); setBulkFile(null); setBulkError(''); }}
                style={{ padding: '0.6rem 1.25rem', background: '#f1f5f9', border: 'none', borderRadius: '8px', fontWeight: 600, color: '#64748b', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting || bulkParsedData.length === 0}
                onClick={handleSaveBulkHospitals}
                style={{
                  padding: '0.6rem 1.25rem',
                  background: bulkParsedData.length > 0 ? '#0f2b48' : '#cbd5e1',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 700,
                  color: '#fff',
                  cursor: bulkParsedData.length > 0 ? 'pointer' : 'not-allowed'
                }}
              >
                {isSubmitting ? 'Uploading Data...' : `Import ${bulkParsedData.length} Records`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Edit Hospital Details */}
      {editingHospital && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1050,
          padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '560px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '2rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Edit3 size={20} color="#2563eb" />
                <h2 style={{ fontSize: '1.25rem', color: '#091726', margin: 0, fontWeight: 800 }}>Edit Network Hospital</h2>
              </div>
              <button 
                onClick={() => setEditingHospital(null)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateHospital}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Hospital Name *
                </label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={editingHospital.hospitalName}
                  onChange={(e) => setEditingHospital({ ...editingHospital, hospitalName: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={editingHospital.state}
                    onChange={(e) => setEditingHospital({ ...editingHospital, state: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    City / District *
                  </label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={editingHospital.city}
                    onChange={(e) => setEditingHospital({ ...editingHospital, city: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Complete Street Address *
                </label>
                <textarea
                  required
                  rows={2}
                  className="form-input"
                  value={editingHospital.address}
                  onChange={(e) => setEditingHospital({ ...editingHospital, address: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Hospital Photo / Logo URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="e.g. https://images.unsplash.com/... (Leave empty for auto-brand logo)"
                  className="form-input"
                  value={editingHospital.photoUrl || ''}
                  onChange={(e) => setEditingHospital({ ...editingHospital, photoUrl: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Pincode
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={editingHospital.pincode || ''}
                    onChange={(e) => setEditingHospital({ ...editingHospital, pincode: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Primary Contact / Helpdesk (Public)
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={editingHospital.contactNumber || ''}
                    onChange={(e) => setEditingHospital({ ...editingHospital, contactNumber: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  <span>🚨 Emergency / 24x7 TPA Desk</span>
                  <span style={{ fontSize: '0.7rem', color: '#dc2626', background: '#fef2f2', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                    Internal CRM Only
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. +91 80 2630 4099 (Confidential, hidden from general public)"
                  className="form-input"
                  value={editingHospital.secondaryPhone || ''}
                  onChange={(e) => setEditingHospital({ ...editingHospital, secondaryPhone: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Specialties (Comma Separated)
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={editingHospital.specialties || ''}
                  onChange={(e) => setEditingHospital({ ...editingHospital, specialties: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="editCashlessAvailable"
                  checked={editingHospital.cashlessAvailable !== false}
                  onChange={(e) => setEditingHospital({ ...editingHospital, cashlessAvailable: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="editCashlessAvailable" style={{ fontSize: '0.85rem', color: '#091726', fontWeight: 600, cursor: 'pointer' }}>
                  Empanelled for 100% Cashless Hospitalization Facility
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setEditingHospital(null)}
                  style={{ padding: '0.6rem 1.25rem', background: '#f1f5f9', border: 'none', borderRadius: '8px', fontWeight: 600, color: '#64748b', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ padding: '0.6rem 1.5rem', background: '#2563eb', border: 'none', borderRadius: '8px', fontWeight: 700, color: '#fff', cursor: 'pointer' }}
                >
                  {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
