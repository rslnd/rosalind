/* eslint-env mocha */
import { expect } from 'chai'
import { startCase } from './startCase'

describe('util', function () {
  describe('fuzzy', function () {
    describe('startCase', function () {
      it('handles regular words and phrases', function () {
        expect(startCase('rott')).to.equal('Rott')
        expect(startCase('rott torr')).to.equal('Rott Torr')
        expect(startCase('GARN')).to.equal('Garn')
      })

      it('handles umlauts', function () {
        expect(startCase('ösl')).to.equal('Ösl')
        expect(startCase('ÖSL')).to.equal('Ösl')
      })
    })
  })
})
