import { isHolidays, isWeekend, dayTimeFrom, dayTimeTo } from './isQuietTime'
import { skipBackwards, skipForwards } from './skipBackwards'
import { clampTime } from './clampTime'

export const reminderDateCalculator = ({ holidays = [], days = 1 }) => {
  const isWithinHolidays = isHolidays(holidays)
  const weekendsOrHolidays = (m) => (isWeekend(m) || isWithinHolidays(m))
  const clamp = (m) => clampTime(m, {
    lower: dayTimeFrom,
    upper: dayTimeTo
  })

  const calculateReminderDate = (m, skipDays = days) => clamp(skipBackwards({
    start: m,
    count: skipDays,
    unit: 'days',
    skip: weekendsOrHolidays
  }))

  const calculateFutureCutoff = (m, skipDays = days) => skipForwards({
    start: m,
    count: skipDays,
    unit: 'days',
    skip: weekendsOrHolidays
  })

  return { calculateReminderDate, calculateFutureCutoff }
}
