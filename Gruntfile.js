module.exports = function(grunt) {

grunt.initConfig({
  imagemin: {
    png: {
      options: {
        optimizationLevel: 7
      },
      files: [
        {
          expand: true,
          cwd: 'img/',
          src: ['**/*.png'],
          dest: 'img',
          ext: '.png'
        }
      ]
    },
    jpg: {
      options: {
        progressive: true
      },
      files: [
        {
          expand: true,
          cwd: 'img',
          src: ['**/*.jpg'],
          dest: 'img',
          ext: '.jpg'
        }
      ]
    }
  }
});


grunt.loadNpmTasks('grunt-contrib-imagemin');
grunt.registerTask('imagemin', ['imagemin']);

};
