import { upsert } from './upsert'

export default function ({ Patients }) {
  return {
    upsert: upsert({ Patients })
  }
}
