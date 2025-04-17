/**
 * API utilities that can be shared between client and internal apps
 */

// Base API URL - configurable per environment
const API_BASE = process.env.API_URL || '/api';

/**
 * Generic API request function
 * @param method HTTP method
 * @param endpoint API endpoint (without leading slash)
 * @param data Optional data payload
 * @param token Optional JWT token for authentication
 */
export async function apiRequest<T = any>(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  endpoint: string,
  data?: any,
  token?: string
): Promise<T> {
  const url = `${API_BASE}/${endpoint.startsWith('/') ? endpoint.slice(1) : endpoint}`;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const options: RequestInit = {
    method,
    headers,
    credentials: 'include', // Include cookies for session authentication
  };
  
  if (data && method !== 'GET') {
    options.body = JSON.stringify(data);
  }
  
  try {
    const response = await fetch(url, options);
    
    // Handle failed requests
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API Error (${method} ${url}): ${response.status}`);
    }
    
    // Return empty object for 204 No Content
    if (response.status === 204) {
      return {} as T;
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API Error (${method} ${url}):`, error);
    throw error;
  }
}

/**
 * Convenient shortcut methods
 */
export const api = {
  get: <T = any>(endpoint: string, token?: string) => 
    apiRequest<T>('GET', endpoint, undefined, token),
    
  post: <T = any>(endpoint: string, data?: any, token?: string) => 
    apiRequest<T>('POST', endpoint, data, token),
    
  put: <T = any>(endpoint: string, data?: any, token?: string) => 
    apiRequest<T>('PUT', endpoint, data, token),
    
  patch: <T = any>(endpoint: string, data?: any, token?: string) => 
    apiRequest<T>('PATCH', endpoint, data, token),
    
  delete: <T = any>(endpoint: string, token?: string) => 
    apiRequest<T>('DELETE', endpoint, undefined, token),
};