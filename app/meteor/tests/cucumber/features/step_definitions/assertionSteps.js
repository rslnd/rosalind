(function () {
  'use strict';
  var moment = require('moment');

  module.exports = function () {

    this.Then('I should see \'$string\'', function (string) {
      client.waitForExist('#loaded');
      var mainText = client.getText('body');
      expect(mainText.toLowerCase()).toContain(string.toLowerCase());
    });

    this.Then('I should not see \'$string\'', function (string) {
      client.waitForExist('#loaded');
      var mainText = client.getText('body');
      expect(mainText.toLowerCase()).not.toContain(string.toLowerCase());
    });

    this.Then('I should see \'$string\' in \'$element\'', function (string, element) {
      client.waitForExist(element);
      var elementText = client.getText(element);
      if (typeof elementText === 'object')
        elementText = elementText.join(' ');
      expect(elementText.toLowerCase()).toContain(string.toLowerCase());
    });

    this.Then('the field \'$labelText\' should be empty', function (labelText) {
      client.waitForExist('#loaded');
      client.element('label=' + labelText);
      var fieldId = client.getAttribute('label=' + labelText, 'for');
      var fieldValue = client.getValue('#' + fieldId);
      expect(fieldValue).toEqual('');
    });

    this.Then('I should see the current time', function () {
      var time = moment().format('HH:mm');

      client.waitForExist('#loaded');
      var bodyText = client.getText('body');
      expect(bodyText).toContain(time.slice(0, -1));
    });

    this.Then('I should see the element \'$selector\'', function (selector) {
      client.waitForVisible(selector);
    });
  };
})();
