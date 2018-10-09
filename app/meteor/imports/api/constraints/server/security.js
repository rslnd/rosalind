import { Constraints } from '../'

export default () => {
  Constraints.permit(['insert', 'update']).ifHasRole('admin').allowInClientCode()
}
