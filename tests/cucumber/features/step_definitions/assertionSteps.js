(function () {
  'use strict';
  var _ = require('underscore');

  module.exports = function () {
    var url = require('url');

    this.Then(/^I should see '([^']*)'$/, function (string) {
      return this.client
        .waitForVisible('body *')
        .getText('body').then(function(bodyText) {
          expect(bodyText).to.contain(string);
        });
    });

    this.Then(/^the field '([^']*)' should be empty$/, function (labelText) {
      var _this = this;
      return this.client
        .element('label=' + labelText)
        .getAttribute('label=' + labelText, 'for').then(function(fieldId) {
          _this.client.getValue('#' + fieldId, function(err, value) {
            expect(value).to.equal('');
          });
        });
    });

    this.Then(/^I should see the title '([^']*)'$/, function (expectedTitle) {
      return this.client
        .waitForVisible('body *')
        .getTitle().should.become(expectedTitle);
    });

  };
})();
