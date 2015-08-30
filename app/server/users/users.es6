Meteor.methods({
  'users/create'(form) {
    check(form, Schema.UserCreate);
    if (!Roles.userIsInRole(Meteor.userId(), ['admin']))
      throw new Meteor.Error('not-authorized');

    console.log('Creating user', form.username);
    return Accounts.createUser(form);
  },
  'users/updatePassword'(form) {
    check(form, Schema.UserUpdatePassword);
    if (!Roles.userIsInRole(Meteor.userId(), ['admin']))
      throw new Meteor.Error('not-authorized');

    console.log('Setting password for user', form.userId);
    return Accounts.setPassword(form.userId, form.password, {logout: false});
  },
  'users/updateRoles'(form) {
    check(form, Schema.UserUpdateRoles);
    if (!Roles.userIsInRole(Meteor.userId(), ['admin']))
      throw new Meteor.Error('not-authorized');

    let roles = form.roles.replace(/\s/ig, '').split(',');
    console.log('Setting roles for user', form.userId, roles);
    return Roles.setUserRoles(form.userId, roles, Roles.GLOBAL_GROUP);
  }
});
