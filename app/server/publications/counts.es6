Meteor.publish('counts', function() {
  if (this.userId) {
    Counts.publish(this, 'inboundCalls', InboundCalls.find({}));
    Counts.publish(this, 'inboundCalls-resolvedToday', InboundCalls.find({removed: true, removedAt: {$gte: Time.startOfToday()}}));
  }
});
