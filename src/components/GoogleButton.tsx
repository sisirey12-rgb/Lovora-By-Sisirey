import { useEffect, useRef, useState } from 'react'
import { supabase } from '../services/supabase/client'

type Cred = { credential: string }
declare global { interface Window { google?: { accounts: { id: { initialize: (o: Record<string, unknown>) => void; renderButton: (el: HTMLElement, o: Record<string, unknown>) => void } } } } }
export const googleClientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined) || ''

/**
 * Google's own sign-in button. It opens a popup that says "Sign in to <your site>" with your app name and logo,
 * instead of the supabase.co address, and then hands the Google token to Supabase.
 */
export default function GoogleButton({ onDone, onError }: { onDone: () => void; onError: (m: string) => void }) {
  const host = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)
  useEffect(() => {
    let dead = false
    const start = () => {
      if (dead || !window.google || !host.current) return
      window.google.accounts.id.initialize({
        client_id: googleClientId, ux_mode: 'popup', use_fedcm_for_prompt: true,
        callback: async (r: Cred) => {
          try {
            if (!supabase) throw new Error('Cloud accounts are not configured yet.')
            const { error } = await supabase.auth.signInWithIdToken({ provider: 'google', token: r.credential })
            if (error) throw error
            onDone()
          } catch (e) { onError(e instanceof Error ? e.message : 'Google sign-in failed. Please try again.') }
        },
      })
      host.current.innerHTML = ''
      window.google.accounts.id.renderButton(host.current, { type: 'standard', theme: 'filled_black', size: 'large', shape: 'pill', text: 'continue_with', logo_alignment: 'left', width: Math.min(340, host.current.clientWidth || 320) })
      setReady(true)
    }
    if (window.google) start()
    else {
      let s = document.querySelector<HTMLScriptElement>('script[data-gsi]')
      if (!s) { s = document.createElement('script'); s.src = 'https://accounts.google.com/gsi/client'; s.async = true; s.dataset.gsi = '1'; document.head.appendChild(s) }
      s.addEventListener('load', start); s.addEventListener('error', () => onError('Could not load Google sign-in. Check your connection.'))
    }
    return () => { dead = true }
  }, [onDone, onError])
  return <div className="gbtn-wrap"><div ref={host} className="gbtn-host" />{!ready && <span className="gbtn-wait">Loading Google…</span>}</div>
}
