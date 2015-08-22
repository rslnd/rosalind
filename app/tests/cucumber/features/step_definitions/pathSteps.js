(function () {
  'use strict';

  module.exports = function () {
    var url = require('url');

    this.Before(function() {
      return this.client.url(process.env.ROOT_URL);      
    });

    this.Given(/^I am on the dashboard$/, function () {
      return this.client.url(process.env.ROOT_URL);
    });

    this.When(/^I navigate to '([^']*)'$/, function (relativePath) {
      return this.client
        .url(url.resolve(process.env.ROOT_URL, relativePath));
    });

  };
})();
