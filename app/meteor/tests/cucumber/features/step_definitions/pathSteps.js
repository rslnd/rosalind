(function () {
  'use strict';

  module.exports = function () {
    var url = require('url');

    this.Before(function() {
      browser.windowHandleMaximize();
      browser.url(process.env.ROOT_URL);
      browser.execute(function() {
        TAPi18n.setLanguage('en');
        moment.locale('en-US');
      });
    });

    this.Given('I am on the dashboard', function () {
      browser.url(process.env.ROOT_URL);
    });

    this.When('I navigate to \'$relativePath\'', function (relativePath) {
      browser.url(url.resolve(process.env.ROOT_URL, relativePath));
    });

  };
})();
