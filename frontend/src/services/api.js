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
  createHospital: async (data) => {
    const res = await api.post('/admin/hospitals', data);
    return res.data;
  },
  createHospitalsBulk: async (list) => {
    const res = await api.post('/admin/hospitals/bulk', list);
    return res.data;
  },
  deleteHospital: async (id) => {
    const res = await api.delete(`/admin/hospitals/${id}`);
    return res.data;
  },
};

export default api;
