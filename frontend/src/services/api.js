import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Token management
const getToken = () => localStorage.getItem('auth_token');
const setToken = (token) => {
  localStorage.setItem('auth_token', token);
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};
const removeToken = () => {
  localStorage.removeItem('auth_token');
  delete api.defaults.headers.common['Authorization'];
};

// Set token on app load
const token = getToken();
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Auth functions
export const authService = {
  login: async (email, password) => {
    const response = await api.post('/login', { email, password });
    if (response.data.token) {
      setToken(response.data.token);
    }
    return response;
  },
  
  register: async (userData) => {
    const response = await api.post('/register', userData);
    if (response.data.token) {
      setToken(response.data.token);
    }
    return response;
  },
  
  logout: async () => {
    try {
      await api.post('/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
    removeToken();
  },
  
  getUser: async () => {
    if (!getToken()) {
      throw new Error('No token');
    }
    return api.get('/user');
  },
};

// Project functions
export const projectService = {
  getAll: async (params = {}) => {
    return api.get('/projects', { params });
  },
  
  getOne: async (id) => {
    return api.get(`/projects/${id}`);
  },
  
  create: async (projectData) => {
    // Check if it's FormData (for file uploads)
    const isFormData = projectData instanceof FormData;
    
    // If FormData, don't set Content-Type (let browser set it with boundary)
    const config = isFormData ? {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    } : {};
    
    return api.post('/projects', projectData, config);
  },
  
  update: async (id, projectData) => {
    return api.put(`/projects/${id}`, projectData);
  },
  
  delete: async (id) => {
    return api.delete(`/projects/${id}`);
  },
  
  vote: async (id) => {
    return api.post(`/projects/${id}/vote`);
  },
};

export default api;