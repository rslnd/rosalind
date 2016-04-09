{ Meteor } = require 'meteor/meteor'
{ Events } = require '/imports/api/events'

Meteor.methods
  'timesheets/startTracking': ->
    return unless userId = Meteor.userId()
    methods.startTracking({ userId })

  'timesheets/stopTracking': ->
    return unless userId = Meteor.userId()
    methods.stopTracking({ userId })

methods = (collection) ->
  sum: (timesheets) ->
    duration = _.chain(timesheets)
      .map (t) -> t.duration()
      .reduce ((a, b) -> a + b), 0
      .value()

  startTracking: (options = {}) ->
    return if @isTracking(options)
    timesheetId = collection.insert
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
    collection.update { _id: timesheetId }, $set:
      end: new Date()
      tracking: false

    console.log('[Timesheets] Stop tracking', { timesheetId })

    Events.insert
      type: 'timesheets/stopTracking'
      subject: options.userId
      payload: { timesheetId }


  isTracking: (options = {}) ->
    collection.findOne
      userId: options.userId
      tracking: true

module.exports = methods
