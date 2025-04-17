import { QueryClient } from '@tanstack/react-query';

// Define API error response type
type ApiErrorResponse = {
  message: string;
  errors?: Record<string, string[]>;
};

// Define options for getQueryFn helper
type QueryFnOptions = {
  on401?: 'returnNull' | 'throw';
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

// Helper function to create API requests
export async function apiRequest(
  method: string,
  endpoint: string | number,
  data?: unknown,
  options: RequestInit = {}
): Promise<Response> {
  const response = await fetch(endpoint.toString(), {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: data ? JSON.stringify(data) : undefined,
    credentials: 'include',
    ...options,
  });

  if (!response.ok) {
    const errorData: ApiErrorResponse = await response.json().catch(() => ({
      message: `HTTP error ${response.status}`,
    }));

    const error = new Error(
      errorData.message || `HTTP error ${response.status}`
    );
    (error as any).status = response.status;
    (error as any).errors = errorData.errors;
    throw error;
  }

  return response;
}

// Default query function for React Query
export function getQueryFn(options: QueryFnOptions = {}) {
  return async ({ queryKey }: { queryKey: [string, ...unknown[]] }) => {
    const [endpoint, ...params] = queryKey;
    
    try {
      const response = await apiRequest(
        'GET',
        params.length ? `${endpoint}/${params.join('/')}` : endpoint
      );
      
      return await response.json();
    } catch (error: any) {
      // Handle 401 errors based on options
      if (error.status === 401 && options.on401 === 'returnNull') {
        return null;
      }
      throw error;
    }
  };
}

// Configure the global fetch for react-query
queryClient.setDefaultOptions({
  queries: {
    queryFn: getQueryFn(),
  },
});

export default queryClient;