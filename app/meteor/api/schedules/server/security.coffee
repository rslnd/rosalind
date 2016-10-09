{ Schedules } = require 'api/schedules'

module.exports = ->
  Schedules.permit(['insert', 'update']).ifHasRole('admin').apply()
  Schedules.permit(['insert', 'update']).ifHasRole('schedules-edit').apply()
