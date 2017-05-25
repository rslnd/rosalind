/* eslint-env mocha */
import { expect } from 'chai'
import factory from './isOpen'

describe('schedules', () => {
  describe('isOpen', () => {
    let isBusinessHoursOverride = false
    let isHoliday = false
    let isRegularBusinessHours = false
    let isOpen = null

    before(() => {
      const Schedules = {
        methods: {
          isBusinessHoursOverride: () => isBusinessHoursOverride,
          isHoliday: () => isHoliday,
          isRegularBusinessHours: () => isRegularBusinessHours
        }
      }

      isOpen = factory({ Schedules })
    })

    it('returns false if nothing is defined', () => {
      expect(isOpen.isOpen()).to.equal(false)
    })

    it('returns true if regular business hours are defined', () => {
      isRegularBusinessHours = true
      expect(isOpen.isOpen()).to.equal(true)
    })

    it('returns false if regular business hours are defined but it is a holiday', () => {
      isRegularBusinessHours = true
      isHoliday = true
      expect(isOpen.isOpen()).to.equal(false)
    })

    it('returns true it is a holiday but override business hours are defined', () => {
      isBusinessHoursOverride = true
      isHoliday = true
      expect(isOpen.isOpen()).to.equal(true)
    })
  })
})
