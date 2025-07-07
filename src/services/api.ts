import axios from 'axios';

// Configuración de la URL base de la API
const API_URL = import.meta.env.PROD 
  ? '/api' 
  : 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout para subida de archivos
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Log request for debugging
  console.log('API Request:', {
    method: config.method,
    url: config.url,
    headers: config.headers,
    data: config.data instanceof FormData ? 'FormData' : config.data
  });
  
  return config;
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
      data: error.response?.data
    });
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ No se puede conectar al servidor backend. Asegúrate de que esté ejecutándose en http://localhost:5000');
    } else if (error.response?.status === 404) {
      console.error('❌ Endpoint no encontrado:', error.config?.url);
    }
    
    return Promise.reject(error);
  }
);

export default api;