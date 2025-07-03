
import { API_BASE_URL } from '@/config/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

export const apiClient = {
  get: async (endpoint: string) => {
    console.log(`Making GET request to: ${API_BASE_URL}${endpoint}`);
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      console.error(`API GET error: ${response.status} ${response.statusText}`);
      throw new Error(`API error: ${response.statusText}`);
    }
    
    return response.json();
  },

  post: async (endpoint: string, data: any) => {
    console.log(`Making POST request to: ${API_BASE_URL}${endpoint}`);
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      console.error(`API POST error: ${response.status} ${response.statusText}`);
      throw new Error(`API error: ${response.statusText}`);
    }
    
    return response.json();
  },

  put: async (endpoint: string, data: any) => {
    console.log(`Making PUT request to: ${API_BASE_URL}${endpoint}`);
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      console.error(`API PUT error: ${response.status} ${response.statusText}`);
      throw new Error(`API error: ${response.statusText}`);
    }
    
    return response.json();
  },

  delete: async (endpoint: string) => {
    console.log(`Making DELETE request to: ${API_BASE_URL}${endpoint}`);
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      console.error(`API DELETE error: ${response.status} ${response.statusText}`);
      throw new Error(`API error: ${response.statusText}`);
    }
    
    return response.json();
  },
};
