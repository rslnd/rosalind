/* eslint-env mocha */
import { expect } from 'chai'
import { parseExactLastName } from './parseExactLastName'

describe('patients', function () {
  describe('find', function () {
    describe('parseExactLastName', function () {
      it('tokenizes', function () {
        expect(parseExactLastName('Don vito corleone').result).to.eql({
          $or: [
            { 'profile.lastNameNormalized': 'DON' },
            { 'profile.lastNameNormalized': 'VITO' },
            { 'profile.lastNameNormalized': 'CORLEONE' }
          ]
        })
      })

      it('skips tiny tokens', function () {
        expect(parseExactLastName('don i i i').result).to.eql({
          $or: [
            { 'profile.lastNameNormalized': 'DON' }
          ]
        })
      })
    })
  })
})
