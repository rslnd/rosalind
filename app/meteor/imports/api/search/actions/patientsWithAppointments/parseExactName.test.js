/* eslint-env mocha */
import { expect } from 'chai'
import { parseExactName } from './parseExactName'

describe('patients', function () {
  describe('find', function () {
    describe('parseExactName', function () {
      it('normalizes', function () {
        expect(parseExactName('rotter').result).to.eql({
          'lastNameNormalized': {
            $regex: '^ROTTER'
          }
        })
      })

      // it('parses first name', function () {
      //   expect(parseExactName('rotter jan').result).to.eql({
      //     $or: [
      //       { 'lastNameNormalized': 'ROTTERJAN' },
      //       { 'lastNameNormalized': 'ROTTER' },
      //       { 'lastNameNormalized': 'JAN' }
      //     ],
      //     'firstName': {
      //       $regex: '^jan',
      //       $options: 'i'
      //     }
      //   })
      // })

      // it('parses single letter first name', function () {
      //   expect(parseExactName('rotter j').result).to.eql({
      //     $or: [
      //       { 'lastNameNormalized': 'ROTTERJ' },
      //       { 'lastNameNormalized': 'ROTTER' },
      //       { 'lastNameNormalized': 'J' }
      //     ],
      //     'firstName': {
      //       $regex: '^j',
      //       $options: 'i'
      //     }
      //   })
      // })

      // it('tokenizes', function () {
      //   expect(parseExactName('vito corleone don').result).to.eql({
      //     $or: [
      //       { 'lastNameNormalized': 'VITOCORLEONEDON' },
      //       { 'lastNameNormalized': 'VITO' },
      //       { 'lastNameNormalized': 'CORLEONE' },
      //       { 'lastNameNormalized': 'DON' }
      //     ],
      //     'firstName': {
      //       $regex: '^don',
      //       $options: 'i'
      //     }
      //   })
      // })

      // it('parses umlauts', function () {
      //   expect(parseExactName('dön').result).to.eql({
      //     $or: [
      //       { 'lastNameNormalized': 'DN' }
      //     ]
      //   })
      // })

      // it('removes hyphens', function () {
      //   expect(parseExactName('alpha-beta gamma').result).to.eql({
      //     $or: [
      //       { 'lastNameNormalized': 'ALPHABETAGAMMA' },
      //       { 'lastNameNormalized': 'ALPHA' },
      //       { 'lastNameNormalized': 'BETA' },
      //       { 'lastNameNormalized': 'GAMMA' }
      //     ],
      //     'firstName': {
      //       $regex: '^gamma',
      //       $options: 'i'
      //     }
      //   })
      // })
    })
  })
})
