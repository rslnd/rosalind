moment = require 'moment'
{ TAPi18n } = require 'meteor/tap:i18n'

module.exports =
  relativeTimeString: (date) ->
    date = moment(date)
    isRecent = moment().range(date, moment()).diff('hours') < 4
    [
      if isRecent then date.fromNow() else date.calendar(),
      TAPi18n.__('ui.at'),
      date.format(TAPi18n.__('time.timeFormat'))
    ].join(' ')

  timeOfDay: (date) ->
    moment(date).format(TAPi18n.__('time.timeFormat'))

  dateWeekday: (date) ->
    moment(date).format(TAPi18n.__('time.dateFormatWeekday'))
