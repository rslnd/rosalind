Meteor.publish('counts', function() {
  if (this.userId) {
    Counts.publish(this, 'inboundCalls', InboundCalls.find());
  }
});
