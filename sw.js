/* Liseuse — service worker (cache-first for app shell, network-first for fonts) */

const VERSION = 'v2-2';
const SHELL_CACHE = `liseuse-shell-${VERSION}`;
const FONT_CACHE = `liseuse-fonts-${VERSION}`;

const SHELL_ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/manifest.json',
  '/src/main.js',
  '/src/storage.js',
  '/src/reader.js',
  '/src/library.js',
  '/src/stats.js',
  '/src/annotations.js',
  '/src/focus.js',
  '/icons/icon.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => ![SHELL_CACHE, FONT_CACHE].includes(k))
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Fonts: stale-while-revalidate
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.open(FONT_CACHE).then(async (cache) => {
        const cached = await cache.match(req);
        const fetchPromise = fetch(req).then((res) => {
          if (res.ok) cache.put(req, res.clone());
          return res;
        }).catch(() => cached);
        return cached || fetchPromise;
      })
    );
    return;
  }

  // CDN scripts: cache-first then update
  if (url.hostname.includes('cdnjs.cloudflare.com')) {
    event.respondWith(
      caches.open(SHELL_CACHE).then(async (cache) => {
        const cached = await cache.match(req);
        if (cached) return cached;
        const res = await fetch(req);
        if (res.ok) cache.put(req, res.clone());
        return res;
      })
    );
    return;
  }

  // App shell: cache-first
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(req).then((cached) => cached || fetch(req).then((res) => {
        if (res.ok && SHELL_ASSETS.some((a) => url.pathname === a)) {
          caches.open(SHELL_CACHE).then((cache) => cache.put(req, res.clone()));
        }
        return res;
      }).catch(() => caches.match('/index.html')))
    );
  }
});
