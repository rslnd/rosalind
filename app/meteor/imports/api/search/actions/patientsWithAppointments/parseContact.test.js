/* eslint-env mocha */
import { expect } from 'chai'
import { parseContact } from './parseContact'

describe('patients', function () {
  describe('find', function () {
    describe('parseContact', function () {
      it('ignores if normalized is too short', function () {
        expect(parseContact('0699112').result).to.eql(false)
      })

      it('normalizes', function () {
        expect(parseContact('0699112233').result).to.eql({
          'contacts.valueNormalized': {
            $regex: '^43699112233'
          }
        })

        expect(parseContact('0699 11 22 33').result).to.eql({
          'contacts.valueNormalized': {
            $regex: '^43699112233'
          }
        })
      })
    })
  })
})
