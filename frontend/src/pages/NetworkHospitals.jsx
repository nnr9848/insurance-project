import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Phone, 
  Building2, 
  CheckCircle2, 
  ArrowLeft, 
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Clock,
  HeartPulse,
  Award
} from 'lucide-react';
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
    ? Array.from(new Set(hospitals.filter(h => h.state?.toLowerCase() === selectedState.toLowerCase()).map(h => h.city))).filter(Boolean).sort()
    : districts;

  // Filtered List
  const filteredHospitals = hospitals.filter(h => {
    const matchesState = !selectedState || h.state?.toLowerCase() === selectedState.toLowerCase();
    const matchesDistrict = !selectedDistrict || h.city?.toLowerCase() === selectedDistrict.toLowerCase();
    const matchesQuery = !hospitalNameQuery || 
      h.hospitalName?.toLowerCase().includes(hospitalNameQuery.toLowerCase()) ||
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
    <div style={{ background: '#f8fafc', minHeight: '100vh', color: '#0f2b48' }}>
      
      {/* 1. HERO SECTION (Deep Forest Green / Dark Navy Hybrid Hero) */}
      <section className="product-funnel-hero" style={{ background: 'linear-gradient(135deg, #022c22 0%, #0f2b48 100%)' }}>
        {/* Subtle Emerald Glow Orb */}
        <div style={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '820px', margin: '0 auto' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(16, 185, 129, 0.2)',
              border: '1px solid rgba(52, 211, 153, 0.4)',
              padding: '6px 14px',
              borderRadius: '9999px',
              fontSize: '0.82rem',
              fontWeight: 700,
              color: '#34d399',
              marginBottom: '1.25rem'
            }}>
              <Sparkles size={15} /> 10,000+ Empanelled Cashless Hospital Networks
            </div>

            <h1 style={{
              fontSize: 'clamp(2rem, 3.8vw, 2.85rem)',
              fontWeight: 900,
              lineHeight: 1.2,
              margin: '0 0 1rem 0',
              color: '#ffffff'
            }}>
              Find Cashless Hospitals Near You <br />
              <span style={{ color: '#34d399' }}>Zero Out-of-Pocket Admission</span>
            </h1>

            <p style={{
              fontSize: '1rem',
              color: '#cbd5e1',
              lineHeight: 1.6,
              maxWidth: '680px',
              margin: '0 auto 2rem auto'
            }}>
              Bypass billing desks entirely. Search across India's top superspecialty hospital chains, nursing homes, and medical centers with guaranteed pre-auth cashless settlement.
            </p>

            {/* Quick Metrics Bar */}
            <div className="funnel-trust-grid" style={{ maxWidth: '640px', margin: '0 auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.06)', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <Clock size={20} color="#34d399" />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#ffffff' }}>60-Min Pre-Auth</div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Direct TPA verification</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.06)', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <ShieldCheck size={20} color="#60a5fa" />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#ffffff' }}>100% Cashless</div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Direct insurer settlement</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SEARCH & DIRECTORY WORKSPACE */}
      <div className="container" style={{ marginTop: '-2.5rem', position: 'relative', zIndex: 10, paddingBottom: '4rem' }}>
        
        {/* Search Filter Card */}
        <div className="funnel-card-container" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f2b48', margin: 0 }}>
              Search Empanelled Medical Centers
            </h2>
            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
              Instant real-time registry filter
            </span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '1.25rem'
          }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                Select State
              </label>
              <select
                value={selectedState}
                onChange={(e) => { setSelectedState(e.target.value); setSelectedDistrict(''); }}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  color: '#0f2b48',
                  background: '#ffffff',
                  boxSizing: 'border-box'
                }}
              >
                <option value="">All States ({states.length})</option>
                {states.map((st, idx) => (
                  <option key={idx} value={st}>{st}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                Select District / City
              </label>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  color: '#0f2b48',
                  background: '#ffffff',
                  boxSizing: 'border-box'
                }}
              >
                <option value="">All Districts ({availableDistricts.length})</option>
                {availableDistricts.map((dst, idx) => (
                  <option key={idx} value={dst}>{dst}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                Hospital Name / Specialty
              </label>
              <input
                type="text"
                placeholder="e.g. Apollo, Yashoda, KIMS..."
                value={hospitalNameQuery}
                onChange={(e) => setHospitalNameQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.88rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={handleReset}
              style={{
                background: '#f1f5f9',
                color: '#475569',
                border: '1px solid #cbd5e1',
                padding: '9px 18px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <RotateCcw size={14} /> Clear Filters
            </button>

            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#059669', marginLeft: 'auto' }}>
              Showing {filteredHospitals.length} Cashless Centers
            </span>
          </div>
        </div>

        {/* Directory Results Container */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)'
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#64748b' }}>
              <HeartPulse size={36} color="#059669" style={{ animation: 'pulse 1.5s infinite', margin: '0 auto 1rem' }} />
              <div>Loading verified hospital network...</div>
            </div>
          ) : filteredHospitals.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#64748b' }}>
              <Building2 size={48} color="#cbd5e1" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ color: '#0f2b48', fontSize: '1.25rem', margin: '0 0 0.5rem 0' }}>No Empanelled Hospitals Found</h3>
              <p style={{ fontSize: '0.9rem', margin: '0 0 1.25rem 0' }}>
                Please adjust your State, District or Hospital search keywords.
              </p>
              <button
                onClick={handleReset}
                style={{ background: '#0f2b48', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            <>
              {/* Desktop View Table */}
              <div className="hospital-desktop-table" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ background: '#0f2b48', color: '#ffffff' }}>
                      <th style={{ padding: '1rem 1.25rem', fontWeight: 800, fontSize: '0.78rem', letterSpacing: '0.5px' }}>HOSPITAL NAME & BADGE</th>
                      <th style={{ padding: '1rem 1.25rem', fontWeight: 800, fontSize: '0.78rem', letterSpacing: '0.5px' }}>LOCATION</th>
                      <th style={{ padding: '1rem 1.25rem', fontWeight: 800, fontSize: '0.78rem', letterSpacing: '0.5px' }}>COMPLETE ADDRESS</th>
                      <th style={{ padding: '1rem 1.25rem', fontWeight: 800, fontSize: '0.78rem', letterSpacing: '0.5px' }}>TPA / ADMISSION DESK</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHospitals.map((hosp, idx) => (
                      <tr 
                        key={hosp.id || idx} 
                        style={{ 
                          borderBottom: '1px solid #f1f5f9',
                          background: idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                          transition: 'background 0.15s'
                        }}
                      >
                        <td style={{ padding: '1.25rem', verticalAlign: 'top' }}>
                          <div style={{ fontWeight: 800, color: '#0f2b48', fontSize: '0.95rem' }}>
                            {hosp.hospitalName}
                          </div>
                          {hosp.cashlessAvailable && (
                            <div style={{ marginTop: '0.35rem' }}>
                              <span style={{
                                background: '#ecfdf5',
                                color: '#059669',
                                border: '1px solid #a7f3d0',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                padding: '0.15rem 0.5rem',
                                borderRadius: '9999px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem'
                              }}>
                                <CheckCircle2 size={12} /> Instant Cashless
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
                          <div style={{ fontWeight: 800, color: '#0f2b48' }}>{hosp.city}</div>
                          <span style={{
                            color: '#059669',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            display: 'inline-block',
                            marginTop: '0.2rem'
                          }}>
                            {hosp.state}
                          </span>
                        </td>

                        <td style={{ padding: '1.25rem', verticalAlign: 'top', fontSize: '0.84rem', color: '#475569', maxWidth: '320px', lineHeight: 1.4 }}>
                          {hosp.address} {hosp.pincode && `- ${hosp.pincode}`}
                          <div style={{ marginTop: '0.35rem' }}>
                            <a
                              href={`https://maps.google.com/?q=${encodeURIComponent(hosp.hospitalName + ' ' + hosp.city)}`}
                              target="_blank"
                              rel="noreferrer"
                              style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: 700, textDecoration: 'none' }}
                            >
                              Open in Google Maps ➔
                            </a>
                          </div>
                        </td>

                        <td style={{ padding: '1.25rem', verticalAlign: 'top' }}>
                          <a
                            href={`tel:${hosp.contactNumber || '+918367415156'}`}
                            style={{
                              fontWeight: 800,
                              color: '#0f2b48',
                              fontSize: '0.9rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.4rem',
                              whiteSpace: 'nowrap',
                              textDecoration: 'none'
                            }}
                          >
                            <Phone size={15} color="#059669" />
                            {hosp.contactNumber || '+91 8367415156'}
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Native Mobile Hospital Card Tiles */}
              <div className="hospital-mobile-cards">
                {filteredHospitals.map((hosp, idx) => (
                  <div
                    key={hosp.id || idx}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '14px',
                      padding: '1.1rem',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.65rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <div>
                        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f2b48', margin: '0 0 0.25rem 0', lineHeight: 1.3 }}>
                          {hosp.hospitalName}
                        </h3>
                        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#059669' }}>
                          {hosp.city}, {hosp.state}
                        </div>
                      </div>

                      {hosp.cashlessAvailable && (
                        <span style={{
                          background: '#ecfdf5',
                          color: '#059669',
                          border: '1px solid #a7f3d0',
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          padding: '0.2rem 0.5rem',
                          borderRadius: '9999px',
                          whiteSpace: 'nowrap',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.2rem'
                        }}>
                          <CheckCircle2 size={11} /> Cashless
                        </span>
                      )}
                    </div>

                    {hosp.specialties && (
                      <div style={{ fontSize: '0.75rem', color: '#64748b', background: '#f8fafc', padding: '6px 10px', borderRadius: '8px' }}>
                        {hosp.specialties}
                      </div>
                    )}

                    <div style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.4 }}>
                      <MapPin size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px', color: '#94a3b8' }} />
                      {hosp.address} {hosp.pincode && `- ${hosp.pincode}`}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.35rem' }}>
                      <a
                        href={`tel:${hosp.contactNumber || '+918367415156'}`}
                        style={{
                          background: '#ecfdf5',
                          color: '#059669',
                          border: '1px solid #a7f3d0',
                          padding: '8px 10px',
                          borderRadius: '8px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '5px',
                          textDecoration: 'none'
                        }}
                      >
                        <Phone size={13} /> Call Desk
                      </a>

                      <a
                        href={`https://maps.google.com/?q=${encodeURIComponent(hosp.hospitalName + ' ' + hosp.city)}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          background: '#f0f9ff',
                          color: '#0284c7',
                          border: '1px solid #bae6fd',
                          padding: '8px 10px',
                          borderRadius: '8px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '5px',
                          textDecoration: 'none'
                        }}
                      >
                        Map ➔
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

      </div>

    </div>
  );
}
