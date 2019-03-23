import identity from 'lodash/identity'
import momentTz from 'moment-timezone'
import { extendMoment } from 'moment-range'
import { __ } from '../../i18n'
import { dayToDate } from './day'

const moment = extendMoment(momentTz)

export const birthday = d => {
  if (!d) { return null }
  const m = moment(dayToDate(d))
  const date = m.format(__('time.dateFormat'))
  const age = moment().diff(m, 'years')

  return (age === 1
    ? __('patients.birthdayFormatOne', { date })
    : __('patients.birthdayFormat', { age, date })
  )
}

export const relativeTimeString = d => {
  const date = moment(d)
  const now = moment()
  const daysAgo = moment.range(date, now).diff('days')
  const isToday = now.isSame(date, 'day')
  const showRelative = daysAgo > 2 && daysAgo <= 9
  const showYear = now.year() !== date.year()

  return [
    isToday ? __('time.today') + ', ' : null,
    showRelative ? date.fromNow() : null,
    showYear
      ? date.format(__('time.dateFormatWeekdayShort'))
      : date.format(__('time.dateFormatWeekdayShortNoYear')),
    __('ui.at'),
    date.format(__('time.timeFormat'))
  ].filter(identity).join(' ')
}

export const weekOfYear = (date, options = {}) => {
  const weekOfYear = moment(date).format('W')
  return options.short
    ? [__('ui.weekOfYear_short'), weekOfYear].join(' ')
    : [__('ui.weekOfYear'), weekOfYear].join(' ')
}
