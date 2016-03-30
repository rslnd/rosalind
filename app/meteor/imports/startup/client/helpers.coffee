Helpers = require '/imports/util/helpers'
Time = require '/imports/util/time'

module.exports = ->
  h = Template.registerHelper
  h 'getFirstName', (context) -> Helpers.getFirstName(context)
  h 'getFullName', (context) -> Helpers.getFullName(context)
  h 'getFullNameWithTitle', (context) -> Helpers.getFullNameWithTitle(context)
  h 'getShortname', (context) -> Helpers.getShortname(context)
  h 'floor', (context) -> Helpers.floor(context)
  h 'roundToOne', (context) -> Helpers.roundToOne(context)
  h 'roundToTwo', (context) -> Helpers.roundToTwo(context)
  h 'calendar', (context) -> Helpers.calendar(context)
  h 'calendarDay', (context) -> Helpers.calendarDay(context)
  h 'weekOfYear', (context) -> Helpers.weekOfYear(context)
  h 'recent', (context) -> Helpers.recent(context)
  h 'birthday', (context) -> Helpers.birthday(context)
  h 'zerofix', (context) -> Helpers.zerofix(context)
  h 'stringify', (context) -> Helpers.stringify(context)
  h 'formatInsuranceId', (context) -> Helpers.formatInsuranceId(context)
  h 'customerName', -> Customer?.get('name')
  h 'noValue', -> Helpers.noValue()
  h 'true', -> true
  h 'false', -> false
  h 'commentCount', (context) -> Helpers.commentCount(context)
  h 'hasComments', (context) -> Helpers.hasComments(context)
  h 'humanCommentCount', (context) -> Helpers.humanCommentCount(context)
  h 'date', Time.date()
  h 'weekdays', -> Time.weekdaysArray()
