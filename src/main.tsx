import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { AuthProvider } from './services/auth'
import './styles.css'
import './upgrade.css'
import './lux.css'
import './meow.css'
import './pro.css'

createRoot(document.getElementById('root')!).render(
  <React.StrictMode><AuthProvider><App /></AuthProvider></React.StrictMode>
)
