Meteor.publish 'counts', ->
  return unless @userId and Roles.userIsInRole(@userId, ['inboundCalls', 'admin'], Roles.GLOBAL_GROUP)

  Counts.publish @, 'inboundCalls', InboundCalls.find({})
  Counts.publish @, 'inboundCalls-resolvedToday', InboundCalls.find
    removed: true
    removedAt: { $gte: Time.startOfToday() }
  return undefined
