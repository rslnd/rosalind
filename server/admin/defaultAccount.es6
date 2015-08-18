Meteor.startup(function() {
  if (Meteor.users.find({}).count() !== 0)
    return;

  if (process.env.IS_MIRROR)
    return;

  try {
    let defaultAccount = Meteor.settings.private.admin.defaultAccount;

    if (defaultAccount && defaultAccount.name && defaultAccount.password) {
      let id = Accounts.createUser({
        username: defaultAccount.name,
        password: defaultAccount.password
      });

      Roles.addUsersToRoles(id, ['admin']);

      console.log('Created first admin user: ' + defaultAccount.name);
    }
  } catch(e) {
    console.log('Please add credentials for the default admin user in settings.json');
  }
});
