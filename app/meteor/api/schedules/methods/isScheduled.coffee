filter = require 'lodash/filter'
moment = require 'moment'

module.exports = ({ Schedules, Users }) ->
  getScheduled: (time = moment()) ->
    allUsers = Users.find({}).fetch()
    filter allUsers, (user) =>
      @isScheduled(time, user._id)

  isScheduled: (time = moment(), userId = null) ->

    return false unless user = Users.findOne(_id: userId)
    return false unless Schedules.methods.isOpen(time)

    notAvailable = Schedules.findOne
      type: 'override'
      available: false
      start: { $lte: time.toDate() }
      end: { $gte: time.toDate() }
      userId: userId
      removed: { $ne: true }

    return false if notAvailable


    overrideScheduled = Schedules.findOne
      type: 'override'
      available: true
      start: { $lte: time.toDate() }
      end: { $gte: time.toDate() }
      userId: userId
      removed: { $ne: true }

    return true if overrideScheduled


    defaultSchedule = Schedules.findOne
      type: 'default'
      userId: userId
      removed: { $ne: true }

    return defaultSchedule and defaultSchedule.isWithin(time)
