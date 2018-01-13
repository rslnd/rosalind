import { Meteor } from 'meteor/meteor'
import { Roles } from 'meteor/alanning:roles'
import { isTrustedNetwork } from '../../customer/server/isTrustedNetwork'
import { Calendars } from '../'

export const publication = () => {
  Meteor.publish('calendars', function () {
    const isAuthenticated = this.userId && Roles.userIsInRole(this.userId, [ 'appointments', 'admin' ])
    const isTrusted = this.connection && isTrustedNetwork(this.connection.clientAddress)

    if (isAuthenticated || isTrusted) {

      // Feature Flag
      const ff = (Roles.userIsInRole(this.userId, [ 'ff-cosmetics' ]))

      return ff ? Calendars.find() : Calendars.find({ slug: 'kasse' })
    }
  })
}
