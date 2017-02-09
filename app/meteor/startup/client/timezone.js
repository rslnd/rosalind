import moment from 'moment'
import 'moment-timezone'
import { process as server } from 'meteor/clinical:env'

export default () => {
  moment.tz.setDefault(server.env.TZ_CLIENT || 'Europe/Vienna')
}
