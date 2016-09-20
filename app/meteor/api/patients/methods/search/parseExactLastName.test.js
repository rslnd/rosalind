/* eslint-env mocha */
import { expect } from 'chai'
import { parseExactLastName } from './parseExactLastName'

describe('patients', function () {
  describe('find', function () {
    describe('parseExactLastName', function () {
      it('tokenizes', function () {
        expect(parseExactLastName('Don vito corleone').result).to.eql({
          $or: [
            { 'profile.lastName': 'Don' },
            { 'profile.lastName': 'vito' },
            { 'profile.lastName': 'corleone' }
          ]
        })
      })

      it('skips tiny tokens', function () {
        expect(parseExactLastName('don i i i').result).to.eql({
          $or: [
            { 'profile.lastName': 'don' }
          ]
        })
      })
    })
  })
})
