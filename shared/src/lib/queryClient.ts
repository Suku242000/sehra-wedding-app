import { QueryClient } from "@tanstack/react-query";

// Create a client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
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
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  endpoint: string,
  body?: any,
  options?: RequestInit
) {
  // Set up headers with content type
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  // Configure the fetch request
  const config: RequestInit = {
    method,
    headers,
    credentials: "include", // Include cookies for session-based auth
    ...options,
  };

  // Add body for methods that support it
  if (body && ["POST", "PUT", "PATCH"].includes(method)) {
    config.body = JSON.stringify(body);
  }

  return fetch(endpoint, config);
}

/**
 * Configurable query function factory for TanStack Query
 * 
 * @param options.on401 - how to handle 401 errors, "throw" or "returnNull"
 * @returns A fetch function for TanStack Query
 */
export function getQueryFn({
  on401 = "throw",
}: {
  on401?: "throw" | "returnNull";
} = {}) {
  return async ({ queryKey }: { queryKey: string[] }) => {
    const endpoint = queryKey[0];
    const res = await apiRequest("GET", endpoint);

    // Handle unauthorized (not logged in)
    if (res.status === 401) {
      if (on401 === "returnNull") {
        return null;
      } else {
        throw new Error("Not authenticated");
      }
    }

    // Handle other errors
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || "API request failed");
    }

    // Return the data
    const data = await res.json();
    return data;
  };
}