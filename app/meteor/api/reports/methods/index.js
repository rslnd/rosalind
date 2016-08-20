import { renderEmail } from './renderEmail'
import { upsert } from './upsert'
import { tally } from './tally'

export default function ({ Reports }) {
  return Object.assign({},
    { renderEmail: renderEmail({ Reports }) },
    { upsert: upsert({ Reports }) },
    { tally: tally({ Reports }) }
  )
}
