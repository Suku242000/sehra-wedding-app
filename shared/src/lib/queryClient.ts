import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

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
  const requestOptions: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    credentials: "include",
  };

  if (data && method !== "GET") {
    requestOptions.body = JSON.stringify(data);
  }

  const response = await fetch(endpoint, requestOptions);

  if (response.status === 401 && options.on401 === "returnNull") {
    return new Response(JSON.stringify(null), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `API request failed: ${response.statusText}`;
    
    try {
      const errorJson = JSON.parse(errorText);
      if (errorJson?.message) {
        errorMessage = errorJson.message;
      }
    } catch (e) {
      // If the error response is not valid JSON, use the error text as is
      if (errorText) {
        errorMessage = errorText;
      }
    }
    
    throw new Error(errorMessage);
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
  return async ({ queryKey }: { queryKey: (string | Record<string, unknown>)[] }): Promise<T | null> => {
    const endpoint = queryKey[0] as string;
    
    // Extract params from queryKey if present
    const params = queryKey.length > 1 && typeof queryKey[1] === 'object' 
      ? queryKey[1] as Record<string, unknown>
      : undefined;
    
    let finalEndpoint = endpoint;
    
    // If params are available, add them as query parameters
    if (params) {
      const searchParams = new URLSearchParams();
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      
      const queryString = searchParams.toString();
      if (queryString) {
        finalEndpoint = `${endpoint}?${queryString}`;
      }
    }
    
    const response = await apiRequest("GET", finalEndpoint, undefined, options);
    
    if (response.status === 204) {
      return null;
    }
    
    return response.json();
  };
}