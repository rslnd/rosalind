import { Meteor } from 'meteor/meteor'
import { Tags } from '../'
import { isTrustedNetwork } from '../../customer/server/isTrustedNetwork'

module.exports = ->
  Meteor.publish 'tags', ->
    return unless @userId or (@connection and isTrustedNetwork(@connection.clientAddress))

    Tags.find({}, { removed: true })
