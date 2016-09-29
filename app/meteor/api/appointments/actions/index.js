import { insert } from './insert'
import { acquireLock } from './acquireLock'
import { releaseLock } from './releaseLock'

export default function ({ Appointments }) {
  return Object.assign({},
    {
      insert: insert({ Appointments }),
      acquireLock: acquireLock({ Appointments }),
      releaseLock: releaseLock({ Appointments })
    }
  )
}
