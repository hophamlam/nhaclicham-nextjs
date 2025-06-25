"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

/**
 * QueryProvider - Provider cho React Query
 * Quản lý server state và caching
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Stale time: 5 phút
            staleTime: 5 * 60 * 1000,
            // Cache time: 10 phút
            gcTime: 10 * 60 * 1000,
            // Retry 1 lần khi fail
            retry: 1,
            // Không refetch khi window focus
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
