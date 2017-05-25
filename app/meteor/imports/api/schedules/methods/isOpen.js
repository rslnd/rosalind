import momentTz from 'moment-timezone'
import { extendMoment } from 'moment-range'
const moment = extendMoment(momentTz)

export default ({ Schedules }) => {
  const isOpen = ({ time = moment(), within = 'minute' } = {}) => {
    if (Schedules.methods.isBusinessHoursOverride({ time, within })) {
      return true
    } else if (Schedules.methods.isHoliday({ time, within })) {
      return false
    } else if (Schedules.methods.isRegularBusinessHours({ time, within })) {
      return true
    } else {
      return false
    }
  }

  const isHoliday = ({ time = moment(), within = 'minute' } = {}) => {
    const holidays = Schedules.find({
      type: 'holidays',
      start: { $lte: time.toDate() },
      end: { $gte: time.toDate() },
      removed: { $ne: true }
    })

    return (holidays.count() > 0)
  }

  const isBusinessHoursOverride = ({ time = moment(), within = 'minute' } = {}) => {
    const overrides = Schedules.find({
      type: 'businessHoursOverride',
      start: { $gte: time.clone().startOf('day').toDate() },
      end: { $lte: time.clone().endOf('day').toDate() },
      removed: { $ne: true }
    }).fetch()

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

  const isRegularBusinessHours = ({ time = moment(), within = 'minute' }) => {
    const businessHoursRegular = Schedules.findOne({
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
