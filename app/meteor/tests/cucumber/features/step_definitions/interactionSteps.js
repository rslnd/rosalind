(function () {
  'use strict';

  module.exports = function () {
    var lastFormField = null;

    this.When('I click on \'$linkText\'', function (linkText) {
      var menuPath = (linkText.indexOf('>') !== -1);
      var getSelector = function(_linkText, level) {
        if (typeof level === 'number')
          return '#' + _linkText.replace(/[^a-z]/ig, '-').toLowerCase() + '.level-' + level;
        else
          return '(//a|//input|//button)[contains(.,"' + _linkText + '")]';
      };

      client.waitForExist('#loaded');

      if (menuPath) {
        client.execute(function(s0) {
          $(s0).click();
        }, getSelector(linkText.split(' > ')[0], 0));
        client.pause(300);

        client.execute(function(s1) {
          $(s1).click();
        }, getSelector(linkText.split(' > ')[1], 1));
        client.pause(300);


        client.waitForExist('#loaded');
      } else {
        client.execute(function(linkText) {
          $(':contains("' + linkText + '")').click();
        }, linkText);
      }
    });

    this.When('I fill in \'$labelText\' with \'$fieldValue\'', function (labelText, fieldValue) {
      var selector = 'label=' + labelText;
      lastFormField = selector;

      client.waitForExist('#loaded');
      client.waitForExist(selector);
      var fieldId = client.getAttribute(selector, 'for');
      client.setValue('#' + fieldId, fieldValue);

      client.pause(300);
    });

    this.When('I submit the form', function() {
      client.waitForExist('#loaded');
      client.waitForVisible(lastFormField);
      client.submitForm(lastFormField);
      client.pause(300);
      client.waitForExist('#loaded');
    });

  };
})();
