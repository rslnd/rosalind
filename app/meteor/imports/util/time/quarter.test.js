/* eslint-env mocha */
import chai from 'chai'
import chaiDatetime from 'chai-datetime'
import moment from 'moment-timezone'
import quarter from './quarter'

const expect = chai.expect
chai.use(chaiDatetime)

describe('util', () => {
  describe('time', () => {
    describe('quarter', () => {
      describe('start and end dates', () => {
        it('are locale agnostic', () => {
          moment.locale('de')
          expect(quarter.q1().end.toDate()).to
            .equalTime(moment().month('März').endOf('month').toDate())

          moment.locale('en')
          expect(quarter.q1().end.toDate()).to
            .equalTime(moment().month('march').endOf('month').toDate())
        })

        describe('q1', () => {
          it('starts on jan 1 (start of year)', () => {
            expect(quarter.q1().start.toDate()).to
              .equalTime(moment().startOf('year').toDate())
          })

          it('ends on march 31', () => {
            expect(quarter.q1().end.toDate()).to
              .equalTime(moment().month('mar').date(31).endOf('day').toDate())
          })
        })

        describe('q2', () => {
          it('starts on apr 1', () => {
            expect(quarter.q2().start.toDate()).to
              .equalTime(moment().month('apr').date(1).startOf('day').toDate())
          })

          it('ends on jun 30', () => {
            expect(quarter.q2().end.toDate()).to
              .equalTime(moment().month('jun').date(30).endOf('day').toDate())
          })
        })

        describe('q3', () => {
          it('starts on jul 1', () => {
            expect(quarter.q3().start.toDate()).to
              .equalTime(moment().month('jul').date(1).startOf('day').toDate())
          })

          it('ends on sep 30', () => {
            expect(quarter.q3().end.toDate()).to
              .equalTime(moment().month('sep').date(30).endOf('day').toDate())
          })
        })

        describe('q4', () => {
          it('starts on oct 1', () => {
            expect(quarter.q4().start.toDate()).to
              .equalTime(moment().month('oct').date(1).startOf('day').toDate())
          })

          it('ends on dec 31 (end of year)', () => {
            expect(quarter.q4().end.toDate()).to
              .equalTime(moment().month('dec').date(31).endOf('day').toDate())
          })
        })
      })

      describe('within', () => {
        it('is within q1', () => {
          expect(quarter.isQ1('2016-02-29')).to.equal(true)
          expect(quarter.isQ1('2016-06-12')).to.equal(false)
        })

        it('is within q2', () => {
          expect(quarter.isQ2('2016-06-12')).to.equal(true)
          expect(quarter.isQ2('2016-01-22')).to.equal(false)
        })

        it('is within q3', () => {
          expect(quarter.isQ3('2016-08-12')).to.equal(true)
          expect(quarter.isQ3('2016-12-12')).to.equal(false)
        })

        it('is within q4', () => {
          expect(quarter.isQ4('2016-11-11')).to.equal(true)
          expect(quarter.isQ4('2016-01-12')).to.equal(false)
        })
      })
      it('gets quarter number', () => {
        expect(quarter.getQ('2016-02-29')).to.equal(1)
        expect(quarter.getQ('2016-06-29')).to.equal(2)
        expect(quarter.getQ('2016-08-29')).to.equal(3)
        expect(quarter.getQ('2016-10-29')).to.equal(4)
      })
      it('quarter method returns summary', () => {
        expect(quarter.quarter('2016-06-12').year).to.eql(2016)
        expect(quarter.quarter('2016-06-12').q).to.eql(2)
      })
      context('with current quarter', () => {
        it('rejects if year differs', () => {
          expect(quarter.isSame(moment().subtract(1, 'year'))).to.equal(false)
        })

        it('checks same quarter', () => {
          expect(quarter.isSame()).to.equal(true)
          expect(quarter.isSame(moment().add(3, 'months'))).to.equal(false)
          expect(quarter.isSame(moment().subtract(3, 'months'))).to.equal(false)
        })

        it('checks next quarter', () => {
          expect(quarter.isNext()).to.equal(false)
          expect(quarter.isNext(moment().add(3, 'months'))).to.equal(true)
          expect(quarter.isNext(moment().add(6, 'months'))).to.equal(false)
          expect(quarter.isNext(moment().subtract(3, 'months'))).to.equal(false)
        })

        it('checks previous quarter', () => {
          expect(quarter.isPrevious()).to.equal(false)
          expect(quarter.isPrevious(moment().add(3, 'months'))).to.equal(false)
          expect(quarter.isPrevious(moment().subtract(6, 'months'))).to.equal(false)
          expect(quarter.isPrevious(moment().subtract(3, 'months'))).to.equal(true)
        })
      })
      context('with other quarter', () => {
        it('checks same quarter', () => {
          expect(quarter.isSame(moment().startOf('year'), moment().month(1))).to.equal(true)
          expect(quarter.isSame(moment().endOf('year'), moment().month(1))).to.equal(false)
        })

        it('checks next quarter', () => {
          expect(quarter.isNext(moment().month(3), moment().startOf('year'))).to.equal(true)
          expect(quarter.isNext(moment().month(1), moment().startOf('year'))).to.equal(false)
        })

        it('checks previous quarter', () => {
          expect(quarter.isPrevious(moment().month(4), moment().month(7))).to.equal(true)
          expect(quarter.isPrevious(moment().month(1), moment().month(11))).to.equal(false)
        })

        context('wraps years', () => {
          it('rejects same quarter', () => {
            expect(quarter.isSame(moment().startOf('year'), moment().subtract(1, 'year').startOf('year'))).to.equal(false)
          })

          it('checks next quarter', () => {
            expect(quarter.isNext(moment().add(1, 'year').startOf('year'), moment().endOf('year').subtract(1, 'day'))).to.equal(true)
          })

          it('checks previous quarter', () => {
            expect(quarter.isPrevious(moment().startOf('year').subtract(1, 'week'), moment().startOf('year').add(1, 'day'))).to.equal(true)
          })

          context('more than a year difference', () => {
            it('rejects next quarter', () => {
              expect(quarter.isNext(moment().add(2, 'year').startOf('year'), moment().endOf('year').subtract(1, 'day'))).to.equal(false)
            })

            it('rejects previous quarter', () => {
              expect(quarter.isPrevious(moment().startOf('year').subtract(2, 'year'), moment().startOf('year').add(1, 'day'))).to.equal(false)
            })
          })
        })
      })
    })
  })
})
