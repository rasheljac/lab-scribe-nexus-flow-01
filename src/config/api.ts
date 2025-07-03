
// API configuration for EasyPanel deployment
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api'  // Use relative path in production (proxied by nginx)
  : 'http://localhost:8347/api';  // Development mode

export { API_BASE_URL };
