Meteor.publish('counts', function() {
  if (this.userId && Roles.userIsInRole(this.userId, ['inboundCalls', 'admin'], Roles.GLOBAL_GROUP)) {
    Counts.publish(this, 'inboundCalls', InboundCalls.find({}));
    Counts.publish(this, 'inboundCalls-resolvedToday', InboundCalls.find({removed: true, removedAt: {$gte: Time.startOfToday()}}));
  }
});
