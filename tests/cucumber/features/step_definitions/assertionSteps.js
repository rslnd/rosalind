(function () {
  'use strict';
  var moment = require('moment');

  module.exports = function () {

    this.Then(/^I should see '([^']*)'$/, function (string) {
      return this.client
        .waitForExist('#loaded')
        .getText('body').then(function(bodyText) {
          expect(bodyText).to.contain(string);
        });
    });

    this.Then(/^I should not see '([^']*)'$/, function (string) {
      return this.client
        .waitForExist('#loaded')
        .getText('body').then(function(bodyText) {
          expect(bodyText).to.not.contain(string);
        });
    });

    this.Then(/^the field '([^']*)' should be empty$/, function (labelText) {
      var _this = this;
      return this.client
        .waitForExist('#loaded')
        .element('label=' + labelText)
        .getAttribute('label=' + labelText, 'for').then(function(fieldId) {
          _this.client.getValue('#' + fieldId, function(err, value) {
            expect(value).to.equal('');
          });
        });
    });

    this.Then(/^I should see the current time$/, function () {
      var time = moment().format('HH:mm');
      return this.client
        .waitForExist('#loaded')
        .getText('body').then(function(bodyText) {
          expect(bodyText).to.contain(time);
        });
    });


    this.Then(/^I should see the title '([^']*)'$/, function (expectedTitle) {
      return this.client
        .waitForExist('#loaded')
        .waitForVisible('body *')
        .getTitle().should.become(expectedTitle);
    });

  };
})();
