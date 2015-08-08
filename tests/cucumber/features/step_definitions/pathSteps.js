(function () {
  'use strict';
  var _ = require('underscore');

  module.exports = function () {
    var url = require('url');

    this.Given(/^I am on the dashboard$/, function () {
      return this.client.url(process.env.ROOT_URL);
    });

    this.When(/^I navigate to '([^']*)'$/, function (relativePath) {
      return this.client
        .url(url.resolve(process.env.ROOT_URL, relativePath));
    });

  };
})();
