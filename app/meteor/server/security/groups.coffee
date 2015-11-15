Meteor.startup ->
  Groups.permit(['insert', 'update']).ifHasRole('admin').apply()
