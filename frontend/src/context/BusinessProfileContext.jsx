import React, { createContext, useContext, useState, useEffect } from 'react';
import { portalService } from '../services/api';

const defaultBusinessProfile = {
  id: 1,
  companyName: 'Aadhiraksha Insurance & Financial Services Pvt Ltd',
  tagline: 'IRDAI Registered Insurance Marketing & Advisory Partner',
  primaryPhone: '+91 8367415156',
  secondaryPhone: '',
  whatsappNumber: '+91 8367415156',
  supportEmail: 'info@aadhirakshainsurance.com',
  claimsEmail: 'claims@aadhirakshainsurance.com',
  websiteUrl: 'https://www.aadhirakshainsurance.com',
  officeAddressLine1: '4th Floor, Mytri Constructions,',
  officeAddressLine2: 'Opp: ECIL Busstop, ECIL, Hyderabad.',
  city: 'Hyderabad',
  state: 'Telangana',
  businessHours: 'Mon - Sat, 9:30 AM to 6:30 PM',
  irdaiRegistrationNo: 'IRDAI/IMF/TS/2026/00482',
  googleMapsUrl: 'https://maps.google.com/?q=Mytri+Constructions+ECIL+Hyderabad',
  googleReviewUrl: 'https://maps.google.com/?q=Aadhiraksha+Insurance+Marketing+ECIL+Hyderabad',
  linkedinUrl: 'https://www.linkedin.com/company/aadhiraksha-insurance/',
  youtubeUrl: 'https://www.youtube.com/@aadhiraksha-insurance',
  instagramUrl: 'https://www.instagram.com/aadhiraksha_insurance/',
  facebookUrl: 'https://www.facebook.com/aadhirakshainsurance/',
  xTwitterUrl: 'https://x.com/aadhiraksha_ins',
  claimsSettledAmount: '₹50+ Cr',
  familiesProtectedCount: '25,000+',
  certifiedAdvisorsCount: '1,200+',
  settlementRatio: '98.8%',
  // Company Pages Content
  aboutHeroTitle: 'India’s Most Dependable Bridge Between Families, Protection & Financial Freedom',
  aboutHeroDescription: 'At Aadhiraksha Insurance Marketing & Financial Services Pvt Ltd, we believe every Indian family deserves unbiased, transparent, and prompt insurance advisory with zero hidden catches. Rooted in Hyderabad with a pan-regional network of over 1,200 certified advisors, we don\'t just sell policies — we stand beside you during claim settlements.',
  aboutMissionStatement: 'To democratize transparent insurance advisory across India, ensuring zero out-of-pocket surprise rejections and 100% cashless hospitalization concierge.',
  aboutVisionStatement: 'To become the nation\'s most trusted insurance marketing firm, empowering families and businesses through ethical advisory and swift claim resolution.',
  pospPageHeadline: 'Empower Your Career as a Certified POSP Insurance Advisor',
  pospPageSubheadline: 'Join Telangana & AP\'s fastest-growing insurtech partner network with zero initial capital, 100% digital onboarding, and direct multi-insurer quotes.',
  claimsPageHeadline: '24/7 Cashless Claims Assistance & Emergency Concierge',
  claimsPageSubheadline: 'File your cashless hospitalization or motor damage intimation in under 60 seconds with dedicated claim managers.',
  legalGrievanceOfficerName: 'Customer Care Head',
  legalGrievanceEmail: 'grievance@aadhirakshainsurance.com',
  legalGrievancePhone: '+91 8367415156'
};

const BusinessProfileContext = createContext({
  businessProfile: defaultBusinessProfile,
  refreshBusinessProfile: async () => {},
  loading: false
});

export function BusinessProfileProvider({ children }) {
  const [businessProfile, setBusinessProfile] = useState(() => {
    try {
      const cached = localStorage.getItem('aadhiraksha_business_profile');
      return cached ? JSON.parse(cached) : defaultBusinessProfile;
    } catch {
      return defaultBusinessProfile;
    }
  });
  const [loading, setLoading] = useState(false);

  const refreshBusinessProfile = async () => {
    try {
      setLoading(true);
      const data = await portalService.getBusinessProfile();
      if (data && data.primaryPhone) {
        setBusinessProfile(data);
        localStorage.setItem('aadhiraksha_business_profile', JSON.stringify(data));
      }
    } catch (err) {
      console.warn('Could not fetch updated business profile from backend, using current state:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshBusinessProfile();
  }, []);

  return (
    <BusinessProfileContext.Provider value={{ businessProfile, refreshBusinessProfile, loading }}>
      {children}
    </BusinessProfileContext.Provider>
  );
}

export function useBusinessProfile() {
  return useContext(BusinessProfileContext);
}
