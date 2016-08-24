import moment from 'moment'
import 'moment/locale/de-at'
import { TAPi18n } from 'meteor/tap:i18n'

export default () => {
  if (!window.testing) {
    const locale = 'de-AT'
    TAPi18n.setLanguage(locale)
    moment.locale(locale)
  }
}
