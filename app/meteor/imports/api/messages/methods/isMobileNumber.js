import some from 'lodash/some'

export const minimumLength = 8

export const mobileCarrierPrefixes = [
  '650',
  '660',
  '664',
  '676',
  '677',
  '678',
  '680',
  '681',
  '688',
  '699'
]

export const validateCountryCode = (number) => {
  if (number.match(/^00|^\+/)) {
    if (number.match(/^0043|^\+43/)) {
      return true
    } else {
      return false
    }
  }
}

export const isMobileNumber = (number) => {
  if (number && typeof number === 'string' && number.length >= minimumLength) {
    if (validateCountryCode(number) !== false) {
      return some(mobileCarrierPrefixes, p => number.match(p))
    }
  }
}
