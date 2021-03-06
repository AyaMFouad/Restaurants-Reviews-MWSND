/* jshint esversion: 6 */
importScripts('js/idb.js');
importScripts('js/dbhelper.js');

var staticCacheName = 'resapp-static-v2';
var contentImgsCache = 'resapp-content-imgs-v2';
var allCaches = [
  staticCacheName,
  contentImgsCache
];
var urlsToCache = [
    'index.html',
    'restaurant.html',
    'manifest.json',
    'css/styles_main.css',
    'css/styles_restaurant.css',
    'css/Responsive.css',
    'css/mobile.css',
    'js/all_index.js',
    'js/idb.js',
    'js/dbhelper.js',
    'js/all_restaurant.js',
    'https://maps.googleapis.com/maps/api/staticmap?center=40.722216,-73.987501&zomm=12&size=1920x400&key=AIzaSyA1GRyFuY1EKhu0mzXJsGtRCgzkV3Dx_Jo',
    'https://use.fontawesome.com/releases/v5.1.0/css/all.css',
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

self.addEventListener('sync', function (event) {
  if (event.tag == 'reqReviewSync') {
    event.waitUntil(syncReview());
  }
});

// Handling the syncing reviews
const syncReview = () => {
  idb.open('restaurants-db', 1, function (upgradeDb) {
    var storeReviews = upgradeDb.createObjectStore('sync-reviews', {
      keyPath: 'id',
      autoIncrement: true,
    });
  }).then(function (db) {
    if (!db) {
      return;
    } else {
      let storeReviews = db.transaction('sync-reviews', 'readwrite')
                           .objectStore('sync-reviews');
      return storeReviews.getAll();
    }
  }).then(function (reviews) {

    let objRev = {};

    Promise.all(reviews.map(function (review) {
      const data = {
        restaurant_id: review.restaurant_id,
        name: review.name,
        rating: review.rating,
        comments: review.comments,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
      };
      return fetch('http://localhost:1337/reviews/', {
        body: JSON.stringify(data),
        method: 'POST',
      })
      .then((response) => response.json()).then((dataJSON) => {
        objRev = dataJSON;

        return idb.open('restaurants-db', 1, function (upgradeDb) {
          var storeReviews = upgradeDb.createObjectStore('sync-reviews', {
            keyPath: 'id',
            autoIncrement: true,
          });
        }).then(function (db) {
          if (!db) {
            return;
          } else {
            let tx = db.transaction('sync-reviews', 'readwrite');
            let storeReviews = tx.objectStore('sync-reviews');

            storeReviews.delete(review.id);
            return tx.complete;
          }
        }).catch(function (err) {
          console.log('Delete review failed: ' + err);
        });

      }).then(() => {
        return idb.open('restaurants-db', 1, function (upgradeDb) {
          var storeReviews = upgradeDb.createObjectStore('reviews', {
            keyPath: 'id',
            autoIncrement: true,
          });
        }).then(function (db) {
          if (!db) {
            return;
          } else {
            let tx = db.transaction('reviews', 'readwrite');
            let storeReviews = tx.objectStore('reviews');

            storeReviews.put(objRev);

            return tx.complete;
          }
        }).catch((err) => {
          console.log(err);
        });
      }).catch((resp) => {
        console.log('review could not be fetched');
      });

    }));

  }).catch(function (err) { console.error(err); });
};
