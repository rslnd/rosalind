import { Groups } from '../'

export default () => {
  Groups.permit(['insert', 'update']).ifHasRole('admin').allowInClientCode()
}