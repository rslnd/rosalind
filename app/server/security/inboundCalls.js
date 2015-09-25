Meteor.startup(() => {
  InboundCalls.permit(['insert', 'update', 'remove']).ifHasRole('admin').apply();
  InboundCalls.permit(['insert', 'update']).ifHasRole('inboundCalls').apply();
});
