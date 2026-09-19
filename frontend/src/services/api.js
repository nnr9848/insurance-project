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
  logCall: async (data) => {
    const res = await api.post('/crm/calls', data);
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
  getManagerSummary: async () => {
    const res = await api.get('/crm/analytics/manager-summary');
    return res.data;
  },
  getSuperAdminSummary: async () => {
    const res = await api.get('/crm/analytics/superadmin-summary');
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
