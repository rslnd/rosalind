{ Tags } = require '/imports/api/tags'

module.exports = ->
  Tags.permit(['insert', 'update']).ifHasRole('admin').apply()
