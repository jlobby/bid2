import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://bid2-1.onrender.com';


// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
};

// Items API
export const itemsAPI = {
  getItems: (params) => api.get('/items', { params }),
  getItem: (id) => api.get(`/items/${id}`),
  createItem: (formData) => api.post('/items', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateItem: (id, formData) => api.put(`/items/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteItem: (id) => api.delete(`/items/${id}`),
  getMyItems: (params) => api.get('/items/my-items', { params }),
  approveItem: (id) => api.put(`/items/${id}/approve`),
  rejectItem: (id, reason) => api.put(`/items/${id}/reject`, { reason }),
  getPendingItems: () => api.get('/items/pending'),
  getStats: () => api.get('/items/stats'),
};

// Bids API
export const bidsAPI = {
  createBid: (bidData) => api.post('/bids', bidData),
  getItemBids: (itemId, params) => api.get(`/bids/item/${itemId}`, { params }),
  getMyBids: (params) => api.get('/bids/my-bids', { params }),
  getHighestBid: (itemId) => api.get(`/bids/highest/${itemId}`),
  getBidStats: (itemId) => api.get(`/bids/stats/${itemId}`),
  cancelBid: (bidId) => api.delete(`/bids/${bidId}`),
};

export default api;
