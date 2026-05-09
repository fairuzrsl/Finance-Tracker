/**
 * Service Worker - Cache static assets and provide offline fallback
 */
const CACHE_NAME = 'finance-tracker-v1';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/css/reset.css',
    '/css/variables.css',
    '/css/layout.css',
    '/css/components.css',
    '/css/responsive.css',
    '/js/main.js',
    '/js/config.js',
    '/js/supabaseClient.js',
    '/js/auth.js',
    '/js/api.js',
    '/js/state.js',
    '/js/calculations.js',
    '/js/ui.js',
    '/js/transactions.js',
    '/js/categories.js',
    '/js/settings.js',
    '/js/pwa.js',
    '/manifest.json'
];

// Install: cache static assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(STATIC_ASSETS))
            .then(() => self.skipWaiting())
    );
});

// Activate: clean old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            ))
            .then(() => self.clients.claim())
    );
});

// Fetch: network-first for API, cache-first for static assets
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // Network-first for Supabase API calls
    if (url.hostname.includes('supabase')) {
        event.respondWith(
            fetch(request).catch(() => caches.match(request))
        );
        return;
    }

    // Cache-first for static assets
    event.respondWith(
        caches.match(request)
            .then(cached => {
                if (cached) return cached;
                return fetch(request).then(response => {
                    if (response.ok && url.origin === self.location.origin) {
                        const clone = response.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => cache.put(request, clone));
                    }
                    return response;
                });
            })
            .catch(() => {
                if (request.headers.get('accept')?.includes('text/html')) {
                    return caches.match('/index.html');
                }
            })
    );
});
