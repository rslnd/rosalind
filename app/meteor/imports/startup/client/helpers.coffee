Helpers = require '/imports/util/helpers'

module.exports = ->
  Template.registerHelper 'getFirstName', (context) -> Helpers.getFirstName(context)
  Template.registerHelper 'getFullName', (context) -> Helpers.getFullName(context)
  Template.registerHelper 'getFullNameWithTitle', (context) -> Helpers.getFullNameWithTitle(context)
  Template.registerHelper 'getShortname', (context) -> Helpers.getShortname(context)
  Template.registerHelper 'floor', (context) -> Helpers.floor(context)
  Template.registerHelper 'roundToOne', (context) -> Helpers.roundToOne(context)
  Template.registerHelper 'roundToTwo', (context) -> Helpers.roundToTwo(context)
  Template.registerHelper 'calendar', (context) -> Helpers.calendar(context)
  Template.registerHelper 'calendarDay', (context) -> Helpers.calendarDay(context)
  Template.registerHelper 'weekOfYear', (context) -> Helpers.weekOfYear(context)
  Template.registerHelper 'recent', (context) -> Helpers.recent(context)
  Template.registerHelper 'birthday', (context) -> Helpers.birthday(context)
  Template.registerHelper 'zerofix', (context) -> Helpers.zerofix(context)
  Template.registerHelper 'stringify', (context) -> Helpers.stringify(context)
  Template.registerHelper 'formatInsuranceId', (context) -> Helpers.formatInsuranceId(context)
  Template.registerHelper 'customerName', -> Customer?.get('name')
  Template.registerHelper 'noValue', -> Helpers.noValue()
  Template.registerHelper 'true', -> true
  Template.registerHelper 'false', -> false
  Template.registerHelper 'commentCount', (context) -> Helpers.commentCount(context)
  Template.registerHelper 'hasComments', (context) -> Helpers.hasComments(context)
  Template.registerHelper 'humanCommentCount', (context) -> Helpers.humanCommentCount(context)
