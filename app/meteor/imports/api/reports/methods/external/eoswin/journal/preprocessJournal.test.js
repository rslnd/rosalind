/* eslint-env mocha */
import chai from 'chai'
import chaiDatetime from 'chai-datetime'
import { JOURNAL } from './journal.fixture'
import {
  preprocessJournal,
  parenthesesToArray,
  incrementIf,
  total
} from './preprocessJournal'

const expect = chai.expect
chai.use(chaiDatetime)

describe('api', () => {
  describe('reports', () => {
    describe('eoswinPreprocessJournal', () => {
      const result = preprocessJournal(JOURNAL)

      it('reduces journal to array', () => {
        expect(result).to.be.an('array')
      })

      it('returns an array of objects with certain keys', () => {
        expect(result[0]).to.have.keys([
          'admitted',
          'surgery',
          'new',
          'cautery',
          'missingReimbursement',
          'assignee'
        ])
      })

      it('counts totals per assignee', () => {
        expect(result[0].admitted).to.be.a('number')
        expect(result[0].new).to.be.a('number')
        expect(result[0].surgery).to.be.a('number')
        expect(result[0].cautery).to.be.a('number')
        expect(result[0].missingReimbursement).to.be.a('number')
      })

      it('total new <= total admitted', () => {
        expect(total('new')(result))
          .to.be.lte(total('admitted')(result))
      })

      it('counts codes', () => {
        expect(total('admitted')(result)).to.equal(3)
        expect(total('missingReimbursement')(result)).to.equal(1)
        expect(total('new')(result)).to.equal(2)
      })
    })

    describe('incrementIf', () => {
      expect(incrementIf(true)(NaN)).to.eql(1)
      expect(incrementIf(true)(1)).to.eql(2)
      expect(incrementIf(true)(2)).to.eql(3)

      expect(incrementIf(false)(2)).to.eql(2)
      expect(incrementIf(false)(undefined)).to.eql(0)
      expect(incrementIf(false)(NaN)).to.eql(0)
    })

    describe('parenthesesToArray', () => {
      expect(parenthesesToArray('[ORD] [ABC] [123]')).to.eql(['ORD', 'ABC', '123'])
    })
  })
})
