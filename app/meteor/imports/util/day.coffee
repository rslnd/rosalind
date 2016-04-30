moment = require 'moment'
clone = require 'lodash/clone'

module.exports =
  dateToDay: (date) ->
    return unless date
    date = moment(date)
    year = date.year()
    month = date.month() + 1
    day = date.date() # no typo
    { year, month, day }

  dayToDate: (day) ->
    day = @zeroIndexMonth(day)
    moment(day).toDate()

  zeroIndexMonth: (day) ->
    return unless day
    day = clone(day)
    if day?.month and not day?.zeroIndexMonth
      day.month -= 1
      day.zeroIndexMonth = true
    return day
