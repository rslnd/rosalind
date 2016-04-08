moment = require 'moment'
{ Users } = require '/imports/api/users'

module.exports = (collection) ->
  isScheduled: (time = moment(), userId = null) ->

    return false unless user = Users.findOne(_id: userId)
    return false unless collection.methods.isOpen(time)

    notAvailable = collection.findOne
      type: 'override'
      available: false
      start: { $lte: time.toDate() }
      end: { $gte: time.toDate() }
      userId: userId
      removed: { $ne: true }

    return false if notAvailable


    overrideScheduled = collection.findOne
      type: 'override'
      available: true
      start: { $lte: time.toDate() }
      end: { $gte: time.toDate() }
      userId: userId
      removed: { $ne: true }

    return true if overrideScheduled


    defaultSchedule = collection.findOne
      type: 'default'
      userId: userId
      removed: { $ne: true }

    return defaultSchedule and defaultSchedule.isWithin(time)
