/* eslint-env mocha */
import { containsTerms } from './filter'
import { expect } from 'chai'

const collection = [
  { names: ['dr timothy', 'kai'], tags: [{ tag: 'ccc' }] }
]

describe('help', () => {
  describe('containsTerms', () => {
    it('keeps positive matches', () => {
      const match = containsTerms(['tim', 'aaa'])
      expect(match(collection, c => c.names)).to.equal(true)
    })

    it('filters negative matches', () => {
      const noMatch = containsTerms(['nope', 'bbb'])
      expect(noMatch(collection, c => c.names)).to.equal(false)
    })
  })
})
