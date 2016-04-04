_ = require('lodash')

module.exports = (grunt) ->
  grunt.loadNpmTasks('grunt-contrib-coffee')
  grunt.loadNpmTasks('grunt-contrib-uglify')
  grunt.loadNpmTasks('grunt-contrib-copy')
  grunt.loadNpmTasks('grunt-contrib-clean')
  grunt.loadNpmTasks('grunt-electron-installer')
  grunt.loadNpmTasks('grunt-electron')
  grunt.loadNpmTasks('grunt-shell')

  packageJSON = grunt.file.readJSON('package.json')

  options =
    tagCommand: ->
      v = packageJSON.version
      grunt.log.ok("Latest release tag is v#{v} 🐣")
      "git tag -a v#{v} -m '🐣 v#{v}'"

    killCommand: ->
      'taskkill /F /IM electron.exe' if process.platform is 'win32'
      'pkill -9 Electron' if process.platform is 'darwin'
      'pkill -9 electron'

    devDependencies: ->
      devDependencies = packageJSON.devDependencies
      _.map(devDependencies, (version, name) -> name)

    electronVersion: ->
      devDependencies = packageJSON.devDependencies
      _.find(devDependencies, (version, name) -> name is 'electron-prebuilt').version

    dependencies: ->
      dependencies = packageJSON.dependencies
      _.map(dependencies, (version, name) -> name)



  grunt.initConfig
    pkg: packageJSON

    clean:
      build:
        ['build/javascript', 'build/packaged', 'build/installer/']
      full:
        ['build/javascript', 'build/packaged', 'build/installer/', 'build/node_modules']

    coffee:
      compile:
        expand: true
        flatten: false
        src: [
          'main/*.coffee',
          'main/**/*.coffee',
          'renderer/*.coffee'
          'renderer/**/*.coffee'
        ]
        dest: 'build/javascript/'
        ext: '.js'

    electron:
      package:
        options:
          name: 'Rosalind'
          icon: 'assets/appicon.ico'
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
          version: options.electronVersion()
          platform: 'win32'
          arch: 'ia32'
          asar: true
          overwrite: true
          ignore: _.map(options.devDependencies(), (p) -> 'node_modules/' + p).join('|')

    'create-windows-installer':
      ia32:
        appDirectory: 'build/packaged/<%= pkg.productName %>-win32-ia32'
        outputDirectory: 'build/installer/<%= pkg.productName %>-win32-ia32/'
        exe: '<%= pkg.productName %>.exe'
        title: '<%= pkg.productName %>'
        iconUrl: 'https://raw.githubusercontent.com/albertzak/rosalind/master/app/electron/assets/appicon.ico'
        setupIcon: 'assets/appicon.ico'

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
      tag:
        command: options.tagCommand()

      'push':
        command: 'git push'

      'push-tags':
        command: 'git push --tags'

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


  grunt.registerTask('tag', ['shell:tag', 'shell:push', 'shell:push-tags'])
  grunt.registerTask('build', ['clean:full', 'coffee', 'copy:node_modules', 'electron:package', 'create-windows-installer'])
  grunt.registerTask('default', ['clean:full', 'shell:kill', 'coffee', 'copy:node_modules', 'shell:electronPrebuilt'])
