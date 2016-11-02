import { Users } from 'api/users'
import { postRequest } from './postRequest'
import { approveRequest } from './approveRequest'
import { declineRequest } from './declineRequest'
import { upsert } from './upsert'

export default ({ Schedules }) => {
  return {
    postRequest: postRequest({ Schedules, Users }),
    approveRequest: approveRequest({ Schedules, Users }),
    declineRequest: declineRequest({ Schedules, Users }),
    upsert: upsert({ Schedules, Users })
  }
}
