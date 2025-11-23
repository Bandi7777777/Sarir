"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useMemo } from "react";

// نسخهٔ مینیمال و پایدار: فقط QueryClientProvider
let _client: QueryClient | null = null;
function getQueryClient() {
  if (!_client) {
    _client = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60_000,
          refetchOnWindowFocus: false,
          retry: 1,
        },
      },
    });
  }
  return _client;
}

export default function QueryProvider({ children }: { children: ReactNode }) {
  const qc = useMemo(() => getQueryClient(), []);
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}
