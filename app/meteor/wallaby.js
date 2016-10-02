var path = require('path')

module.exports = function (wallaby) {
  process.env.NODE_PATH = process.env.NODE_PATH || ''
  process.env.NODE_PATH += ':' + path.join(wallaby.localProjectDir, 'node_modules')

  return {
    files: [
      './**/*.js',
      '!./**/*.test.js',
      '!./node_modules/**/*.js',
      '!./client/compatibility/**/*.js',
      '!./tests/**/*'
    ],

    tests: [
      './**/*.test.js',
      '!./node_modules/**/*.test.js',
      '!./tests/**/*'
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
      type: 'node'
    },

    testFramework: 'mocha'
  }
}
