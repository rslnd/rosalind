Meteor.publish 'appointments', ->
  return unless (@userId and Roles.userIsInRole(@userId, ['appointments', 'admin'], Roles.GLOBAL_GROUP))
  Appointments.find({})
