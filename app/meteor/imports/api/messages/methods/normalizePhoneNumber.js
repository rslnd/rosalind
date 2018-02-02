import flow from 'lodash/flow'
import { zerofix } from '../../../util/zerofix'

const countryPrefix = '43'
const minimumLength = 5
const maximumLength = 16

export const checkArgument = (s) => {
  if (typeof s === 'string') {
    return s
  } else {
    return ''
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

export const ensureLength = (s) => {
  if (s.length >= minimumLength && s.length <= maximumLength) {
    return s
  } else {
    return undefined
  }
}

export const normalizePhoneNumber = flow(
  checkArgument,
  zerofix,
  stripNonNumber,
  stripLeadingZeroes,
  addCountryCode,
  ensureLength
)
