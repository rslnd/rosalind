{ Appointments } = require 'api/appointments'

module.exports = ->
  Appointments.permit(['insert', 'update', 'remove']).ifHasRole('admin').apply()
  Appointments.permit(['insert', 'update']).ifHasRole('appointments').apply()
