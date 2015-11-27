module.exports = (grunt) ->
  grunt.loadNpmTasks('grunt-contrib-coffee')
  grunt.loadNpmTasks('grunt-contrib-uglify')
  grunt.loadNpmTasks('grunt-electron-installer')
  grunt.loadNpmTasks('grunt-electron')

  grunt.initConfig
    pkg: grunt.file.readJSON('package.json')

    coffee:
      glob_to_multiple:
        expand: true
        flatten: false
        src: [
          'main/*.coffee',
          'renderer/*.coffee'
        ]
        dest: 'build/javascript/'
        ext: '.js'

    electron:
      package:
        options:
          name: 'Rosalind'
          dir: 'build/javascript/'
          out: 'build/packaged/'
          version: '<%= pkg.buildOptions.electronVersion %>'
          platform: 'all'
          arch: 'all'
          asar: true
          overwrite: true
          ignore: [
            'node_modules/electron-prebuilt',
            'node_modules/electron-packager',
            'node_modules/grunt',
            'node_modules/grunt-electron-installer',
            'node_modules/electron-prebuilt',
            '.git',
            'build/',
            'scripts/',
            'npm-debug.log'
          ].join('|')

  grunt.registerTask('build', ['coffee', 'electron'])
  grunt.registerTask('default', ['coffee'])
