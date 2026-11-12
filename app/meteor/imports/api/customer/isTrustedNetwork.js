import { check, Match } from 'meteor/check'
import SimpleSchema from 'meteor/aldeed:simple-schema'

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
  // Only a genuine loopback socket is localhost. Do NOT treat null/undefined as
  // localhost: that is what Meteor yields when it cannot determine a client
  // address (e.g. the x-forwarded-for fallback, or a missing header), and
  // trusting it would let a misrouted or header-stripped remote request be
  // treated as server-local. Server-internal calls (connection === null) are
  // already handled by the `this.connection && …` guards at each call site, so
  // they do not rely on this returning true for null.
  return (
    (ip === '127.0.0.1') ||
    (ip === '::1') ||
    (ip === '::ffff:127.0.0.1')
  )
}
