/* eslint-env mocha */
import { expect } from 'chai'
import { stripLeadingZeroes, normalizePhoneNumber } from './normalizePhoneNumber'

describe('api', () => {
  describe('messages', () => {
    describe('normalizePhoneNumber', () => {
      const normalized = '436601234567'

      it('without country code', () => {
        expect(normalizePhoneNumber('0660 1234567')).to.equal(normalized)
      })

      it('with other characters', () => {
        expect(normalizePhoneNumber(' -() -  / 0 / 6 -60/12.3-45 --/ (6)7')).to.equal(normalized)
      })

      it('without leading zero', () => {
        expect(normalizePhoneNumber('660 1234567')).to.equal(normalized)
      })

      it('with country code and without leading zero', () => {
        expect(normalizePhoneNumber('+43 660 1234567')).to.equal(normalized)
      })

      it('with leading zeroes and country code', () => {
        expect(normalizePhoneNumber('0043 660 1234567')).to.equal(normalized)
      })

      it('zerofixes number', () => {
        expect(normalizePhoneNumber('oo43 66O 1234567')).to.equal(normalized)
      })

      it('strips leading zeroes', () => {
        expect(stripLeadingZeroes('0660')).to.equal('660')
      })
    })
  })
})
