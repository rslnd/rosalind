{ Users } = require 'api/users'

module.exports = ->
  Users.permit(['insert', 'update']).ifHasRole('admin').apply()
