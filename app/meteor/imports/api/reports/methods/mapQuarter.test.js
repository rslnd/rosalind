/* eslint-env mocha */
import { expect } from 'chai'
import { mapDays } from './mapQuarter'

describe('reports', () => {
  describe('mapQuarter', () => {
    it('calculates length of quarter q4-18 ', () => {
      const reports = []
      const day = { year: 2018, month: 10, day: 1 }
      const overrideSchedules = []
      const holidays = [
        { day: { year: 2018, month: 10, day: 26 } },
        { day: { year: 2018, month: 11, day: 1 } },
        { day: { year: 2018, month: 12, day: 8 } },
        { day: { year: 2018, month: 12, day: 24 } },
        { day: { year: 2018, month: 12, day: 25 } },
        { day: { year: 2018, month: 12, day: 26 } },
        { day: { year: 2018, month: 12, day: 27 } },
        { day: { year: 2018, month: 12, day: 28 } },
        { day: { year: 2018, month: 12, day: 31 } }
      ]

      expect(mapDays({ reports, day, overrideSchedules, holidays })).to.eql({
        available: 58,
        passed: 0,
        future: 58
      })
    })
  })
})
