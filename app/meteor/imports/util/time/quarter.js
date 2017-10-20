import moment from 'moment-timezone'

export const Q = {
  1: [1, 2, 3],
  2: [4, 5, 6],
  3: [7, 8, 9],
  4: [10, 11, 12]
}

export const start = a => a[0]
export const end = a => a[2]

export const q = n => m => ({
  start: moment(m).month(start(Q[n]) - 1).startOf('month'),
  end: moment(m).month(end(Q[n]) - 1).endOf('month')
})

export const isQ = n => m => {
  const { start, end } = q(n)(m)
  return moment(m).isBetween(start, end, null, '[]')
}

export const q1 = q(1)
export const q2 = q(2)
export const q3 = q(3)
export const q4 = q(4)

export const isQ1 = isQ(1)
export const isQ2 = isQ(2)
export const isQ3 = isQ(3)
export const isQ4 = isQ(4)

export const getQ = (m) => {
  const t = moment(m)
  if (isQ4(t)) { return 4 }
  if (isQ3(t)) { return 3 }
  if (isQ2(t)) { return 2 }
  if (isQ1(t)) { return 1 }
}

export const getQuarterSelector = m => {
  const months = Q[getQ(m)]
  return {
    'day.month': { $in: months },
    'day.year': moment(m).year()
  }
}

export const getRange = (m) => {
  const t = moment(m)
  if (isQ4(t)) { return q4(t) }
  if (isQ3(t)) { return q3(t) }
  if (isQ2(t)) { return q2(t) }
  if (isQ1(t)) { return q1(t) }
}

export const quarter = (date) => {
  const m = moment(date)
  const year = m.year()
  const q = getQ(m)
  return {
    year,
    q,
    range: getRange(m),
    isSame: isSame(m),
    isNext: isNext(m),
    isPrevious: isPrevious(m) }
}

export const isPrevious = (date, compareWith) => {
  return (getQ(date) === getQ(moment(compareWith).subtract(3, 'months')) && (
    moment(date).year() === moment(compareWith).year() ||
    moment(date).year() === moment(compareWith).year() - 1))
}

export const isSame = (date, compareWith) => {
  return (getQ(compareWith) === getQ(date) &&
    moment(date).year() === moment(compareWith).year())
}

export const isNext = (date, compareWith) => {
  return (getQ(date) === getQ(moment(compareWith).add(3, 'months')) && (
    moment(date).year() === moment(compareWith).year() ||
    moment(date).year() === moment(compareWith).year() + 1))
}

export default {
  q1,
  q2,
  q3,
  q4,
  isQ1,
  isQ2,
  isQ3,
  isQ4,
  getQ,
  quarter,
  isPrevious,
  isSame,
  isNext,
  getQuarterSelector
}
