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
        expect(parseContact('06991122334').result).to.eql({
          'contacts.valueNormalized': {
            $regex: '^436991122334'
          }
        })

        expect(parseContact('0699 11 22 33 44').result).to.eql({
          'contacts.valueNormalized': {
            $regex: '^4369911223344'
          }
        })
      })
    })
  })
})
