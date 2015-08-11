(function () {
  'use strict';

  module.exports = function () {
    var url = require('url');

    this.When(/^I click on '([^']*)'$/, function (linkText) {
      var selector = '(//a|//input|//button)[contains(.,"' + linkText + '")]';
      return this.client
        .waitForVisible(selector)
        .click(selector);
    });

    this.When(/^I fill in '([^']*)' with '([^']*)'$/, function (labelText, fieldValue) {
      var _this = this;
      return this.client
        .element('label=' + labelText)
        .getAttribute('label=' + labelText, 'for').then(function(fieldId) {
          _this.client.setValue('#' + fieldId, fieldValue);
        });
    });

  };
})();
