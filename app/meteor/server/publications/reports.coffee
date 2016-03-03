Meteor.publish 'reports', (options) ->
  return unless @userId and Roles.userIsInRole(@userId, ['reports', 'admin'], Roles.GLOBAL_GROUP)
  check options, Match.Optional
    date: Match.Optional(Date)

  Reports.find({})
