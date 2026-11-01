import { getClientKey } from '../../../startup/client/native/events'
import { subscribe } from '../../../util/meteor/subscribe'
import { Clients } from '../'

// Client only: synchronous (reactive minimongo) so it can be used directly in
// trackers and render.
export const getClient = () => {
  const clientKey = getClientKey()
  if (!clientKey) {
    return null
  }

  subscribe('client', { clientKey })
  return Clients.findOne({ clientKey })
}
