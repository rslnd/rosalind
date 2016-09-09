import moment from 'moment'
import { process as server } from 'meteor/clinical:env'
import 'moment/locale/de-at'

if (server.env.TEST) {
  moment.locale('en-US')
} else {
  moment.locale('de-AT')
}

export { moment }
