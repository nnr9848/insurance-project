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
  { 
    id: 1, 
    name: 'Star Health Insurance', 
    slug: 'star-health-insurance',
    category: 'health', 
    logoKey: 'starHealthLogo', 
    redirectUrl: 'https://www.starhealth.in/', 
    description: 'Star Health and Allied Insurance is India’s premier standalone health insurer offering specialized cardiac, diabetes, and comprehensive family health floater policies with a vast cashless hospital network.',
    keyHighlights: 'Over 14,000+ Cashless Hospitals,No Pre-Policy Medical Checkup Up to 50 Yrs,Dedicated In-House Claim Settlement,Lifetime Renewability Assured',
    displayOrder: 1, 
    isActive: true 
  },
  { 
    id: 2, 
    name: 'HDFC ERGO', 
    slug: 'hdfc-ergo',
    category: 'general', 
    logoKey: 'hdfcErgoLogo', 
    redirectUrl: 'https://www.hdfcergo.com/', 
    description: 'HDFC ERGO General Insurance offers comprehensive motor, health, travel, and home insurance coverage backed by innovative digital servicing and rapid cashless claim clearances.',
    keyHighlights: '1.5 Cr+ Happy Customers,Zero-Depreciation Car Add-ons,13,000+ Cashless Healthcare Network,Instant Digital Policy Delivery',
    displayOrder: 2, 
    isActive: true 
  },
  { 
    id: 3, 
    name: 'ICICI Lombard', 
    slug: 'icici-lombard',
    category: 'general', 
    logoKey: 'iciciLombardLogo', 
    redirectUrl: 'https://www.icicilombard.com/', 
    description: 'ICICI Lombard General Insurance provides market-leading comprehensive motor, corporate, and health protection with instant paperless claim endorsements.',
    keyHighlights: 'Instant Motor Spot Claims,11,000+ Cashless Garages & Hospitals,Complete Hospital Cash Benefits,24/7 Roadside Assistance',
    displayOrder: 3, 
    isActive: true 
  },
  { 
    id: 4, 
    name: 'Care Health Insurance', 
    slug: 'care-health-insurance',
    category: 'health', 
    logoKey: 'careHealthLogo', 
    redirectUrl: 'https://www.careinsurance.com/', 
    description: 'Care Health Insurance specializes in high-sum-insured health plans, comprehensive critical illness covers, and senior citizen floater schemes.',
    keyHighlights: 'Unlimited Automatic Recharge of Sum Insured,No Claim Bonus Super up to 500%,Annual Health Check-up for All Insured Members,2-Hour Cashless Processing',
    displayOrder: 4, 
    isActive: true 
  },
  { 
    id: 5, 
    name: 'TATA AIG Insurance', 
    slug: 'tata-aig-insurance',
    category: 'general', 
    logoKey: 'tataAigLogo', 
    redirectUrl: 'https://www.tataaig.com/', 
    description: 'TATA AIG Insurance combines trust, global expertise, and robust general insurance products protecting families, automobiles, SMEs, and overseas business travel.',
    keyHighlights: '98.5% General Claim Settlement Ratio,7,500+ Cashless Garages,Emergency Abroad Travel & Medical Assistance,Zero Deductible Options',
    displayOrder: 5, 
    isActive: true 
  },
  { 
    id: 6, 
    name: 'Bajaj Allianz', 
    slug: 'bajaj-allianz',
    category: 'general', 
    logoKey: 'bajajAllianzLogo', 
    redirectUrl: 'https://www.bajajallianz.com/', 
    description: 'Bajaj Allianz General Insurance provides seamless motor, health, and commercial policies powered by quick on-the-spot claim settlement.',
    keyHighlights: 'Motor OTS Claim Clearance in 30 Mins,Global Health Hospitalization Options,Comprehensive Fire & Burglary Business Packs,10,000+ Network Hospitals',
    displayOrder: 6, 
    isActive: true 
  },
  { 
    id: 7, 
    name: 'Niva Bupa Health', 
    slug: 'niva-bupa-health',
    category: 'health', 
    logoKey: 'nivaBupaLogo', 
    redirectUrl: 'https://www.nivabupa.com/', 
    description: 'Niva Bupa Health Insurance (formerly Max Bupa) is celebrated for its ReAssure 2.0 plans with lock-the-clock entry age premiums and unlimited claim recharges.',
    keyHighlights: 'ReAssure Unlimited Sum Insured Re-trigger,Lock-the-Age Premium Advantage,Direct 30-Minute Cashless Claim Processing,OPD Consultation Coverage',
    displayOrder: 7, 
    isActive: true 
  },
  { 
    id: 8, 
    name: 'SBI General Insurance', 
    slug: 'sbi-general-insurance',
    category: 'general', 
    logoKey: 'sbiGeneralLogo', 
    redirectUrl: 'https://www.sbigeneral.in/', 
    description: 'SBI General Insurance leverages the solid foundation of India’s largest banking brand to provide accessible, affordable, and dependable protection.',
    keyHighlights: 'Affordable High-Coverage Premium Tiers,Simple Paperless Issuance,Nationwide Branch & Network Support,Comprehensive Personal Accident Plans',
    displayOrder: 8, 
    isActive: true 
  },
  { 
    id: 9, 
    name: 'Life Insurance Corporation (LIC)', 
    slug: 'lic-of-india',
    category: 'life', 
    logoKey: 'licLogo', 
    redirectUrl: 'https://licindia.in/', 
    description: 'Life Insurance Corporation of India (LIC) is the nation’s most revered public-sector life insurer offering sovereign-backed endowment, pension, term, and child education policies.',
    keyHighlights: 'Sovereign Guarantee on Sum Assured & Bonus,Unmatched Pan-India Claim Settlement Track Record,Lifelong Guaranteed Income & Pension Schemes,High Loan Value on Policies',
    displayOrder: 9, 
    isActive: true 
  },
  { 
    id: 10, 
    name: 'Max Life Insurance', 
    slug: 'max-life-insurance',
    category: 'life', 
    logoKey: 'axisMaxLogo', 
    redirectUrl: 'https://www.maxlifeinsurance.com/', 
    description: 'Max Life Insurance delivers top-tier pure protection term life plans with critical illness riders and whole-life financial security for Indian families.',
    keyHighlights: '99.5% Term Claim Settlement Ratio,Fast-Track InstaClaim Approval within 1 Day,Critical Illness & Disability Rider Options,Special Premium Rates for Non-Smokers',
    displayOrder: 10, 
    isActive: true 
  },
  { 
    id: 11, 
    name: 'Aditya Birla Capital', 
    slug: 'aditya-birla-capital',
    category: 'life', 
    logoKey: 'adityaBirlaLogo', 
    redirectUrl: 'https://www.adityabirlacapital.com/', 
    description: 'Aditya Birla Health & Life Insurance features modern wellness-driven policies with up to 100% premium return through active health tracking.',
    keyHighlights: 'Earn While You Stay Healthy - Up to 100% Premium Back,Day-1 Cover for Pre-Existing Conditions,Mental Health & Wellness Counseling Support,Comprehensive Critical Illness Shield',
    displayOrder: 11, 
    isActive: true 
  },
  { 
    id: 12, 
    name: 'Reliance General Insurance', 
    slug: 'reliance-general-insurance',
    category: 'general', 
    logoKey: 'relianceGeneralLogo', 
    redirectUrl: 'https://www.reliancegeneral.co.in/', 
    description: 'Reliance General Insurance offers extensive motor, health, and commercial property policies with comprehensive digital servicing.',
    keyHighlights: 'Instant Free Pick-up & Drop for Motor Claims,Special Discounts for Safe Drivers,Worldwide Emergency Medical Assistance,Easy 3-Step Online Claim Filing',
    displayOrder: 12, 
    isActive: true 
  },
  { 
    id: 13, 
    name: 'Digit Insurance', 
    slug: 'digit-insurance',
    category: 'general', 
    logoKey: 'digitLogo', 
    redirectUrl: 'https://www.godigit.com/', 
    description: 'Digit Insurance re-imagines insurance with zero jargon, 100% digital paperless self-inspection, and super-fast reimbursement settlement.',
    keyHighlights: '100% Smartphone Audio/Video Self-Inspection,Zero Hardcopy Paperwork Required,Customizable Vehicle Idv Values,Zero Deductible Glass & Bumper Shield',
    displayOrder: 13, 
    isActive: true 
  },
  { 
    id: 14, 
    name: 'Kotak General Insurance', 
    slug: 'kotak-general-insurance',
    category: 'general', 
    logoKey: 'kotakGeneralLogo', 
    redirectUrl: 'https://www.kotakgeneral.com/', 
    description: 'Kotak Mahindra General Insurance delivers customized retail health, motor, and SME insurance tailored to dynamic financial protection requirements.',
    keyHighlights: 'Pay As You Drive Motor Insurance Feature,Comprehensive Critical Illness Add-ons,Swift Hospital Cash Approvals,Cashless Repair Across 4,500+ Garages',
    displayOrder: 14, 
    isActive: true 
  },
  { 
    id: 15, 
    name: 'ManipalCigna Health', 
    slug: 'manipalcigna-health',
    category: 'health', 
    logoKey: 'manipalCignaLogo', 
    redirectUrl: 'https://www.manipalcigna.com/', 
    description: 'ManipalCigna Health Insurance blends healthcare expertise with international insurance rigor for comprehensive lifelong medical coverage.',
    keyHighlights: 'Non-Medical Expense Hospitalization Protection,Global Emergency Cover Included,Domestic Air Ambulance Subsidies,Multi-Individual Health Rewards',
    displayOrder: 15, 
    isActive: true 
  },
  { 
    id: 16, 
    name: 'Chola MS General Insurance', 
    slug: 'chola-ms-general-insurance',
    category: 'general', 
    logoKey: 'cholaMsLogo', 
    redirectUrl: 'https://www.cholainsurance.com/', 
    description: 'Cholamandalam MS General Insurance provides robust motor, commercial transit, fire, and health insurance backed by Murugappa Group.',
    keyHighlights: 'Trusted Joint-Venture Reliability,Seamless Rural & Urban Cashless Network,Tailored Commercial Fleet Coverage,Simple 24/7 Claim Assistance Desk',
    displayOrder: 16, 
    isActive: true 
  },
  { 
    id: 17, 
    name: 'Future Generali', 
    slug: 'future-generali',
    category: 'general', 
    logoKey: 'futureGeneraliLogo', 
    redirectUrl: 'https://general.futuregenerali.in/', 
    description: 'Future Generali India Insurance offers retail and commercial solutions focused on speed, transparency, and high customer satisfaction ratios.',
    keyHighlights: 'Fast Cashless Hospitalization Approvals,Zero-Dep Car Shield with Engine Protector,Instant Online Renewal without Break-in Penalties,Custom Business Property Protection',
    displayOrder: 17, 
    isActive: true 
  },
  { 
    id: 18, 
    name: 'Magma HDI General', 
    slug: 'magma-hdi-general',
    category: 'general', 
    logoKey: 'magmaHdiLogo', 
    redirectUrl: 'https://www.magmahdi.com/', 
    description: 'Magma HDI General Insurance provides dependable motor, commercial liability, and health solutions with transparent claim documentation.',
    keyHighlights: 'Affordable Motor Third-Party & Comprehensive Packs,Prompt Spot Survey for Vehicle Accidents,Over 4,000+ Cashless Network Workshops,Dedicated Grievance Escalation Mechanism',
    displayOrder: 18, 
    isActive: true 
  },
  { 
    id: 19, 
    name: 'National Insurance', 
    slug: 'national-insurance',
    category: 'general', 
    logoKey: 'nationalInsuranceLogo', 
    redirectUrl: 'https://nationalinsurance.nic.co.in/', 
    description: 'National Insurance Company Ltd is one of India’s pioneering public-sector insurers trusted for over a century across motor, health, and rural insurance.',
    keyHighlights: 'Over 115 Years of Trusted Heritage,Sovereign Public Sector Trust,Massive Nationwide Hospital & Garage Reach,Low-Cost Government Compliant Policies',
    displayOrder: 19, 
    isActive: true 
  },
  { 
    id: 20, 
    name: 'Oriental Insurance', 
    slug: 'oriental-insurance',
    category: 'general', 
    logoKey: 'orientalInsuranceLogo', 
    redirectUrl: 'https://orientalinsurance.org.in/', 
    description: 'The Oriental Insurance Company is a prominent public sector non-life insurer specializing in large-scale commercial, motor, and family healthcare covers.',
    keyHighlights: 'Government of India Enterprise Trust,Comprehensive Family Mediclaim Plans,Extensive Regional Branch Network Across India,Special Concessions for Senior Citizens',
    displayOrder: 20, 
    isActive: true 
  }
];
