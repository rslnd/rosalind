Meteor.publishComposite('inboundCalls', function(options = {}) {
  check(options, Object);

  if(this.userId && Roles.userIsInRole(this.userId, ['inboundCalls', 'admin'], Roles.GLOBAL_GROUP)) {
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
