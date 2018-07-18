var staticCacheName = 'resapp-v6';
var contentImgsCache = 'resapp-content-imgs';
var allCaches = [
  staticCacheName,
  contentImgsCache
];
var urlsToCache = [
    'index.html',
    'restaurant.html',
    'manifest.json',
    'css/styles.css',
    'css/Responsive.css',
    'js/all_index.js',
    'js/idb.js',
    'js/all_restaurant.js'
];

self.addEventListener('install', function(event){
  event.waitUntil(
    caches.open(staticCacheName).then(function(cache){
      return cache.addAll(urlsToCache);
    })
  );
});



self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    if (url.pathname === '/') {
        event.respondWith(
            caches.match('index.html')
            .then(response => response || fetch(event.request))
        );
        return;
    };

    if (url.pathname.startsWith('/restaurant.html')) {
        event.respondWith(
            caches.match('restaurant.html')
            .then(response => response || fetch(event.request))
        );
        return;
    };

    if (url.pathname.startsWith('/img/') || (url.pathname.startsWith('/img_responsive/'))) {
        event.respondWith(servePhoto(event.request));
        return;
    };

    event.respondWith(
        caches.match(event.request)
        .then(response => response || fetch(event.request))
    );
});

function servePhoto(request) {
    return caches.open(contentImgsCache).then(function(cache) {
        return cache.match(request).then(function(response) {
          if (response) return response;

          return fetch(request).then(function(networkResponse) {
            cache.add(request);
            return fetch(request);
          })
    });
})
}
self.addEventListener('fetch', function(event){
  event.respondWith(
    caches.match(event.request).then(function(response){
      if(response) return response;
      return fetch(event.request);
    })
  );
});
