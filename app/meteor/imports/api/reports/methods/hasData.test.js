/* eslint-env mocha */
import { expect } from 'chai'
import { hasData } from './hasData'

describe('reports hasData', function () {
  it('is false without statistics', function () {
    expect(hasData()).to.equal(false)
    expect(hasData({ current: {} })).to.equal(false)
  })

  it('is false without admitted appointments', function () {
    expect(hasData({ current: { total: { total: 0, admitted: 0 } } })).to.equal(false)
    expect(hasData({ current: { total: { total: 5, slotsAvailable: 8, admitted: 0 } } })).to.equal(false)
  })

  it('is true with at least one admitted appointment', function () {
    expect(hasData({ current: { total: { total: 3, admitted: 1 } } })).to.equal(true)
  })
})
