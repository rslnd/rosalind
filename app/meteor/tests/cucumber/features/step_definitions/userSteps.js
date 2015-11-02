(function () {
  'use strict';

  module.exports = function () {

    var lastUsername = null;

    this.Given(/^I am an? '(.*)'(?: with the roles? '(.*)')$/, function (username, roles) {
      lastUsername = server.call('fixtures/users/create', {username: username});
      server.call('fixtures/users/setRoles', {username: lastUsername, roles: roles});
    });

    this.Given('I am logged in', function () {
      browser.waitForExist('#loaded');
      browser.execute(function(name) {
        Meteor.loginWithPassword(name, '1111');
      }, lastUsername);
      browser.waitForExist('li.user-menu');
    });

    this.Then('I should be logged in', function () {
      browser.waitForExist('#loaded');
      browser.pause(300);
      var user = browser.execute(function() {
        return Meteor.user();
      });
      expect(user.value).not.toBeNull();
    });

    this.Then('I should be logged out', function () {
      browser.waitForExist('#loaded');
      browser.pause(300);
      var user = browser.execute(function() {
        return Meteor.user();
      });
      expect(user.value).toBeNull();
    });

    this.Given('I log out', function () {
      browser.execute(function() {
        Meteor.logout();
      });
    });

  };
})();
