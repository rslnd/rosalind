import { upsert } from './upsert'
import { deduplicate } from './deduplicate'

export const actions = function ({ Patients }) {
  return {
    upsert: upsert({ Patients }),
    deduplicate: deduplicate({ Patients })
  }
}
