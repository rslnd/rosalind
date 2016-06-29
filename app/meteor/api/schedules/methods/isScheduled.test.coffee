moment = require 'moment'
isScheduled = require './isScheduled'

describe 'schedules', ->
  before ->
    Schedules =
      methods:
        isOpen: (time) -> time isnt 0
      findOne: (q) ->
        return true if q.userId is 'notAvailableUserByOverride' and
          q.available is false and
          q.type is 'override'

        return true if q.userId is 'availableUserByOverride' and
          q.available is true and
          q.type is 'override'

        if q.type is 'default'
          return { isWithin: -> true } if q.userId is 'scheduledUserByDefault'
          return { isWithin: -> false } if q.userId is 'notScheduledUserByDefault'

        return null

    Users =
      findOne: ({ _id }) -> _id isnt 'doesNotExist'
      find: ->
        fetch: ->
          [ { _id: 'scheduledUserByDefault' }, { _id: 'notAvailableUser' } ]

    isScheduled = isScheduled({ Schedules, Users })

  describe 'getScheduled', ->
    it 'filters out unavailable users', ->
      expect(isScheduled.getScheduled(moment())).to.eql([ { _id: 'scheduledUserByDefault' }])

  describe 'isScheduled', ->
    it 'returns false if user does not exist', ->
      expect(isScheduled.isScheduled(null, 'doesNotExist')).to.equal(false)

    it 'returns false if time is outside business hours', ->
      expect(isScheduled.isScheduled(0, 'validUserId')).to.equal(false)

    it 'returns false if user is not available by override', ->
      expect(isScheduled.isScheduled(moment(), 'notAvailableUserByOverride')).to.equal(false)

    it 'returns true if user is available by override', ->
      expect(isScheduled.isScheduled(moment(), 'availableUserByOverride')).to.equal(true)

    it 'returns true if user is scheduled by default', ->
      expect(isScheduled.isScheduled(moment(), 'scheduledUserByDefault')).to.equal(true)

    it 'returns false if user is not scheduled by default', ->
      expect(isScheduled.isScheduled(moment(), 'notScheduledUserByDefault')).to.equal(false)
