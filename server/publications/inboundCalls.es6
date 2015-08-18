Meteor.publish('inboundCalls', function() {
  if(this.userId) {
    return InboundCalls.find({});
  }
});
