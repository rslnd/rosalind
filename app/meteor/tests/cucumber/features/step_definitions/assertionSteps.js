(function () {
  'use strict';
  var moment = require('moment');

  module.exports = function () {

    this.Before(function() {
      browser.timeoutsImplicitWait(30 * 1000);
    });

    this.Then('I should see \'$string\'', function (string) {
      browser.waitForExist('#loaded');
      var mainText = browser.getText('body');
      expect(mainText.toLowerCase()).toContain(string.toLowerCase());
    });

    this.Then('I should not see \'$string\'', function (string) {
      browser.waitForExist('#loaded');
      var mainText = browser.getText('body');
      expect(mainText.toLowerCase()).not.toContain(string.toLowerCase());
    });

    this.Then('I should see \'$string\' in \'$element\'', function (string, element) {
      browser.waitForExist(element);
      var elementText = browser.getText(element);
      if (typeof elementText === 'object')
        elementText = elementText.join(' ');
      expect(elementText.toLowerCase()).toContain(string.toLowerCase());
    });

    this.Then('the field \'$labelText\' should be empty', function (labelText) {
      browser.waitForExist('#loaded');
      browser.element('label=' + labelText);
      var fieldId = browser.getAttribute('label=' + labelText, 'for');
      var fieldValue = browser.getValue('#' + fieldId);
      expect(fieldValue).toEqual('');
    });

    this.Then('I should see the current time', function () {
      var time = moment().format('HH:mm');

      browser.waitForExist('#loaded');
      var bodyText = browser.getText('body');
      expect(bodyText).toContain(time.slice(0, -1));
    });

    this.Then('I should see the element \'$selector\'', function (selector) {
      browser.waitForVisible(selector);
    });

    this.Then(/^I pause/, function () {
      browser.debug();
    });

  };
})();
