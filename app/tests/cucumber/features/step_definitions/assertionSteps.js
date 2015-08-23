(function () {
  'use strict';
  var moment = require('moment');

  module.exports = function () {

    this.Then(/^I should see '([^']*)'$/, function (string) {
      client.waitForExist('#loaded')
      client.pause(2000)
      expect(client.getText('#main').toLowerCase()).to.contain(string.toLowerCase());
    });

    this.Then(/^I should not see '([^']*)'$/, function (string) {
      client.waitForExist('#loaded')
      client.pause(2000)
      expect(client.getText('#main').toLowerCase()).to.not.contain(string.toLowerCase());
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
      var bodyText = client.getText('#main');
      expect(bodyText).to.contain(time.slice(0,-1));
    });


    this.Then(/^I should see the title '([^']*)'$/, function (expectedTitle) {
      return this.client
        .waitForExist('#loaded')
        .waitForVisible('body *')
        .getTitle().should.become(expectedTitle);
    });

  };
})();
