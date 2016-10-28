import { upsert } from './upsert'
import { search } from './search'
import { Appointments } from 'api/appointments'

export default function ({ Patients }) {
  return Object.assign({},
    {
      upsert: upsert({ Patients }),
      search: search({ Patients, Appointments })
    }
  )
}
