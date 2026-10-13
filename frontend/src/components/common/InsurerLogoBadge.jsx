import React from 'react';
import { Building2 } from 'lucide-react';
import { PARTNER_ASSET_GALLERY } from '../../utils/partnerAssetCatalog';

/**
 * Resolves raw insurer names into normalized partner metadata and high-res logo asset.
 */
export function resolveInsurerInfo(rawName) {
  if (!rawName || typeof rawName !== 'string' || !rawName.trim()) {
    return { name: 'Unspecified Insurer', logo: null, isPartner: false };
  }

  const normalized = rawName.toLowerCase().trim();

  // Keyword priority matching for Indian Insurance Carriers
  const matches = [
    { keys: ['star health', 'star'], key: 'starHealthLogo', defaultName: 'Star Health and Allied Insurance' },
    { keys: ['hdfc ergo', 'hdfc'], key: 'hdfcErgoLogo', defaultName: 'HDFC ERGO General Insurance' },
    { keys: ['icici lombard', 'icici pru', 'icici'], key: 'iciciLombardLogo', defaultName: 'ICICI Lombard General Insurance' },
    { keys: ['care health', 'care', 'religare'], key: 'careHealthLogo', defaultName: 'Care Health Insurance' },
    { keys: ['tata aig', 'tata aia', 'tata'], key: 'tataAigLogo', defaultName: 'Tata AIG General Insurance' },
    { keys: ['niva bupa', 'max bupa', 'niva'], key: 'nivaBupaLogo', defaultName: 'Niva Bupa Health Insurance' },
    { keys: ['bajaj allianz', 'bajaj'], key: 'bajajAllianzLogo', defaultName: 'Bajaj Allianz General Insurance' },
    { keys: ['sbi general', 'sbi life', 'sbi'], key: 'sbiGeneralLogo', defaultName: 'SBI General Insurance' },
    { keys: ['lic', 'life insurance corp'], key: 'licLogo', defaultName: 'Life Insurance Corporation (LIC)' },
    { keys: ['aditya birla', 'birla'], key: 'adityaBirlaLogo', defaultName: 'Aditya Birla Health Insurance' },
    { keys: ['axis max', 'max life'], key: 'axisMaxLogo', defaultName: 'Max Life Insurance' },
    { keys: ['reliance general', 'reliance'], key: 'relianceGeneralLogo', defaultName: 'Reliance General Insurance' },
    { keys: ['digit', 'godigit'], key: 'digitLogo', defaultName: 'Digit Insurance' },
    { keys: ['kotak general', 'kotak mahindra', 'kotak'], key: 'kotakGeneralLogo', defaultName: 'Kotak General Insurance' },
    { keys: ['manipal cigna', 'manipalcigna', 'cigna'], key: 'manipalCignaLogo', defaultName: 'ManipalCigna Health Insurance' },
    { keys: ['chola ms', 'chola'], key: 'cholaMsLogo', defaultName: 'Chola MS General Insurance' },
    { keys: ['future generali'], key: 'futureGeneraliLogo', defaultName: 'Future Generali India Insurance' },
    { keys: ['magma hdi', 'magma'], key: 'magmaHdiLogo', defaultName: 'Magma HDI General Insurance' },
    { keys: ['national insurance'], key: 'nationalInsuranceLogo', defaultName: 'National Insurance Company' },
    { keys: ['oriental insurance'], key: 'orientalInsuranceLogo', defaultName: 'Oriental Insurance Company' }
  ];

  for (const m of matches) {
    if (m.keys.some(k => normalized.includes(k))) {
      const partner = PARTNER_ASSET_GALLERY.find(p => p.key === m.key);
      return {
        name: rawName.length > 3 ? rawName : m.defaultName,
        logo: partner ? partner.src : null,
        isPartner: true
      };
    }
  }

  return { name: rawName, logo: null, isPartner: false };
}

/**
 * Enterprise Insurer Logo Badge Component
 * Displays crisp carrier branding across CRM tables, drawers, and proposal matrices.
 */
export default function InsurerLogoBadge({
  name,
  size = 'md', // 'xs' (16px), 'sm' (20px), 'md' (26px), 'lg' (36px)
  showName = true,
  subtext = null,
  style = {}
}) {
  const insurer = resolveInsurerInfo(name);

  const dimensionMap = {
    xs: { logoSize: 16, fontSize: '0.7rem', padding: '1px 5px', gap: '4px' },
    sm: { logoSize: 20, fontSize: '0.75rem', padding: '2px 7px', gap: '6px' },
    md: { logoSize: 26, fontSize: '0.82rem', padding: '3px 8px', gap: '8px' },
    lg: { logoSize: 36, fontSize: '0.9rem', padding: '4px 10px', gap: '10px' }
  };

  const dim = dimensionMap[size] || dimensionMap.md;

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: dim.gap,
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: dim.padding,
        boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
        maxWidth: '100%',
        ...style
      }}
      title={insurer.name}
    >
      {/* Insurer Logo or Fallback Building Icon */}
      <div
        style={{
          width: `${dim.logoSize}px`,
          height: `${dim.logoSize}px`,
          borderRadius: '4px',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#ffffff',
          flexShrink: 0
        }}
      >
        {insurer.logo ? (
          <img
            src={insurer.logo}
            alt={insurer.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain'
            }}
          />
        ) : (
          <Building2 size={dim.logoSize * 0.75} color="#64748b" />
        )}
      </div>

      {/* Insurer Name & Optional Plan Subtext */}
      {showName && (
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, lineHeight: 1.2 }}>
          <span
            style={{
              fontSize: dim.fontSize,
              fontWeight: 700,
              color: '#0f2b48',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {insurer.name}
          </span>
          {subtext && (
            <span
              style={{
                fontSize: '0.68rem',
                color: '#64748b',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {subtext}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
