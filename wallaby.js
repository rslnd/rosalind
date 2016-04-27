module.exports = function (wallaby) {
  return {
    files: [
      'app/meteor/imports/**/*.coffee',
      '!app/meteor/imports/**/*.test.coffee'
    ],

    tests: [
      'app/meteor/imports/**/*.test.coffee'
    ],

    bootstrap: function () {
      global.expect = require('chai').expect;
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
