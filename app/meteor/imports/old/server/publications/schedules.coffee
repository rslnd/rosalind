Meteor.publishComposite 'schedules', (options = {}) ->
  check(options, Object)
  return unless (@userId and Roles.userIsInRole(@userId, ['schedules', 'admin'], Roles.GLOBAL_GROUP))

  {
    find: -> Schedules.find({})
    children: [
      { find: (schedule) -> Meteor.users.find({ _id: schedule.userId }) }
    ]
  }
