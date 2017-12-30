/* eslint-env mocha */
import chai from 'chai'
import chaiDatetime from 'chai-datetime'
import moment from 'moment-timezone'
import * as t from './timeSlots'

const expect = chai.expect
chai.use(chaiDatetime)

describe('ui', () => {
  describe('appointments', () => {
    describe('timeSlots', () => {
      it('minute', () => {
        expect(t.minute('1000')).to.equal('00')
        expect(t.minute('1306')).to.equal('06')
      })

      it('isSlot', () => {
        expect(t.isSlot(5)('1000')).to.equal(true)
        expect(t.isSlot(5)('1005')).to.equal(true)
        expect(t.isSlot(5)('1006')).to.equal(false)
        expect(t.isSlot(5)('1001')).to.equal(false)
      })

      it('timeSlots', () => {
        expect(t.timeSlots(5)).to.include('T0730')
        expect(t.timeSlots(5)).to.include('T2030')
        expect(t.timeSlots(5)).not.to.include('T0731')
        expect(t.timeSlots(5)).not.to.include('T0844')
      })

      it('format', () => {
        expect(t.formatter(5)('T0730')).to.equal('7:30')
        expect(t.formatter(5)('T2030')).to.equal('20:30')
      })

      it('setTime', () => {
        const anytime = moment('2017-02-09T19:16:30.970')
        expect(
          t.setTime('T0730')(anytime.clone()).toDate()
        ).to.equalTime(moment('2017-02-09T07:30:00.000').toDate())

        expect(
          t.setTime('T2000')(anytime.clone()).toDate()
        ).to.equalTime(moment('2017-02-09T20:00:00.000').toDate())
      })
    })
  })
})
