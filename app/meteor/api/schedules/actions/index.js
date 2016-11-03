import { Users } from 'api/users'
import { addUserToDay } from './addUserToDay'
import { removeUserFromDay } from './removeUserFromDay'
import { postRequest } from './postRequest'
import { approveRequest } from './approveRequest'
import { declineRequest } from './declineRequest'
import { softRemove } from './softRemove'
import { upsert } from './upsert'

export default ({ Schedules }) => {
  return {
    addUserToDay: addUserToDay({ Schedules, Users }),
    removeUserFromDay: removeUserFromDay({ Schedules, Users }),
    postRequest: postRequest({ Schedules, Users }),
    approveRequest: approveRequest({ Schedules, Users }),
    declineRequest: declineRequest({ Schedules, Users }),
    softRemove: softRemove({ Schedules }),
    upsert: upsert({ Schedules, Users })
  }
}
