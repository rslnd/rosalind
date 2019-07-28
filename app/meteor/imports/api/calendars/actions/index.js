import { setNote } from './setNote'
import { lifecycleActions } from '../../../util/meteor/action'

export const actions = ({ Calendars }) => ({
  setNote: setNote({ Calendars }),
  ...lifecycleActions({
    Collection: Calendars,
    singular: 'calendar',
    plural: 'calendars',
    roles: ['admin']
  })
})
