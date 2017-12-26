import { Meteor } from 'meteor/meteor'
import { Roles } from 'meteor/alanning:roles'
import { Calendars } from '../'

export const publication = () => {
  Meteor.publish('calendars', function () {
    if (this.userId && Roles.userIsInRole(this.userId, [ 'appointments', 'admin' ])) {
      return Calendars.find()
    }
  })
}
