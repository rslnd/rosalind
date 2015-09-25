Meteor.startup(() => {
  Comments.permit(['insert', 'update', 'remove']).ifHasRole('admin').apply();
  Comments.permit(['insert']).ifLoggedIn().apply();
  Comments.permit(['update']).ifLoggedIn().exceptProps(['createdBy', 'createdAt', 'docId']).apply();
});
