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
    return `http://localhost:${port}/restaurants`;
  }


   // IDB creation


  static openDatabase () {

    if (!navigator.serviceWorker) {
      //console.log(`Service Workers is not supported by browsers`);
      return Promise.resolve();
    }

    return idb.open('restaurant-db', 1, function (upgradeDb) {
      var store = upgradeDb.createObjectStore('restaurants', {
        keyPath: 'id',
      });
    });
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {

    // get restaurants from indexedDB
    DBHelper.openDatabase().then(function (db) {
      if (!db) {
        return;
      }  else {
        return db.transaction('restaurants', 'readwrite')
                 .objectStore('restaurants')
                 .getAll();
      }
    }).then(function (restaurants) {
      if (restaurants.length === 0) return;
      callback(null, restaurants);
    });

    fetch(DBHelper.DATABASE_URL)
    .then(
      function (response) {
        if (response.status !== 200) {
          console.log('Fetch Issue - Status Code: ' + response.status);
          return;
        }

        response.json().then(function (restaurants) {

          /* Add restaurants to indexedDB */
          DBHelper.openDatabase().then(function (db) {
            if (!db) {
              return;
            } else {
              let store = db.transaction('restaurants', 'readwrite')
                            .objectStore('restaurants');
              restaurants.forEach(function (restaurant) {
                store.put(restaurant);
              });
            }
          });

          callback(null, restaurants);
        });
      }
    )
    .catch(function (err) {
      console.log('Fetch Error: ', err);
    });
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
