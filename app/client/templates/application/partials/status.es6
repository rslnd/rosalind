Template.status.helpers({
  userStatus(user) {
    if (typeof user === 'string')
      user = Meteor.users.findOne(user);

    if (typeof user === 'object' && user.doc)
      user = user.doc;

    if (typeof user === 'object' && user.status)
      return user.status.online ? (user.status.idle ? 'text-yellow' : 'text-green') : 'text-muted';
  }
});
