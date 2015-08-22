(function () {
  'use strict';

  module.exports = function () {

    var lastUsername = null;

    this.Given(/^I am an? (.*)$/, function (username) {
      lastUsername = this.server.call('fixtures/users/create', {username: username});
    });

    this.Given(/^I am logged in$/, function () {
      return this.client
        .waitForExist('#loaded')
        .execute(function(lastUsername) {
          Meteor.loginWithPassword(lastUsername, '1111');
        }, lastUsername)
        .waitForExist('#loaded');
    });

    this.Then(/^I should be logged in$/, function () {
      return this.client
        .waitForExist('#loaded')
        .executeAsync(function(done) {
          done(Meteor.user());
        }).then(function(res) {
          expect(res.value).to.be.not.null;
        });
    });

    this.Then(/^I should be logged out$/, function () {
      return this.client
        .waitForExist('#loaded')
        .executeAsync(function(done) {
          done(Meteor.user());
        }).then(function(res) {
          expect(res.value).to.be.null;
        });
    });

    this.Given(/^I log out$/, function () {
      this.client.execute(function() {
        Meteor.logout();
      });
    });

  };
})();
