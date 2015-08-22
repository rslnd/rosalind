(function () {
  'use strict';

  module.exports = function () {
    var url = require('url');

    var lastFormField = null;

    this.When(/^I click on '([^']*)'$/, function (linkText) {
      var selector = '(//a|//input|//button)[contains(.,"' + linkText + '")]';
      return this.client
        .waitForExist('#loaded')
        .waitForVisible(selector)
        .click(selector);
    });

    this.When(/^I fill in '([^']*)' with '([^']*)'$/, function (labelText, fieldValue) {
      var _this = this;
      var selector = lastFormField = 'label=' + labelText;
      return this.client
        .waitForExist('#loaded')
        .element(selector)
        .getAttribute(selector, 'for').then(function(fieldId) {
          _this.client.setValue('#' + fieldId, fieldValue);
        });
    });

    this.When(/^I submit the form$/, function() {
      return this.client
        .waitForExist('#loaded')
        .waitForVisible(lastFormField)
        .submitForm(lastFormField);
    });

  };
})();
