import { insert } from './insert'
import { tally } from './tally'

export default function ({ Referrals }) {
  return {
    insert: insert({ Referrals }),
    tally: tally({ Referrals })
  }
}
