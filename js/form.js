/*credit of the original code for this from goes to
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


document.getElementById('review-form').addEventListener('submit', function (event) {
  event.preventDefault();
  if (event.keyCode === 13) {
    removeTabfocusFromForm();
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
    removeTabfocusFromForm();
  }
});


  removeTabfocusFromForm = () => {
    window.onload = () =>{
      const form = document.querySelector('#add-review');
      formDesc = form.querySelectorAll('*');
      formDesc.forEach( (desc) =>{
        desc.setAttribute("tabindex", "-1");
      }, this);
    }
  }
