import { Appointments } from '../'

export default () => {
  Appointments.permit(['insert', 'update', 'remove']).ifHasRole('admin').allowInClientCode()
  Appointments.permit(['insert', 'update']).ifHasRole('appointments').allowInClientCode()
}