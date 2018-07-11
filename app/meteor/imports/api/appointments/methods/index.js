import { getAllowedTags } from './getAllowedTags'
import getMaxDuration from './getMaxDuration'
import { getDefaultDuration } from './getDefaultDuration'

export default ({ Appointments }) => {
  return {
    getMaxDuration: getMaxDuration({ Appointments }),
    getAllowedTags,
    getDefaultDuration
  }
}
