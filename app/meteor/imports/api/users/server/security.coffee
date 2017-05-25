import { Users } from '../'

module.exports = ->
  Users.permit(['insert', 'update']).ifHasRole('admin').apply()
