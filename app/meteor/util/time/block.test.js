/* eslint-env mocha */
import chai from 'chai'
import chaiDatetime from 'chai-datetime'
import moment from 'moment-timezone'
import { block } from './block'

const expect = chai.expect
chai.use(chaiDatetime)

describe('util', () => {
  describe('time', () => {
    describe('block', () => {
      const exactStart = moment().hour(7).minute(20).second(0).milliseconds(0)
      const exactEnd = moment().hour(7).minute(30).second(0).milliseconds(0)

      const justAfterStart = moment().hour(7).minute(20).second(0).milliseconds(1)
      const somewhereInbetween = moment().hour(7).minute(23).second(4)
      const justBeforeEnd = moment().hour(7).minute(29).second(59).milliseconds(999)
      const justAfterEnd = moment().hour(7).minute(30).second(0).milliseconds(1)

      context('when argument is exactly start of block', () => {
        it('start time stays the same', () => {
          expect(block(exactStart).start.toDate()).to.equalTime(exactStart.toDate())
        })

        it('end time is exact', () => {
          expect(block(exactStart).end.toDate()).to.equalTime(exactEnd.toDate())
        })
      })

      context('when argument is just after start of block', () => {
        it('start time is floored', () => {
          expect(block(justAfterStart).start.toDate()).to.equalTime(exactStart.toDate())
        })

        it('end time is exact', () => {
          expect(block(justAfterStart).end.toDate()).to.equalTime(exactEnd.toDate())
        })
      })

      context('when argument is somewhere in between', () => {
        it('start time rounds down', () => {
          expect(block(somewhereInbetween).start.toDate()).to.equalTime(exactStart.toDate())
        })

        it('end time is exact', () => {
          expect(block(somewhereInbetween).end.toDate()).to.equalTime(exactEnd.toDate())
        })
      })

      context('when argument is just before end', () => {
        it('start time rounds down', () => {
          expect(block(justBeforeEnd).start.toDate()).to.equalTime(exactStart.toDate())
        })

        it('end time is exact', () => {
          expect(block(justBeforeEnd).end.toDate()).to.equalTime(exactEnd.toDate())
        })
      })

      context('when argument is just after end', () => {
        it('start time rounds to next block', () => {
          expect(block(justAfterEnd).start.toDate()).to.equalTime(exactStart.add(10, 'minutes').toDate())
        })

        it('end time is exact of next block', () => {
          expect(block(justAfterEnd).end.toDate()).to.equalTime(exactEnd.add(10, 'minutes').toDate())
        })
      })
    })
  })
})
