import { combineReducers } from 'redux'
import { search } from './search/reducers'
import { move } from './dayView/reducers'
import { newAppointment } from './new/reducers'

export default combineReducers({
  search,
  move
})

export const form = {
  newAppointment
}
