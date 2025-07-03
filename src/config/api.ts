
// API configuration based on environment
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api'  // Use relative path in production to go through nginx proxy
  : 'http://localhost:8347/api';

export { API_BASE_URL };
