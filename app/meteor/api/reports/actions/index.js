import { Schedules } from 'api/schedules'
import { Appointments } from 'api/appointments'
import { Tags } from 'api/tags'
import { renderEmail } from './renderEmail'
import { upsert } from './upsert'
import { tally } from './tally'
import { generate } from './generate'

export default function ({ Reports }) {
  return Object.assign({},
    { renderEmail: renderEmail({ Reports }) },
    { upsert: upsert({ Reports }) },
    { tally: tally({ Reports }) },
    { generate: generate({ Reports, Schedules, Appointments, Tags }) }
  )
}
