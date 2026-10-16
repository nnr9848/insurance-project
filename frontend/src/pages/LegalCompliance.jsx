import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  FileText, 
  Lock, 
  AlertTriangle, 
  Scale, 
  HelpCircle, 
  PhoneCall, 
  Mail, 
  MapPin,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { useBusinessProfile } from '../context/BusinessProfileContext';
import { useAuth } from '../context/AuthContext';
import InContextPageEditorModal, { InContextAdminBar, SectionEditTrigger } from '../components/common/InContextPageEditorModal';
import RichDocumentEditorModal from '../components/common/RichDocumentEditorModal';

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

export default function LegalCompliance() {
  const { businessProfile } = useBusinessProfile();
  const { isSuperAdmin, isManager } = useAuth();
  const [activeEditorModal, setActiveEditorModal] = useState(null); // 'hero' | 'privacy' | 'terms' | 'disclaimer' | 'grievance' | null
  const location = useLocation();

  // Determine initial tab from route
  const getTabFromPath = () => {
    if (location.pathname.includes('terms')) return 'terms';
    if (location.pathname.includes('disclaimer') || location.pathname.includes('irdai')) return 'disclaimer';
    if (location.pathname.includes('grievance')) return 'grievance';
    return 'privacy';
  };

  const [activeTab, setActiveTab] = useState(getTabFromPath());

  useEffect(() => {
    setActiveTab(getTabFromPath());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  const tabs = [
    { id: 'privacy', label: 'Privacy Policy', icon: Lock, path: '/privacy-policy' },
    { id: 'terms', label: 'Terms of Service', icon: FileText, path: '/terms-of-service' },
    { id: 'disclaimer', label: 'IRDAI Disclaimer', icon: AlertTriangle, path: '/irdai-disclaimer' },
    { id: 'grievance', label: 'Grievance Redressal', icon: Scale, path: '/grievance-redressal' }
  ];

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', color: '#0f2b48', paddingBottom: '4rem' }}>
      
      {/* 1. Modal: Page Hero Header */}
      <InContextPageEditorModal
        isOpen={activeEditorModal === 'hero'}
        onClose={() => setActiveEditorModal(null)}
        pageTitle="Legal Page Hero Header"
        pageRoute="/legal-compliance (Hero Banner)"
        fields={[
          {
            name: 'legalPageBadge',
            label: 'Header Badge Pill',
            defaultValue: 'Legal & Regulatory Governance',
            placeholder: 'e.g. Legal & Regulatory Governance'
          },
          {
            name: 'legalPageHeroTitle',
            label: 'Main Page Headline',
            defaultValue: 'Trust, Transparency & Compliance',
            placeholder: 'e.g. Trust, Transparency & Compliance'
          },
          {
            name: 'legalPageHeroSubtitle',
            label: 'Header Introductory Paragraph',
            type: 'textarea',
            rows: 3,
            defaultValue: 'Aadhiraksha Insurance & Financial Services Pvt Ltd adheres strictly to the regulations and consumer protection guidelines established by the Insurance Regulatory and Development Authority of India (IRDAI).',
            placeholder: 'Statutory compliance introductory statement'
          }
        ]}
      />

      {/* 2. Rich Document Editor: Tab 1 Privacy Policy */}
      <RichDocumentEditorModal
        isOpen={activeEditorModal === 'privacy'}
        onClose={() => setActiveEditorModal(null)}
        documentTitle="Privacy Policy Document Editor"
        pageRoute="/privacy-policy"
        fieldName="legalPrivacyDocumentHtml"
        defaultHtml={DEFAULT_PRIVACY_HTML}
        effectiveDateFieldName="legalPrivacyLastUpdated"
        defaultEffectiveDate="January 2026 | Effective immediately"
      />

      {/* 3. Rich Document Editor: Tab 2 Terms of Service */}
      <RichDocumentEditorModal
        isOpen={activeEditorModal === 'terms'}
        onClose={() => setActiveEditorModal(null)}
        documentTitle="Terms of Service Document Editor"
        pageRoute="/terms-of-service"
        fieldName="legalTermsDocumentHtml"
        defaultHtml={DEFAULT_TERMS_HTML}
        effectiveDateFieldName="legalTermsLastUpdated"
        defaultEffectiveDate="Agreement for Platform Usage & Quote Inquiries"
      />

      {/* 4. Rich Document Editor: Tab 3 IRDAI Statutory Disclaimers */}
      <RichDocumentEditorModal
        isOpen={activeEditorModal === 'disclaimer'}
        onClose={() => setActiveEditorModal(null)}
        documentTitle="IRDAI Disclaimers Document Editor"
        pageRoute="/irdai-disclaimer"
        fieldName="legalDisclaimerDocumentHtml"
        defaultHtml={DEFAULT_DISCLAIMER_HTML}
        effectiveDateFieldName="legalDisclaimerSubtitle"
        defaultEffectiveDate="Mandated Public Disclosures under Insurance Act, 1938"
      />

      {/* 5. Rich Document Editor: Tab 4 Grievance Redressal Policy Framework */}
      <RichDocumentEditorModal
        isOpen={activeEditorModal === 'grievance_doc'}
        onClose={() => setActiveEditorModal(null)}
        documentTitle="Grievance Redressal Escalation Framework"
        pageRoute="/grievance-redressal"
        fieldName="legalGrievanceDocumentHtml"
        defaultHtml={DEFAULT_GRIEVANCE_HTML}
        effectiveDateFieldName="legalGrievanceTiming"
        defaultEffectiveDate="Mon - Sat, 9:30 AM to 6:30 PM"
      />

      {/* 6. Contact Officer Setup Modal for Tab 4 */}
      <InContextPageEditorModal
        isOpen={activeEditorModal === 'grievance_officer'}
        onClose={() => setActiveEditorModal(null)}
        pageTitle="Grievance Officer Direct Contact Setup"
        pageRoute="/grievance-redressal"
        fields={[
          {
            name: 'legalGrievanceOfficerName',
            label: 'Level 1: Grievance Officer Name / Designation',
            defaultValue: 'Customer Care Head',
            placeholder: 'e.g. Customer Care Head / Principal Grievance Officer'
          },
          {
            name: 'legalGrievanceEmail',
            label: 'Level 1: Official Grievance Email',
            type: 'email',
            defaultValue: 'grievance@aadhirakshainsurance.com',
            placeholder: 'e.g. grievance@aadhirakshainsurance.com'
          },
          {
            name: 'legalGrievancePhone',
            label: 'Level 1: Direct Grievance Helpline',
            defaultValue: '+91 8367415156',
            placeholder: 'e.g. +91 8367415156'
          },
          {
            name: 'legalGrievanceTiming',
            label: 'Level 1: Helpline Availability Hours',
            defaultValue: 'Mon - Sat, 9:30 AM to 6:30 PM',
            placeholder: 'e.g. Mon - Sat, 9:30 AM to 6:30 PM'
          },
          {
            name: 'legalGrievanceAddress',
            label: 'Level 1: Physical Redressal Office Suite',
            type: 'textarea',
            rows: 2,
            defaultValue: '4th Floor, Mytri Constructions, Opp: ECIL Busstop, ECIL, Hyderabad.',
            placeholder: 'e.g. 4th Floor, Mytri Constructions, Opp: ECIL Busstop, ECIL, Hyderabad.'
          }
        ]}
      />

      {/* 1. HERO HEADER */}
      <section style={{
        background: 'linear-gradient(135deg, #071728 0%, #0c2b48 100%)',
        color: '#ffffff',
        padding: '3.5rem 0 2.5rem 0',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: '450px',
          height: '450px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(2, 132, 199, 0.2) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div className="container" style={{ maxWidth: '1100px', position: 'relative', zIndex: 1 }}>

          {/* Section Edit Trigger: Hero Header */}
          {(isSuperAdmin || isManager) && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.75rem' }}>
              <SectionEditTrigger
                label="Edit"
                tooltip="Edit Page Hero Headline & Subtitle"
                onClick={() => setActiveEditorModal('hero')}
              />
            </div>
          )}

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(2, 132, 199, 0.2)',
            border: '1px solid rgba(2, 132, 199, 0.4)',
            padding: '6px 14px',
            borderRadius: '9999px',
            fontSize: '0.82rem',
            fontWeight: 700,
            color: '#38bdf8',
            marginBottom: '1rem'
          }}>
            <ShieldCheck size={16} /> {businessProfile?.legalPageBadge || 'Legal & Regulatory Governance'}
          </div>

          <h1 style={{
            fontSize: 'clamp(1.85rem, 3.5vw, 2.5rem)',
            fontWeight: 800,
            margin: '0 0 0.75rem 0',
            lineHeight: 1.2,
            color: '#ffffff',
            textShadow: '0 2px 10px rgba(0, 0, 0, 0.4)'
          }}>
            {businessProfile?.legalPageHeroTitle || 'Trust, Transparency & Compliance'}
          </h1>

          <p style={{
            fontSize: '1rem',
            color: '#e2e8f0',
            maxWidth: '680px',
            lineHeight: 1.65,
            fontWeight: 400,
            margin: 0
          }}>
            {businessProfile?.legalPageHeroSubtitle || 'Aadhiraksha Insurance & Financial Services Pvt Ltd adheres strictly to the regulations and consumer protection guidelines established by the Insurance Regulatory and Development Authority of India (IRDAI).'}
          </p>
        </div>
      </section>

      {/* 2. MAIN TAB NAVIGATION & CONTENT CONTAINER */}
      <div className="container" style={{ maxWidth: '1100px', marginTop: '2rem' }}>
        
        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          background: '#ffffff',
          padding: '8px',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(15, 43, 72, 0.04)',
          overflowX: 'auto',
          marginBottom: '2rem'
        }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <Link
                key={tab.id}
                to={tab.path}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 18px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  fontSize: '0.88rem',
                  fontWeight: isActive ? 800 : 600,
                  color: isActive ? '#0284c7' : '#64748b',
                  background: isActive ? '#f0f9ff' : 'transparent',
                  border: `1.5px solid ${isActive ? '#bae6fd' : 'transparent'}`,
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={17} color={isActive ? '#0284c7' : '#94a3b8'} />
                {tab.label}
              </Link>
            );
          })}
        </div>

        {/* Tab Content Cards */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: 'clamp(1.5rem, 3vw, 2.5rem)',
          boxShadow: '0 4px 15px rgba(15, 43, 72, 0.04)',
          lineHeight: 1.7,
          color: '#334155'
        }}>

          {/* TAB 1: PRIVACY POLICY */}
          {activeTab === 'privacy' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}>
                    <Lock size={22} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: '#0f2b48' }}>Privacy Policy</h2>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Last Updated: {businessProfile?.legalPrivacyLastUpdated || 'January 2026 | Effective immediately'}</div>
                  </div>
                </div>
                {(isSuperAdmin || isManager) && (
                  <SectionEditTrigger
                    label="Edit"
                    tooltip="Edit full Privacy Policy in Document Editor"
                    onClick={() => setActiveEditorModal('privacy')}
                  />
                )}
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '1.25rem 0 1.5rem' }} />

              <div 
                className="legal-document-content"
                dangerouslySetInnerHTML={{ __html: businessProfile?.legalPrivacyDocumentHtml || DEFAULT_PRIVACY_HTML }}
              />
            </div>
          )}

          {/* TAB 2: TERMS OF SERVICE */}
          {activeTab === 'terms' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
                    <FileText size={22} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: '#0f2b48' }}>Terms of Service</h2>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{businessProfile?.legalTermsLastUpdated || 'Agreement for Platform Usage & Quote Inquiries'}</div>
                  </div>
                </div>
                {(isSuperAdmin || isManager) && (
                  <SectionEditTrigger
                    label="Edit"
                    tooltip="Edit full Terms of Service in Document Editor"
                    onClick={() => setActiveEditorModal('terms')}
                  />
                )}
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '1.25rem 0 1.5rem' }} />

              <div 
                className="legal-document-content"
                dangerouslySetInnerHTML={{ __html: businessProfile?.legalTermsDocumentHtml || DEFAULT_TERMS_HTML }}
              />
            </div>
          )}

          {/* TAB 3: IRDAI DISCLAIMER */}
          {activeTab === 'disclaimer' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
                    <AlertTriangle size={22} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: '#0f2b48' }}>IRDAI Statutory Disclaimers</h2>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{businessProfile?.legalDisclaimerSubtitle || 'Mandated Public Disclosures under Insurance Act, 1938'}</div>
                  </div>
                </div>
                {(isSuperAdmin || isManager) && (
                  <SectionEditTrigger
                    label="Edit"
                    tooltip="Edit full IRDAI Disclaimers in Document Editor"
                    onClick={() => setActiveEditorModal('disclaimer')}
                  />
                )}
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '1.25rem 0 1.5rem' }} />

              <div 
                className="legal-document-content"
                dangerouslySetInnerHTML={{ __html: businessProfile?.legalDisclaimerDocumentHtml || DEFAULT_DISCLAIMER_HTML }}
              />
            </div>
          )}

          {/* TAB 4: GRIEVANCE REDRESSAL */}
          {activeTab === 'grievance' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c3aed' }}>
                    <Scale size={22} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: '#0f2b48' }}>Grievance Redressal & Ombudsman</h2>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Multi-tier escalation framework for fair customer resolutions</div>
                  </div>
                </div>
                {(isSuperAdmin || isManager) && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <SectionEditTrigger
                      label="Edit Officer Details"
                      tooltip="Update Grievance Officer phone, email, and address"
                      onClick={() => setActiveEditorModal('grievance_officer')}
                    />
                    <SectionEditTrigger
                      label="Edit Escalation Document"
                      tooltip="Edit multi-tier escalation framework in Document Editor"
                      onClick={() => setActiveEditorModal('grievance_doc')}
                    />
                  </div>
                )}
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '1.25rem 0 1.5rem' }} />

              {/* Designated Officer Contact Card */}
              <div style={{
                background: '#f8fafc',
                border: '1.5px solid #e2e8f0',
                borderRadius: '12px',
                padding: '1.25rem 1.5rem',
                marginBottom: '1.75rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '12px',
                fontSize: '0.9rem'
              }}>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Designated Grievance Officer</div>
                  <div style={{ fontWeight: 800, color: '#0f2b48', fontSize: '1rem', marginTop: '2px' }}>
                    {businessProfile?.legalGrievanceOfficerName || 'Customer Care Head'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Direct Helpline</div>
                  <div style={{ fontWeight: 700, color: '#0284c7', marginTop: '2px' }}>
                    <a href={`tel:${businessProfile?.legalGrievancePhone || businessProfile?.supportPhone || '+91 8367415156'}`} style={{ color: '#0284c7', textDecoration: 'none' }}>
                      {businessProfile?.legalGrievancePhone || businessProfile?.supportPhone || '+91 8367415156'}
                    </a>
                    <span style={{ fontSize: '0.76rem', color: '#64748b', marginLeft: '6px' }}>({businessProfile?.legalGrievanceTiming || 'Mon - Sat, 9:30 AM - 6:30 PM'})</span>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Official Redressal Email</div>
                  <div style={{ fontWeight: 700, color: '#0284c7', marginTop: '2px' }}>
                    <a href={`mailto:${businessProfile?.legalGrievanceEmail || 'grievance@aadhirakshainsurance.com'}`} style={{ color: '#0284c7', textDecoration: 'none' }}>
                      {businessProfile?.legalGrievanceEmail || 'grievance@aadhirakshainsurance.com'}
                    </a>
                  </div>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Registered Redressal Office</div>
                  <div style={{ color: '#334155', marginTop: '2px' }}>
                    {businessProfile?.legalGrievanceAddress || businessProfile?.registeredOfficeAddress || '4th Floor, Mytri Constructions, Opp: ECIL Busstop, ECIL, Hyderabad.'}
                  </div>
                </div>
              </div>

              {/* Full Multi-Tier Policy Escalation Document Body */}
              <div 
                className="legal-document-content"
                dangerouslySetInnerHTML={{ __html: businessProfile?.legalGrievanceDocumentHtml || DEFAULT_GRIEVANCE_HTML }}
              />
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
