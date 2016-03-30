{ Groups } = require '/imports/api/groups'

module.exports = ->
  Groups.permit(['insert', 'update']).ifHasRole('admin').apply()
