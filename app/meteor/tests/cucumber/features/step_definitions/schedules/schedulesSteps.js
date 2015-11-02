(function () {
  'use strict';
  var moment = require('moment');

  module.exports = function () {

    this.Then('I should see the current week of the year', function () {
      var currentWeekOfYear = moment().format('W');

      client.waitForExist('#loaded');
      var bodyText = client.getText('body');
      expect(bodyText).toContain(currentWeekOfYear);
    });

  };
})();
