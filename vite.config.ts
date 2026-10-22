import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// Social crawlers need an absolute og:image URL. Set VITE_SITE_URL, or on Vercel it is filled in automatically.
const site = process.env.VITE_SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : '')
export default defineConfig({ plugins: [react(), { name: 'site-url', transformIndexHtml: html => html.replaceAll('__SITE_URL__', site) }] })
