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
  Share2,
  Sparkles,
  Navigation,
  BookOpen,
  Camera,
  Plus,
  Trash2,
  Image as ImageIcon,
  UploadCloud,
  Folder,
  Eye,
  Check,
  Loader2
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
    googleMapsUrl: '',
    googleReviewUrl: '',
    linkedinUrl: '',
    youtubeUrl: '',
    instagramUrl: '',
    facebookUrl: '',
    xTwitterUrl: '',
    claimsSettledAmount: '',
    familiesProtectedCount: '',
    certifiedAdvisorsCount: '',
    settlementRatio: '',
    aboutHeroTitle: '',
    aboutHeroDescription: '',
    aboutMissionStatement: '',
    aboutVisionStatement: '',
    aboutGalleryPhotosJson: '[]'
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [galleryList, setGalleryList] = useState([]);
  const [activeFolderTab, setActiveFolderTab] = useState('all');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = React.useRef(null);

  const GALLERY_CATEGORIES = [
    { key: 'all', label: 'All Media Assets' },
    { key: 'office', label: 'Headquarters & Suites', defaultTag: 'Headquarters' },
    { key: 'conclave', label: 'POSP Conclaves', defaultTag: 'Advisor Network' },
    { key: 'claims', label: 'Claims Desk', defaultTag: 'Claim Support' },
    { key: 'community', label: 'Community Camps', defaultTag: 'Community Camp' },
    { key: 'awards', label: 'Industry Awards', defaultTag: 'Awards & Honours' }
  ];

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles = files.filter(f => f.type.startsWith('image/'));
    if (validFiles.length === 0) {
      toast.error('Please upload valid image files (PNG, JPG, WEBP).');
      return;
    }

    const oversizedFiles = validFiles.filter(f => f.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast.error(`${oversizedFiles.length} file(s) exceed the 10MB limit.`);
      return;
    }

    setIsUploadingPhoto(true);
    let successCount = 0;
    const newItems = [];
    const targetCategory = activeFolderTab === 'all' ? 'office' : activeFolderTab;
    const catConfig = GALLERY_CATEGORIES.find(c => c.key === targetCategory);

    try {
      for (const file of validFiles) {
        const uploadData = new FormData();
        uploadData.append('file', file);
        try {
          const res = await portalService.uploadGalleryImage(uploadData);
          if (res && res.url) {
            newItems.push({
              id: Date.now() + Math.random(),
              category: targetCategory,
              title: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
              subtitle: 'Corporate Asset • ' + (catConfig ? catConfig.label : 'Outreach'),
              imageUrl: res.url,
              tag: catConfig ? catConfig.defaultTag : 'Corporate Gallery'
            });
            successCount++;
          }
        } catch (itemErr) {
          console.error('Failed to upload file:', file.name, itemErr);
        }
      }

      if (newItems.length > 0) {
        const updated = [...newItems, ...galleryList];
        setGalleryList(updated);
        setFormData(prev => ({ ...prev, aboutGalleryPhotosJson: JSON.stringify(updated) }));
        toast.success(`Successfully uploaded ${successCount} photo${successCount > 1 ? 's' : ''} to "${catConfig ? catConfig.label : 'Gallery'}"!`);
      } else {
        toast.error('Failed to upload selected photos.');
      }
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handlePopulateDefaultGallery = () => {
    const defaults = [
      {
        id: 1,
        category: 'office',
        title: 'Corporate Headquarters & Advisory Suite',
        subtitle: 'ECIL, Hyderabad - 4th Floor Mytri Constructions',
        imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
        tag: 'Headquarters'
      },
      {
        id: 2,
        category: 'conclave',
        title: 'Annual POSP & Financial Advisor Conclave',
        subtitle: 'Empowering 1,200+ certified regional advisors across Telangana & AP',
        imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
        tag: 'Advisor Network'
      },
      {
        id: 3,
        category: 'claims',
        title: '24/7 Claim Concierge Desk in Action',
        subtitle: 'Dedicated physical claim managers assisting cashless hospitalization',
        imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80',
        tag: 'Claim Support'
      },
      {
        id: 4,
        category: 'awards',
        title: 'Top Performance Partner Recognition',
        subtitle: 'Recognized for stellar claim settlement speed & regulatory compliance',
        imageUrl: 'https://images.unsplash.com/photo-1531545514256-b1400bc00f31?auto=format&fit=crop&w=1200&q=80',
        tag: 'Awards & Honours'
      },
      {
        id: 5,
        category: 'community',
        title: 'Family Financial Wellness & Motor Camp',
        subtitle: 'Educating policyholders on cashless porting & zero-dep protections',
        imageUrl: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1200&q=80',
        tag: 'Community Camp'
      },
      {
        id: 6,
        category: 'office',
        title: 'Client Advisory & Policy Onboarding Center',
        subtitle: 'Personalized face-to-face consultation for family and business health',
        imageUrl: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80',
        tag: 'Headquarters'
      }
    ];

    setGalleryList(defaults);
    setFormData(prev => ({ ...prev, aboutGalleryPhotosJson: JSON.stringify(defaults) }));
    toast.success('Pre-populated with 6 curated corporate gallery assets!');
  };

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
        googleMapsUrl: businessProfile.googleMapsUrl || '',
        googleReviewUrl: businessProfile.googleReviewUrl || '',
        linkedinUrl: businessProfile.linkedinUrl || '',
        youtubeUrl: businessProfile.youtubeUrl || '',
        instagramUrl: businessProfile.instagramUrl || '',
        facebookUrl: businessProfile.facebookUrl || '',
        xTwitterUrl: businessProfile.xTwitterUrl || '',
        claimsSettledAmount: businessProfile.claimsSettledAmount || '₹50+ Cr',
        familiesProtectedCount: businessProfile.familiesProtectedCount || '25,000+',
        certifiedAdvisorsCount: businessProfile.certifiedAdvisorsCount || '1,200+',
        settlementRatio: businessProfile.settlementRatio || '98.8%',
        aboutHeroTitle: businessProfile.aboutHeroTitle || 'India’s Most Dependable Bridge Between Families, Protection & Financial Freedom',
        aboutHeroDescription: businessProfile.aboutHeroDescription || "At Aadhiraksha Insurance Marketing & Financial Services Pvt Ltd, we believe every Indian family deserves unbiased, transparent, and prompt insurance advisory with zero hidden catches. Rooted in Hyderabad with a pan-regional network of over 1,200 certified advisors, we don't just sell policies — we stand beside you during claim settlements.",
        aboutMissionStatement: businessProfile.aboutMissionStatement || "To democratize transparent insurance advisory across India, ensuring zero out-of-pocket surprise rejections and 100% cashless hospitalization concierge.",
        aboutVisionStatement: businessProfile.aboutVisionStatement || "To become the nation's most trusted insurance marketing firm, empowering families and businesses through ethical advisory and swift claim resolution.",
        aboutGalleryPhotosJson: businessProfile.aboutGalleryPhotosJson || '[]'
      });

      try {
        const parsed = JSON.parse(businessProfile.aboutGalleryPhotosJson || '[]');
        if (Array.isArray(parsed)) {
          setGalleryList(parsed);
        }
      } catch (err) {
        setGalleryList([]);
      }
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

        {/* Section 4: Google Maps Navigation & Customer Reviews */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '1.5rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f2b48', margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Navigation size={18} color="#2563eb" />
            <span>Google Maps Pin & Review Links (Public Navigation)</span>
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Google Maps Navigation Link / Pin URL
              </label>
              <input
                type="url"
                name="googleMapsUrl"
                value={formData.googleMapsUrl}
                onChange={handleChange}
                placeholder="https://maps.google.com/?q=Mytri+Constructions+ECIL+Hyderabad"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem'
                }}
              />
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                Used on the "Navigate via Google Maps" button in About Us and Contact cards.
              </span>
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Google Business Review Link
              </label>
              <input
                type="url"
                name="googleReviewUrl"
                value={formData.googleReviewUrl}
                onChange={handleChange}
                placeholder="https://maps.google.com/?q=Aadhiraksha+Insurance+Marketing+ECIL+Hyderabad"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem'
                }}
              />
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                Used on customer review modals when users tap "Write a Google Review".
              </span>
            </div>
          </div>
        </div>

        {/* Section 5: Official Social Media Profiles */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '1.5rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f2b48', margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Share2 size={18} color="#7c3aed" />
            <span>Official Social Media & Public Profiles</span>
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                LinkedIn Company URL
              </label>
              <input
                type="url"
                name="linkedinUrl"
                value={formData.linkedinUrl}
                onChange={handleChange}
                placeholder="https://www.linkedin.com/company/aadhiraksha-insurance/"
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
                YouTube Channel URL
              </label>
              <input
                type="url"
                name="youtubeUrl"
                value={formData.youtubeUrl}
                onChange={handleChange}
                placeholder="https://www.youtube.com/@aadhiraksha-insurance"
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
                Instagram Profile URL
              </label>
              <input
                type="url"
                name="instagramUrl"
                value={formData.instagramUrl}
                onChange={handleChange}
                placeholder="https://www.instagram.com/aadhiraksha_insurance/"
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
                Facebook Page URL
              </label>
              <input
                type="url"
                name="facebookUrl"
                value={formData.facebookUrl}
                onChange={handleChange}
                placeholder="https://www.facebook.com/aadhirakshainsurance/"
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
                X (Twitter) Profile URL
              </label>
              <input
                type="url"
                name="xTwitterUrl"
                value={formData.xTwitterUrl}
                onChange={handleChange}
                placeholder="https://x.com/aadhiraksha_ins"
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

        {/* Section 6: Corporate Impact Milestones & Statistics */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '1.5rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f2b48', margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="#d97706" />
            <span>Corporate Impact Milestones & Statistics</span>
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Claims Settled Milestone
              </label>
              <input
                type="text"
                name="claimsSettledAmount"
                value={formData.claimsSettledAmount}
                onChange={handleChange}
                placeholder="e.g. ₹50+ Cr"
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
                Families Protected Count
              </label>
              <input
                type="text"
                name="familiesProtectedCount"
                value={formData.familiesProtectedCount}
                onChange={handleChange}
                placeholder="e.g. 25,000+"
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
                Certified Advisors (POSP)
              </label>
              <input
                type="text"
                name="certifiedAdvisorsCount"
                value={formData.certifiedAdvisorsCount}
                onChange={handleChange}
                placeholder="e.g. 1,200+"
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
                Settlement Resolution Ratio
              </label>
              <input
                type="text"
                name="settlementRatio"
                value={formData.settlementRatio}
                onChange={handleChange}
                placeholder="e.g. 98.8%"
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

        {/* Section 7: About Us Hero Story, Mission & Vision */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '1.5rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f2b48', margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={18} color="#0284c7" />
            <span>About Us & Corporate Brand Story (/about)</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                About Page Main Headline (Hero Banner)
              </label>
              <input
                type="text"
                name="aboutHeroTitle"
                value={formData.aboutHeroTitle}
                onChange={handleChange}
                placeholder="e.g. India’s Most Dependable Bridge Between Families, Protection & Financial Freedom"
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
                Corporate Story Narrative (Hero Subtitle)
              </label>
              <textarea
                name="aboutHeroDescription"
                value={formData.aboutHeroDescription}
                onChange={handleChange}
                rows={3}
                placeholder="At Aadhiraksha Insurance Marketing & Financial Services Pvt Ltd..."
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem',
                  lineHeight: 1.5,
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Mission Statement
                </label>
                <textarea
                  name="aboutMissionStatement"
                  value={formData.aboutMissionStatement}
                  onChange={handleChange}
                  rows={2}
                  placeholder="To democratize transparent insurance advisory..."
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Vision Statement
                </label>
                <textarea
                  name="aboutVisionStatement"
                  value={formData.aboutVisionStatement}
                  onChange={handleChange}
                  rows={2}
                  placeholder="To become the nation's most trusted insurance marketing firm..."
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    resize: 'vertical'
                  }}
                />
              </div>
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
