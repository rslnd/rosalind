import moment from 'moment-timezone'
import { isWeekend } from './isQuietTime'

// const applyN = compose(reduceRight(compose, identity), repeat)
// const complement = fn => (...args) => !fn(...args)

const repeatWhile = (predicate, fn) => initial => {
  let val = initial
  while (predicate(val)) {
    val = fn(val)
  }
  return val
}

const applyN = (fn, count) => initial => {
  let val = initial
  for (let i = 0; i < count; i++) {
    val = fn(val)
  }
  return val
}

const next = (unit) => (d) => d.clone().add(1, unit)
const prev = (unit) => (d) => d.clone().subtract(1, unit)

export const skipOneForwards = (skip, unit) => (date) => repeatWhile(skip, next(unit))(next(unit)(date))
export const skipOneBackwards = (skip, unit) => (date) => repeatWhile(skip, prev(unit))(prev(unit)(date))

export const skipBackwards = ({ start = moment(), count = 1, skip = isWeekend, unit = 'day' }) => {
  return applyN(skipOneBackwards(skip, unit), count)(moment(start).clone())
}

export const skipForwards = ({ start = moment(), count = 1, skip = isWeekend, unit = 'day' }) => {
  return applyN(skipOneForwards(skip, unit), count)(moment(start).clone())
}
