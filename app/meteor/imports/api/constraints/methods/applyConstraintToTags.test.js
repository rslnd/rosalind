/* eslint-env mocha */
import { expect } from 'chai'
import { applyConstraintToTags } from './applyConstraintToTags'

describe('api/constraints/applyConstraintToTags', () => {
  it('keeps empty tags', () => {
    expect(applyConstraintToTags({ constraint: null, tags: [] })).to.eql([])
  })

  it('keeps tags when no constraint', () => {
    const tag = { _id: 'A', duration: 1 }
    expect(applyConstraintToTags({ constraint: null, tags: [tag] })).to.eql([tag])
  })

  it('overrides duration per tag', () => {
    const constraint = {
      tags: [
        { tagId: 'A', duration: 20 }
      ]
    }

    const tags = [
      { _id: 'A', duration: 10 }
    ]
    expect(applyConstraintToTags({ constraint, tags })).to.eql([
      { _id: 'A', duration: 20 }
    ])
  })

  it('overrides duration with default', () => {
    const constraint = {
      duration: 30,
      tags: [
        { tagId: 'A', duration: 20 },
        { tagId: 'B' }
      ]
    }

    const tags = [
      { _id: 'A', duration: 10 },
      { _id: 'B', duration: 10 }
    ]

    expect(applyConstraintToTags({ constraint, tags })).to.eql([
      { _id: 'A', duration: 20 },
      { _id: 'B', duration: 30 }
    ])
  })

})
