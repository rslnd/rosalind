import { Appointments } from '../'

module.exports = ->
  Appointments.permit(['insert', 'update', 'remove']).ifHasRole('admin').allowInClientCode()
  Appointments.permit(['insert', 'update']).ifHasRole('appointments').allowInClientCode()
