/* eslint-env mocha */
import { expect } from 'chai'
import { applyDurationStrategy, durationStrategyAddUpTo } from './durationStrategy'

describe('api/appointments/applyDurationStrategy', () => {
  const tags = [
    { duration: 10 },
    { duration: 5 },
    { duration: 20 },
    { duration: 10 },
    { duration: 50 }
  ]

  it('undefined if no tags', () => {
    expect(durationStrategyAddUpTo({ tags: [], upTo: 30 })).to.eql(0)
  })

  it('strategy addUpTo', () => {
    expect(durationStrategyAddUpTo({ tags, upTo: 30 })).to.eql(30)
  })

  it('adds up to a limit', () => {
    const constraint = {
      durationStrategy: {
        name: 'addUpTo',
        upTo: 45
      }
    }

    expect(applyDurationStrategy({ constraint, tags })).to.eql(45)
  })
})
