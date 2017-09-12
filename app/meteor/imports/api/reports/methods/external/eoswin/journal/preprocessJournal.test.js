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
import { parseCsv } from './processJournal'

const expect = chai.expect
chai.use(chaiDatetime)

describe('api', () => {
  describe('reports', () => {
    describe('eoswinPreprocessJournal', () => {
      const result = preprocessJournal(parseCsv(JOURNAL))

      it('reduces journal to array', () => {
        expect(result).to.be.an('object')
      })

      it('returns an objects with assignee ids as keys', () => {
        expect(result).to.have.keys('14', '1')
      })

      it('counts totals per assignee', () => {
        expect(result['14'].total).to.be.a('number')
        expect(result['14'].new).to.be.a('number')
        expect(result['14'].surgery).to.be.a('number')
        expect(result['14'].cautery).to.be.a('number')
        expect(result['14'].missingReimbursement).to.be.a('number')
      })

      it('total new <= total total', () => {
        expect(total('new')(result))
          .to.be.lte(total('total')(result))
      })

      it('counts codes', () => {
        expect(total('total')(result)).to.equal(3)
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
