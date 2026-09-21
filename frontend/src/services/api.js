import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT Bearer Token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: async (identifier, password) => {
    const res = await api.post('/auth/login', { identifier, password });
    return res.data;
  },
  register: async (data) => {
    const res = await api.post('/auth/register', data);
    return res.data;
  },
  getCurrentUser: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
};

export const crmService = {
  // User & Team Governance
  getUsers: async () => {
    const res = await api.get('/crm/users');
    return res.data;
  },
  getAssignableRoles: async () => {
    const res = await api.get('/crm/users/roles');
    return res.data;
  },
  getManagers: async () => {
    const res = await api.get('/crm/users/managers');
    return res.data;
  },
  getAdvisors: async () => {
    const res = await api.get('/crm/users/advisors');
    return res.data;
  },
  getTeamMembers: async (managerId) => {
    const res = await api.get(`/crm/users/team/${managerId}`);
    return res.data;
  },
  createUser: async (data) => {
    const res = await api.post('/crm/users', data);
    return res.data;
  },
  updateUser: async (id, data) => {
    const res = await api.put(`/crm/users/${id}`, data);
    return res.data;
  },
  resetPassword: async (id, newPassword) => {
    const res = await api.post(`/crm/users/${id}/reset-password`, { newPassword });
    return res.data;
  },
  getDepartments: async () => {
    const res = await api.get('/crm/users/departments');
    return res.data;
  },
  getDesignations: async (departmentId) => {
    const res = await api.get('/crm/users/designations', { params: departmentId ? { departmentId } : {} });
    return res.data;
  },

  // Leads & Pipeline
  getLeads: async () => {
    const res = await api.get('/crm/leads');
    return res.data;
  },
  createLead: async (data) => {
    const res = await api.post('/crm/leads', data);
    return res.data;
  },
  bulkImportLeads: async (leadsArray) => {
    const res = await api.post('/crm/leads/bulk-import', leadsArray);
    return res.data;
  },
  updateLead: async (id, data) => {
    const res = await api.put(`/crm/leads/${id}`, data);
    return res.data;
  },
  reassignLead: async (id, targetAdvisorId, reassignmentReason) => {
    const res = await api.post(`/crm/leads/${id}/reassign`, { targetAdvisorId, reassignmentReason });
    return res.data;
  },

  // Calls & Follow-Ups
  logCall: async (callData) => {
    const res = await api.post('/crm/calls', callData);
    return res.data;
  },
  getCallHistory: async () => {
    const res = await api.get('/crm/calls/history');
    return res.data;
  },
  getClientCallLogs: async (clientId) => {
    const res = await api.get(`/crm/calls/client/${clientId}`);
    return res.data;
  },
  getDueTodayFollowUps: async () => {
    const res = await api.get('/crm/followups/due-today');
    return res.data;
  },
  getOverdueFollowUps: async () => {
    const res = await api.get('/crm/followups/overdue');
    return res.data;
  },

  // Meetings
  scheduleMeeting: async (data) => {
    const res = await api.post('/crm/meetings', data);
    return res.data;
  },
  getUpcomingMeetings: async () => {
    const res = await api.get('/crm/meetings/upcoming');
    return res.data;
  },

  // Analytics & Dashboard Summary
  getAdvisorSummary: async () => {
    const res = await api.get('/crm/analytics/advisor-summary');
    return res.data;
  },
  getManagerSummary: async () => {
    const res = await api.get('/crm/analytics/manager-summary');
    return res.data;
  },
  getSuperAdminSummary: async () => {
    const res = await api.get('/crm/analytics/superadmin-summary');
    return res.data;
  },

  // Policy Renewal Reminder Engine
  getRenewalSummary: async () => {
    const res = await api.get('/crm/renewals/summary');
    return res.data;
  },
  getRenewalList: async (bucket = 'ALL') => {
    const res = await api.get(`/crm/renewals/list?bucket=${bucket}`);
    return res.data;
  },
  sendRenewalReminder: async (data) => {
    const res = await api.post('/crm/renewals/send-reminder', data);
    return res.data;
  },
  // Multi-Insurer Quotation Management & Comparison
  getQuotations: async () => {
    const res = await api.get('/crm/quotations');
    return res.data;
  },
  getClientQuotations: async (clientId) => {
    const res = await api.get(`/crm/quotations/client/${clientId}`);
    return res.data;
  },
  createQuotation: async (quoteData) => {
    const res = await api.post('/crm/quotations', quoteData);
    return res.data;
  },
  updateQuoteStatus: async (quoteId, status) => {
    const res = await api.patch(`/crm/quotations/${quoteId}/status`, { status });
    return res.data;
  },
  sendQuoteDispatch: async (quoteId, dispatchData) => {
    const res = await api.post(`/crm/quotations/${quoteId}/send`, dispatchData);
    return res.data;
  },
  // Digital KYC & Document Collection Engine
  getDocuments: async () => {
    const res = await api.get('/crm/documents');
    return res.data;
  },
  getClientDocuments: async (clientId) => {
    const res = await api.get(`/crm/documents/client/${clientId}`);
    return res.data;
  },
  uploadDocument: async (docData) => {
    const res = await api.post('/crm/documents/upload', docData);
    return res.data;
  },
  verifyDocument: async (docId, verifyData) => {
    const res = await api.patch(`/crm/documents/${docId}/verify`, verifyData);
    return res.data;
  },
  deleteDocument: async (docId) => {
    const res = await api.delete(`/crm/documents/${docId}`);
    return res.data;
  },
  requestDocumentsChecklist: async (clientId, docTypes) => {
    const res = await api.post(`/crm/documents/client/${clientId}/request-checklist`, { docTypes });
    return res.data;
  },
  // Manager Approval Workflows & Governance
  getApprovals: async () => {
    const res = await api.get('/crm/approvals');
    return res.data;
  },
  getClientApprovals: async (clientId) => {
    const res = await api.get(`/crm/approvals/client/${clientId}`);
    return res.data;
  },
  submitApprovalRequest: async (approvalData) => {
    const res = await api.post('/crm/approvals', approvalData);
    return res.data;
  },
  reviewApprovalRequest: async (approvalId, reviewData) => {
    const res = await api.patch(`/crm/approvals/${approvalId}/review`, reviewData);
    return res.data;
  },
  // Enterprise Audit Trail & Compliance
  getClientAuditLogs: async (clientId) => {
    const res = await api.get(`/crm/audit/client/${clientId}`);
    return res.data;
  },
  getCompanyAuditFeed: async () => {
    const res = await api.get('/crm/audit/company-feed');
    return res.data;
  },
  // Sandbox & System Operations
  seedDemoData: async () => {
    const res = await api.post('/crm/system/seed-demo-data');
    return res.data;
  },
  purgeDemoData: async () => {
    const res = await api.post('/crm/system/purge-demo-data');
    return res.data;
  },
};

