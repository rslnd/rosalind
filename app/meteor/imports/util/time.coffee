import clone from 'lodash/clone'
import moment from 'moment-timezone'
import { __ } from '../i18n'

module.exports =
  startOfToday: ->
    moment().startOf('day').toDate()

  endOfToday: ->
    moment().endOf('day').toDate()

  # DEPRECATED: use /util/day instead
  dateToDay: (date) ->
    return unless date
    date = moment(date)
    year = date.year()
    month = date.month() + 1
    day = date.date() # no typo
    date = date.startOf('day').toDate()
    { year, month, day, date }

  # DEPRECATED: use /util/day instead
  zeroIndexMonth: (day) ->
    return unless day
    day = clone(day)
    if day?.month and not day?.zeroIndexMonth
      day.month -= 1
      day.zeroIndexMonth = true
    return day

  # DEPRECATED: use /util/day instead
  dayToDate: (day) ->
    day = @zeroIndexMonth(day)
    moment(day).toDate()

  dayToday: (day) ->
    return unless day?.day and day?.month
    day = @zeroIndexMonth(day)
    today = moment()
    return today.date() is day.day and
      today.month() is day.month

  toWeekday: (time) ->
    moment(time).locale('en').format('ddd').toLowerCase()

  weekdays: ->
    mon: { label: __('time.monday'), offset: 0 }
    tue: { label: __('time.tuesday'), offset: 1 }
    wed: { label: __('time.wednesday'), offset: 2 }
    thu: { label: __('time.thursday'), offset: 3 }
    fri: { label: __('time.friday'), offset: 4 }
    sat: { label: __('time.saturday'), offset: 5 }

  weekdaysArray: ->
    _.map @weekdays(), (v, k) ->
      v.short = k
      return v

  time: (time) ->
    moment(time).format(__('time.timeFormat'))

  date: (time, options = {}) ->
    if options.weekday
      moment(time).format(__('time.dateFormatWeekday'))
    else
      moment(time).format(__('time.dateFormat'))

  hm: (float) ->
    h = Math.floor(float)
    m = (float - h) * 60
    { h, m }

  format: (format, t) ->
    s = ''
    switch format
      when 'h[h]( m[m])'
        s += t.h + 'h'
        s += ' ' + Math.round(t.m) + 'm' if (t?.m > 0)
      when 'H:mm'
        s = moment().hour(t.h or 0).minute(t.m or 0).format('H:mm')
      else
        s = JSON.stringify(data)
    s
