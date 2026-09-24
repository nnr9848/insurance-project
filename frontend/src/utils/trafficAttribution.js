/**
 * Traffic Attribution & UTM Campaign Tracking Utility
 * Captures marketing query parameters and referrer across visitor journey
 */

const UTM_STORAGE_KEY = 'aadhiraksha_utm_attribution';

export function captureUtmParameters() {
  if (typeof window === 'undefined') return;

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const utmSource = urlParams.get('utm_source');
    const utmMedium = urlParams.get('utm_medium');
    const utmCampaign = urlParams.get('utm_campaign');
    const utmTerm = urlParams.get('utm_term');
    const utmContent = urlParams.get('utm_content');
    const gclid = urlParams.get('gclid');
    const referrer = typeof document !== 'undefined' ? document.referrer : '';

    // If any marketing attribution parameters are present in URL, persist them in sessionStorage
    if (utmSource || utmCampaign || gclid || utmMedium) {
      const attributionData = {
        source: utmSource ? utmSource : (gclid ? 'google' : 'Website'),
        medium: utmMedium || (gclid ? 'cpc' : 'organic'),
        campaign: utmCampaign || (gclid ? 'Google Ads' : 'Website Direct'),
        term: utmTerm || '',
        content: utmContent || '',
        gclid: gclid || '',
        referrer: referrer || '',
        capturedAt: new Date().toISOString()
      };
      sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(attributionData));
      return attributionData;
    }

    // If nothing currently in URL, check if already stored in session
    const existing = sessionStorage.getItem(UTM_STORAGE_KEY);
    if (existing) {
      return JSON.parse(existing);
    }

    // Default attribution if purely organic website visitor
    const defaultAttribution = {
      source: referrer && !referrer.includes(window.location.hostname) ? (referrer.includes('google') ? 'Google' : 'Referral') : 'Website',
      medium: 'organic',
      campaign: referrer && referrer.includes('google') ? 'Google Organic' : 'Direct / Organic',
      term: '',
      content: '',
      gclid: '',
      referrer: referrer || '',
      capturedAt: new Date().toISOString()
    };
    sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(defaultAttribution));
    return defaultAttribution;
  } catch (err) {
    console.warn('Failed to capture UTM tracking parameters:', err);
    return {
      source: 'Website',
      medium: 'direct',
      campaign: 'Direct / Organic',
      gclid: '',
      referrer: '',
      capturedAt: new Date().toISOString()
    };
  }
}

export function getStoredAttribution() {
  if (typeof window === 'undefined') {
    return { source: 'Website', campaign: 'Direct / Organic' };
  }
  try {
    const raw = sessionStorage.getItem(UTM_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
    return captureUtmParameters();
  } catch {
    return { source: 'Website', campaign: 'Direct / Organic' };
  }
}
