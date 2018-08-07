import { Tags } from '../'

export default () => {
  Tags.permit(['insert', 'update']).ifHasRole('admin').allowInClientCode()
}