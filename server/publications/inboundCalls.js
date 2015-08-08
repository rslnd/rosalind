Meteor.publish('inboundCalls', function() {
  return InboundCalls.find({});
});
