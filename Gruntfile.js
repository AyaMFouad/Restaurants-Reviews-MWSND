
module.exports = function (grunt) {

    grunt.initConfig({
        responsive_images: {
            dev: {
                options:
                    {
                        engine: 'im',
                        concurrency: 2,
                        sizes: [
                            {
                                width: 320,
                                quality: 50
                            },
                            {
                                width: 480,
                                quality: 45
                            }, {
                                width: 640,
                                quality: 45
                            },
                            {
                                width: 800,
                                quality: 40
                            }
                        ]
                    },

                /*
                You don't need to change this part if you don't change
                the directory structure.
                */
                files: [{
                    expand: true,
                    src: ['*.{gif,jpg,png}'],
                    cwd: 'img/',
                    dest: 'img_responsive/'
                },
              {
                expand: true,
                src: ['*.webp'],
                cwd: 'img_responsive/',
                dest:'img_responsive/'
              }
            ]
            }
        },

        cwebp: {
          files: {
            expand: true,
            cwd: 'img/',
            src: ['*.{gif,jpg,png}'],
            dest:'img_responsive/'
          },
          options: {
            q: 80
          }
        },

        /* Clear out the images directory if it exists */
        clean: {
            dev: {
                src: ['img_responsive'],
            },
        },

        /* Generate the images directory if it is missing */
        mkdir: {
            dev: {
                options: {
                    create: ['img_responsive']
                },
            },
        },

        /* Copy the "fixed" images that don't go through processing into the images/directory */
    });

    grunt.loadNpmTasks('grunt-responsive-images');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-mkdir');
    grunt.loadNpmTasks('grunt-cwebp');
    grunt.registerTask('default', ['clean', 'mkdir', 'cwebp', 'responsive_images']);

};
