moment = require 'moment'
{ TAPi18n } = require 'meteor/tap:i18n'
quarter = require './quarter'

module.exports =
  relativeTimeString: (date) ->
    date = moment(date)
    isRecent = moment().range(date, moment()).diff('week') < 1
    [
      if isRecent then date.fromNow() else date.calendar(),
      TAPi18n.__('ui.at'),
      date.format(TAPi18n.__('time.timeFormat'))
    ].join(' ')

  timeOfDay: (date) ->
    moment(date).format(TAPi18n.__('time.timeFormat'))

  dateWeekday: (date) ->
    moment(date).format(TAPi18n.__('time.dateFormatWeekday'))

  weekOfYear: (date, options = {}) ->
    weekOfYear = moment(date).format('W')
    if options?.short
      [TAPi18n.__('ui.weekOfYear_short'), weekOfYear].join(' ')
    else
      [TAPi18n.__('ui.weekOfYear'), weekOfYear].join(' ')

  specialDay: (date) ->
    now = moment()
    if now.isSame(date, 'day')
      TAPi18n.__('time.today')
    else if now.isSame(moment(date).subtract(1, 'day'), 'day')
      TAPi18n.__('time.tomorrow')
    else if now.isSame(moment(date).subtract(1, 'week'), 'day')
      TAPi18n.__('time.todayIn1Week')
    else if quarter.isNext(date)
      TAPi18n.__('time.nextQuarter')
