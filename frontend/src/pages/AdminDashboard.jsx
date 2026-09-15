import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  FileText, 
  Crosshair, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  TrendingUp, 
  Search, 
  Building2, 
  Phone, 
  Mail, 
  Filter,
  Plus,
  Upload,
  Trash2,
  Download,
  AlertCircle,
  X,
  MapPin
} from 'lucide-react';
import { portalService } from '../services/api';

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('quotes'); // 'quotes', 'posp', 'claims', 'hospitals'
  const [quotes, setQuotes] = useState([]);
  const [pospList, setPospList] = useState([]);
  const [claims, setClaims] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Hospital filters & search
  const [hospSearch, setHospSearch] = useState('');
  const [hospCityFilter, setHospCityFilter] = useState('');

  // Modals state
  const [showAddHospitalModal, setShowAddHospitalModal] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Single Hospital Form State
  const [newHospital, setNewHospital] = useState({
    hospitalName: '',
    state: 'Karnataka',
    city: '',
    address: '',
    pincode: '',
    contactNumber: '',
    specialties: 'Multi-Specialty, Cardiology, Orthopedics, Emergency 24/7',
    cashlessAvailable: true,
    latitude: null,
    longitude: null
  });

  // Bulk Upload State
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkParsedData, setBulkParsedData] = useState([]);
  const [bulkError, setBulkError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadData();
  }, [isAuthenticated]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [qData, pData, cData, hData] = await Promise.all([
        portalService.getAdminQuotes().catch(() => []),
        portalService.getAdminPOSP().catch(() => []),
        portalService.getAdminClaims().catch(() => []),
        portalService.searchHospitals('', '').catch(() => [])
      ]);
      setQuotes(qData || []);
      setPospList(pData || []);
      setClaims(cData || []);
      setHospitals(hData || []);
    } catch (err) {
      console.error('Error fetching admin datasets', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePOSP = async (id, status) => {
    try {
      await portalService.updatePOSPStatus(id, status);
      loadData();
    } catch (err) {
      alert('Failed to update POSP status');
    }
  };

  // Hospital Handlers
  const handleCreateHospital = async (e) => {
    e.preventDefault();
    if (!newHospital.hospitalName || !newHospital.city || !newHospital.address) {
      alert('Please fill in required hospital fields (Name, City, Address).');
      return;
    }
    setIsSubmitting(true);
    try {
      await portalService.createHospital(newHospital);
      setShowAddHospitalModal(false);
      setNewHospital({
        hospitalName: '',
        state: 'Karnataka',
        city: '',
        address: '',
        pincode: '',
        contactNumber: '',
        specialties: 'Multi-Specialty, Cardiology, Orthopedics, Emergency 24/7',
        cashlessAvailable: true,
        latitude: null,
        longitude: null
      });
      loadData();
      alert('Hospital added successfully to cashless network!');
    } catch (err) {
      console.error('Error creating hospital', err);
      alert('Failed to add hospital: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteHospital = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove "${name}" from the network directory?`)) {
      return;
    }
    try {
      await portalService.deleteHospital(id);
      setHospitals(prev => prev.filter(h => h.id !== id));
    } catch (err) {
      console.error('Error deleting hospital', err);
      alert('Failed to delete hospital: ' + (err.response?.data?.message || err.message));
    }
  };

  // Bulk File Parsing
  const handleBulkFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBulkFile(file);
    setBulkError('');

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result;
        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed)) {
            setBulkParsedData(parsed);
          } else {
            setBulkError('JSON file must contain an array of hospital objects.');
          }
        } else {
          // CSV Parser
          const lines = text.split(/\r\n|\n/).filter(line => line.trim() !== '');
          if (lines.length < 2) {
            setBulkError('CSV file must have a header row and at least 1 data row.');
            return;
          }
          const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/[^a-z0-9]/g, ''));
          
          const records = [];
          for (let i = 1; i < lines.length; i++) {
            // Basic CSV row splitter handling quotes
            const row = lines[i].split(',').map(cell => cell.trim().replace(/^["']|["']$/g, ''));
            if (row.length >= 3 && row[0]) {
              records.push({
                hospitalName: row[0] || 'Hospital',
                state: row[1] || 'Karnataka',
                city: row[2] || 'Bangalore',
                address: row[3] || row[0],
                pincode: row[4] || '560001',
                contactNumber: row[5] || '+91 8367415156',
                specialties: row[6] || 'General & Multi-Specialty',
                cashlessAvailable: row[7] ? row[7].toLowerCase() === 'true' || row[7] === '1' || row[7].toLowerCase() === 'yes' : true
              });
            }
          }
          if (records.length === 0) {
            setBulkError('Could not find valid hospital rows in CSV.');
          } else {
            setBulkParsedData(records);
          }
        }
      } catch (err) {
        setBulkError('Failed to parse file: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleSaveBulkHospitals = async () => {
    if (bulkParsedData.length === 0) {
      alert('No parsed hospital records to upload.');
      return;
    }
    setIsSubmitting(true);
    try {
      await portalService.createHospitalsBulk(bulkParsedData);
      setShowBulkUploadModal(false);
      setBulkFile(null);
      setBulkParsedData([]);
      loadData();
      alert(`Successfully imported ${bulkParsedData.length} network hospitals!`);
    } catch (err) {
      console.error('Error importing bulk hospitals', err);
      alert('Bulk import failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadSampleCSV = () => {
    const sample = `hospitalName,state,city,address,pincode,contactNumber,specialties,cashlessAvailable
Apollo Hospitals,Karnataka,Bangalore,"154/11 Bannerghatta Road, Opp IIM",560076,+91 80 2630 4050,"Cardiology, Oncology, Orthopedics, Emergency 24/7",true
Manipal Hospital,Karnataka,Bangalore,"98 HAL Airport Road, Kodihalli",560017,+91 80 2502 4444,"Multi-Specialty, Neuro, Organ Transplant, 24/7 Trauma",true
Fortis Hospital,Maharashtra,Mumbai,"Mulund Goregaon Link Road, Mulund West",400078,+91 22 4365 4365,"Cardiac Care, Emergency, Critical Care",true`;
    const blob = new Blob([sample], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'aadhiraksha_network_hospitals_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filtered hospitals
  const filteredHospitals = hospitals.filter(h => {
    const matchesSearch = !hospSearch || 
      h.hospitalName.toLowerCase().includes(hospSearch.toLowerCase()) ||
      (h.specialties && h.specialties.toLowerCase().includes(hospSearch.toLowerCase())) ||
      (h.address && h.address.toLowerCase().includes(hospSearch.toLowerCase()));
    const matchesCity = !hospCityFilter || h.city.toLowerCase() === hospCityFilter.toLowerCase();
    return matchesSearch && matchesCity;
  });

  const uniqueCities = Array.from(new Set(hospitals.map(h => h.city))).filter(Boolean).sort();

  return (
    <div style={{ padding: '3rem 0', background: '#f8fafc', minHeight: '85vh' }}>
      <div className="container">
        {/* Dashboard Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="section-badge">Management Console</span>
            <h1 style={{ fontSize: '2rem', color: 'var(--primary-navy)' }}>
              Aadhiraksha Operations & Leads Portal
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Real-time monitoring of customer inquiries, POSP onboarding, claims, and cashless hospital networks.
            </p>
          </div>
          <button 
            onClick={loadData} 
            className="btn-portal btn-portal-agent"
            style={{ padding: '0.6rem 1.2rem', cursor: 'pointer' }}
          >
            Refresh Datasets
          </button>
        </div>

        {/* Metrics Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
          <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>
              <span>Total Inquiries</span>
              <FileText size={18} color="var(--primary-navy)" />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-navy)', marginTop: '0.5rem' }}>
              {quotes.length}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 600, marginTop: '0.25rem' }}>
              Live customer leads
            </div>
          </div>

          <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>
              <span>POSP Applications</span>
              <Users size={18} color="var(--accent-gold-hover)" />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-navy)', marginTop: '0.5rem' }}>
              {pospList.length}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#d97706', fontWeight: 600, marginTop: '0.25rem' }}>
              {pospList.filter(p => p.status === 'PENDING').length} Pending verification
            </div>
          </div>

          <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>
              <span>Claims Lodged</span>
              <Crosshair size={18} color="#2563eb" />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-navy)', marginTop: '0.5rem' }}>
              {claims.length}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#2563eb', fontWeight: 600, marginTop: '0.25rem' }}>
              Emergency intimation queue
            </div>
          </div>

          <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>
              <span>Network Hospitals</span>
              <Building2 size={18} color="#10b981" />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#065f46', marginTop: '0.5rem' }}>
              {hospitals.length}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 600, marginTop: '0.25rem' }}>
              {hospitals.filter(h => h.cashlessAvailable).length} Cashless empanelled
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '2px solid var(--border-subtle)', marginBottom: '1.5rem', overflowX: 'auto' }}>
          <button
            onClick={() => setActiveTab('quotes')}
            style={{
              padding: '0.75rem 1.25rem',
              fontWeight: 700,
              fontSize: '0.95rem',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              color: activeTab === 'quotes' ? 'var(--primary-navy)' : 'var(--text-muted)',
              borderBottom: activeTab === 'quotes' ? '3px solid var(--accent-gold)' : 'none',
              marginBottom: '-2px'
            }}
          >
            📋 Customer Quote Inquiries ({quotes.length})
          </button>
          <button
            onClick={() => setActiveTab('posp')}
            style={{
              padding: '0.75rem 1.25rem',
              fontWeight: 700,
              fontSize: '0.95rem',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              color: activeTab === 'posp' ? 'var(--primary-navy)' : 'var(--text-muted)',
              borderBottom: activeTab === 'posp' ? '3px solid var(--accent-gold)' : 'none',
              marginBottom: '-2px'
            }}
          >
            ⭐ POSP Agent Applications ({pospList.length})
          </button>
          <button
            onClick={() => setActiveTab('claims')}
            style={{
              padding: '0.75rem 1.25rem',
              fontWeight: 700,
              fontSize: '0.95rem',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              color: activeTab === 'claims' ? 'var(--primary-navy)' : 'var(--text-muted)',
              borderBottom: activeTab === 'claims' ? '3px solid var(--accent-gold)' : 'none',
              marginBottom: '-2px'
            }}
          >
            🚨 Insurance Claims ({claims.length})
          </button>
          <button
            onClick={() => setActiveTab('hospitals')}
            style={{
              padding: '0.75rem 1.25rem',
              fontWeight: 700,
              fontSize: '0.95rem',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              color: activeTab === 'hospitals' ? '#065f46' : 'var(--text-muted)',
              borderBottom: activeTab === 'hospitals' ? '3px solid #10b981' : 'none',
              marginBottom: '-2px'
            }}
          >
            🏥 Network Hospitals ({hospitals.length})
          </button>
        </div>

        {/* Data Tables */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
            Loading dashboard data...
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--border-subtle)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
            {/* Tab 1: Customer Quotes */}
            {activeTab === 'quotes' && (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-subtle)' }}>
                    <tr>
                      <th style={{ padding: '1rem' }}>Date</th>
                      <th style={{ padding: '1rem' }}>Category</th>
                      <th style={{ padding: '1rem' }}>Customer Name</th>
                      <th style={{ padding: '1rem' }}>Contact</th>
                      <th style={{ padding: '1rem' }}>City</th>
                      <th style={{ padding: '1rem' }}>Plan Details</th>
                      <th style={{ padding: '1rem' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quotes.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                          No inquiries received yet. Submit a test quote from the home page.
                        </td>
                      </tr>
                    ) : (
                      quotes.map((q) => (
                        <tr key={q.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                          <td style={{ padding: '1rem', color: '#64748b' }}>
                            {new Date(q.createdAt).toLocaleDateString()}
                          </td>
                          <td style={{ padding: '1rem', fontWeight: 700, textTransform: 'capitalize' }}>
                            {q.categorySlug.replace('-', ' ')}
                          </td>
                          <td style={{ padding: '1rem', fontWeight: 600 }}>{q.fullName}</td>
                          <td style={{ padding: '1rem' }}>
                            <a href={`tel:${q.phoneNumber}`} style={{ color: 'var(--primary-navy)', fontWeight: 600 }}>
                              {q.phoneNumber}
                            </a>
                          </td>
                          <td style={{ padding: '1rem' }}>{q.city || '-'}</td>
                          <td style={{ padding: '1rem', fontSize: '0.8rem', color: '#475569', maxWidth: '240px' }}>
                            {q.planDetails || '-'}
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <span style={{
                              background: '#dcfce7',
                              color: '#15803d',
                              padding: '0.2rem 0.6rem',
                              borderRadius: '9999px',
                              fontSize: '0.75rem',
                              fontWeight: 700
                            }}>
                              {q.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Tab 2: POSP Applications */}
            {activeTab === 'posp' && (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-subtle)' }}>
                    <tr>
                      <th style={{ padding: '1rem' }}>Applied Date</th>
                      <th style={{ padding: '1rem' }}>Agent Name</th>
                      <th style={{ padding: '1rem' }}>PAN / Aadhaar</th>
                      <th style={{ padding: '1rem' }}>Location</th>
                      <th style={{ padding: '1rem' }}>Experience</th>
                      <th style={{ padding: '1rem' }}>Status</th>
                      <th style={{ padding: '1rem' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pospList.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                          No POSP applications found.
                        </td>
                      </tr>
                    ) : (
                      pospList.map((posp) => (
                        <tr key={posp.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                          <td style={{ padding: '1rem', color: '#64748b' }}>
                            {new Date(posp.appliedAt).toLocaleDateString()}
                          </td>
                          <td style={{ padding: '1rem', fontWeight: 600 }}>
                            {posp.user?.fullName}
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{posp.user?.email}</div>
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <div><strong>PAN:</strong> {posp.panNumber}</div>
                            {posp.aadhaarNumber && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>UID: {posp.aadhaarNumber}</div>}
                          </td>
                          <td style={{ padding: '1rem' }}>{posp.city}, {posp.state}</td>
                          <td style={{ padding: '1rem' }}>{posp.experienceYears} Yrs</td>
                          <td style={{ padding: '1rem' }}>
                            <span style={{
                              background: posp.status === 'APPROVED' ? '#dcfce7' : posp.status === 'REJECTED' ? '#fee2e2' : '#fef3c7',
                              color: posp.status === 'APPROVED' ? '#15803d' : posp.status === 'REJECTED' ? '#b91c1c' : '#b45309',
                              padding: '0.2rem 0.6rem',
                              borderRadius: '9999px',
                              fontSize: '0.75rem',
                              fontWeight: 700
                            }}>
                              {posp.status}
                            </span>
                          </td>
                          <td style={{ padding: '1rem' }}>
                            {posp.status === 'PENDING' ? (
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                  onClick={() => handleUpdatePOSP(posp.id, 'APPROVED')}
                                  style={{ background: '#10b981', color: '#fff', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleUpdatePOSP(posp.id, 'REJECTED')}
                                  style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                                >
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Processed</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Tab 3: Insurance Claims */}
            {activeTab === 'claims' && (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-subtle)' }}>
                    <tr>
                      <th style={{ padding: '1rem' }}>Intimation Date</th>
                      <th style={{ padding: '1rem' }}>Policy No</th>
                      <th style={{ padding: '1rem' }}>Claim Type</th>
                      <th style={{ padding: '1rem' }}>Claimant</th>
                      <th style={{ padding: '1rem' }}>Hospital / Garage</th>
                      <th style={{ padding: '1rem' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {claims.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                          No claims submitted yet.
                        </td>
                      </tr>
                    ) : (
                      claims.map((claim) => (
                        <tr key={claim.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                          <td style={{ padding: '1rem', color: '#64748b' }}>
                            {new Date(claim.createdAt).toLocaleDateString()}
                          </td>
                          <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--primary-navy)' }}>
                            {claim.policyNumber}
                          </td>
                          <td style={{ padding: '1rem' }}>{claim.claimType}</td>
                          <td style={{ padding: '1rem' }}>
                            <div style={{ fontWeight: 600 }}>{claim.claimantName}</div>
                            <a href={`tel:${claim.contactPhone}`} style={{ fontSize: '0.78rem', color: 'var(--accent-gold-hover)' }}>
                              {claim.contactPhone}
                            </a>
                          </td>
                          <td style={{ padding: '1rem' }}>{claim.hospitalOrGarage || '-'}</td>
                          <td style={{ padding: '1rem' }}>
                            <span style={{
                              background: '#dbeafe',
                              color: '#1e40af',
                              padding: '0.2rem 0.6rem',
                              borderRadius: '9999px',
                              fontSize: '0.75rem',
                              fontWeight: 700
                            }}>
                              {claim.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Tab 4: Network Hospitals Directory Management */}
            {activeTab === 'hospitals' && (
              <div>
                {/* Hospital Management Toolbar */}
                <div style={{ padding: '1.25rem 1.5rem', background: '#f0fdf4', borderBottom: '1px solid #bbf7d0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ position: 'relative', width: '240px' }}>
                      <input
                        type="text"
                        placeholder="Search hospital name..."
                        className="form-input"
                        value={hospSearch}
                        onChange={(e) => setHospSearch(e.target.value)}
                        style={{ paddingLeft: '2.2rem', paddingRight: '0.75rem', height: '38px', fontSize: '0.85rem' }}
                      />
                      <Search size={15} color="#64748b" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                    </div>

                    <select
                      className="form-select"
                      value={hospCityFilter}
                      onChange={(e) => setHospCityFilter(e.target.value)}
                      style={{ height: '38px', fontSize: '0.85rem', width: '160px' }}
                    >
                      <option value="">All Cities</option>
                      {uniqueCities.map((city, idx) => (
                        <option key={idx} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
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
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(5, 150, 105, 0.25)'
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
                </div>

                {/* Hospitals Table */}
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                    <thead style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-subtle)' }}>
                      <tr>
                        <th style={{ padding: '1rem' }}>Hospital Name & Status</th>
                        <th style={{ padding: '1rem' }}>State & City</th>
                        <th style={{ padding: '1rem' }}>Complete Address</th>
                        <th style={{ padding: '1rem' }}>Contact Number</th>
                        <th style={{ padding: '1rem' }}>Specialties</th>
                        <th style={{ padding: '1rem', textAlign: 'center' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredHospitals.length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
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
                        filteredHospitals.map((hosp) => (
                          <tr key={hosp.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                            <td style={{ padding: '1rem' }}>
                              <div style={{ fontWeight: 700, color: 'var(--primary-navy)' }}>{hosp.hospitalName}</div>
                              {hosp.cashlessAvailable ? (
                                <span style={{
                                  background: '#dcfce7',
                                  color: '#15803d',
                                  padding: '0.15rem 0.5rem',
                                  borderRadius: '9999px',
                                  fontSize: '0.7rem',
                                  fontWeight: 700,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.2rem',
                                  marginTop: '0.2rem'
                                }}>
                                  <CheckCircle2 size={11} /> Cashless Empanelled
                                </span>
                              ) : (
                                <span style={{
                                  background: '#fee2e2',
                                  color: '#b91c1c',
                                  padding: '0.15rem 0.5rem',
                                  borderRadius: '9999px',
                                  fontSize: '0.7rem',
                                  fontWeight: 700,
                                  marginTop: '0.2rem'
                                }}>
                                  Reimbursement Only
                                </span>
                              )}
                            </td>
                            <td style={{ padding: '1rem' }}>
                              <span style={{ fontWeight: 600 }}>{hosp.city}</span>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{hosp.state}</div>
                            </td>
                            <td style={{ padding: '1rem', fontSize: '0.82rem', color: '#475569', maxWidth: '240px' }}>
                              {hosp.address} {hosp.pincode && ` - ${hosp.pincode}`}
                            </td>
                            <td style={{ padding: '1rem' }}>
                              <a href={`tel:${hosp.contactNumber}`} style={{ color: 'var(--primary-navy)', fontWeight: 600, fontSize: '0.85rem' }}>
                                {hosp.contactNumber || '-'}
                              </a>
                            </td>
                            <td style={{ padding: '1rem', fontSize: '0.78rem', color: '#64748b', maxWidth: '200px' }}>
                              {hosp.specialties || '-'}
                            </td>
                            <td style={{ padding: '1rem', textAlign: 'center' }}>
                              <button
                                onClick={() => handleDeleteHospital(hosp.id, hosp.hospitalName)}
                                title="Remove hospital"
                                style={{
                                  background: '#fee2e2',
                                  color: '#ef4444',
                                  border: 'none',
                                  padding: '0.4rem 0.6rem',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.25rem',
                                  fontSize: '0.75rem',
                                  fontWeight: 700
                                }}
                              >
                                <Trash2 size={13} /> Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
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
          backdropFilter: 'blur(4px)',
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
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building2 size={22} color="#059669" />
                <h2 style={{ fontSize: '1.25rem', color: 'var(--primary-navy)' }}>Add Empanelled Hospital</h2>
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
                  <label className="form-label">Contact / Emergency Phone</label>
                  <input
                    type="text"
                    placeholder="e.g. +91 80 2630 4050"
                    className="form-input"
                    value={newHospital.contactNumber}
                    onChange={(e) => setNewHospital({ ...newHospital, contactNumber: e.target.value })}
                  />
                </div>
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
          backdropFilter: 'blur(4px)',
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Upload size={22} color="#0f2b48" />
                <h2 style={{ fontSize: '1.25rem', color: 'var(--primary-navy)' }}>Bulk Upload Network Hospitals</h2>
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
              <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--primary-navy)' }}>
                Select a CSV or JSON file from your computer
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.35rem 0 1rem' }}>
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
    </div>
  );
}
