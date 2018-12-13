import { Roles } from 'meteor/alanning:roles'
import { publish } from '../../../util/meteor/publish'
import { Calendars } from '../'

export const publication = () => {
  publish({
    name: 'calendars',
    roles: ['appointments-*'],
    preload: true,
    fn: function () {
      return Calendars.find({})
    }
  })
}
