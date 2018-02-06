import { insert } from './insert'

export default function ({ Referrals }) {
  return {
    insert: insert({ Referrals })
  }
}
