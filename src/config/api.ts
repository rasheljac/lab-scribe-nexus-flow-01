
// API configuration based on environment
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'http://localhost:3001/api'  // In Docker, services communicate via service names
  : 'http://localhost:3001/api';

export { API_BASE_URL };
