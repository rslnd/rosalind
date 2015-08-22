(function () {
  'use strict';
  var moment = require('moment');

  module.exports = function () {

    this.Then(/^I should see '([^']*)'$/, function (string) {
      client.waitForExist('#loaded')
      client.pause(2000)
      expect(client.getText('body').toLowerCase()).to.contain(string.toLowerCase());
    });

    this.Then(/^I should not see '([^']*)'$/, function (string) {
      client.waitForExist('#loaded')
      client.pause(2000)
      expect(client.getText('body').toLowerCase()).to.not.contain(string.toLowerCase());
    });

    this.Then(/^the field '([^']*)' should be empty$/, function (labelText) {
      client.waitForExist('#loaded');
      client.element('label=' + labelText);
      var fieldId = client.getAttribute('label=' + labelText, 'for');
      var fieldValue = client.getValue('#' + fieldId);
      expect(fieldValue).to.equal('');
    });

    this.Then(/^I should see the current time$/, function () {
      var time = moment().format('HH:mm');

      client.waitForExist('#loaded');
      var bodyText = client.getText('body');
      expect(bodyText).to.contain(time);
    });


    this.Then(/^I should see the title '([^']*)'$/, function (expectedTitle) {
      return this.client
        .waitForExist('#loaded')
        .waitForVisible('body *')
        .getTitle().should.become(expectedTitle);
    });

  };
})();
