import momentTz from 'moment-timezone'
import { extendMoment } from 'moment-range'
import { __ } from '../../i18n'
import quarter from './quarter'

const moment = extendMoment(momentTz)

export const relativeTimeString = d => {
  const date = moment(date)
  const isRecent = moment.range(date, moment()).diff('week') < 1

  return [
    isRecent ? date.fromNow() : date.calendar(),
    __('ui.at'),
    date.format(__('time.timeFormat'))
  ].join(' ')
}

export const weekOfYear = (date, options = {}) => {
  const weekOfYear = moment(date).format('W')
  return options.short
    ? [__('ui.weekOfYear_short'), weekOfYear].join(' ')
    : [__('ui.weekOfYear'), weekOfYear].join(' ')
}
