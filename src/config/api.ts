
// API configuration based on environment
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'http://localhost:8347/api'  // In Docker, services communicate via service names
  : 'http://localhost:8347/api';

export { API_BASE_URL };
