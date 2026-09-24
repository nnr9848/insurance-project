import adityaBirlaLogo from '../assets/partners/ADITYA BIRLA CAPITAL.jpg';
import axisMaxLogo from '../assets/partners/AXIS MAX Life Insurance logo.png';
import bajajAllianzLogo from '../assets/partners/Bajaj Alilanz logo.png';
import hdfcErgoLogo from '../assets/partners/HDFC-Ergo-logo.png';
import iciciLombardLogo from '../assets/partners/ICICI Lombard logo.webp';
import licLogo from '../assets/partners/LIC LOGO.jpg';
import nationalInsuranceLogo from '../assets/partners/NATIONAL INSURANCE LOGO.jpg';
import orientalInsuranceLogo from '../assets/partners/ORIENTAL INSURANCE LOGO.jpg';
import relianceGeneralLogo from '../assets/partners/Reliance General Insurance Logo.jpg';
import sbiGeneralLogo from '../assets/partners/SBI general Insurance logo.jpg';
import tataAigLogo from '../assets/partners/TATA AIG Insurance logo.png';
import careHealthLogo from '../assets/partners/care health insurance logo.png';
import cholaMsLogo from '../assets/partners/chola ms generali insurance.png';
import digitLogo from '../assets/partners/digit logo.png';
import futureGeneraliLogo from '../assets/partners/future generali insurance logo.jpg';
import kotakGeneralLogo from '../assets/partners/kotak general insurance logo.jpg';
import magmaHdiLogo from '../assets/partners/magma hdi general insurnce logo.png';
import manipalCignaLogo from '../assets/partners/manipal cigna health insurance logo.jpg';
import nivaBupaLogo from '../assets/partners/niva health insurance logo.png';
import starHealthLogo from '../assets/partners/star health insurance logo.png';

export const PARTNER_ASSET_GALLERY = [
  { key: 'starHealthLogo', name: 'Star Health Insurance', src: starHealthLogo },
  { key: 'hdfcErgoLogo', name: 'HDFC ERGO', src: hdfcErgoLogo },
  { key: 'iciciLombardLogo', name: 'ICICI Lombard', src: iciciLombardLogo },
  { key: 'careHealthLogo', name: 'Care Health Insurance', src: careHealthLogo },
  { key: 'tataAigLogo', name: 'TATA AIG Insurance', src: tataAigLogo },
  { key: 'bajajAllianzLogo', name: 'Bajaj Allianz', src: bajajAllianzLogo },
  { key: 'nivaBupaLogo', name: 'Niva Bupa Health', src: nivaBupaLogo },
  { key: 'sbiGeneralLogo', name: 'SBI General Insurance', src: sbiGeneralLogo },
  { key: 'licLogo', name: 'Life Insurance Corporation (LIC)', src: licLogo },
  { key: 'axisMaxLogo', name: 'Max Life Insurance', src: axisMaxLogo },
  { key: 'adityaBirlaLogo', name: 'Aditya Birla Capital', src: adityaBirlaLogo },
  { key: 'relianceGeneralLogo', name: 'Reliance General Insurance', src: relianceGeneralLogo },
  { key: 'digitLogo', name: 'Digit Insurance', src: digitLogo },
  { key: 'kotakGeneralLogo', name: 'Kotak General Insurance', src: kotakGeneralLogo },
  { key: 'manipalCignaLogo', name: 'ManipalCigna Health', src: manipalCignaLogo },
  { key: 'cholaMsLogo', name: 'Chola MS General Insurance', src: cholaMsLogo },
  { key: 'futureGeneraliLogo', name: 'Future Generali', src: futureGeneraliLogo },
  { key: 'magmaHdiLogo', name: 'Magma HDI General', src: magmaHdiLogo },
  { key: 'nationalInsuranceLogo', name: 'National Insurance', src: nationalInsuranceLogo },
  { key: 'orientalInsuranceLogo', name: 'Oriental Insurance', src: orientalInsuranceLogo }
];

export const PARTNER_LOGO_MAP = PARTNER_ASSET_GALLERY.reduce((acc, curr) => {
  acc[curr.key] = curr.src;
  return acc;
}, {});

