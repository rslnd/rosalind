import { insert } from './insert'
import { detail } from './detail'
import { tally } from './tally'

export default function ({ Referrals, Referrables }) {
  return {
    insert: insert({ Referrals, Referrables }),
    detail: detail({ Referrals }),
    tally: tally({ Referrals })
  }
}
