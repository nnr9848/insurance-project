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

export default function LegalCompliance() {
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
            <ShieldCheck size={16} /> Legal & Regulatory Governance
          </div>

          <h1 style={{
            fontSize: 'clamp(1.85rem, 3.5vw, 2.5rem)',
            fontWeight: 800,
            margin: '0 0 0.75rem 0',
            lineHeight: 1.2
          }}>
            Trust, Transparency & Compliance
          </h1>

          <p style={{
            fontSize: '0.98rem',
            color: '#cbd5e1',
            maxWidth: '650px',
            lineHeight: 1.6,
            margin: 0
          }}>
            Aadhiraksha Insurance & Financial Services Pvt Ltd adheres strictly to the regulations and consumer protection guidelines established by the Insurance Regulatory and Development Authority of India (IRDAI).
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}>
                  <Lock size={22} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: '#0f2b48' }}>Privacy Policy</h2>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Last Updated: January 2026 | Effective immediately</div>
                </div>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '1.25rem 0 1.5rem' }} />

              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f2b48', marginTop: '1.5rem' }}>1. Commitment to Privacy</h3>
              <p>
                At <strong>Aadhiraksha Insurance & Financial Services Pvt Ltd</strong> ("Aadhiraksha", "we", "us", or "our"), we respect your privacy and are committed to protecting the personal data and financial information you share with us through our website, mobile interface, POSP portal, and client assistance desks.
              </p>

              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f2b48', marginTop: '1.5rem' }}>2. Information We Collect</h3>
              <p>To provide accurate insurance quotes, process policy issuance, execute renewals, and manage claim intimations, we collect:</p>
              <ul style={{ paddingLeft: '1.25rem', marginBottom: '1rem' }}>
                <li><strong>Identity Details:</strong> Full Name, Date of Birth, Gender, PAN, Aadhaar Number (for POSP onboarding as mandated by IRDAI).</li>
                <li><strong>Contact Information:</strong> Mobile Phone Number, Email Address, Communication/Residential Address, City, State, and Pincode.</li>
                <li><strong>Vehicle & Asset Details:</strong> Vehicle Registration Number, Make, Model, RTO City, Year of Manufacture, and Previous Policy Details (for Motor Insurance).</li>
                <li><strong>Health & Lifestyle Metrics:</strong> Age, Pre-existing Medical Conditions, Tobacco/Smoking habits, and Sum Assured requirements (for Health and Term Life policies).</li>
              </ul>

              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f2b48', marginTop: '1.5rem' }}>3. How Your Information is Used</h3>
              <p>
                Your data is strictly utilized to generate real-time comparison quotes from our empanelled IRDAI-licensed insurance partners, verify eligibility, transmit necessary underwriting information for policy binding, facilitate cashless hospitalizations/garage approvals, and deliver automated policy renewal reminders.
              </p>

              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f2b48', marginTop: '1.5rem' }}>4. Zero-Spam & Data Security Guarantee</h3>
              <p>
                We do not sell, rent, or trade your personal information to third-party marketing brokers. All database transmissions are encrypted using enterprise-grade SSL/TLS protocols with role-based cryptographic access controls.
              </p>
            </div>
          )}

          {/* TAB 2: TERMS OF SERVICE */}
          {activeTab === 'terms' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
                  <FileText size={22} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: '#0f2b48' }}>Terms of Service</h2>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Agreement for Platform Usage & Quote Inquiries</div>
                </div>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '1.25rem 0 1.5rem' }} />

              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f2b48', marginTop: '1.5rem' }}>1. Acceptance of Terms</h3>
              <p>
                By accessing, browsing, or submitting quotation/claim forms on the Aadhiraksha portal, you agree to be bound by these Terms of Service, applicable laws, and regulatory guidelines set forth by the IRDAI.
              </p>

              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f2b48', marginTop: '1.5rem' }}>2. Role of Aadhiraksha Insurance</h3>
              <p>
                Aadhiraksha functions as a licensed insurance intermediary facilitating price comparison, pre-sales advisory, and post-sales claims assistance. The contract of insurance is strictly between the insured customer and the respective insurance underwriter (e.g., Star Health, HDFC ERGO, ICICI Lombard, TATA AIG, LIC, etc.).
              </p>

              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f2b48', marginTop: '1.5rem' }}>3. Accuracy of Declarations (Utmost Good Faith)</h3>
              <p>
                Insurance contracts in India operate under the doctrine of <em>Uberrima Fides</em> (Utmost Good Faith). It is the sole responsibility of the policyholder to provide true, complete, and accurate declarations regarding pre-existing medical conditions, vehicle modifications, prior claims, and age. Any misrepresentation or suppression of material facts may result in rejection of claims by the insurer under Section 45 of the Insurance Act, 1938.
              </p>
            </div>
          )}

          {/* TAB 3: IRDAI DISCLAIMER */}
          {activeTab === 'disclaimer' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
                  <AlertTriangle size={22} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: '#0f2b48' }}>IRDAI Statutory Disclaimers</h2>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Mandated Public Disclosures under Insurance Act, 1938</div>
                </div>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '1.25rem 0 1.5rem' }} />

              <div style={{ background: '#fffbeb', border: '1.5px solid #fef3c7', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#92400e', fontSize: '0.95rem', fontWeight: 800 }}>
                  ⚠️ Section 41 of the Insurance Act, 1938 (Prohibition of Rebates):
                </h4>
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#78350f', lineHeight: 1.6 }}>
                  (1) No person shall allow or offer to allow, either directly or indirectly, as an inducement to any person to take out or renew or continue an insurance in respect of any kind of risk relating to lives or property in India, any rebate of the whole or part of the commission payable or any rebate of the premium shown on the policy, nor shall any person taking out or renewing or continuing a policy accept any rebate, except such rebate as may be allowed in accordance with the published prospectuses or tables of the insurer.
                  <br /><br />
                  (2) Any person making default in complying with the provisions of this section shall be liable for a penalty which may extend to <strong>ten lakh rupees</strong>.
                </p>
              </div>

              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f2b48', marginTop: '1.5rem' }}>Insurance is the Subject Matter of Solicitation</h3>
              <p>
                Product information, premiums, discounts, and benefits displayed on this platform are indicative and based on data provided by respective insurance companies. Please read the policy sales brochure and wording carefully before concluding any sale.
              </p>

              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f2b48', marginTop: '1.5rem' }}>Tax Disclaimer</h3>
              <p>
                Tax deductions under Section 80C, 80D, and exemptions under Section 10(10D) of the Income Tax Act, 1961 are subject to prevailing provisions and amendments in tax laws. Clients are advised to consult their qualified tax advisor.
              </p>
            </div>
          )}

          {/* TAB 4: GRIEVANCE REDRESSAL */}
          {activeTab === 'grievance' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c3aed' }}>
                  <Scale size={22} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: '#0f2b48' }}>Grievance Redressal & Ombudsman</h2>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Multi-tier escalation framework for fair customer resolutions</div>
                </div>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '1.25rem 0 1.5rem' }} />

              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f2b48' }}>Level 1: Internal Grievance Officer (Aadhiraksha)</h3>
              <p>
                For any service deficiency, delay in policy delivery, or assistance in claim disputes, customers may reach out to our Principal Grievance Officer:
              </p>
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                <div><strong>Grievance Officer:</strong> Customer Care Head</div>
                <div><strong>Email:</strong> <a href="mailto:grievance@aadhirakshainsurance.com" style={{ color: '#0284c7' }}>grievance@aadhirakshainsurance.com</a></div>
                <div><strong>Direct Helpline:</strong> +91 8367415156 (Mon - Sat, 9:30 AM to 6:30 PM)</div>
                <div><strong>Office:</strong> 4th Floor, Mytri Constructions, Opp: ECIL Busstop, ECIL, Hyderabad.</div>
              </div>

              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f2b48' }}>Level 2: Insurer Grievance Redressal Mechanism</h3>
              <p>
                If the response from our desk is unsatisfactory within 14 working days, you can lodge a formal complaint directly with the Grievance Redressal Officer (GRO) of the respective underwriting insurance company.
              </p>

              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f2b48' }}>Level 3: Insurance Regulatory Portal (Bima Bharosa / IRDAI)</h3>
              <p>
                You may also register complaints with the IRDAI's Integrated Grievance Management System (Bima Bharosa):
              </p>
              <ul style={{ paddingLeft: '1.25rem', marginBottom: '1rem' }}>
                <li><strong>Toll Free Helpline:</strong> 155255 / 1800 4254 732</li>
                <li><strong>IRDAI Bima Bharosa Portal:</strong> <a href="https://bimabharosa.irdai.gov.in" target="_blank" rel="noreferrer" style={{ color: '#0284c7' }}>bimabharosa.irdai.gov.in</a></li>
              </ul>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
