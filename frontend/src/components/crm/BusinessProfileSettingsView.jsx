import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Globe, 
  ShieldCheck, 
  Save, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Eye,
  EyeOff,
  Send,
  MessageSquare,
  Zap,
  Lock
} from 'lucide-react';
import { portalService } from '../../services/api';
import { useBusinessProfile } from '../../context/BusinessProfileContext';
import { useToast } from '../../context/ToastContext';

export default function BusinessProfileSettingsView() {
  const { businessProfile, refreshBusinessProfile } = useBusinessProfile();
  const toast = useToast();

  const [formData, setFormData] = useState({
    companyName: '',
    tagline: '',
    primaryPhone: '',
    secondaryPhone: '',
    whatsappNumber: '',
    supportEmail: '',
    claimsEmail: '',
    websiteUrl: '',
    officeAddressLine1: '',
    officeAddressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    businessHours: '',
    irdaiRegistrationNo: '',
    // WhatsApp Meta Cloud API Integration Settings
    whatsappEnabled: false,
    whatsappApiUrl: 'https://graph.facebook.com/v19.0',
    whatsappPhoneNumberId: '',
    whatsappAccessToken: '',
    whatsappBusinessAccountId: '',
    notifyLeadsOnWhatsapp: true,
    notifyClaimsOnWhatsapp: true,
    notifyDocsOnWhatsapp: true
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [testPhone, setTestPhone] = useState('');
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    if (businessProfile) {
      setFormData({
        companyName: businessProfile.companyName || '',
        tagline: businessProfile.tagline || '',
        primaryPhone: businessProfile.primaryPhone || '',
        secondaryPhone: businessProfile.secondaryPhone || '',
        whatsappNumber: businessProfile.whatsappNumber || '',
        supportEmail: businessProfile.supportEmail || '',
        claimsEmail: businessProfile.claimsEmail || '',
        websiteUrl: businessProfile.websiteUrl || '',
        officeAddressLine1: businessProfile.officeAddressLine1 || '',
        officeAddressLine2: businessProfile.officeAddressLine2 || '',
        city: businessProfile.city || '',
        state: businessProfile.state || '',
        postalCode: businessProfile.postalCode || '',
        businessHours: businessProfile.businessHours || '',
        irdaiRegistrationNo: businessProfile.irdaiRegistrationNo || '',
        // WhatsApp settings
        whatsappEnabled: businessProfile.whatsappEnabled ?? false,
        whatsappApiUrl: businessProfile.whatsappApiUrl || 'https://graph.facebook.com/v19.0',
        whatsappPhoneNumberId: businessProfile.whatsappPhoneNumberId || '',
        whatsappAccessToken: businessProfile.whatsappAccessToken || '',
        whatsappBusinessAccountId: businessProfile.whatsappBusinessAccountId || '',
        notifyLeadsOnWhatsapp: businessProfile.notifyLeadsOnWhatsapp ?? true,
        notifyClaimsOnWhatsapp: businessProfile.notifyClaimsOnWhatsapp ?? true,
        notifyDocsOnWhatsapp: businessProfile.notifyDocsOnWhatsapp ?? true
      });
      if (businessProfile.whatsappNumber) {
        setTestPhone(businessProfile.whatsappNumber);
      }
    }
  }, [businessProfile]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleTestWhatsApp = async () => {
    const cleanPhone = (testPhone || formData.whatsappNumber || formData.primaryPhone || '').trim();
    if (!cleanPhone) {
      toast.error('Please enter a recipient mobile number to receive the test message.');
      return;
    }
    if (!formData.whatsappPhoneNumberId?.trim() || !formData.whatsappAccessToken?.trim()) {
      toast.error('Please enter both Meta Phone Number ID and Access Token before testing.');
      return;
    }

    setIsTesting(true);
    try {
      // First save current credentials to DB so backend test uses latest
      await portalService.updateBusinessProfile(formData);
      await refreshBusinessProfile();

      const res = await portalService.testWhatsAppMessage(cleanPhone);
      if (res.success) {
        toast.success(`Success! Live test WhatsApp message dispatched to ${cleanPhone}. Check your phone!`);
      } else {
        toast.error(res.message || 'Failed to dispatch test message.');
      }
    } catch (err) {
      console.error('WhatsApp Test error:', err);
      toast.error(err.response?.data?.message || 'Failed to dispatch test message. Verify Phone Number ID & Access Token.');
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.companyName?.trim()) {
      toast.error('Company Name is required.');
      return;
    }
    if (!formData.primaryPhone?.trim()) {
      toast.error('Primary Phone / Helpline is required.');
      return;
    }
    if (!formData.supportEmail?.trim()) {
      toast.error('Support Email is required.');
      return;
    }

    setIsSaving(true);
    try {
      await portalService.updateBusinessProfile(formData);
      await refreshBusinessProfile();
      toast.success('Company Profile, Helpline & Address updated successfully across the platform!');
    } catch (err) {
      console.error('Failed to update business profile:', err);
      toast.error('Failed to update profile: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Top Banner */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#059669'
          }}>
            <Building2 size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f2b48', margin: '0 0 2px' }}>
              Company Profile & Public Contact Settings
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
              Centrally manage the phone numbers, emails, and address rendered in the website Header, Footer, and Contact Desks.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={async () => {
            setIsLoading(true);
            await refreshBusinessProfile();
            setIsLoading(false);
            toast.success('Settings refreshed from server.');
          }}
          disabled={isLoading || isSaving}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            padding: '8px 14px',
            fontSize: '0.82rem',
            fontWeight: 700,
            color: '#334155',
            cursor: 'pointer'
          }}
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          <span>Reload</span>
        </button>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Section 1: Corporate Identity & Registration */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '1.5rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f2b48', margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={18} color="#059669" />
            <span>Corporate Identity & Regulatory Details</span>
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Registered Company Name <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                IRDAI Registration Number
              </label>
              <input
                type="text"
                name="irdaiRegistrationNo"
                value={formData.irdaiRegistrationNo}
                onChange={handleChange}
                placeholder="e.g. IRDAI/IMF/TS/2026/00482"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem'
                }}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Corporate Tagline / Legal Subtitle
              </label>
              <input
                type="text"
                name="tagline"
                value={formData.tagline}
                onChange={handleChange}
                placeholder="e.g. IRDAI Registered Insurance Marketing & Advisory Partner"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem'
                }}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Telephony, WhatsApp & Digital Connect */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '1.5rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f2b48', margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Phone size={18} color="#0284c7" />
            <span>Telephony, WhatsApp & Digital Helpline</span>
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Primary Helpline Phone (Header & Footer) <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                name="primaryPhone"
                value={formData.primaryPhone}
                onChange={handleChange}
                placeholder="+91 8367415156"
                required
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem',
                  fontWeight: 600
                }}
              />
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                Shown on the desktop header pill, mobile header, and footer.
              </span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                WhatsApp Direct Number
              </label>
              <input
                type="text"
                name="whatsappNumber"
                value={formData.whatsappNumber}
                onChange={handleChange}
                placeholder="+91 8367415156"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                General Support Email <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="email"
                name="supportEmail"
                value={formData.supportEmail}
                onChange={handleChange}
                placeholder="info@aadhirakshainsurance.com"
                required
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Claims Assistance Email
              </label>
              <input
                type="email"
                name="claimsEmail"
                value={formData.claimsEmail}
                onChange={handleChange}
                placeholder="claims@aadhirakshainsurance.com"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Official Website URL
              </label>
              <input
                type="url"
                name="websiteUrl"
                value={formData.websiteUrl}
                onChange={handleChange}
                placeholder="https://www.aadhirakshainsurance.com"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Operational Hours
              </label>
              <input
                type="text"
                name="businessHours"
                value={formData.businessHours}
                onChange={handleChange}
                placeholder="Mon - Sat, 9:30 AM to 6:30 PM"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem'
                }}
              />
            </div>
          </div>
        </div>

        {/* Section 3: Physical Communication Address */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '1.5rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f2b48', margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={18} color="#ea580c" />
            <span>Communication & Registered Office Address</span>
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Address Line 1 <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                name="officeAddressLine1"
                value={formData.officeAddressLine1}
                onChange={handleChange}
                placeholder="4th Floor, Mytri Constructions,"
                required
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem'
                }}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Address Line 2 (Landmark, Area) <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                name="officeAddressLine2"
                value={formData.officeAddressLine2}
                onChange={handleChange}
                placeholder="Opp: ECIL Busstop, ECIL, Hyderabad."
                required
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                City
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Hyderabad"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                State
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="Telangana"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Postal / PIN Code
              </label>
              <input
                type="text"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                placeholder="500062"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem'
                }}
              />
            </div>
          </div>
        </div>

        {/* Section 4: Meta WhatsApp Cloud API & Automated Notifications */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: formData.whatsappEnabled ? '2px solid #10b981' : '1px solid #e2e8f0',
          padding: '1.5rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
          transition: 'all 0.2s ease'
        }}>
          {/* Section Header with Master Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: '#ecfdf5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#059669'
              }}>
                <MessageSquare size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f2b48', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>Meta WhatsApp Cloud API & Notifications</span>
                  {formData.whatsappEnabled ? (
                    <span style={{ fontSize: '0.72rem', background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                      ● Active
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.72rem', background: '#f1f5f9', color: '#64748b', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                      ○ Inactive (Mock Mode)
                    </span>
                  )}
                </h3>
                <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '2px 0 0' }}>
                  Send instant quote confirmations, cashless claim intimations, and vault document updates directly to customer WhatsApp numbers.
                </p>
              </div>
            </div>

            {/* Master Switch */}
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none' }}>
              <input
                type="checkbox"
                name="whatsappEnabled"
                checked={formData.whatsappEnabled}
                onChange={handleChange}
                style={{ width: '18px', height: '18px', accentColor: '#059669', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: formData.whatsappEnabled ? '#059669' : '#475569' }}>
                Enable Live WhatsApp Sending
              </span>
            </label>
          </div>

          {/* Credentials Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Meta Phone Number ID
              </label>
              <input
                type="text"
                name="whatsappPhoneNumberId"
                value={formData.whatsappPhoneNumberId}
                onChange={handleChange}
                placeholder="e.g. 105938472910482"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem',
                  fontFamily: 'monospace'
                }}
              />
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                Found in Meta for Developers &rarr; WhatsApp &rarr; API Setup
              </span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                WhatsApp Business Account ID (WABA)
              </label>
              <input
                type="text"
                name="whatsappBusinessAccountId"
                value={formData.whatsappBusinessAccountId}
                onChange={handleChange}
                placeholder="e.g. 192837465019283"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem',
                  fontFamily: 'monospace'
                }}
              />
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                Used for template synchronization and business identification
              </span>
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Meta Graph API Access Token (Permanent System User Token)
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type={showToken ? 'text' : 'password'}
                  name="whatsappAccessToken"
                  value={formData.whatsappAccessToken}
                  onChange={handleChange}
                  placeholder="EAAG..."
                  style={{
                    width: '100%',
                    padding: '8px 40px 8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    fontFamily: 'monospace'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title={showToken ? 'Hide Token' : 'Show Token'}
                >
                  {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                Meta Business Settings &rarr; System Users &rarr; Generate Permanent Token with <code>whatsapp_business_messaging</code> permission.
              </span>
            </div>
          </div>

          {/* Automated Event Trigger Toggles */}
          <div style={{
            background: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '1rem',
            marginBottom: '1.25rem'
          }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              ⚡ Notification Event Triggers
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.75rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#334155', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="notifyLeadsOnWhatsapp"
                  checked={formData.notifyLeadsOnWhatsapp}
                  onChange={handleChange}
                  style={{ accentColor: '#059669', width: '16px', height: '16px' }}
                />
                <span>Quote Inquiries (Instant Welcome & Advisor Connect)</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#334155', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="notifyClaimsOnWhatsapp"
                  checked={formData.notifyClaimsOnWhatsapp}
                  onChange={handleChange}
                  style={{ accentColor: '#059669', width: '16px', height: '16px' }}
                />
                <span>Claim Submissions (Intimation Number & Cashless Desk)</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#334155', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="notifyDocsOnWhatsapp"
                  checked={formData.notifyDocsOnWhatsapp}
                  onChange={handleChange}
                  style={{ accentColor: '#059669', width: '16px', height: '16px' }}
                />
                <span>Document Vault Updates (Approval & Re-upload Notices)</span>
              </label>
            </div>
          </div>

          {/* 1-Click Live Connection Test Tool */}
          <div style={{
            background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
            border: '1px solid #a7f3d0',
            borderRadius: '12px',
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#065f46', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Zap size={16} color="#059669" />
                <span>1-Click Live WhatsApp Delivery Test</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#047857', margin: '2px 0 0' }}>
                Send a real test WhatsApp message immediately to verify your credentials against Meta's Graph API.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span style={{ position: 'absolute', left: '10px', fontSize: '0.85rem', fontWeight: 700, color: '#065f46' }}>
                  🇮🇳 +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  value={testPhone.replace(/\D/g, '').slice(-10)}
                  onChange={(e) => setTestPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="10-digit mobile"
                  style={{
                    padding: '8px 12px 8px 58px',
                    borderRadius: '8px',
                    border: '1px solid #6ee7b7',
                    background: '#ffffff',
                    fontSize: '0.88rem',
                    width: '180px'
                  }}
                />
              </div>

              <button
                type="button"
                onClick={handleTestWhatsApp}
                disabled={isTesting}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#059669',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: isTesting ? 'not-allowed' : 'pointer',
                  boxShadow: '0 2px 6px rgba(5, 150, 105, 0.25)',
                  transition: 'all 0.15s ease'
                }}
              >
                {isTesting ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Dispatching...</span>
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    <span>Send Test Message</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Action Save Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: '12px',
          background: '#ffffff',
          borderRadius: '14px',
          padding: '1rem 1.5rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
        }}>
          <button
            type="submit"
            disabled={isSaving}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              padding: '10px 22px',
              fontSize: '0.9rem',
              fontWeight: 800,
              cursor: isSaving ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)',
              transition: 'all 0.15s ease'
            }}
          >
            {isSaving ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Save Company Profile & Helpline</span>
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
}
