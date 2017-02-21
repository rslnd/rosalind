import { until, complement, reduceRight, compose, identity, repeat } from 'ramda'
import moment from 'moment'

const applyN = compose(reduceRight(compose, identity), repeat)

const next = (d) => d.clone().add(1, 'day')
const prev = (d) => d.clone().subtract(1, 'day')

export const skipWeekends = (d) => (d.isoWeekday() === 6 || d.isoWeekday() === 7)

export const skipForwards = (skipDay) => (date) => until(complement(skipDay), next)(next(date))
export const skipBackwards = (skipDay) => (date) => until(complement(skipDay), prev)(prev(date))

export const calculateReminderDate = (start = moment(), daysBefore = 1, skipDay = skipWeekends) => {
  return applyN(skipBackwards(skipDay), daysBefore)(moment(start).clone())
}

export const calculateFutureCutoff = (start = moment(), daysAfter = 1, skipDay = skipWeekends) => {
  return applyN(skipForwards(skipDay), daysAfter)(moment(start).clone())
}
