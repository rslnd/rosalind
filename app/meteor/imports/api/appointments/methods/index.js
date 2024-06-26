import { getAllowedTags } from './getAllowedTags'
import getMaxDuration from './getMaxDuration'
import { getDefaultDuration } from './getDefaultDuration'
import getParallelAppointments from './getParallelAppointments'
import { getScheduleableTags } from './getScheduleableTags'

export default ({ Appointments }) => {
  return {
    getMaxDuration: getMaxDuration({ Appointments }),
    getParallelAppointments: getParallelAppointments({ Appointments }),
    getAllowedTags,
    getDefaultDuration,
    getScheduleableTags,
  }
}
