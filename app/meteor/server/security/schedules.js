Meteor.startup(() => {
  Schedules.permit(['insert', 'update', 'remove']).ifHasRole('admin').apply();
  Schedules.permit(['insert', 'update', 'remove']).apply();
});
