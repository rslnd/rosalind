import moment from 'moment-timezone'

export const q1 = (m) => {
  return {
    start: moment(m).month(0).startOf('month'),
    end: moment(m).month(3 - 1).endOf('month')
  }
}

export const q2 = (m) => {
  return {
    start: moment(m).month(4 - 1).startOf('month'),
    end: moment(m).month(6 - 1).endOf('month')
  }
}

export const q3 = (m) => {
  return {
    start: moment(m).month(7 - 1).startOf('month'),
    end: moment(m).month(9 - 1).endOf('month')
  }
}

export const q4 = (m) => {
  return {
    start: moment(m).month(10 - 1).startOf('month'),
    end: moment(m).month(12 - 1).endOf('month')
  }
}

export const isQ1 = (m) => {
  const q = q1(m)
  return moment(m).isBetween(q.start, q.end, null, '[]')
}

export const isQ2 = (m) => {
  const q = q2(m)
  return moment(m).isBetween(q.start, q.end, null, '[]')
}

export const isQ3 = (m) => {
  const q = q3(m)
  return moment(m).isBetween(q.start, q.end, null, '[]')
}

export const isQ4 = (m) => {
  const q = q4(m)
  return moment(m).isBetween(q.start, q.end, null, '[]')
}

export const getQ = (m) => {
  const t = moment(m)
  if (isQ4(t)) { return 4 }
  if (isQ3(t)) { return 3 }
  if (isQ2(t)) { return 2 }
  if (isQ1(t)) { return 1 }
}

export const quarter = (date) => {
  const m = moment(date)
  const year = m.year()
  const q = getQ(m)
  return {
    year,
    q,
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
  isNext
}
