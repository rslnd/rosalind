import { Users } from '../'

export default () => {
  Users.permit(['update']).ifHasRole('admin').allowInClientCode()
}
