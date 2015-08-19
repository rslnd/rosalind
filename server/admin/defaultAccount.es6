Meteor.startup(function() {
  if (Meteor.users.find({}).count() !== 0)
    return;

  if (process.env.IS_MIRROR)
    return;

  try {
    let defaultAccount = Meteor.settings.private.admin.defaultAccount;
    if (defaultAccount) {
      console.log('Creating first admin user', defaultAccount.username);
      let id = Accounts.createUser(defaultAccount);
      Roles.addUsersToRoles(id, ['admin'], Roles.GLOBAL_GROUP);
    }
  } catch(e) {
    console.log('Please add credentials for the default admin user in settings.json', e);
  }
});
