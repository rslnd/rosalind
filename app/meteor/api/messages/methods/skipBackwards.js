import { until, complement, reduceRight, compose, identity, repeat } from 'ramda'
import moment from 'moment'
import { isWeekend } from './isQuietTime'

const applyN = compose(reduceRight(compose, identity), repeat)

const next = (d) => d.clone().add(1, 'day')
const prev = (d) => d.clone().subtract(1, 'day')

export const skipOneForwards = (skipDay) => (date) => until(complement(skipDay), next)(next(date))
export const skipOneBackwards = (skipDay) => (date) => until(complement(skipDay), prev)(prev(date))

export const skipBackwards = (start = moment(), daysBefore = 1, skipDay = isWeekend) => {
  return applyN(skipOneBackwards(skipDay), daysBefore)(moment(start).clone())
}

export const skipForwards = (start = moment(), daysAfter = 1, skipDay = isWeekend) => {
  return applyN(skipOneForwards(skipDay), daysAfter)(moment(start).clone())
}
