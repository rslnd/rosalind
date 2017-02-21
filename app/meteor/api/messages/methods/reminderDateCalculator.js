import { isHolidays, isWeekend, dayTimeFrom, dayTimeTo } from './isQuietTime'
import { skipBackwards, skipForwards } from './skipBackwards'
import { clampTime } from './clampTime'

export const reminderDateCalculator = ({ holidays = [], days = 1 }) => {
  const isWithinHolidays = isHolidays(holidays)
  const skip = (m) => (isWeekend(m) || isWithinHolidays(m))
  const clamp = (m) => clampTime(m, {
    lower: dayTimeFrom,
    upper: dayTimeTo,
    pad: 15
  })

  const calculateReminderDate = (m) => clamp(skipBackwards(m, days, skip))
  const calculateFutureCutoff = (m) => skipForwards(m, days, skip)
  return { calculateReminderDate, calculateFutureCutoff }
}
