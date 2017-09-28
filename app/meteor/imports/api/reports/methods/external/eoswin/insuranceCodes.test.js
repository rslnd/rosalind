/* eslint-env mocha */
import chai from 'chai'
import { isNew, isSurgery, isCautery, isOther } from './insuranceCodes'

const expect = chai.expect

describe('api', function () {
  describe('reports', function () {
    describe('insurance codes', function () {
      it('new', () => {
        expect(isNew(['540'])).to.equal(true)
        expect(isNew(['E1'])).to.equal(true)
        expect(isNew(['E12'])).to.equal(true)
      })

      it('surgery', () => {
        expect(isSurgery(['502'])).to.equal(true)
        expect(isSurgery(['O8H'])).to.equal(true)
        expect(isSurgery(['O9H'])).to.equal(true)
        expect(isSurgery(['O10H'])).to.equal(true)
        expect(isSurgery(['O8P'])).to.equal(true)
      })

      it('cautery', () => {
        expect(isCautery(['503'])).to.equal(true)
        expect(isCautery(['504'])).to.equal(true)
        expect(isCautery(['506'])).to.equal(true)
        expect(isCautery(['520'])).to.equal(true)
        expect(isCautery(['534'])).to.equal(true)
        expect(isCautery(['26F'])).to.equal(true)
        expect(isCautery(['26D'])).to.equal(true)
        expect(isCautery(['38M'])).to.equal(true)
        expect(isCautery(['O16A'])).to.equal(true)
      })

      it('other', () => {
        expect(isOther(['941'])).to.equal(true)
        expect(isOther(['942'])).to.equal(true)
        expect(isOther(['RII'])).to.equal(true)
        expect(isOther(['542'])).to.equal(true)
        expect(isOther(['BF'])).to.equal(true)
        expect(isOther(['E2'])).to.equal(true)
        expect(isOther(['8D'])).to.equal(true)
        expect(isOther(['8E'])).to.equal(true)
        expect(isOther(['8F'])).to.equal(true)
      })
    })
  })
})
