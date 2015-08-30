Meteor.publish(null, function (){
  if(this.userId) {
    return Meteor.roles.find({});
  }
});
