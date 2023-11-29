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

        it('lowercase in quotes', () => {
          expect(isIntentToCancel('"storno"')).to.equal(true)
        })

        it('punctuation and newlines', () => {
          expect(isIntentToCancel('Storno.\n')).to.equal(true)
        })

        it('lowercase', () => {
          expect(isIntentToCancel('neinnnnnnnnnnnnnnnnnnnn')).to.equal(true)
        })

        it('turkish', () => {
          expect(isIntentToCancel('NEIN')).to.equal(true)
          expect(isIntentToCancel('NEIN NEIN')).to.equal(true)
          expect(isIntentToCancel('NEIN')).to.equal(true)
          expect(isIntentToCancel('NEıN')).to.equal(true)
          expect(isIntentToCancel('NEıN')).to.equal(true)
          expect(isIntentToCancel('NEİN')).to.equal(true)
          expect(isIntentToCancel('NEİN')).to.equal(true)
          expect(isIntentToCancel('NEïN')).to.equal(true)
        })


        it('alternative word', () => {
          expect(isIntentToCancel('NEIN, danke!!\n')).to.equal(true)
        })

        it('only additional text', () => {
          expect(isIntentToCancel('was glauben sie denn?')).to.equal(false)
          expect(isIntentToCancel('Ich habe keinen termin!')).to.equal(false)
          expect(isIntentToCancel('El')).to.equal(false)
          expect(isIntentToCancel('Wir kommen')).to.equal(false)
        })
      })

      context('rejects', () => {
        it('rejects random text', () => {
          expect(isIntentToCancel('Danke.l.g.ulm')).to.equal(false)
        })

        it('fein', () => {
          expect(isIntentToCancel('fein')).to.equal(false)
        })
      })
    })
  })
})
