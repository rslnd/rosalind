Meteor.publish('inboundCalls', function(options = {}) {
  check(options, Object);
  
  if(this.userId) {
    let selector = _.pick(options, 'removed');
    return InboundCalls.find(selector);
  }
});
