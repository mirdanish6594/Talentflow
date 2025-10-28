// client/src/lib/queryClient.ts

import { QueryClient, QueryFunction, QueryFunctionContext } from "@tanstack/react-query";

// This helper function is correct
async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// This function is fine
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

//
// === THIS FUNCTION IS THE FIX ===
//
type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async (context: QueryFunctionContext) => { // Use context
    
    // --- NEW LOGIC TO BUILD URL ---
    const { queryKey } = context;
    
    // 1. Separate string parts (for URL path) from the object part (for query params)
    const stringParts = queryKey.filter(
      (p): p is string => typeof p === 'string'
    );
    const objectPart = queryKey.find(
      (p) => typeof p === 'object' && p !== null && !Array.isArray(p)
    ) as Record<string, any> | undefined;

    // 2. Join all string parts to build the URL
    // e.g., ["/api/candidates", "id-123", "timeline"] -> "/api/candidates/id-123/timeline"
    let finalUrl = stringParts.join('/');

    // 3. Add query params if an object exists
    // e.g., ["/api/jobs", { search: "test" }] -> "/api/jobs?search=test"
    if (objectPart) {
      const cleanedParams: Record<string, string> = {};
      for (const [key, value] of Object.entries(objectPart)) {
        if (value !== undefined && value !== null && value !== "") {
          cleanedParams[key] = String(value);
        }
      }
      const searchParams = new URLSearchParams(cleanedParams);
      const queryString = searchParams.toString();
      if (queryString) {
        finalUrl += `?${queryString}`;
      }
    }
    // --- END OF NEW LOGIC ---

    // Now we use the correctly built finalUrl
    const res = await fetch(finalUrl, {
      credentials: "include",
    });

    // Your existing logic is preserved
    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

// Your queryClient config is correct and uses the new function
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});