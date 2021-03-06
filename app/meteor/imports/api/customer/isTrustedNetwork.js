import { check, Match } from 'meteor/check'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'

const validateIp = ip =>
  check(ip, Match.Where((s) => {
    if (typeof s === 'undefined') { return true }
    if (s === null) { return true }
    if (typeof s === 'string') {
      return s.match(SimpleSchema.RegEx.WeakDomain)
    }
    return false
  }))

export const isTrustedNetwork = ip => {
  validateIp(ip)

  // Requests from localhost are trusted
  if (isLocalhost(ip)) { return true }

  let allowedIps = process.env.TENANT_IPS
  if (ip && allowedIps) {
    allowedIps = allowedIps.split(',')
    return allowedIps.includes(ip)
  } else {
    return false
  }
}

export const isLocalhost = ip => {
  validateIp(ip)
  return (
    (ip === null) ||
    (ip === '127.0.0.1')
  )
}
