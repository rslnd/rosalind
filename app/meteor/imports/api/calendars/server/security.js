import { Calendars } from '../'

export const security = () => {
  Calendars.permit(['insert', 'update']).ifHasRole('admin').allowInClientCode()
}
