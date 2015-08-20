Template.inboundCall.events({
  'click .resolve'() {
    InboundCalls.softRemove(this._id);
  },
  'click .unresolve'() {
    InboundCalls.restore(this._id);
  }
});

UI.registerHelper('vacafix', (context, options) => {
  if (context)
    return context.split('o').join('0')
      .split('O').join('0');
});
