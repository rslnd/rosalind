import { Schedules } from '../'

export default () => {
  Schedules.permit(['insert', 'update']).ifHasRole('admin').allowInClientCode()
  Schedules.permit(['insert', 'update']).ifHasRole('schedules-edit').allowInClientCode()
}