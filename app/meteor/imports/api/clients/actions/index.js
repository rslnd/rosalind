import { register } from './register'
import { pairingStart } from './pairingStart'
import { pairingCancel } from './pairingCancel'
import { pairingFinish } from './pairingFinish'

export const actions = ({ Clients }) => ({
  register: register({ Clients }),
  pairingStart: pairingStart({ Clients }),
  pairingCancel: pairingCancel({ Clients }),
  pairingFinish: pairingFinish({ Clients })
})
