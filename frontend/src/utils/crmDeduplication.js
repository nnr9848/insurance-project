/**
 * Centralized Enterprise CRM Deduplication & Identity Resolution Engine
 * 
 * Provides deterministic multi-key transitive matching across phone numbers, emails, 
 * client codes, and cross-entity portfolio inquiries.
 */

/**
 * Normalizes phone numbers to standard 10-digit format for deterministic comparison
 * e.g. "+91 98490-12345" -> "9849012345", "09966520000" -> "9966520000"
 * @param {string|number} phone 
 * @returns {string} 10-digit phone string or empty string
 */
export const normalizePhoneNumber = (phone) => {
  if (!phone) return '';
  const digits = String(phone).replace(/[^0-9]/g, '');
  return digits.length >= 10 ? digits.slice(-10) : digits;
};

/**
 * Normalizes email address to lowercase trimmed string
 * @param {string} email 
 * @returns {string}
 */
export const normalizeEmail = (email) => {
  if (!email) return '';
  return String(email).trim().toLowerCase();
};

/**
 * Normalizes client code (e.g. "cl-247679" -> "CL-247679")
 * @param {string} code 
 * @returns {string}
 */
export const normalizeClientCode = (code) => {
  if (!code) return '';
  return String(code).trim().toUpperCase();
};

/**
 * Extracts a normalized Set of identity keys from any prospect, inquiry, or client entity
 * @param {Object} entity 
 * @returns {{ phones: Set<string>, emails: Set<string>, codes: Set<string> }}
 */
export const extractIdentityKeys = (entity) => {
  const phones = new Set();
  const emails = new Set();
  const codes = new Set();

  if (!entity || typeof entity !== 'object') {
    return { phones, emails, codes };
  }

  // Extract phone keys
  [entity.phoneNumber, entity.secondaryPhone, entity.whatsappNumber, entity.phone, entity.mobile].forEach(p => {
    const clean = normalizePhoneNumber(p);
    if (clean) phones.add(clean);
  });

  // Extract email keys
  [entity.email, entity.clientEmail, entity.userEmail].forEach(e => {
    const clean = normalizeEmail(e);
    if (clean) emails.add(clean);
  });

  // Extract client code keys
  [entity.clientCode, entity.linkedClientCode, entity.code].forEach(c => {
    const clean = normalizeClientCode(c);
    if (clean) codes.add(clean);
  });

  return { phones, emails, codes };
};

/**
 * Checks if two entities share any common identity key
 * @param {Object} a 
 * @param {Object} b 
 * @returns {boolean}
 */
export const doEntitiesShareIdentity = (a, b) => {
  if (!a || !b) return false;

  const keysA = extractIdentityKeys(a);
  const keysB = extractIdentityKeys(b);

  // Match on Client Code
  for (const c of keysA.codes) {
    if (keysB.codes.has(c)) return true;
  }

  // Match on Phone Numbers
  for (const p of keysA.phones) {
    if (keysB.phones.has(p)) return true;
  }

  // Match on Email
  for (const e of keysA.emails) {
    if (keysB.emails.has(e)) return true;
  }

  return false;
};

/**
 * Finds a matching Master Client from a leads/clients list using hierarchical deterministic matching:
 * 1. Direct Client Code Match
 * 2. Primary / Alt Phone Match
 * 3. Normalized Email Match
 * 
 * @param {Object} prospect - Prospect or Inquiry object (quote or lead)
 * @param {Array} clientList - Master leads/clients list
 * @returns {Object|null} Matching client object or null
 */
