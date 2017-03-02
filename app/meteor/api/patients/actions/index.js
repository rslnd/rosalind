import { upsert } from './upsert'
import { findOne } from './findOne'
import { setMessagePreferences } from './setMessagePreferences'

export default function ({ Patients }) {
  return {
    upsert: upsert({ Patients }),
    findOne: findOne({ Patients }),
    setMessagePreferences: setMessagePreferences({ Patients })
  }
}
