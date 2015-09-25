(function () {
  'use strict';
  var moment = require('moment');

  module.exports = function () {

    this.Then(/^I should see '([^']*)'$/, function (string) {
      client.pause(2000);
      client.waitForExist('#loaded');
      var mainText = client.getText('#main');
      expect(mainText.toLowerCase()).toContain(string.toLowerCase());
    });

    this.Then(/^I should not see '([^']*)'$/, function (string) {
      client.pause(2000);
      client.waitForExist('#loaded');
      var mainText = client.getText('#main');
      expect(mainText.toLowerCase()).not.toContain(string.toLowerCase());
    });

    this.Then(/^the field '([^']*)' should be empty$/, function (labelText) {
      client.waitForExist('#loaded');
      client.element('label=' + labelText);
      var fieldId = client.getAttribute('label=' + labelText, 'for');
      var fieldValue = client.getValue('#' + fieldId);
      expect(fieldValue).toEqual('');
    });

    this.Then(/^I should see the current time$/, function () {
      var time = moment().format('HH:mm');

      client.waitForExist('#loaded');
      var bodyText = client.getText('#main');
      expect(bodyText).toContain(time.slice(0,-1));
    });

  };
})();
