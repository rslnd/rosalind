/* eslint-env mocha */
import { expect } from 'chai'
import momentTz from 'moment-timezone'
import { extendMoment } from 'moment-range'
import { calculateScheduledHours, splitCutoff } from './getScheduledHours'

const moment = extendMoment(momentTz)
const tz = 'Europe/Vienna'

describe('schedules', () => {
  const overrideSchedules = [
    {
      start: moment.tz('2017-05-06T09:45:00.000', tz),
      end: moment.tz('2017-05-06T18:59:59.000', tz),
      type: 'override'
    },
    {
      start: moment.tz('2017-05-06T05:30:00.000', tz),
      end: moment.tz('2017-05-06T05:59:59.000', tz),
      type: 'override'
    }
  ]

  describe('splitCutoff', () => {
    it('splits spanning schedules at cutoff', () => {
      const split = splitCutoff({ overrideSchedules })
      expect(moment(split[0].start).toDate())
        .to.equalTime(overrideSchedules[0].start.toDate())

      expect(moment(split[0].end).toDate())
        .to.equalTime(moment.tz('2017-05-06T13:30:00.000', tz).toDate())

      expect(moment(split[1].start).toDate())
        .to.equalTime(moment.tz('2017-05-06T13:30:00.000', tz).toDate())

      expect(moment(split[1].end).toDate())
        .to.equalTime(overrideSchedules[0].end.toDate())
    })

    it('keeps non-spanning schedules intact', () => {
      const split = splitCutoff({ overrideSchedules })
      expect(split[2]).to.eql(overrideSchedules[1])
    })
  })

  describe('getScheduledHours', () => {
    it('calculates hours scheduled ', () => {
      expect(calculateScheduledHours({ overrideSchedules })).to.equal(3.75) // 3h 45min
    })
  })
})
