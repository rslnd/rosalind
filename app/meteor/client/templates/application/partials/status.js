Template.status.helpers({
  userStatus(user) {
    if (typeof user === 'string')
      user = Meteor.users.findOne(user);

    if (typeof user === 'object' && user.doc)
      user = user.doc;

    if (typeof user === 'object' && user.status)
      return user.status.online ? (user.status.idle ? 'text-yellow' : 'text-green') : 'text-muted';
  },
  userPopoverTitle(user) {
    if (user && user.status && user.status.lastLogin)
      return user.status.lastLogin.ipAddr;
  },
  userPopoverContent(user) {
    if (user && user.status && user.status.lastLogin)
      return user.status.lastLogin.userAgent;
  }
});

Template.status.rendered = function() {
  $('[data-toggle="popover"]').popover();
};
