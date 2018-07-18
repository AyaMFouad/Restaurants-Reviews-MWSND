/**
 * Common database helper functions.
 */
class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337;
    return `http://localhost:${port}`;
  }

  /**
   * Fetch all restaurants (using APIs)
   */
  static fetchRestaurants(callback) {

    DBHelper.fetchRestaurantsFromIDB((error, restaurants) => {
      if(error) {
        DBHelper.fetchRestaurantsFromNetwork((error, restaurants) => {
          if(restaurants) {
            DBHelper.saveRestaurantstoIDB(restaurants);

            callback(null, restaurants);
          }
          if(error) {
            callback(error, null);
          }
        });
      }
      if(restaurants) {
        callback(null,restaurants);
      }
    });
  }

  /** IBD APIS */

  /**
 * Fetch Reviews
 */
static fetchReviews(callback) {
  DBHelper.fetchReviewsFromIDB((error, reviews) => {
    if(error) {
      DBHelper.fetchReviewsFromNetwork((error, reviewsFormNetwork) => {
        if(reviewsFormNetwork && reviewsFormNetwork.length) {
          DBHelper.saveReviewsIntoIDB(reviewsFormNetwork);

          callback(null, reviewsFormNetwork);
        }

        if(error) {
          callback(error, null);
        }
      });
    }
    if(reviews) {
      callback(null, reviews);
    }

  })
}

/**
 * Fetch reviews from Indexed DB
 */
static fetchReviewsFromIDB(callback) {
  // const dbPromise = DBHelper.openIDB();
  return DBHelper.openIDB().then((db) => {
    if(!db) return;

    const tx = db.transaction('reviews');
    const store =  tx.objectStore('reviews');

    return store.getAll().then((reviews) => {
      if(reviews.length) {
        callback(null, reviews);
      } else {
        const error = 'There is no reviews in IDB';
        callback(error, null);
      }
    });
  });
}

/**
* Save reviews into the indexed DB
*/
static saveReviewsIntoIDB(reviews) {

  return DBHelper.openIDB().then((db) => {
    if(!db) return;
    const tx = db.transaction('reviews', 'readwrite')
    const store = tx.objectStore('reviews');
    reviews.forEach((review) => {
      store.put(review);
    });
    return tx.complete;
  });
}

/**
* Save Sync reviews into the indexed DB
*/
static saveSyncReviewsIntoIDB(review) {
  return DBHelper.openIDB().then((db) => {
    if(!db) return;
    const tx = db.transaction('sync-reviews', 'readwrite')
    const store = tx.objectStore('sync-reviews');
    store.put(review);
    return tx.complete;
  });
}

/**
 * get all syncing reviews
 */
static getSyncReviewsFromIDB() {
  return DBHelper.openIDB().then((db) => {
      if(!db) return;

      const tx = db.transaction('sync-reviews');
      const store =  tx.objectStore('sync-reviews');

      return store.getAll();
  });
}

/**
 * Fetch reviews from network
 */
static fetchReviewsFromNetwork(callback) {

  const url = "http://localhost:1337/reviews";
  return fetch(url).then((response) => {
    return response.json();
  }).then((reviews) => {
    if(reviews) {
      callback(null, reviews);
    }
  }).catch(e => {
    const error = (`Request failed. Returned status of 404`);
    callback(error, null);
  });
}

  /* Add restaurants to indexedDB */
  static saveRestaurantstoIDB(restaurants){
  return DBHelper.openDatabase().then(function (db) {
    if (!db) return;
      let store = db.transaction('restaurants', 'readwrite')
                    .objectStore('restaurants');
      restaurants.forEach(function (restaurant) {
        store.put(restaurant);
      });
  });
}

/*fetch restaurants from network*/
static fetchRestaurantsFromNetwork(callback) {
  return     fetch(DBHelper.DATABASE_URL)
      .then(
        function (response) {
          if (response.status !== 200) {
            console.log('Fetch Issue - Status Code: ' + response.status);
            return;
          }
          response.json().then(function (restaurants) {
            callback(null, restaurants);
          });
        }
      )
      .catch(function (err) {
        console.log('Fetch Error: ', err);
      });
}

/**fetch restaurants from idb*/
static fetchRestaurantsFromIDB(callback) {
  return  DBHelper.openDatabase().then(function (db) {
        if (!db) return;
          return db.transaction('restaurants', 'readwrite')
                   .objectStore('restaurants')
                   .getAll();
      }).then(function (restaurants) {
        if (restaurants.length === 0) return;
        callback(null, restaurants);
      });
}


   // IDB creation


  static openDatabase () {

    if (!navigator.serviceWorker) {
      //console.log(`Service Workers is not supported by browsers`);
      return Promise.resolve();
    }

    return idb.open('restaurants-db', 2, (upgradeDB) => {
      switch (upgradeDB.oldVersion) {
        case 0:
          upgradeDB.createObjectStore('restaurants', {
            keyPath: 'id'
          });
        case 1:
          upgradeDB.createObjectStore('reviews', {
            keyPath: 'id'
          });
        case 2:
          upgradeDB.createObjectStore('sync-reviews', {
            keyPath: 'id'
          });
        case 3:
          upgradeDB.createObjectStore('sync-favorites', {
            keyPath: 'id'
          });
        }
    });
  }


  /**create review*/

  static createPostReview (review) {
  const url = 'http://localhost:1337/reviews/';
  return fetch(url, {
    method: 'post',
    body: JSON.stringify(review),
  }).then(response => {
    return response.json();
  }).then((data) => {
    // console.log(data);
    DBHelper.saveReviewsIntoIDB([data]);
  }).catch((e) => {
    console.log('something went wrong', e);
  })
}

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants;
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }

        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }

        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood);

        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i);
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type);

        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i);
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return (`/img/${restaurant.photograph}.webp`);
  }

  /**
 * Restaurant responsive images source set.
 */
static imageResponsiveUrlForRestaurant(restaurant) {
    const scale1x = '320';
    const scale1_5x = '480';
    const scale2x = '640';
    const scale3x = '800';

    return (
        `/img_responsive/${restaurant.id}-${scale1x}.webp ${scale1x}w,
        /img_responsive/${restaurant.id}-${scale1_5x}.webp ${scale1_5x}w,
        /img_responsive/${restaurant.id}-${scale2x}.webp ${scale2x}w,
        /img_responsive/${restaurant.id}-${scale3x}.webp ${scale3x}w`);
}

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP,
    });
    return marker;
  }

}
