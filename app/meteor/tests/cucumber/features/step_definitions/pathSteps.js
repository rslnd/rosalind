(function () {
  'use strict';

  module.exports = function () {
    var url = require('url');

    this.Before(function() {
      browser.url(process.env.ROOT_URL);
    });

    this.Given('I am on the dashboard', function () {
      browser.url(process.env.ROOT_URL);
    });

    this.When('I navigate to \'$relativePath\'', function (relativePath) {
      browser.url(url.resolve(process.env.ROOT_URL, relativePath));
    });

  };
})();
