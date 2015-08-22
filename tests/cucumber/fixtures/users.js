(function () {
  'use strict';

  Meteor.methods({
    'fixtures/users/create': function(options) {
      if (options.attributes)
        options = options.attributes

      options.username = options.username.replace(/\s/g, '');

      if (Meteor.users.findOne({username: options.username}))
        return;

      if (!options.password) options.password = '1111';
      if (!options.email) options.email = options.username + '@example.com';

      Accounts.createUser(options);

      return options.username;
    }
  });

})();
