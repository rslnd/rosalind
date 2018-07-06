/* eslint-env mocha */
import { expect } from 'chai'
import moment from 'moment-timezone'
import { transformDefaultsToOverrides, applyHM } from './transformDefaultsToOverrides'

const c1 = 'cal1'
const u1 = 'u1'
const from = moment().startOf('day')
const to = moment(from).clone().add(14, 'days')
const hm1Start = { h: 8, m: 30 }
const hm1End = { h: 14 }
const hm2Start = { h: 15 }
const hm2End = { h: 18, m: 45 }
const hm3Start = { h: 19 }
const hm3End = { h: 21 }
const ds1 =
  { calendarId: c1, userId: u1, from: hm1Start, to: hm1End, weekday: 'mon', available: true }
const ds2 =
  { calendarId: c1, userId: u1, from: hm2Start, to: hm2End, weekday: 'mon', available: true }
const ds3 =
  { calendarId: c1, userId: u1, from: hm3Start, to: hm3End, weekday: 'mon', available: true }

describe('schedules', () => {
  describe('transformDefaultsToOverrides', () => {
    it('applyHM', () => {
      const day = {
        year: 2018,
        month: 3,
        day: 5
      }

      const hm = {
        h: 13
      }

      const m = d =>
        moment.tz(d, 'Europe/Vienna')

      expect(m(applyHM(day, hm)).hours()).to.eql(13)
      expect(m(applyHM({...day, month: 8}, hm)).hours()).to.eql(13)
      expect(m(applyHM(day, hm)).minutes()).to.eql(0)
      expect(m(applyHM(day, hm)).seconds()).to.eql(0)
    })

    const overridesOnly = s => s.filter(o => o.type === 'override')

    it('expands one available schedule', () => {
      const result = transformDefaultsToOverrides({ defaultSchedules: [ds1], from, to })
      expect(overridesOnly(result).length).to.eql(4)
    })

    it('expands two available schedules', () => {
      const result = transformDefaultsToOverrides({ defaultSchedules: [ds1, ds2], from, to })
      expect(overridesOnly(result).length).to.eql(6)
    })

    it('expands three available schedules', () => {
      const result = transformDefaultsToOverrides({ defaultSchedules: [ds1, ds2, ds3], from, to })
      expect(overridesOnly(result).length).to.eql(8)
    })
  })
})
