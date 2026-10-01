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
  AlertCircle
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
    irdaiRegistrationNo: ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
        irdaiRegistrationNo: businessProfile.irdaiRegistrationNo || ''
      });
    }
  }, [businessProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
              Company Profile & Branding Settings
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
              Centrally manage the legal company identity, customer helpline, and registered communication address rendered across the platform.
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
          <span>Refresh</span>
        </button>
      </div>

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

        {/* Section 2: Telephony, Customer Support & Public Connect */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '1.5rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f2b48', margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Phone size={18} color="#0284c7" />
            <span>Telephony, Customer Support & Public Helpline</span>
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
                Public WhatsApp Chat Number
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
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                Used for the 1-tap WhatsApp chat button for site visitors.
              </span>
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
                Secondary / Alternate Phone
              </label>
              <input
                type="text"
                name="secondaryPhone"
                value={formData.secondaryPhone}
                onChange={handleChange}
                placeholder="+91 9876543210"
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

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Business Working Hours
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
                Address Line 2 (Landmark / Area) <span style={{ color: '#ef4444' }}>*</span>
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
                State / UT
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
                <span>Save Company Profile & Branding</span>
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
}
