import { upsert } from './upsert'
import { search } from './search'

export default function ({ Patients }) {
  return Object.assign({},
    {
      upsert: upsert({ Patients }),
      search: search({ Patients })
    }
  )
}
