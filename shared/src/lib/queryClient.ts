import { QueryClient } from "@tanstack/react-query";

// Create a client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

/**
 * Helper function for making standardized API requests
 * @param method The HTTP method to use
 * @param endpoint The API endpoint to request
 * @param body The request body (for POST, PUT, PATCH)
 * @param options Additional fetch options
 * @returns The fetch response
 */
export async function apiRequest(
  method: string,
  endpoint: string,
  body?: any,
  options?: RequestInit
): Promise<Response> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options?.headers || {}),
  };

  const config: RequestInit = {
    method,
    headers,
    credentials: "include",
    ...options,
  };

  if (body && (method === "POST" || method === "PUT" || method === "PATCH")) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(endpoint, config);
  return response;
}

/**
 * Configurable query function factory for TanStack Query
 * 
 * @param options.on401 - how to handle 401 errors, "throw" or "returnNull"
 * @returns A fetch function for TanStack Query
 */
export function getQueryFn({ 
  on401 = "throw" 
}: { 
  on401?: "throw" | "returnNull" 
} = {}) {
  return async ({ queryKey }: { queryKey: (string | number)[] }) => {
    const endpoint = String(queryKey[0]);
    const res = await apiRequest("GET", endpoint);

    if (res.status === 401) {
      if (on401 === "returnNull") {
        return null;
      } else {
        throw new Error("Unauthorized");
      }
    }

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        errorData.message || 
        `Failed to fetch data from ${endpoint}: ${res.statusText}`
      );
    }

    if (res.status === 204) {
      return null;
    }

    return res.json();
  };
}