(function () {
  'use strict';
  var _ = require('underscore');

  module.exports = function () {

    this.Before(function() {
      this.server.call('fixtures/resetDatabase');
    });

    this.After(function() {
      this.server.call('fixtures/resetDatabase');
    });


    this.Given(/^an? '([^']*)' with the following attributes:?$/, function (collection, attributes, callback) {
      var _this = this;

      if (collection.match(/^Users?$/i)) {
        _.each(attributes.hashes(), function(row) {
          _this.server.call('fixtures/users/create', {
            attributes: row
          });
        });
      } else {
        _.each(attributes.hashes(), function(row) {
          _this.server.call('fixtures/createRecord', {
            collection: collection,
            attributes: row
          });
        });
      }

      callback();
    });

  };
})();