export const DEFAULT_PARTNERS_FALLBACK = [
  { id: 1, name: 'Star Health Insurance', category: 'health', logoKey: 'starHealthLogo', redirectUrl: 'https://www.starhealth.in/', displayOrder: 1, isActive: true },
  { id: 2, name: 'HDFC ERGO', category: 'general', logoKey: 'hdfcErgoLogo', redirectUrl: 'https://www.hdfcergo.com/', displayOrder: 2, isActive: true },
  { id: 3, name: 'ICICI Lombard', category: 'general', logoKey: 'iciciLombardLogo', redirectUrl: 'https://www.icicilombard.com/', displayOrder: 3, isActive: true },
  { id: 4, name: 'Care Health Insurance', category: 'health', logoKey: 'careHealthLogo', redirectUrl: 'https://www.careinsurance.com/', displayOrder: 4, isActive: true },
  { id: 5, name: 'TATA AIG Insurance', category: 'general', logoKey: 'tataAigLogo', redirectUrl: 'https://www.tataaig.com/', displayOrder: 5, isActive: true },
  { id: 6, name: 'Bajaj Allianz', category: 'general', logoKey: 'bajajAllianzLogo', redirectUrl: 'https://www.bajajallianz.com/', displayOrder: 6, isActive: true },
  { id: 7, name: 'Niva Bupa Health', category: 'health', logoKey: 'nivaBupaLogo', redirectUrl: 'https://www.nivabupa.com/', displayOrder: 7, isActive: true },
  { id: 8, name: 'SBI General Insurance', category: 'general', logoKey: 'sbiGeneralLogo', redirectUrl: 'https://www.sbigeneral.in/', displayOrder: 8, isActive: true },
  { id: 9, name: 'Life Insurance Corporation (LIC)', category: 'life', logoKey: 'licLogo', redirectUrl: 'https://licindia.in/', displayOrder: 9, isActive: true },
  { id: 10, name: 'Max Life Insurance', category: 'life', logoKey: 'axisMaxLogo', redirectUrl: 'https://www.maxlifeinsurance.com/', displayOrder: 10, isActive: true },
  { id: 11, name: 'Aditya Birla Capital', category: 'life', logoKey: 'adityaBirlaLogo', redirectUrl: 'https://www.adityabirlacapital.com/', displayOrder: 11, isActive: true },
  { id: 12, name: 'Reliance General Insurance', category: 'general', logoKey: 'relianceGeneralLogo', redirectUrl: 'https://www.reliancegeneral.co.in/', displayOrder: 12, isActive: true },
  { id: 13, name: 'Digit Insurance', category: 'general', logoKey: 'digitLogo', redirectUrl: 'https://www.godigit.com/', displayOrder: 13, isActive: true },
  { id: 14, name: 'Kotak General Insurance', category: 'general', logoKey: 'kotakGeneralLogo', redirectUrl: 'https://www.kotakgeneral.com/', displayOrder: 14, isActive: true },
  { id: 15, name: 'ManipalCigna Health', category: 'health', logoKey: 'manipalCignaLogo', redirectUrl: 'https://www.manipalcigna.com/', displayOrder: 15, isActive: true },
  { id: 16, name: 'Chola MS General Insurance', category: 'general', logoKey: 'cholaMsLogo', redirectUrl: 'https://www.cholainsurance.com/', displayOrder: 16, isActive: true },
  { id: 17, name: 'Future Generali', category: 'general', logoKey: 'futureGeneraliLogo', redirectUrl: 'https://general.futuregenerali.in/', displayOrder: 17, isActive: true },
  { id: 18, name: 'Magma HDI General', category: 'general', logoKey: 'magmaHdiLogo', redirectUrl: 'https://www.magmahdi.com/', displayOrder: 18, isActive: true },
  { id: 19, name: 'National Insurance', category: 'general', logoKey: 'nationalInsuranceLogo', redirectUrl: 'https://nationalinsurance.nic.co.in/', displayOrder: 19, isActive: true },
  { id: 20, name: 'Oriental Insurance', category: 'general', logoKey: 'orientalInsuranceLogo', redirectUrl: 'https://orientalinsurance.org.in/', displayOrder: 20, isActive: true }
];
