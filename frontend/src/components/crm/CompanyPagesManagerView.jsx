import React, { useState, useEffect } from 'react';
import {
  Globe,
  FileText,
  ShieldCheck,
  Award,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Save,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Info,
  Scale,
  HeartHandshake,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { portalService } from '../../services/api';
import { useBusinessProfile } from '../../context/BusinessProfileContext';
import { useToast } from '../../context/ToastContext';

export default function CompanyPagesManagerView() {
  const { businessProfile, refreshBusinessProfile } = useBusinessProfile();
  const toast = useToast();

  const [saving, setSaving] = useState(false);
  const [openAccordions, setOpenAccordions] = useState({
    about: true,
    legal: false,
    posp: false,
    claims: false
  });

  const [formData, setFormData] = useState({
    // About Us Page
    aboutHeroTitle: '',
    aboutHeroDescription: '',
    aboutMissionStatement: '',
    aboutVisionStatement: '',

    // POSP Onboarding Page
    pospPageHeadline: '',
    pospPageSubheadline: '',

    // Claims Support Desk Page
    claimsPageHeadline: '',
    claimsPageSubheadline: '',

    // Legal & Grievance
    legalGrievanceOfficerName: '',
    legalGrievanceEmail: '',
    legalGrievancePhone: '',
    irdaiRegistrationNo: ''
  });

  useEffect(() => {
    if (businessProfile) {
      setFormData({
        aboutHeroTitle: businessProfile.aboutHeroTitle || '',
        aboutHeroDescription: businessProfile.aboutHeroDescription || '',
        aboutMissionStatement: businessProfile.aboutMissionStatement || '',
        aboutVisionStatement: businessProfile.aboutVisionStatement || '',

        pospPageHeadline: businessProfile.pospPageHeadline || '',
        pospPageSubheadline: businessProfile.pospPageSubheadline || '',

        claimsPageHeadline: businessProfile.claimsPageHeadline || '',
        claimsPageSubheadline: businessProfile.claimsPageSubheadline || '',

        legalGrievanceOfficerName: businessProfile.legalGrievanceOfficerName || '',
        legalGrievanceEmail: businessProfile.legalGrievanceEmail || '',
        legalGrievancePhone: businessProfile.legalGrievancePhone || '',
        irdaiRegistrationNo: businessProfile.irdaiRegistrationNo || ''
      });
    }
  }, [businessProfile]);

  const toggleAccordion = (sectionKey) => {
    setOpenAccordions(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      await portalService.updateBusinessProfile(formData);
      await refreshBusinessProfile();
      toast.success('Company Pages content published successfully!');
    } catch (err) {
      console.error('Failed to update company pages content:', err);
      toast.error('Failed to save changes: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* 1. Header Hub Banner */}
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        padding: '1.5rem',
        boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 4px 10px rgba(2, 132, 199, 0.25)'
          }}>
            <Globe size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0f2b48', margin: '0 0 4px' }}>
              Company Website Pages Hub
            </h2>
            <p style={{ fontSize: '0.84rem', color: '#64748b', margin: 0 }}>
              Centrally manage the live copy, headlines, and regulatory disclaimers across all 4 public platform pages.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={() => refreshBusinessProfile()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 16px',
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              color: '#334155',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={15} />
            <span>Reload</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 22px',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              border: 'none',
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: saving ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)'
            }}
          >
            <Save size={15} />
            <span>{saving ? 'Publishing...' : 'Publish Changes'}</span>
          </button>
        </div>
      </div>

      {/* 2. Interactive Page Accordion Cards */}
      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        {/* ACCORDION 1: ABOUT US PAGE */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
        }}>
          {/* Header */}
          <div 
            onClick={() => toggleAccordion('about')}
            style={{
              padding: '1.25rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              background: openAccordions.about ? '#f8fafc' : '#ffffff',
              borderBottom: openAccordions.about ? '1px solid #e2e8f0' : 'none',
              transition: 'background 0.2s'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: '#e0f2fe',
                color: '#0284c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Sparkles size={19} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f2b48', margin: 0 }}>
                    About Us Page
                  </h3>
                  <span style={{ fontSize: '0.72rem', background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                    /about
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Executive story, mission & vision statements, and corporate outreach gallery
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <a
                href="/about"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#0284c7',
                  textDecoration: 'none',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  background: '#f0f9ff'
                }}
              >
                <span>Live Preview</span>
                <ArrowUpRight size={13} />
              </a>
              <button 
                type="button" 
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
              >
                {openAccordions.about ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
            </div>
          </div>

          {/* Accordion Body */}
          {openAccordions.about && (
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Hero Headline
                </label>
                <input
                  type="text"
                  name="aboutHeroTitle"
                  value={formData.aboutHeroTitle}
                  onChange={handleChange}
                  placeholder="e.g. India’s Most Dependable Bridge Between Families, Protection & Financial Freedom"
                  style={{ width: '100%', padding: '9px 12px', fontSize: '0.88rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Corporate Story & Overview Description
                </label>
                <textarea
                  name="aboutHeroDescription"
                  rows={4}
                  value={formData.aboutHeroDescription}
                  onChange={handleChange}
                  placeholder="Write the founding philosophy, regional advisor network overview, and claim support focus..."
                  style={{ width: '100%', padding: '9px 12px', fontSize: '0.88rem', borderRadius: '8px', border: '1px solid #cbd5e1', lineHeight: 1.5 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Mission Statement
                  </label>
                  <textarea
                    name="aboutMissionStatement"
                    rows={3}
                    value={formData.aboutMissionStatement}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '9px 12px', fontSize: '0.88rem', borderRadius: '8px', border: '1px solid #cbd5e1', lineHeight: 1.5 }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Vision Statement
                  </label>
                  <textarea
                    name="aboutVisionStatement"
                    rows={3}
                    value={formData.aboutVisionStatement}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '9px 12px', fontSize: '0.88rem', borderRadius: '8px', border: '1px solid #cbd5e1', lineHeight: 1.5 }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ACCORDION 2: BECOME A POSP PAGE */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
        }}>
          {/* Header */}
          <div 
            onClick={() => toggleAccordion('posp')}
            style={{
              padding: '1.25rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              background: openAccordions.posp ? '#f8fafc' : '#ffffff',
              borderBottom: openAccordions.posp ? '1px solid #e2e8f0' : 'none',
              transition: 'background 0.2s'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: '#fef3c7',
                color: '#d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Award size={19} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f2b48', margin: 0 }}>
                    Become a POSP Page
                  </h3>
                  <span style={{ fontSize: '0.72rem', background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                    /become-posp
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Advisor onboarding value proposition, perks, and partner application funnel
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <a
                href="/become-posp"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#0284c7',
                  textDecoration: 'none',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  background: '#f0f9ff'
                }}
              >
                <span>Live Preview</span>
                <ArrowUpRight size={13} />
              </a>
              <button 
                type="button" 
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
              >
                {openAccordions.posp ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
            </div>
          </div>

          {/* Accordion Body */}
          {openAccordions.posp && (
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Hero Headline
                </label>
                <input
                  type="text"
                  name="pospPageHeadline"
                  value={formData.pospPageHeadline}
                  onChange={handleChange}
                  placeholder="e.g. Empower Your Career as a Certified POSP Insurance Advisor"
                  style={{ width: '100%', padding: '9px 12px', fontSize: '0.88rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Hero Subheadline & Value Proposition
                </label>
                <textarea
                  name="pospPageSubheadline"
                  rows={3}
                  value={formData.pospPageSubheadline}
                  onChange={handleChange}
                  placeholder="Describe zero initial capital, multi-insurer portal tools, and payout turnaround..."
                  style={{ width: '100%', padding: '9px 12px', fontSize: '0.88rem', borderRadius: '8px', border: '1px solid #cbd5e1', lineHeight: 1.5 }}
                />
              </div>
            </div>
          )}
        </div>

        {/* ACCORDION 3: CLAIM SUPPORT DESK */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
        }}>
          {/* Header */}
          <div 
            onClick={() => toggleAccordion('claims')}
            style={{
              padding: '1.25rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              background: openAccordions.claims ? '#f8fafc' : '#ffffff',
              borderBottom: openAccordions.claims ? '1px solid #e2e8f0' : 'none',
              transition: 'background 0.2s'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: '#fee2e2',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <HeartHandshake size={19} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f2b48', margin: 0 }}>
                    Claim Support Desk Page
                  </h3>
                  <span style={{ fontSize: '0.72rem', background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                    /claim-support
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  24/7 Cashless claim intimation, hospital coordination, and emergency advisory
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <a
                href="/claim-support"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#0284c7',
                  textDecoration: 'none',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  background: '#f0f9ff'
                }}
              >
                <span>Live Preview</span>
                <ArrowUpRight size={13} />
              </a>
              <button 
                type="button" 
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
              >
                {openAccordions.claims ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
            </div>
          </div>

          {/* Accordion Body */}
          {openAccordions.claims && (
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Claim Desk Hero Headline
                </label>
                <input
                  type="text"
                  name="claimsPageHeadline"
                  value={formData.claimsPageHeadline}
                  onChange={handleChange}
                  placeholder="e.g. 24/7 Cashless Claims Assistance & Emergency Concierge"
                  style={{ width: '100%', padding: '9px 12px', fontSize: '0.88rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Claim Intimation Subheadline
                </label>
                <textarea
                  name="claimsPageSubheadline"
                  rows={3}
                  value={formData.claimsPageSubheadline}
                  onChange={handleChange}
                  placeholder="e.g. File your cashless hospitalization or motor damage intimation in under 60 seconds with dedicated claim managers."
                  style={{ width: '100%', padding: '9px 12px', fontSize: '0.88rem', borderRadius: '8px', border: '1px solid #cbd5e1', lineHeight: 1.5 }}
                />
              </div>
            </div>
          )}
        </div>

        {/* ACCORDION 4: LEGAL & COMPLIANCE */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
        }}>
          {/* Header */}
          <div 
            onClick={() => toggleAccordion('legal')}
            style={{
              padding: '1.25rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              background: openAccordions.legal ? '#f8fafc' : '#ffffff',
              borderBottom: openAccordions.legal ? '1px solid #e2e8f0' : 'none',
              transition: 'background 0.2s'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: '#f5f3ff',
                color: '#7c3aed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Scale size={19} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f2b48', margin: 0 }}>
                    Legal & Compliance Page
                  </h3>
                  <span style={{ fontSize: '0.72rem', background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                    /legal-compliance
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  IRDAI registration, Grievance Redressal Officer contact, and statutory disclosures
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <a
                href="/legal-compliance"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#0284c7',
                  textDecoration: 'none',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  background: '#f0f9ff'
                }}
              >
                <span>Live Preview</span>
                <ArrowUpRight size={13} />
              </a>
              <button 
                type="button" 
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
              >
                {openAccordions.legal ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
            </div>
          </div>

          {/* Accordion Body */}
          {openAccordions.legal && (
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    IRDAI Registration Number
                  </label>
                  <input
                    type="text"
                    name="irdaiRegistrationNo"
                    value={formData.irdaiRegistrationNo}
                    onChange={handleChange}
                    placeholder="e.g. IRDAI/IMF/TS/2026/00482"
                    style={{ width: '100%', padding: '9px 12px', fontSize: '0.88rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Principal Grievance Officer
                  </label>
                  <input
                    type="text"
                    name="legalGrievanceOfficerName"
                    value={formData.legalGrievanceOfficerName}
                    onChange={handleChange}
                    placeholder="e.g. Customer Care Head"
                    style={{ width: '100%', padding: '9px 12px', fontSize: '0.88rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Grievance Redressal Email
                  </label>
                  <input
                    type="email"
                    name="legalGrievanceEmail"
                    value={formData.legalGrievanceEmail}
                    onChange={handleChange}
                    placeholder="e.g. grievance@aadhirakshainsurance.com"
                    style={{ width: '100%', padding: '9px 12px', fontSize: '0.88rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Grievance Helpline
                  </label>
                  <input
                    type="text"
                    name="legalGrievancePhone"
                    value={formData.legalGrievancePhone}
                    onChange={handleChange}
                    placeholder="e.g. +91 8367415156"
                    style={{ width: '100%', padding: '9px 12px', fontSize: '0.88rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

      </form>
    </div>
  );
}
