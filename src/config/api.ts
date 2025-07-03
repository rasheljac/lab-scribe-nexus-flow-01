
// API configuration for EasyPanel deployment
console.log('Environment check:', {
  NODE_ENV: process.env.NODE_ENV,
  window_location: typeof window !== 'undefined' ? window.location.href : 'server-side'
});

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api'  // Use relative path in production (proxied by nginx)
  : 'http://localhost:8347/api';  // Development mode

console.log('API_BASE_URL configured as:', API_BASE_URL);

export { API_BASE_URL };
