import moment from 'moment-timezone'
import 'moment/locale/de-at'

export default () => {
  if (!window.testing) {
    const locale = 'de-AT'
    moment.locale(locale)
  }
}
