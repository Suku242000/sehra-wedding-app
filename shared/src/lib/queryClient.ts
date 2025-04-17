import { QueryClient } from '@tanstack/react-query';

// Create a client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      retry: 1,
      refetchOnWindowFocus: true,
    },
  },
});

type ApiRequestOptions = {
  on401?: 'returnNull' | 'throw';
};

export function createQueryFn(baseOptions: ApiRequestOptions = {}) {
  return async function queryFn<T>({ queryKey }: { queryKey: [string, ...unknown[]] }): Promise<T> {
    try {
      const [path] = queryKey;
      const response = await fetch(path as string, {
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          if (baseOptions.on401 === 'returnNull') {
            return null as T;
          }
          throw new Error('Unauthorized - please login');
        }
        throw new Error(`API Error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  };
}

export const getQueryFn = createQueryFn();

export async function apiRequest(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  url: string,
  body?: unknown,
  headers?: HeadersInit,
) {
  try {
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      credentials: 'include',
    };

    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    return await fetch(url, options);
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
}