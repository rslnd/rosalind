import { insert } from './insert'
import { acquireLock } from './acquireLock'
import { releaseLock } from './releaseLock'
import { setAdmitted } from './setAdmitted'
import { setCanceled } from './setCanceled'
import { softRemove } from './softRemove'

export default function ({ Appointments }) {
  return {
    insert: insert({ Appointments }),
    acquireLock: acquireLock({ Appointments }),
    releaseLock: releaseLock({ Appointments }),
    setAdmitted: setAdmitted({ Appointments }),
    setCanceled: setCanceled({ Appointments }),
    softRemove: softRemove({ Appointments })
  }
}