export const findMatchingClient = (prospect, clientList = []) => {
  if (!prospect || !Array.isArray(clientList) || clientList.length === 0) {
    return null;
  }

  const pKeys = extractIdentityKeys(prospect);

  return clientList.find(client => {
    if (!client) return false;
    // Exclude matching with self if comparing within the same array by ID
    if (client.id && prospect.id && client.id === prospect.id && !prospect.clientCode) {
      return false;
    }

    const cKeys = extractIdentityKeys(client);

    // 1. Client Code Match
    for (const code of pKeys.codes) {
      if (cKeys.codes.has(code)) return true;
    }

    // 2. Phone Match (Primary or Secondary/WhatsApp)
    for (const phone of pKeys.phones) {
      if (cKeys.phones.has(phone)) return true;
    }

    // 3. Email Match
    for (const email of pKeys.emails) {
      if (cKeys.emails.has(email)) return true;
    }

    return false;
  }) || null;
};

/**
 * Calculates customer touchpoints, cross-product inquiry count, and active client holdings
 * using multi-key transitive entity resolution.
 * 
 * If an inquiry matches a Master Client (CL-XXXXXX), all other inquiries associated
 * with that Master Client (even across alternate phone numbers or email addresses)
 * are transitively unified under the same customer identity graph.
 * 
 * @param {Object} prospect - Target inquiry / lead
 * @param {Array} quotesList - All web quotes/inquiries
 * @param {Array} leadsList - All master clients/leads
 * @returns {Object} { totalInquiries, totalClientRecords, otherInquiriesCount, matchingClient, matchedQuotes, matchedClients }
 */
export const calculateCustomerTouchpoints = (prospect, quotesList = [], leadsList = []) => {
  if (!prospect) {
    return {
      totalInquiries: 0,
      totalClientRecords: 0,
      otherInquiriesCount: 0,
      matchingClient: null,
      matchedQuotes: [],
      matchedClients: []
    };
  }

  // 1. Find the Master Client for this prospect (if any)
  const matchingClient = findMatchingClient(prospect, leadsList);

  // 2. Construct the unified identity graph cluster for this customer
  const prospectKeys = extractIdentityKeys(prospect);
  const unifiedPhones = new Set(prospectKeys.phones);
  const unifiedEmails = new Set(prospectKeys.emails);
  const unifiedCodes = new Set(prospectKeys.codes);

  if (matchingClient) {
    const clientKeys = extractIdentityKeys(matchingClient);
    clientKeys.phones.forEach(p => unifiedPhones.add(p));
    clientKeys.emails.forEach(e => unifiedEmails.add(e));
    clientKeys.codes.forEach(c => unifiedCodes.add(c));
  }

  // 3. Helper to test if any item intersects with the customer's unified identity cluster
  const matchesUnifiedIdentity = (item) => {
    if (!item) return false;
    const itemKeys = extractIdentityKeys(item);

    for (const code of itemKeys.codes) {
      if (unifiedCodes.has(code)) return true;
    }
    for (const phone of itemKeys.phones) {
      if (unifiedPhones.has(phone)) return true;
    }
    for (const email of itemKeys.emails) {
      if (unifiedEmails.has(email)) return true;
    }
    return false;
  };

  // 4. Resolve all quotes in quotesList matching the unified customer identity
  const matchedQuotes = Array.isArray(quotesList) ? quotesList.filter(item => {
    // If the quote matches directly
    if (matchesUnifiedIdentity(item)) return true;

    // If the quote is linked to the same master client transitively
    if (matchingClient) {
      const quoteClient = findMatchingClient(item, leadsList);
      if (quoteClient && (quoteClient.id === matchingClient.id || quoteClient.clientCode === matchingClient.clientCode)) {
        return true;
      }
    }
    return false;
  }) : [];

  // 5. Resolve all master client records matching the unified customer identity
  const matchedClients = Array.isArray(leadsList) ? leadsList.filter(matchesUnifiedIdentity) : [];

  const totalInquiries = Math.max(matchedQuotes.length, 1);
  const otherInquiriesCount = Math.max(0, totalInquiries - 1);

  return {
    totalInquiries,
    totalClientRecords: matchedClients.length,
    otherInquiriesCount,
    matchingClient,
    matchedQuotes,
    matchedClients
  };
};

