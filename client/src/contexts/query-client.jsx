"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
export function QueryClientWrapper({ children }) {
  return (
    <QueryClientProvider
      client={
        new QueryClient({
          defaultOptions: {
            queries: {
              staleTime: 60 * 1000,
            },
          },
        })
      }
    >
      {children}
    </QueryClientProvider>
  );
}
