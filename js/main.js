let restaurants,
  neighborhoods,
  cuisines
var map
var markers = []

let observer = new IntersectionObserver(changes => {
  for (const change of changes) {
    if (change.intersecionRation >= 0.9) {
      DBHelper.fetchRestaurants((error, data) => {
        if (error) {
          console.error(error);
        } else {
          fillRestaurantHTML(data)
        }
      });
    }
  }
},
  {
    threshold: [0.9]
  }
);

observer.observe(document.getElementById('restaurants-list'));

/*
Setting photographs alts*/

const photographAlts = {
	1: "Sereval groups of people having quality time at a restaurant.",
	2: "A lovely margeritta pizza",
	3: "An empty restaurant setting which has heaters",
	4: "A corner shot of the outside of the restaurat.",
	5: "A crowded restaurant and staff serving food from behind the bar.",
	6: "Restaurant with wooden tables, charis, and a US flag as a wall decoration",
	7: "a dog watching from the outside of a crowded burger shop, accompanied by two men.",
	8: "Close up of the dutch restaurant logo beside a flowering tree",
	9: "Black and white picture of people eating at an asian restaurat.",
	10: "Empty restaurant's white chairs, walls and ceilings."
};



/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  fetchNeighborhoods();
  fetchCuisines();
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
}

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
}

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
}

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
}

/**
 * Initialize Google map, called from HTML.
 */
 window.initMap = () => {
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  document.getElementById('map');
  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });

  updateRestaurants();
}

/**
Show map button
*/
callMap =
document.getElementById('mapToggle').addEventListener('click', function(event) {
  if ((document.getElementById('map-container').style.display) === 'block') {
    document.getElementById('map-container').style.display = 'none';
    window.initMap();
  } else {
    document.getElementById('map-container').style.display = 'block';
  }
});
/**
 * Update page and map for current restaurants.
 */
updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  })
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  self.markers.forEach(m => m.setMap(null));
  self.markers = [];
  self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap();
}

/**
 * Create restaurant HTML.
 */
createRestaurantHTML = (restaurant) => {
  const li = document.createElement('li');
  li.tabIndex ='0';

  const image = document.createElement('img');
  image.className = 'restaurant-img';
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  image.srcset = DBHelper.imageResponsiveUrlForRestaurant(restaurant);
  image.alt = photographAlts[restaurant.id];
  li.append(image);

  const name = document.createElement('h2');
  name.innerHTML = restaurant.name;
  li.append(name);

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  li.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  li.append(address);

  const wrapper = document.createElement('div');
  wrapper.setAttribute('class', 'wrapper');
  li.append(wrapper);

  const more = document.createElement('a');
  more.innerHTML = 'View Details';
  more.href = DBHelper.urlForRestaurant(restaurant);
  wrapper.append(more)

  const favorite = document.createElement('i');
  const isFavorite = restaurant.is_favorite == 'true' ? 'fas' : 'far'; // API PUT converts true into 'true'...
  favorite.setAttribute('id', `rest${restaurant.id}`);
  favorite.setAttribute('class', `${isFavorite} fa-heart fa-3x`);
  favorite.setAttribute('tabindex', '0');
  favorite.setAttribute('role', 'button');
  if (restaurant.is_favorite == 'true') {
    favorite.setAttribute('aria-label', `Unmark ${restaurant.name} as favorite`);
  } else {
    favorite.setAttribute('aria-label', `Mark ${restaurant.name} as favorite`);
  }

  favorite.addEventListener('click', () => {
    const restId = favorite.getAttribute('id');
    toggleFav(restId, restaurant.name);
  });
  favorite.addEventListener('keydown', (e) => {
    if (e.keyCode === 13) { // = enter key
      const restId = favorite.getAttribute('id');
      toggleFav(restId, restaurant.name);
    }
  });
  wrapper.append(favorite);

  return li
};

toggleFav = (restId, restName) => {
  const element = document.getElementById(restId);
  const setToggle = element.classList.contains('far');
  element.classList.toggle('far');
  element.classList.toggle('fas');
  if (setToggle) {
    element.setAttribute('aria-label', `Mark ${restName} as favorite`);
  } else {
    element.setAttribute('aria-label', `Unmark ${restName} as favorite`);
  }

  DBHelper.toggleFavorite(restId.slice(4), setToggle).then(() => {
    setTimeout(function () {
      updateRestaurants();
    }, 200);
  });

};

/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url
    });
    self.markers.push(marker);
  });
}


if (navigator.serviceWorker) {
  navigator.serviceWorker.register('sw.js')
    .then(() => console.log('Passed Test'))
};
