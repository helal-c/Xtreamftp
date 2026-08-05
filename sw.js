const CACHE_NAME = "xtream-tv-cache-v1";
const urlsToCache = [
  "./index.html",
  "./data.json",
  "./manifest.json",
  "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&family=Noto+Sans+Bengali:wght@500;700&display=swap"
];

// Install Phase
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Fetch Phase (Network First, fallback to cache)
self.addEventListener("fetch", event => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});