export const portalService = {
  getCategories: async () => {
    const res = await api.get('/categories');
    return res.data;
  },
  submitQuote: async (data) => {
    const res = await api.post('/quotes', data);
    return res.data;
  },
  searchHospitals: async (city, query) => {
    const res = await api.get('/hospitals', { params: { city, query } });
    return res.data;
  },
  getHospitalCities: async () => {
    const res = await api.get('/hospitals/cities');
    return res.data;
  },
  applyPOSP: async (data) => {
    const res = await api.post('/posp/apply', data);
    return res.data;
  },
  submitClaim: async (data) => {
    const res = await api.post('/claims/submit', data);
    return res.data;
  },
  // Admin Endpoints
  getAdminQuotes: async () => {
    const res = await api.get('/admin/quotes');
    return res.data;
  },
  updateQuoteStatus: async (id, status) => {
    const res = await api.patch(`/admin/quotes/${id}/status`, { status });
    return res.data;
  },
  updateQuote: async (id, data) => {
    const res = await api.put(`/admin/quotes/${id}`, data);
    return res.data;
  },
  getAdminPOSP: async () => {
    const res = await api.get('/admin/posp-applications');
    return res.data;
  },
  updatePOSPStatus: async (id, status) => {
    const res = await api.patch(`/admin/posp-applications/${id}/status`, { status });
    return res.data;
  },
  getAdminClaims: async () => {
    const res = await api.get('/admin/claims');
    return res.data;
  },
  getAdminHospitals: async (city, query) => {
    const res = await api.get('/admin/hospitals', { params: { city, query } });
    return res.data;
  },
  createHospital: async (data) => {
    const res = await api.post('/admin/hospitals', data);
    return res.data;
  },
  createHospitalsBulk: async (list) => {
    const res = await api.post('/admin/hospitals/bulk', list);
    return res.data;
  },
  toggleHospitalStatus: async (id) => {
    const res = await api.post(`/admin/hospitals/${id}/toggle-status`);
    return res.data;
  },
  deleteHospital: async (id) => {
    const res = await api.delete(`/admin/hospitals/${id}`);
    return res.data;
  },
};

export default api;
