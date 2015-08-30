(function () {
  'use strict';

  Meteor.methods({
    'fixtures/users/create': function(options) {
      check(options, Object);

      if (options.attributes)
        options = options.attributes

      options.username = options.username.replace(/\s/g, '');

      if (Meteor.users.findOne({username: options.username}))
        return;

      if (!options.password) options.password = '1111';
      if (!options.email) options.email = options.username + '@example.com';

      Accounts.createUser(options);

      return options.username;
    },

    'fixtures/users/setRoles': function(options) {
      check(options, Object);

      var userId = Meteor.users.findOne({username: options.username})._id;
      var roles = options.roles.replace(/\s/ig, '').split(',');

      Roles.setUserRoles(userId, roles, Roles.GLOBAL_GROUP);
      return options.username
    }
  });

})();
