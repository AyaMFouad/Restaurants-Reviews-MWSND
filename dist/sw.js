importScripts('js/idb.js');
importScripts('js/dbhelper.js');


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

self.addEventListener('sync', function (event) {
  if (event.tag == 'myFirstSync') {
    // console.log('sw: sync received');
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

            // console.log('delete review: ' + review.id);
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
