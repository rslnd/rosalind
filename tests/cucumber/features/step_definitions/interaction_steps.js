(function () {
  'use strict';
  var _ = require('underscore');

  module.exports = function () {
    var url = require('url');

    this.When(/^I navigate to "([^"]*)"$/, function (relativePath) {
      return this.client.
        url(url.resolve(process.env.ROOT_URL, relativePath));
    });

    this.When(/^I click on "([^"]*)"$/, function (linkText) {
      return this.client
        .click('=' + linkText);
    });

    this.When(/^I fill in "([^"]*)" with "([^"]*)"$/, function (labelText, fieldValue) {
      var _this = this;
      return this.client
        .element('label=' + labelText)
        .getAttribute('label=' + labelText, 'for').then(function(fieldId) {
          _this.client.setValue('#' + fieldId, fieldValue);
        });
    });

    this.Then(/^I should see the title "([^"]*)"$/, function (expectedTitle) {
      return this.client.
        waitForVisible('body *').
        getTitle().should.become(expectedTitle);
    });

  };
})();
