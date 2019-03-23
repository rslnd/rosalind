/* eslint-env mocha */
import { expect } from 'chai'
import { twoPlacesIfNeeded } from './format'

describe('util/format', () => {
  it('twoPlacesIfNeeded', () => {
    expect(twoPlacesIfNeeded(4.3)).to.equal('4,30')
    expect(twoPlacesIfNeeded(4.0001)).to.equal('4')
  })
})
