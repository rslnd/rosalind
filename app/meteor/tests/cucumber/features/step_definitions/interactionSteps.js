(function () {
  'use strict';

  module.exports = function () {
    this.Before(function() {
      browser.windowHandleMaximize();
    });

    var lastFormField = null;

    // Follow a menu path: 'Inbound Calls > New Inbound Call'
    // Click on a text fragment: 'Mark as resolved'
    // Click on any element: '.btn.cancel'
    this.When('I click on \'$linkText\'', function (linkText) {
      var menuPath = (linkText.indexOf('>') !== -1);
      var getSelector = function(_linkText, level) {
        if (typeof level === 'number') {
          return '#' + _linkText.replace(/[^a-z]/ig, '-').toLowerCase() + '.level-' + level;
        } else {
          return _linkText;
        }
      };

      browser.waitForExist('#loaded');

      if (menuPath) {
        browser.execute(function(s0) {
          $(s0).click();
        }, getSelector(linkText.split(' > ')[0], 0));
        browser.pause(300);

        browser.execute(function(s1) {
          $(s1).click();
        }, getSelector(linkText.split(' > ')[1], 1));
        browser.pause(300);

        browser.waitForExist('#loaded');
      } else if (browser.isExisting('//a[@title="' + linkText + '"]')) {
        browser.execute(function(title) {
          $('a[title="' + title + '"]').click();
        }, linkText);
        browser.pause(300);

        browser.waitForExist('#loaded');
      } else {
        if (linkText.match(/(^\.|^\#)/ig)) {
          browser.waitForVisible(linkText);
          browser.click(linkText);
        } else {
          browser.pause(300);

          var foundAndClicked = browser.execute(function(linkText) {
            var el = $('a,input,button').filter(':contains("' + linkText + '")').sort(function(a, b) {
              return (Number($(b).zIndex()) - Number($(a).zIndex()));
            });

            if (el.length > 0) {
              el.first().click();
              return true;
            } else {
              return false;
            }
          }, linkText);

          browser.pause(300);
          browser.waitForExist('#loaded');
          expect(foundAndClicked.value).not.toBe(false, 'Could not find any element (a|input|button) containing text: ' + linkText);
        }
      }
    });

    this.When('I fill in \'$labelText\' with \'$fieldValue\'', function (labelText, fieldValue) {
      var selector = 'label=' + labelText;
      lastFormField = selector;

      browser.waitForExist('#loaded');
      browser.waitForExist(selector);
      var fieldId = browser.getAttribute(selector, 'for');
      browser.setValue('#' + fieldId, fieldValue);

      browser.pause(300);
    });

    this.When('I submit the form', function() {
      browser.waitForExist('#loaded');
      browser.waitForVisible(lastFormField);
      browser.submitForm(lastFormField);
      browser.pause(300);
      browser.waitForExist('#loaded');
    });

    this.When('I press \'$key\'', function(key) {
      key.replace('Back space', '\uE003');
      key.replace('Tab', '\uE004');
      key.replace('Clear', '\uE005');
      key.replace('Return', '\uE006');
      key.replace('Enter', '\uE007');
      key.replace('Shift', '\uE008');
      key.replace('Control', '\uE009');
      key.replace('Alt', '\uE00A');
      key.replace('Escape', '\uE00C');
      key.replace('Left arrow', '\uE012');
      key.replace('Up arrow', '\uE013');
      key.replace('Right arrow', '\uE014');
      key.replace('Down arrow', '\uE015');
      key.replace('Pageup', '\uE00E');
      key.replace('Pagedown', '\uE00F');
      key.replace('Space', '\uE00D');
      browser.keys(key);
    });

  };
})();
