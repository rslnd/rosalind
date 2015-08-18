Meteor.publish('inboundCalls', function() {
  if(this.userId) {
    Counts.publish(this, 'inboundCalls', InboundCalls.find());
    return InboundCalls.find({});
  }
});
