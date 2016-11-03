/* eslint-env mocha */
import { expect } from 'chai'
import { zerofix } from './zerofix'

describe('util', () => {
  describe('zerofix', () => {
    it('should not change correct phone number', () => {
      expect(zerofix('+43 0660 1234567')).to.equal('+43 0660 1234567')
    })

    it('should change the letter O to zeroes', () => {
      expect(zerofix('o660 1234567')).to.equal('0660 1234567')
      expect(zerofix('o66o 1234567')).to.equal('0660 1234567')
      expect(zerofix('O66o 1234567')).to.equal('0660 1234567')
      expect(zerofix('0oOo')).to.equal('0000')
    })

    it('should fix dates', () => {
      expect(zerofix('o6.jan.199o', { dontSplit: true })).to.equal('06.jan.1990')
      expect(zerofix('o6.09.199o', { dontSplit: true })).to.equal('06.09.1990')
      expect(zerofix('o6O9199o', { dontSplit: true })).to.equal('06091990')
    })

    it('should not change the letter O to zeroes if they are in a word', () => {
      expect(zerofix('hello')).to.equal('hello')
      expect(zerofix('0660 or 0660')).to.equal('0660 or 0660')
      expect(zerofix('o660 oder 4oo4')).to.equal('0660 oder 4004')
    })

    it('should split long numbers into chunks of four', () => {
      expect(zerofix('123456789')).to.equal('1234 5678 9')
      expect(zerofix('o66o1234567')).to.equal('0660 1234 567')
      expect(zerofix('this is a sentence')).to.equal('this is a sentence')
    })

    it('should honor dontSplit flag', () => {
      expect(zerofix('123456789', { dontSplit: true })).to.equal('123456789')
      expect(zerofix('o66o1234567', { dontSplit: true })).to.equal('06601234567')
      expect(zerofix('06.09.1990', { dontSplit: true })).to.equal('06.09.1990')
      expect(zerofix('this is a sentence', { dontSplit: true })).to.equal('this is a sentence')
    })

    it('should be fixpoint', () => {
      expect(zerofix(zerofix('o66o1234567', { dontSplit: true }), { dontSplit: true })).to.equal('06601234567')
      expect(zerofix(zerofix('123456789'))).to.equal('1234 5678 9')
    })
  })
})
