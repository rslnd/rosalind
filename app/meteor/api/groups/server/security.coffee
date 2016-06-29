{ Groups } = require 'api/groups'

module.exports = ->
  Groups.permit(['insert', 'update']).ifHasRole('admin').apply()
