import { Schedules } from '../../schedules'
import { Calendars } from '../../calendars'
import { Appointments } from '../../appointments'
import { Tags } from '../../tags'
import { Messages } from '../../messages'
import { upsert } from './upsert'
import { tally } from './tally'
import { generate } from './generate'
import { generatePreview } from './generatePreview'
import { generateQuarter } from './generateQuarter'

export default function ({ Reports }) {
  return Object.assign({},
    { upsert: upsert({ Reports }) },
    { tally: tally({ Reports }) },
    { generate: generate({ Calendars, Reports, Schedules, Appointments, Tags, Messages }) },
    { generatePreview: generatePreview({ Calendars, Reports, Schedules, Appointments, Tags, Messages }) },
    { generateQuarter: generateQuarter({ Calendars, Reports, Schedules }) }
  )
}
