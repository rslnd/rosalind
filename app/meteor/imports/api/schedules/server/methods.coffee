import { Meteor } from 'meteor/meteor'
import { Jobs } from '../../jobs'

module.exports = ->
  Meteor.methods
    'schedules/updateCache': (date) ->
      return unless Meteor.userId()

      check(date, Match.Optional(Date))

      new Job(Jobs.cache, 'schedules', { date }).save()
