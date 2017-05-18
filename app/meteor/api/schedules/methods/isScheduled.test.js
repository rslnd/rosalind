/* eslint-env mocha */
import { expect } from 'chai'
import moment from 'moment-timezone'
import factory from './isScheduled'

describe('schedules', () => {
  let isScheduled = null

  before(() => {
    const Schedules = {
      methods: {
        isOpen: (time) => { return time !== 0 }
      },
      findOne: (q) => {
        if (q.userId === 'notAvailableUserByOverride' &&
        q.available === false &&
        q.type === 'override') {
          return true
        }

        if (q.userId === 'availableUserByOverride' &&
        q.available === true &&
        q.type === 'override') {
          return true
        }

        if (q.type === 'default') {
          if (q.userId === 'scheduledUserByDefault') {
            return { isWithin: () => true }
          }
          if (q.userId === 'notScheduledUserByDefault') {
            return { isWithin: () => false }
          }
        }

        return null
      }
    }

    const Users = {
      findOne: ({ _id }) => { return (_id !== 'doesNotExist') },
      find: () => {
        return {
          fetch: () => {
            return [ { _id: 'scheduledUserByDefault' }, { _id: 'notAvailableUser' } ]
          }
        }
      }
    }

    isScheduled = factory({ Schedules, Users })
  })

  describe('getScheduled', () => {
    it('filters out unavailable users', () => {
      expect(isScheduled.getScheduled(moment())).to.eql([{ _id: 'scheduledUserByDefault' }])
    })
  })

  describe('isScheduled', () => {
    it('returns false if user does not exist', () => {
      expect(isScheduled.isScheduled(null, 'doesNotExist')).to.equal(false)
    })

    it('returns false if time is outside business hours', () => {
      expect(isScheduled.isScheduled(0, 'validUserId')).to.equal(false)
    })

    it('returns false if user is not available by override', () => {
      expect(isScheduled.isScheduled(moment(), 'notAvailableUserByOverride')).to.equal(false)
    })

    it('returns true if user is available by override', () => {
      expect(isScheduled.isScheduled(moment(), 'availableUserByOverride')).to.equal(true)
    })

    it('returns true if user is scheduled by default', () => {
      expect(isScheduled.isScheduled(moment(), 'scheduledUserByDefault')).to.equal(true)
    })

    it('returns false if user is not scheduled by default', () => {
      expect(isScheduled.isScheduled(moment(), 'notScheduledUserByDefault')).to.equal(false)
    })
  })
})
