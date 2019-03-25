import { publish } from '../../../util/meteor/publish'
import { Calendars } from '../'

export const publication = () => {
  publish({
    name: 'calendars',
    roles: ['*'],
    fn: function () {
      return Calendars.find({})
    }
  })
}
