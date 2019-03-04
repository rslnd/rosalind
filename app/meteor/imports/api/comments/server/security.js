import { Comments } from '../'

export default () => {
  Comments.permit(['insert', 'update', 'remove']).ifHasRole('admin').allowInClientCode()
  Comments.permit(['insert']).ifLoggedIn().allowInClientCode()
  Comments.permit(['update']).ifLoggedIn().exceptProps(['createdBy', 'createdAt', 'docId']).allowInClientCode()
}
