import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { AuthProvider } from './services/auth'
import './styles.css'
import './upgrade.css'
import './lux.css'
import './meow.css'
import './pro.css'
import './fx.css'
import './calm.css'
import './vibe.css'
import './occ.css'
import './land.css'
import './round3.css'
import './newscenes.css'
import './creating.css'
import './scenefx.css'
import './fresh.css'
import './landing2.css'
import './theme-global.css'

createRoot(document.getElementById('root')!).render(
  <React.StrictMode><AuthProvider><App /></AuthProvider></React.StrictMode>
)

if ('serviceWorker' in navigator && import.meta.env.PROD) window.addEventListener('load', () => { navigator.serviceWorker.register('/sw.js').catch(() => {}) })
try { if (localStorage.getItem('lovora-bigtext') === 'on') document.documentElement.classList.add('big-text') } catch { /* ignore */ }
