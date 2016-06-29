{ SubsManager } = require 'meteor/meteorhacks:subs-manager'
{ Roles } = require 'meteor/alanning:roles'
{ Users } = require 'api/users'
Jobs = require './collection'

module.exports = ->
  TabularJobCollections
    import:
      sub: new SubsManager()
      collection: Jobs.import
      allow: (userId) ->
        user = Users.findOne(userId)
        user and Roles.userIsInRole(user, 'admin')
