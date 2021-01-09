/* eslint-env mocha */
import { expect } from 'chai'
import { isMobileNumber } from './isMobileNumber'

describe('api', () => {
  describe('messages', () => {
    describe('isMobileNumber', () => {
      context('accepts valid number', () => {
        it('without country code', () => {
          expect(isMobileNumber('0660 1234567')).to.equal(true)
        })

        it('without leading zero', () => {
          expect(isMobileNumber('660 1234567')).to.equal(true)
        })

        it('with slash', () => {
          expect(isMobileNumber('0660/1234567')).to.equal(true)
        })

        it('with country code', () => {
          expect(isMobileNumber('+43 660 1234567')).to.equal(true)
        })
      })

      context('rejects invalid number', () => {
        it('when too short', () => {
          expect(isMobileNumber('66012')).to.not.equal(true)
        })

        it('without country code', () => {
          expect(isMobileNumber('01234567')).to.not.equal(true)
        })

        it('with other country codes', () => {
          expect(isMobileNumber('+42660123')).to.not.equal(true)
        })

        it('without leading zero', () => {
          expect(isMobileNumber('1234567')).to.not.equal(true)
        })

        it('with country code', () => {
          expect(isMobileNumber('+43 1234567')).to.not.equal(true)
        })
      })
    })
  })
})
