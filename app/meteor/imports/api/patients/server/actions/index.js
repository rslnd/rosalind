import { upsert } from './upsert'

export const actions = function ({ Patients }) {
  return {
    upsert: upsert({ Patients })
  }
}
