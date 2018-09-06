import { Meteor } from 'meteor/meteor'

export const isWeakPassword = async password => {
  const unsafeHashedPassword = await sha1(password)
  const hibpPrefix = prefix(unsafeHashedPassword)
  const hibpResponse = await queryHibp(hibpPrefix)
  const breachCount = countBreaches(unsafeHashedPassword)(hibpResponse)

  return breachCount > 0
    ? breachCount
    : false
}

const countBreaches = hash => hibpResponse => {
  const count = hibpResponse[hash]
  if (count) {
    return count
  } else {
    return 0
  }
}

const prefix = hash => hash.substr(0, 5)

const sha1 = async password => {
  if (Meteor.isClient) {
    const passwordBuffer = (new window.TextEncoder()).encode(password)
    const hashBuffer = await window.crypto.subtle.digest({ name: 'SHA-1' }, passwordBuffer)
    return bufferToHexString(hashBuffer).toUpperCase()
  } else {
    const { createHash } = require('crypto')
    return createHash('sha1')
      .update(password)
      .digest('hex')
      .toUpperCase()
  }
}

const bufferToHexString = buffer =>
  Array
    .from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')

const queryHibp = hashPrefix => {
  if (Meteor.isClient) {
    return new Promise((resolve, reject) => {
      Meteor.call('users/hibp', { hashPrefix }, (err, res) => {
        if (err) {
          return reject(err)
        } else {
          return resolve(res)
        }
      })
    })
  } else {
    const { queryHibp } = require('../server/actions/hibp')
    return queryHibp(hashPrefix)
  }
}
