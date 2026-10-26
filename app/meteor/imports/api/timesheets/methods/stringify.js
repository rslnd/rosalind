import moment from 'moment-timezone'
import { __ } from '../../../i18n'

export const stringify = ({ Timesheets }) => {
  return async ({ userId }) => {
    const selector = {
      userId,
      start: { $gt: moment().startOf('day').toDate() }
    }

    const firstTimesheet = (await Timesheets.find(selector, {
      sort: { start: 1 },
      limit: 1
    }).fetchAsync())[0]

    const lastTimesheet = (await Timesheets.find(selector, {
      sort: { start: -1 },
      limit: 1
    }).fetchAsync())[0]

    if (!firstTimesheet) { return null }

    const isTracking = await Timesheets.actions.isTracking.callPromise({ userId })

    const start = firstTimesheet.start
    const end = !isTracking && lastTimesheet.end

    return `${moment(start).format('H:mm')}-${end ? moment(end).format('H:mm') : __('timesheets.now')}`
  }
}
