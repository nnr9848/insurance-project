// Centralized CRM Stage Constants & UX Utilities
// Standardized across Admin Dashboard, Client Data Sheet, POSP Partner Portal, and Mobile parity APIs.

export const CRM_STAGES = {
  NEW_LEAD: {
    key: 'NEW_LEAD',
    label: 'New Lead',
    shortLabel: 'New',
    description: 'Fresh lead captured; pending initial outreach',
    color: '#0284c7',
    bg: '#e0f2fe',
    border: '#bae6fd',
    step: 1
  },
  CONTACTED: {
    key: 'CONTACTED',
    label: 'Contacted',
    shortLabel: 'Contacted',
    description: 'Initial phone / WhatsApp connection established',
    color: '#d97706',
    bg: '#fef3c7',
    border: '#fde68a',
    step: 2
  },
  FOLLOWUP: {
    key: 'FOLLOWUP',
    label: 'Follow-up Due',
    shortLabel: 'Follow-up',
    description: 'Scheduled callback or product demo due',
    color: '#ea580c',
    bg: '#ffedd5',
    border: '#fed7aa',
    step: 3
  },
  INTERESTED: {
    key: 'INTERESTED',
    label: 'Interested',
    shortLabel: 'Interested',
    description: 'Client actively evaluating proposals or plan choices',
    color: '#16a34a',
    bg: '#dcfce7',
    border: '#bbf7d0',
    step: 4
  },
  QUOTATION: {
    key: 'QUOTATION',
    label: 'Proposal Sent',
    shortLabel: 'Proposal',
    description: 'Formal policy quote / comparison sheet delivered',
    color: '#4f46e5',
    bg: '#e0e7ff',
    border: '#c7d2fe',
    step: 5
  },
  MEETING: {
    key: 'MEETING',
    label: 'Meeting Scheduled',
    shortLabel: 'Meeting',
    description: 'Virtual / in-person meeting or medical test aligned',
    color: '#9333ea',
    bg: '#f3e8ff',
    border: '#e9d5ff',
    step: 6
  },
  DOCUMENTS: {
    key: 'DOCUMENTS',
    label: 'Documents & KYC',
    shortLabel: 'KYC / Docs',
    description: 'Aadhaar, PAN, medical reports collected & verified',
    color: '#0d9488',
    bg: '#ccfbf1',
    border: '#99f6e4',
    step: 7
  },
  PAYMENT: {
    key: 'PAYMENT',
    label: 'Payment Pending',
    shortLabel: 'Payment',
    description: 'Insurer proposal form created; payment link sent',
    color: '#ca8a04',
    bg: '#fef9c3',
    border: '#fef08a',
    step: 8
  },
  POLICY_ISSUED: {
    key: 'POLICY_ISSUED',
    label: 'Policy Issued 🎉',
    shortLabel: 'Issued',
    description: 'Policy document issued and commission accrued',
    color: '#059669',
    bg: '#d1fae5',
    border: '#a7f3d0',
    step: 9
  },
  CONVERTED: {
    key: 'CONVERTED',
    label: 'Converted',
    shortLabel: 'Converted',
    description: 'Customer successfully on-boarded and active',
    color: '#059669',
    bg: '#d1fae5',
    border: '#a7f3d0',
    step: 10
  },
  LOST: {
    key: 'LOST',
    label: 'Lost / Dropped',
    shortLabel: 'Lost',
    description: 'Client opted out or purchased elsewhere',
    color: '#dc2626',
    bg: '#fee2e2',
    border: '#fecaca',
    step: -1
  },
  NOT_INTERESTED: {
    key: 'NOT_INTERESTED',
    label: 'Not Interested',
    shortLabel: 'Not Interested',
    description: 'Client declined current insurance consultation',
    color: '#64748b',
    bg: '#f1f5f9',
    border: '#e2e8f0',
    step: -2
  }
};

// Aliases for alternate backend enum names
const STAGE_ALIASES = {
  'PROPOSAL_SHARED': 'QUOTATION',
  'PAYMENT_PENDING': 'PAYMENT',
  'DOCS_VERIFICATION': 'DOCUMENTS'
};

/**
 * Returns formatted badge configuration for any stage string.
 */
export const getStageBadge = (stage) => {
  if (!stage) {
    return {
      label: 'New Lead',
      shortLabel: 'New',
      bg: '#e0f2fe',
      color: '#0284c7',
      border: '#bae6fd'
    };
  }

  const normalized = stage.toUpperCase().trim();
  const canonicalKey = STAGE_ALIASES[normalized] || normalized;

  if (CRM_STAGES[canonicalKey]) {
    const s = CRM_STAGES[canonicalKey];
    return {
      label: s.label,
      shortLabel: s.shortLabel,
      bg: s.bg,
      color: s.color,
      border: s.border,
      key: s.key
    };
  }

  // Fallback for custom or unmapped stages
  const formatted = normalized.replace(/_/g, ' ').toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase());
  return {
    label: formatted,
    shortLabel: formatted,
    bg: '#f1f5f9',
    color: '#475569',
    border: '#e2e8f0',
    key: normalized
  };
};

/**
 * Ordered list of stage options for dropdown selectors / popovers.
 */
export const STAGE_OPTIONS = [
  { value: 'NEW_LEAD', label: 'New Lead', group: 'Pipeline' },
  { value: 'CONTACTED', label: 'Contacted', group: 'Pipeline' },
  { value: 'FOLLOWUP', label: 'Follow-up Due', group: 'Pipeline' },
  { value: 'INTERESTED', label: 'Interested', group: 'Pipeline' },
  { value: 'QUOTATION', label: 'Proposal Sent', group: 'Pipeline' },
  { value: 'MEETING', label: 'Meeting Scheduled', group: 'Pipeline' },
  { value: 'DOCUMENTS', label: 'Documents / KYC', group: 'Closing' },
  { value: 'PAYMENT', label: 'Payment Pending', group: 'Closing' },
  { value: 'POLICY_ISSUED', label: 'Policy Issued 🎉', group: 'Closing' },
  { value: 'LOST', label: 'Lost / Dropped', group: 'Closed-Lost' },
  { value: 'NOT_INTERESTED', label: 'Not Interested', group: 'Closed-Lost' }
];
