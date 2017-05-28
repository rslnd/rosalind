var path = require('path')

module.exports = function (wallaby) {
  process.env.NODE_PATH = process.env.NODE_PATH || ''
  process.env.NODE_PATH += ':' + path.join(wallaby.localProjectDir, 'app', 'meteor', 'node_modules')

  return {
    files: [
      '/app/meteor/imports/**/*.js*',
      '!./app/meteor/imports/**/*.test.js*'
    ],

    tests: [
      './app/meteor/imports/**/*.test.js*'
    ],

    bootstrap: function () {
      path = require('path')
      var helper = path.join(wallaby.localProjectDir, 'app/meteor/tests/mocha/helper')
      require(helper)
    },

    compilers: {
      '**/*.js*': wallaby.compilers.babel({ babel: require('./app/meteor/node_modules/babel-core') })
    },

    env: {
      type: 'node',
      runner: '/Users/albertzak/.nvm/versions/node/v4.7.3/bin/node'
    },

    testFramework: 'mocha'
  }
}
