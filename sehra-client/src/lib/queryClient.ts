import { QueryClient } from '@tanstack/react-query';

type ApiErrorResponse = {
  message: string;
  errors?: Record<string, string[]>;
};

type QueryFnOptions = {
  on401?: 'returnNull' | 'throw';
};

// Create a client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export async function apiRequest(
  method: string,
  url: string,
  data?: any,
  options: RequestInit = {}
) {
  const config: RequestInit = {
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    try {
      const errorData: ApiErrorResponse = await response.json().catch(() => ({
        message: response.statusText || 'An error occurred',
      }));

      const error = new Error(
        errorData.message ||
          errorData.errors?.[Object.keys(errorData.errors)[0]]?.[0] ||
          'An error occurred'
      );
      throw error;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred');
    }
  }

  return response;
}

export function getQueryFn(options: QueryFnOptions = {}) {
  return async ({ queryKey }: { queryKey: string[] }) => {
    const url = queryKey[0];
    try {
      const response = await apiRequest('GET', url);
      if (response.status === 204) return null;
      return await response.json();
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes('Unauthorized') &&
        options.on401 === 'returnNull'
      ) {
        return null;
      }
      throw error;
    }
  };
}