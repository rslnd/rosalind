Meteor.startup(() => {
  InboundCalls.permit(['insert', 'update', 'remove']).ifHasRole('admin').apply();
  InboundCalls.permit('insert').ifHasRole('inboundCalls').apply();
});
