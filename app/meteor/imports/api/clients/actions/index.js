import { register } from './register'
import { pairingStart } from './pairingStart'
import { pairingCancel } from './pairingCancel'
import { pairingFinish } from './pairingFinish'
import { setCurrentView } from './setCurrentView'
import { lifecycleActions } from '../../../util/meteor/action'

export const actions = ({ Clients }) => ({
  register: register({ Clients }),
  pairingStart: pairingStart({ Clients }),
  pairingCancel: pairingCancel({ Clients }),
  pairingFinish: pairingFinish({ Clients }),
  setCurrentView: setCurrentView({ Clients }),
  ...lifecycleActions({
    Collection: Clients,
    singular: 'client',
    plural: 'clients',
    roles: ['admin'],
    actions: ['update', 'softRemove']
  })
})
