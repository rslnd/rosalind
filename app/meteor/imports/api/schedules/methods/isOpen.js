import momentTz from 'moment-timezone'
import { extendMoment } from 'moment-range'
const moment = extendMoment(momentTz)

export default ({ Schedules }) => {
  const isOpen = async ({ time = moment(), within = 'minute' } = {}) => {
    if (await Schedules.methods.isBusinessHoursOverride({ time, within })) {
      return true
    } else if (await Schedules.methods.isHoliday({ time, within })) {
      return false
    } else if (await Schedules.methods.isRegularBusinessHours({ time, within })) {
      return true
    } else {
      return false
    }
  }

  const isHoliday = async ({ time = moment(), within = 'minute' } = {}) => {
    const holidays = Schedules.find({
      type: 'holiday',
      start: { $lte: time.toDate() },
      end: { $gte: time.toDate() },
      removed: { $ne: true }
    })

    return (await holidays.countAsync() > 0)
  }

  const isBusinessHoursOverride = async ({ time = moment(), within = 'minute' } = {}) => {
    const overrides = await Schedules.find({
      type: 'businessHoursOverride',
      start: { $gte: time.clone().startOf('day').toDate() },
      end: { $lte: time.clone().endOf('day').toDate() },
      removed: { $ne: true }
    }).fetchAsync()

    let any = false

    if (overrides.length > 0) {
      overrides.map((o) => {
        if (moment.range(o.start, o.end).contains(time)) {
          any = true
        }
      })
    }

    return any
  }

  const isRegularBusinessHours = async ({ time = moment(), within = 'minute' }) => {
    const businessHoursRegular = await Schedules.findOneAsync({
      type: 'businessHours',
      removed: { $ne: true }
    })

    return businessHoursRegular && businessHoursRegular.isWithin({ time, within })
  }

  return {
    isOpen,
    isHoliday,
    isBusinessHoursOverride,
    isRegularBusinessHours
  }
}
