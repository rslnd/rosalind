Meteor.publish 'reports', ->
  return unless @userId and Roles.userIsInRole(@userId, ['reports', 'admin'], Roles.GLOBAL_GROUP)

  Reports.find({})
