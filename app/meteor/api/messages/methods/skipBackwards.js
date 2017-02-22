import { until, complement, reduceRight, compose, identity, repeat } from 'ramda'
import moment from 'moment'
import { isWeekend } from './isQuietTime'

const applyN = compose(reduceRight(compose, identity), repeat)

const next = (unit) => (d) => d.clone().add(1, unit)
const prev = (unit) => (d) => d.clone().subtract(1, unit)

export const skipOneForwards = (skip, unit) => (date) => until(complement(skip), next(unit))(next(unit)(date))
export const skipOneBackwards = (skip, unit) => (date) => until(complement(skip), prev(unit))(prev(unit)(date))

export const skipBackwards = ({ start = moment(), count = 1, skip = isWeekend, unit = 'day' }) => {
  return applyN(skipOneBackwards(skip, unit), count)(moment(start).clone())
}

export const skipForwards = ({ start = moment(), count = 1, skip = isWeekend, unit = 'day' }) => {
  return applyN(skipOneForwards(skip, unit), count)(moment(start).clone())
}
