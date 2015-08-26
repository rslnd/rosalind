Template.inboundCall.events({
  'click .resolve'() {
    InboundCalls.softRemove(this._id);
  }
});

Template.inboundCallsResolved.helpers({
  InboundCallsTable: function () {
    return InboundCalls.Table;
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
