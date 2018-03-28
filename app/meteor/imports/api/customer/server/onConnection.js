import { Meteor } from 'meteor/meteor'
import { isTrustedNetwork } from './isTrustedNetwork'

export default () => {
  Meteor.onConnection(({ id, clientAddress }) => {
    const isTrusted = isTrustedNetwork(clientAddress)

    console.log('[Server] New connection', {
      id,
      isTrusted
    })
  })
}
