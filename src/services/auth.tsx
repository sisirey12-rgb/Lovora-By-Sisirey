import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase, supabaseConfigured } from './supabase/client'
import { friendlyError } from './errors'

interface AuthState {
  user: User | null
  loading: boolean
  configured: boolean
  signIn: (email: string, password: string) => Promise<void>
  /** Passwordless: emails a one-tap sign-in link (creates the account on first use). */
  signInWithLink: (email: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<{ needsConfirmation: boolean }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  /** True after the user opens a password-reset email link; they must choose a new password. */
  recovering: boolean
  updatePassword: (password: string) => Promise<void>
  dismissRecovery: () => void
}
const Ctx = createContext<AuthState | null>(null)
const need = () => { if (!supabase) throw new Error('Cloud accounts are not configured yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then redeploy.'); return supabase }
const clean = (email: string) => email.trim().toLowerCase()

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(Boolean(supabase))
  const [recovering, setRecovering] = useState(false)
  useEffect(() => {
    if (!supabase) return
    let alive = true
    supabase.auth.getSession().then(({ data }) => { if (alive) { setSession(data.session); setLoading(false) } }).catch(() => { if (alive) setLoading(false) })
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => { setSession(s); setLoading(false); if (event === 'PASSWORD_RECOVERY') setRecovering(true) })
    return () => { alive = false; sub.subscription.unsubscribe() }
  }, [])
  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await need().auth.signInWithPassword({ email: clean(email), password })
    if (error) throw new Error(friendlyError(error))
  }, [])
  const signInWithLink = useCallback(async (email: string) => {
    const { error } = await need().auth.signInWithOtp({ email: clean(email), options: { emailRedirectTo: window.location.origin, shouldCreateUser: true } })
    if (error) throw new Error(friendlyError(error))
  }, [])
  const signUp = useCallback(async (email: string, password: string) => {
    const { data, error } = await need().auth.signUp({ email: clean(email), password, options: { emailRedirectTo: window.location.origin } })
    if (error) throw new Error(friendlyError(error))
    // Supabase hides "already registered" for confirmed emails by returning a user with no identities.
    if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) throw new Error('An account with this email already exists. Try signing in instead.')
    return { needsConfirmation: !data.session }
  }, [])
  const signOut = useCallback(async () => { const { error } = await need().auth.signOut(); if (error) throw new Error(friendlyError(error)) }, [])
  const resetPassword = useCallback(async (email: string) => {
    const { error } = await need().auth.resetPasswordForEmail(clean(email), { redirectTo: window.location.origin })
    if (error) throw new Error(friendlyError(error))
  }, [])
  const updatePassword = useCallback(async (password: string) => {
    const { error } = await need().auth.updateUser({ password })
    if (error) throw new Error(friendlyError(error))
    setRecovering(false)
  }, [])
  const dismissRecovery = useCallback(() => setRecovering(false), [])
  const value = useMemo<AuthState>(() => ({ user: session?.user ?? null, loading, configured: supabaseConfigured, signIn, signInWithLink, signUp, signOut, resetPassword, recovering, updatePassword, dismissRecovery }), [session, loading, signIn, signInWithLink, signUp, signOut, resetPassword, recovering, updatePassword, dismissRecovery])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
export function useAuth(): AuthState {
  const v = useContext(Ctx)
  if (!v) throw new Error('useAuth must be used inside <AuthProvider>')
  return v
}
