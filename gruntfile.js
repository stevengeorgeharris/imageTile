module.exports = function(grunt) {
  grunt.initConfig({
      // Lets register a sass compiler.
      sass: {
        dist: {
          options: {
            // Add your own options here. See https://github.com/gruntjs/grunt-contrib-sass.
            sourcemap: 'none',
          },
          // Format = destination : source (You can add multiple files, seperate with a comma).
          files: {
            'css/app.css': 'sass/app.scss',
          }
        }
      },
      // Lets watch for file changes.
      watch: {
        // Watches all files ending .scss in sass/.
        files: ['sass/**/*.scss'],
        // If any target file changes, run these tasks.
        tasks: ['sass', 'postcss'],
      },
      // Lets auto generate browser prefixes.
      postcss: {
        options: {
          map: false,
          processors: [
            require('autoprefixer')({browsers: 'last 2 versions'}),
          ]
        },
        dist: {
          src: 'css/app.css'
        }
    },
  });

  // Lets load our dependancies.
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-postcss');

  // Lets register our task.
  grunt.registerTask('default', ['watch']);
};
