Meteor.publishComposite 'appointments', ->
  return unless (@userId and Roles.userIsInRole(@userId, ['appointments', 'admin'], Roles.GLOBAL_GROUP))

  {
    find: -> Appointments.find({})
    children: [
      { find: (appointment) -> Comments.find({ docId: appointment._id }) }
    ]
  }
