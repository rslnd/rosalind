var path = require('path')

module.exports = function (wallaby) {
  process.env.NODE_PATH = process.env.NODE_PATH || ''
  process.env.NODE_PATH += ':' + path.join(wallaby.localProjectDir, 'node_modules')

  return {
    files: [
      './api/**/*.js',
      './client/**/*.js',
      './util/**/*.js',
      '!./api/**/*.test.js',
      '!./client/**/*.test.js',
      '!./util/**/*.test.js'
    ],

    tests: [
      './api/**/*.test.js',
      './client/**/*.test.js',
      './util/**/*.test.js'
    ],

    bootstrap: function () {
      path = require('path')
      var helper = path.join(wallaby.localProjectDir, './tests/mocha/helper')
      require(helper)
    },

    compilers: {
      '**/*.js': wallaby.compilers.babel()
    },

    env: {
      type: 'node',
      runner: '/Users/albertzak/.nvm/versions/node/v4.7.3/bin/node'
    },

    testFramework: 'mocha'
  }
}
