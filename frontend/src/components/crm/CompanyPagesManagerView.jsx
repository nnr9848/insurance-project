import React, { useState, useEffect, useRef } from 'react';
import {
  Globe,
  FileText,
  ShieldCheck,
  Scale,
  HeartHandshake,
  ArrowUpRight,
  Save,
  Check,
  RefreshCw,
  Bold,
  Italic,
  Underline,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link as LinkIcon,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlertTriangle,
  Info,
  RotateCcw,
  Sparkles,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { portalService } from '../../services/api';
import { useBusinessProfile } from '../../context/BusinessProfileContext';
import { useToast } from '../../context/ToastContext';

// Default document HTML templates for all legal and compliance documents
const DEFAULT_PRIVACY_HTML = `<h2>1. Commitment to Privacy</h2>
<p>At <strong>Aadhiraksha Insurance & Financial Services Pvt Ltd</strong> ("Aadhiraksha", "we", "us", or "our"), we respect your privacy and are committed to protecting the personal data and financial information you share with us through our website, mobile interface, POSP portal, and client assistance desks.</p>

<h2>2. Information We Collect</h2>
<p>To provide accurate insurance quotes, process policy issuance, execute renewals, and manage claim intimations, we collect:</p>
<ul>
  <li><strong>Identity Details:</strong> Full Name, Date of Birth, Gender, PAN, Aadhaar Number (for POSP onboarding as mandated by IRDAI).</li>
  <li><strong>Contact Information:</strong> Mobile Phone Number, Email Address, Communication/Residential Address, City, State, and Pincode.</li>
  <li><strong>Vehicle & Asset Details:</strong> Vehicle Registration Number, Make, Model, RTO City, Year of Manufacture, and Previous Policy Details (for Motor Insurance).</li>
  <li><strong>Health & Lifestyle Metrics:</strong> Age, Pre-existing Medical Conditions, Tobacco/Smoking habits, and Sum Assured requirements (for Health and Term Life policies).</li>
</ul>

<h2>3. How Your Information is Used</h2>
<p>Your data is strictly utilized to generate real-time comparison quotes from our empanelled IRDAI-licensed insurance partners, verify eligibility, transmit necessary underwriting information for policy binding, facilitate cashless hospitalizations/garage approvals, and deliver automated policy renewal reminders.</p>

<h2>4. Zero-Spam & Data Security Guarantee</h2>
<p>We do not sell, rent, or trade your personal information to third-party marketing brokers. All database transmissions are encrypted using enterprise-grade SSL/TLS protocols with role-based cryptographic access controls.</p>`;

const DEFAULT_TERMS_HTML = `<h2>1. Acceptance of Terms</h2>
<p>By accessing, browsing, or submitting quotation/claim forms on the Aadhiraksha portal, you agree to be bound by these Terms of Service, applicable laws, and regulatory guidelines set forth by the IRDAI.</p>

<h2>2. Role of Aadhiraksha Insurance</h2>
<p>Aadhiraksha functions as a licensed insurance intermediary facilitating price comparison, pre-sales advisory, and post-sales claims assistance. The contract of insurance is strictly between the insured customer and the respective insurance underwriter (e.g., Star Health, HDFC ERGO, ICICI Lombard, TATA AIG, LIC, etc.).</p>

<h2>3. Accuracy of Declarations (Utmost Good Faith)</h2>
<p>Insurance contracts in India operate under the doctrine of <em>Uberrima Fides</em> (Utmost Good Faith). It is the sole responsibility of the policyholder to provide true, complete, and accurate declarations regarding pre-existing medical conditions, vehicle modifications, prior claims, and age. Any misrepresentation or suppression of material facts may result in rejection of claims by the insurer under Section 45 of the Insurance Act, 1938.</p>`;

const DEFAULT_DISCLAIMER_HTML = `<div style="background: #fffbeb; border: 1.5px solid #fef3c7; border-radius: 12px; padding: 1.25rem; margin-bottom: 1.5rem;">
  <h4 style="margin: 0 0 0.5rem 0; color: #92400e; font-size: 0.95rem; font-weight: 800;">
    ⚠️ Section 41 of the Insurance Act, 1938 (Prohibition of Rebates):
  </h4>
  <p style="margin: 0; font-size: 0.88rem; color: #78350f; line-height: 1.6;">
    (1) No person shall allow or offer to allow, either directly or indirectly, as an inducement to any person to take out or renew or continue an insurance in respect of any kind of risk relating to lives or property in India, any rebate of the whole or part of the commission payable or any rebate of the premium shown on the policy, nor shall any person taking out or renewing or continuing a policy accept any rebate, except such rebate as may be allowed in accordance with the published prospectuses or tables of the insurer.<br /><br />
    (2) Any person making default in complying with the provisions of this section shall be liable for a penalty which may extend to <strong>ten lakh rupees</strong>.
  </p>
</div>

<h2>Insurance is the Subject Matter of Solicitation</h2>
<p>Product information, premiums, discounts, and benefits displayed on this platform are indicative and based on data provided by respective insurance companies. Please read the policy sales brochure and wording carefully before concluding any sale.</p>

<h2>Tax Disclaimer</h2>
<p>Tax deductions under Section 80C, 80D, and exemptions under Section 10(10D) of the Income Tax Act, 1961 are subject to prevailing provisions and amendments in tax laws. Clients are advised to consult their qualified tax advisor.</p>`;

const DEFAULT_GRIEVANCE_HTML = `<h2>Level 1: Internal Grievance Officer (Aadhiraksha)</h2>
<p>For any service deficiency, delay in policy delivery, or assistance in claim disputes, customers may reach out to our Principal Grievance Officer. We are committed to acknowledging complaints within 24 business hours and providing an amicable resolution within 14 working days.</p>

<h2>Level 2: Insurer Grievance Redressal Mechanism</h2>
<p>If the response or resolution from our internal desk is unsatisfactory within 14 working days, policyholders have the statutory right to escalate their grievance directly to the Grievance Redressal Officer (GRO) of the respective underwriting insurance partner (e.g., Star Health, Care, HDFC ERGO, ICICI Lombard, TATA AIG, LIC).</p>

<h2>Level 3: Insurance Regulatory Portal (Bima Bharosa / IRDAI)</h2>
<p>If the issue remains unresolved with the insurance company, you can escalate the matter directly to the Insurance Regulatory and Development Authority of India (IRDAI) through the <strong>Bima Bharosa</strong> grievance monitoring portal or the toll-free regulatory helpline:</p>
<ul>
  <li><strong>IRDAI Bima Bharosa Portal:</strong> <a href="https://bimabharosa.irdai.gov.in" target="_blank" rel="noreferrer">https://bimabharosa.irdai.gov.in</a></li>
  <li><strong>Toll-Free Consumer Helpline:</strong> 155255 / 1800 4254 732</li>
</ul>

<h2>Level 4: Insurance Ombudsman (CIO)</h2>
<p>For financial claim disputes, partial claim settlements, or policy cancellations where the claim value does not exceed ₹50 Lakhs, policyholders may approach the jurisdictional Office of the Insurance Ombudsman under the Insurance Ombudsman Rules, 2017.</p>`;

// Master registry of all public website pages
const MANAGED_PAGES = [
  {
    key: 'privacy',
    title: 'Privacy Policy',
    route: '/privacy-policy',
    type: 'document',
    icon: ShieldCheck,
    color: '#059669',
    bg: '#ecfdf5',
    fieldName: 'legalPrivacyDocumentHtml',
    defaultContent: DEFAULT_PRIVACY_HTML,
    subtitleField: 'legalPrivacyLastUpdated',
    defaultSubtitle: 'January 2026 | Effective immediately',
    description: 'Data protection practices, customer confidentiality & encryption'
  },
  {
    key: 'terms',
    title: 'Terms of Service',
    route: '/terms-of-service',
    type: 'document',
    icon: FileText,
    color: '#0284c7',
    bg: '#f0f9ff',
    fieldName: 'legalTermsDocumentHtml',
    defaultContent: DEFAULT_TERMS_HTML,
    subtitleField: 'legalTermsLastUpdated',
    defaultSubtitle: 'Agreement for Platform Usage & Quote Inquiries',
    description: 'Intermediary scope, utmost good faith declaration & fair usage'
  },
  {
    key: 'disclaimer',
    title: 'IRDAI Statutory Disclaimers',
    route: '/irdai-disclaimer',
    type: 'document',
    icon: AlertTriangle,
    color: '#d97706',
    bg: '#fffbeb',
    fieldName: 'legalDisclaimerDocumentHtml',
    defaultContent: DEFAULT_DISCLAIMER_HTML,
    subtitleField: 'legalDisclaimerSubtitle',
    defaultSubtitle: 'Mandated Public Disclosures under Insurance Act, 1938',
    description: 'Section 41 rebate prohibition, solicitation clause & tax notices'
  },
  {
    key: 'grievance_doc',
    title: 'Grievance Redressal Policy',
    route: '/grievance-redressal',
    type: 'document',
    icon: Scale,
    color: '#7c3aed',
    bg: '#f5f3ff',
    fieldName: 'legalGrievanceDocumentHtml',
    defaultContent: DEFAULT_GRIEVANCE_HTML,
    subtitleField: 'legalGrievanceSubtitle',
    defaultSubtitle: 'Multi-tier escalation framework for fair customer resolutions',
    description: '4-tier dispute resolution, Bima Bharosa & Ombudsman governance'
  },
  {
    key: 'about',
    title: 'About Us Company Profile',
    route: '/about',
    type: 'interactive',
    icon: Globe,
    color: '#2563eb',
    bg: '#eff6ff',
    description: 'Mission, vision, leadership team, corporate story & empanelled partners'
  },
  {
    key: 'posp',
    title: 'Become POSP Agent Portal',
    route: '/become-posp',
    type: 'interactive',
    icon: Sparkles,
    color: '#10b981',
    bg: '#f0fdf4',
    description: 'Agent onboarding hero, commission benefits, career steps & application flow'
  },
  {
    key: 'claims',
    title: 'Claims Assistance Desk',
    route: '/claim-support',
    type: 'interactive',
    icon: HeartHandshake,
    color: '#e11d48',
    bg: '#fff1f2',
    description: '24/7 cashless claim intimation, emergency concierge & garage directory'
  }
];

export default function CompanyPagesManagerView() {
  const { businessProfile, refreshBusinessProfile } = useBusinessProfile();
  const toast = useToast();

  const [activePageKey, setActivePageKey] = useState('privacy');
  const [subtitle, setSubtitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const activePage = MANAGED_PAGES.find(p => p.key === activePageKey) || MANAGED_PAGES[0];
  const editorRef = useRef(null);

  // Sync content whenever page tab changes or businessProfile loads
  useEffect(() => {
    if (activePage.type === 'document') {
      const savedHtml = businessProfile?.[activePage.fieldName] || activePage.defaultContent;
      if (editorRef.current) {
        editorRef.current.innerHTML = savedHtml;
      }
      if (activePage.subtitleField) {
        setSubtitle(businessProfile?.[activePage.subtitleField] || activePage.defaultSubtitle);
      }
    }
  }, [activePageKey, activePage, businessProfile]);

  const executeCmd = (command, value = null) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(command, false, value);
  };

  const insertCalloutBox = (type = 'warning') => {
    if (!editorRef.current) return;
    editorRef.current.focus();

    let calloutHtml = '';
    if (type === 'warning') {
      calloutHtml = `
<div style="background: #fffbeb; border: 1.5px solid #fef3c7; border-radius: 12px; padding: 1.25rem; margin: 1.25rem 0;">
  <h4 style="margin: 0 0 0.5rem 0; color: #92400e; font-size: 0.95rem; font-weight: 800;">
    ⚠️ Statutory Notice / Warning Title:
  </h4>
  <p style="margin: 0; font-size: 0.88rem; color: #78350f; line-height: 1.6;">
    Enter statutory clause, rebate prohibition, or policy warning text here...
  </p>
</div><p><br></p>`;
    } else if (type === 'info') {
      calloutHtml = `
<div style="background: #f0f9ff; border: 1.5px solid #bae6fd; border-radius: 12px; padding: 1.25rem; margin: 1.25rem 0;">
  <h4 style="margin: 0 0 0.5rem 0; color: #0369a1; font-size: 0.95rem; font-weight: 800;">
    ℹ️ Important Information / Policy Advisory:
  </h4>
  <p style="margin: 0; font-size: 0.88rem; color: #0c4a6e; line-height: 1.6;">
    Enter advisory details, cashless hospital information, or tax compliance note here...
  </p>
</div><p><br></p>`;
    }

    document.execCommand('insertHTML', false, calloutHtml);
  };

  const handleReset = () => {
    if (window.confirm(`Reset "${activePage.title}" to its official default template?`)) {
      if (editorRef.current) {
        editorRef.current.innerHTML = activePage.defaultContent;
      }
      toast.info('Restored default document template');
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const finalHtml = editorRef.current ? editorRef.current.innerHTML : '';
      const payload = {
        [activePage.fieldName]: finalHtml
      };
      if (activePage.subtitleField) {
        payload[activePage.subtitleField] = subtitle;
      }

      await portalService.updateBusinessProfile(payload);
      await refreshBusinessProfile();

      toast.success(`${activePage.title} saved and published live!`);
    } catch (err) {
      console.error('Failed to save page:', err);
      toast.error('Failed to save: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* 1. Header Hub */}
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        padding: '1.25rem 1.5rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 4px 10px rgba(2, 132, 199, 0.25)',
            flexShrink: 0
          }}>
            <Globe size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0f2b48', margin: 0 }}>
                Website Pages & Document Studio
              </h2>
              <span style={{
                background: '#ecfdf5',
                color: '#059669',
                border: '1px solid #a7f3d0',
                padding: '2px 8px',
                borderRadius: '9999px',
                fontSize: '0.72rem',
                fontWeight: 700
              }}>
                Live Synchronization
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '3px 0 0' }}>
              Enterprise visual document studio. Select a page, edit text naturally, and publish instantly.
            </p>
          </div>
        </div>

        {/* Global Live Website Quick Link */}
        <a
          href={activePage.route}
          target="_blank"
          rel="noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: '#f8fafc',
            border: '1px solid #cbd5e1',
            padding: '7px 14px',
            borderRadius: '10px',
            fontSize: '0.82rem',
            fontWeight: 700,
            color: '#334155',
            textDecoration: 'none',
            transition: 'all 0.15s ease'
          }}
        >
          <span>Open {activePage.route}</span>
          <ArrowUpRight size={14} />
        </a>
      </div>

      {/* 2. Workspace Studio Layout: Sidebar Pages Selector + Pure Document Canvas */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '300px 1fr',
        gap: '1.25rem',
        alignItems: 'start'
      }}>
        
        {/* Left Column: Managed Pages Navigator */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '1.25rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <div style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', padding: '0 6px 4px' }}>
            Managed Website Pages ({MANAGED_PAGES.length})
          </div>

          {MANAGED_PAGES.map((page) => {
            const Icon = page.icon;
            const isSelected = activePageKey === page.key;

            return (
              <button
                key={page.key}
                type="button"
                onClick={() => setActivePageKey(page.key)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '10px 12px',
                  borderRadius: '12px',
                  border: isSelected ? `2px solid ${page.color}` : '1px solid #f1f5f9',
                  background: isSelected ? page.bg : '#ffffff',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '10px',
                  background: isSelected ? '#ffffff' : page.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: page.color,
                  flexShrink: 0,
                  boxShadow: isSelected ? '0 2px 6px rgba(0,0,0,0.06)' : 'none'
                }}>
                  <Icon size={18} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                    <div style={{
                      fontSize: '0.86rem',
                      fontWeight: isSelected ? 800 : 700,
                      color: isSelected ? '#0f172a' : '#334155',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {page.title}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px', fontFamily: 'monospace' }}>
                    {page.route}
                  </div>
                </div>

                <ChevronRight size={14} color={isSelected ? page.color : '#cbd5e1'} style={{ marginTop: '8px' }} />
              </button>
            );
          })}
        </div>

        {/* Right Column: Full-Featured Pure Document Studio */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 14px rgba(0,0,0,0.04)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          
          {activePage.type === 'document' ? (
            /* Document Editor Canvas */
            <>
              {/* Document Studio Header */}
              <div style={{
                padding: '1rem 1.5rem',
                background: '#f8fafc',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div style={{ flex: 1, minWidth: '240px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f2b48', margin: 0 }}>
                      {activePage.title}
                    </h3>
                    <span style={{
                      background: 'rgba(2, 132, 199, 0.1)',
                      color: '#0284c7',
                      border: '1px solid rgba(2, 132, 199, 0.2)',
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      fontFamily: 'monospace'
                    }}>
                      {activePage.route}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '2px 0 0' }}>
                    {activePage.description}
                  </p>
                </div>

                {/* Top Action Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={handleReset}
                    title="Reset to official template"
                    style={{
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      padding: '7px 12px',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: '#dc2626',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <RotateCcw size={13} /> Reset
                  </button>

                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                      border: 'none',
                      color: '#ffffff',
                      padding: '7px 18px',
                      borderRadius: '8px',
                      fontSize: '0.84rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)',
                      opacity: isSaving ? 0.7 : 1
                    }}
                  >
                    {isSaving ? <RefreshCw size={14} className="spin" /> : <Check size={14} />}
                    {isSaving ? 'Publishing...' : 'Save & Publish Page'}
                  </button>
                </div>
              </div>

              {/* Subtitle / Notice Field */}
              {activePage.subtitleField && (
                <div style={{
                  padding: '0.65rem 1.5rem',
                  background: '#ffffff',
                  borderBottom: '1px solid #f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap' }}>
                    Header Subtitle / Effective Date:
                  </label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="e.g. Mandatory public disclosures or last updated date"
                    style={{
                      flex: 1,
                      padding: '5px 12px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.82rem',
                      color: '#0f172a'
                    }}
                  />
                </div>
              )}

              {/* Word/Notion Style Formatting Ribbon */}
              <div style={{
                padding: '8px 1.5rem',
                background: '#f8fafc',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                flexWrap: 'wrap'
              }}>
                <button type="button" onClick={() => executeCmd('undo')} title="Undo (Ctrl+Z)" style={ribbonBtnStyle}>
                  <Undo size={15} />
                </button>
                <button type="button" onClick={() => executeCmd('redo')} title="Redo (Ctrl+Y)" style={ribbonBtnStyle}>
                  <Redo size={15} />
                </button>

                <div style={{ width: '1px', height: '18px', background: '#cbd5e1', margin: '0 4px' }} />

                <button type="button" onClick={() => executeCmd('formatBlock', '<p>')} title="Paragraph" style={{ ...ribbonBtnStyle, fontSize: '0.78rem', fontWeight: 700 }}>
                  Normal
                </button>
                <button type="button" onClick={() => executeCmd('formatBlock', '<h2>')} title="Heading 2" style={ribbonBtnStyle}>
                  <Heading2 size={16} />
                </button>
                <button type="button" onClick={() => executeCmd('formatBlock', '<h3>')} title="Heading 3" style={ribbonBtnStyle}>
                  <Heading3 size={16} />
                </button>

                <div style={{ width: '1px', height: '18px', background: '#cbd5e1', margin: '0 4px' }} />

                <button type="button" onClick={() => executeCmd('bold')} title="Bold (Ctrl+B)" style={ribbonBtnStyle}>
                  <Bold size={15} />
                </button>
                <button type="button" onClick={() => executeCmd('italic')} title="Italic (Ctrl+I)" style={ribbonBtnStyle}>
                  <Italic size={15} />
                </button>
                <button type="button" onClick={() => executeCmd('underline')} title="Underline (Ctrl+U)" style={ribbonBtnStyle}>
                  <Underline size={15} />
                </button>

                <div style={{ width: '1px', height: '18px', background: '#cbd5e1', margin: '0 4px' }} />

                <button type="button" onClick={() => executeCmd('insertUnorderedList')} title="Bullet List" style={ribbonBtnStyle}>
                  <List size={16} />
                </button>
                <button type="button" onClick={() => executeCmd('insertOrderedList')} title="Numbered List" style={ribbonBtnStyle}>
                  <ListOrdered size={16} />
                </button>

                <div style={{ width: '1px', height: '18px', background: '#cbd5e1', margin: '0 4px' }} />

                <button type="button" onClick={() => executeCmd('justifyLeft')} title="Align Left" style={ribbonBtnStyle}>
                  <AlignLeft size={15} />
                </button>
                <button type="button" onClick={() => executeCmd('justifyCenter')} title="Align Center" style={ribbonBtnStyle}>
                  <AlignCenter size={15} />
                </button>

                <div style={{ width: '1px', height: '18px', background: '#cbd5e1', margin: '0 4px' }} />

                <button
                  type="button"
                  onClick={() => {
                    const url = prompt('Enter Web Link URL (e.g. https://...):');
                    if (url) executeCmd('createLink', url);
                  }}
                  title="Insert Hyperlink"
                  style={ribbonBtnStyle}
                >
                  <LinkIcon size={15} />
                </button>

                <div style={{ width: '1px', height: '18px', background: '#cbd5e1', margin: '0 4px' }} />

                <button
                  type="button"
                  onClick={() => insertCalloutBox('warning')}
                  title="Insert Amber Statutory Warning Box"
                  style={{
                    ...ribbonBtnStyle,
                    background: '#fffbeb',
                    border: '1px solid #fef3c7',
                    color: '#b45309',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    gap: '4px'
                  }}
                >
                  <AlertTriangle size={14} color="#b45309" /> + Warning Box
                </button>
                <button
                  type="button"
                  onClick={() => insertCalloutBox('info')}
                  title="Insert Blue Policy Advisory Box"
                  style={{
                    ...ribbonBtnStyle,
                    background: '#f0f9ff',
                    border: '1px solid #bae6fd',
                    color: '#0369a1',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    gap: '4px'
                  }}
                >
                  <Info size={14} color="#0284c7" /> + Advisory Box
                </button>
              </div>

              {/* Distraction-Free Word/Notion Canvas */}
              <div style={{
                minHeight: '520px',
                background: '#ffffff',
                padding: '2.5rem clamp(2rem, 5vw, 4.5rem)',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div
                  ref={editorRef}
                  contentEditable
                  suppressContentEditableWarning
                  style={{
                    flex: 1,
                    outline: 'none',
                    lineHeight: 1.85,
                    color: '#334155',
                    fontSize: '1.02rem',
                    minHeight: '480px'
                  }}
                />
              </div>

              {/* Bottom Quick Help */}
              <div style={{
                padding: '0.85rem 1.5rem',
                background: '#f8fafc',
                borderTop: '1px solid #e2e8f0',
                fontSize: '0.8rem',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span>Click anywhere on the document or inside amber warning boxes to type directly.</span>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  style={{
                    background: '#0284c7',
                    color: '#ffffff',
                    border: 'none',
                    padding: '6px 16px',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {isSaving ? 'Publishing...' : 'Save & Publish'}
                </button>
              </div>
            </>
          ) : (
            /* Interactive Live Page Hub (About, POSP, Claims) */
            <div style={{ padding: '3rem 2rem', textAlign: 'center', background: '#f8fafc', minHeight: '450px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                background: activePage.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: activePage.color,
                marginBottom: '1rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
              }}>
                {React.createElement(activePage.icon, { size: 32 })}
              </div>

              <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0f2b48', margin: '0 0 8px' }}>
                {activePage.title}
              </h3>
              <p style={{ maxWidth: '480px', color: '#64748b', fontSize: '0.88rem', lineHeight: 1.6, margin: '0 0 1.5rem' }}>
                {activePage.description}. This page features live in-context editing directly on its public interface with floating admin controls.
              </p>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <a
                  href={activePage.route}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: activePage.color,
                    color: '#ffffff',
                    padding: '10px 22px',
                    borderRadius: '10px',
                    fontSize: '0.88rem',
                    fontWeight: 800,
                    textDecoration: 'none',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.15)'
                  }}
                >
                  <span>Open & Edit {activePage.title}</span>
                  <ExternalLink size={16} />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const ribbonBtnStyle = {
  background: 'transparent',
  border: '1px solid transparent',
  color: '#475569',
  padding: '6px 8px',
  borderRadius: '6px',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.15s ease'
};
