import { insert } from './insert'
import { acquireLock } from './acquireLock'
import { releaseLock } from './releaseLock'
import { setAdmitted } from './setAdmitted'
import { setCanceled } from './setCanceled'
import { softRemove } from './softRemove'
import { unsetAdmitted } from './unsetAdmitted'
import { unsetCanceled } from './unsetCanceled'
import { move } from './move'
import { update } from './update'
import { startTreatment } from './startTreatment'
import { endTreatment } from './endTreatment'
import { nextTreatment } from './nextTreatment'

export default function ({ Appointments }) {
  return {
    insert: insert({ Appointments }),
    acquireLock: acquireLock({ Appointments }),
    releaseLock: releaseLock({ Appointments }),
    setAdmitted: setAdmitted({ Appointments }),
    setCanceled: setCanceled({ Appointments }),
    softRemove: softRemove({ Appointments }),
    unsetAdmitted: unsetAdmitted({ Appointments }),
    unsetCanceled: unsetCanceled({ Appointments }),
    move: move({ Appointments }),
    update: update({ Appointments }),
    startTreatment: startTreatment({ Appointments }),
    endTreatment: endTreatment({ Appointments }),
    nextTreatment: nextTreatment({ Appointments })
  }
}
