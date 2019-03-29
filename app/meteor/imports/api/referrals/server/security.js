import { Referrables } from '../'

export const security = () => {
  Referrables.permit(['insert', 'update']).ifHasRole('admin').allowInClientCode()
}
