import moment from 'moment'

export default ({ Schedules, Users }) => {
  const getScheduled = (time = moment()) => {
    const allUsers = Users.find({}).fetch()

    return allUsers.filter((user) => {
      return isScheduled(time, user._id)
    })
  }

  const isOverrideUnavailable = (time = moment(), userId = null) => {
    return Schedules.findOne({
      type: 'override',
      available: false,
      start: { $lte: time.toDate() },
      end: { $gte: time.toDate() },
      userId: userId,
      removed: { $ne: true }
    })
  }

  const isOverrideAvailable = (time = moment(), userId = null) => {
    return Schedules.findOne({
      type: 'override',
      available: true,
      start: { $lte: time.toDate() },
      end: { $gte: time.toDate() },
      userId: userId,
      removed: { $ne: true }
    })
  }

  const isScheduledDefault = (time = moment(), userId = null) => {
    const defaultSchedule = Schedules.findOne({
      type: 'default',
      userId: userId,
      removed: { $ne: true }
    })

    return (defaultSchedule && defaultSchedule.isWithin(time))
  }

  const isScheduled = (time = moment(), userId = null) => {
    const user = Users.findOne({ _id: userId })
    if (!user) { return false }
    if (!Schedules.methods.isOpen(time)) { return false }
    if (isOverrideUnavailable(time, userId)) { return false }
    if (isOverrideAvailable(time, userId)) { return true }
    return isScheduledDefault(time, userId)
  }

  return {
    getScheduled,
    isOverrideUnavailable,
    isOverrideAvailable,
    isScheduledDefault,
    isScheduled
  }
}
