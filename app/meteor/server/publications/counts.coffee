Meteor.publish 'counts', ->
  return unless @userId

  if Roles.userIsInRole(@userId, ['appointments', 'admin'], Roles.GLOBAL_GROUP)
    Counts.publish @, 'appointments', Appointments.find({})
    Counts.publish @, 'appointments-resolvedToday', Appointments.find
      removed: true
      removedAt: { $gte: Time.startOfToday() }


  if Roles.userIsInRole(@userId, ['inboundCalls', 'admin'], Roles.GLOBAL_GROUP)
    Counts.publish @, 'inboundCalls', InboundCalls.find({})
    Counts.publish @, 'inboundCalls-resolvedToday', InboundCalls.find
      removed: true
      removedAt: { $gte: Time.startOfToday() }

  return undefined
