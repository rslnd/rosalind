/* eslint-env mocha */
import { expect } from 'chai'
import { normalizeName } from './normalizeName'

describe('util', function () {
  describe('normalizeName', function () {
    it('uppercases', function () {
      expect(normalizeName('rotter')).to.eql('ROTTER')
    })

    it('removes space', function () {
      expect(normalizeName('rotter rotter')).to.eql('ROTTERROTTER')
    })

    it('removes other characters', function () {
      expect(normalizeName('rotter-rotter')).to.eql('ROTTERROTTER')
      expect(normalizeName('rotter- -rotter')).to.eql('ROTTERROTTER')
    })

    it('removes umlauts', function () {
      expect(normalizeName('rötter')).to.eql('RTTER')
    })

    it('removes umlauts', function () {
      expect(normalizeName('mayrhofer-ilhan-ümüht')).to.eql('MAYRHOFERILHANMHT')
    })
  })
})
