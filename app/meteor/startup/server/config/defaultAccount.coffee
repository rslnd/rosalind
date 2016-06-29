random = require 'meteor/random'
{ Users } = require 'api/users'
{ Roles } = require 'meteor/alanning:roles'

module.exports = ->
  return if Users.find({}).count() > 0

  defaultAccount =
    username: 'admin'
    password: Random.id()
    email: 'admin@example.com'
    profile:
      firstName: 'Admin'


  console.warn("[Server] Creating first user '#{defaultAccount.username}' with password '#{defaultAccount.password}'")
  id = Accounts.createUser(defaultAccount)
  Roles.addUsersToRoles(id, ['admin'], Roles.GLOBAL_GROUP)
