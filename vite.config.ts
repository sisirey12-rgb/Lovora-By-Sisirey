import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// Social crawlers need an absolute og:image URL. Set VITE_SITE_URL, or on Vercel it is filled in automatically.
const site = process.env.VITE_SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : '')
export default defineConfig({
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: { output: { manualChunks(id: string) {   // vendor libraries get their own cached files, so app updates don't re-download them
      if (!id.includes('node_modules')) return
      if (/node_modules\/(react|react-dom|scheduler)\//.test(id)) return 'react'
      if (id.includes('framer-motion') || id.includes('motion-dom') || id.includes('motion-utils')) return 'motion'
      if (id.includes('@supabase')) return 'supabase'
      if (id.includes('lucide-react')) return 'icons'
    } } },
  },
  plugins: [react(), { name: 'site-url', transformIndexHtml: html => html.replaceAll('__SITE_URL__', site) }] })
