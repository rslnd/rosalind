Meteor.publish('groups', function() {
  if(this.userId) {
    return Groups.find({});
  }
});
