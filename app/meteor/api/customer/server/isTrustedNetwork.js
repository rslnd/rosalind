import { check, Match } from 'meteor/check'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'

export const isTrustedNetwork = (ip) => {
  check(ip, Match.Where((s) => {
    if (typeof s === 'undefined') { return true }
    if (typeof s === 'string') {
      return s.match(SimpleSchema.RegEx.WeakDomain)
    }
    return false
  }))

  let allowedIps = process.env.PASSWORDLESS_LOGIN_IP
  if (ip && allowedIps) {
    allowedIps = allowedIps.split(',')
    return allowedIps.includes(ip)
  } else {
    return false
  }
}
