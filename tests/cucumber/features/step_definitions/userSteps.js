(function () {
  'use strict';
  var _ = require('underscore');

  module.exports = function () {
    var url = require('url');

    this.Given(/^I am a new user$/, function () {
      return this.server.call('reset');
    });

  };
})();
