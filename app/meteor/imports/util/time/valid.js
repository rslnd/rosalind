import moment from 'moment-timezone'

export const isValidAt = ({ validFrom, validTo }) => t => {
  const time = moment(t)

  if (!time || (!validFrom && !validTo)) { return true }

  if (!validFrom && validTo && time.isBefore(validTo)) { return true }

  if (validFrom && !validTo && time.isAfter(validFrom)) { return true }

  if (validFrom && validTo && time.isAfter(validFrom) && time.isBefore(validTo)) { return true }

  return false
}
