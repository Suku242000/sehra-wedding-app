import { QueryClient } from '@tanstack/react-query';

type ApiErrorResponse = {
  message: string;
  errors?: Record<string, string[]>;
};

type QueryFnOptions = {
  on401?: 'returnNull' | 'throw';
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30, // 30 seconds
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export async function apiRequest(
  method: string,
  endpoint: string,
  data?: any,
  options: RequestInit = {}
) {
  const url = endpoint.startsWith('http') ? endpoint : endpoint;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const config: RequestInit = {
    method,
    headers,
    credentials: 'include',
    ...options,
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    const errorData: ApiErrorResponse = await response.json().catch(() => ({
      message: `HTTP error: ${response.status} ${response.statusText}`,
    }));

    const error = new Error(
      errorData.errors
        ? `${errorData.message}: ${JSON.stringify(errorData.errors)}`
        : errorData.message
    );

    throw error;
  }

  // Don't try to parse empty responses
  const contentType = response.headers.get('Content-Type') || '';
  if (contentType.includes('application/json') && response.status !== 204) {
    return response;
  }

  return response;
}

// Default query function that assumes the queryKey starts with the endpoint
export function getQueryFn(options: QueryFnOptions = {}) {
  return async ({ queryKey }: { queryKey: [string, ...unknown[]] }) => {
    const endpoint = queryKey[0];
    
    try {
      const response = await apiRequest('GET', endpoint);
      
      if (response.status === 204) {
        return null;
      }
      
      return await response.json();
    } catch (error: any) {
      if (error.message?.includes('HTTP error: 401') && options.on401 === 'returnNull') {
        return null;
      }
      throw error;
    }
  };
}