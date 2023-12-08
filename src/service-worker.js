// Service Worker Version
const version = 'v1';

// Files to be cached
const cacheFiles = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/public/img/icons/icon-48x48.png',
  '/public/img/icons/icon-128x128.png',
  '/public/img/icons/icon-512x512.png'
];

// Event: Install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(version)
      .then((cache) => {
        console.log('Cache opened');
        return cache.addAll(cacheFiles);
      })
  );
});

// Event: Activate
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.filter((cacheName) => {
            return cacheName !== version;
          }).map((cacheName) => {
            return caches.delete(cacheName);
          })
        );
      })
  );
});

// Event: Fetch
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});
// Event: Push
self.addEventListener('push', (event) => {
  let payload = 'New notification';

  if (event.data) {
    payload = event.data.text();
  }

  const title = 'Speiseplan Notification';
  const options = {
    body: payload,
    icon: '/public/img/icons/icon-96x96.png'
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});
