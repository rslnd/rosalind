import { Schedules } from 'api/schedules'
import { tally } from './tally'
import { upsert } from './upsert'
import { email } from './email'

export default function ({ Reports }) {
  return Object.assign({},
    { tally: tally({ Reports, Schedules }) },
    { upsert: upsert({ Reports }) },
    { email: email({ Reports }) }
  )
}
