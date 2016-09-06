import { upsert } from './upsert'

export default function ({ Patients }) {
  return Object.assign({},
    { upsert: upsert({ Patients }) }
  )
}
