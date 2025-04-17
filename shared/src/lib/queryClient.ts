import { QueryClient } from "@tanstack/react-query";

// Initialize react-query client with default settings
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 60 * 1000, // 1 minute
    },
  },
});

// Types for API requests
type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
type RequestOptions = {
  on401?: "returnNull" | "throw";
  headers?: Record<string, string>;
};

/**
 * Standardized API request function
 * - Handles Content-Type and credentials
 * - Can be configured to handle 401 errors differently
 * 
 * @param method HTTP method
 * @param endpoint API endpoint (should start with '/')
 * @param data Optional data for POST/PUT/PATCH requests
 * @param options Optional configuration
 * @returns Response object
 */
export async function apiRequest(
  method: Method,
  endpoint: string,
  data?: unknown,
  options: RequestOptions = {}
): Promise<Response> {
  const { on401 = "throw", headers = {} } = options;

  const requestOptions: RequestInit = {
    method,
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
    credentials: "include",
  };

  if (data && method !== "GET") {
    requestOptions.body = JSON.stringify(data);
  }

  const response = await fetch(endpoint, requestOptions);

  if (response.status === 401 && on401 === "throw") {
    throw new Error("Unauthorized");
  }

  return response;
}

/**
 * Helper function for React Query's queryFn
 * - Returns a function that makes an API request
 * - Handles response parsing to JSON
 * - Configurable 401 handling
 * 
 * @param options Options for the request
 * @returns Query function for React Query
 */
export function getQueryFn<T = unknown>(options: RequestOptions = {}) {
  return async ({ queryKey }: { queryKey: (string | Record<string, unknown>)[] }) => {
    const endpoint = queryKey[0] as string;
    
    try {
      const response = await apiRequest("GET", endpoint, undefined, options);
      
      if (!response.ok) {
        if (response.status === 401 && options.on401 === "returnNull") {
          return null as unknown as T;
        }
        
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to fetch data from ${endpoint}`
        );
      }
      
      return response.json() as Promise<T>;
    } catch (error) {
      if (error instanceof Error && error.message === "Unauthorized" && options.on401 === "returnNull") {
        return null as unknown as T;
      }
      throw error;
    }
  };
}