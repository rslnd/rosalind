{ Schedules } = require 'api/schedules'

module.exports = ->
  Schedules.permit(['insert', 'update', 'remove']).ifHasRole('admin').apply()
  Schedules.permit(['insert', 'update', 'remove']).apply()
