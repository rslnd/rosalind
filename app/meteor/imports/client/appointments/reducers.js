import { combineReducers } from 'redux'
import { search } from './search/reducers'
import { move } from './dayView/reducers'

export default combineReducers({
  search,
  move
})
