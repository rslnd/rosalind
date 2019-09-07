import events from './events'
import update from './update'
import peripherals from './peripherals'
import legacyWarning from './legacyWarning'

export default () => {
  events()
  update()
  peripherals()
  legacyWarning()
}
