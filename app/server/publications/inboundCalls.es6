Meteor.publish('inboundCalls', function(options = {}) {
  if(this.userId) {
    let selector = _.pick(options, 'removed');
    return InboundCalls.find(selector);
  }
});
