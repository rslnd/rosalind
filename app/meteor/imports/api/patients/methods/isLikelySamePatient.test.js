/* eslint-env mocha */
import chai from 'chai'
import { isLikelySamePatient } from './isLikelySamePatient'

const expect = chai.expect

describe('api', function () {
  describe('patients', function () {
    describe('isLikelySamePatient', function () {
      it('false when first name mismatch', () => {
        const a = { lastName: 'X', firstName: 'A' }
        const b = { lastName: 'X', firstName: 'B' }
        expect(isLikelySamePatient(a, b)).to.eql(false)
      })
    })
  })
})
