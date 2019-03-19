import { Users } from '../../users'
import { addUserToDay } from './addUserToDay'
import { removeUserFromDay } from './removeUserFromDay'
import { softRemove } from './softRemove'
import { insert } from './insert'
import { setNote } from './setNote'
import { upsertDefaultSchedule } from './upsertDefaultSchedule'
import { applyDefaultSchedule } from './applyDefaultSchedule'

export default ({ Schedules }) => {
  return {
    addUserToDay: addUserToDay({ Schedules, Users }),
    removeUserFromDay: removeUserFromDay({ Schedules, Users }),
    softRemove: softRemove({ Schedules }),
    insert: insert({ Schedules, Users }),
    setNote: setNote({ Schedules }),
    upsertDefaultSchedule: upsertDefaultSchedule({ Schedules }),
    applyDefaultSchedule: applyDefaultSchedule({ Schedules })
  }
}
