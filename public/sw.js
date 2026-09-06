// Electrician Toolbox service worker.
//
// Strategy: cache-first for same-origin static assets, so the calculators
// keep working offline once the app has been opened once. Never caches or
// fetches cross-origin/third-party resources — there are none in this app.
// Bump CACHE_NAME on any deploy that changes cached asset contents.

const CACHE_NAME = "electrician-toolbox-v1";
const CORE_ASSETS = ["/", "/manifest.webmanifest", "/icons/favicon.svg", "/icons/icon-192.png", "/icons/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)).catch(() => {
      // Precaching is best-effort; the app still works online if this fails.
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only handle same-origin GET requests. Never intercept /health so
  // status checks always reach the network.
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin || url.pathname === "/health") {
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          // Offline and not cached (e.g. a route visited for the first time
          // while offline) — fall back to the shell so the SPA can still
          // render its own "offline" state instead of a browser error page.
          return caches.match("/");
        });
    })
  );
});
