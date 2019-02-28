import max from 'lodash/max'
import min from 'lodash/min'
import sum from 'lodash/sum'

export const durationStrategyMax = ({ tags }) => max(tags.map(t => t.duration))
export const durationStrategyAdd = ({ tags }) => sum(tags.map(t => t.duration))
export const durationStrategyAddUpTo = ({ tags, upTo = 60 }) => min([durationStrategyAdd({ tags }), upTo])

const durationStrategyDefault = durationStrategyMax

export const applyDurationStrategy = ({ constraint, tags }) => {
  if (!constraint || !constraint.durationStrategy) {
    return durationStrategyDefault({ tags })
  }

  switch (constraint.durationStrategy.name) {
    case 'max': return durationStrategyMax({ tags })
    case 'add': return durationStrategyAdd({ tags })
    case 'addUpTo': return durationStrategyAddUpTo({ tags, upTo: constraint.durationStrategy.upTo })
    default: return durationStrategyDefault({ tags })
  }
}
