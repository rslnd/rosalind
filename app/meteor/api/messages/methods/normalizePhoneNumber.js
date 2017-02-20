import flow from 'lodash/flow'
import { zerofix } from '../../../util/zerofix'

const countryPrefix = '43'
const minimumLength = 9

export const checkArgument = (s) => {
  if (typeof s === 'string') {
    return s
  } else {
    throw new Error('Missing argument of type string')
  }
}

export const stripNonNumber = (s) => s.replace(/[^0-9]*/g, '')

export const stripLeadingZeroes = (s) => s.replace(/^0*/, '')

export const addCountryCode = (s) => {
  if (s.indexOf(countryPrefix) === 0) {
    return s
  } else {
    return countryPrefix + s
  }
}

export const ensureMinimumLength = (s) => {
  if (s.length >= minimumLength) {
    return s
  } else {
    throw new Error(`Number is shorter than the minimum length ${minimumLength}`)
  }
}

export const normalizePhoneNumber = flow(
  checkArgument,
  zerofix,
  stripNonNumber,
  stripLeadingZeroes,
  addCountryCode,
  ensureMinimumLength
)
