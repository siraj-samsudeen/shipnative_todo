/**
 * Testing Utilities
 *
 * Helpers for testing components and hooks
 */

import type { ReactElement } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import type { RenderOptions } from "@testing-library/react-native"
import { render } from "@testing-library/react-native"
import { SafeAreaProvider } from "react-native-safe-area-context"

import { ThemeProvider } from "../../theme/context"

/**
 * Custom render function that includes providers
 */
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>{children}</ThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  )
}

export const renderWithProviders = (ui: ReactElement, options?: Omit<RenderOptions, "wrapper">) =>
  render(ui, { wrapper: AllTheProviders, ...options })

/**
 * Mock data helpers
 */
export const mockData = {
  user: {
    id: "test-user-id",
    email: "test@example.com",
    created_at: new Date().toISOString(),
  },
  session: {
    access_token: "test-token",
    refresh_token: "test-refresh-token",
    expires_in: 3600,
    token_type: "bearer",
    user: {
      id: "test-user-id",
      email: "test@example.com",
      aud: "authenticated",
      created_at: new Date().toISOString(),
    },
  },
}

/**
 * Mock store helper
 */
export const createMockStore = <T extends object>(initialState: T) => {
  return (set: Partial<T>) => ({
    ...initialState,
    ...set,
  })
}
