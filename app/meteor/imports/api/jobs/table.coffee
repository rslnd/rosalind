{ SubsManager } = require 'meteor/meteorhacks:subs-manager'
{ Roles } = require 'meteor/alanning:roles'
{ Users } = require '/imports/api/users'
{ Import } = require './collection'

module.exports = ->
  TabularJobCollections
    import:
      sub: new SubsManager()
      collection: Import
      allow: (userId) ->
        user = Users.findOne(userId)
        user and Roles.userIsInRole(user, 'admin')
