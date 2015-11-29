_ = require('underscore')

module.exports = (grunt) ->
  grunt.loadNpmTasks('grunt-contrib-coffee')
  grunt.loadNpmTasks('grunt-contrib-uglify')
  grunt.loadNpmTasks('grunt-contrib-watch')
  grunt.loadNpmTasks('grunt-contrib-copy')
  grunt.loadNpmTasks('grunt-contrib-clean')
  grunt.loadNpmTasks('grunt-electron-installer')
  grunt.loadNpmTasks('grunt-electron')
  grunt.loadNpmTasks('grunt-shell')

  options =
    killCommand: ->
      'taskkill /F /IM electron.exe' if process.platform is 'win32'
      'pkill -9 Electron' if process.platform is 'darwin'
      'pkill -9 electron'

    devDependencies: ->
      devDependencies = grunt.file.readJSON('package.json').devDependencies
      _.map(devDependencies, (version, name) -> name)

    dependencies: ->
      dependencies = grunt.file.readJSON('package.json').dependencies
      _.map(dependencies, (version, name) -> name)



  grunt.initConfig
    pkg: grunt.file.readJSON('package.json')

    clean:
      build:
        ['build/javascript', 'build/packaged', 'build/installer/']
      full:
        ['build/javascript', 'build/packaged', 'build/installer/', 'build/node_modules']

    watch:
      coffee:
        files: ['**/*.coffee', 'package.json']
        tasks: ['shell:kill', 'coffee:compile', 'shell:electronPrebuilt']
      node_modules:
        files: 'node_modules/**/**'
        tasks: 'copy:node_modules'

    coffee:
      compile:
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
          icon: undefined
          versionString:
            CompanyName: '<%= pkg.author %>'
            LegalCopyright: '<%= pkg.author %>'
            FileDescription: '<%= pkg.productName %>'
            OriginalFilename: '<%= pkg.productName %>'
            FileVersion: '<%= pkg.version %>'
            ProductVersion: '<%= pkg.version %>'
            ProductName: '<%= pkg.productName %>'
            InternalName: '<%= pkg.productName %>'
          dir: 'build/javascript/'
          out: 'build/packaged/'
          version: '<%= pkg.buildOptions.electronVersion %>'
          platform: 'all'
          arch: 'all'
          asar: true
          overwrite: true
          ignore: _.map(options.devDependencies(), (p) -> 'node_modules/' + p).join('|')

    'create-windows-installer':
      x64:
        appDirectory: 'build/packaged/<%= pkg.productName %>-win32-x64'
        outputDirectory: 'build/installer/<%= pkg.productName %>-win32-x64/'
        exe: '<%= pkg.productName %>.exe'
        title: '<%= pkg.productName %>'
      ia32:
        appDirectory: 'build/packaged/<%= pkg.productName %>-win32-ia32'
        outputDirectory: 'build/installer/<%= pkg.productName %>-win32-ia32/'
        exe: '<%= pkg.productName %>.exe'
        title: '<%= pkg.productName %>'

    copy:
      node_modules:
        files: [
          {
            src: _.map(options.dependencies(), (p) -> p + '/**')
            cwd: 'node_modules/'
            expand: true
            dest: 'build/javascript/node_modules/'
          }
          {
            src: ['package.json']
            dest: 'build/javascript/package.json'
          }
        ]

    shell:
      electronPrebuilt:
        command: './node_modules/.bin/electron build/javascript/'
        options:
          failOnError: false

      kill:
        command: options.killCommand()
        options:
          stdout: false
          stderr: false
          failOnError: false


  grunt.registerTask('build', ['clean:full', 'coffee', 'copy:node_modules', 'electron:package', 'create-windows-installer'])
  grunt.registerTask('default', ['clean:full', 'shell:kill', 'coffee', 'copy:node_modules', 'shell:electronPrebuilt', 'watch'])
