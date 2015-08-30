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
  }
});
