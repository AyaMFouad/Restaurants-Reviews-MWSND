/*credtit of the original code of this from goes to
* user 'gregh' from codepen
*(https://codepen.io/gregh/pen/rjbmXb)
* I just tweaked it to suit this application's needs*/

var vue = new Vue({
  el: '#app',
  data: {
    formOpen: false,
    review: {
      name: '',
      rating: '',
      comments:''
    }
  },
  methods: {
    resetForm: function () {
      this.review = {
        name: '',
        rating: '',
        comments:''
      }
    },
    cancel: function() {
      this.formOpen = false;
      this.resetForm();
    }
  }
})

/**
 * Hanlding form submition
 */
 addReview = () => {
   const review = {
    restaurant_id: self.restaurant.id,
    name: document.getElementById('name').value,
    createdAt: new Date().getTime(),
    updatedAt: new Date().getTime(),
    rating: +document.getElementById('rating').value,
    comments: document.getElementById('comments').value,
  };
  const ul = document.getElementById('reviews-list');
  ul.insertBefore(createReviewHTML(review), ul.childNodes[0]);
  if (!navigator.onLine) {
    alert('You are currently offline. Your review will be posted once you are online again. Thank you for reviewing!');
  }
  DBHelper.postReview(review).then(function () {
  navigator.serviceWorker.ready.then(function (regsw) {
    regsw.sync.register('reqReviewSync');
    location.reload();
  });
}).then(function () {
  fillReviewsHTML();
}).then(function () {
  offlineReviewsHTML();
}).catch(function (err) {
  console.error(err);
});
};

document.getElementById('review-form').addEventListener('submit', function (event) {
  event.preventDefault();
  addReview();
  if (event.keyCode === 13) {
    document.getElementById('submit').click();
    document.getElementById("name").tabIndex = '-1';
    document.getElementById("rating").tabIndex = '-1';
    document.getElementById("comments").tabIndex = '-1';
    document.getElementById("submit").tabIndex = '-1';
    document.getElementById("cancel").tabIndex = '-1';
  }

});


document.getElementById("add-review").addEventListener("keyup", function(event) {
  event.preventDefault();
  if (event.keyCode === 13) {
    document.getElementById("name").tabIndex = '0';
    document.getElementById("rating").tabIndex = '0';
    document.getElementById("comments").tabIndex = '0';
    document.getElementById("submit").tabIndex = '0';
    document.getElementById("cancel").tabIndex = '0';
    document.getElementById("add-review").click();
  }
});

document.getElementById('cancel').addEventListener('keyup', function(event) {
  event.preventDefault();
  if (event.keyCode === 13) {
    document.getElementById('cancel').click();
    document.getElementById("name").tabIndex = '-1';
    document.getElementById("rating").tabIndex = '-1';
    document.getElementById("comments").tabIndex = '-1';
    document.getElementById("submit").tabIndex = '-1';
    document.getElementById("cancel").tabIndex = '-1';
  }
});
