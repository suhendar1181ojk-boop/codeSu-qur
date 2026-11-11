// Service worker for Kedai Kopi Wahid Su-Qur POS. Caches this small shell so the app opens
// (and says so when there is no connection) even offline. The app itself always comes live from Google.
const CACHE_NAME = 'suqur-pos-v1';
const urlsToCache = [
  '/',
  '/index.html',
  // Tambahkan aset penting lain seperti file CSS atau JS jika diperlukan
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
const CACHE = "kedai-kopi-wahid-su-qur-pos-pwa-1794222102403";
const SHELL = ["./", "index.html", "app-link.js", "manifest.webmanifest", "offline.html", "icon-192.png", "icon-512.png", "icon-maskable-512.png", "apple-touch-icon.png", "favicon.png"];
const HOME = "index.html";
const OFFLINE = "offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

// A server error counts as no answer: if the site that hands out this shell is
// down (a 502 from the proxy in front of it), the copy kept here still opens the
// app, which lives on Google, not on that site.
const live = (request) =>
  fetch(request).then((response) => (response.status >= 500 ? Promise.reject(response) : response));

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (event.request.mode === "navigate") {
    event.respondWith(
      live(event.request).catch(() => caches.match(HOME).then((page) => page || caches.match(OFFLINE))),
    );
    return;
  }
  // Network first, so an edited app-link.js or a new icon shows at once;
  // the cached copy is for when there is no connection. Only good answers are
  // kept, so an error page never replaces a working copy.
  event.respondWith(
    live(event.request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(event.request, copy)).catch(() => {});
        }
        return response;
      })
      .catch(() => caches.match(event.request)),
  );
});
