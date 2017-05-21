import { upsert } from './upsert'
import { findOne } from './findOne'
import { setMessagePreferences } from './setMessagePreferences'
import { toggleGender } from './toggleGender'

export default function ({ Patients }) {
  return {
    upsert: upsert({ Patients }),
    findOne: findOne({ Patients }),
    setMessagePreferences: setMessagePreferences({ Patients }),
    toggleGender: toggleGender({ Patients })
  }
}
