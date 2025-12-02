/**
 * useAuth Hook
 *
 * React hook for authentication with Supabase.
 * Provides convenient access to auth state and methods.
 */

import { useState, useEffect, useCallback } from "react"

import { supabase } from "../services/supabase"
import type { User, Session, SignUpCredentials, SignInCredentials } from "../types/auth"

export interface UseAuthReturn {
  // State
  user: User | null
  session: Session | null
  loading: boolean

  // Methods
  signUp: (credentials: SignUpCredentials) => Promise<{ error: Error | null }>
  signIn: (credentials: SignInCredentials) => Promise<{ error: Error | null }>
  signInWithGoogle: () => Promise<{ error: Error | null }>
  signInWithApple: () => Promise<{ error: Error | null }>
  signOut: () => Promise<{ error: Error | null }>
  resetPassword: (email: string) => Promise<{ error: Error | null }>
  updateUser: (attributes: {
    email?: string
    password?: string
    data?: Record<string, any>
  }) => Promise<{ error: Error | null }>

  // Helpers
  isAuthenticated: boolean
}

/**
 * Hook for authentication
 *
 * @example
 * ```tsx
 * function LoginScreen() {
 *   const { signIn, signInWithGoogle, signInWithApple, loading } = useAuth()
 *
 *   const handleLogin = async () => {
 *     const { error } = await signIn({
 *       email: 'user@example.com',
 *       password: 'password',
 *     })
 *
 *     if (error) {
 *       alert(error.message)
 *     }
 *   }
 *
 *   const handleGoogleLogin = async () => {
 *     const { error } = await signInWithGoogle()
 *
 *     if (error) {
 *       alert(error.message)
 *     }
 *   }
 *
 *   const handleAppleLogin = async () => {
 *     const { error } = await signInWithApple()
 *
 *     if (error) {
 *       alert(error.message)
 *     }
 *   }
 *
 *   return (
 *     <View>
 *       <Button onPress={handleLogin} disabled={loading} />
 *       <Button onPress={handleGoogleLogin} disabled={loading} />
 *       <Button onPress={handleAppleLogin} disabled={loading} />
 *     </View>
 *   )
 * }
 * ```
 */
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  // Initialize auth state
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = useCallback(async (credentials: SignUpCredentials) => {
    setLoading(true)
    const { error } = await supabase.auth.signUp(credentials)
    setLoading(false)
    return { error }
  }, [])

  const signIn = useCallback(async (credentials: SignInCredentials) => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword(credentials)
    setLoading(false)
    return { error }
  }, [])

  const signOut = useCallback(async () => {
    setLoading(true)
    const { error } = await supabase.auth.signOut()
    setLoading(false)
    return { error }
  }, [])

  const resetPassword = useCallback(async (email: string) => {
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    setLoading(false)
    return { error }
  }, [])

  const updateUser = useCallback(
    async (attributes: { email?: string; password?: string; data?: Record<string, any> }) => {
      setLoading(true)
      const { error } = await (supabase.auth as any).updateUser(attributes)
      setLoading(false)
      return { error }
    },
    [],
  )

  const signInWithGoogle = useCallback(async () => {
    setLoading(true)
    try {
      const { error } = await (supabase.auth as any).signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: undefined, // Will use default redirect
        },
      })
      return { error }
    } finally {
      setLoading(false)
    }
  }, [])

  const signInWithApple = useCallback(async () => {
    setLoading(true)
    try {
      const { error } = await (supabase.auth as any).signInWithOAuth({
        provider: "apple",
        options: {
          redirectTo: undefined, // Will use default redirect
        },
      })
      return { error }
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithApple,
    signOut,
    resetPassword,
    updateUser,
    isAuthenticated: !!session,
  }
}
