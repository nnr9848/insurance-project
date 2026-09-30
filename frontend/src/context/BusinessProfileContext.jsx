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
  postalCode: '500062',
  businessHours: 'Mon - Sat, 9:30 AM to 6:30 PM',
  irdaiRegistrationNo: 'IRDAI/IMF/TS/2026/00482'
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
