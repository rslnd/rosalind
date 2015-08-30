Meteor.methods({
  'users/create'(form) {
    check(form, Schema.UserCreate);
    if (!Roles.userIsInRole(Meteor.userId(), ['admin'])) {
      throw new Meteor.Error('not-authorized');
    }
    return Accounts.createUser(form);
  }
});
