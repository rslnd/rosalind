{ Users } = require '/imports/api/users'

module.exports = ->
  Users.permit(['insert', 'update']).ifHasRole('admin').apply()
