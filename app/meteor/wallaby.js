var path = require('path')

module.exports = function (wallaby) {
  process.env.NODE_PATH = process.env.NODE_PATH || ''
  process.env.NODE_PATH += ':' + path.join(wallaby.localProjectDir, 'node_modules')

  return {
    files: [
      './**/*.js',
      './**/*.coffee',
      '!./**/*.test.js',
      '!./**/*.test.coffee',
      '!./node_modules/**/*.js',
      '!./node_modules/**/*.coffee',
      '!./tests/**/*'
    ],

    tests: [
      './**/*.test.coffee',
      './**/*.test.js',
      '!./node_modules/**/*.test.js',
      '!./node_modules/**/*.test.coffee',
      '!./tests/**/*'
    ],

    bootstrap: function () {
      path = require('path')
      var helper = path.join(wallaby.localProjectDir, './tests/mocha/helper')
      require(helper)
    },

    compilers: {
      '**/*.coffee': wallaby.compilers.coffeeScript(),
      '**/*.js': wallaby.compilers.babel()
    },

    env: {
      type: 'node'
    },

    testFramework: 'mocha'
  }
}
