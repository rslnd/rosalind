import { Roles } from 'meteor/alanning:roles'
import { publish } from '../../../util/meteor/publish'
import { Calendars } from '../'

export const publication = () => {
  publish({
    name: 'calendars',
    roles: ['appointments'],
    preload: true,
    fn: function () {
      const calendars = Calendars.find({}).fetch()

      const calendarIds = calendars.filter(c =>
        c.roles
        ? Roles.userIsInRole(this.userId, ['admin', ...c.roles])
        : true
      ).map(c => c._id)

      return Calendars.find({ _id: { $in: calendarIds } })
    }
  })
}
