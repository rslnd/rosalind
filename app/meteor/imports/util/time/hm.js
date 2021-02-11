import moment from 'moment-timezone'
import identity from 'lodash/identity'
import leftPad from 'left-pad'

export const isWithinHMRange = ({ from, to }) => date => {
  const d = HMtoString(dateToHM(date))
  return (HMtoString(from) <= d && d <= HMtoString(to))
}

export const dateToHM = date => {
  const m = moment.tz(date, 'Europe/Vienna')

  return {
    h: m.hours(),
    m: m.minutes()
  }
}

export const HMtoString = hm => {
  if (!hm) return null
  return [
    leftPad(hm.h, 2, '0'),
    leftPad(hm.m, 2, '0')
  ].join(':')
}

export const stringToHMOrNull = s => {
  if (!s) { return null }
  return stringToHM(s)
}

export const stringToHM = s => {
  const [h, m] = s.split(':')
  return {
    h: h ? parseInt(h, 10) : 0,
    m: m ? parseInt(m, 10) : 0
  }
}

export const HMRangeToString = (schedule) => {
  if (!schedule) {
    return ''
  }

  const { to, from, note } = schedule

  return [
    [
      HMtoString(from),
      HMtoString(to)
    ].filter(identity).join('-'),
    note
  ].filter(identity).join(' ')
}

export const stringToHMRange = s => {
  if (!s) { return null }
  const [fromto, ...rest] = s.split(/\s/)
  const [from, to] = fromto.split('-')
  const range = {
    from: stringToHM(from),
    to: stringToHM(to)
  }

  const note = rest && rest.join(' ')
  if (note.length > 2) {
    return {
      ...range,
      note
    }
  }

  return range
}
