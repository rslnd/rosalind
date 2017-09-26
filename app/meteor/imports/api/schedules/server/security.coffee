import { Schedules } from '../'

module.exports = ->
  Schedules.permit(['insert', 'update']).ifHasRole('admin').allowInClientCode()
  Schedules.permit(['insert', 'update']).ifHasRole('schedules-edit').allowInClientCode()
