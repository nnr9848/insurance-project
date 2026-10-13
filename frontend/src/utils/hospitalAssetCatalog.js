/**
 * Hospital Asset & Brand Logo Catalog
 * Provides fallback logos, chain avatars, and automatic brand matching for India's premier hospital networks.
 */

export const HOSPITAL_CHAINS = [
  {
    pattern: /apollo/i,
    name: 'Apollo Hospitals',
    logo: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=120&h=120&q=80',
    brandColor: '#0284c7',
    badgeText: 'Apollo Chain'
  },
  {
    pattern: /fortis/i,
    name: 'Fortis Healthcare',
    logo: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=120&h=120&q=80',
    brandColor: '#16a34a',
    badgeText: 'Fortis Chain'
  },
  {
    pattern: /manipal/i,
    name: 'Manipal Hospitals',
    logo: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=120&h=120&q=80',
    brandColor: '#0d9488',
    badgeText: 'Manipal Chain'
  },
  {
    pattern: /narayana/i,
    name: 'Narayana Health',
    logo: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=120&h=120&q=80',
    brandColor: '#ea580c',
    badgeText: 'Narayana Chain'
  },
  {
    pattern: /aster/i,
    name: 'Aster DM Healthcare',
    logo: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=120&h=120&q=80',
    brandColor: '#0284c7',
    badgeText: 'Aster Chain'
  },
  {
    pattern: /yashoda/i,
    name: 'Yashoda Hospitals',
    logo: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=120&h=120&q=80',
    brandColor: '#7c3aed',
    badgeText: 'Yashoda Chain'
  },
  {
    pattern: /kims/i,
    name: 'KIMS Hospitals',
    logo: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=120&h=120&q=80',
    brandColor: '#2563eb',
    badgeText: 'KIMS Chain'
  },
  {
    pattern: /care/i,
    name: 'CARE Hospitals',
    logo: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=120&h=120&q=80',
    brandColor: '#0891b2',
    badgeText: 'CARE Chain'
  },
  {
    pattern: /aig/i,
    name: 'AIG Hospitals',
    logo: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=120&h=120&q=80',
    brandColor: '#059669',
    badgeText: 'AIG Institute'
  },
  {
    pattern: /medanta/i,
    name: 'Medanta The Medicity',
    logo: 'https://images.unsplash.com/photo-1512678080530-7760d81faba6?auto=format&fit=crop&w=120&h=120&q=80',
    brandColor: '#b91c1c',
    badgeText: 'Medanta'
  },
  {
    pattern: /max/i,
    name: 'Max Healthcare',
    logo: 'https://images.unsplash.com/photo-1519494080410-f9aa76cb4283?auto=format&fit=crop&w=120&h=120&q=80',
    brandColor: '#4f46e5',
    badgeText: 'Max Healthcare'
  },
  {
    pattern: /kokilaben/i,
    name: 'Kokilaben Hospital',
    logo: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=120&h=120&q=80',
    brandColor: '#be185d',
    badgeText: 'Kokilaben'
  }
];

export const DEFAULT_HOSPITAL_AVATAR = 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=120&h=120&q=80';

/**
 * Returns a high-res photo URL or brand badge metadata for any hospital name.
 * If photoUrl is set directly on the entity, it takes precedence.
 */
export function getHospitalPhoto(hospital) {
  if (hospital?.photoUrl && hospital.photoUrl.trim().length > 0) {
    return hospital.photoUrl.trim();
  }
  const name = hospital?.hospitalName || '';
  const match = HOSPITAL_CHAINS.find(c => c.pattern.test(name));
  return match ? match.logo : DEFAULT_HOSPITAL_AVATAR;
}

export function getHospitalBrandMeta(hospital) {
  const name = hospital?.hospitalName || '';
  const match = HOSPITAL_CHAINS.find(c => c.pattern.test(name));
  if (match) {
    return { name: match.name, badgeText: match.badgeText, brandColor: match.brandColor };
  }
  return { name: 'Empanelled Center', badgeText: 'Network Center', brandColor: '#059669' };
}
