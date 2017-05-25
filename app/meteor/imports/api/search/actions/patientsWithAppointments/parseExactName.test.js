/* eslint-env mocha */
import { expect } from 'chai'
import { parseExactName } from './parseExactName'

describe('patients', function () {
  describe('find', function () {
    describe('parseExactName', function () {
      it('normalizes', function () {
        expect(parseExactName('rotter').result).to.eql({
          $or: [
            { 'profile.lastNameNormalized': 'ROTTER' }
          ]
        })
      })

      it('parses first name', function () {
        expect(parseExactName('rotter jan').result).to.eql({
          $or: [
            { 'profile.lastNameNormalized': 'ROTTERJAN' },
            { 'profile.lastNameNormalized': 'ROTTER' },
            { 'profile.lastNameNormalized': 'JAN' }
          ],
          'profile.firstName': {
            $regex: '^jan',
            $options: 'i'
          }
        })
      })

      it('parses single letter first name', function () {
        expect(parseExactName('rotter j').result).to.eql({
          $or: [
            { 'profile.lastNameNormalized': 'ROTTERJ' },
            { 'profile.lastNameNormalized': 'ROTTER' },
            { 'profile.lastNameNormalized': 'J' }
          ],
          'profile.firstName': {
            $regex: '^j',
            $options: 'i'
          }
        })
      })

      it('tokenizes', function () {
        expect(parseExactName('vito corleone don').result).to.eql({
          $or: [
            { 'profile.lastNameNormalized': 'VITOCORLEONEDON' },
            { 'profile.lastNameNormalized': 'VITO' },
            { 'profile.lastNameNormalized': 'CORLEONE' },
            { 'profile.lastNameNormalized': 'DON' }
          ],
          'profile.firstName': {
            $regex: '^don',
            $options: 'i'
          }
        })
      })

      it('parses umlauts', function () {
        expect(parseExactName('dön').result).to.eql({
          $or: [
            { 'profile.lastNameNormalized': 'DN' }
          ]
        })
      })

      it('removes hyphens', function () {
        expect(parseExactName('alpha-beta gamma').result).to.eql({
          $or: [
            { 'profile.lastNameNormalized': 'ALPHABETAGAMMA' },
            { 'profile.lastNameNormalized': 'ALPHA' },
            { 'profile.lastNameNormalized': 'BETA' },
            { 'profile.lastNameNormalized': 'GAMMA' }
          ],
          'profile.firstName': {
            $regex: '^gamma',
            $options: 'i'
          }
        })
      })
    })
  })
})
