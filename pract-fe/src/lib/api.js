import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

console.log('Server is on', API.defaults.baseURL);

// Auth
export const register = (data) => API.post('/register', data);
export const login    = (data) => API.post('/login', data);
export const logout   = ()     => API.post('/logout');
export const getMe    = ()     => API.get('/me');

// Spare Parts
export const createSparePart = (data) => API.post('/spare-parts', data);
export const getSpareParts   = ()     => API.get('/spare-parts');

// Stock In
export const createStockIn = (data) => API.post('/stock-in', data);

// Stock Out — notice id goes in the URL, not as a 2nd axios arg
export const createStockOut = (data)     => API.post('/stock-out', data);
export const getStockOuts   = ()         => API.get('/stock-out');
export const updateStockOut = (id, data) => API.put(`/stock-out/${id}`, data);
export const deleteStockOut = (id)       => API.delete(`/stock-out/${id}`);

// Reports
export const getDailyReport  = (date) => API.get(`/reports/daily?date=${date}`);
export const getStatusReport = ()     => API.get('/reports/status');