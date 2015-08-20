Meteor.publish('users', function() {
  if(this.userId) {
    return Meteor.users.find({}, { fields: {
      'username': 1,
      'profile.firstName': 1,
      'profile.lastName': 1,
      'profile.titlePrepend': 1,
      'profile.titleAppend': 1,
      'profile.gender': 1,
      'profile.birthday': 1
    }});
  }
});
