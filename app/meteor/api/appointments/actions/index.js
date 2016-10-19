import { insert } from './insert'
import { acquireLock } from './acquireLock'
import { releaseLock } from './releaseLock'
import { setAdmitted } from './setAdmitted'
import { setCanceled } from './setCanceled'
import { softRemove } from './softRemove'
import { search } from './search'
import { Patients } from 'api/patients'

export default function ({ Appointments }) {
  return {
    insert: insert({ Appointments }),
    acquireLock: acquireLock({ Appointments }),
    releaseLock: releaseLock({ Appointments }),
    setAdmitted: setAdmitted({ Appointments }),
    setCanceled: setCanceled({ Appointments }),
    softRemove: softRemove({ Appointments }),
    search: search({ Appointments, Patients })
  }
}
