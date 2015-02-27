module.exports = (grunt) ->
  grunt.initConfig
    pkg: grunt.file.readJSON('package.json')
    coffee:
      app:
        expand: true
        cwd: 'src'
        src: ['**/*.coffee']
        dest: 'build'
        ext: '.js'
    concat:
      options: separator: ';'
      dist:
        src: [
          'lib/jsSHA/src/sha512.js'
          'build/**/*.js'
        ]
        dest: 'dist/<%= pkg.name %>.js'
    uglify:
      options: banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      dist: 
        files: 
          'dist/<%= pkg.name %>.min.js': [
            '<%= concat.dist.dest %>' 
          ]

  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-contrib-concat'
  grunt.loadNpmTasks 'grunt-contrib-uglify'
  grunt.registerTask 'default', [
    'coffee'
    'concat'
    'uglify'
  ]
  return