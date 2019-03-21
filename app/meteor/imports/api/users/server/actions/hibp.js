import { get } from 'https'
import { action } from '../../../../util/meteor/action'

export const hibp = action({
  name: 'users/hibp',
  args: {
    hashPrefix: String
  },
  allowAnonymous: true,
  fn: ({ hashPrefix }) => {
    return queryHibp(hashPrefix)
  }
})

// Adapted from https://github.com/pthm/hibp-checker by Patt-tom McDonnell
export const queryHibp = hashPrefix => {

  return new Promise((resolve, reject) => {
    const options = {
      host: 'api.pwnedpasswords.com',
      headers: { 'user-agent': 'rslnd/rosalind' },
      path: `/range/${hashPrefix}`
    }

    get(options, res => {
      let response = ''

      res.on('data', (d) => {
        response += d
      })

      res.on('end', () => {
        const hibpResponse = response.split('\n')
          .reduce((acc, hashCountPair) => {
            const [hashSuffix, count] = hashCountPair.split(':')
            acc[hashPrefix + hashSuffix] = parseInt(count)
            return acc
          }, {})

        resolve(hibpResponse)
      })
    }).on('error', reject)
  })
}
