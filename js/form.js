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
