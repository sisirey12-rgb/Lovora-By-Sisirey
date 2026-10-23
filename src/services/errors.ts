// Turns raw Supabase / network errors into messages a creator can act on.
type AnyErr = { message?: string; code?: string; status?: number; name?: string } | null | undefined
export function friendlyError(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  const e = (err || {}) as NonNullable<AnyErr>
  const msg = (e.message || (typeof err === 'string' ? err : '') || '').toString()
  const low = msg.toLowerCase()
  if (!msg) return fallback
  if (low.includes('invalid login credentials')) return 'That email and password do not match. Check them and try again.'
  if (low.includes('email not confirmed')) return 'Please confirm your email first — open the link we sent you, then sign in.'
  if (low.includes('user already registered') || low.includes('already been registered')) return 'An account with this email already exists. Try signing in instead.'
  if (low.includes('password should be at least') || low.includes('weak password')) return 'Choose a stronger password (at least 6 characters).'
  if (low.includes('unable to validate email') || low.includes('invalid email')) return 'That email address does not look right.'
  if (low.includes('signups not allowed') || low.includes('signup is disabled')) return 'New sign-ups are disabled for this project. Enable email sign-up in Supabase → Authentication → Providers.'
  if (low.includes('rate limit') || e.status === 429) return 'Too many attempts. Please wait a minute and try again.'
  if (low.includes('failed to fetch') || low.includes('networkerror') || low.includes('network request failed')) return 'Could not reach the server. Check your connection and try again.'
  if (low.includes('jwt') || low.includes('not authenticated') || low.includes('auth session missing')) return 'Your session has expired. Please sign in again.'
  if (e.code === '42P01' || e.code === 'PGRST205' || low.includes('could not find the table') || (low.includes('relation') && low.includes('does not exist'))) return 'The database tables are missing. Run supabase/migrations/0001_experiences.sql in the Supabase SQL editor.'
  if (e.code === '42501' || low.includes('row-level security') || low.includes('permission denied')) return 'You do not have permission to do that. Sign in with the account that created this experience.'
  if (low.includes('payload too large') || e.status === 413) return 'This experience is too large to save. Remove some photos or videos and try again.'
  return msg || fallback
}
