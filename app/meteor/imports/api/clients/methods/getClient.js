import { getClientKey } from '../../../startup/client/native/events'
import { subscribe } from '../../../util/meteor/subscribe'
import { Clients } from '../'

export const getClient = () => {
  const clientKey = getClientKey()
  if (!clientKey) {
    return null
  }

  subscribe('client', { clientKey })
  return Clients.findOne({ clientKey })
}
