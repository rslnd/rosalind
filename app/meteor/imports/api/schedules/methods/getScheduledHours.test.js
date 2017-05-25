/* eslint-env mocha */
import { expect } from 'chai'
import momentTz from 'moment-timezone'
import { extendMoment } from 'moment-range'
import { calculateScheduledHours } from './getScheduledHours'

const moment = extendMoment(momentTz)

describe('schedules', () => {
  describe('getScheduledHours', () => {
    const overrideSchedules = [
      {
        start: moment('2017-05-06T09:45:00.000Z'),
        end: moment('2017-05-06T18:59:59.000Z'),
        type: 'override'
      },
      {
        start: moment('2017-05-06T05:30:00.000Z'),
        end: moment('2017-05-06T05:59:59.000Z'),
        type: 'override'
      }
    ]

    it('calculates hours scheduled ', () => {
      expect(calculateScheduledHours({ overrideSchedules })).to.equal(3.75) // 3h 45min
    })
  })
})
