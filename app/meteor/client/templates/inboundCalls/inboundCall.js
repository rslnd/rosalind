Template.inboundCall.events({
  'click .resolve'() {
    InboundCalls.softRemove(this._id);
  },
  'click .unresolve'() {
    InboundCalls.restore(this._id);
    Modal.hide();
  }
});

Template.inboundCallsUnresolve.events({
  'click .unresolve'() {
    InboundCalls.restore(this._id);
  }
});

UI.registerHelper('zerofix', (context) => {
  return Helpers.zerofix(context);
});
