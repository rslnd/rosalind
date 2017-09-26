import { Tags } from '../'

module.exports = ->
  Tags.permit(['insert', 'update']).ifHasRole('admin').allowInClientCode()
