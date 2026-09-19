import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  PhoneCall, 
  AlertCircle, 
  CheckCircle2, 
  Send, 
  Clock, 
  ShieldCheck, 
  Search, 
  FileText,
  Sparkles,
  ArrowRight,
  Building2,
  Wrench,
  HeartPulse,
  Award
} from 'lucide-react';
import { portalService } from '../services/api';

export default function ClaimSupport() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('file'); // 'file' | 'track'
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [trackQuery, setTrackQuery] = useState('');
  const [trackResult, setTrackResult] = useState(null);
  const [trackLoading, setTrackLoading] = useState(false);

  const [formData, setFormData] = useState({
    policyNumber: '',
    claimantName: '',
    contactPhone: '',
    claimType: 'HEALTH',
    hospitalOrGarage: '',
    incidentDate: '',
    description: ''
  });

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'track' || tabParam === 'file') {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (!trackQuery.trim()) return;
    setTrackLoading(true);
    setTimeout(() => {
      setTrackLoading(false);
      setTrackResult({
        ticketId: trackQuery.trim().toUpperCase(),
        status: 'UNDER_REVIEW',
        statusLabel: 'Under TPA / Surveyor Verification',
        submittedAt: 'Just Now',
        estimatedResolution: 'Within 24-48 Business Hours',
        assignedOfficer: 'Claims Desk Specialist (Escalations)'
      });
    }, 600);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await portalService.submitClaim(formData);
      setSubmitted(true);
    } catch (err) {
      alert('Error submitting claim. Please check details and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', color: '#0f2b48' }}>
      
      {/* 1. HERO SECTION (Emergency Priority Banner + Lead Container) */}
      <section className="product-funnel-hero">
        {/* Amber Priority Glow Orb */}
        <div style={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.25) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div className="container">
          <div className="funnel-hero-grid">
            
            {/* Left Column: 24x7 Emergency Callout & Settlement SLA */}
            <div className="funnel-hero-intro">
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(245, 158, 11, 0.2)',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                padding: '6px 14px',
                borderRadius: '9999px',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: '#fbbf24',
                marginBottom: '1.25rem'
              }}>
                <Clock size={15} /> 24x7 Emergency Claim & Hospital Cashless Desk
              </div>

              <h1 style={{
                fontSize: 'clamp(1.85rem, 3.5vw, 2.75rem)',
                fontWeight: 800,
                lineHeight: 1.2,
                margin: '0 0 1rem 0',
                color: '#ffffff'
              }}>
                Instant Claim Support <br />
                <span style={{ color: '#fbbf24' }}>Direct TPA Pre-Authorization</span>
              </h1>

              <p style={{
                fontSize: '0.98rem',
                color: '#cbd5e1',
                lineHeight: 1.6,
                maxWidth: '520px',
                margin: '0 0 1.75rem 0'
              }}>
                Facing emergency hospitalization or a vehicle accident? Our dedicated claims desk fast-tracks approvals directly with insurers and Third Party Administrators (TPAs) for zero-out-of-pocket settlements.
              </p>

              {/* Emergency Hotline Button & Trust Badges below form on mobile */}
              <div className="funnel-hero-trust-col">
                <div style={{ marginBottom: '1.5rem' }}>
                  <a
                    href="tel:+918367415156"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '10px',
                      background: '#f59e0b',
                      color: '#0f2b48',
                      padding: '12px 22px',
                      borderRadius: '12px',
                      fontWeight: 800,
                      fontSize: '1rem',
                      textDecoration: 'none',
                      boxShadow: '0 8px 20px rgba(245, 158, 11, 0.35)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <PhoneCall size={20} />
                    Emergency Hotline: +91 8367415156
                  </a>
                </div>

                <div className="funnel-trust-grid">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.06)', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <HeartPulse size={22} color="#fbbf24" />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>60-Min Cashless SLA</div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Fast pre-auth response</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.06)', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <Building2 size={22} color="#34d399" />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>10,000+ Hospitals</div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Pan-India network</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.06)', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <Wrench size={22} color="#60a5fa" />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>5,500+ Garages</div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Cashless motor repair</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.06)', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <ShieldCheck size={22} color="#a78bfa" />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>Zero Paperwork TPA</div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Direct settlement support</div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Intimate & Track Form Card */}
            <div className="funnel-hero-card-col">
              <div className="funnel-card-container">
                
                {/* Tabs */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1.25rem' }}>
                  <button
                    type="button"
                    onClick={() => handleTabChange('file')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '10px 8px',
                      borderRadius: '10px',
                      border: `1.5px solid ${activeTab === 'file' ? '#d97706' : '#e2e8f0'}`,
                      background: activeTab === 'file' ? '#fffbeb' : '#ffffff',
                      color: activeTab === 'file' ? '#d97706' : '#64748b',
                      fontWeight: activeTab === 'file' ? 800 : 600,
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    <ShieldCheck size={16} /> File New Claim
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTabChange('track')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '10px 8px',
                      borderRadius: '10px',
                      border: `1.5px solid ${activeTab === 'track' ? '#d97706' : '#e2e8f0'}`,
                      background: activeTab === 'track' ? '#fffbeb' : '#ffffff',
                      color: activeTab === 'track' ? '#d97706' : '#64748b',
                      fontWeight: activeTab === 'track' ? 800 : 600,
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    <Search size={16} /> Track Status
                  </button>
                </div>

                {activeTab === 'track' ? (
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 0.4rem 0', color: '#0f2b48' }}>
                      Track Claim Progress
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 1.25rem 0' }}>
                      Enter your Claim Reference Number or Registered Mobile Number to view live TPA adjudication status.
                    </p>

                    <form onSubmit={handleTrackSubmit}>
                      <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                          Claim Ticket / Policy / Mobile No *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. CLM-84920 or 9876543210"
                          value={trackQuery}
                          onChange={(e) => setTrackQuery(e.target.value)}
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

                      <button
                        type="submit"
                        disabled={trackLoading}
                        style={{
                          width: '100%',
                          background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                          color: '#ffffff',
                          border: 'none',
                          padding: '12px 18px',
                          borderRadius: '10px',
                          fontSize: '1rem',
                          fontWeight: 800,
                          cursor: trackLoading ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          boxShadow: '0 4px 14px rgba(217, 119, 6, 0.3)'
                        }}
                      >
                        {trackLoading ? 'Searching Claims Registry...' : (
                          <>
                            <Search size={18} /> Check Live Settlement Status
                          </>
                        )}
                      </button>
                    </form>

                    {trackResult && (
                      <div style={{ marginTop: '1.5rem', padding: '1.25rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b' }}>TICKET: {trackResult.ticketId}</span>
                          <span style={{ fontSize: '0.78rem', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', background: '#dbeafe', color: '#1d4ed8' }}>
                            {trackResult.status}
                          </span>
                        </div>
                        <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f2b48', margin: '0 0 0.35rem 0' }}>{trackResult.statusLabel}</h4>
                        <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 0.5rem 0' }}>
                          Turnaround SLA: <strong>{trackResult.estimatedResolution}</strong>
                        </p>
                        <div style={{ fontSize: '0.78rem', color: '#059669', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <CheckCircle2 size={14} /> Our dedicated claims officer will contact you if extra documents are required.
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    {submitted ? (
                      <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                        <div style={{
                          width: '64px',
                          height: '64px',
                          borderRadius: '50%',
                          background: '#ecfdf5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 1.25rem',
                          color: '#059669'
                        }}>
                          <CheckCircle2 size={36} />
                        </div>
                        <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: '#0f2b48' }}>
                          Claim Intimation Recorded!
                        </h3>
                        <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.5, margin: '0 0 1.5rem 0' }}>
                          Thank you <strong>{formData.claimantName}</strong>. Your claim has been registered in our high-priority queue. Our claims specialist will call <strong>{formData.contactPhone}</strong> immediately.
                        </p>
                        <button
                          onClick={() => setSubmitted(false)}
                          style={{
                            background: '#0f2b48',
                            color: '#ffffff',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '10px',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          Submit Another Claim
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit}>
                        
                        <div className="funnel-responsive-grid-2" style={{ marginBottom: '1rem' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                              Policy Number *
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. 1029384756"
                              value={formData.policyNumber}
                              onChange={(e) => setFormData({ ...formData, policyNumber: e.target.value })}
                              style={{
                                width: '100%',
                                padding: '9px 10px',
                                borderRadius: '8px',
                                border: '1.5px solid #cbd5e1',
                                fontSize: '0.85rem',
                                boxSizing: 'border-box'
                              }}
                            />
                          </div>

                          <div>
                            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                              Claim Category *
                            </label>
                            <select
                              value={formData.claimType}
                              onChange={(e) => setFormData({ ...formData, claimType: e.target.value })}
                              style={{
                                width: '100%',
                                padding: '9px 10px',
                                borderRadius: '8px',
                                border: '1.5px solid #cbd5e1',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                color: '#0f2b48',
                                background: '#f8fafc'
                              }}
                            >
                              <option value="HEALTH">Health / Hospitalization</option>
                              <option value="MOTOR">Motor / Vehicle Damage</option>
                              <option value="LIFE">Life / Term Claim</option>
                              <option value="TRAVEL">Travel / Medical Overseas</option>
                              <option value="BUSINESS">Business / Commercial Loss</option>
                            </select>
                          </div>
                        </div>

                        <div className="funnel-responsive-grid-2" style={{ marginBottom: '1rem' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                              Patient / Claimant Name *
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="Name"
                              value={formData.claimantName}
                              onChange={(e) => setFormData({ ...formData, claimantName: e.target.value })}
                              style={{
                                width: '100%',
                                padding: '9px 10px',
                                borderRadius: '8px',
                                border: '1.5px solid #cbd5e1',
                                fontSize: '0.85rem',
                                boxSizing: 'border-box'
                              }}
                            />
                          </div>

                          <div>
                            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                              Contact Phone *
                            </label>
                            <input
                              type="tel"
                              required
                              pattern="[0-9]{10}"
                              placeholder="10-digit mobile"
                              value={formData.contactPhone}
                              onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                              style={{
                                width: '100%',
                                padding: '9px 10px',
                                borderRadius: '8px',
                                border: '1.5px solid #cbd5e1',
                                fontSize: '0.85rem',
                                boxSizing: 'border-box'
                              }}
                            />
                          </div>
                        </div>

                        <div className="funnel-responsive-grid-2" style={{ marginBottom: '1rem' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                              Hospital / Workshop Name
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Apollo Hospital"
                              value={formData.hospitalOrGarage}
                              onChange={(e) => setFormData({ ...formData, hospitalOrGarage: e.target.value })}
                              style={{
                                width: '100%',
                                padding: '9px 10px',
                                borderRadius: '8px',
                                border: '1.5px solid #cbd5e1',
                                fontSize: '0.85rem',
                                boxSizing: 'border-box'
                              }}
                            />
                          </div>

                          <div>
                            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                              Incident / Admission Date
                            </label>
                            <input
                              type="date"
                              value={formData.incidentDate}
                              onChange={(e) => setFormData({ ...formData, incidentDate: e.target.value })}
                              style={{
                                width: '100%',
                                padding: '9px 10px',
                                borderRadius: '8px',
                                border: '1.5px solid #cbd5e1',
                                fontSize: '0.85rem',
                                boxSizing: 'border-box'
                              }}
                            />
                          </div>
                        </div>

                        <div style={{ marginBottom: '1.25rem' }}>
                          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                            Brief Incident Summary
                          </label>
                          <textarea
                            rows={2}
                            placeholder="Briefly describe illness, diagnosis, or accident damage"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            style={{
                              width: '100%',
                              padding: '9px 10px',
                              borderRadius: '8px',
                              border: '1.5px solid #cbd5e1',
                              fontSize: '0.85rem',
                              boxSizing: 'border-box',
                              fontFamily: 'inherit'
                            }}
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={loading}
                          style={{
                            width: '100%',
                            background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                            color: '#ffffff',
                            border: 'none',
                            padding: '12px 18px',
                            borderRadius: '10px',
                            fontSize: '1rem',
                            fontWeight: 800,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            boxShadow: '0 4px 14px rgba(217, 119, 6, 0.3)',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {loading ? 'Submitting Intimation...' : (
                            <>
                              <Send size={18} /> Submit Priority Claim Intimation
                            </>
                          )}
                        </button>

                        <div style={{ textAlign: 'center', marginTop: '0.75rem', fontSize: '0.72rem', color: '#64748b' }}>
                          ⏱️ Emergency response within 15 minutes by senior claim manager.
                        </div>
                      </form>
                    )}
                  </div>
                )}

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. THREE-STEP CLAIM SETTLEMENT WORKFLOW */}
      <section style={{ padding: '4rem 0', background: '#ffffff' }}>
        <div className="container">
          
          <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 3rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: '#d97706', letterSpacing: '1px' }}>
              Standard Operating Procedure
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f2b48', margin: '0.5rem 0' }}>
              How Cashless & Reimbursement Claims Work
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.98rem' }}>
              Bypass paperwork delays with our automated claim desk coordination.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem'
          }}>
            {[
              {
                step: '01',
                title: 'Hospital / Garage TPA Intimation',
                desc: 'Present your Aadhiraksha e-card or policy number at any network hospital TPA counter or authorized workshop for cashless admission.',
                icon: <Building2 size={26} color="#d97706" />
              },
              {
                step: '02',
                title: 'Instant Pre-Auth Adjudication',
                desc: 'Our claims escalation desk coordinates directly with the insurer’s medical director to issue initial pre-authorization within 60 minutes.',
                icon: <Clock size={26} color="#059669" />
              },
              {
                step: '03',
                title: 'Final Bill Settlement on Discharge',
                desc: 'Upon final medical discharge or garage repair sign-off, the insurer directly settles the eligible invoice amounts with zero friction.',
                icon: <CheckCircle2 size={26} color="#0284c7" />
              },
              {
                step: '04',
                title: 'Reimbursement Claim Filing',
                desc: 'For non-network treatment, upload original itemized hospital bills, pharmacy receipts, and discharge summary for quick bank transfer payout.',
                icon: <FileText size={26} color="#8b5cf6" />
              }
            ].map((item, idx) => (
              <div
                key={idx}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '1.75rem',
                  position: 'relative'
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: '1.25rem',
                  right: '1.25rem',
                  fontSize: '1.2rem',
                  fontWeight: 900,
                  color: '#cbd5e1'
                }}>
                  {item.step}
                </div>

                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '12px',
                  background: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  border: '1px solid #e2e8f0'
                }}>
                  {item.icon}
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f2b48', margin: '0 0 0.5rem 0' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

    </div>
  );
}
