import moment from 'moment'
import 'moment-timezone'

export default () => {
  moment.tz.setDefault('Europe/Vienna')
}
