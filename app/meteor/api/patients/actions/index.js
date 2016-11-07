import { upsert } from './upsert'
import { findOne } from './findOne'

export default function ({ Patients }) {
  return {
    upsert: upsert({ Patients }),
    findOne: findOne({ Patients })
  }
}
