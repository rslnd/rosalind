import { editNote } from './editNote'
import { findOne } from './findOne'
import { setMessagePreferences } from './setMessagePreferences'
import { toggleGender } from './toggleGender'
import { setBirthday } from './setBirthday'
import { setAgreement } from './setAgreement'
import { upsert } from './upsert'

export default function ({ Patients }) {
  return {
    editNote: editNote({ Patients }),
    findOne: findOne({ Patients }),
    setMessagePreferences: setMessagePreferences({ Patients }),
    toggleGender: toggleGender({ Patients }),
    setBirthday: setBirthday({ Patients }),
    setAgreement: setAgreement({ Patients }),
    upsert: upsert({ Patients })
  }
}
