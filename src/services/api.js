import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
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

// User API
export const userAPI = {
  register: (data) => api.post('/users/register', data),
  login: (data) => api.post('/users/login', data),
  forgotPassword: (data) => api.post('/users/forgot-password', data),
  resetPassword: (token, data) => api.post(`/users/reset-password/${token}`, data),
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  getAllUsers: () => api.get('/users/all'),
  deleteUser: (id) => api.delete(`/users/${id}`),
};

// Menu API
export const menuAPI = {
  getAllItems: (params) => api.get('/menu', { params }),
  getItemById: (id) => api.get(`/menu/${id}`),
  createItem: (data) => api.post('/menu', data),
  updateItem: (id, data) => api.put(`/menu/${id}`, data),
  deleteItem: (id) => api.delete(`/menu/${id}`),
  getCategories: () => api.get('/menu/categories'),
};

// Order API
export const orderAPI = {
  createOrder: (data) => api.post('/orders', data),
  getAllOrders: (params) => api.get('/orders', { params }),
  getOrderById: (id) => api.get(`/orders/${id}`),
  getUserOrders: (params) => api.get('/orders/my-orders', { params }),
  getPublicReviews: () => api.get('/orders/reviews/public'),
  submitOrderReview: (id, data) => api.put(`/orders/${id}/review`, data),
  updateOrderStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
  deleteOrder: (id) => api.delete(`/orders/${id}`),
};

export default api;
