import { editNote } from './editNote'
import { findOne } from './findOne'
import { setMessagePreferences } from './setMessagePreferences'
import { toggleGender } from './toggleGender'
import { setBirthday } from './setBirthday'
import { setContacts } from './setContacts'
import { setAgreement } from './setAgreement'
import { setPortalVerified } from './setPortalVerified'
import { unsetPortalVerified } from './unsetPortalVerified'
import { upsert } from './upsert'
import { isExternalHashDifferent } from './isExternalHashDifferent'

export default function ({ Patients }) {
  return {
    editNote: editNote({ Patients }),
    findOne: findOne({ Patients }),
    setMessagePreferences: setMessagePreferences({ Patients }),
    toggleGender: toggleGender({ Patients }),
    setBirthday: setBirthday({ Patients }),
    setContacts: setContacts({ Patients }),
    setAgreement: setAgreement({ Patients }),
    setPortalVerified: setPortalVerified({ Patients }),
    unsetPortalVerified: unsetPortalVerified({ Patients }),
    upsert: upsert({ Patients }),
    isExternalHashDifferent: isExternalHashDifferent({ Patients })
  }
}
