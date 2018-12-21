import { getClientKey } from '../../../util/meteor/getClientKey'
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
