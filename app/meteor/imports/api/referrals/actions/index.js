import { insert } from './insert'
import { detail } from './detail'
import { tally } from './tally'

export default function ({ Referrals }) {
  return {
    insert: insert({ Referrals }),
    detail: detail({ Referrals }),
    tally: tally({ Referrals })
  }
}
