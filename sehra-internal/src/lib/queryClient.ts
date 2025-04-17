import { QueryClient } from '@tanstack/react-query';

interface ApiRequestOptions {
  on401?: 'throw' | 'returnNull';
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

export const getQueryFn = (options?: ApiRequestOptions) => async ({ queryKey }: { queryKey: string[] }) => {
  try {
    const response = await fetch(queryKey.join('/'));
    
    if (response.status === 401 && options?.on401 === 'returnNull') {
      return null;
    }
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`API fetch error: ${error.message}`);
    }
    throw new Error('Unknown API fetch error');
  }
};

export async function apiRequest(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  endpoint: string,
  data?: any,
) {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  return fetch(endpoint, options);
}