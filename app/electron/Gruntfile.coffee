find = require 'lodash/find'
map = require 'lodash/map'

module.exports = (grunt) ->
  grunt.loadNpmTasks('grunt-contrib-coffee')
  grunt.loadNpmTasks('grunt-contrib-copy')
  grunt.loadNpmTasks('grunt-contrib-clean')
  grunt.loadNpmTasks('grunt-contrib-rename')
  grunt.loadNpmTasks('grunt-electron-installer')
  grunt.loadNpmTasks('grunt-electron')
  grunt.loadNpmTasks('grunt-shell')
  grunt.loadNpmTasks('grunt-string-replace')

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
      map(devDependencies, (version, name) -> name)

    electronVersion: ->
      devDependencies = packageJSON.devDependencies
      find(devDependencies, (version, name) -> name is 'electron').version




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

    'create-windows-installer':
      ia32:
        appDirectory: 'build/packaged/<%= pkg.productName %>-win32-ia32'
        outputDirectory: 'build/installer/<%= pkg.productName %>-win32-ia32/'
        exe: '<%= pkg.productName %>.exe'
        title: '<%= pkg.productName %>'
        iconUrl: 'https://raw.githubusercontent.com/albertzak/rosalind/master/app/electron/assets/appicon.ico'
        setupIcon: 'assets/appicon.ico'
        noMsi: true

    copy:
      js:
        files: [
          {
            src: [
              'main/*.js',
              'main/**/*.js',
              'renderer/*.js'
              'renderer/**/*.js'
            ]
            dest: 'build/javascript/'
          }
        ]

      nodeModules:
        files: [
          {
            src: (->
              src = [ '*/**' ]
              map(options.devDependencies(), (p) -> src.push('!' + p + '/**'))
              return src
            )()
            cwd: 'node_modules/'
            expand: true
            dest: 'build/javascript/node_modules/'
          }
        ]

      packageJson:
        files: [
          {
            src: ['package.json']
            dest: 'build/javascript/package.json'
          }
        ]

    rename:
      installerExe:
        files: [
          src: 'build/installer/Rosalind-win32-ia32/RosalindSetup.exe'
          dest: 'build/installer/Rosalind-win32-ia32/RosalindSetup-win-v<%= pkg.version %>.exe'
        ]

    'string-replace':
      env:
        files:
          'build/javascript/main/logger.js': 'build/javascript/main/logger.js'
        options:
          replacements: [
            {} =
              pattern: /\@\@CI/ig
              replacement: process.env.CI or false

            {} =
              pattern: /\@\@PAPERTRAIL_URL/ig
              replacement: process.env.PAPERTRAIL_URL
          ]

    shell:
      tag:
        command: options.tagCommand()

      push:
        command: 'git push --follow-tags'

      electronPrebuilt:
        command: './node_modules/.bin/electron build/javascript/'
        options:
          failOnError: false

      npmInstallProduction:
        command: 'cd ./build/javascript && npm i --production'

      kill:
        command: options.killCommand()
        options:
          stdout: false
          stderr: false
          failOnError: false


  grunt.registerTask('tag', ['shell:tag', 'shell:push'])
  grunt.registerTask('package', ['clean:full', 'coffee', 'copy:js', 'copy:packageJson', 'shell:npmInstallProduction', 'string-replace:env', 'electron:package' ])
  grunt.registerTask('build', ['clean:full', 'coffee', 'copy:js', 'copy:packageJson', 'shell:npmInstallProduction', 'string-replace:env', 'electron:package', 'create-windows-installer', 'rename:installerExe', ])
  grunt.registerTask('default', ['clean:full', 'shell:kill', 'coffee', 'copy:js', 'copy:packageJson', 'copy:nodeModules', 'shell:electronPrebuilt'])
