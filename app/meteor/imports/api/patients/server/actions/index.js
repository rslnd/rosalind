import { upsert } from './upsert'
import { deduplicate } from './deduplicate'
import { getLoyalty } from './getLoyalty'

export const actions = function ({ Patients }) {
  return {
    upsert: upsert({ Patients }),
    getLoyalty: getLoyalty({ Patients }),
    deduplicate: deduplicate({ Patients })
  }
}
