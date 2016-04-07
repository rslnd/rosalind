{ Meteor } = require 'meteor/meteor'
Timesheets = require '/imports/api/timesheets'

Meteor.methods
  'timesheets/startTracking': ->
    return unless userId = Meteor.userId()
    methods.startTracking({ userId })

  'timesheets/stopTracking': ->
    return unless userId = Meteor.userId()
    methods.stopTracking({ userId })

methods =
  sum: (timesheets) ->
    duration = _.chain(timesheets)
      .map (t) -> t.duration()
      .reduce ((a, b) -> a + b), 0
      .value()

  startTracking: (options = {}) ->
    return if @isTracking(options)
    timesheetId = Timesheets.insert
      userId: options.userId
      start: new Date()
      tracking: true

    console.log('[Timesheets] Start tracking', { timesheetId })

    Events.insert
      type: 'timesheets/startTracking'
      subject: options.userId
      payload: { timesheetId }

  stopTracking: (options = {}) ->
    return unless timesheetId = @isTracking(options)?._id
    Timesheets.update { _id: timesheetId }, $set:
      end: new Date()
      tracking: false

    console.log('[Timesheets] Stop tracking', { timesheetId })

    Events.insert
      type: 'timesheets/stopTracking'
      subject: options.userId
      payload: { timesheetId }


  isTracking: (options = {}) ->
    Timesheets.findOne
      userId: options.userId
      tracking: true

module.exports = methods
