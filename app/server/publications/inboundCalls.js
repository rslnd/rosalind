Meteor.publishComposite('inboundCalls', function(options = {}) {
  check(options, Object);

  if(this.userId) {
    let selector = _.pick(options, 'removed');

    return {
      find: () => InboundCalls.find({}, selector),
      children: [
        {
          find: (inboundCall) => {
            return Comments.find({docId: inboundCall._id});
          }
        }
      ]
    };
  }
});
