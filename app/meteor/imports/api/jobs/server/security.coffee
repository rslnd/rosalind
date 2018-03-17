import { Meteor } from 'meteor/meteor'
import { Roles } from 'meteor/alanning:roles'
import { Users } from '../../users'

module.exports = ->
  TabularJobCollections.authenticateMethods = (userId) ->
    user = Users.findOne(userId)
    user and Roles.userIsInRole(user, 'admin')
