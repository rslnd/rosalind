Template.inboundCall.events({
  'click .resolve'() {
    InboundCalls.softRemove(this._id);
  },
  'click .unresolve'() {
    InboundCalls.restore(this._id);
  }
});

// Split phone number at whitespaces. If the word contains a number,
// replace all letters 'O' or 'o' with zeroes. Join back together.
UI.registerHelper('zerofix', (context, options) => {
  return Util.zerofix(context);
});
