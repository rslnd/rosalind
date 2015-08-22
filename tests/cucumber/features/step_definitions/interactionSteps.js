(function () {
  'use strict';

  module.exports = function () {
    var url = require('url');

    var lastFormField = null;

    this.When(/^I click on '([^']*)'$/, function (linkText) {
      var menuPath = (linkText.indexOf('>') !== -1);
      var getSelector = function(_linkText, level) {
        if (typeof level === 'number')
          return '#' + _linkText.replace(/[^a-z]/ig, '-').toLowerCase() + '.level-' + level;
        else
          return '(//a|//input|//button)[contains(.,"' + _linkText + '")]';
      }

      client.waitForExist('#loaded');

      if (menuPath) {
        client.click(getSelector(linkText.split(' > ')[0], 0));
        client.pause(300);
        client.execute(function(submenuSelector) {
          $(submenuSelector).click();
        }, getSelector(linkText.split(' > ')[1], 1));
      } else {
        var selector = getSelector(linkText);
        client.waitForVisible(selector);
        client.click(selector);
      }
    });

    this.When(/^I fill in '([^']*)' with '([^']*)'$/, function (labelText, fieldValue) {
      var selector = lastFormField = 'label=' + labelText;

      client.waitForExist('#loaded');
      client.element(selector);
      var fieldId = client.getAttribute(selector, 'for');
      client.setValue('#' + fieldId, fieldValue);
    });

    this.When(/^I submit the form$/, function() {
      client.waitForExist('#loaded');
      client.waitForVisible(lastFormField);
      client.submitForm(lastFormField);
    });

  };
})();
