// Offline support: app shell and media are cached as they are used. API and share pages always go to the network first.
const V = 'lovora-v1', SHELL = ['/', '/favicon.svg', '/icon-512.png']
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())) })
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== V).map(x => caches.delete(x)))).then(() => self.clients.claim())) })
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url)
  if (r.method !== 'GET' || u.pathname.startsWith('/api/')) return
  const cacheable = u.origin === location.origin ? /\.(js|css|woff2?|png|jpg|webp|svg|mp3|mp4)$/.test(u.pathname) : /supabase\.co\/storage\/v1\/object\/public\//.test(r.url)
  if (r.mode === 'navigate') { e.respondWith(fetch(r).then(res => { const c = res.clone(); caches.open(V).then(x => x.put(r, c)); return res }).catch(() => caches.match(r).then(m => m || caches.match('/')))); return }
  if (!cacheable) return
  e.respondWith(caches.match(r).then(m => m || fetch(r).then(res => { if (res.ok && res.status === 200) { const c = res.clone(); caches.open(V).then(x => x.put(r, c)) } return res })))
})
