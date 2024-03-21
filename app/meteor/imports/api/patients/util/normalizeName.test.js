/* eslint-env mocha */
import { expect } from 'chai'
import { normalizeName } from './normalizeName'

describe('util', function () {
  describe('normalizeName', function () {
    it('uppercases', function () {
      expect(normalizeName('rotter')).to.eql('ROTTER')
    })

    it('removes space', function () {
      expect(normalizeName('rotter rotter')).to.eql('ROTTER-ROTTER')
    })

    it('removes other characters', function () {
      expect(normalizeName('rotter-rotter')).to.eql('ROTTER-ROTTER')
      expect(normalizeName('rotter- -rotter')).to.eql('ROTTER-ROTTER')
    })

    it('removes umlauts', function () {
      expect(normalizeName('rötter')).to.eql('ROETTER')
    })

    it('removes umlauts', function () {
      expect(normalizeName('mayrhofer-ilhan-ümüht')).to.eql('MAYRHOFER-ILHAN-UEMUEHT')
    })

    it('transliterate diacritics', function () {
      expect(normalizeName('Rádríguez')).to.eql('RADRIGUEZ')
    })
  })
})
