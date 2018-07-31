let restaurant;
var map;

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
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
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
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}

/**
 * favorite restaurant business
 */
toggleFavorite = (restId) => {
  const element = document.getElementById('isFavorite');
  const setToggle = element.classList.contains('far');
  element.classList.toggle('far');
  element.classList.toggle('fas');
  DBHelper.toggleFavorite(restId, setToggle);
};

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;
	const favorite = document.getElementById('isFavorite');
	const isFavorite = restaurant.is_favorite == 'true' ? 'fas' : 'far';
	favorite.classList.remove('far');
	favorite.classList.add(`${isFavorite}`);
	if (restaurant.is_favorite == 'true') {
	favorite.setAttribute('aria-label', `Unmark ${restaurant.name} as favorite`);
	} else {
	favorite.setAttribute('aria-label', `Mark ${restaurant.name} as favorite`);
	}

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img'
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
	image.srcset = DBHelper.imageResponsiveUrlForRestaurant(restaurant);
  image.alt = photographAlts[restaurant.id];

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fillReviewsHTML();
}


/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
	hours.innerHTML = '';
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (restaurantId = self.restaurant.id) => {
  DBHelper.fetchReviews(restaurantId, (error, reviews) => {
    if(error) {
      console.log(error);
    } else {
      const container = document.getElementById('reviews-container');
      container.innerHTML = '<ul id="reviews-list"></ul>';
      const title = document.createElement('h2');
      title.innerHTML = 'Reviews';
      title.tabIndex = '0';
      container.appendChild(title);

      if (!reviews) {
        const noReviews = document.createElement('p');
        noReviews.innerHTML = 'No reviews yet!';
        container.appendChild(noReviews);
        return;
      } else {
      const ul = document.getElementById('reviews-list');
      reviews.forEach(review => {
        ul.appendChild(createReviewHTML(review));
      });
      container.appendChild(ul);
      offlineReviewsHTML();
    }
    }
  });
};

window.addEventListener('online', function (e) {
  navigator.serviceWorker.ready.then(function (regsw) {
    regsw.sync.register('reqReviewSync');
  });
}, false);

//storing reviews posted offline

offlineReviewsHTML = (restaurantId = self.restaurant.id) => {
  DBHelper.fetchOfflineReviews(restaurantId, (error, reviews) => {

    if (error) {
      console.log(error);
    } else {
      const ul = document.getElementById('reviews-list');
      const tmps = document.getElementsByClassName('tmp');
      if (tmps.length === 0) {
        reviews.forEach(review => {
          ul.appendChild(createTmpReviewHTML(review));
        });
      }
    }
  });
};


/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  li.tabIndex = '0';

  const date = document.createElement('h5');
  const my_date = new Date(review.createdAt);
  date.innerHTML = my_date.toDateString();
  li.appendChild(date);

  const name = document.createElement('h1');
  name.innerHTML = review.name;
  li.appendChild(name);

  const rating = document.createElement('i');
  rating.innerHTML = `Rating: ${review.rating}`;
	rating.style.backgroundColor = review.rating === 5 ? 'green' :
                                 review.rating > 2 ? 'orange' : 'red';
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  const label = `${review.name} said ${review.comments} and rated the restaurant ${review.rating} out of 5`;
  li.setAttribute('aria-label', label);

  return li;
}

/**
 * Create TMP review HTML and add it to the webpage.
 */
createTmpReviewHTML = (review) => {
  const li = document.createElement('li');
  li.setAttribute('class', 'tmp');
  const div = document.createElement('div');
  div.setAttribute('class', 'review-header');
  li.appendChild(div);

  const name = document.createElement('h1');
  name.setAttribute('class', 'reviewName');
  name.innerHTML = review.name;
  div.appendChild(name);

  const date = document.createElement('h5');
  date.setAttribute('class', 'reviewDate');
  const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  date.innerHTML = (new Date(review.createdAt)).toLocaleDateString('en-US', dateOptions);
  div.appendChild(date);

  const rating = document.createElement('i');
  rating.innerHTML = `Rating: ${review.rating}`;
  rating.setAttribute('class', 'reviewRating');
  rating.style.backgroundColor = review.rating === 5 ? 'green' :
                                 review.rating > 2 ? 'orange' : 'red';
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  comments.setAttribute('class', 'reviewComment');
  li.appendChild(comments);

  return li;
};

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
	const breadcrumbElements = breadcrumb.querySelectorAll('li');
	for (element of breadcrumbElements) {
	element.removeAttribute('aria-current');
}
	const li = document.createElement('li');
	li.setAttribute('aria-current', 'page');
	if (breadcrumb.childElementCount === 2) return;
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

//eventlisteners for favorite toggle

const fav = document.getElementById('isFavorite');
fav.addEventListener('click', () => {
  toggleFavorite(self.restaurant.id);
});
fav.addEventListener('keydown', (e) => {
  if (e.keyCode === 13) { // = enter key
    toggleFavorite(self.restaurant.id);
  }
});


if (navigator.serviceWorker) {
  navigator.serviceWorker.register('sw.js')
    .then(() => console.log('Passed Test'))
};
