import { check, Match } from 'meteor/check'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'

export const isTrustedNetwork = (ip) => {
  check(ip, Match.Where((s) => {
    if (typeof s === 'undefined') { return true }
    if (s === null) { return true }
    if (typeof s === 'string') {
      return s.match(SimpleSchema.RegEx.WeakDomain)
    }
    return false
  }))

  // Requests from localhost are trusted
  if (ip === null) {
    return true
  }

  let allowedIps = process.env.PASSWORDLESS_LOGIN_IP
  if (ip && allowedIps) {
    allowedIps = allowedIps.split(',')
    return allowedIps.includes(ip)
  } else {
    return false
  }
}
