/* eslint-env mocha */
import { expect } from 'chai'
import { isIntentToCancel } from './isIntentToCancel'

describe('api', () => {
  describe('messages', () => {
    describe('isIntentToCancel', () => {
      it('uppercase', () => {
        expect(isIntentToCancel('STORNO')).to.equal(true)
      })

      it('lowercase', () => {
        expect(isIntentToCancel('storno')).to.equal(true)
      })

      it('punctuation and newlines', () => {
        expect(isIntentToCancel('Storno.\n')).to.equal(true)
      })

      it('with typo', () => {
        expect(isIntentToCancel('Strono .!!!\n')).to.equal(true)
      })
    })
  })
})
