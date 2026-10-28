import moment from 'moment-timezone'

export default ({ Schedules, Users }) => {
  const getScheduled = async (time = moment()) => {
    const allUsers = await Users.find({}).fetchAsync()

    const scheduled = await Promise.all(allUsers.map(user => isScheduled(time, user._id)))
    return allUsers.filter((user, i) => scheduled[i])
  }

  const isOverrideUnavailable = async (time = moment(), userId = null) => {
    return await Schedules.findOneAsync({
      type: 'override',
      available: false,
      start: { $lte: time.toDate() },
      end: { $gte: time.toDate() },
      userId: userId,
      removed: { $ne: true }
    })
  }

  const isOverrideAvailable = async (time = moment(), userId = null) => {
    return await Schedules.findOneAsync({
      type: 'override',
      available: true,
      start: { $lte: time.toDate() },
      end: { $gte: time.toDate() },
      userId: userId,
      removed: { $ne: true }
    })
  }

  const isScheduledDefault = async (time = moment(), userId = null) => {
    const defaultSchedule = await Schedules.findOneAsync({
      type: 'default',
      userId: userId,
      removed: { $ne: true }
    })

    return (defaultSchedule && defaultSchedule.isWithin(time))
  }

  const isScheduled = async (time = moment(), userId = null) => {
    const user = await Users.findOneAsync({ _id: userId })
    if (!user) { return false }
    if (!await Schedules.methods.isOpen({ time })) { return false }
    if (await isOverrideUnavailable(time, userId)) { return false }
    if (await isOverrideAvailable(time, userId)) { return true }
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
