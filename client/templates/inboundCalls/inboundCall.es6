Template.inboundCall.events({
  'click .resolve'() {
    InboundCalls.remove(this._id);
  }
});
