import { QueryClient } from "@tanstack/react-query";

// Create a client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface ApiOptions {
  on401?: "throw" | "returnNull";
}

/**
 * Generic API request function that handles common error cases
 */
export async function apiRequest(method: Method, url: string, body?: any) {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  const options: RequestInit = {
    method,
    headers,
    credentials: "include",
  };

  if (body && method !== "GET") {
    options.body = JSON.stringify(body);
  }

  return fetch(url, options);
}

/**
 * Creates a query function that handles common API patterns
 */
export function getQueryFn(options: ApiOptions = {}) {
  return async ({ queryKey }: { queryKey: string[] }) => {
    const [endpoint] = queryKey;
    const res = await apiRequest("GET", endpoint);

    if (!res.ok) {
      if (res.status === 401 && options.on401 === "returnNull") {
        return null;
      }
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `API error: ${res.status}`);
    }

    return res.json();
  };
}