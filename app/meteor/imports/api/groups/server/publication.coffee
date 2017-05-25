import { Meteor } from 'meteor/meteor'
import { Groups } from '../'

module.exports = ->
  Meteor.publish 'groups', ->
    Groups.find({}) if @userId
