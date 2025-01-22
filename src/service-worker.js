// service-worker.js


// Install event - caching resources
self.addEventListener('install', event => {
    console.log('[Service Worker] Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            
            console.log('[Service Worker] Caching files');
            return cache.addAll(CACHE_FILES);
        })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('[Service Worker] Activating...');
    event.waitUntil(
        caches.keys().then(cacheNames =>
            Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log('[Service Worker] Deleting old cache:', cache);
                        return caches.delete(cache);
                    }
                })
            )
        )
    );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', event => {
    console.log('[Service Worker] Fetching:', event.request.url);
    fetch(event.request).then(response => {
        console.log('response', response);
    }).catch(err => {
        console.log('fetch error', err);
        console.error('Request Headers:', [...event.request.headers.entries()]);
    });
});
