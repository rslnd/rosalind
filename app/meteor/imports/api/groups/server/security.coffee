import { Groups } from '../'

module.exports = ->
  Groups.permit(['insert', 'update']).ifHasRole('admin').apply()
