filter = require 'lodash/filter'
moment = require 'moment'

module.exports = ({ Schedules, Users }) ->
  getScheduled: (time = moment()) ->
    allUsers = Users.find({}).fetch()
    filter allUsers, (user) =>
      @isScheduled(time, user._id)


  isOverrideUnavailable: (time = moment(), userId = null) ->
    Schedules.findOne
      type: 'override'
      available: false
      start: { $lte: time.toDate() }
      end: { $gte: time.toDate() }
      userId: userId
      removed: { $ne: true }


  isOverrideAvailable: (time = moment(), userId = null) ->
    overrideScheduled = Schedules.findOne
      type: 'override'
      available: true
      start: { $lte: time.toDate() }
      end: { $gte: time.toDate() }
      userId: userId
      removed: { $ne: true }


  isScheduledDefault: (time = moment(), userId = null) ->
    defaultSchedule = Schedules.findOne
      type: 'default'
      userId: userId
      removed: { $ne: true }

    return defaultSchedule and defaultSchedule.isWithin(time)


  isScheduled: (time = moment(), userId = null) ->

    return false unless user = Users.findOne(_id: userId)
    return false unless Schedules.methods.isOpen(time)

    return false if @isOverrideUnavailable(time, userId)
    return true if @isOverrideAvailable(time, userId)

    return @isScheduledDefault(time, userId)
