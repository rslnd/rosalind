import { insert } from './insert'
import { acquireLock } from './acquireLock'
import { releaseLock } from './releaseLock'
import { setAdmitted } from './setAdmitted'
import { setCanceled } from './setCanceled'
import { setNoShow } from './setNoShow'
import { softRemove } from './softRemove'
import { unsetAdmitted } from './unsetAdmitted'
import { unsetCanceled } from './unsetCanceled'
import { unsetEndTreatment } from './unsetEndTreatment'
import { unsetStartTreatment } from './unsetStartTreatment'
import { move } from './move'
import { update } from './update'
import { startTreatment } from './startTreatment'
import { endTreatment } from './endTreatment'
import { nextTreatment } from './nextTreatment'
import { changeAssignee } from './changeAssignee'
import { changeWaitlistAssignee } from './changeWaitlistAssignee'
import { setConsented } from './setConsented'
import { unsetConsented } from './unsetConsented'

export default function ({ Appointments }) {
  return {
    insert: insert({ Appointments }),
    acquireLock: acquireLock({ Appointments }),
    releaseLock: releaseLock({ Appointments }),
    setAdmitted: setAdmitted({ Appointments }),
    setCanceled: setCanceled({ Appointments }),
    setNoShow: setNoShow({ Appointments }),
    softRemove: softRemove({ Appointments }),
    unsetAdmitted: unsetAdmitted({ Appointments }),
    unsetCanceled: unsetCanceled({ Appointments }),
    move: move({ Appointments }),
    update: update({ Appointments }),
    startTreatment: startTreatment({ Appointments }),
    endTreatment: endTreatment({ Appointments }),
    unsetEndTreatment: unsetEndTreatment({ Appointments }),
    unsetStartTreatment: unsetStartTreatment({ Appointments }),
    nextTreatment: nextTreatment({ Appointments }),
    changeAssignee: changeAssignee({ Appointments }),
    changeWaitlistAssignee: changeWaitlistAssignee({ Appointments }),
    setConsented: setConsented({ Appointments }),
    unsetConsented: unsetConsented({ Appointments })
  }
}
