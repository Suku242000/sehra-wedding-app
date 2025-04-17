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
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: true,
    },
  },
});

export async function apiRequest(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  path: string,
  data?: any,
  options: RequestInit = {}
): Promise<Response> {
  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options.headers,
    },
    credentials: 'include',
    ...options,
  };

  if (data !== undefined) {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(path, config);

  if (!response.ok) {
    try {
      const errorData: ApiErrorResponse = await response.json().catch(() => ({
        message: `${response.status} ${response.statusText}`,
      }));

      throw new Error(
        errorData.message ||
          errorData.errors?.[Object.keys(errorData.errors)[0]]?.[0] ||
          `${response.status} ${response.statusText}`
      );
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`${response.status} ${response.statusText}`);
    }
  }

  return response;
}

export function getQueryFn(options: QueryFnOptions = {}) {
  return async ({ queryKey }: { queryKey: string[] }) => {
    try {
      const path = queryKey[0];
      const response = await apiRequest('GET', path);
      return await response.json();
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes('401') &&
        options.on401 === 'returnNull'
      ) {
        return null;
      }
      throw error;
    }
  };
}