import { register } from './register'
import { pairingStart } from './pairingStart'
import { pairingCancel } from './pairingCancel'
import { pairingFinish } from './pairingFinish'
import { setNextMedia } from './setNextMedia'
import { lifecycleActions } from '../../../util/meteor/action'

export const actions = ({ Clients }) => ({
  register: register({ Clients }),
  pairingStart: pairingStart({ Clients }),
  pairingCancel: pairingCancel({ Clients }),
  pairingFinish: pairingFinish({ Clients }),
  setNextMedia: setNextMedia({ Clients }),
  ...lifecycleActions({
    Collection: Clients,
    singular: 'client',
    plural: 'clients',
    roles: ['admin'],
    actions: ['update', 'softRemove']
  })
})
