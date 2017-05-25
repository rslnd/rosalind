import { Meteor } from 'meteor/meteor'
import { Tags } from '../'

module.exports = ->
  Meteor.publish 'tags', ->
    Tags.find({}) if @userId
