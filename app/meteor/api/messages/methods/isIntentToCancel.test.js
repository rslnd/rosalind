/* eslint-env mocha */
import { expect } from 'chai'
import { isIntentToCancel } from './isIntentToCancel'

describe('api', () => {
  describe('messages', () => {
    describe('isIntentToCancel', () => {
      context('accepts', () => {
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

        it('alternative word', () => {
          expect(isIntentToCancel('NEIN, danke!!\n')).to.equal(true)
        })

        it('misspelling and additional text', () => {
          expect(isIntentToCancel('Neiun, lg christina')).to.equal(true)
        })

        it('only additional text', () => {
          expect(isIntentToCancel('was glauben sie denn?')).to.equal(false)
          expect(isIntentToCancel('Ich habe keinen termin!')).to.equal(false)
          expect(isIntentToCancel('El')).to.equal(false)
        })
      })

      context('rejects', () => {
        it('rejects random text', () => {
          expect(isIntentToCancel('Danke.l.g.ulm')).to.equal(false)
        })
      })
    })
  })
})
