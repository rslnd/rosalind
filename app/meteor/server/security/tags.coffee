Meteor.startup ->
  Tags.permit(['insert', 'update']).ifHasRole('admin').apply()
