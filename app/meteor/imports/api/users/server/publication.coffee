import { Meteor } from 'meteor/meteor'
import { Users } from '../'
import { isTrustedNetwork } from '../../customer/server/isTrustedNetwork'

module.exports = ->
  Meteor.publish 'users', ->
    return unless @userId or (@connection and isTrustedNetwork(@connection.clientAddress))

    Users.find {}, fields:
      'username': 1
      'groupId': 1
      'firstName': 1
      'lastName': 1
      'titlePrepend': 1
      'titleAppend': 1
      'gender': 1
      'birthday': 1
      'group': 1
      'employee': 1
      'roles': 1
      'settings': 1
