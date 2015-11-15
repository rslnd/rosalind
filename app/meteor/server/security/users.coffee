Meteor.startup ->
  Meteor.users.permit(['insert', 'update']).ifHasRole('admin').apply()
