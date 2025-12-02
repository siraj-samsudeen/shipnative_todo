/**
 * Auth Store
 *
 * Manages authentication state using Zustand with MMKV persistence.
 * Works with both real Supabase and mock Supabase (when API keys are missing).
 *
 * Type Compatibility:
 * - Uses custom Session/User types that are compatible with both mock and real Supabase
 * - The mock Supabase implements the same interface as the real one
 * - At runtime, both return the same shape of data
 */
import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

import { supabase } from "../services/supabase"
import type { Session, User } from "../types/auth"
import * as storage from "../utils/storage"

interface AuthState {
  session: Session | null
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  hasCompletedOnboarding: boolean

  // Actions
  setSession: (session: Session | null) => void
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  setHasCompletedOnboarding: (completed: boolean) => Promise<void>
  signIn: (email: string, password: string) => Promise<{ error?: Error }>
  signUp: (email: string, password: string) => Promise<{ error?: Error }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error?: Error }>
  initialize: () => Promise<void>
}

const AUTH_STORAGE_KEY = "auth-storage"

type PersistedAuthState = Pick<AuthState, "hasCompletedOnboarding">

// Only persist non-sensitive onboarding progress; keep auth/session data in SecureStore via Supabase
const sanitizePersistedAuthState = (
  state: Partial<AuthState> | null | undefined,
): PersistedAuthState => ({
  hasCompletedOnboarding: !!state?.hasCompletedOnboarding,
})

// Custom storage adapter for Zustand to use MMKV
const mmkvStorage = {
  getItem: async (name: string) => {
    const value = storage.load(name)
    return value ? JSON.stringify(value) : null
  },
  setItem: async (name: string, value: string) => {
    storage.save(name, JSON.parse(value))
  },
  removeItem: async (name: string) => {
    storage.remove(name)
  },
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      session: null,
      user: null,
      loading: true,
      isAuthenticated: false,
      hasCompletedOnboarding: false,

      setSession: (session) => {
        set({
          session,
          user: session?.user ?? null,
          isAuthenticated: !!session,
        })
      },

      setUser: (user) => {
        set({ user })
      },

      setLoading: (loading) => {
        set({ loading })
      },

      setHasCompletedOnboarding: async (completed) => {
        set({ hasCompletedOnboarding: completed })
        const { user } = get()
        if (user) {
          try {
            const { error } = await supabase
              .from("profiles")
              .upsert({ id: user.id, has_completed_onboarding: completed })

            if (error) {
              console.error("Failed to sync onboarding status:", error)
            }
          } catch (error) {
            console.error("Failed to sync onboarding status:", error)
          }
        }
      },

      signIn: async (email, password) => {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          })

          if (error) {
            return { error }
          }

          set({
            session: data.session,
            user: data.user,
            isAuthenticated: true,
            loading: false,
          })

          return {}
        } catch (error) {
          return { error: error as Error }
        }
      },

      signUp: async (email, password) => {
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
          })

          if (error) {
            return { error }
          }

          set({
            session: data.session,
            user: data.user,
            isAuthenticated: !!data.session,
            loading: false,
          })

          return {}
        } catch (error) {
          return { error: error as Error }
        }
      },

      signOut: async () => {
        await supabase.auth.signOut()
        set({
          session: null,
          user: null,
          isAuthenticated: false,
        })
      },

      resetPassword: async (email) => {
        try {
          const { error } = await supabase.auth.resetPasswordForEmail(email)

          if (error) {
            return { error }
          }

          return {}
        } catch (error) {
          return { error: error as Error }
        }
      },

      initialize: async () => {
        try {
          set({ loading: true })

          // Get the current local onboarding state (persisted via MMKV)
          const localOnboardingCompleted = get().hasCompletedOnboarding

          // Get initial session
          const {
            data: { session },
          } = await supabase.auth.getSession()

          let hasCompletedOnboarding = localOnboardingCompleted
          if (session?.user) {
            // Fetch profile to check onboarding status
            const { data: profile } = await supabase
              .from("profiles")
              .select("has_completed_onboarding")
              .eq("id", session.user.id)
              .single()

            if (profile?.has_completed_onboarding) {
              // Database says completed - use that
              hasCompletedOnboarding = true
            } else if (localOnboardingCompleted && session?.user) {
              // Local says completed but database doesn't - sync to database
              await supabase
                .from("profiles")
                .upsert({ id: session.user.id, has_completed_onboarding: true })
              hasCompletedOnboarding = true
            }
          }

          set({
            session,
            user: session?.user ?? null,
            isAuthenticated: !!session,
            hasCompletedOnboarding,
            loading: false,
          })

          // Listen for auth changes
          supabase.auth.onAuthStateChange(async (_event, session) => {
            // Preserve local onboarding state - don't reset it
            const currentLocalOnboarding = get().hasCompletedOnboarding
            let hasCompletedOnboarding = currentLocalOnboarding

            if (session?.user) {
              const { data: profile } = await supabase
                .from("profiles")
                .select("has_completed_onboarding")
                .eq("id", session.user.id)
                .single()

              if (profile?.has_completed_onboarding) {
                // Database says completed - use that
                hasCompletedOnboarding = true
              } else if (currentLocalOnboarding) {
                // Local says completed but database doesn't - sync to database
                await supabase
                  .from("profiles")
                  .upsert({ id: session.user.id, has_completed_onboarding: true })
                hasCompletedOnboarding = true
              }
            }

            set({
              session,
              user: session?.user ?? null,
              isAuthenticated: !!session,
              hasCompletedOnboarding,
              loading: false,
            })
          })
        } catch (error) {
          console.error("Auth initialization failed:", error)
          set({ loading: false })
        }
      },
    }),
    {
      name: AUTH_STORAGE_KEY,
      storage: createJSONStorage(() => mmkvStorage),
      version: 1,
      // Strip sensitive auth/session data from persisted storage
      partialize: (state) => sanitizePersistedAuthState(state) as unknown as AuthState,
      migrate: (persistedState) => {
        const sanitizedState = sanitizePersistedAuthState(persistedState as Partial<AuthState>)
        try {
          // Overwrite any legacy persisted tokens with the sanitized payload
          storage.save(AUTH_STORAGE_KEY, sanitizedState)
        } catch {
          // Ignore storage write errors during migration
        }
        return sanitizedState as AuthState
      },
    },
  ),
)
