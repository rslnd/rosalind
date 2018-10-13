const { createHash } = require('crypto')

export const sha1 = s =>
  createHash('sha1')
    .update(s)
    .digest('hex')
    .toUpperCase()
