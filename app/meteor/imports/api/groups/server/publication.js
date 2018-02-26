import { Meteor } from 'meteor/meteor'
import { isTrustedNetwork } from '../../customer/server/isTrustedNetwork'
import { Groups } from '../'

export const publication = () => {
  Meteor.publish('groups', function () {
    const isAuthenticated = this.userId
    const isTrusted = this.connection && isTrustedNetwork(this.connection.clientAddress)

    if (isAuthenticated || isTrusted) {
      return Groups.find({})
    }
  })
}
