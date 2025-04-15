import { queryClient } from "./queryClient";

// Base URL for API requests
const API_BASE_URL = '/api';

/**
 * Generic function to make API requests
 * @param method HTTP method (GET, POST, PUT, DELETE, etc.)
 * @param endpoint API endpoint
 * @param data Request body data (optional)
 * @returns Promise with the response data
 */
export async function apiRequest<T>(
  method: string,
  endpoint: string,
  data?: unknown
): Promise<T> {
  const url = endpoint.startsWith('/api') ? endpoint : `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('token');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(url, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
      credentials: 'include',
    });
    
    // Handle non-OK responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }
    
    // Parse JSON response
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error(`API Error (${method} ${endpoint}):`, error);
    throw error;
  }
}

/**
 * Helper function to get data with authentication
 * @param endpoint API endpoint
 * @returns Promise with the response data
 */
export async function fetchWithAuth<T>(endpoint: string): Promise<T> {
  return apiRequest<T>('GET', endpoint);
}

/**
 * Helper function to create data with authentication
 * @param endpoint API endpoint
 * @param data Request body data
 * @returns Promise with the response data
 */
export async function createWithAuth<T>(endpoint: string, data: unknown): Promise<T> {
  return apiRequest<T>('POST', endpoint, data);
}

/**
 * Helper function to update data with authentication
 * @param endpoint API endpoint
 * @param data Request body data
 * @returns Promise with the response data
 */
export async function updateWithAuth<T>(endpoint: string, data: unknown): Promise<T> {
  return apiRequest<T>('PATCH', endpoint, data);
}

/**
 * Helper function to delete data with authentication
 * @param endpoint API endpoint
 * @returns Promise with the response data
 */
export async function deleteWithAuth<T>(endpoint: string): Promise<T> {
  return apiRequest<T>('DELETE', endpoint);
}

/**
 * Helper function to invalidate queries after mutations
 * @param queryKey Query key to invalidate
 */
export function invalidateQueries(queryKey: string | string[]): void {
  queryClient.invalidateQueries({ queryKey: typeof queryKey === 'string' ? [queryKey] : queryKey });
}
