import { QueryClient } from '@tanstack/react-query';

// Create a client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 300000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

// Reusable fetch function for data fetching
export const getQueryFn = (options?: { on401?: 'throw' | 'returnNull' }) => {
  const opts = {
    on401: 'throw' as const,
    ...options,
  };
  
  return async ({ queryKey }: { queryKey: (string | number)[] }) => {
    const endpoint = queryKey[0];
    const response = await fetch(endpoint, {
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 401 && opts.on401 === 'returnNull') {
        return null;
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Error ${response.status}: ${response.statusText}`
      );
    }

    return response.json();
  };
};

// Helper for making API requests
type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export const apiRequest = async (
  method: Method,
  endpoint: string,
  data?: Record<string, any>
) => {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  };

  if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(endpoint, options);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Error ${response.status}: ${response.statusText}`
    );
  }

  // For DELETE requests or requests that don't return JSON
  if (method === 'DELETE' || response.headers.get('Content-Length') === '0') {
    return response;
  }

  return response;
};

export default queryClient;