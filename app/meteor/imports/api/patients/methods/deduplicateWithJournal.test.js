/* eslint-env mocha */
import chai from 'chai'
import { mergeContacts } from './deduplicateWithJournal'

const expect = chai.expect

describe('api', function () {
  describe('patients', function () {
    describe('deduplicateWithJournal', function () {

      describe('mergeContacts', () => {
        const master = [ { channel: 'Phone', value: '1234' } ]

        it('merges different values', () => {
          const addendum = [ { channel: 'Phone', value: '7890' } ]
          expect(mergeContacts(master, addendum)).to.eql([
            { channel: 'Phone', value: '1234' },
            { channel: 'Phone', value: '7890' }
          ])
        })

        it('deduplicates same values', () => {
          expect(mergeContacts(master, master)).to.eql([
            { channel: 'Phone', value: '1234' }
          ])
        })

        it('deduplicates similar values', () => {
          const addendum = [ { channel: 'Phone', value: '1/2 3-4' } ]
          expect(mergeContacts(master, addendum)).to.eql([
            { channel: 'Phone', value: '1234' }
          ])
        })

        it('keeps master value', () => {
          expect(mergeContacts(master, [])).to.eql([
            { channel: 'Phone', value: '1234' }
          ])
        })

        it('keeps addendum value', () => {
          expect(mergeContacts([], master)).to.eql([
            { channel: 'Phone', value: '1234' }
          ])
        })
      })
    })
  })
})
