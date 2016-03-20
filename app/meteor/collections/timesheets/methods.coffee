Meteor.startup ->

  Timesheets.sum = (timesheets) ->
    duration = _.chain(timesheets)
      .map (t) -> t.duration()
      .reduce ((a, b) -> a + b), 0
      .value()

  Timesheets.startTracking = (options = {}) ->
    return if Timesheets.isTracking(options)
    timesheetId = Timesheets.insert
      userId: options.userId
      start: new Date()
      tracking: true

    console.log('[Timesheets] Start tracking', { timesheetId })

    Events.insert
      type: 'timesheets/startTracking'
      subject: options.userId
      payload: { timesheetId }


  Timesheets.stopTracking = (options = {}) ->
    return unless timesheetId = Timesheets.isTracking(options)?._id
    Timesheets.update { _id: timesheetId }, $set:
      end: new Date()
      tracking: false

    console.log('[Timesheets] Stop tracking', { timesheetId })

    Events.insert
      type: 'timesheets/stopTracking'
      subject: options.userId
      payload: { timesheetId }


  Timesheets.isTracking = (options = {}) ->
    Timesheets.findOne
      userId: options.userId
      tracking: true

Meteor.methods
  'timesheets/startTracking': ->
    return unless userId = Meteor.userId()
    Timesheets.startTracking({ userId })

  'timesheets/stopTracking': ->
    return unless userId = Meteor.userId()
    Timesheets.stopTracking({ userId })
