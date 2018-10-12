import moment from 'moment-timezone'
import { Meteor } from 'meteor/meteor'

export default () => {
  moment.tz.setDefault(Meteor.settings.public.TZ_CLIENT || 'Europe/Vienna')
}
