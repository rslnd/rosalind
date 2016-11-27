import { composeWithTracker } from 'meteor/nicocrm:react-komposer-tracker'
import { Schedules } from 'api/schedules'
import { dateToDay } from 'util/time/day'
import { HeaderRow } from './HeaderRow'

const composer = (props, onData) => {
  const day = dateToDay(props.date)

  const onAddUser = (userId) => {
    return Schedules.actions.addUserToDay.callPromise({ userId, day })
  }

  const onRemoveUser = (userId) => {
    return Schedules.actions.removeUserFromDay.callPromise({ userId, day })
  }

  onData(null, { ...props, onAddUser, onRemoveUser })
}

export const HeaderRowContainer = composeWithTracker(composer)(HeaderRow)
