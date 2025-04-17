import { QueryClient } from "@tanstack/react-query";

// Configuration options for the default fetcher
interface FetcherConfig {
  on401?: "throw" | "returnNull";
}

// Create a query client with default options
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

// Standard API request function for mutations
export async function apiRequest(
  method: string,
  url: string,
  data?: any
): Promise<Response> {
  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // Include cookies for session authentication
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  return fetch(url, options);
}

// Default query function for React Query that handles common patterns
export function getQueryFn(config: FetcherConfig = {}) {
  return async ({ queryKey }: { queryKey: (string | number)[] }) => {
    const [endpoint] = queryKey;

    if (typeof endpoint !== "string") {
      throw new Error("Query key must be a string endpoint");
    }

    // Build the URL from the query key
    let url = endpoint;
    if (queryKey.length > 1) {
      // Add additional path segments from the query key
      const pathParams = queryKey.slice(1).map(String);
      url = `${endpoint}/${pathParams.join("/")}`;
    }

    const response = await fetch(url, {
      credentials: "include", // Include cookies for session authentication
    });

    // Handle unauthorized errors
    if (response.status === 401) {
      if (config.on401 === "returnNull") {
        return null;
      }
      throw new Error("Unauthorized");
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `API error: ${response.statusText}`
      );
    }

    // Only attempt to parse JSON if there's content
    if (response.status !== 204) {
      return response.json();
    }

    return null;
  };
}