import momentTz from 'moment-timezone'
import { extendMoment } from 'moment-range'
import { __ } from '../../i18n'
moment = extendMoment(momentTz)
import quarter from './quarter'

module.exports =
  relativeTimeString: (date) ->
    date = moment(date)
    isRecent = moment.range(date, moment()).diff('week') < 1
    [
      if isRecent then date.fromNow() else date.calendar(),
      __('ui.at'),
      date.format(__('time.timeFormat'))
    ].join(' ')

  timeOfDay: (date) ->
    moment(date).format(__('time.timeFormat'))

  dateWeekday: (date) ->
    moment(date).format(__('time.dateFormatWeekday'))

  weekOfYear: (date, options = {}) ->
    weekOfYear = moment(date).format('W')
    if options?.short
      [__('ui.weekOfYear_short'), weekOfYear].join(' ')
    else
      [__('ui.weekOfYear'), weekOfYear].join(' ')

  specialDay: (date) ->
    now = moment()
    if now.isSame(date, 'day')
      __('time.today')
    else if now.isSame(moment(date).subtract(1, 'day'), 'day')
      __('time.tomorrow')
    else if now.isSame(moment(date).subtract(1, 'week'), 'day')
      __('time.todayIn1Week')
    else if quarter.isNext(date)
      __('time.nextQuarter')
