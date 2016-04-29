fs = require('fs')
path = require('path')

module.exports = function (wallaby) {

  process.env.NODE_PATH = process.env.NODE_PATH || ''
  process.env.NODE_PATH += ':' + path.join(wallaby.localProjectDir, 'app/meteor/node_modules')

  return {
    files: [
      'app/meteor/imports/**/*.coffee',
      '!app/meteor/imports/**/*.test.coffee'
    ],

    tests: [
      'app/meteor/imports/**/*.test.coffee'
    ],

    bootstrap: function () {
      path = require('path')
      helper = path.join(wallaby.localProjectDir, 'app/meteor/tests/mocha/helper')
      require(helper)
    },

    compilers: {
      '**/*.coffee': wallaby.compilers.coffeeScript()
    },

    env: {
      type: 'node'
    },

    testFramework: 'mocha'

  }
}
