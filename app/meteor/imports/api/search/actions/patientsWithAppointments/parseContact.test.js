/* eslint-env mocha */
import { expect } from 'chai'
import { parseContact } from './parseContact'

describe('patients', function () {
  describe('find', function () {
    describe('parseContact', function () {
      it('normalizes', function () {
        expect(parseContact('0699112233').result).to.eql({
          'profile.contacts.valueNormalized': {
            $regex: '^0699 1122 33'
          }
        })

        expect(parseContact('0699 11 22 33').result).to.eql({
          'profile.contacts.valueNormalized': {
            $regex: '^0699 1122 33'
          }
        })
      })
    })
  })
})
