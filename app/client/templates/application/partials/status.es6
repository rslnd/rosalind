Template.status.helpers({
  userStatus(user) {
    if (typeof user === 'string')
      user = Meteor.users.findOne(user);

    if (typeof user === 'object' && user.status)
      return user.status.online ? 'text-success' : 'muted';
  }
});
