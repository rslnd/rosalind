Template.inboundCall.events({
  'click .resolve'() {
    InboundCalls.softRemove(this._id);
  }
});

Template.inboundCallsUnresolve.events({
  'click .unresolve'() {
    InboundCalls.restore(this._id);
  }
});

UI.registerHelper('zerofix', (context, options) => {
  return Helpers.zerofix(context);
});
