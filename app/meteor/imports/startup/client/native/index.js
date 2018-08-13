import fakeInterface from './fakeInterface'
import events from './events'
import clientKey from './clientKey'
import update from './update'
import peripherals from './peripherals'

export default () => {
  fakeInterface()
  events()
  clientKey()
  update()
  peripherals()
}
