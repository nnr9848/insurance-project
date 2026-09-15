import React, { useState, useEffect } from 'react';
import { Search, MapPin, Phone, Building2, CheckCircle2, ArrowLeft, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { portalService } from '../services/api';

export default function NetworkHospitals() {
  const [hospitals, setHospitals] = useState([]);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  
  // Filter States
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [hospitalNameQuery, setHospitalNameQuery] = useState('');
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllHospitals();
  }, []);

  const loadAllHospitals = async () => {
    setLoading(true);
    try {
      const data = await portalService.searchHospitals('', '');
      const list = data || [];
      setHospitals(list);

      // Extract unique states and districts
      const uniqueStates = Array.from(new Set(list.map(h => h.state))).filter(Boolean).sort();
      setStates(uniqueStates);

      const uniqueDistricts = Array.from(new Set(list.map(h => h.city))).filter(Boolean).sort();
      setDistricts(uniqueDistricts);
    } catch (err) {
      console.error('Error fetching hospitals', err);
    } finally {
      setLoading(false);
    }
  };

  // Filtered dynamically by State
  const availableDistricts = selectedState 
    ? Array.from(new Set(hospitals.filter(h => h.state.toLowerCase() === selectedState.toLowerCase()).map(h => h.city))).filter(Boolean).sort()
    : districts;

  // Filtered List
  const filteredHospitals = hospitals.filter(h => {
    const matchesState = !selectedState || h.state.toLowerCase() === selectedState.toLowerCase();
    const matchesDistrict = !selectedDistrict || h.city.toLowerCase() === selectedDistrict.toLowerCase();
    const matchesQuery = !hospitalNameQuery || 
      h.hospitalName.toLowerCase().includes(hospitalNameQuery.toLowerCase()) ||
      (h.specialties && h.specialties.toLowerCase().includes(hospitalNameQuery.toLowerCase())) ||
      (h.address && h.address.toLowerCase().includes(hospitalNameQuery.toLowerCase()));

    return matchesState && matchesDistrict && matchesQuery;
  });

  const handleReset = () => {
    setSelectedState('');
    setSelectedDistrict('');
    setHospitalNameQuery('');
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '4rem' }}>
      {/* Hero Section matching aadhirakshainsurance.com/network-hospitals.php */}
      <div style={{
        background: '#04281f', /* Deep Forest Green */
        color: '#ffffff',
        padding: '3.5rem 1.5rem 3rem',
        textAlign: 'center',
        position: 'relative'
      }}>
        <div style={{ maxWidth: '850px', margin: '0 auto' }}>
          {/* Pill Badge */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
            <span style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(52, 211, 153, 0.4)',
              color: '#34d399',
              fontSize: '0.75rem',
              fontWeight: 800,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              padding: '0.35rem 1.1rem',
              borderRadius: '9999px',
              display: 'inline-block'
            }}>
              Cashless Hospital Networks
            </span>
          </div>

          {/* Main Title */}
          <h1 style={{
            fontSize: 'clamp(2rem, 4vw, 2.75rem)',
            fontWeight: 900,
            color: '#ffffff',
            letterSpacing: '-0.5px',
            lineHeight: 1.2,
            marginBottom: '1rem'
          }}>
            10,000+ Hospital Partners Nationwide
          </h1>

          {/* Subtitle description */}
          <p style={{
            fontSize: 'clamp(0.95rem, 1.8vw, 1.05rem)',
            color: '#cbd5e1',
            lineHeight: 1.6,
            maxWidth: '720px',
            margin: '0 auto'
          }}>
            Bypass billing desks entirely. Search for nearby empanelled medical centers, nursing
            homes, and superspecialty hospitals to access cashless treatments instantly.
          </p>
        </div>
      </div>

      {/* Boxed Content Container */}
      <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '0 1.5rem' }}>
        {/* Back to Home Breadcrumb */}
        <div style={{ padding: '1.5rem 0 1rem' }}>
          <Link 
            to="/" 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.4rem', 
              color: '#475569', 
              fontWeight: 700, 
              fontSize: '0.88rem',
              transition: 'color 0.2s'
            }}
          >
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </div>

        {/* Search Network Directories Card */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '1.75rem 2rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
          marginBottom: '2rem'
        }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#064e3b', marginBottom: '1.25rem' }}>
            Search Network Directories
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.25rem',
            marginBottom: '1.5rem'
          }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#064e3b', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.5px' }}>
                Select State
              </label>
              <select
                className="form-select"
                value={selectedState}
                onChange={(e) => { setSelectedState(e.target.value); setSelectedDistrict(''); }}
                style={{ height: '44px', background: '#fff', borderColor: '#cbd5e1' }}
              >
                <option value="">All States</option>
                {states.map((st, idx) => (
                  <option key={idx} value={st}>{st}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#064e3b', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.5px' }}>
                Select District / City
              </label>
              <select
                className="form-select"
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                style={{ height: '44px', background: '#fff', borderColor: '#cbd5e1' }}
              >
                <option value="">All Districts</option>
                {availableDistricts.map((dst, idx) => (
                  <option key={idx} value={dst}>{dst}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#064e3b', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.5px' }}>
                Hospital Name
              </label>
              <input
                type="text"
                placeholder="Search by name..."
                className="form-input"
                value={hospitalNameQuery}
                onChange={(e) => setHospitalNameQuery(e.target.value)}
                style={{ height: '44px', background: '#fff', borderColor: '#cbd5e1' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => {}}
              style={{
                background: '#064e3b',
                color: '#ffffff',
                border: 'none',
                padding: '0.65rem 1.75rem',
                borderRadius: '8px',
                fontWeight: 800,
                fontSize: '0.85rem',
                letterSpacing: '0.5px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                boxShadow: '0 2px 4px rgba(6, 78, 59, 0.2)'
              }}
            >
              <Search size={15} /> SEARCH
            </button>

            <button
              onClick={handleReset}
              style={{
                background: '#475569',
                color: '#ffffff',
                border: 'none',
                padding: '0.65rem 1.5rem',
                borderRadius: '8px',
                fontWeight: 800,
                fontSize: '0.85rem',
                letterSpacing: '0.5px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <RotateCcw size={14} /> RESET
            </button>
          </div>
        </div>

        {/* Hospitals Directory Results Card */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
        }}>
          {/* Header Row */}
          <div style={{
            padding: '1.25rem 1.75rem',
            borderBottom: '2px solid #064e3b',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.5rem'
          }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#064e3b' }}>
              Hospitals Directory
            </h2>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#064e3b' }}>
              Found: {filteredHospitals.length} empanelled centers
            </div>
          </div>

          {/* Directory Content */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: '#64748b' }}>
              Searching cashless hospital directory...
            </div>
          ) : filteredHospitals.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#64748b' }}>
              <Building2 size={48} color="#cbd5e1" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ color: '#1e293b' }}>No Empanelled Hospitals Found</h3>
              <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                Please adjust your State, District or Name search criteria.
              </p>
              <button
                onClick={handleReset}
                style={{ marginTop: '1rem', background: '#064e3b', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: '#064e3b', color: '#ffffff' }}>
                    <th style={{ padding: '1rem 1.25rem', fontWeight: 800, fontSize: '0.78rem', letterSpacing: '0.5px' }}>HOSPITAL NAME</th>
                    <th style={{ padding: '1rem 1.25rem', fontWeight: 800, fontSize: '0.78rem', letterSpacing: '0.5px' }}>STATE</th>
                    <th style={{ padding: '1rem 1.25rem', fontWeight: 800, fontSize: '0.78rem', letterSpacing: '0.5px' }}>DISTRICT / CITY</th>
                    <th style={{ padding: '1rem 1.25rem', fontWeight: 800, fontSize: '0.78rem', letterSpacing: '0.5px' }}>COMPLETE ADDRESS</th>
                    <th style={{ padding: '1rem 1.25rem', fontWeight: 800, fontSize: '0.78rem', letterSpacing: '0.5px' }}>CONTACT DETAILS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHospitals.map((hosp, idx) => (
                    <tr 
                      key={hosp.id || idx} 
                      style={{ 
                        borderBottom: '1px solid #f1f5f9',
                        background: idx % 2 === 0 ? '#ffffff' : '#fcfdfd',
                        transition: 'background 0.15s'
                      }}
                    >
                      <td style={{ padding: '1.25rem', verticalAlign: 'top' }}>
                        <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>
                          {hosp.hospitalName}
                        </div>
                        {hosp.cashlessAvailable && (
                          <div style={{ marginTop: '0.35rem' }}>
                            <span style={{
                              background: '#dcfce7',
                              color: '#15803d',
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              padding: '0.15rem 0.5rem',
                              borderRadius: '9999px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.2rem'
                            }}>
                              <CheckCircle2 size={11} /> Instant Cashless
                            </span>
                          </div>
                        )}
                        {hosp.specialties && (
                          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem' }}>
                            {hosp.specialties}
                          </div>
                        )}
                      </td>

                      <td style={{ padding: '1.25rem', verticalAlign: 'top' }}>
                        <span style={{
                          background: '#f0fdf4',
                          color: '#166534',
                          border: '1px solid #bbf7d0',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          display: 'inline-block'
                        }}>
                          {hosp.state}
                        </span>
                      </td>

                      <td style={{ padding: '1.25rem', verticalAlign: 'top', fontWeight: 800, color: '#0f172a' }}>
                        {hosp.city}
                      </td>

                      <td style={{ padding: '1.25rem', verticalAlign: 'top', fontSize: '0.85rem', color: '#475569', maxWidth: '300px', lineHeight: 1.4 }}>
                        {hosp.address} {hosp.pincode && `- ${hosp.pincode}`}
                        <div style={{ marginTop: '0.35rem' }}>
                          <a
                            href={`https://maps.google.com/?q=${encodeURIComponent(hosp.hospitalName + ' ' + hosp.city)}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700 }}
                          >
                            View on Map ➔
                          </a>
                        </div>
                      </td>

                      <td style={{ padding: '1.25rem', verticalAlign: 'top' }}>
                        <a
                          href={`tel:${hosp.contactNumber || '+918367415156'}`}
                          style={{
                            fontWeight: 800,
                            color: '#064e3b',
                            fontSize: '0.92rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          <Phone size={14} color="#059669" />
                          {hosp.contactNumber || '+91 8367415156'}
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
