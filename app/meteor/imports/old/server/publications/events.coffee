Meteor.publish 'events', (options) ->
  return unless @userId and Roles.userIsInRole(@userId, ['events', 'admin'], Roles.GLOBAL_GROUP)
  check options, Match.Optional
    date: Match.Optional(Date)

  Events.find {},
    limit: 200
    sort: { createdAt: -1 }
